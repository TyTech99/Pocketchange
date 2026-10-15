import {
  findLoanForInbound,
  getLoan,
  recordPayment,
  type RecordPaymentResult
} from './db';
import { parsePaymentSms } from './parsePaymentSms';

export type InboundSmsInput = {
  From?: string | null;
  Body?: string | null;
  To?: string | null;
  loanId?: string | null;
};

export type InboundSmsResult =
  | { ok: true; parse: ReturnType<typeof parsePaymentSms>; result: RecordPaymentResult }
  | { ok: false; error: string; parse?: ReturnType<typeof parsePaymentSms> };

export function processInboundSms(input: InboundSmsInput): InboundSmsResult {
  const body = (input.Body || '').trim();
  if (!body) return { ok: false, error: 'Missing Body' };

  const parse = parsePaymentSms(body);
  if (parse.amountCents == null) {
    return { ok: false, error: 'Could not extract a dollar amount from the message', parse };
  }

  let loan = input.loanId ? getLoan(input.loanId) : undefined;
  if (!loan) loan = findLoanForInbound(input.From || null);
  if (!loan) return { ok: false, error: 'No loan found to apply payment to', parse };

  try {
    const result = recordPayment({
      loanId: loan.id,
      amountCents: parse.amountCents,
      rawBody: body,
      fromPhone: input.From || null,
      parsedSender: parse.senderHint,
      source: 'sms'
    });
    return { ok: true, parse, result };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e), parse };
  }
}
