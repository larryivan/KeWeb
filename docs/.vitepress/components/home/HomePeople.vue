<script setup lang="ts">
// PEOPLE (#people) — kicker, H2; the PI (portrait on a soft offset plate, name, role, five-step path,
// three honours, profile link); then the team as "end credits": PhD / Master's / Undergrad. SSR = final state.
// Motion (once, v-reveal): the portrait fades in and, once its image is in, develops from greyscale while the
// plate slides out; the path line draws node to node and each dot pops as the line reaches it; the head,
// honours and names rise in short staggers.
import { onMounted, ref } from 'vue'
import { HOME, MEMBERS } from './home.content.ts'
import type { Member } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import { vReveal } from './lib/reveal.ts'
import { pi as portrait } from './img/index.ts'
import SectionHead from './ui/SectionHead.vue'
import Picture from './ui/Picture.vue'
import ArrowIcon from './ui/ArrowIcon.vue'

const { t, href, locale, otherLang } = useHome()
const P = HOME.people
const PI = P.pi
const zh = locale === 'zh'
// Role: break only between its parts (en at ", ", zh at the space), so "School of Life Sciences," never splits.
const ROLE = t(PI.role).split(zh ? ' ' : /(?<=,) /)
// zh: keep "马克斯·普朗克" whole and break only after it, never inside 人类 / 进化.
const MPI = '马克斯·普朗克'
const PATH = PI.path.map((s) => {
  const o = t(s.org)
  return { years: s.years, what: t(s.what), org: o.startsWith(MPI) && o.length > MPI.length ? [MPI, o.slice(MPI.length)] : [o] }
})
const GROUPS = (['phd', 'master', 'undergrad'] as const).map((id) => ({
  id, label: P.groups[id], members: MEMBERS.filter((m) => m.group === id),
}))
// On / the English name leads; on /zh/ the Chinese name leads. The other one is small, in its own lang.
const lead = (m: Member) => (zh ? m.name.zh : m.name.en)
const alt = (m: Member) => (zh ? m.name.en : m.name.zh)

// The colour "develop" waits for the photo (a slow image host shows the placeholder, then develops).
const fig = ref<HTMLElement>()
const loaded = ref(false)
onMounted(() => { if (fig.value?.querySelector('img')?.complete) loaded.value = true })
</script>

<template>
  <section id="people" class="kl-band kl-people" aria-labelledby="people-h">
    <div class="kl-container">
      <SectionHead id="people-h" :kicker="P.kicker" :title="P.h2" />

      <div class="kl-pi">
        <div ref="fig" v-reveal.custom class="kl-pi__fig" :class="{ 'is-loaded': loaded }"
             @load.capture="loaded = true" @error.capture="loaded = true">
          <Picture :pic="portrait" :alt="t(PI.portraitAlt)" sizes="(max-width: 639px) 92vw, 280px" object-position="50% 20%" />
        </div>
        <div v-reveal class="kl-pi__head" style="--i:0">
          <h3 class="kl-h3 kl-pi__name">{{ t(PI.name) }}</h3>
          <p class="kl-pi__role"><template v-for="(c, i) in ROLE" :key="i">{{ i ? ' ' : '' }}<span class="kl-nobr">{{ c }}</span></template></p>
        </div>
        <ol v-reveal.custom class="kl-path">
          <li v-for="(s, i) in PATH" :key="s.years" class="kl-path__step" :style="{ '--i': i }">
            <span class="kl-path__years">{{ s.years }}</span>
            <span class="kl-path__org"><template v-if="s.org[1]"><span class="kl-nobr">{{ s.org[0] }}</span><wbr></template>{{ s.org[s.org.length - 1] }}</span>
            <span class="kl-path__what">{{ s.what }}</span>
          </li>
        </ol>
        <div class="kl-pi__more">
          <h4 v-reveal class="kl-kicker kl-micro" style="--i:1">{{ t(PI.honoursLabel) }}</h4>
          <dl class="kl-hon">
            <div v-for="(h, i) in PI.honours" :key="h.years" v-reveal class="kl-hon__row" :style="{ '--i': i + 2 }">
              <dt class="kl-hon__years">{{ h.years }}</dt>
              <dd class="kl-hon__text">{{ t(h.text) }}</dd>
            </div>
          </dl>
        </div>
        <a v-reveal class="kl-link kl-pi__link" style="--i:4" :href="href(PI.link.href)">{{ t(PI.link) }}<ArrowIcon /></a>
      </div>

      <div class="kl-team">
        <h3 id="people-team" class="kl-h3">{{ t(P.teamLabel) }}</h3>
        <div class="kl-credits">
          <div v-for="(g, gi) in GROUPS" :key="g.id" :style="{ '--g': gi }">
            <h4 :id="`people-${g.id}`" class="kl-kicker kl-micro">{{ t(g.label) }}</h4>
            <ul :aria-labelledby="`people-${g.id}`">
              <li v-for="(m, i) in g.members" :key="m.id" v-reveal class="kl-credit" :style="{ '--n': i }">
                <span class="kl-credit__lead">{{ lead(m) }}</span> <span class="kl-credit__alt" :lang="otherLang()">{{ alt(m) }}</span>
              </li>
            </ul>
          </div>
        </div>
        <a class="kl-link" :href="href(P.link.href)">{{ t(P.link) }}<ArrowIcon /></a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.kl-people { --col:clamp(200px, 24vw + 8px, 280px); --gap:clamp(32px, 5vw, 72px); --rail:color-mix(in srgb, var(--kl-accent) 35%, transparent); }
.kl-people .kl-link { place-self:start; }
.kl-nobr { white-space:nowrap; }

/* ---- PI: portrait on a soft accent plate */
.kl-pi { display:grid; row-gap:28px; margin-top:clamp(36px, 4vw, 48px); }
.kl-pi__fig { position:relative; width:min(100% - 16px, 420px); margin-bottom:16px; }
.kl-pi__fig::before { content:''; position:absolute; inset:0; border-radius:var(--kl-radius); background:var(--kl-accent-soft); translate:16px 16px; }
.kl-pi__fig .kl-pic { position:relative; border-radius:var(--kl-radius); overflow:hidden; box-shadow:var(--kl-shadow); }
.kl-pi__fig :deep(img) { width:100%; aspect-ratio:1; object-fit:cover; }
.kl-pi .kl-pi__name { font-size:clamp(1.625rem, 1.3rem + 1vw, 2rem); line-height:1.2; font-weight:800; }
.kl-pi__role { margin-top:8px; font-size:1.0625rem; color:var(--kl-ink-2); }

.kl-people .kl-micro { color:var(--kl-ink-3); }
.kl-home--en .kl-micro { font-size:12px; }

.kl-pi__more { max-width:42rem; }
.kl-hon { margin-top:8px; }
.kl-hon__row { display:grid; align-items:baseline; padding:12px 0; border-top:1px solid var(--kl-line); }
.kl-hon__row:last-child { border-bottom:1px solid var(--kl-line); }
.kl-hon__years { font:13px var(--kl-mono); color:var(--kl-accent); }
.kl-hon__text { font-size:.9375rem; line-height:1.6; color:var(--kl-ink); text-wrap:pretty; }

/* ---- path: vertical below 960, horizontal above. Dot = ::before; ::after = the rail to the next dot. */
.kl-path { display:grid; row-gap:20px; --dir:180deg; --s0:1 0; }
.kl-path__step { position:relative; padding-left:30px; --d:calc(var(--i) * .24s); }
.kl-path__step > span { display:block; }
.kl-path__step::before {
  content:''; position:absolute; z-index:1; left:0; top:6.5px; width:11px; height:11px;
  border-radius:50%; background:var(--kl-bg); border:2px solid var(--kl-accent);
}
.kl-path__step::after { content:''; position:absolute; left:5px; top:12px; width:1px; height:calc(100% + 20px); background:var(--rail); transform-origin:0 0; }
.kl-path__step:last-child::before { background:var(--kl-accent); box-shadow:0 0 0 5px var(--kl-accent-soft); }
.kl-path__step:last-child::after { height:40px; background:linear-gradient(var(--dir), var(--rail), transparent); }
.kl-path__years { font:13px/24px var(--kl-mono); color:var(--kl-ink-3); }
.kl-path__step:last-child .kl-path__years { color:var(--kl-accent); }
.kl-path__org { font-size:.9375rem; line-height:1.45; font-weight:600; color:var(--kl-ink); text-wrap:balance; }
.kl-home--zh .kl-path__org { word-break:keep-all; overflow-wrap:anywhere; }
.kl-path__what { font-size:.875rem; line-height:1.5; color:var(--kl-ink-3); text-wrap:balance; }

/* ---- team: end credits. Wave index = row + group (--n + --g). */
.kl-team { display:grid; row-gap:24px; margin-top:clamp(56px, 6vw, 72px); padding-top:clamp(40px, 4vw, 48px); border-top:1px solid var(--kl-line); }
.kl-credits { display:grid; grid-template-columns:repeat(2, minmax(0, 1fr)); gap:32px 20px; --kl-stagger:45ms; }
.kl-credits ul { display:grid; row-gap:12px; margin-top:14px; }
.kl-credit { display:grid; line-height:1.4; --i:calc(var(--n) + var(--g)); }
.kl-credit__lead { font-weight:600; color:var(--kl-ink); }
.kl-credit__alt { font-size:.875rem; color:var(--kl-ink-3); }
.kl-home--zh .kl-credit__alt { font-size:.8125rem; }

/* phones: PhD | Master's over Undergrad (6 / 6); the undergrads' wave continues after the Master's names */
@media (max-width: 639px) {
  .kl-credits { grid-template-rows:auto auto; grid-auto-flow:column; }
  .kl-credits > :first-child { grid-row:span 2; }
  .kl-credits > :last-child ul { --g:6; }
}
@media (min-width: 640px) {
  .kl-pi { grid:"fig head" "fig more" 1fr "path path" "link link" / var(--col) minmax(0, 1fr); gap:0 var(--gap); }
  .kl-pi__fig { grid-area:fig; align-self:start; width:auto; margin:0; }
  .kl-pi__fig :deep(img) { aspect-ratio:4/5; }
  .kl-pi__head { grid-area:head; }
  .kl-pi__more { grid-area:more; align-self:end; padding-top:32px; }
  .kl-path { grid-area:path; margin-top:clamp(40px, 5vw, 56px); }
  .kl-pi__link { grid-area:link; margin-top:36px; }
  .kl-hon__row { grid-template-columns:96px 1fr; gap:0 16px; }
  .kl-credits { grid-template-columns:repeat(3, minmax(0, 1fr)); }
  .kl-credit__lead { font-size:1.0625rem; }
}
@media (min-width: 960px) {
  .kl-path { grid-template-columns:repeat(5, minmax(0, 1fr)); gap:0 24px; --dir:90deg; --s0:0 1; }
  .kl-path__step { padding:0; }
  .kl-path__years { margin-bottom:28px; }
  .kl-path__step::before { top:30px; }
  .kl-path__step::after { left:6px; top:35px; width:calc(100% + 24px); height:1px; }
  .kl-path__step:last-child::after { width:calc(100% - 6px); height:1px; }
  .kl-team { grid:auto 1fr / var(--col) minmax(0, 1fr); gap:12px var(--gap); }
  .kl-credits { grid-area:1 / 2 / 3; }
}
@media (min-width: 1200px) {
  .kl-credit { display:flex; flex-wrap:wrap; align-items:baseline; gap:0 .5em; }
}

/* ---- motion (custom reveals keep kl-pre; .kl-pre.is-in = final). Dots pop as the rail reaches them. */
.kl-pi__fig.kl-pre::before { translate:none; opacity:0; }
.kl-pi__fig.kl-pre .kl-pic { opacity:0; filter:grayscale(1); }
.kl-pi__fig.kl-pre.is-in::before { translate:16px 16px; opacity:1; transition:var(--kl-t-slower) var(--kl-ease-out) .25s; }
.kl-pi__fig.kl-pre.is-in .kl-pic { opacity:1; transition:opacity var(--kl-t-slow), filter 1.6s var(--kl-ease-inout) .15s; }
.kl-pi__fig.kl-pre.is-in.is-loaded .kl-pic { filter:none; }
.kl-path.kl-pre .kl-path__step::before { scale:0; }
.kl-path.kl-pre .kl-path__step::after { scale:var(--s0); }
.kl-path.kl-pre .kl-path__step > span { opacity:0; translate:0 8px; }
.kl-path.kl-pre.is-in .kl-path__step::before { scale:none; transition:scale .42s var(--kl-ease-back) calc(var(--d) + 60ms); }
.kl-path.kl-pre.is-in .kl-path__step::after { scale:none; transition:scale .24s linear calc(var(--d) + 60ms); }
.kl-path.kl-pre.is-in .kl-path__step > span { opacity:1; translate:none; transition:var(--kl-t-slow) var(--kl-ease-out) calc(var(--d) + 120ms); }
</style>
