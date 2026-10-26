// docs/.vitepress/components/home/home.content.ts
// THE single bilingual source for the homepage (/ and /zh/). v2 (owner direction: concise, no explanatory copy).
// Rules:
//  - Erasable TypeScript only (types/interfaces + const data). ZERO imports.
//    Node >= 22.18 can import this file directly (type stripping) from scripts/.
//  - Every human-readable string is an { en, zh } pair (type L). Language-neutral facts are written once.
//  - Paper titles are the exact English ORCID titles and are never translated (used as the `title` attribute
//    and screen-reader text of the "Read the paper" link).
//  - Coordinates are region-level only and are never rendered as text. verify: true = not given in the brief.
//  - Only keys that are rendered live here (aria/sr-only strings count as rendered). Paper `role` and `kind` are
//    data fields of the publication record (never rendered). v2 draws no link arcs, so there is no LINKS table.

export type Locale = "en" | "zh"
export interface L { en: string; zh: string }

export type Role = "first" | "coFirst" | "senior" | "secondToLast" | "coAuthor" | "coSupervisor"
export type PaperKind = "ancient" | "presentDay" | "proteins" | "method" | "traits" | "review"
export type ChapterId = "africa" | "europe" | "northAsia" | "china" | "seAsia"
export type RegionKind = "study" | "presentDay" | "area" | "endpoint" | "home"
export type RegionId =
  | "shanghai" | "middleNile" | "easternAfrica" | "lowerCongo" | "innerNigerDelta"
  | "viennaBasin" | "carpathianBasin" | "otztal"
  | "mongolia" | "altai"
  | "yellowRiverBend" | "northernChina" | "eastTianshan" | "nwXinjiang"
  | "seAsia"
export type MemberId = "yz" | "shx" | "gy" | "lwt" | "ll" | "qm" | "qym" | "zcc" | "ljy" | "wjh" | "cly" | "hyf"
export type LabelSide = "n" | "ne" | "e" | "se" | "s" | "sw" | "w" | "nw"

export interface Region {
  id: RegionId
  label: L
  lonLat: [number, number]          // [lon, lat], region-level centroid
  kind: RegionKind                  // study = ancient study region; presentDay; area = soft ellipse, no pin; endpoint = named in a title, not studied by us; home
  radiusDeg?: [number, number]      // kind "area" only: ellipse radii in degrees [lon, lat]
  labelSide?: LabelSide             // label placement relative to the mark (default "e")
  verify?: true                     // placement NOT given in the brief; PI must confirm before launch
}

export interface Paper {
  id: string
  year: number
  venue: string
  title: string                     // exact English title (ORCID). Never translated.
  doi: string | null
  role: Role                        // Dr. Ke Wang's role (data only; not rendered)
  kind: PaperKind
  regions: RegionId[]
  chapter?: ChapterId               // the atlas chapter this study belongs to
  highlight?: true                  // shown as a card in the atlas (cap: 8)
  headline?: L                      // plain-language card headline, faithful to the title (highlight only).
                                    // Keep it to 2 lines on a ~440 px card: en <= ~105 chars, zh <= ~34 chars.
}

export interface Chapter {
  id: ChapterId
  n: string                         // "01"–"05"
  title: L
  blurb: L                          // one line
  focus: RegionId[]                 // camera fits the bbox of these regions
  hero: [number, number]            // [lon, lat] for the hero-map halo + label
  heroLabel: L                      // short label on the hero map / active chapter
  heroLabelSide: LabelSide
}

export interface Member { id: MemberId; name: L; group: "phd" | "master" | "undergrad" }

// Filled ("led") = first | coFirst | senior | coSupervisor. Data only (v2 draws every study mark alike).
export const LED_ROLES: Role[] = ["first", "coFirst", "senior", "coSupervisor"]

export const GENOMES = 1001          // lab's own figure (Contact page). Drives the dot grids; 1001 = 7 x 11 x 13.

export const REGIONS: Region[] = [
  { id: "shanghai",        kind: "home",       lonLat: [121.5, 31.2], labelSide: "e",  label: { en: "Ke's Lab · Shanghai", zh: "王轲课题组 · 上海" } },
  { id: "middleNile",      kind: "study",      lonLat: [31, 18.5],    labelSide: "e",  label: { en: "Middle Nile, Sudan", zh: "苏丹 · 尼罗河中游" } },
  { id: "easternAfrica",   kind: "study",            lonLat: [35.5, 0.6], labelSide: "e", verify: true, label: { en: "Eastern Africa", zh: "东非" } },
  { id: "lowerCongo",      kind: "study",            lonLat: [14.5, -5.5], labelSide: "s", verify: true, label: { en: "Lower Congo", zh: "下刚果地区" } },
  { id: "innerNigerDelta", kind: "study",            lonLat: [-4.5, 14.5], labelSide: "n", verify: true, label: { en: "Inland Niger Delta", zh: "尼日尔河内陆三角洲" } },
  { id: "viennaBasin",     kind: "study",      lonLat: [16.3, 48.0],  labelSide: "n",  label: { en: "Vienna Basin, Austria", zh: "奥地利 · 维也纳盆地" } },
  { id: "carpathianBasin", kind: "study",      lonLat: [20, 47],      labelSide: "e",  label: { en: "Carpathian Basin", zh: "喀尔巴阡盆地" } },
  { id: "otztal",          kind: "study",      lonLat: [10.8, 46.8],  labelSide: "w",  label: { en: "Ötztal Alps", zh: "厄茨塔尔阿尔卑斯山" } },
  { id: "mongolia",        kind: "study",      lonLat: [105, 47],     labelSide: "e",  label: { en: "Mongolia · Eastern Steppe", zh: "蒙古 · 欧亚东部草原" } },
  { id: "altai",           kind: "study",      lonLat: [84, 52.5],    labelSide: "w",  label: { en: "Altai–Sayan, Siberia", zh: "西伯利亚 · 阿尔泰—萨彦地区" } },
  { id: "yellowRiverBend", kind: "study",      lonLat: [110.5, 39.5], labelSide: "w",  label: { en: "Yellow River Bend", zh: "黄河几字弯" } },
  { id: "northernChina",   kind: "study",      lonLat: [118, 42],     labelSide: "e",  verify: true, label: { en: "Northern China", zh: "中国北方" } },
  { id: "eastTianshan",    kind: "study",      lonLat: [93.5, 42.8],  labelSide: "s",  label: { en: "East Tianshan", zh: "东天山" } },
  { id: "nwXinjiang",      kind: "study",      lonLat: [83, 44.5],    labelSide: "w",  label: { en: "Northwest Xinjiang", zh: "新疆西北部" } },
  { id: "seAsia",          kind: "presentDay", lonLat: [101, 18],     labelSide: "w",  label: { en: "Mainland Southeast Asia", zh: "东南亚大陆" } },
]

export const PAPERS: Paper[] = [
  { id: "sci2026", year: 2026, venue: "Science", role: "coAuthor", kind: "ancient", doi: "10.1126/science.adv1295",
    title: "Ancient DNA unveils distinctive ancestries in the Bronze and Iron Ages of East Tianshan",
    regions: ["eastTianshan"], chapter: "china" },
  { id: "genbio2026", year: 2026, venue: "Genome Biology", role: "secondToLast", kind: "ancient", doi: "10.1186/s13059-026-03943-0",
    title: "Tracing bronze to iron age population dynamics in Northwest Xinjiang using ancient time-series genomic data",
    regions: ["nwXinjiang"], chapter: "china" },
  { id: "commbio2026", year: 2026, venue: "Communications Biology", role: "coSupervisor", kind: "presentDay", doi: "10.1038/s42003-025-09471-0",
    title: "Exploring the genomic population structure and history of Austroasiatic speakers in Mainland Southeast Asia",
    regions: ["seAsia"], chapter: "seAsia", highlight: true,
    headline: { en: "Genomic structure and history of Austroasiatic speakers in Mainland Southeast Asia",
                zh: "东南亚大陆南亚语系人群的基因组结构与群体历史" } },
  { id: "scls2026", year: 2026, venue: "Science China Life Sciences", role: "senior", kind: "review", doi: null,
    title: "Paleogenomic insights into the evolution of human complex traits", regions: [] },
  { id: "celrep2025", year: 2025, venue: "Cell Reports", role: "senior", kind: "ancient", doi: "10.1016/j.celrep.2025.116034",
    title: "Ancient genomes from the Yellow River Bend reveal long-distance population interactions between the Central Plains, Steppe, and southern China",
    regions: ["yellowRiverBend"], chapter: "china", highlight: true,
    headline: { en: "Yellow River Bend genomes reveal long-distance ties to the Central Plains, the Steppe and southern China",
                zh: "黄河几字弯古基因组揭示中原、草原与华南之间的远距离人群互动" } },
  { id: "csb2025", year: 2025, venue: "Chinese Science Bulletin", role: "senior", kind: "review", doi: "10.1360/csb-2025-0332",
    title: "Ancient DNA reveals ancient kinship and social structures", regions: [] },
  { id: "cellgen2025", year: 2025, venue: "Cell Genomics", role: "coAuthor", kind: "traits", doi: "10.1016/j.xgen.2025.100855",
    title: "An ancient regulatory variant of ACSF3 influences the coevolution of increased human height and basal metabolic rate via metabolic homeostasis", regions: [] },
  { id: "nature2025", year: 2025, venue: "Nature", role: "first", kind: "ancient", doi: "10.1038/s41586-024-08418-5",
    title: "Ancient DNA reveals reproductive barrier despite shared Avar-period culture",
    regions: ["viennaBasin"], chapter: "europe", highlight: true,
    headline: { en: "Ancient DNA reveals a reproductive barrier despite a shared Avar-period culture",
                zh: "古DNA揭示：共享阿瓦尔文化的人群之间仍存在生殖隔离" } },
  { id: "nature2024", year: 2024, venue: "Nature", role: "coAuthor", kind: "ancient", doi: "10.1038/s41586-024-07312-4",
    title: "Network of large pedigrees reveals social practices of Avar communities",
    regions: ["carpathianBasin"], chapter: "europe" },
  { id: "prsb2024", year: 2024, venue: "Proc. R. Soc. B", role: "coAuthor", kind: "ancient", doi: "10.1098/rspb.2023.2747",
    title: "Early agriculture and crop transitions at Kakapel Rockshelter in the Lake Victoria region of eastern Africa",
    regions: ["easternAfrica"], chapter: "africa" },
  { id: "gut2024", year: 2024, venue: "Gut", role: "coAuthor", kind: "traits", doi: "10.1136/gutjnl-2023-331594",
    title: "PNPLA3 fatty liver allele was fixed in Neanderthals and segregates neutrally in humans", regions: [] },
  { id: "cellgen2023", year: 2023, venue: "Cell Genomics", role: "first", kind: "ancient", doi: "10.1016/j.xgen.2023.100377",
    title: "High-coverage genome of the Tyrolean Iceman reveals unusually high Anatolian farmer ancestry",
    regions: ["otztal"], chapter: "europe", highlight: true,
    headline: { en: "The Tyrolean Iceman’s high-coverage genome reveals unusually high Anatolian farmer ancestry",
                zh: "蒂罗尔冰人高覆盖度基因组揭示异常高的安纳托利亚农民祖源" } },
  { id: "curbio2023", year: 2023, venue: "Current Biology", role: "first", kind: "ancient", doi: "10.1016/j.cub.2022.11.062",
    title: "Middle Holocene Siberian genomes reveal highly connected gene pools throughout North Asia",
    regions: ["altai"], chapter: "northAsia", highlight: true,
    headline: { en: "Middle Holocene Siberian genomes reveal highly connected gene pools across North Asia",
                zh: "中全新世西伯利亚古基因组揭示北亚各地基因库高度连通" } },
  { id: "scirep2022", year: 2022, venue: "Scientific Reports", role: "first", kind: "ancient", doi: "10.1038/s41598-022-25384-y",
    title: "4000-year-old hair from the Middle Nile highlights unusual ancient DNA degradation pattern and a potential source of early eastern Africa pastoralists",
    regions: ["middleNile"], chapter: "africa", highlight: true,
    headline: { en: "4,000-year-old Middle Nile hair: unusual DNA degradation and a possible source of early East African herders",
                zh: "尼罗河中游4000年前的毛发：古DNA特殊降解与东非早期牧民的可能来源" } },
  { id: "mbe2022", year: 2022, venue: "Molecular Biology and Evolution", role: "coAuthor", kind: "presentDay", doi: "10.1093/molbev/msac076",
    title: "Disentangling signatures of selection before and after European colonization in Latin Americans", regions: [] },
  { id: "jass2022", year: 2022, venue: "J. Anthropol. Sci.", role: "senior", kind: "review", doi: "10.4436/JASS.10017",
    title: "Ancient genomic research – from broad strokes to nuanced reconstructions of the past", regions: [] },
  { id: "natcomm2021", year: 2021, venue: "Nature Communications", role: "coAuthor", kind: "proteins", doi: "10.1038/s41467-020-20682-3",
    title: "Ancient proteins provide evidence of dairy consumption in eastern Africa",
    regions: ["easternAfrica"], chapter: "africa" },
  { id: "cell2020", year: 2020, venue: "Cell", role: "coFirst", kind: "ancient", doi: "10.1016/j.cell.2020.10.015",
    title: "A dynamic 6,000-year genetic history of Eurasia's Eastern Steppe",
    regions: ["mongolia"], chapter: "northAsia", highlight: true,
    headline: { en: "A dynamic 6,000-year genetic history of Eurasia’s Eastern Steppe",
                zh: "欧亚东部草原6000年的动态遗传史" } },
  { id: "sciadv2020", year: 2020, venue: "Science Advances", role: "first", kind: "ancient", doi: "10.1126/sciadv.aaz0183",
    title: "Ancient genomes reveal complex patterns of population movement, interaction, and replacement in sub-Saharan Africa",
    regions: ["easternAfrica", "lowerCongo", "innerNigerDelta"], chapter: "africa", highlight: true,
    headline: { en: "Ancient genomes reveal complex movement, interaction and replacement in sub-Saharan Africa",
                zh: "古基因组揭示撒哈拉以南非洲复杂的人群迁移、互动与替代" } },
  { id: "natcomm2020", year: 2020, venue: "Nature Communications", role: "coAuthor", kind: "ancient", doi: "10.1038/s41467-020-16557-2",
    title: "Ancient genomes from northern China suggest links between subsistence changes and human migration",
    regions: ["northernChina"], chapter: "china" },
  { id: "plosgen2020", year: 2020, venue: "PLOS Genetics", role: "first", kind: "method", doi: "10.1371/journal.pgen.1008552",
    title: "Tracking human population structure through time from whole genome sequences", regions: [] },
]

export const CHAPTERS: Chapter[] = [
  { id: "africa", n: "01", hero: [18, 6], heroLabelSide: "w", heroLabel: { en: "Africa", zh: "非洲" },
    title: { en: "Africa", zh: "非洲" },
    blurb: { en: "Movement, interaction and replacement across sub-Saharan Africa", zh: "撒哈拉以南非洲的人群迁移、互动与替代" },
    focus: ["middleNile", "easternAfrica", "lowerCongo", "innerNigerDelta"] },
  { id: "europe", n: "02", hero: [15, 47], heroLabelSide: "n", heroLabel: { en: "Central Europe", zh: "中欧" },
    title: { en: "Central Europe & the Alps", zh: "中欧与阿尔卑斯山" },
    blurb: { en: "Avar-period communities and the Tyrolean Iceman", zh: "阿瓦尔时期的人群与蒂罗尔冰人" },
    focus: ["viennaBasin", "carpathianBasin", "otztal"] },
  { id: "northAsia", n: "03", hero: [96, 51], heroLabelSide: "n", heroLabel: { en: "Siberia & Steppe", zh: "西伯利亚与草原" },
    title: { en: "Siberia & the Eastern Steppe", zh: "西伯利亚与欧亚东部草原" },
    blurb: { en: "Six thousand years on the Eastern Steppe, and North Asia’s gene pools", zh: "欧亚东部草原六千年的遗传史与北亚基因库" },
    focus: ["mongolia", "altai"] },
  { id: "china", n: "04", hero: [104, 40], heroLabelSide: "sw", heroLabel: { en: "Northern China & Xinjiang", zh: "中国北方与新疆" },
    title: { en: "Northern China & Xinjiang", zh: "中国北方与新疆" },
    blurb: { en: "The Yellow River Bend and Bronze-to-Iron-Age Xinjiang", zh: "黄河几字弯与新疆青铜至铁器时代的人群" },
    focus: ["yellowRiverBend", "northernChina", "eastTianshan", "nwXinjiang"] },
  { id: "seAsia", n: "05", hero: [101, 17], heroLabelSide: "s", heroLabel: { en: "SE Asia", zh: "东南亚" },
    title: { en: "Mainland Southeast Asia", zh: "东南亚大陆" },
    blurb: { en: "Austroasiatic-speaking populations today", zh: "南亚语系人群的遗传结构与历史" },
    focus: ["seAsia"] },
]

export const MEMBERS: Member[] = [
  { id: "yz",  group: "phd",       name: { en: "Yin Zi",           zh: "殷姿" } },
  { id: "shx", group: "phd",       name: { en: "Sun Hengxi",       zh: "孙恒玺" } },
  { id: "gy",  group: "phd",       name: { en: "Gao Yan",          zh: "高焱" } },
  { id: "lwt", group: "phd",       name: { en: "Liu Wentao",       zh: "刘文韬" } },
  { id: "ll",  group: "phd",       name: { en: "Li Lei",           zh: "李雷" } },
  { id: "qm",  group: "phd",       name: { en: "Qiu Min",          zh: "邱敏" } },
  { id: "qym", group: "master",    name: { en: "Qi Yimeng",        zh: "齐艺萌" } },
  { id: "zcc", group: "master",    name: { en: "Zhang Chengcheng", zh: "张骋骋" } },
  { id: "ljy", group: "master",    name: { en: "Li Jiayi",         zh: "李嘉弈" } },
  { id: "wjh", group: "master",    name: { en: "Wang Jiahao",      zh: "王嘉豪" } },
  { id: "cly", group: "undergrad", name: { en: "Chen Lingyu",      zh: "陈泠妤" } },
  { id: "hyf", group: "undergrad", name: { en: "Han Yufan",        zh: "韩宇帆" } },
]

// ---------------------------------------------------------------------------------------------
// Page copy, in render order (v2_direction §6). Short: headings, one-line ledes, card text, links.
// ---------------------------------------------------------------------------------------------
export const HOME = {
  hero: {
    eyebrow: { en: "Ke's Lab · School of Life Sciences, Fudan University", zh: "王轲课题组 · 复旦大学生命科学学院" },
    // Two lines. h1Key = the phrase set in .kl-grad (split a line with derive.splitKey()).
    h1: { en: ["Reading human history", "from ancient DNA"], zh: ["从古DNA中，", "读懂人类历史"] },
    h1Key: { en: "ancient DNA", zh: "古DNA" },
    lede: {
      en: "We combine ancient genomes with computational methods to study how human populations across Eurasia and Africa diverged, stayed apart and came together.",
      zh: "我们结合古基因组与计算方法，探究欧亚大陆与非洲人群的分化、隔离与交流。",
    },
    stats: [
      { id: "genomes", value: GENOMES,
        label: { en: "ancient genomes published under Dr. Ke Wang’s lead — about a tenth of all published worldwide",
                 zh: "例古代全基因组由王轲博士领衔发表，约占全球已发表的十分之一" } },
      { id: "featured", value: 5, suffix: { en: "×", zh: "次" },
        label: { en: "features in Nature and Science", zh: "研究受 Nature、Science 评述报道" } },
    ],
    doors: [
      { id: "join", href: "#join",
        title: { en: "Join the lab", zh: "加入我们" },
        sub: { en: "Undergrad · Master’s · PhD · Postdoc", zh: "本科生 · 硕士生 · 博士生 · 博士后" } },
      { id: "research", href: "#findings",
        title: { en: "Our research", zh: "研究发现" },
        sub: { en: "From the Nile to the Yellow River", zh: "从尼罗河到黄河" } },
      { id: "press", href: "#outreach",
        title: { en: "Press & outreach", zh: "媒体与科普" },
        sub: { en: "Coverage · Talks · WeChat", zh: "媒体报道 · 科普讲座 · 公众号" } },
    ],
    homeLabel: { en: "Shanghai", zh: "上海" },          // short label of the Shanghai mark on the hero map
    // Screen readers only (role="img" aria-label on the map wrapper).
    mapAlt: {
      en: "Dot map of Africa and Eurasia highlighting five study regions — Africa, Central Europe and the Alps, Siberia and the Eastern Steppe, Northern China and Xinjiang, and Mainland Southeast Asia — with the lab in Shanghai.",
      zh: "非洲与欧亚大陆点阵地图，标出五个研究区域：非洲、中欧与阿尔卑斯山、西伯利亚与欧亚东部草原、中国北方与新疆、东南亚大陆，以及位于上海的课题组。",
    },
  },

  atlas: {
    kicker: { en: "Findings", zh: "研究发现" },
    h2: { en: "From the Nile to the Yellow River", zh: "从尼罗河到黄河" },
    lede: { en: "Follow the map through the regions we study.", zh: "跟随地图，走过我们研究的每一个地区。" },
    skip: { en: "Skip the map tour", zh: "跳过地图导览" },   // visually hidden skip link (keyboard users)
    home: {
      n: "06",
      title: { en: "Back home in Shanghai", zh: "回到上海" },
      body: { en: "Our lab, at Fudan University.", zh: "课题组位于复旦大学。" },
    },
    allPapers: { en: "All publications", zh: "全部学术成果", href: "/Publications" },
  },

  campus: {
    kicker: { en: "Our home", zh: "我们的家" },
    h2: { en: "Fudan University, Shanghai", zh: "复旦大学 · 上海" },
    body: { en: "Department of Anthropology and Human Genetics, School of Life Sciences.",
            zh: "复旦大学生命科学学院 人类学与人类遗传学系" },
    link: { en: "Directions & contact", zh: "交通与联系方式", href: "/Contact" },
    photos: [
      { id: "gate", w: 3349, h: 2095, focal: "56% 52%",
        alt: { en: "Aerial view of a sandstone gate complex with towers and curved arcades beside a lake on a Fudan University campus",
               zh: "复旦大学校园航拍：湖畔带塔楼与弧形拱廊的砂岩色大门建筑群" } },
      { id: "ginkgo", w: 690, h: 564, focal: "50% 50%",
        alt: { en: "An avenue of golden ginkgo trees in autumn leading to a building on the Fudan University campus",
               zh: "秋日金黄的银杏大道，尽头是复旦大学校园内的一座建筑" } },
    ],
  },

  methods: {
    kicker: { en: "How we work", zh: "研究方式" },
    h2: { en: "From remains to history", zh: "从遗骸到历史" },
    steps: [
      { id: "sample", n: "1", icon: "tooth",
        title: { en: "Remains", zh: "考古遗骸" },
        body: { en: "Human remains from archaeological sites.", zh: "来自考古遗址的人类遗骸。" } },
      { id: "extract", n: "2", icon: "tube",
        title: { en: "Extraction", zh: "古DNA提取" },
        body: { en: "Recovering the ancient DNA that survives.", zh: "提取样本中留存的古DNA。" } },
      { id: "library", n: "3", icon: "adapters",
        title: { en: "Libraries", zh: "文库构建" },
        body: { en: "Building whole-genome libraries.", zh: "构建全基因组文库。" } },
      { id: "sequence", n: "4", icon: "reads",
        title: { en: "Sequencing", zh: "测序分析" },
        body: { en: "Mapping short reads to a reference genome.", zh: "将测序短片段比对至参考基因组。" } },
      { id: "model", n: "5", icon: "tree",
        title: { en: "Modelling", zh: "建模推断" },
        body: { en: "Population-genetic models and methods such as MSMC-IM.", zh: "用群体遗传模型与 MSMC-IM 推断历史。" } },
      { id: "interpret", n: "6", icon: "venn",
        title: { en: "History", zh: "解读历史" },
        body: { en: "Read together with archaeology and linguistics.", zh: "与考古学、语言学相互印证。" } },
    ],
    genomes: {
      h3: { en: "1,001 ancient genomes", zh: "1001 例古代全基因组" },
      body: { en: "About a tenth of all ancient genomes published worldwide.", zh: "约占全球已发表古基因组的十分之一。" },
    },
  },

  people: {
    kicker: { en: "People", zh: "关于我们" },
    h2: { en: "The people", zh: "我们的团队" },
    pi: {
      name: { en: "Dr. Ke Wang", zh: "王轲 博士" },
      role: { en: "Principal Investigator, School of Life Sciences, Fudan University", zh: "复旦大学生命科学学院 青年研究员" },
      portraitAlt: { en: "Portrait of Dr. Ke Wang", zh: "王轲博士肖像" },
      path: [
        { years: "2011–2015", org: { en: "Shandong University", zh: "山东大学" }, what: { en: "BSc, Biotechnology", zh: "生物技术 学士" } },
        { years: "2015–2016", org: { en: "University College London", zh: "伦敦大学学院（UCL）" }, what: { en: "MSc, Genetics of Human Disease", zh: "人类疾病遗传学 硕士" } },
        { years: "2016–2020", org: { en: "Max Planck Institute for the Science of Human History", zh: "马克斯·普朗克人类历史科学研究所" }, what: { en: "PhD, Department of Archaeogenetics", zh: "考古遗传学系 博士" } },
        { years: "2020–2022", org: { en: "Max Planck Institute for Evolutionary Anthropology", zh: "马克斯·普朗克进化人类学研究所" }, what: { en: "Postdoc, Department of Archaeogenetics", zh: "考古遗传学系 博士后" } },
        { years: "2022–", org: { en: "Fudan University", zh: "复旦大学" }, what: { en: "Principal Investigator", zh: "青年研究员" } },
      ],
      honoursLabel: { en: "Honours", zh: "荣誉与项目" },   // list label (visible or aria-label)
      honours: [
        { years: "2021", text: { en: "Dieter Rampacher Prize, Max Planck Society", zh: "马克斯·普朗克学会迪特尔·拉姆帕赫奖" } },
        { years: "2026–2028", text: { en: "NSFC Young Scientists Fund, Category B (formerly Excellent Young Scholars)", zh: "国家自然科学基金青年科学基金（B类，原优青）" } },
        { years: "2023–2026", text: { en: "Shanghai Rising-Star Program", zh: "上海市启明星计划" } },
      ],
      link: { en: "Full profile", zh: "完整简介", href: "/Contact" },
    },
    teamLabel: { en: "Members", zh: "成员" },
    groups: {
      phd: { en: "PhD students", zh: "博士研究生" },
      master: { en: "Master’s students", zh: "硕士研究生" },
      undergrad: { en: "Undergraduates", zh: "本科生" },
    },
    link: { en: "Meet everyone", zh: "认识全体成员", href: "/Members" },
  },

  join: {
    kicker: { en: "Join us", zh: "加入我们" },
    h2: { en: "Read the past with us", zh: "与我们一起解读过去" },
    body: {
      en: "We welcome undergraduates, master’s and PhD students, and postdocs in human biology and bioinformatics.",
      zh: "欢迎人类生物学、生物信息学方向的本科生、硕士生、博士生与博士后加入。",
    },
    email: "ke_wang@fudan.edu.cn",
    primary: { en: "Email Dr. Wang", zh: "邮件联系王老师" },          // mailto:{email}
    team: { en: "Meet the team", zh: "认识团队", href: "/Members" },
  },

  outreach: {
    h3: { en: "Press & outreach", zh: "媒体与科普" },
    links: [
      { id: "press", href: "/Press", title: { en: "Press coverage", zh: "媒体报道" }, sub: { en: "Media coverage of our research", zh: "媒体对我们研究的报道" } },
      { id: "po", href: "/PO", title: { en: "Talks & outreach", zh: "公众科普" }, sub: { en: "Academic and public talks by Dr. Wang", zh: "王轲老师的学术报告与科普讲座" } },
      { id: "blog", href: "/Notes/index", title: { en: "Blog", zh: "博客" }, sub: { en: "Research notes from the lab", zh: "课题组研究笔记" } },
    ],
    wechat: {
      title: { en: "Follow us on WeChat", zh: "关注微信公众号" },
      body: { en: "News and popular science.", zh: "研究动态与科普文章。" },
      alt: { en: "QR code for the Ke's Lab WeChat official account", zh: "王轲课题组微信公众号二维码" },
    },
  },

  ui: {
    readPaper: { en: "Read the paper", zh: "阅读论文" },
    newTab: { en: "(opens in a new tab)", zh: "（在新标签页打开）" },   // sr-only
  },
}

// ---------------------------------------------------------------------------------------------
// NOT RENDERED. Facts from the brief's "approximate, verify before display" column.
// Kept here so the PI can confirm them in one place; no component may import this.
// scripts/home-check.mjs prints this list as a reminder.
// ---------------------------------------------------------------------------------------------
export const VERIFY_BEFORE_DISPLAY = [
  "Tyrolean Iceman: ~5,300 years ago (not in the title)",
  "Siberia (Current Biology 2023): up to ~7,500 years ago (title says only 'Middle Holocene')",
  "Avar period: 7th–8th c. CE = about 1,226–1,425 years before 2026 (title says only 'Avar-period')",
  "MSMC-IM: deep African population structure > 1 million years (method inference)",
  "Yellow River Bend: Late Neolithic to Bronze–Iron Age (not in the title)",
  "Map anchors flagged verify: easternAfrica, lowerCongo, innerNigerDelta, northernChina",
]
