import { json, text } from '@sveltejs/kit';
import { processInboundSms } from '$lib/processInboundSms';
import type { RequestHandler } from './$types';

/**
 * Twilio-ready inbound SMS webhook.
 * Accepts application/x-www-form-urlencoded (Twilio default) or JSON.
 * Returns TwiML ack when Twilio-style form; JSON otherwise / when ?format=json.
 */
export const POST: RequestHandler = async ({ request, url }) => {
  const ct = request.headers.get('content-type') || '';
  let From: string | null = null;
  let Body: string | null = null;
  let To: string | null = null;
  let loanId: string | null = url.searchParams.get('loanId');

  if (ct.includes('application/json')) {
    const body = await request.json();
    From = body.From ?? body.from ?? null;
    Body = body.Body ?? body.body ?? null;
    To = body.To ?? body.to ?? null;
    loanId = body.loanId ?? loanId;
  } else {
    const fd = await request.formData();
    From = fd.get('From')?.toString() ?? null;
    Body = fd.get('Body')?.toString() ?? null;
    To = fd.get('To')?.toString() ?? null;
    loanId = fd.get('loanId')?.toString() ?? loanId;
  }

  const outcome = processInboundSms({ From, Body, To, loanId });
  const wantJson =
    url.searchParams.get('format') === 'json' || ct.includes('application/json');

  if (!outcome.ok) {
    if (wantJson) return json({ ok: false, error: outcome.error, parse: outcome.parse }, { status: 400 });
    // Twilio-friendly empty TwiML (don't SMS error loops in prototype)
    return text(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' }
    });
  }

  if (wantJson) {
    return json({
      ok: true,
      loanId: outcome.result.loan.id,
      paymentId: outcome.result.payment.id,
      amount_cents: outcome.result.payment.amount_cents,
      balance_remaining_cents: outcome.result.balance_remaining_cents,
      confirmations: outcome.result.confirmations.map((c) => ({
        to: c.to_phone,
        name: c.to_name,
        body: c.body
      })),
      parse: outcome.parse
      // Note: real Twilio SMS send would use TWILIO_* env here — stubbed for demo
    });
  }

  return text(`<?xml version="1.0" encoding="UTF-8"?><Response></Response>`, {
    headers: { 'Content-Type': 'text/xml' }
  });
};
