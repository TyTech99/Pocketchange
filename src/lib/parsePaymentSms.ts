/**
 * Forgiving parser for common PayPal / Zelle / Venmo / Cash App SMS shapes.
 * Extracts dollar amount and optional sender name hints.
 */

export type ParseResult = {
  amountCents: number | null;
  senderHint: string | null;
  provider: string | null;
  confidence: 'high' | 'medium' | 'low' | 'none';
};

const AMOUNT_RE = /\$\s*([0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{1,2})?|[0-9]+(?:\.[0-9]{1,2})?)/;

function parseAmount(body: string): number | null {
  const m = body.match(AMOUNT_RE);
  if (!m) return null;
  const n = parseFloat(m[1].replace(/,/g, ''));
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100);
}

function detectProvider(body: string): string | null {
  const lower = body.toLowerCase();
  if (lower.includes('paypal')) return 'PayPal';
  if (lower.includes('zelle')) return 'Zelle';
  if (lower.includes('venmo')) return 'Venmo';
  if (lower.includes('cash app') || lower.includes('cashapp') || lower.includes('$cashtag'))
    return 'Cash App';
  return null;
}

function extractSender(body: string): string | null {
  const patterns: RegExp[] = [
    // You received $50.00 from Jane Doe
    /received\s+\$[\d,.]+\s+from\s+([A-Za-z][A-Za-z .'-]{1,60}?)(?:\s+via|\s+with|\s*[.!]|$)/i,
    // Jane D sent you $25.00 with Zelle
    /^([A-Za-z][A-Za-z .'-]{1,40}?)\s+sent\s+you\s+\$/i,
    // Venmo: You paid Bob $10.00  / You paid Bob $10
    /you\s+paid\s+([A-Za-z][A-Za-z .'-]{1,40}?)\s+\$/i,
    // $40.00 from PayPal / from Jane via PayPal
    /\$[\d,.]+\s+from\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?:\s+via|\s+with|\s*[.!]|$)/i,
    // Cash App: Jane Doe sent you $20
    /:\s*([A-Za-z][A-Za-z .'-]{1,40}?)\s+sent\s+you/i,
    // Payment from Jane Doe for $30
    /(?:payment|transfer)\s+from\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?:\s+for|\s+of|\s*[.!:]|$)/i
  ];

  for (const re of patterns) {
    const m = body.match(re);
    if (m?.[1]) {
      const name = m[1].trim().replace(/\s+/g, ' ');
      // Filter obvious non-names (providers)
      if (/^(paypal|zelle|venmo|cash\s*app)$/i.test(name)) return null;
      return name;
    }
  }
  return null;
}

export function parsePaymentSms(body: string): ParseResult {
  const trimmed = (body || '').trim();
  if (!trimmed) {
    return { amountCents: null, senderHint: null, provider: null, confidence: 'none' };
  }

  const amountCents = parseAmount(trimmed);
  const senderHint = extractSender(trimmed);
  const provider = detectProvider(trimmed);

  let confidence: ParseResult['confidence'] = 'none';
  if (amountCents != null) {
    if (senderHint || provider) confidence = 'high';
    else confidence = 'medium';
  } else if (senderHint || provider) {
    confidence = 'low';
  }

  return { amountCents, senderHint, provider, confidence };
}
