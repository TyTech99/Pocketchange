<script lang="ts">
  let { children } = $props();
</script>

{@render children()}

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
</style>
