<script lang="ts">
  let { data } = $props();
</script>

<h1>Loans</h1>
<p class="lede">Friends/family IOUs — forward payment SMS, track balance left.</p>

<div class="agent-promo">
  <div>
    <strong>OAuth agent demo</strong>
    <span>$200 vet bill · Household tab · via-agent audit · human-in-loop prefs</span>
  </div>
  <a class="btn" href="/demo/oauth-agent">Open walkthrough</a>
</div>

{#if data.loans.length === 0}
  <div class="empty">
    <p>No loans yet.</p>
    <a class="btn" href="/demo/create">Create your first loan</a>
  </div>
{:else}
  <ul class="list">
    {#each data.loans as loan}
      <li>
        <a href="/demo/loan/{loan.id}" class="card">
          <div class="row">
            <strong>{loan.title}</strong>
            <span class="bal">${loan.remaining} left</span>
          </div>
          <div class="meta">
            Principal ${loan.principal} · Paid ${loan.paid} ·
            {loan.participants.length} participant{loan.participants.length === 1 ? '' : 's'}
          </div>
        </a>
      </li>
    {/each}
  </ul>
{/if}

<style>
  h1 { margin: 0 0 0.35rem; font-size: 1.75rem; }
  .lede { color: #94a3b8; margin: 0 0 1.5rem; }
  .empty { background: #1a2330; border: 1px dashed #334155; border-radius: 10px; padding: 2rem; text-align: center; }
  .list { list-style: none; padding: 0; margin: 0; display: grid; gap: 0.75rem; }
  .card {
    display: block; background: #1a2330; border: 1px solid #2a3a4f; border-radius: 10px;
    padding: 1rem 1.1rem; color: inherit; text-decoration: none;
  }
  .card:hover { border-color: #38bdf8; text-decoration: none; }
  .row { display: flex; justify-content: space-between; gap: 1rem; align-items: baseline; }
  .bal { color: #4ade80; font-weight: 600; }
  .meta { color: #94a3b8; font-size: 0.9rem; margin-top: 0.35rem; }
  :global(.btn) {
    display: inline-block; margin-top: 0.75rem; background: #0284c7; color: white !important;
    padding: 0.55rem 1rem; border-radius: 8px; font-weight: 600; text-decoration: none !important;
  }
  :global(.btn:hover) { background: #0369a1; }

  .agent-promo {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 0.75rem 1rem; margin-bottom: 1.25rem;
    background: #0c1a2e; border: 1px solid #0369a1; border-radius: 10px;
    padding: 0.9rem 1.1rem;
  }
  .agent-promo strong { display: block; margin-bottom: 0.15rem; }
  .agent-promo span { color: #94a3b8; font-size: 0.88rem; }
  .agent-promo .btn { margin-top: 0; }
</style>
