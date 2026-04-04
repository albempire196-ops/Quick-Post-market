import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    const adminEmail = Deno.env.get("ADMIN_REPORT_EMAIL") || "albempire196@gmail.com";
    const senderEmail = Deno.env.get("REPORT_SENDER_EMAIL") || "onboarding@resend.dev";

    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is not set");
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("No authorization header");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: userData, error: userError } = await supabaseClient.auth.getUser(token);
    if (userError || !userData.user) throw new Error("User not authenticated");

    const user = userData.user;
    const { productId, reason, details } = await req.json();

    if (!productId || !reason) {
      throw new Error("productId and reason are required");
    }

    const [{ data: product, error: productError }, { data: reporterProfile }] = await Promise.all([
      supabaseClient
        .from("products_public")
        .select("id, title, user_id")
        .eq("id", productId)
        .single(),
      supabaseClient
        .from("profiles")
        .select("full_name, email")
        .eq("id", user.id)
        .maybeSingle(),
    ]);

    if (productError || !product) {
      throw new Error("Product not found");
    }

    const { data: sellerProfile } = await supabaseClient
      .from("profiles")
      .select("full_name, email")
      .eq("id", product.user_id)
      .maybeSingle();

    const appUrl = req.headers.get("origin") || "http://localhost:8080";
    const reporterName = reporterProfile?.full_name || user.user_metadata?.full_name || user.email || "Unknown user";
    const reporterEmail = reporterProfile?.email || user.email || "No email";
    const sellerName = sellerProfile?.full_name || "Unknown seller";
    const sellerEmail = sellerProfile?.email || "No seller email";

    const html = `
      <h2>New product report</h2>
      <p><strong>Product:</strong> ${product.title}</p>
      <p><strong>Product ID:</strong> ${product.id}</p>
      <p><strong>Seller ID:</strong> ${product.user_id}</p>
      <p><strong>Seller name:</strong> ${sellerName}</p>
      <p><strong>Seller email:</strong> ${sellerEmail}</p>
      <p><strong>Reported by:</strong> ${reporterName}</p>
      <p><strong>Reporter email:</strong> ${reporterEmail}</p>
      <p><strong>Reason:</strong> ${reason}</p>
      <p><strong>Details:</strong> ${details || "No extra details"}</p>
      <p><strong>Review path:</strong> Open Settings -> Admin Reports in your app.</p>
      <p><a href="${appUrl}">Open Quick Post Market</a></p>
    `;

    const resendResponse = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: senderEmail,
        to: [adminEmail],
        subject: `New report: ${product.title}`,
        html,
      }),
    });

    if (!resendResponse.ok) {
      const errorText = await resendResponse.text();
      throw new Error(`Resend error: ${errorText}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});