import { listLoans, centsToDollars } from '$lib/db';
import { processInboundSms } from '$lib/processInboundSms';
import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const loans = listLoans().map((l) => ({
    id: l.id,
    title: l.title,
    principal: centsToDollars(l.principal_cents)
  }));
  return {
    loans,
    preselectLoanId: url.searchParams.get('loan') || ''
  };
};

export const actions: Actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const Body = String(fd.get('Body') || '');
    const From = String(fd.get('From') || '').trim() || null;
    const loanId = String(fd.get('loanId') || '').trim() || null;

    const outcome = processInboundSms({ Body, From, loanId });
    if (!outcome.ok) {
      return fail(400, {
        error: outcome.error,
        parse: outcome.parse,
        Body,
        From,
        loanId
      });
    }

    return {
      success: true,
      Body,
      From,
      loanId: outcome.result.loan.id,
      parse: outcome.parse,
      amount: (outcome.result.payment.amount_cents / 100).toFixed(2),
      remaining: (outcome.result.balance_remaining_cents / 100).toFixed(2),
      confirmations: outcome.result.confirmations,
      loanTitle: outcome.result.loan.title
    };
  }
};
