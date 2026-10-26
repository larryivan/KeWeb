// lib/useMotion.ts — the ONLY place GSAP is loaded (spec §6.6).
//
// - provideMotion(root) is called once by HomePage.vue; sections call useMotion() / useScene().
// - SSR = final state: `attr` is 'ssr' on the server AND on the client until the shell has mounted,
//   so hydration is identical. After mount it is 'on' or 'off' (root data-motion attribute).
// - GSAP core + ScrollTrigger + DrawSVGPlugin are dynamically imported on idle, after mount, and only
//   while `enabled` (never under reduced motion, Save-Data, the user toggle or ?kl-motion=off).
// - Scenes (useScene) build inside gsap.context(fn, el) once enabled && gsapReady, and are reverted on
//   unmount, when `enabled` turns false, and before a rebuild when the 960px breakpoint flips.
// - Never import 'gsap' statically anywhere else (type-only imports are fine).
// - Timing: Vue runs child onMounted hooks BEFORE the parent's, so the shell cannot be the one that reads
//   the client state. The state "boots" (client detection, mounted=true) in the FIRST mounted hook of the
//   page: useMotion() and useScene() register a boot hook on the calling component before its own hooks, so
//   `enabled` / `lite` / `reducedOS` are already correct inside that component's onMounted. The DOM is fully
//   hydrated by then (mounted hooks are post-flush; template refs are set before any of them).
import { computed, getCurrentInstance, inject, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import type { InjectionKey, Ref } from 'vue'

type GsapNS = typeof import('gsap').gsap
type ScrollTriggerNS = typeof import('gsap/ScrollTrigger').ScrollTrigger
type GsapContext = ReturnType<GsapNS['context']>

export interface MotionState {
  /** For data-motion on the root: 'ssr' until mounted, then 'on' | 'off'. */
  attr: Ref<'ssr' | 'on' | 'off'>
  /** mounted && !reducedOS && !saveData && pref !== 'off' (or forced by ?kl-motion=on|off). */
  enabled: Ref<boolean>
  /** WeChat/X5/QQ UA, deviceMemory < 4, or Save-Data (or ?kl-motion=lite) → canvases OFF, posters shown. */
  lite: Ref<boolean>
  /** OS-level prefers-reduced-motion: reduce (live). */
  reducedOS: Ref<boolean>
  /** GSAP + plugins loaded and registered. */
  gsapReady: Ref<boolean>
  /** The user's choice from the toggle ('auto' | 'off'), persisted in localStorage 'kl-motion'. */
  pref: Ref<'auto' | 'off'>
  /** False on the server and during hydration; true once the client state is known (see onReady). */
  ready: Readonly<Ref<boolean>>
  /** Run cb once the client state is known: immediately if it already is, else right after boot (client
   *  only; never on the server). Safe anywhere, e.g. from a plain module that was handed `motion`. */
  onReady(cb: () => void): void
  /** Flip motion: currently on → pref 'off'; currently off → pref 'auto'. Saved to localStorage 'kl-motion'
   *  (try/catch); clears a ?kl-motion URL override. */
  toggle(): void
  /** Subscribe to "motion just turned off" (canvases stop immediately). Returns the unsubscribe fn. */
  onOff(cb: () => void): () => void
}

export interface SceneApi {
  gsap: GsapNS
  ScrollTrigger: ScrollTriggerNS
  /** matchMedia('(min-width: 960px)') at build time (scenes are rebuilt when it flips). */
  isDesktop: boolean
  belowFold(el: Element): boolean
  /** Debounced (150 ms) ScrollTrigger.refresh(). */
  refresh(): void
}

export type SceneBuild = (api: SceneApi) => void | (() => void)

interface Scene {
  el: Ref<HTMLElement | null>
  build: SceneBuild
  ctx: GsapContext | null
  cleanup: (() => void) | null
}

export interface RevealOpts { threshold: number }

/** Internal shape (also used by lib/reveal.ts). Sections should only rely on MotionState. */
export interface MotionInternal extends MotionState {
  _boot(): void
  _addScene(s: Scene): void
  _removeScene(s: Scene): void
  _revealAdd(el: HTMLElement, opts: RevealOpts): void
  _revealRemove(el: HTMLElement): void
}

export const MOTION_KEY: InjectionKey<MotionInternal> = Symbol('kl-motion')

/** The motion state of the currently mounted HomePage (client only; fallback for the directive). */
let active: MotionInternal | null = null
export function activeMotion(): MotionInternal | null {
  return active
}

/** True when the element's top is below the viewport at call time (client only). */
export function belowFold(el: Element): boolean {
  return el.getBoundingClientRect().top > window.innerHeight
}

const LITE_UA = /MicroMessenger|XWEB|TBS\/|MQQBrowser/i
const STORE_KEY = 'kl-motion'

/** Shell only (HomePage.vue). */
export function provideMotion(root: Ref<HTMLElement | null>): MotionState {
  const mounted = ref(false)
  const reducedOS = ref(false)
  const saveData = ref(false)
  const liteEnv = ref(false)
  const pref = ref<'auto' | 'off'>('auto')
  const override = ref<null | 'on' | 'off' | 'lite'>(null)
  const gsapReady = ref(false)

  const enabled = computed(() => {
    if (!mounted.value) return false
    if (override.value === 'on') return true
    if (override.value === 'off') return false
    return !reducedOS.value && !saveData.value && pref.value !== 'off'
  })
  const lite = computed(() => {
    if (!mounted.value || override.value === 'on') return false
    return override.value === 'lite' || liteEnv.value || saveData.value
  })
  const attr = computed<'ssr' | 'on' | 'off'>(() => (!mounted.value ? 'ssr' : enabled.value ? 'on' : 'off'))

  // ---------------------------------------------------------------- GSAP
  let G: { gsap: GsapNS; ScrollTrigger: ScrollTriggerNS } | null = null
  let idleHandle: number | null = null
  let idleIsRic = false
  let loading = false
  let disposed = false

  function scheduleLoad() {
    if (G || loading || idleHandle !== null || disposed) return
    const run = () => {
      idleHandle = null
      if (!enabled.value || disposed || G || loading) return
      loading = true
      Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/DrawSVGPlugin')])
        .then(([g, st, ds]) => {
          loading = false
          if (disposed) return
          const gsap = g.gsap
          gsap.registerPlugin(st.ScrollTrigger, ds.DrawSVGPlugin)
          st.ScrollTrigger.config({ ignoreMobileResize: true })
          G = { gsap, ScrollTrigger: st.ScrollTrigger }
          gsapReady.value = true
          if (enabled.value) buildAll()
        })
        .catch((e) => {
          loading = false
          console.warn('[kl-motion] gsap load failed', e)
        })
    }
    const w = window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number }
    if (typeof w.requestIdleCallback === 'function') {
      idleIsRic = true
      idleHandle = w.requestIdleCallback(run, { timeout: 1500 })
    } else {
      idleIsRic = false
      idleHandle = window.setTimeout(run, 300)
    }
  }
  function cancelLoad() {
    if (idleHandle === null) return
    const w = window as Window & { cancelIdleCallback?: (h: number) => void }
    if (idleIsRic && typeof w.cancelIdleCallback === 'function') w.cancelIdleCallback(idleHandle)
    else window.clearTimeout(idleHandle)
    idleHandle = null
  }

  let refreshTimer: number | null = null
  function refresh() {
    if (refreshTimer !== null) window.clearTimeout(refreshTimer)
    refreshTimer = window.setTimeout(() => {
      refreshTimer = null
      if (G && !disposed) G.ScrollTrigger.refresh()
    }, 150)
  }

  // ---------------------------------------------------------------- scenes
  const scenes = new Set<Scene>()
  let desktopMq: MediaQueryList | null = null

  function buildScene(s: Scene) {
    if (!G || !enabled.value || s.ctx || !s.el.value) return
    const api: SceneApi = {
      gsap: G.gsap,
      ScrollTrigger: G.ScrollTrigger,
      isDesktop: !!desktopMq?.matches,
      belowFold,
      refresh,
    }
    let cleanup: (() => void) | null = null
    try {
      s.ctx = G.gsap.context(() => {
        const r = s.build(api)
        if (typeof r === 'function') cleanup = r
      }, s.el.value)
    } catch (e) {
      console.error('[kl-motion] build', e)
    }
    s.cleanup = cleanup
  }
  function revertScene(s: Scene) {
    const c = s.cleanup
    s.cleanup = null
    if (c) {
      try { c() } catch (e) { console.error('[kl-motion] cleanup', e) }
    }
    if (s.ctx) {
      try { s.ctx.revert() } catch (e) { console.error('[kl-motion] revert', e) }
      s.ctx = null
    }
  }
  function buildAll() {
    for (const s of scenes) buildScene(s)
    refresh()
  }
  function revertAll() {
    for (const s of scenes) revertScene(s)
  }

  // ---------------------------------------------------------------- reveal registry (v-reveal)
  const revealEls = new Map<HTMLElement, RevealOpts>()
  const observers = new Map<number, IntersectionObserver>()
  const settling = new Map<HTMLElement, () => void>()

  const isRise = (el: HTMLElement) => el.getAttribute('data-reveal') === 'rise'

  /** Default rise only: once its opacity transition has ended, drop `kl-pre`, so the element's own
   *  transition / transform rules (e.g. a hover lift) apply again. `.is-in` alone has no styles. */
  function settle(el: HTMLElement) {
    if (!isRise(el) || settling.has(el)) return
    let timer = 0
    const done = () => {
      el.removeEventListener('transitionend', onEnd)
      el.removeEventListener('transitioncancel', onEnd)
      window.clearTimeout(timer)
      settling.delete(el)
      el.classList.remove('kl-pre')
    }
    const onEnd = (e: Event) => {
      if (e.target === el && (e as TransitionEvent).propertyName === 'opacity') done()
    }
    el.addEventListener('transitionend', onEnd)
    el.addEventListener('transitioncancel', onEnd)
    timer = window.setTimeout(done, 4000) // no transitionend (hidden, transitions disabled …)
    settling.set(el, done)
  }

  function observerFor(t: number): IntersectionObserver {
    let io = observers.get(t)
    if (io) return io
    const thresholds = [...new Set([0, 0.02, 0.05, 0.1, t])].sort((a, b) => a - b)
    io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue
        const vh = e.rootBounds?.height || window.innerHeight
        if (e.intersectionRatio >= t || e.intersectionRect.height >= vh * 0.25) {
          const el = e.target as HTMLElement
          el.classList.add('is-in')
          io!.unobserve(el)
          settle(el)
        }
      }
    }, { threshold: thresholds })
    observers.set(t, io)
    return io
  }
  function processReveal(el: HTMLElement) {
    const o = revealEls.get(el)
    if (!o || !enabled.value) return // no-op when motion is off: the element stays in its final state
    if (el.classList.contains('is-in') || el.classList.contains('kl-pre')) return
    if (!belowFold(el)) { el.classList.add('is-in'); return }
    el.classList.add('kl-pre')
    observerFor(o.threshold).observe(el)
  }
  function showAll() {
    for (const io of observers.values()) io.disconnect()
    observers.clear()
    for (const done of [...settling.values()]) done()
    for (const el of revealEls.keys()) {
      el.classList.add('is-in')
      if (isRise(el)) el.classList.remove('kl-pre') // custom reveals keep kl-pre: `.x.kl-pre.is-in` = final
    }
  }

  // ---------------------------------------------------------------- off / ready subscribers
  const offSubs = new Set<() => void>()
  let readySubs: Array<() => void> = []

  // ---------------------------------------------------------------- lifecycle (client only)
  const cleanups: Array<() => void> = []
  const listen = (t: EventTarget, type: string, fn: EventListener, opts?: AddEventListenerOptions | boolean) => {
    t.addEventListener(type, fn, opts)
    cleanups.push(() => t.removeEventListener(type, fn, opts))
  }

  /** Read the client state once, in the FIRST mounted hook of the page (idempotent). */
  let booted = false
  function boot() {
    if (booted || disposed) return
    booted = true
    active = state
    const q = new URLSearchParams(window.location.search).get('kl-motion')
    if (q === 'on' || q === 'off' || q === 'lite') override.value = q
    try {
      if (window.localStorage.getItem(STORE_KEY) === 'off') pref.value = 'off'
    } catch { /* storage blocked */ }

    const rm = window.matchMedia('(prefers-reduced-motion: reduce)')
    reducedOS.value = rm.matches
    listen(rm, 'change', () => { reducedOS.value = rm.matches })

    const nav = navigator as Navigator & { connection?: { saveData?: boolean }; deviceMemory?: number }
    saveData.value = nav.connection?.saveData === true
    liteEnv.value = LITE_UA.test(nav.userAgent) || (typeof nav.deviceMemory === 'number' && nav.deviceMemory < 4)

    desktopMq = window.matchMedia('(min-width: 960px)')
    listen(desktopMq, 'change', () => {
      revertAll()
      if (G && enabled.value) buildAll()
    })

    mounted.value = true // → enabled / attr / lite now reflect the client (computeds re-evaluate on read)

    for (const el of revealEls.keys()) processReveal(el)
    if (enabled.value) scheduleLoad()

    // Refresh ScrollTrigger once fonts are in (the img-load listener is attached in the shell's onMounted).
    document.fonts?.ready.then(() => { if (!disposed) refresh() }).catch(() => {})

    const subs = readySubs
    readySubs = []
    for (const cb of subs) {
      try { cb() } catch (e) { console.error('[kl-motion] onReady', e) }
    }
  }

  const state: MotionInternal = {
    attr,
    enabled,
    lite,
    reducedOS,
    gsapReady,
    pref,
    ready: computed(() => mounted.value),
    toggle() {
      // Flip the EFFECTIVE state: on → 'off'; off → 'auto' (a URL override is cleared).
      const turnOff = enabled.value
      override.value = null
      pref.value = turnOff ? 'off' : 'auto'
      try {
        if (pref.value === 'off') window.localStorage.setItem(STORE_KEY, 'off')
        else window.localStorage.removeItem(STORE_KEY)
      } catch { /* storage blocked: the choice lasts for this page view */ }
    },
    onOff(cb) {
      offSubs.add(cb)
      return () => { offSubs.delete(cb) }
    },
    onReady(cb) {
      if (disposed) return
      if (mounted.value) cb()
      else readySubs.push(cb)
    },
    _boot: boot,
    _addScene(s) {
      scenes.add(s)
      if (G && enabled.value) { buildScene(s); refresh() }
    },
    _removeScene(s) {
      revertScene(s)
      scenes.delete(s)
    },
    _revealAdd(el, opts) {
      revealEls.set(el, opts)
      if (mounted.value) processReveal(el)
    },
    _revealRemove(el) {
      revealEls.delete(el)
      settling.get(el)?.()
      for (const io of observers.values()) io.unobserve(el)
    },
  }

  provide(MOTION_KEY, state)

  onMounted(() => {
    boot() // no-op when a section already booted (the usual case)
    if (root.value) {
      listen(root.value, 'load', (e) => { if ((e.target as Element)?.tagName === 'IMG') refresh() }, true)
    }
  })

  watch(enabled, (on, was) => {
    if (on) {
      scheduleLoad()
      if (G) buildAll()
      for (const el of revealEls.keys()) processReveal(el)
    } else if (was) {
      cancelLoad()
      for (const cb of [...offSubs]) {
        try { cb() } catch (e) { console.error('[kl-motion] onOff', e) }
      }
      revertAll()
      showAll()
    }
  })

  onBeforeUnmount(() => {
    disposed = true
    cancelLoad()
    if (refreshTimer !== null) window.clearTimeout(refreshTimer)
    revertAll()
    scenes.clear()
    for (const io of observers.values()) io.disconnect()
    observers.clear()
    for (const done of [...settling.values()]) done()
    revealEls.clear()
    offSubs.clear()
    readySubs = []
    for (const c of cleanups.splice(0)) c()
    if (active === state) active = null
  })

  return state
}

/** Register the boot hook on the calling component, before its own onMounted hooks (see the header). */
function bootOnMount(m: MotionInternal) {
  if (getCurrentInstance()) onMounted(m._boot)
}

/**
 * The page's motion state. Call it at the top of <script setup> (before your own onMounted): then
 * `enabled`, `lite` and `reducedOS` already hold the client values inside your onMounted.
 */
export function useMotion(): MotionState {
  const m = inject(MOTION_KEY, null)
  if (!m) throw new Error('useMotion: no HomePage')
  bootOnMount(m)
  return m
}

/**
 * Register a GSAP scene. `build` runs inside gsap.context(fn, el.value) once motion is enabled and GSAP
 * is ready (client only, after mount). Return an optional cleanup fn. Everything created inside
 * (tweens, ScrollTriggers) is reverted on unmount, motion-off and 960px breakpoint flips, after which
 * the DOM must be back in its SSR final state.
 */
export function useScene(el: Ref<HTMLElement | null>, build: SceneBuild): void {
  const m = inject(MOTION_KEY, null)
  if (!m) return
  bootOnMount(m)
  const s: Scene = { el, build, ctx: null, cleanup: null }
  onMounted(() => m._addScene(s))
  onBeforeUnmount(() => m._removeScene(s))
}
