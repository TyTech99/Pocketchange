<script lang="ts">
  let { data, form } = $props();

  const samples = [
    'You received $50.00 from Jane Doe',
    'Jane D sent you $25.00 with Zelle',
    'Venmo: You paid Bob $10.00',
    '$40.00 from PayPal',
    'Cash App: Alex sent you $15.50'
  ];
</script>

<h1>SMS simulator</h1>
<p class="lede">
  Paste a payment SMS the way a borrower would forward it. Hits the same path as the Twilio webhook
  (<code>POST /api/sms</code>).
</p>

{#if data.loans.length === 0}
  <p class="err">Create a loan first — <a href="/create">Create loan</a></p>
{:else}
  <form method="POST" class="form">
    <label>
      Loan
      <select name="loanId" required>
        <option value="">Select loan…</option>
        {#each data.loans as l}
          <option value={l.id} selected={l.id === (form?.loanId || data.preselectLoanId)}>
            {l.title} (${l.principal})
          </option>
        {/each}
      </select>
    </label>
    <label>
      From (optional phone)
      <input name="From" value={form?.From ?? '+15553334444'} placeholder="+15553334444" />
    </label>
    <label>
      Body (payment SMS)
      <textarea name="Body" rows="4" required placeholder="You received $50.00 from Jane Doe">{form?.Body ?? ''}</textarea>
    </label>
    <div class="samples">
      <span>Try:</span>
      {#each samples as s}
        <button type="button" class="chip" onclick={(e) => {
          const ta = (e.currentTarget as HTMLButtonElement).form?.querySelector('textarea[name=Body]') as HTMLTextAreaElement;
          if (ta) ta.value = s;
        }}>{s}</button>
      {/each}
    </div>
    <button type="submit" class="btn">Process as inbound SMS</button>
  </form>
{/if}

{#if form?.error}
  <div class="result bad">
    <strong>Failed:</strong> {form.error}
    {#if form.parse}
      <pre>{JSON.stringify(form.parse, null, 2)}</pre>
    {/if}
  </div>
{/if}

{#if form?.success}
  <div class="result good" id="sim-result">
    <h2>Payment recorded</h2>
    <p>
      <strong>${form.amount}</strong> on “{form.loanTitle}”.
      Balance remaining: <strong class="green">${form.remaining}</strong>
    </p>
    <p><a href="/loan/{form.loanId}">View loan detail →</a></p>
    <h3>Confirmations (would SMS all participants)</h3>
    <ul class="confs">
      {#each form.confirmations as c}
        <li>
          <div class="to">To {c.to_name} <code>{c.to_phone}</code></div>
          <div class="bubble">{c.body}</div>
        </li>
      {/each}
    </ul>
    <pre class="parse">parse: {JSON.stringify(form.parse, null, 2)}</pre>
  </div>
{/if}

<style>
  h1 { margin: 0 0 0.35rem; }
  .lede { color: #94a3b8; margin: 0 0 1.25rem; }
  .form { display: grid; gap: 1rem; }
  label { display: grid; gap: 0.35rem; font-size: 0.9rem; color: #cbd5e1; }
  input, textarea, select {
    background: #1a2330; border: 1px solid #334155; color: #f1f5f9;
    border-radius: 8px; padding: 0.55rem 0.7rem; font: inherit;
  }
  .samples { display: flex; flex-wrap: wrap; gap: 0.4rem; align-items: center; font-size: 0.85rem; color: #94a3b8; }
  .chip {
    background: #1e293b; border: 1px solid #334155; color: #e2e8f0; border-radius: 999px;
    padding: 0.25rem 0.6rem; font-size: 0.75rem; cursor: pointer;
  }
  .chip:hover { border-color: #38bdf8; }
  button.btn {
    justify-self: start; cursor: pointer; border: none;
    background: #0284c7; color: white; padding: 0.65rem 1.2rem;
    border-radius: 8px; font-weight: 600; font: inherit;
  }
  .err { background: #450a0a; color: #fecaca; padding: 0.75rem 1rem; border-radius: 8px; }
  .result { margin-top: 1.5rem; border-radius: 10px; padding: 1.1rem 1.25rem; }
  .good { background: #052e16; border: 1px solid #166534; }
  .bad { background: #450a0a; border: 1px solid #7f1d1d; }
  .green { color: #86efac; }
  .confs { list-style: none; padding: 0; display: grid; gap: 0.6rem; }
  .to { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.2rem; }
  .bubble { background: #1e293b; border-radius: 8px; padding: 0.65rem 0.8rem; }
  .parse { font-size: 0.8rem; color: #94a3b8; overflow: auto; }
</style>
