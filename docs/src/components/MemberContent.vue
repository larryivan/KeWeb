<template>
  <div class="member-content">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <!-- Principal Investigator Section - Simplified -->
      <div class="mb-20">
        <h2 class="section-title">Principal Investigator</h2>
        <div class="bg-white dark:bg-slate-800/90 rounded-lg shadow overflow-hidden transition-all duration-300">
          <div class="flex flex-col md:flex-row">
            <!-- Simplified PI image container -->
            <div class="relative md:w-1/3">
              <img class="h-72 w-full object-cover object-center md:h-80" 
                   :src="principalInvestigator.image" 
                   :alt="`${principalInvestigator.name} profile`">
            </div>
            <!-- Simplified content section -->
            <div class="p-6 md:p-8 md:w-2/3">
              <div class="text-amber-500 dark:text-amber-400 font-medium mb-2">
                {{ principalInvestigator.id }}
              </div>
              <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-4">{{ principalInvestigator.name }}</h3>
              <div class="text-gray-700 dark:text-gray-300 space-y-3 leading-relaxed text-sm md:text-base" v-html="principalInvestigator.bio"></div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Member Sections (PhD, Master, Bachelor) -->
      <div v-for="(category, index) in memberCategories" :key="index" class="mb-20">
        <h2 class="section-title">{{ category.title }}</h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div v-for="(member, mIndex) in category.members" :key="mIndex" 
               class="bg-white dark:bg-slate-800/90 rounded-xl shadow-lg overflow-hidden border border-amber-100 dark:border-slate-700 flex flex-col h-full transform transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
            <!-- Changed to match PI layout: flex-col on mobile, flex-row on md+ -->
            <div class="flex flex-col md:flex-row h-full">
              <!-- Changed to match PI image container styling -->
              <div class="relative overflow-hidden md:w-2/5 md:border-r md:border-amber-50 dark:md:border-slate-700/50">
                <img class="h-64 w-full object-cover object-center md:h-64 transition-transform duration-500 group-hover:scale-105" 
                     :src="member.image" 
                     :alt="`${member.name} profile`">
                <div class="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <!-- Added decorative element like PI section -->
                <div class="hidden md:block absolute bottom-0 right-0 w-8 h-8 bg-gradient-to-br from-amber-400/20 to-amber-600/20 rounded-tl-xl"></div>
              </div>
              <!-- Changed to match PI text container styling -->
              <div class="p-6 md:p-6 md:w-3/5 md:pl-8 relative">
                <!-- Added decorative accent like PI section -->
                <div class="hidden md:block absolute left-0 top-8 bottom-8 w-[2px] bg-gradient-to-b from-amber-200/30 via-amber-400/20 to-amber-200/30 rounded-r"></div>
                <div class="flex items-center mb-3">
                  <div class="uppercase tracking-wide text-sm text-amber-500 dark:text-amber-400 font-semibold mb-1 flex items-center">
                    <span class="inline-block w-3 h-3 bg-amber-500 rounded-full mr-2"></span>
                    {{ member.id }}
                  </div>
                </div>
                <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-2">{{ member.name }}</h3>
                <p class="mt-2 text-gray-700 dark:text-gray-300 leading-relaxed text-sm">{{ member.bio }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Team member data structure
const principalInvestigator = {
  id: "Ke",
  name: "Wang, Ke 王轲 (Ph.D)",
  image: "../images/wk.jpg",
  bio: `<p>Ke started her faculty position at Fudan University in 2022. Before that, she obtained her PhD degree at the Max Planck Institute for the Science of Human History (Department of Archaeogenetics, 2016-2020), followed by postdoctoral training at the Max Planck Institute for Evolutionary Anthropology (since the Department of Archaeogenetics moved there from 2020, 2020-2022).</p>
        <p>For her Ph.D dessertation, she won the Dieter Rampacher Prize of the Max Planck Society in 2021. Ke is currently supported by the Shanghai Rising-star scientist program, and by the National Natural Science Foundation of China Grant.</p>`
};

const memberCategories = [
  {
    title: "PhD Students",
    members: [
      {
        id: "yz",
        name: "Yin, Zi 殷姿",
        image: "../images/yz.jpg",
        bio: "I obtained my Bachelor degree in Medical Laboratory Technology from Tianjin Medical University in 2020 and my Master degree in Immunology from Shanghai Jiao Tong University School of Medicine in 2023. I am currently pursuing a PhD in Human Genetics and Anthropology at the School of Life Sciences, Fudan University. My main work involves constructing whole-genome libraries and conducting data analysis, with a focus on the genetic structure and admixture of populations, exploring the history of population interactions and migrations."
      },
      {
        id: "shx",
        name: "Sun, Hengxi 孙恒玺",
        image: "../images/3shx.jpg",
        bio: "I received my Master's degree in Biology and Medicine from Northwest A&F University and am currently pursuing a PhD in Biology at Fudan University. My research is centered on the evolutionary analysis of ancient microorganisms, employing advanced sequencing technologies to uncover insights into microbial adaptations into past human activities over time."
      },
      {
        id: "gy",
        name: "Gao, Yan 高焱",
        image: "../images/3gy.jpg",
        bio: "Yan Gao is a doctoral student at Fudan University. He received his Bachelor's degree from Zhejiang Occean University in 2021 and his Master's degree from Shantou University in 2024. In recent years, Yan has primarily focused on understanding the molecular mechanisms of adaptive evolution in marine organisms, such as fish and crabs, as well as their population genetic structures. Currently, his research interest is dedicated to integrating ancient DNA data with modern genomic data to explore the spatiotemporal changes of ancient human populations and their adaptive evolutionary mechanisms."
      }
    ]
  },
  {
    title: "Master Students",
    members: [
      {
        id: "qym",
        name: "Qi, Yimeng 齐艺萌",
        image: "../images/4qym.jpg",
        bio: "I am currently pursuing my Master's degree in Biology and Medicine at Fudan University, studying population genetics and human history in Central and East Asia. Prior to this, I worked as an immunological detection researcher at IVC Company after receiving my Bachelor's degree in Biotechnology from Nanchang University (2021). My research interests lie in understanding human population history through an interdisciplinary approach, combining evidence from population genetics, archaeological findings, and paleoclimatic records. Currently, I focus on reconstructing migration patterns and demographic history across the Asian continent, using ancient DNA data to investigate historical population dynamics and social structures."
      },
      {
        id: "zcc",
        name: "Zhang, Chengcheng 张骋骋",
        image: "../images/5zcc2.jpg",
        bio: "Chengcheng is a master student of the School of Life Sciences at Fudan University. She is from Tai'an, Shandong Province. She graduated from the School of Life Sciences at Jilin University, and joined the laboratory in September 2024. She participated in iGEM during her undergraduate studies and conducted research on acute myeloid leukemia with basic knowledge in molecular and cell experiments. She likes citywalks, swimming, and cat petting."
      }
    ]
  },
  {
    title: "Bachelor Students",
    members: [
      {
        id: "cly",
        name: "Chen, Lingyu 陈泠妤",
        image: "../images/6cly.jpg",
        bio: "A curious student majoring in biology, who wants to learn and study anthropology through both evolutionary biology and cultural sociology."
      }
    ]
  }
];
</script>

<style scoped>
.section-title {
  @apply text-2xl font-bold text-amber-800 dark:text-amber-300 mb-8 relative pl-4 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-gradient-to-b before:from-amber-400 before:to-amber-600 before:rounded-full;
}

.member-content {
  background-image: radial-gradient(circle at 1px 1px, rgba(217, 119, 6, 0.06) 1px, transparent 0);
  background-size: 40px 40px;
  background-position: -19px -19px;
}

.dark .member-content {
  background-image: radial-gradient(circle at 1px 1px, rgba(217, 119, 6, 0.04) 1px, transparent 0);
}

@media (max-width: 768px) {
  .member-content {
    background-size: 30px 30px;
  }
}
</style>
