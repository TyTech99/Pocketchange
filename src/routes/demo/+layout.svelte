<script lang="ts">
  let { children } = $props();
</script>

<svelte:head>
  <title>Personal Loan Tracker (demo)</title>
</svelte:head>

<div class="shell">
  <header class="top">
    <a href="/demo/loans" class="brand">personalloantracker.io</a>
    <nav>
      <a href="/demo/loans">Loans</a>
      <a href="/demo/create">Create loan</a>
      <a href="/demo/sms">SMS simulator</a>
      <a href="/demo/oauth-agent">OAuth agent</a>
      <a href="/" data-sveltekit-reload>Home</a>
    </nav>
  </header>
  <main>
    {@render children()}
  </main>
  <footer>
    Demo, reference only. Not the real app and not the architecture. No real money movement. Twilio webhook at <code>POST /demo/api/sms</code>.
  </footer>
</div>

<style>
  .shell { max-width: 880px; margin: 0 auto; padding: 1.25rem 1rem 3rem; }
  .top {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 0.75rem; margin-bottom: 1.75rem; padding-bottom: 1rem;
    border-bottom: 1px solid #243041;
  }
  .brand { font-weight: 700; color: #f8fafc; font-size: 1.05rem; }
  nav { display: flex; gap: 1rem; font-size: 0.95rem; }
  footer { margin-top: 2.5rem; padding-top: 1rem; border-top: 1px solid #243041; color: #94a3b8; font-size: 0.85rem; }
</style>
