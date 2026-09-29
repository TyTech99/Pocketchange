import { fail, redirect } from '@sveltejs/kit';
import { createLoan } from '$lib/db';
import type { Actions } from './$types';

export const actions: Actions = {
  default: async ({ request }) => {
    const fd = await request.formData();
    const title = String(fd.get('title') || '').trim();
    const principal = String(fd.get('principal') || '').trim();
    const notes = String(fd.get('notes') || '').trim();
    const lenderName = String(fd.get('lender_name') || '').trim();
    const lenderPhone = String(fd.get('lender_phone') || '').trim();

    const borrowers: { name: string; phone: string }[] = [];
    for (let i = 0; i < 5; i++) {
      const name = String(fd.get(`borrower_name_${i}`) || '').trim();
      const phone = String(fd.get(`borrower_phone_${i}`) || '').trim();
      if (name || phone) borrowers.push({ name, phone });
    }

    if (!title) return fail(400, { error: 'Title is required' });
    if (!principal || Number.isNaN(parseFloat(principal)))
      return fail(400, { error: 'Valid principal amount required' });
    if (!lenderName || !lenderPhone)
      return fail(400, { error: 'Lender name and phone required' });
    if (borrowers.length === 0 || !borrowers[0].name || !borrowers[0].phone)
      return fail(400, { error: 'At least one borrower with name and phone required' });

    const loan = createLoan({
      title,
      principal,
      notes,
      lender: { name: lenderName, phone: lenderPhone },
      borrowers
    });

    throw redirect(303, `/loan/${loan.id}`);
  }
};
