<script lang="ts">
  let { form } = $props();
</script>

<h1>Create loan</h1>
<p class="lede">Name the IOU, set principal, and add lender + borrower phone numbers for confirmations.</p>

{#if form?.error}
  <p class="err">{form.error}</p>
{/if}

<form method="POST" class="form">
  <label>
    Title
    <input name="title" required placeholder="Cabin trip float" />
  </label>
  <label>
    Principal ($)
    <input name="principal" type="number" step="0.01" min="0.01" required placeholder="200.00" />
  </label>
  <label>
    Notes (optional)
    <textarea name="notes" rows="2" placeholder="Paid for shared Airbnb"></textarea>
  </label>

  <fieldset>
    <legend>Lender</legend>
    <div class="grid2">
      <label>Name <input name="lender_name" required placeholder="Ty" /></label>
      <label>Phone <input name="lender_phone" required placeholder="+15551112222" /></label>
    </div>
  </fieldset>

  <fieldset>
    <legend>Borrowers</legend>
    {#each [0, 1, 2] as i}
      <div class="grid2">
        <label>Name <input name="borrower_name_{i}" placeholder={i === 0 ? 'Alex' : 'Optional'} required={i === 0} /></label>
        <label>Phone <input name="borrower_phone_{i}" placeholder={i === 0 ? '+15553334444' : 'Optional'} required={i === 0} /></label>
      </div>
    {/each}
  </fieldset>

  <button type="submit" class="btn">Create loan</button>
</form>

<style>
  h1 { margin: 0 0 0.35rem; }
  .lede { color: #94a3b8; margin: 0 0 1.25rem; }
  .err { background: #450a0a; color: #fecaca; padding: 0.75rem 1rem; border-radius: 8px; }
  .form { display: grid; gap: 1rem; }
  label { display: grid; gap: 0.35rem; font-size: 0.9rem; color: #cbd5e1; }
  input, textarea {
    background: #1a2330; border: 1px solid #334155; color: #f1f5f9;
    border-radius: 8px; padding: 0.55rem 0.7rem; font: inherit;
  }
  input:focus, textarea:focus { outline: 2px solid #0284c7; border-color: transparent; }
  fieldset { border: 1px solid #2a3a4f; border-radius: 10px; padding: 1rem; }
  legend { padding: 0 0.4rem; color: #e2e8f0; font-weight: 600; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; margin-bottom: 0.75rem; }
  @media (max-width: 560px) { .grid2 { grid-template-columns: 1fr; } }
  button.btn {
    justify-self: start; cursor: pointer; border: none;
    background: #0284c7; color: white; padding: 0.65rem 1.2rem;
    border-radius: 8px; font-weight: 600; font: inherit;
  }
  button.btn:hover { background: #0369a1; }
</style>
