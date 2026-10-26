<script setup lang="ts">
// JOIN & OUTREACH (#join, #outreach) — v2 §5.6. The calm closing band (--kl-bg-2): Join on the left
// (kicker, H2, one line, mailto + "Meet the team"), Press & outreach on the right (three link rows and the
// WeChat QR card on a white tile in both themes). Motion: gentle v-reveal rises, panel first, then the right
// column staggered 60 ms; SSR = final state.
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import { vReveal } from './lib/reveal.ts'
import { wechatQr } from './img/index.ts'
import ArrowIcon from './ui/ArrowIcon.vue'
import Picture from './ui/Picture.vue'

const { t, href } = useHome()
const J = HOME.join
const O = HOME.outreach
</script>

<template>
  <div class="kl-band kl-band--alt kl-join">
    <div class="kl-container kl-join__grid">
      <section id="join" v-reveal class="kl-join__panel" aria-labelledby="join-h">
        <span class="kl-kicker">{{ t(J.kicker) }}</span>
        <h2 id="join-h" class="kl-h2">{{ t(J.h2) }}</h2>
        <p class="kl-lede">{{ t(J.body) }}</p>
        <div class="kl-join__cta">
          <a class="kl-btn kl-btn--primary" :href="`mailto:${J.email}`">
            <svg class="kl-join__mail" viewBox="0 0 20 20" width="18" height="18" aria-hidden="true" focusable="false"
                 fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2.5" y="4.5" width="15" height="11" rx="2.5" /><path d="m3.5 6 6.5 5 6.5-5" />
            </svg>
            {{ t(J.primary) }}
          </a>
          <a class="kl-btn kl-btn--secondary" :href="href(J.team.href)">{{ t(J.team) }} <ArrowIcon /></a>
        </div>
      </section>

      <section id="outreach" class="kl-join__side" aria-labelledby="outreach-h">
        <h3 id="outreach-h" v-reveal class="kl-h3" :style="{ '--i': 1 }">{{ t(O.h3) }}</h3>
        <ul class="kl-join__links">
          <li v-for="(l, i) in O.links" :key="l.id" v-reveal :style="{ '--i': i + 2 }">
            <a class="kl-join__row" :href="href(l.href)">
              <span class="kl-join__text">
                <span class="kl-join__name">{{ t(l.title) }}</span>
                <span class="kl-join__sub">{{ t(l.sub) }}</span>
              </span>
              <span class="kl-join__go"><ArrowIcon /></span>
            </a>
          </li>
        </ul>
        <div v-reveal class="kl-card kl-join__wechat" :style="{ '--i': 5 }">
          <div class="kl-join__qr">
            <Picture class="kl-pic--flat" :pic="wechatQr" :alt="t(O.wechat.alt)" />
          </div>
          <div class="kl-join__text">
            <span class="kl-join__name">{{ t(O.wechat.title) }}</span>
            <span class="kl-join__sub">{{ t(O.wechat.body) }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.kl-join { --kl-join-card: color-mix(in srgb, var(--kl-surface) 97%, #fff); } /* lifts cards off --kl-bg-2 in dark; #fff in light */
.kl-join__grid { display: grid; gap: 48px; }

/* Join panel: a surface card with the hero's soft blue glow rising from its lower right. Content is centred
   vertically, so the slack of the stretched (>= 960) panel splits evenly above and below. */
.kl-join__panel {
  display: flex; flex-direction: column; justify-content: center; align-items: flex-start; gap: 12px;
  padding: clamp(24px, 4.4vw, 56px); border: 1px solid var(--kl-line); border-radius: var(--kl-radius);
  background: radial-gradient(70% 90% at 100% 100%, var(--kl-accent-soft), transparent 70%) var(--kl-join-card);
  box-shadow: var(--kl-shadow);
}
.kl-join__panel .kl-lede { margin-top: 4px; }
.kl-home--en .kl-join__panel .kl-h2 { max-width: 7.6em; text-wrap: wrap; } /* "Read the past / with us" */
.kl-join__cta { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 20px; }
.kl-join__mail { flex: none; margin-left: -2px; }
/* Outlined on the panel: a filled --kl-surface pill would sit darker than the lifted panel in dark. */
.kl-join__panel .kl-btn--secondary { background: transparent; box-shadow: none; }
.kl-join__panel .kl-btn--secondary:not(:hover) { border-color: var(--kl-line-strong); }

.kl-join__side .kl-h3 { margin-bottom: 8px; }
.kl-join__links > li + li { border-top: 1px solid var(--kl-line); }
.kl-join__row { display: flex; align-items: center; gap: 16px; min-height: 48px; margin-inline: -10px; padding: 14px 10px; border-radius: 10px; } /* focus ring clears the text */
.kl-join__text { display: flex; flex-direction: column; flex: 1; min-width: 0; gap: 2px; }
.kl-join__name { font-weight: 600; font-size: 1.0625rem; line-height: 1.4; color: var(--kl-ink); transition: color var(--kl-t-fast) var(--kl-ease-std); }
.kl-join__sub { font-size: .875rem; line-height: 1.5; color: var(--kl-ink-3); }
.kl-join__go {
  display: grid; place-items: center; flex: none; width: 34px; height: 34px; border-radius: 50%;
  border: 1px solid var(--kl-line-strong); color: var(--kl-ink-2);
  transition: background-color var(--kl-t-fast) var(--kl-ease-std), border-color var(--kl-t-fast) var(--kl-ease-std), color var(--kl-t-fast) var(--kl-ease-std);
}
/* Keyboard focus gets the hover treatment; hover itself only where it exists (no sticky fill after a tap). */
.kl-join__row:focus-visible .kl-join__name { color: var(--kl-accent); }
.kl-join__row:focus-visible .kl-join__go { background: var(--kl-primary); border-color: var(--kl-primary); color: var(--kl-on-primary); }
.kl-join__row:focus-visible .kl-arrow { transform: translateX(2px); }
@media (hover: hover) {
  .kl-join__row:hover .kl-join__name { color: var(--kl-accent); }
  .kl-join__row:hover .kl-join__go { background: var(--kl-primary); border-color: var(--kl-primary); color: var(--kl-on-primary); }
  .kl-join__row:hover .kl-arrow { transform: translateX(2px); }
}

/* WeChat: the QR on a white tile (both themes), one frame only. The hosted image bakes a watermark into its bottom
   quiet zone (rows 240-248 of 258, below the last module row 239): clip it; the white tile shows through. */
.kl-join .kl-join__wechat { display: flex; align-items: center; gap: 20px; margin-top: 16px; padding: 12px; background-color: var(--kl-join-card); }
.kl-join__qr { flex: none; padding: 6px; border-radius: 10px; background: #fff; }
.kl-join__qr :deep(img) { width: 96px; height: 96px; clip-path: inset(0 0 7% 0); background-color: transparent !important; } /* no grey placeholder square on the white tile */

@media (max-width: 399px) {
  .kl-join .kl-join__wechat { gap: 16px; }
  .kl-join__qr :deep(img) { width: 84px; height: 84px; }
}
@media (max-width: 599px) {
  .kl-join__cta { align-self: stretch; }
  .kl-join__cta .kl-btn { flex: 1 1 auto; }
}
@media (min-width: 600px) and (max-width: 959px) {
  /* Rows | a centred QR card stretched to the rows' height (shared top and bottom edges). */
  .kl-join__side { display: grid; grid-template-columns: minmax(0, 1fr) auto; column-gap: 32px; }
  .kl-join__side .kl-h3 { grid-column: 1 / -1; }
  .kl-join .kl-join__wechat { flex-direction: column; justify-content: center; gap: 14px; margin-top: 0; padding: 16px; text-align: center; }
  .kl-join__wechat .kl-join__text { flex: none; }
}
@media (min-width: 960px) {
  .kl-join__grid { grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: clamp(40px, 5vw, 80px); }
}
</style>
