<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>Personal Loan Tracker</title>
</svelte:head>

<div class="shell">
  <header class="top">
    <a href="/" class="brand">personalloantracker.io</a>
  </header>
  <main>
    {@render children()}
  </main>
  <footer>
    Preprod placeholder. The wireframes and the demo are reference material, not the real app.
  </footer>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(body) {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
    background: #0f1419;
    color: #e7ecf1;
    line-height: 1.45;
  }
  :global(a) { color: #7dd3fc; text-decoration: none; }
  :global(a:hover) { text-decoration: underline; }
  :global(code) {
    font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
    font-size: 0.9em;
    background: #1a2330;
    padding: 0.1em 0.35em;
    border-radius: 4px;
  }
  .shell { max-width: 880px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }
  .top {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 0.75rem; margin-bottom: 1.75rem; padding-bottom: 1rem;
    border-bottom: 1px solid #243041;
  }
  .brand { font-weight: 700; color: #f8fafc; font-size: 1.05rem; }
  footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #243041; color: #94a3b8; font-size: 0.85rem; }
</style>
