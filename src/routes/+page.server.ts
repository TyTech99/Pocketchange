import { listLoans, paidTotalCents, balanceRemainingCents, getParticipants, centsToDollars } from '$lib/db';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
  const loans = listLoans().map((l) => ({
    ...l,
    principal: centsToDollars(l.principal_cents),
    paid: centsToDollars(paidTotalCents(l.id)),
    remaining: centsToDollars(balanceRemainingCents(l.id)),
    participants: getParticipants(l.id)
  }));
  return { loans };
};
