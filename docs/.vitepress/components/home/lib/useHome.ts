// lib/useHome.ts — locale context for every homepage component (spec §6.3).
// provideHome() is called once by HomePage.vue; sections call useHome().
import { inject, provide } from 'vue'
import type { InjectionKey } from 'vue'
import type { L, Locale } from '../home.content.ts'
import { fill } from './derive.ts'

export interface HomeCtx {
  locale: Locale
  /** Pick the current locale's string from an { en, zh } pair. */
  t: (x: L) => string
  /** Same for non-string pairs (arrays: h1 lines, courses). */
  tl: <T>(x: { en: T; zh: T }) => T
  /** Internal path → locale path. '#…', 'http…', 'mailto:…' unchanged; zh: '/zh' + path. */
  href: (path: string) => string
  /** en: 1001 → '1,001' (regex grouping); zh: '1001'. No Intl (identical on server and client). */
  fmt: (n: number) => string
  fill: typeof fill
  /** lang attribute for fragments in the other locale: 'zh-CN' on /, 'en' on /zh/. */
  otherLang: () => 'en' | 'zh-CN'
}

export const HOME_KEY: InjectionKey<HomeCtx> = Symbol('kl-home')

export function createHome(locale: Locale): HomeCtx {
  const zh = locale === 'zh'
  return {
    locale,
    t: (x) => (zh ? x.zh : x.en),
    tl: (x) => (zh ? x.zh : x.en),
    href: (path) => {
      if (/^(#|[a-z][a-z0-9+.-]*:|\/\/)/i.test(path)) return path // '#…', 'http(s):…', 'mailto:…', '//…'
      if (!zh) return path
      const p = path.startsWith('/') ? path : '/' + path
      return p.startsWith('/zh/') || p === '/zh' ? p : '/zh' + p
    },
    fmt: (n) => {
      const s = String(Math.round(n))
      return zh ? s : s.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    },
    fill,
    otherLang: () => (zh ? 'en' : 'zh-CN'),
  }
}

/** Shell only (HomePage.vue). */
export function provideHome(locale: Locale): HomeCtx {
  const ctx = createHome(locale)
  provide(HOME_KEY, ctx)
  return ctx
}

export function useHome(): HomeCtx {
  const ctx = inject(HOME_KEY, null)
  if (!ctx) throw new Error('useHome: no HomePage')
  return ctx
}
