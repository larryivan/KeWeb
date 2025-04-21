---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "Ke's Lab"
  text: "Paleogenomics and Evolution Research"
  tagline: "Exploring human evolutionary history through ancient DNA, bioinformatics, and interdisciplinary approaches"
  image:
    src: /logo.png
    alt: Ke's Lab
  actions:
    - theme: brand
      text: Blogs
      link: /Notes
    - theme: alt
      text: Publications
      link: /Publications
    - theme: alt
      text: Members
      link: /Members
    - theme: alt
      text: Contact us
      link: /Contact

features:
  - icon: 🧬
    title: Paleogenomics
    details: We conduct cutting-edge ancient DNA studies to reconstruct the history of population interactions over the past 10,000 years, a crucial period when farming societies emerged globally.
  - icon: 💻
    title: Bioinformatic Methods Development
    details: We develop new computational tools, leveraging frameworks like coalescent theory and site-frequency spectrum to investigate human evolution when archaeological remains or ancient DNA are unavailable.
  - icon: 🔍
    title: Integrating Genetics, Archaeology and Languages
    details: We provide genetic evidence to shed new light on long-standing archaeological hypotheses and linguistic debates in human evolution across Asia, Europe, and Africa.
  - icon: 🔬
    title: Lab Overview
    details: Our research group, led by Dr. Ke Wang (Shanghai Rising-star scientist), explores human evolutionary history through paleogenomics at the School of Life Sciences, Fudan University.
---

<div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
  <!-- Welcome Section with improved styling -->
  <div class="text-center mb-20 relative">
    <div class="absolute inset-0 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl transform -skew-y-1 -z-10"></div>
    <div class="py-12 px-6">
      <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 sm:text-6xl md:text-7xl">Welcome to Ke's Lab</h1>
      <p class="mt-6 text-xl text-gray-600 font-light max-w-2xl mx-auto">We study paleogenomics and evolution!</p>
      <div class="mt-8 w-24 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 mx-auto rounded-full"></div>
    </div>
  </div>

  <!-- Lab Overview Section with enhanced styling -->
  <div class="mb-20 relative overflow-hidden">
    <div class="absolute right-0 top-0 w-64 h-64 bg-blue-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
    <div class="absolute left-0 bottom-0 w-80 h-80 bg-indigo-50 rounded-full -ml-40 -mb-40 opacity-50"></div>
    <div class="relative">
      <h2 class="text-3xl font-bold text-gray-900 mb-8 border-l-4 border-blue-500 pl-4">Lab Overview</h2>
      <div class="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 hover:shadow-md transition-shadow">
        <p class="text-lg text-gray-700 mb-4 leading-relaxed">
          We are a research group (led by Dr. Ke Wang) at the forefront of understanding the evolutionary history of humans through the lenses of paleogenomics, bioinformatics, and population genetics.
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 hover:shadow-md transition-shadow">
        <p class="text-lg text-gray-700 mb-4 leading-relaxed">
          The inhabitation of modern Homo Sapiens on our planet has a long history over 100,000 years, who have left numerous traces of skeletons, created objects (such as lithics and metal artifacts), and caused subsequent local ecological changes. Archaeological excavations of human skeletons allow scientists to reveal the distribution of human fossils and their associated objects buried alongside them that constitute a critical feature of their archaeological cultural label. In the last decades, the successful retrieval of ancient DNA from human remains dated to the last 10,000 years has revolutionized our understanding of the settlement and peopling history of modern humans. Paleogenomics, compared to modern genomics, has resolved many key population history questions in a much more direct way. It meanwhile allows direct comparison between genetic evidence, and archaeological cultural hypotheses, sometimes, even linguistic theories.
        </p>
      </div>
      <div class="bg-white rounded-xl shadow-sm p-8 mb-8 border border-gray-100 hover:shadow-md transition-shadow">
        <p class="text-lg text-gray-700 leading-relaxed">
          While when the time scope of research question is beyond the capability of ancient DNA (too old to be recovered), the bioinfomatic methods based on the currently available data for estimating population evolutionary events become indispensible. The development of new bioinfomatic tools for population history analyses replies heavily on the mathmatical framework established in theoretical population genetics and evolutonary biology. One of the classic framework is coalescent theory, which is the theoretical basis of the presented developed tool here (MSMC-IM). Another widely recognised framework is site-frequency spectrum, which, compared to coalescent theory, would benefit from larger sample size (for more accurate frequency estimates, intuitively). We hope to leverage pros and cons from both frameworks to achieve more accurate estimates on the human evolutionary history.
        </p>
      </div>
    </div>
  </div>
</div>