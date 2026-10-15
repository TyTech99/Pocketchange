<svelte:head>
  <title>Pocket Change</title>
  <meta
    name="description"
    content="Pocket Change keeps friends-and-family IOUs honest. We never move your money."
  />
</svelte:head>

<section class="hero">
  <p class="chip"><span class="dot" aria-hidden="true"></span>Preprod placeholder</p>
  <p class="eyebrow">Pocket Change</p>
  <h1>Hello, <span class="accent">world.</span></h1>
  <p class="tagline">Friends-and-family IOUs, kept honest. We never move your money.</p>

  <nav class="quiet" aria-label="Preview links">
    <a href="/wireframes/" data-sveltekit-reload>Wireframes</a>
    <span aria-hidden="true">·</span>
    <a href="/loans">Loans prototype</a>
  </nav>
</section>

<style>
  .hero {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: clamp(3rem, 12vh, 7rem) 1rem clamp(3rem, 10vh, 6rem);
    isolation: isolate;
  }
  /* soft accent glow behind the headline */
  .hero::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background:
      radial-gradient(60% 50% at 50% 35%, rgb(125 211 252 / 0.16), transparent 70%),
      radial-gradient(40% 35% at 50% 60%, rgb(125 211 252 / 0.07), transparent 75%);
    pointer-events: none;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    margin: 0 0 clamp(1.5rem, 4vh, 2.5rem);
    padding: 0.3rem 0.8rem;
    border: 1px solid #243041;
    border-radius: 999px;
    background: #121a24;
    color: #cbd5e1;
    font-size: 0.8rem;
    letter-spacing: 0.02em;
  }
  .dot {
    width: 0.5rem;
    height: 0.5rem;
    border-radius: 50%;
    background: #7dd3fc;
    box-shadow: 0 0 0.6rem #7dd3fc;
  }
  .eyebrow {
    margin: 0 0 0.5rem;
    color: #94a3b8;
    font-size: 0.85rem;
    font-weight: 600;
    letter-spacing: 0.18em;
    text-transform: uppercase;
  }
  h1 {
    margin: 0;
    font-size: clamp(2.75rem, 11vw, 6rem);
    font-weight: 800;
    line-height: 1.02;
    letter-spacing: -0.035em;
    color: #f8fafc;
  }
  .accent {
    background: linear-gradient(120deg, #7dd3fc, #e0f2fe 60%, #7dd3fc);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  .tagline {
    max-width: 30ch;
    margin: clamp(1rem, 3vh, 1.75rem) 0 0;
    color: #cbd5e1;
    font-size: clamp(1.05rem, 2.8vw, 1.35rem);
    line-height: 1.5;
  }
  .quiet {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 0.6rem;
    margin-top: clamp(2rem, 6vh, 3.5rem);
    color: #64748b;
    font-size: 0.9rem;
  }
  .quiet a {
    padding: 0.25rem 0.1rem;
    color: #94a3b8;
    border-bottom: 1px solid transparent;
  }
  .quiet a:hover,
  .quiet a:focus-visible {
    color: #7dd3fc;
    text-decoration: none;
    border-bottom-color: currentColor;
  }
  .quiet a:focus-visible {
    outline: 2px solid #7dd3fc;
    outline-offset: 3px;
    border-radius: 2px;
  }
</style>
