<script lang="ts">
  let { data } = $props();
</script>

<p class="back"><a href="/demo/loans">← All loans</a></p>
<h1>{data.loan.title}</h1>

<div class="balance-card" id="balance">
  <div class="big">${data.loan.remaining}</div>
  <div class="sub">remaining of ${data.loan.principal} · paid ${data.loan.paid}</div>
</div>

{#if data.loan.notes}
  <p class="notes">{data.loan.notes}</p>
{/if}

<section>
  <h2>Participants</h2>
  <ul class="plist">
    {#each data.participants as p}
      <li>
        <span class="role">{p.role}</span>
        <strong>{p.name}</strong>
        <code>{p.phone}</code>
      </li>
    {/each}
  </ul>
</section>

<section>
  <h2>Payment ledger</h2>
  {#if data.payments.length === 0}
    <p class="muted">No payments yet. Forward a payment SMS via the <a href="/demo/sms?loan={data.loan.id}">SMS simulator</a>.</p>
  {:else}
    <table>
      <thead>
        <tr><th>When</th><th>Amount</th><th>Sender</th><th>Raw SMS</th></tr>
      </thead>
      <tbody>
        {#each data.payments as p}
          <tr>
            <td class="mono">{p.created_at}</td>
            <td class="amt">${p.amount}</td>
            <td>{p.parsed_sender || '—'}</td>
            <td class="raw">{p.raw_body}</td>
          </tr>
        {/each}
      </tbody>
    </table>
  {/if}
</section>

<section>
  <h2>Confirmation texts</h2>
  <p class="muted">In production these would be sent via Twilio. Demo shows the generated messages.</p>
  {#if data.confirmations.length === 0}
    <p class="muted">None yet.</p>
  {:else}
    <ul class="confs">
      {#each data.confirmations as c}
        <li>
          <div class="to">To {c.to_name} <code>{c.to_phone}</code></div>
          <div class="bubble">{c.body}</div>
        </li>
      {/each}
    </ul>
  {/if}
</section>

<p class="actions">
  <a class="btn" href="/demo/sms?loan={data.loan.id}">Simulate payment SMS</a>
</p>

<style>
  .back { margin: 0 0 0.5rem; }
  h1 { margin: 0 0 1rem; }
  h2 { font-size: 1.1rem; margin: 1.75rem 0 0.75rem; }
  .balance-card {
    background: linear-gradient(135deg, #0c4a6e, #14532d);
    border: 1px solid #166534; border-radius: 12px;
    padding: 1.25rem 1.5rem; margin-bottom: 1rem;
  }
  .big { font-size: 2.4rem; font-weight: 700; color: #86efac; letter-spacing: -0.02em; }
  .sub { color: #bbf7d0; opacity: 0.9; }
  .notes { color: #94a3b8; font-style: italic; }
  .plist { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.5rem; }
  .plist li {
    display: flex; flex-wrap: wrap; gap: 0.5rem 0.75rem; align-items: center;
    background: #1a2330; border-radius: 8px; padding: 0.65rem 0.85rem; border: 1px solid #2a3a4f;
  }
  .role {
    text-transform: uppercase; font-size: 0.7rem; font-weight: 700; letter-spacing: 0.04em;
    background: #334155; color: #e2e8f0; padding: 0.15rem 0.45rem; border-radius: 4px;
  }
  .muted { color: #94a3b8; }
  table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
  th, td { text-align: left; padding: 0.55rem 0.4rem; border-bottom: 1px solid #243041; vertical-align: top; }
  th { color: #94a3b8; font-weight: 600; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.03em; }
  .amt { color: #4ade80; font-weight: 600; white-space: nowrap; }
  .mono { font-family: ui-monospace, monospace; font-size: 0.8rem; color: #94a3b8; white-space: nowrap; }
  .raw { color: #cbd5e1; max-width: 280px; }
  .confs { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
  .to { font-size: 0.85rem; color: #94a3b8; margin-bottom: 0.25rem; }
  .bubble {
    background: #1e293b; border: 1px solid #334155; border-radius: 10px 10px 10px 2px;
    padding: 0.75rem 0.9rem; color: #e2e8f0; font-size: 0.92rem;
  }
  .actions { margin-top: 1.5rem; }
  .btn {
    display: inline-block; background: #0284c7; color: white !important;
    padding: 0.55rem 1rem; border-radius: 8px; font-weight: 600; text-decoration: none !important;
  }
</style>
