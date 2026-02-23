// Supabase Edge Function: Send password reset email via Resend
// Deploy: supabase functions deploy send-password-reset-email
// API key: set in supabase/functions/.env (local) or Project Settings → Edge Functions → Secrets

import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// Build CORS headers - reflect request Origin to fix CORS errors from browser
function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS, GET',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Max-Age': '86400',
  };
}

const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'onboarding@resend.dev';

console.info('send-password-reset-email: server started');

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  // Handle CORS preflight - required when invoking from browser
  if (req.method === 'OPTIONS') {
    return new Response('ok', { status: 200, headers: corsHeaders });
  }

  const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' };

  try {
    const { email, resetUrl, userName } = await req.json();

    if (!email || !resetUrl) {
      return new Response(
        JSON.stringify({ error: 'Missing email or resetUrl' }),
        { status: 400, headers: jsonHeaders }
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not set');
      return new Response(
        JSON.stringify({ error: 'Email service not configured' }),
        { status: 500, headers: jsonHeaders }
      );
    }

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; background: #ffffff; padding: 32px 24px; text-align: center;">
        <h2 style="color: #1e40af; font-size: 1.25rem; font-weight: bold; margin: 0 0 24px 0;">KVB-PASS - Reset Kata Laluan</h2>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">Assalamualaikum ${userName || 'Pengguna'},</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 16px 0;">Anda telah meminta untuk menetapkan semula kata laluan anda.</p>
        <p style="color: #374151; font-size: 16px; line-height: 1.5; margin: 0 0 24px 0;">Sila klik pautan di bawah untuk tetapkan kata laluan baharu:</p>
        <p style="margin: 24px 0;">
          <a href="${resetUrl}" style="background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block; font-size: 16px; font-weight: 500;">
            Tetapkan Kata Laluan Baharu
          </a>
        </p>
        <p style="color: #6b7280; font-size: 14px; line-height: 1.5; margin: 24px 0 0 0;">
          Pautan ini akan tamat dalam 1 jam. Jika anda tidak meminta reset, sila abaikan e-mel ini.
        </p>
        <p style="color: #9ca3af; font-size: 12px; margin: 32px 0 0 0;">KVB-PASS - Sistem Permohonan Pulang Awal</p>
      </div>
    `;

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [email],
        subject: 'KVB-PASS - Reset Kata Laluan',
        html,
      }),
    });

    const resText = await res.text();
    let resData: unknown;
    try {
      resData = resText ? JSON.parse(resText) : {};
    } catch {
      resData = { raw: resText };
    }

    if (!res.ok) {
      const resendMessage = (resData as { message?: string })?.message || `HTTP ${res.status}`;
      return new Response(
        JSON.stringify({
          error: 'Failed to send email',
          message: resendMessage,
        }),
        { status: 500, headers: jsonHeaders }
      );
    }

    return new Response(
      JSON.stringify({ success: true, id: (resData as { id?: string })?.id }),
      { status: 200, headers: jsonHeaders }
    );
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('Error:', errMsg, error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: errMsg }),
      { status: 500, headers: jsonHeaders }
    );
  }
});
