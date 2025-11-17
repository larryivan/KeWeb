<template>
  <section class="pub-section">
    <header class="pub-hero">
      <div class="tools">
        <label class="search">
          <span class="sr-only">{{ t.searchLabel }}</span>
          <input
            v-model.trim="query"
            :placeholder="t.searchPlaceholder"
            type="search"
          />
        </label>
        <button class="ghost-btn" type="button" @click="refresh" :disabled="loading">
          <span v-if="loading">{{ t.refreshing }}</span>
          <span v-else>{{ t.refresh }}</span>
        </button>
      </div>
      <p v-if="lastUpdated" class="meta">
        {{ t.lastUpdated }} {{ lastUpdated }}
      </p>
    </header>

    <div v-if="loading" class="state-grid">
      <div v-for="n in 6" :key="n" class="card skeleton"></div>
    </div>

    <div v-else-if="error" class="state-message error">
      <p>{{ error }}</p>
      <button class="primary-btn" type="button" @click="refresh">
        {{ t.retry }}
      </button>
    </div>

    <template v-else>
      <div v-if="typeOptions.length > 1" class="filters">
        <button
          v-for="type in typeOptions"
          :key="type"
          :class="['filter-pill', { active: activeType === type }]"
          @click="activeType = type"
          type="button"
        >
          {{ type === 'all' ? t.allTypes : resolveTypeLabel(type) }}
        </button>
      </div>

      <ul v-if="visibleWorks.length" class="publication-list">
        <li v-for="item in visibleWorks" :key="item.id" class="card simple">
          <div class="card-head">
            <span class="year">{{ item.year || t.noYear }}</span>
            <span class="type-pill">{{ resolveTypeLabel(item.type) }}</span>
          </div>
          <h3 class="card-title">
            <a v-if="item.url" :href="item.url" target="_blank" rel="noopener">
              {{ item.title }}
            </a>
            <span v-else>{{ item.title }}</span>
          </h3>

          <ul v-if="item.authors.length" class="authors">
            <li
              v-for="author in item.authors"
              :key="`${item.id}-${author.name}`"
              :class="{ highlight: author.highlight }"
            >
              {{ author.name }}
            </li>
          </ul>

          <p class="journal" v-if="item.journal">{{ item.journal }}</p>
          <p class="date" v-if="item.displayDate">{{ item.displayDate }}</p>

          <div class="card-footer" v-if="item.doi || item.url">
            <a
              :href="item.doi ? `https://doi.org/${item.doi}` : item.url"
              class="link"
              target="_blank"
              rel="noopener"
            >
              {{ item.doi ? `DOI: ${item.doi}` : t.readMore }}
            </a>
          </div>
        </li>
      </ul>

      <div v-else class="state-message">
        <p>{{ t.noResults }}</p>
      </div>

      <div v-if="visibleWorks.length && visibleWorks.length < filteredWorks.length" class="load-more">
        <button class="primary-btn" type="button" @click="visibleCount += LOAD_STEP">
          {{ t.loadMore }}
        </button>
      </div>
    </template>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";

const ORCID_ID = "0000-0003-3935-8344";
const ORCID_WORKS_API = `https://pub.orcid.org/v3.0/${ORCID_ID}/works`;
const ORCID_WORK_API = `https://pub.orcid.org/v3.0/${ORCID_ID}/work`;
const ORCID_UI_URL = `https://orcid.org/${ORCID_ID}`;
const LOAD_STEP = 12;

type Locale = "en" | "zh";

interface WorkItem {
  id: string;
  title: string;
  journal: string;
  displayDate: string;
  year: number;
  url: string;
  type: string;
  doi?: string;
  authors: Author[];
}

interface Author {
  name: string;
  highlight: boolean;
}

const props = withDefaults(
  defineProps<{
    locale?: Locale;
    initialVisible?: number;
  }>(),
  {
    locale: "en",
    initialVisible: 18,
  }
);

const TEXT_MAP: Record<Locale, Record<string, string>> = {
  en: {
    eyebrow: "Live feed",
    title: "Recent Publications",
    subtitle: "Data synced from",
    lastUpdated: "Last synced from ORCID:",
    searchLabel: "Search publications",
    searchPlaceholder: "Search title, journal, DOI...",
    refreshing: "Syncing...",
    refresh: "Refresh now",
    retry: "Try again",
    readMore: "Read article",
    noResults: "No publications match your filters.",
    loadMore: "Load more",
    allTypes: "All types",
    noYear: "NA",
  },
  zh: {
    eyebrow: "实时更新",
    title: "最新发表成果",
    subtitle: "数据来源：",
    lastUpdated: "最近同步（自ORCID）：",
    searchLabel: "搜索成果",
    searchPlaceholder: "搜索标题、期刊或 DOI…",
    refreshing: "正在同步…",
    refresh: "立即刷新",
    retry: "重新尝试",
    readMore: "查看详情",
    noResults: "没有符合条件的成果。",
    loadMore: "加载更多",
    allTypes: "全部类型",
    noYear: "—",
  },
};

const TYPE_LABELS: Record<string, { en: string; zh: string }> = {
  "journal-article": { en: "Journal Article", zh: "期刊论文" },
  "book-chapter": { en: "Book Chapter", zh: "书籍章节" },
  "book-review": { en: "Book Review", zh: "书评" },
  "book": { en: "Book", zh: "书籍" },
  dissertation: { en: "Dissertation", zh: "学位论文" },
  "conference-paper": { en: "Conference Paper", zh: "会议论文" },
  "report": { en: "Report", zh: "报告" },
  "preprint": { en: "Preprint", zh: "预印本" },
  "magazine-article": { en: "Magazine Article", zh: "杂志文章" },
  "other": { en: "Other", zh: "其他" },
};

const works = ref<WorkItem[]>([]);
const loading = ref(true);
const error = ref("");
const query = ref("");
const activeType = ref("all");
const visibleCount = ref(props.initialVisible);
const lastUpdated = ref("");

const t = computed(() => TEXT_MAP[props.locale] || TEXT_MAP.en);
const typeOptions = computed(() => {
  const unique = new Set(works.value.map((item) => item.type).filter(Boolean));
  return ["all", ...Array.from(unique)];
});

const filteredWorks = computed(() => {
  const search = query.value.toLowerCase();
  return works.value.filter((item) => {
    const matchesType = activeType.value === "all" || item.type === activeType.value;
    const matchesQuery =
      !search ||
      item.title.toLowerCase().includes(search) ||
      item.journal.toLowerCase().includes(search) ||
      (item.doi && item.doi.toLowerCase().includes(search)) ||
      item.authors.some((author) => author.name.toLowerCase().includes(search));
    return matchesType && matchesQuery;
  });
});

const visibleWorks = computed(() => filteredWorks.value.slice(0, visibleCount.value));

function resolveTypeLabel(type: string) {
  const lower = type?.toLowerCase();
  const label = TYPE_LABELS[lower];
  if (!label) return type || (props.locale === "zh" ? "其他" : "Other");
  return label[props.locale] || label.en;
}

async function fetchWorks() {
  loading.value = true;
  error.value = "";
  try {
    const response = await fetch(ORCID_WORKS_API, {
      headers: {
        Accept: "application/json",
      },
    });
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    const payload = await response.json();
    const summaries = collectSummaries(payload);
    const detailMap = await fetchWorkDetails(summaries);
    works.value = parseWorks(summaries, detailMap);
    lastUpdated.value = new Intl.DateTimeFormat(props.locale === "zh" ? "zh-CN" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
    visibleCount.value = props.initialVisible;
  } catch (err: unknown) {
    const fallbackMsg =
      props.locale === "zh" ? "无法获取 ORCID 数据。" : "Unable to fetch ORCID data.";
    error.value = (err as Error)?.message
      ? `${fallbackMsg} (${(err as Error).message})`
      : fallbackMsg;
  } finally {
    loading.value = false;
  }
}

function collectSummaries(payload: any) {
  const groups = payload?.group ?? [];
  const summaries: any[] = [];
  groups.forEach((group: any) => {
    const list = group?.["work-summary"] ?? [];
    list.forEach((summary: any) => summaries.push(summary));
  });
  return summaries;
}

async function fetchWorkDetails(summaries: any[]) {
  const map = new Map<string, any>();
  const headers = { Accept: "application/json" };
  const requests = summaries.map((summary) => {
    const putCode = summary?.["put-code"] ?? summary?.putCode;
    if (!putCode) return null;
    const url = `${ORCID_WORK_API}/${putCode}`;
    return fetch(url, { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => ({ id: String(putCode), detail: json }))
      .catch(() => null);
  });

  const settled = await Promise.allSettled(requests.filter(Boolean) as Promise<any>[]);
  settled.forEach((result) => {
    if (result.status === "fulfilled" && result.value?.id) {
      map.set(result.value.id, result.value.detail);
    }
  });
  return map;
}

function parseWorks(summaries: any[], detailMap: Map<string, any>): WorkItem[] {
  const collected: WorkItem[] = [];

  summaries.forEach((summary: any) => {
    const putCode = summary?.["put-code"] ?? summary?.putCode ?? cryptoRandomId();
    const detail = detailMap.get(String(putCode));
    const title =
      detail?.title?.title?.value?.trim() ||
      summary?.title?.title?.value?.trim() ||
      summary?.title?.subtitle?.value?.trim() ||
      "Untitled";
    const journal =
      detail?.["journal-title"]?.value?.trim() || summary?.["journal-title"]?.value?.trim() || "";
    const date = buildDate(detail?.["publication-date"] ?? summary?.["publication-date"]);
    const year =
      parseInt(detail?.["publication-date"]?.year?.value, 10) ||
      parseInt(summary?.["publication-date"]?.year?.value, 10) ||
      0;
    const url = summary?.url?.value || detail?.url?.value || "";
    const type = (summary?.type || detail?.type || "other").toLowerCase();
    const doi = extractDoi(
      detail?.["external-ids"]?.["external-id"] ?? summary?.["external-ids"]?.["external-id"]
    );
    const authors = extractAuthors(detail);

    collected.push({
      id: String(putCode),
      title,
      journal,
      displayDate: date,
      year,
      url,
      type,
      doi,
      authors,
    });
  });

  const unique = new Map<string, WorkItem>();
  collected.forEach((item) => {
    const key = item.id || `${item.title}-${item.year}`;
    if (!unique.has(key)) {
      unique.set(key, item);
    }
  });

  return Array.from(unique.values()).sort((a, b) => {
    if (b.year !== a.year) return b.year - a.year;
    return b.title.localeCompare(a.title);
  });
}

function buildDate(dateObj: any) {
  if (!dateObj) return "";
  const year = dateObj?.year?.value || "";
  const month = dateObj?.month?.value?.padStart(2, "0") || "";
  const day = dateObj?.day?.value?.padStart(2, "0") || "";
  return [year, month, day].filter(Boolean).join("-");
}

function extractDoi(externalIds: any[]): string | undefined {
  if (!Array.isArray(externalIds)) return undefined;
  const doiId = externalIds.find((id) => id?.["external-id-type"] === "doi");
  const value = doiId?.["external-id-value"] || "";
  return value ? value.toLowerCase() : undefined;
}

function extractAuthors(detail: any): Author[] {
  const contributors = detail?.contributors?.contributor ?? [];
  if (!Array.isArray(contributors) || !contributors.length) return [];

  return contributors
    .map((contributor: any) => {
      const credit = contributor?.["credit-name"]?.value;
      const given = contributor?.["contributor-name"]?.["given-names"]?.value;
      const family = contributor?.["contributor-name"]?.["family-name"]?.value;
      const structured = [given, family].filter(Boolean).join(" ");
      const fallback = contributor?.["contributor-orcid"]?.path;
      const name = (credit || structured || fallback || "").trim();
      if (!name) return null;
      return {
        name,
        highlight: isKeWang(name),
      };
    })
    .filter(Boolean) as Author[];
}

function isKeWang(rawName: string) {
  if (!rawName) return false;
  const normalized = rawName.replace(/[.,]/g, " ").toLowerCase().replace(/\s+/g, " ").trim();
  if (!normalized) return false;
  const directMatches = ["ke wang", "wang ke", "k wang", "wang k", "wang ke ke"];
  if (directMatches.includes(normalized)) return true;
  if (normalized.includes("wang") && normalized.includes("ke")) {
    return /wang\s*,?\s*ke/.test(normalized) || /ke\s*,?\s*wang/.test(normalized);
  }
  return false;
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2);
}

function refresh() {
  if (!loading.value) {
    fetchWorks();
  }
}

onMounted(fetchWorks);
</script>

<style scoped>
.pub-section {
  margin: 0 auto;
  padding: 2rem 1rem 4rem;
  max-width: 1100px;
}

.pub-hero {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(15, 23, 42, 0.08);
  margin-bottom: 1.75rem;
}

.dark .pub-hero {
  background: rgba(15, 23, 42, 0.85);
  border-color: rgba(148, 163, 184, 0.2);
}

.meta {
  margin: 0.5rem 0 0;
  font-size: 0.9rem;
  color: #6b7280;
}

.dark .meta {
  color: #9ca3af;
}

.tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.search {
  flex: 1 1 320px;
  display: flex;
}

.search input {
  width: 100%;
  min-width: 0;
  padding: 0.75rem 1rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.2);
  background: rgba(255, 255, 255, 0.95);
}

.dark .search input {
  border-color: rgba(148, 163, 184, 0.4);
  background: rgba(15, 23, 42, 0.6);
  color: #f8fafc;
}

.ghost-btn,
.primary-btn {
  border-radius: 999px;
  padding: 0.6rem 1.5rem;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.ghost-btn {
  background: transparent;
  border: 1px solid rgba(15, 23, 42, 0.2);
}

.dark .ghost-btn {
  border-color: rgba(148, 163, 184, 0.4);
  color: #f8fafc;
}

.primary-btn {
  background: #f97316;
  color: #fff;
  box-shadow: 0 10px 20px rgba(249, 115, 22, 0.2);
}

.primary-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 16px 30px rgba(249, 115, 22, 0.25);
}

.state-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
}

.publication-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.card {
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid rgba(15, 23, 42, 0.08);
  background: #fff;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dark .card {
  background: rgba(15, 23, 42, 0.75);
  border-color: rgba(148, 163, 184, 0.2);
}

.skeleton {
  animation: pulse 1.4s ease infinite;
  background-image: linear-gradient(
    90deg,
    rgba(0, 0, 0, 0.05) 25%,
    rgba(0, 0, 0, 0.08) 37%,
    rgba(0, 0, 0, 0.05) 63%
  );
  background-size: 400% 100%;
}

@keyframes pulse {
  0% {
    background-position: 0% 50%;
  }
  100% {
    background-position: 100% 50%;
  }
}

.card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.85rem;
  color: #6b7280;
  gap: 0.5rem;
}

.dark .card-head {
  color: #d1d5db;
}

.year {
  font-weight: 600;
  color: #111827;
}

.dark .year {
  color: #fef08a;
}

.type-pill {
  padding: 0.2rem 0.75rem;
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  font-size: 0.75rem;
  color: #92400e;
}

.dark .type-pill {
  border-color: rgba(148, 163, 184, 0.3);
  color: #fbbf24;
}

.card-title {
  font-size: 1.15rem;
  margin: 0;
  color: #1f2937;
}

.dark .card-title {
  color: #f8fafc;
}

.card-title a {
  color: inherit;
  text-decoration: none;
}

.card-title a:hover {
  text-decoration: underline;
}

.authors {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  font-size: 0.9rem;
  color: #475569;
}

.authors li::after {
  content: ",";
}

.authors li:last-child::after {
  content: "";
}

.authors li.highlight {
  font-weight: 700;
  color: #b45309;
}

.dark .authors {
  color: #cbd5f5;
}

.dark .authors li.highlight {
  color: #fbbf24;
}

.journal {
  font-size: 0.95rem;
  color: #111827;
}

.dark .journal {
  color: #f8fafc;
}

.date {
  font-size: 0.85rem;
  color: #94a3b8;
}

.card-footer {
  margin-top: 0.5rem;
  font-size: 0.85rem;
}

.link {
  color: #2563eb;
  font-weight: 600;
}

.dark .link {
  color: #93c5fd;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.filter-pill {
  border-radius: 999px;
  border: 1px solid rgba(15, 23, 42, 0.2);
  padding: 0.35rem 1rem;
  background: transparent;
  cursor: pointer;
  font-size: 0.85rem;
}

.filter-pill.active {
  background: #f97316;
  color: #fff;
  border-color: #f97316;
}

.dark .filter-pill {
  border-color: rgba(148, 163, 184, 0.4);
  color: #e2e8f0;
}

.state-message {
  text-align: center;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px dashed rgba(15, 23, 42, 0.15);
  color: #475569;
}

.dark .state-message {
  border-color: rgba(148, 163, 184, 0.3);
  color: #cbd5f5;
}

.state-message.error {
  border-color: rgba(239, 68, 68, 0.3);
  color: #dc2626;
}

.load-more {
  display: flex;
  justify-content: center;
  margin-top: 2rem;
}

@media (min-width: 768px) {
  .tools {
    flex-wrap: nowrap;
  }
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>

