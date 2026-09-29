<script lang="ts">
  type Step = 'intro' | 'draft' | 'agree' | 'payment' | 'ledger';

  let step = $state<Step>('intro');
  /** Mom: auto soft-confirm vs require human tap on agree */
  let momAutoAgree = $state(true);
  /** Ty/agent: auto-send draft vs require Send tap */
  let agentAutoSend = $state(true);

  let draftSent = $state(false);
  let agreed = $state(false);
  let agreedBy: 'agent' | 'human' | null = $state(null);
  let paymentApplied = $state(false);
  let smsVisible = $state(false);

  const balanceBefore = 180;
  const addon = 200;
  const payment = 50;
  const balanceAfterAddon = balanceBefore + addon;
  const balanceAfterPay = balanceAfterAddon - payment;

  const steps: { id: Step; label: string }[] = [
    { id: 'intro', label: '1 · Consent' },
    { id: 'draft', label: '2 · Draft' },
    { id: 'agree', label: '3 · Agree' },
    { id: 'payment', label: '4 · SMS' },
    { id: 'ledger', label: '5 · Ledger' }
  ];

  function go(s: Step) {
    step = s;
  }

  function reset() {
    step = 'intro';
    draftSent = false;
    agreed = false;
    agreedBy = null;
    paymentApplied = false;
    smsVisible = false;
  }

  function sendDraft() {
    draftSent = true;
    go('agree');
  }

  function doAgree(by: 'agent' | 'human') {
    agreed = true;
    agreedBy = by;
    go('payment');
    smsVisible = true;
  }

  function applyPayment() {
    paymentApplied = true;
    go('ledger');
  }

  // Soft auto-advance when prefs allow and user lands on a step
  $effect(() => {
    if (step === 'draft' && agentAutoSend && !draftSent) {
      const t = setTimeout(() => sendDraft(), 900);
      return () => clearTimeout(t);
    }
  });

  $effect(() => {
    if (step === 'agree' && draftSent && !agreed && momAutoAgree) {
      const t = setTimeout(() => doAgree('agent'), 1100);
      return () => clearTimeout(t);
    }
  });
</script>

<svelte:head>
  <title>OAuth agent flow · Personal Loan Tracker</title>
</svelte:head>

<div class="oauth-agent">
  <h1>OAuth agent flow</h1>
  <p class="lede">
    Demo walkthrough: act-as-user · via-agent audit · humans only where they choose.
    Prototype only — no real money movement.
  </p>

  <div class="prefs card">
    <div class="prefs-head">
      <strong>Human-in-loop prefs</strong>
      <span class="muted">Govern my agent within my scopes only</span>
    </div>
    <label class="toggle">
      <input type="checkbox" bind:checked={agentAutoSend} />
      <span>
        <strong>Agent may send drafts</strong>
        <span class="sub">Else the agent prepares; you tap Send</span>
      </span>
    </label>
    <label class="toggle">
      <input type="checkbox" bind:checked={momAutoAgree} />
      <span>
        <strong>Mom’s agent may soft-confirm agree</strong>
        <span class="sub">Else Mom taps Agree herself. Never agrees for Ty.</span>
      </span>
    </label>
    <div class="locked">
      <span class="dot on"></span>
      Payment SMS doorbell always on — agents cannot silence it
    </div>
  </div>

  <ol class="steps" aria-label="Flow steps">
    {#each steps as s}
      <li>
        <button
          type="button"
          class:active={step === s.id}
          class:done={
            (s.id === 'intro' && step !== 'intro') ||
            (s.id === 'draft' && draftSent) ||
            (s.id === 'agree' && agreed) ||
            (s.id === 'payment' && paymentApplied) ||
            (s.id === 'ledger' && paymentApplied && step === 'ledger')
          }
          onclick={() => go(s.id)}
        >
          {s.label}
        </button>
      </li>
    {/each}
  </ol>

  {#if step === 'intro'}
    <section class="card scene">
      <div class="oauth">
        <div class="oauth-row">
          <span>OAuth 2.1 · Auth Code + PKCE · act-as-user</span>
          <span class="badge">via agent</span>
        </div>
        <div class="scopes">
          <code>loans:propose</code>
          <code>loans:agree</code>
          <code>payments:propose</code>
          <code>loans:read</code>
          <code>payments:read</code>
        </div>
        <p class="audit">Every action logs actor=agent-client, subject=Ty, via_agent=true. No money:move scope.</p>
      </div>

      <div class="persona">
        <div class="who">Client</div>
        <div class="name">Agent client <span class="badge">agent</span></div>
        <p>Delegated client for Ty. Never a hidden party. Never consents for Mom.</p>
      </div>

      <div class="box">
        <div class="title">Story</div>
        <p>
          The agent drafts a <strong>$200 vet bill</strong> onto the Household tab with yardstick
          <strong>fixed $50 / Fri</strong>. Mom’s agent reviews &amp; agrees. Payment SMS still
          rings the human phone. Ledger lines carry a <span class="badge">via agent</span> audit badge.
        </p>
      </div>

      <div class="actions">
        <button type="button" class="btn" onclick={() => go('draft')}>Allow · continue as Ty</button>
        <button type="button" class="btn secondary" onclick={reset}>Reset demo</button>
      </div>
    </section>
  {/if}

  {#if step === 'draft'}
    <section class="card scene">
      <div class="oauth">
        <div class="oauth-row">
          <span>Acting as Ty · scoped token</span>
          <span class="badge">via agent</span>
        </div>
        <div class="scopes">
          <code>addons:propose</code>
          <code>loans:read</code>
        </div>
        <p class="audit">Intent POST /v1/loans/…/addon-intents · Idempotency-Key · via-agent audit</p>
      </div>

      <div class="persona">
        <div class="who">Drafted by</div>
        <div class="name">Agent client <span class="badge">via-agent</span></div>
        <p>Acting as <strong>Ty</strong> · Household tab with Mom</p>
      </div>

      <div class="box accent">
        <div class="title">+$200 · vet bill</div>
        <p class="meta">Onto Household tab · note: dogs vet bill</p>
      </div>

      <div class="box">
        <div class="row"><span>Balance</span><span>${balanceBefore} → <strong>${balanceAfterAddon}</strong></span></div>
        <div class="row"><span>Yardstick</span><span>Fixed <strong>$50 / Fri</strong></span></div>
        <div class="row"><span>Payment</span><span>stays $50</span></div>
        <div class="row"><span>Left</span><span>~4 → <strong>~8 payments</strong></span></div>
        <p class="hint">Duration extends · yardstick unchanged. Mom must still mutually agree.</p>
      </div>

      {#if agentAutoSend && !draftSent}
        <p class="auto">Agent auto-sending draft… (prefs: send within scope)</p>
      {/if}

      <div class="actions">
        {#if !draftSent}
          <button type="button" class="btn" onclick={sendDraft}>
            {agentAutoSend ? 'Send now' : 'Send to Mom to agree'}
          </button>
        {:else}
          <button type="button" class="btn" onclick={() => go('agree')}>Continue → Mom’s agent</button>
        {/if}
        <button type="button" class="btn secondary" onclick={() => go('intro')}>Back</button>
      </div>
      <p class="note">The agent cannot submit Mom’s agree — separate consent required.</p>
    </section>
  {/if}

  {#if step === 'agree'}
    <section class="card scene">
      <div class="sms-strip">
        <div class="strip-label">
          <span>Phone SMS · Mom’s doorbell</span>
          <span class="arrow">handoff · link only</span>
        </div>
        <div class="msg">
          Ty wants to add $200 to Household tab (vet). Open to review: plt.io/ta/…
        </div>
        <p class="meta-line">SMS still lands on the human phone even when an agent will review.</p>
      </div>

      <div class="oauth">
        <div class="oauth-row">
          <span>Mom’s agent · separate consent</span>
          <span class="badge">via Mom’s agent</span>
        </div>
        <div class="scopes">
          <code>loans:agree</code>
          <code>loans:read</code>
        </div>
        <p class="audit">Subject = Mom · not Ty. The agent’s token cannot reach this agree.</p>
      </div>

      <div class="persona">
        <div class="who">Reviewing as</div>
        <div class="name">Mom’s agent <span class="badge">via-agent</span></div>
        <p>
          Soft confirm —
          {momAutoAgree ? 'auto within Mom’s prefs' : 'waiting for Mom’s tap'}
        </p>
      </div>

      <div class="box">
        <div class="row"><span>Add</span><span>+$200 · dogs vet bill</span></div>
        <div class="row"><span>Balance</span><span>${balanceBefore} → ${balanceAfterAddon}</span></div>
        <div class="row"><span>Yardstick</span><span>Fixed $50 / Fri</span></div>
        <div class="row"><span>Payment</span><span>stays $50 · ~8 left</span></div>
        <div class="row">
          <span>Proposed by</span>
          <span>Ty <span class="badge">via agent</span></span>
        </div>
      </div>

      {#if momAutoAgree && !agreed}
        <p class="auto">Mom’s agent soft-confirming agree…</p>
      {/if}

      {#if agreed}
        <div class="result good">
          Agreed · recorded as
          {agreedBy === 'agent' ? 'Mom’s agent (soft confirm)' : 'Mom (human tap)'}
        </div>
        <div class="actions">
          <button type="button" class="btn" onclick={() => go('payment')}>Continue → payment SMS</button>
        </div>
      {:else}
        <div class="actions">
          <button type="button" class="btn" onclick={() => doAgree('agent')}>Soft-confirm agree (agent)</button>
          <button type="button" class="btn secondary" onclick={() => doAgree('human')}>
            I want to tap myself
          </button>
          <button type="button" class="btn ghost" onclick={() => go('draft')}>Back</button>
        </div>
        <p class="note">Mutual agree still required. Agent cannot satisfy the other party’s consent.</p>
      {/if}
    </section>
  {/if}

  {#if step === 'payment'}
    <section class="card scene">
      <div class="sms-strip highlight">
        <div class="strip-label">
          <span>Payment SMS · both phones</span>
          <span class="arrow">doorbell · confirm only</span>
        </div>
        {#if paymentApplied}
          <div class="msg">Household tab: ${payment} applied · ${balanceAfterPay} left</div>
        {:else}
          <div class="msg">
            Simulator: Venmo — You received ${payment}.00 from Mom
            <span class="muted"> (forward / apply via agent)</span>
          </div>
        {/if}
        <p class="meta-line">Human phone still gets the confirm — agent cannot silence the doorbell.</p>
      </div>

      <div class="oauth">
        <div class="oauth-row">
          <span>Agent client · payment apply intent</span>
          <span class="badge">via agent</span>
        </div>
        <div class="scopes">
          <code>payments:propose</code>
          <code>payments:read</code>
        </div>
        <p class="audit">POST /v1/payment-applications · ledger + dual notify · not a transfer</p>
      </div>

      <div class="box">
        <div class="title">Apply Friday payment</div>
        <div class="row"><span>Amount</span><span><strong>${payment}.00</strong></span></div>
        <div class="row"><span>Balance after</span><span>${balanceAfterAddon} → <strong>${balanceAfterPay}</strong></span></div>
        <div class="row"><span>Yardstick</span><span>Fixed $50 / Fri · ~7 left</span></div>
      </div>

      {#if paymentApplied}
        <div class="result good">Ledger apply confirmed · dual SMS notified</div>
        <div class="actions">
          <button type="button" class="btn" onclick={() => go('ledger')}>View ledger →</button>
        </div>
      {:else}
        <div class="actions">
          <button type="button" class="btn" onclick={applyPayment}>Confirm ledger (via agent)</button>
          <button type="button" class="btn secondary" onclick={() => go('agree')}>Back</button>
        </div>
      {/if}
    </section>
  {/if}

  {#if step === 'ledger'}
    <section class="card scene">
      {#if smsVisible}
        <div class="sms-strip">
          <div class="strip-label">
            <span>Confirm SMS · both phones</span>
            <span class="arrow">doorbell</span>
          </div>
          <div class="msg">Household tab: ${payment} applied · ${balanceAfterPay} left</div>
        </div>
      {/if}

      <div class="box filled">
        <div class="row"><span>Balance</span><span class="big">${balanceAfterPay}.00</span></div>
        <div class="row"><span>Next due Fri</span><span>${payment}.00</span></div>
        <div class="row"><span>Yardstick</span><span>Fixed $50 / Fri · ~7 left</span></div>
        <span class="status">● Active tab</span>
      </div>

      <div class="box">
        <div class="title">Ledger</div>
        <ul class="ledger">
          <li>
            <span>
              Oct 10 · Payment
              <span class="via">via agent · act-as Ty · payments:propose</span>
            </span>
            <span class="amt neg">−${payment}.00</span>
          </li>
          <li>
            <span>
              Oct 10 · Charge · dogs vet bill
              <span class="via">
                via agent · mutually agreed ·
                {agreedBy === 'human' ? 'Mom (human tap)' : 'Mom’s agent'}
              </span>
            </span>
            <span class="amt">+${addon}.00</span>
          </li>
          <li>
            <span>Oct 3 · Payment</span>
            <span class="amt neg">−$50.00</span>
          </li>
          <li>
            <span>Sep 28 · Charge · groceries</span>
            <span class="amt">+$40.00</span>
          </li>
          <li>
            <span>Sep 20 · Tab opened</span>
            <span class="amt">—</span>
          </li>
        </ul>
      </div>

      <div class="callout">
        <strong>Via-agent badge</strong>
        Ledger lines show which agent + subject + scope. Humans stay notified by SMS.
        Toggle prefs above anytime — they never let the agent agree for Mom or move money.
      </div>

      <div class="actions">
        <button type="button" class="btn" onclick={reset}>Replay demo</button>
        <a class="btn secondary" href="/">Back to loans</a>
        <a class="btn ghost" href="/sms">SMS simulator</a>
      </div>
    </section>
  {/if}
</div>

<style>
  .oauth-agent { max-width: 640px; }
  h1 { margin: 0 0 0.35rem; font-size: 1.75rem; }
  .lede { color: #94a3b8; margin: 0 0 1.25rem; }
  .muted { color: #94a3b8; font-size: 0.85rem; }
  .card {
    background: #1a2330;
    border: 1px solid #2a3a4f;
    border-radius: 10px;
    padding: 1rem 1.1rem;
    margin-bottom: 1rem;
  }
  .prefs-head {
    display: flex; flex-wrap: wrap; gap: 0.5rem 1rem;
    align-items: baseline; margin-bottom: 0.75rem;
  }
  .toggle {
    display: flex; gap: 0.75rem; align-items: flex-start;
    margin-bottom: 0.65rem; cursor: pointer; font-size: 0.92rem;
  }
  .toggle input { margin-top: 0.25rem; accent-color: #38bdf8; }
  .toggle .sub { display: block; color: #94a3b8; font-size: 0.82rem; margin-top: 0.15rem; }
  .locked {
    display: flex; align-items: center; gap: 0.5rem;
    font-size: 0.85rem; color: #94a3b8; margin-top: 0.35rem;
  }
  .dot {
    width: 10px; height: 10px; border-radius: 999px;
    background: #334155; display: inline-block;
  }
  .dot.on { background: #4ade80; box-shadow: 0 0 0 3px rgba(74, 222, 128, 0.2); }

  .steps {
    list-style: none; padding: 0; margin: 0 0 1rem;
    display: flex; flex-wrap: wrap; gap: 0.4rem;
  }
  .steps button {
    background: #1e293b; border: 1px solid #334155; color: #cbd5e1;
    border-radius: 999px; padding: 0.35rem 0.75rem; font: inherit;
    font-size: 0.8rem; cursor: pointer;
  }
  .steps button:hover { border-color: #38bdf8; }
  .steps button.active { background: #0284c7; border-color: #0284c7; color: white; font-weight: 600; }
  .steps button.done:not(.active) { border-color: #166534; color: #86efac; }

  .scene { display: grid; gap: 0.9rem; }
  .oauth {
    background: #0f172a;
    border: 1px solid #334155;
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    font-size: 0.88rem;
  }
  .oauth-row {
    display: flex; justify-content: space-between; gap: 0.75rem;
    flex-wrap: wrap; align-items: center; margin-bottom: 0.45rem;
  }
  .scopes { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .scopes code {
    background: #1e3a5f; color: #bae6fd;
    border-radius: 4px; padding: 0.15rem 0.4rem; font-size: 0.75rem;
  }
  .audit { margin: 0.5rem 0 0; color: #94a3b8; font-size: 0.8rem; }

  .badge {
    display: inline-block;
    background: #1e3a5f; color: #7dd3fc;
    border: 1px solid #0369a1;
    border-radius: 999px; padding: 0.1rem 0.5rem;
    font-size: 0.72rem; font-weight: 600; vertical-align: middle;
  }

  .persona {
    border-left: 3px solid #38bdf8;
    padding-left: 0.85rem;
  }
  .persona .who { font-size: 0.75rem; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.04em; }
  .persona .name { font-size: 1.15rem; font-weight: 700; margin: 0.15rem 0; }
  .persona p { margin: 0.25rem 0 0; color: #94a3b8; font-size: 0.9rem; }

  .box {
    background: #0f172a;
    border: 1px solid #2a3a4f;
    border-radius: 8px;
    padding: 0.85rem 1rem;
  }
  .box.accent { border-color: #0369a1; background: #0c1a2e; }
  .box.filled { background: #052e16; border-color: #166534; }
  .box .title { font-weight: 700; margin-bottom: 0.35rem; }
  .box .meta { color: #94a3b8; font-size: 0.9rem; margin: 0; }
  .box p { margin: 0.35rem 0 0; color: #cbd5e1; font-size: 0.92rem; }
  .row {
    display: flex; justify-content: space-between; gap: 1rem;
    padding: 0.3rem 0; font-size: 0.92rem; border-bottom: 1px solid #1e293b;
  }
  .row:last-of-type { border-bottom: none; }
  .hint { color: #94a3b8 !important; font-size: 0.82rem !important; }
  .big { font-size: 1.35rem; font-weight: 700; color: #4ade80; }
  .status {
    display: inline-block; margin-top: 0.5rem;
    color: #86efac; font-size: 0.85rem; font-weight: 600;
  }

  .sms-strip {
    background: #111827;
    border: 1px solid #374151;
    border-radius: 8px;
    padding: 0.75rem 0.9rem;
    font-size: 0.88rem;
  }
  .sms-strip.highlight { border-color: #0369a1; background: #0c1a2e; }
  .strip-label {
    display: flex; justify-content: space-between; gap: 0.5rem;
    flex-wrap: wrap; color: #94a3b8; font-size: 0.78rem; margin-bottom: 0.4rem;
  }
  .arrow { color: #7dd3fc; }
  .msg {
    background: #1e293b; border-radius: 8px;
    padding: 0.65rem 0.8rem; line-height: 1.4;
  }
  .meta-line { margin: 0.45rem 0 0; color: #64748b; font-size: 0.78rem; }

  .ledger { list-style: none; padding: 0; margin: 0.5rem 0 0; display: grid; gap: 0.55rem; }
  .ledger li {
    display: flex; justify-content: space-between; gap: 0.75rem;
    font-size: 0.88rem; align-items: flex-start;
  }
  .via {
    display: block; font-size: 0.72rem; color: #7dd3fc; margin-top: 0.15rem;
  }
  .amt { font-weight: 600; white-space: nowrap; color: #4ade80; }
  .amt.neg { color: #f87171; }

  .callout {
    background: #1e293b; border-left: 3px solid #38bdf8;
    padding: 0.75rem 0.9rem; font-size: 0.88rem; color: #cbd5e1; border-radius: 0 8px 8px 0;
  }
  .callout strong { display: block; margin-bottom: 0.25rem; color: #f1f5f9; }

  .actions { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
  .btn {
    display: inline-block; background: #0284c7; color: white !important;
    padding: 0.55rem 1rem; border-radius: 8px; font-weight: 600;
    text-decoration: none !important; border: none; font: inherit; cursor: pointer;
  }
  .btn:hover { background: #0369a1; }
  .btn.secondary {
    background: transparent; color: #e2e8f0 !important;
    border: 1px solid #475569;
  }
  .btn.secondary:hover { border-color: #38bdf8; }
  .btn.ghost {
    background: transparent; color: #94a3b8 !important;
    border: 1px solid transparent; padding: 0.55rem 0.75rem;
  }
  .btn.ghost:hover { color: #e2e8f0 !important; }

  .note { margin: 0; color: #64748b; font-size: 0.82rem; }
  .auto {
    margin: 0; color: #7dd3fc; font-size: 0.88rem;
    font-style: italic;
  }
  .result {
    border-radius: 8px; padding: 0.75rem 0.9rem; font-size: 0.92rem;
  }
  .result.good { background: #052e16; border: 1px solid #166534; color: #bbf7d0; }
</style>
