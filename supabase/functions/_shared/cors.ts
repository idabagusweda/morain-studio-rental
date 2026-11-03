// Shared CORS headers for Edge Functions
// Origin is restricted to the configured frontend URL.
// Set FRONTEND_BASE_URL in Supabase Edge Function secrets (e.g. https://morain-studio.vercel.app).
// Falls back to localhost for local development.
const allowedOrigin = Deno.env.get("FRONTEND_BASE_URL") || "http://localhost:8080";

export const corsHeaders = {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
};
