// deno-lint-ignore-file
// @ts-nocheck - This file runs in Deno runtime (Supabase Edge Functions)

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { crypto } from "https://deno.land/std@0.177.0/crypto/mod.ts";
import { encodeHex } from "https://deno.land/std@0.177.0/encoding/hex.ts";

/**
 * Edge Function: midtrans-webhook
 * 
 * Handles webhook notifications from Midtrans.
 * Updates BOTH payments table AND bookings table based on transaction result.
 * 
 * Flow:
 * 1. Verify signature
 * 2. Find payment by midtrans_order_id
 * 3. Update payment status
 * 4. Update booking paid_amount, remaining_amount, payment_status
 */

Deno.serve(async (req: Request) => {
    // Only accept POST requests
    if (req.method !== "POST") {
        return new Response("Method not allowed", { status: 405 });
    }

    try {
        // Get environment variables
        const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
        const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
        const midtransServerKey = Deno.env.get("MIDTRANS_SERVER_KEY")!;

        // Parse webhook payload
        const payload = await req.json();

        const {
            order_id,
            transaction_status,
            fraud_status,
            payment_type,
            gross_amount,
            signature_key,
            status_code,
            transaction_time,
        } = payload;

        console.log(`Webhook received: order_id=${order_id}, status=${transaction_status}`);

        // Verify signature
        // Signature = SHA512(order_id + status_code + gross_amount + server_key)
        const signatureInput = `${order_id}${status_code}${gross_amount}${midtransServerKey}`;
        const encoder = new TextEncoder();
        const data = encoder.encode(signatureInput);
        const hashBuffer = await crypto.subtle.digest("SHA-512", data);
        const expectedSignature = encodeHex(new Uint8Array(hashBuffer));

        if (signature_key !== expectedSignature) {
            console.error("Invalid signature");
            return new Response(
                JSON.stringify({ error: "Invalid signature" }),
                { status: 401, headers: { "Content-Type": "application/json" } }
            );
        }

        // Create admin client for database operations
        const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

        // ============================================================
        // FIND PAYMENT BY midtrans_order_id (NEW: Use payments table)
        // ============================================================

        const { data: payment, error: paymentError } = await supabaseAdmin
            .from("payments")
            .select("*, bookings(*)")
            .eq("midtrans_order_id", order_id)
            .single();

        if (paymentError || !payment) {
            console.error("Payment not found for order_id:", order_id);
            return new Response(
                JSON.stringify({ error: "Payment not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        const booking = payment.bookings;
        if (!booking) {
            console.error("Booking not found for payment:", payment.id);
            return new Response(
                JSON.stringify({ error: "Booking not found" }),
                { status: 404, headers: { "Content-Type": "application/json" } }
            );
        }

        // ============================================================
        // UPDATE PAYMENT STATUS
        // ============================================================

        let paymentUpdate: Record<string, unknown> = {
            raw_webhook_data: payload,
        };

        let bookingUpdate: Record<string, unknown> = {};

        const paidAmount = parseInt(gross_amount);
        const currentPaidAmount = booking.paid_amount || 0;
        const totalAmount = booking.total_amount;

        // Handle different transaction statuses
        if (transaction_status === "capture" || transaction_status === "settlement") {
            // Successful payment
            if (fraud_status === "accept" || !fraud_status) {
                const newPaidAmount = currentPaidAmount + paidAmount;
                const newRemainingAmount = Math.max(0, totalAmount - newPaidAmount);

                // Determine new booking payment status
                let newPaymentStatus: string;
                if (newPaidAmount >= totalAmount) {
                    newPaymentStatus = "LUNAS";
                } else if (newPaidAmount > 0) {
                    newPaymentStatus = "DP";
                } else {
                    newPaymentStatus = "PENDING";
                }

                // Update payment to SETTLED
                paymentUpdate = {
                    ...paymentUpdate,
                    payment_status: "SETTLED",
                    settled_at: new Date().toISOString(),
                };

                // Update booking
                bookingUpdate = {
                    paid_amount: newPaidAmount,
                    remaining_amount: newRemainingAmount,
                    payment_status: newPaymentStatus,
                    booking_status: "ACTIVE",
                };

                console.log(`Payment successful: paid=${newPaidAmount}, remaining=${newRemainingAmount}, status=${newPaymentStatus}`);
            }
        } else if (transaction_status === "pending") {
            // Payment is pending - no change
            console.log(`Payment pending for order ${order_id}`);
        } else if (transaction_status === "deny") {
            // Payment denied
            if (payment.payment_status === "PENDING") {
                paymentUpdate = {
                    ...paymentUpdate,
                    payment_status: "EXPIRED", // Treat deny as failed/expired
                };

                // Only update booking if it's still PENDING
                if (booking.payment_status === "PENDING") {
                    bookingUpdate = {
                        payment_status: "EXPIRED",
                        booking_status: "CANCELLED",
                    };
                }
            }
        } else if (transaction_status === "cancel") {
            // Payment cancelled by user
            if (payment.payment_status === "PENDING") {
                paymentUpdate = {
                    ...paymentUpdate,
                    payment_status: "CANCELLED",
                };

                if (booking.payment_status === "PENDING") {
                    bookingUpdate = {
                        payment_status: "CANCELLED",
                        booking_status: "CANCELLED",
                    };
                }
            }
        } else if (transaction_status === "expire") {
            // Payment expired in Midtrans
            if (payment.payment_status === "PENDING") {
                paymentUpdate = {
                    ...paymentUpdate,
                    payment_status: "EXPIRED",
                };

                if (booking.payment_status === "PENDING") {
                    bookingUpdate = {
                        payment_status: "EXPIRED",
                        booking_status: "CANCELLED",
                    };
                }
            }
        }

        // ============================================================
        // APPLY UPDATES
        // ============================================================

        // Update payment record
        const { error: updatePaymentError } = await supabaseAdmin
            .from("payments")
            .update(paymentUpdate)
            .eq("id", payment.id);

        if (updatePaymentError) {
            console.error("Error updating payment:", updatePaymentError);
        } else {
            console.log(`Payment ${payment.id} updated:`, paymentUpdate);
        }

        // Update booking if there are changes
        if (Object.keys(bookingUpdate).length > 0) {
            const { error: updateBookingError } = await supabaseAdmin
                .from("bookings")
                .update(bookingUpdate)
                .eq("id", booking.id);

            if (updateBookingError) {
                console.error("Error updating booking:", updateBookingError);
                return new Response(
                    JSON.stringify({ error: "Failed to update booking" }),
                    { status: 500, headers: { "Content-Type": "application/json" } }
                );
            }

            console.log(`Booking ${booking.id} updated:`, bookingUpdate);
        }

        // Return success
        return new Response(
            JSON.stringify({ success: true, order_id, status: transaction_status }),
            { status: 200, headers: { "Content-Type": "application/json" } }
        );

    } catch (error) {
        console.error("Webhook error:", error);
        return new Response(
            JSON.stringify({ error: "Internal server error" }),
            { status: 500, headers: { "Content-Type": "application/json" } }
        );
    }
});
