<script setup lang="ts">
// HOW WE WORK (#how) — kicker, H2 and the six pipeline steps: one panel of six cells (3 × 2 ≥ 960 px, one
// column below), each with its icon, number, title and one line. A hairline rail joins icon to icon (along
// each row on desktop, down the column below), stopping short of both tiles; the only other rule is the one
// inset divider between the two desktop rows. Then the 1,001 figure (#genomes, GenomeFigure). SSR = final.
// Motion (once, on reveal; v-reveal.custom per cell, staggered by column on desktop): the cell's content
// rises, its icon plays its micro-motion (StepIcon), then the rail to the next icon draws on.
// Reduced motion / motion off: nothing moves.
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import { vReveal } from './lib/reveal.ts'
import SectionHead from './ui/SectionHead.vue'
import StepIcon from './methods/StepIcon.vue'
import GenomeFigure from './methods/GenomeFigure.vue'

const { t } = useHome()
const M = HOME.methods
</script>

<template>
  <section id="how" class="kl-band kl-how" aria-labelledby="how-h">
    <div class="kl-container">
      <SectionHead id="how-h" :kicker="M.kicker" :title="M.h2" />
      <ol class="kl-steps">
        <li v-for="(s, i) in M.steps" :key="s.id" v-reveal.custom class="kl-step" :style="{ '--i': i % 3 }">
          <span class="kl-step__ico"><StepIcon :name="s.icon" /></span>
          <span class="kl-step__n" aria-hidden="true">{{ s.n.padStart(2, '0') }}</span>
          <h3 class="kl-step__h">{{ t(s.title) }}</h3>
          <p class="kl-step__p">{{ t(s.body) }}</p>
        </li>
      </ol>
    </div>
  </section>
  <GenomeFigure />
</template>

<style scoped>
.kl-steps {
  display:grid; margin-top:clamp(32px, 4vw, 48px); padding-block:6px;
  background:var(--kl-surface); border:1px solid var(--kl-line); border-radius:var(--kl-radius); box-shadow:var(--kl-shadow);
}
.kl-step {
  --d:0ms; position:relative;
  display:grid; grid-template-columns:56px minmax(0, 1fr); grid-template-rows:auto auto 1fr; column-gap:18px;
  padding:16px 20px;
}
.kl-step__ico {
  grid-row:1 / span 3; align-self:start; display:grid; place-items:center; width:56px; height:56px; padding:6px; box-sizing:border-box;
  border-radius:14px; background:linear-gradient(160deg, var(--kl-accent-soft), transparent 75%); box-shadow:inset 0 0 0 1px var(--kl-line);
}
.kl-step__n {
  display:block; margin-top:3px; font-size:12px; line-height:16px; font-weight:600; letter-spacing:.08em;
  font-variant-numeric:tabular-nums; color:var(--kl-accent);
}
.kl-step__h { margin-top:3px; font-size:1.0625rem; line-height:1.4; font-weight:700; color:var(--kl-ink); }
.kl-step__p { margin-top:2px; font-size:.9375rem; line-height:1.6; color:var(--kl-ink-2); }
.kl-home--zh .kl-step__p { line-height:1.75; }
/* Rail: tile to tile, 8 px clear of both (down the column below 960 px); draws on after the reveal. */
.kl-step:not(:last-child)::after {
  content:''; position:absolute; z-index:1; left:47.5px; top:80px; bottom:-8px; width:1px;
  background:var(--kl-card-hover); transform-origin:0 0;
}
.kl-step.kl-pre::after { scale:1 0; }
.kl-step.kl-pre.is-in::after { scale:none; transition:scale var(--kl-t-slower) var(--kl-ease-inout) calc(var(--d) + 250ms); }
/* Custom reveal: the cell's content rises once, staggered by column (desktop). */
.kl-step.kl-pre > * { opacity:0; translate:0 12px; }
.kl-step.kl-pre.is-in > * {
  opacity:1; translate:none;
  transition:opacity var(--kl-t-slow) var(--kl-ease-out), translate var(--kl-t-slow) var(--kl-ease-out);
  transition-delay:var(--d);
}
@media (min-width: 960px) {
  .kl-steps { grid-template-columns:repeat(3, minmax(0, 1fr)); padding-block:0; }
  .kl-step { --d:calc(var(--i, 0) * 80ms); display:block; padding:32px; }
  .kl-step__ico { width:64px; height:64px; padding:8px; border-radius:16px; margin-bottom:22px; }
  .kl-step__h { margin-top:6px; font-size:1.125rem; }
  .kl-step__p { margin-top:6px; text-wrap:balance; }
  /* The one divider: between the rows, inset to the content edges. */
  .kl-step:nth-child(n+4)::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:var(--kl-line); }
  .kl-step:nth-child(4)::before { left:32px; }
  .kl-step:nth-child(6)::before { right:32px; }
  .kl-step:not(:last-child)::after { display:none; }
  .kl-step:not(:nth-child(3n))::after { display:block; left:106px; right:-22px; top:63.5px; bottom:auto; width:auto; height:1px; }
  .kl-step.kl-pre::after { scale:0 1; }
}
</style>
