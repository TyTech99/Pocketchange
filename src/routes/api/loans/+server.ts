import { json } from '@sveltejs/kit';
import { createLoan, listLoans, centsToDollars, balanceRemainingCents, getParticipants } from '$lib/db';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const loans = listLoans().map((l) => ({
    ...l,
    principal: centsToDollars(l.principal_cents),
    remaining: centsToDollars(balanceRemainingCents(l.id)),
    participants: getParticipants(l.id)
  }));
  return json({ loans });
};

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  try {
    const loan = createLoan({
      title: body.title,
      principal: body.principal,
      notes: body.notes,
      lender: body.lender,
      borrowers: body.borrowers || []
    });
    return json({ loan }, { status: 201 });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
};
