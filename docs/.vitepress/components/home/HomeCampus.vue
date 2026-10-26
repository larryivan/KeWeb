<script setup lang="ts">
// CAMPUS (#campus) — v2 §5.3, spec §7.3. A full-bleed band photo (gate), a text card that overlaps the band's
// lower edge and a tilted postcard (ginkgo, never wider than 460 CSS px) on desktop; stacked below 960px.
// Motion (CSS, v-reveal, once): band clip-path reveal + gentle scale (desktop; rise on mobile), card rise,
// postcard settles from a steeper tilt. SSR / reduced motion = the final state.
import { HOME } from './home.content.ts'
import { useHome } from './lib/useHome.ts'
import { vReveal } from './lib/reveal.ts'
import { gate, ginkgo } from './img/index.ts'
import Picture from './ui/Picture.vue'
import SectionHead from './ui/SectionHead.vue'
import ArrowIcon from './ui/ArrowIcon.vue'

const { t, href, locale } = useHome()
const C = HOME.campus
const photo = (id: string) => C.photos.find((p) => p.id === id)!
const gatePhoto = photo('gate')
const ginkgoPhoto = photo('ginkgo')
// The body reads as two units (en "Department …, / School …"; zh "学院 / 系"). Each unit is an inline-block, so a
// line breaks between units first, and inside one only when that unit alone is wider than the line.
// Segments alternate unit / separator (' '), so the text, copy-paste and screen readers keep their spaces.
const body = t(C.body)
const units = /,\s+/.test(body)
  ? body.split(/,\s+/).map((s, i, a) => (i < a.length - 1 ? s + ',' : s))
  : locale === 'zh' ? body.split(/\s+/) : [body]
const bodySegs = units.flatMap((u, i) => (i ? [' ', u] : [u]))
</script>

<template>
  <section id="campus" class="kl-campus" aria-labelledby="campus-h">
    <div v-reveal.custom="{ threshold: 0.3 }" class="kl-campus__band">
      <Picture :pic="gate" :alt="t(gatePhoto.alt)" sizes="(max-width: 599px) 120vw, 100vw"
               :object-position="gatePhoto.focal" img-class="kl-campus__img" />
    </div>
    <div class="kl-container kl-campus__grid">
      <div v-reveal class="kl-campus__card">
        <SectionHead id="campus-h" :kicker="C.kicker" :title="C.h2" />
        <p class="kl-lede kl-campus__body">
          <template v-for="(seg, i) in bodySegs" :key="i"><span v-if="i % 2 === 0">{{ seg }}</span><template v-else>{{ seg }}</template></template>
        </p>
        <a class="kl-link kl-campus__link" :href="href(C.link.href)">{{ t(C.link) }}<ArrowIcon /></a>
      </div>
      <div v-reveal.custom class="kl-campus__postcard">
        <Picture :pic="ginkgo" :alt="t(ginkgoPhoto.alt)" sizes="(max-width: 639px) 86vw, 440px"
                 img-class="kl-campus__img" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.kl-campus {
  /* (compact: custom property values are not minified) */
  --lift:0 1px 2px rgba(15,23,42,.04),0 20px 48px -20px rgba(15,23,42,.16);
  --print:0 1px 2px rgba(15,23,42,.06),0 18px 40px -14px rgba(15,23,42,.26);
  position: relative; padding-bottom: var(--kl-section-y);
}
.dark .kl-campus {
  --lift:0 1px 2px rgba(0,0,0,.3),0 20px 48px -20px rgba(0,0,0,.55);
  --print:0 1px 2px rgba(0,0,0,.3),0 18px 40px -14px rgba(0,0,0,.6);
}

/* Band: full-bleed. The picture overscans by 4px so the sources' hairline frame never shows. */
.kl-campus__band { position: relative; overflow: hidden; aspect-ratio: 4 / 3; }
.kl-campus__band > .kl-pic { position: absolute; inset: -4px; }
.kl-campus__band :deep(.kl-campus__img) { width: 100%; height: 100%; max-width: none; object-fit: cover; }

.kl-campus__grid { position: relative; z-index: 1; display: grid; gap: 40px; padding-top: 36px; }
.kl-campus__body { margin-top: 16px; }
.kl-campus__body > span { display: inline-block; text-wrap: balance; }
/* 44px hit area for the section's only action, without moving it or growing its focus ring. */
.kl-campus__link { position: relative; margin-top: 20px; }
.kl-campus__link::before { content: ""; position: absolute; inset: -9px -4px; }

/* Postcard: a print with a surface border, tilted. The resting tilt is on `transform`, so it holds without the
   individual transform properties; the reveal animates `rotate`/`translate` on top. The picture crops the
   source's 1px frame. */
.kl-campus__postcard {
  justify-self: center; width: min(86%, 460px); box-sizing: border-box; padding: 10px;
  background: var(--kl-surface); border-radius: 3px; transform: rotate(-2deg); box-shadow: var(--print);
}
.kl-campus__postcard > .kl-pic { overflow: hidden; border-radius: 1px; }
.kl-campus__postcard :deep(.kl-campus__img) { width: 100%; transform: scale(1.016); }
.dark .kl-campus__postcard { background: color-mix(in srgb, var(--kl-surface) 90%, #fff); }

@media (min-width: 600px) {
  .kl-campus__band { aspect-ratio: 16 / 9; }
}
@media (min-width: 640px) and (max-width: 959px) {
  .kl-campus__grid { grid-template-columns: minmax(0, 1fr) min(44%, 400px); align-items: start; padding-top: 44px; }
  .kl-campus__postcard { justify-self: end; width: 100%; margin-top: -88px; }
}

@media (min-width: 960px) {
  /* Never taller than 2:1 (tall portrait screens), so the photo is cropped by height, never by width. */
  .kl-campus__band { aspect-ratio: auto; height: clamp(360px, min(max(62vh, 36vw), 50vw), 920px); }
  /* Card and postcard share the bottom edge. The card sets the row (overlapping the band by 96px); the
     postcard's -100% margin keeps it out of the row height, so it rises into the band by its extra height. */
  .kl-campus__grid {
    grid-template-columns: min(34rem, 56%) min(460px, 44% - 48px); justify-content: space-between;
    align-items: end; gap: 0; padding-top: 0;
  }
  .kl-campus__card {
    margin-top: -96px; padding: clamp(32px, 3vw, 44px); border: 1px solid var(--kl-line); border-radius: var(--kl-radius);
    background: var(--kl-surface); box-sizing: border-box; box-shadow: var(--lift);
  }
  .kl-campus__link { margin-top: 28px; }
  .kl-campus__postcard { justify-self: end; width: 100%; margin-top: -100%; }

  /* Band reveal: an inset, rounded frame opens to full bleed while the photo eases back from 1.08. Both start
     together; the frame leads, the photo keeps settling after it. */
  .kl-campus__band.kl-pre { clip-path: inset(6% 8% round 24px); }
  .kl-campus__band.kl-pre :deep(.kl-campus__img) { scale: 1.08; }
  .kl-campus__band.kl-pre.is-in { clip-path: inset(0 round 0); transition: clip-path 1.2s cubic-bezier(.3, .1, .1, 1); }
  .kl-campus__band.kl-pre.is-in :deep(.kl-campus__img) { scale: 1; transition: scale 1.6s cubic-bezier(.25, .1, .2, 1); }
}

@media (max-width: 959px) {
  .kl-campus__band.kl-pre { opacity: 0; translate: 0 24px; }
  .kl-campus__band.kl-pre.is-in {
    opacity: 1; translate: none;
    transition: opacity var(--kl-t-slow) var(--kl-ease-out), translate var(--kl-t-slow) var(--kl-ease-out);
  }
}

/* Postcard: drops in (quint-out), then the extra 3deg of tilt resolves over a longer, softer cubic-out. */
.kl-campus__postcard.kl-pre { opacity: 0; translate: 0 40px; rotate: -3deg; }
.kl-campus__postcard.kl-pre.is-in {
  opacity: 1; translate: none; rotate: 0deg;
  transition: opacity var(--kl-t-slow) var(--kl-ease-out) 200ms, translate var(--kl-t-slower) cubic-bezier(.22, 1, .36, 1) 200ms,
    rotate 1.2s cubic-bezier(.33, 1, .68, 1) 200ms;
}
</style>
