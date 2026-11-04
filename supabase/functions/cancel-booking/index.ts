// deno-lint-ignore-file
// @ts-nocheck - This file runs in Deno runtime (Supabase Edge Functions)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

/**
 * Edge Function: cancel-booking
 * 
 * Allows authenticated users to cancel their own PENDING bookings.
 * Also cancels any active payment session.
 * 
 * Rules:
 * 1. Only bookings with payment_status === 'PENDING' can be cancelled
 * 2. Also cancel any PENDING payment record for this booking
 * 3. Cannot cancel after payment has been made (DP/LUNAS)
 */

interface RequestBody {
    booking_id: string;
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
            return new Response(
                JSON.stringify({ error: "Unauthorized", details: userError?.message }),
                { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Parse request body
        const body: RequestBody = await req.json();
        const { booking_id } = body;

        if (!booking_id) {
            return new Response(
                JSON.stringify({ error: "Missing booking_id" }),
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

        // Only allow cancellation of PENDING bookings
        if (booking.payment_status !== "PENDING") {
            return new Response(
                JSON.stringify({
                    error: "Cannot cancel booking",
                    details: `Booking status is ${booking.payment_status}. Only PENDING bookings can be cancelled.`
                }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ============================================================
        // CANCEL THE BOOKING
        // ============================================================

        const { error: updateError } = await supabaseAdmin
            .from("bookings")
            .update({
                payment_status: "CANCELLED",
                booking_status: "CANCELLED",
            })
            .eq("id", booking_id);

        if (updateError) {
            console.error("Error cancelling booking:", updateError);
            return new Response(
                JSON.stringify({ error: "Failed to cancel booking", details: updateError.message }),
                { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // ============================================================
        // ALSO CANCEL ANY PENDING PAYMENT RECORDS
        // ============================================================

        const { error: paymentUpdateError } = await supabaseAdmin
            .from("payments")
            .update({ payment_status: "CANCELLED" })
            .eq("booking_id", booking_id)
            .eq("payment_status", "PENDING");

        if (paymentUpdateError) {
            // Log but don't fail - booking is already cancelled
            console.error("Error cancelling payment:", paymentUpdateError);
        }

        console.log(`Booking ${booking_id} cancelled by user ${user.id}`);

        return new Response(
            JSON.stringify({
                success: true,
                booking_id: booking_id,
                message: "Booking cancelled successfully",
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
