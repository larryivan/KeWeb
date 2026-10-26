// lib/reveal.ts — the v-reveal directive (spec §6.6).
//
//   <li v-reveal :style="{ '--i': n }">…</li>             default "rise" (opacity 0 + 16px → final)
//   <figure v-reveal.custom="{ threshold: 0.3 }">…</figure> custom: only the classes, your CSS decides
//
// - No-op when motion is not enabled (reduced motion, toggle off, ?kl-motion=off, SSR): the element
//   simply stays in its SSR final state; no class is ever added.
// - On mount (once the shell is mounted): at/above the fold → `is-in` immediately (no from-state);
//   below the fold → `kl-pre`, observed (threshold .15 by default), then `is-in` once.
// - When motion turns off, every registered element gets `is-in` (default rise: and loses `kl-pre`).
// - Stagger: set `--i` yourself in the template (SSR-rendered style); the default rise delay is
//   calc(var(--i, 0) * var(--kl-stagger, 60ms)).
// - The default rise animates ONLY `opacity` and the individual `translate` property (never `transform`),
//   so the element's own transforms (hover lifts, rotations) keep working. It owns the element's
//   `transition` only while it plays: `kl-pre` is removed when the opacity transition ends, after which
//   your own transition rules apply again. Do not set `opacity`/`translate` on a default-rise element;
//   use `.custom` (or reveal a wrapper) for that.
// - Custom: write from-states ONLY as `.your-class.kl-pre` and the motion as `.your-class.kl-pre.is-in`
//   (custom elements keep `kl-pre`). `.is-in` without `.kl-pre` means "already visible at mount" (or a
//   settled rise): render the final state.
import type { Directive, DirectiveBinding } from 'vue'
import { MOTION_KEY, activeMotion } from './useMotion.ts'
import type { MotionInternal } from './useMotion.ts'

export interface RevealValue {
  /** IntersectionObserver threshold (default 0.15). */
  threshold?: number
}

type Binding = DirectiveBinding<RevealValue | number | undefined>

const registered = new WeakMap<HTMLElement, MotionInternal>()

function findMotion(binding: Binding): MotionInternal | null {
  // Look the shell's provided state up through the using component's provides chain (descendants of
  // HomePage), falling back to the currently mounted HomePage.
  const inst = (binding.instance as unknown as { $?: { provides?: Record<symbol, unknown> } } | null)?.$
  const fromTree = inst?.provides?.[MOTION_KEY as symbol] as MotionInternal | undefined
  return fromTree ?? activeMotion()
}

function kind(binding: Binding): 'custom' | 'rise' {
  return binding.modifiers.custom ? 'custom' : 'rise'
}

export const vReveal: Directive<HTMLElement, RevealValue | number | undefined> = {
  mounted(el, binding) {
    const m = findMotion(binding)
    if (!m) return
    const v = binding.value
    const threshold = typeof v === 'object' && v && typeof v.threshold === 'number' ? v.threshold : 0.15
    el.setAttribute('data-reveal', kind(binding))
    registered.set(el, m)
    m._revealAdd(el, { threshold })
  },
  updated(el, binding) {
    // A dynamic :class on the same element rewrites className on patch; keep our attribute in place.
    // (State classes are re-added from the element's own record below.)
    if (!registered.has(el)) return
    if (el.getAttribute('data-reveal') !== kind(binding)) el.setAttribute('data-reveal', kind(binding))
    const st = (el as HTMLElement & { _klReveal?: { pre: boolean; in: boolean } })._klReveal
    if (st?.pre) el.classList.add('kl-pre')
    if (st?.in) el.classList.add('is-in')
  },
  beforeUpdate(el) {
    // Remember the state classes before Vue patches className.
    if (!registered.has(el)) return
    ;(el as HTMLElement & { _klReveal?: { pre: boolean; in: boolean } })._klReveal = {
      pre: el.classList.contains('kl-pre'),
      in: el.classList.contains('is-in'),
    }
  },
  beforeUnmount(el) {
    const m = registered.get(el)
    if (!m) return
    registered.delete(el)
    m._revealRemove(el)
  },
}

export default vReveal
