import { error } from '@sveltejs/kit';
import {
  getLoan,
  getParticipants,
  getPayments,
  getConfirmationsForLoan,
  paidTotalCents,
  balanceRemainingCents,
  centsToDollars
} from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const loan = getLoan(params.id);
  if (!loan) throw error(404, 'Loan not found');

  const participants = getParticipants(loan.id);
  const payments = getPayments(loan.id);
  const confirmations = getConfirmationsForLoan(loan.id);
  const paid = paidTotalCents(loan.id);
  const remaining = balanceRemainingCents(loan.id);

  return {
    loan: {
      ...loan,
      principal: centsToDollars(loan.principal_cents),
      paid: centsToDollars(paid),
      remaining: centsToDollars(remaining)
    },
    participants,
    payments: payments.map((p) => ({
      ...p,
      amount: centsToDollars(p.amount_cents)
    })),
    confirmations
  };
};
