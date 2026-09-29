import Database from 'better-sqlite3';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';

const DB_PATH = join(process.cwd(), 'data', 'loans.db');

mkdirSync(dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    principal_cents INTEGER NOT NULL,
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS participants (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    phone TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('lender', 'borrower')),
    UNIQUE(loan_id, phone)
  );

  CREATE TABLE IF NOT EXISTS payments (
    id TEXT PRIMARY KEY,
    loan_id TEXT NOT NULL REFERENCES loans(id) ON DELETE CASCADE,
    amount_cents INTEGER NOT NULL,
    raw_body TEXT NOT NULL,
    from_phone TEXT,
    parsed_sender TEXT,
    source TEXT NOT NULL DEFAULT 'sms',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS confirmations (
    id TEXT PRIMARY KEY,
    payment_id TEXT NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    to_phone TEXT NOT NULL,
    to_name TEXT NOT NULL,
    body TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

export type Loan = {
  id: string;
  title: string;
  principal_cents: number;
  notes: string | null;
  created_at: string;
};

export type Participant = {
  id: string;
  loan_id: string;
  name: string;
  phone: string;
  role: 'lender' | 'borrower';
};

export type Payment = {
  id: string;
  loan_id: string;
  amount_cents: number;
  raw_body: string;
  from_phone: string | null;
  parsed_sender: string | null;
  source: string;
  created_at: string;
};

export type Confirmation = {
  id: string;
  payment_id: string;
  to_phone: string;
  to_name: string;
  body: string;
  created_at: string;
};

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function dollarsToCents(amount: number | string): number {
  const n = typeof amount === 'string' ? parseFloat(amount) : amount;
  return Math.round(n * 100);
}

export function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith('1')) return `+${digits}`;
  if (phone.startsWith('+')) return `+${digits}`;
  return digits ? `+${digits}` : phone.trim();
}

function uid(): string {
  return crypto.randomUUID();
}

export function listLoans(): Loan[] {
  return db.prepare('SELECT * FROM loans ORDER BY created_at DESC').all() as Loan[];
}

export function getLoan(id: string): Loan | undefined {
  return db.prepare('SELECT * FROM loans WHERE id = ?').get(id) as Loan | undefined;
}

export function getParticipants(loanId: string): Participant[] {
  return db
    .prepare('SELECT * FROM participants WHERE loan_id = ? ORDER BY role DESC, name')
    .all(loanId) as Participant[];
}

export function getPayments(loanId: string): Payment[] {
  return db
    .prepare('SELECT * FROM payments WHERE loan_id = ? ORDER BY created_at DESC')
    .all(loanId) as Payment[];
}

export function getConfirmationsForPayment(paymentId: string): Confirmation[] {
  return db
    .prepare('SELECT * FROM confirmations WHERE payment_id = ? ORDER BY created_at')
    .all(paymentId) as Confirmation[];
}

export function getConfirmationsForLoan(loanId: string): Confirmation[] {
  return db
    .prepare(
      `SELECT c.* FROM confirmations c
       JOIN payments p ON p.id = c.payment_id
       WHERE p.loan_id = ?
       ORDER BY c.created_at DESC`
    )
    .all(loanId) as Confirmation[];
}

export function paidTotalCents(loanId: string): number {
  const row = db
    .prepare('SELECT COALESCE(SUM(amount_cents), 0) AS total FROM payments WHERE loan_id = ?')
    .get(loanId) as { total: number };
  return row.total;
}

export function balanceRemainingCents(loanId: string): number {
  const loan = getLoan(loanId);
  if (!loan) return 0;
  return Math.max(0, loan.principal_cents - paidTotalCents(loanId));
}

export type CreateLoanInput = {
  title: string;
  principal: number | string;
  notes?: string;
  lender: { name: string; phone: string };
  borrowers: { name: string; phone: string }[];
};

export function createLoan(input: CreateLoanInput): Loan {
  const id = uid();
  const principal_cents = dollarsToCents(input.principal);
  const insertLoan = db.prepare(
    `INSERT INTO loans (id, title, principal_cents, notes) VALUES (?, ?, ?, ?)`
  );
  const insertParticipant = db.prepare(
    `INSERT INTO participants (id, loan_id, name, phone, role) VALUES (?, ?, ?, ?, ?)`
  );

  const tx = db.transaction(() => {
    insertLoan.run(id, input.title.trim(), principal_cents, input.notes?.trim() || null);
    insertParticipant.run(
      uid(),
      id,
      input.lender.name.trim(),
      normalizePhone(input.lender.phone),
      'lender'
    );
    for (const b of input.borrowers) {
      if (!b.name.trim() || !b.phone.trim()) continue;
      insertParticipant.run(uid(), id, b.name.trim(), normalizePhone(b.phone), 'borrower');
    }
  });
  tx();
  return getLoan(id)!;
}

export type RecordPaymentResult = {
  payment: Payment;
  confirmations: Confirmation[];
  loan: Loan;
  balance_remaining_cents: number;
  paid_total_cents: number;
};

export function findLoanForInbound(fromPhone: string | null | undefined): Loan | undefined {
  // Prefer matching by From phone against participants; else most recent loan
  if (fromPhone) {
    const normalized = normalizePhone(fromPhone);
    const row = db
      .prepare(
        `SELECT l.* FROM loans l
         JOIN participants p ON p.loan_id = l.id
         WHERE p.phone = ? OR p.phone = ? OR REPLACE(p.phone, '+', '') = ?
         ORDER BY l.created_at DESC LIMIT 1`
      )
      .get(normalized, fromPhone, normalized.replace('+', '')) as Loan | undefined;
    if (row) return row;
  }
  return db.prepare('SELECT * FROM loans ORDER BY created_at DESC LIMIT 1').get() as
    | Loan
    | undefined;
}

export function recordPayment(opts: {
  loanId: string;
  amountCents: number;
  rawBody: string;
  fromPhone?: string | null;
  parsedSender?: string | null;
  source?: string;
}): RecordPaymentResult {
  const loan = getLoan(opts.loanId);
  if (!loan) throw new Error('Loan not found');
  if (opts.amountCents <= 0) throw new Error('Amount must be positive');

  const paymentId = uid();
  const participants = getParticipants(opts.loanId);

  const insertPayment = db.prepare(
    `INSERT INTO payments (id, loan_id, amount_cents, raw_body, from_phone, parsed_sender, source)
     VALUES (?, ?, ?, ?, ?, ?, ?)`
  );
  const insertConf = db.prepare(
    `INSERT INTO confirmations (id, payment_id, to_phone, to_name, body) VALUES (?, ?, ?, ?, ?)`
  );

  const confirmations: Confirmation[] = [];

  const tx = db.transaction(() => {
    insertPayment.run(
      paymentId,
      opts.loanId,
      opts.amountCents,
      opts.rawBody,
      opts.fromPhone ? normalizePhone(opts.fromPhone) : null,
      opts.parsedSender || null,
      opts.source || 'sms'
    );

    // After insert, compute new balance
    const paid = paidTotalCents(opts.loanId);
    const remaining = Math.max(0, loan.principal_cents - paid);
    const amountStr = centsToDollars(opts.amountCents);
    const remainingStr = centsToDollars(remaining);
    const principalStr = centsToDollars(loan.principal_cents);
    const senderHint = opts.parsedSender ? ` (from ${opts.parsedSender})` : '';

    for (const p of participants) {
      const body =
        `Personal Loan Tracker: Payment of $${amountStr}${senderHint} recorded on "${loan.title}". ` +
        `Balance remaining: $${remainingStr} of $${principalStr}.`;
      const confId = uid();
      insertConf.run(confId, paymentId, p.phone, p.name, body);
      confirmations.push({
        id: confId,
        payment_id: paymentId,
        to_phone: p.phone,
        to_name: p.name,
        body,
        created_at: new Date().toISOString()
      });
    }
  });
  tx();

  const payment = db.prepare('SELECT * FROM payments WHERE id = ?').get(paymentId) as Payment;
  return {
    payment,
    confirmations: getConfirmationsForPayment(paymentId),
    loan,
    balance_remaining_cents: balanceRemainingCents(opts.loanId),
    paid_total_cents: paidTotalCents(opts.loanId)
  };
}

export { db, DB_PATH };
