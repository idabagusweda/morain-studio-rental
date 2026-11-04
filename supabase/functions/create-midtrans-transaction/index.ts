// deno-lint-ignore-file
// @ts-nocheck - This file runs in Deno runtime (Supabase Edge Functions)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Edge Function: create-midtrans-transaction
 * 
 * Creates or resumes a Midtrans Snap payment session.
 * 
 * Rules:
 * 1. 1 booking = 1 active PENDING payment at a time
 * 2. If active payment exists and NOT expired → return existing redirect_url
 * 3. If active payment exists and expired → mark as EXPIRED, reject request
 * 4. If no active payment → create new payment with 15-minute expiry
 * 5. expires_at is NEVER reset once set
 */

interface RequestBody {
    booking_id: string;
    payment_type: "FULL" | "DP" | "REMAINING";
}

Deno.serve(async (req: Request) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Get environment variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const midtransServerKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;
        const isProduction = Deno.env.get("MIDTRANS_IS_PRODUCTION") === "true";
        const frontendBaseUrl = Deno.env.get("FRONTEND_BASE_URL") || "http://localhost:8080";

        // Midtrans API URL
        const midtransApiUrl = isProduction
            ? "https://app.midtrans.com/snap/v1/transactions"
            : "https://app.sandbox.midtrans.com/snap/v1/transactions";

        // Get authorization header
        const authHeader = req.headers.get("Authorization");
        if (!authHeader) {
            return new Response(
                JSON.stringify({ error: "Missing authorization header" }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Extract the token
        const token = authHeader.replace("Bearer ", "");

        // Create admin client
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // Verify the user's JWT token
        const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
        if (userError || !user) {
            console.error("Auth error:", userError);
            return new Response(
                JSON.stringify({ error: "Unauthorized", details: userError?.message }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse request body
        const body: RequestBody = await req.json();
        const { booking_id, payment_type } = body;

        if (!booking_id || !payment_type) {
            return new Response(
                JSON.stringify({ error: "Missing booking_id or payment_type" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate payment_type
        if (!["FULL", "DP", "REMAINING"].includes(payment_type)) {
            return new Response(
                JSON.stringify({ error: "Invalid payment_type. Must be FULL, DP, or REMAINING" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Fetch booking and verify ownership
        const { data: booking, error: bookingError } = await supabaseAdmin
            .from("bookings")
            .select("*")
            .eq("id", booking_id)
            .single();

        if (bookingError || !booking) {
            return new Response(
                JSON.stringify({ error: "Booking not found" }),
                { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Verify user owns this booking
        if (booking.user_id !== user.id) {
            return new Response(
                JSON.stringify({ error: "You do not own this booking" }),
                { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Block invalid booking statuses
        const blockedStatuses = ["CANCELLED", "LUNAS"];
        if (blockedStatuses.includes(booking.payment_status)) {
            return new Response(
                JSON.stringify({
                    error: "Cannot process payment",
                    details: `Booking status is ${booking.payment_status}`
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Validate payment_type against booking status
        if (payment_type === "REMAINING" && booking.payment_status !== "DP") {
            return new Response(
                JSON.stringify({
                    error: "Invalid payment_type",
                    details: "REMAINING payment is only valid for DP status bookings"
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        if (payment_type === "DP" && booking.payment_status === "DP") {
            return new Response(
                JSON.stringify({
                    error: "Invalid payment_type",
                    details: "DP has already been paid. Use REMAINING to complete payment."
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ============================================================
        // CHECK FOR EXISTING PENDING PAYMENT (1 booking = 1 active payment)
        // ============================================================

        const { data: existingPayment, error: paymentError } = await supabaseAdmin
            .from("payments")
            .select("*")
            .eq("booking_id", booking_id)
            .eq("payment_status", "PENDING")
            .single();

        if (existingPayment) {
            const now = new Date();
            const expiresAt = new Date(existingPayment.expires_at);

            // ON-DEMAND EXPIRY CHECK
            if (now > expiresAt) {
                // Payment has expired - update both payment and booking
                await supabaseAdmin
                    .from("payments")
                    .update({ payment_status: "EXPIRED" })
                    .eq("id", existingPayment.id);

                await supabaseAdmin
                    .from("bookings")
                    .update({
                        payment_status: "EXPIRED",
                        booking_status: "CANCELLED"
                    })
                    .eq("id", booking_id);

                console.log(`Payment ${existingPayment.id} expired on-demand`);

                return new Response(
                    JSON.stringify({
                        error: "Payment session expired",
                        details: "Waktu pembayaran habis (15 menit). Silakan buat booking baru."
                    }),
                    { status: 410, headers: { ...corsHeaders, "Content-Type": "application/json" } }
                );
            }

            // Payment still valid - return existing redirect_url (RESUME PAYMENT)
            console.log(`Resuming existing payment ${existingPayment.id} for booking ${booking_id}`);

            return new Response(
                JSON.stringify({
                    success: true,
                    redirect_url: existingPayment.redirect_url,
                    snap_token: existingPayment.snap_token,
                    order_id: existingPayment.midtrans_order_id,
                    amount: existingPayment.amount,
                    payment_type: existingPayment.payment_type,
                    expires_at: existingPayment.expires_at,
                    resumed: true,
                }),
                { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ============================================================
        // NO ACTIVE PAYMENT - CREATE NEW ONE
        // ============================================================

        // Calculate amount based on payment type
        const totalAmount = booking.total_amount;
        const paidAmount = booking.paid_amount || 0;
        let amount: number;

        switch (payment_type) {
            case "FULL":
                amount = totalAmount - paidAmount;
                break;
            case "DP":
                amount = Math.round(totalAmount * 0.5);
                break;
            case "REMAINING":
                amount = totalAmount - paidAmount;
                break;
            default:
                amount = totalAmount;
        }

        // Ensure amount is at least 1 rupiah
        if (amount <= 0) {
            return new Response(
                JSON.stringify({ error: "Invalid amount", details: "Payment amount must be greater than 0" }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Generate unique order_id: booking_code-payment_type-timestamp
        const timestamp = Date.now();
        const orderId = `${booking.booking_code}-${payment_type}-${timestamp}`;

        // Calculate expires_at (15 minutes from now)
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

        // Prepare item name based on payment type
        let itemName = `${booking.service_type === "studio" ? "Studio" : "Photobox"} - ${booking.package_name || booking.style_name || "Booking"}`;
        if (payment_type === "DP") {
            itemName += " (DP 50%)";
        } else if (payment_type === "REMAINING") {
            itemName += " (Pelunasan)";
        }

        // Prepare Midtrans Snap request
        const snapRequest = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
            },
            customer_details: {
                first_name: booking.client_name,
                email: booking.client_email || undefined,
                phone: booking.client_whatsapp || undefined,
            },
            item_details: [
                {
                    id: `${booking.service_type}-${payment_type}`,
                    price: amount,
                    quantity: 1,
                    name: itemName,
                },
            ],
            callbacks: {
                finish: `${frontendBaseUrl}/payment-return?order_id=${orderId}&status=finish`,
                error: `${frontendBaseUrl}/payment-return?order_id=${orderId}&status=error`,
                pending: `${frontendBaseUrl}/payment-return?order_id=${orderId}&status=pending`,
            },
            // Set expiry to 15 minutes
            expiry: {
                unit: "minutes",
                duration: 15,
            },
        };

        // Call Midtrans Snap API
        const authString = btoa(`${midtransServerKey}:`);
        const midtransResponse = await fetch(midtransApiUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Basic ${authString}`,
            },
            body: JSON.stringify(snapRequest),
        });

        if (!midtransResponse.ok) {
            const errorText = await midtransResponse.text();
            console.error("Midtrans error:", errorText);
            return new Response(
                JSON.stringify({ error: "Failed to create Midtrans transaction", details: errorText }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        const midtransData = await midtransResponse.json();

        // ============================================================
        // INSERT NEW PAYMENT RECORD
        // ============================================================

        const { data: newPayment, error: insertError } = await supabaseAdmin
            .from("payments")
            .insert({
                booking_id: booking_id,
                payment_status: "PENDING",
                midtrans_order_id: orderId,
                snap_token: midtransData.token,
                redirect_url: midtransData.redirect_url,
                amount: amount,
                payment_type: payment_type,
                expires_at: expiresAt,
            })
            .select()
            .single();

        if (insertError) {
            console.error("Error inserting payment:", insertError);
            return new Response(
                JSON.stringify({ error: "Failed to create payment record", details: insertError.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        console.log(`Created new payment ${newPayment.id} for booking ${booking_id}, expires at ${expiresAt}`);

        // Return success response
        return new Response(
            JSON.stringify({
                success: true,
                redirect_url: midtransData.redirect_url,
                snap_token: midtransData.token,
                order_id: orderId,
                amount: amount,
                payment_type: payment_type,
                expires_at: expiresAt,
                resumed: false,
            }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Unexpected error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
