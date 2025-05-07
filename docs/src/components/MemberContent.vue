<template>
  <div class="member-content">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <!-- Principal Investigator Section - Enhanced Layout -->
      <div class="mb-20">
        <h2 class="section-title">Principal Investigator</h2>
        <!-- Updated link to navigate to Contact.html -->
        <router-link to="/Contact.html" class="block group cursor-pointer">
          <div class="bg-white dark:bg-slate-800/90 rounded-xl shadow-lg overflow-hidden transition-all duration-300 border border-amber-50 dark:border-slate-700/60 group-hover:shadow-xl group-hover:border-amber-200 dark:group-hover:border-slate-600">
            <!-- Improved responsive layout with better spacing -->
            <div class="flex flex-col md:flex-row items-center p-8 md:p-10">
              <!-- Enhanced image container with refined styling -->
              <div class="relative mb-6 md:mb-0 md:mr-10">
                <img class="h-56 w-56 md:h-64 md:w-64 object-cover object-center rounded-lg shadow-lg flex-shrink-0 z-10 relative"
                     :src="principalInvestigator.image"
                     :alt="`${principalInvestigator.name} profile`">
                <!-- Decorative accent -->
                <div class="absolute -bottom-2 -right-2 w-full h-full bg-amber-100/50 dark:bg-amber-900/20 rounded-lg -z-10"></div>
              </div>

              <!-- Content with improved typography and spacing -->
              <div class="flex-1 text-center md:text-left">
                <!-- Badge and name with refined styling -->
                <!-- Adjusted alignment and spacing for better responsiveness -->
                <div class="flex flex-col sm:flex-row items-center justify-center md:justify-start gap-2 sm:gap-3 mb-4">
                  <span class="text-amber-600 dark:text-amber-400 font-medium px-3 py-1 bg-amber-50 dark:bg-amber-900/30 rounded-md shadow-sm border border-amber-100 dark:border-amber-800/30 flex-shrink-0">
                    {{ principalInvestigator.id }}
                  </span>
                  <h3 class="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white text-center sm:text-left">{{ principalInvestigator.name }}</h3>
                </div>

                <!-- Bio with improved readability -->
                <div class="text-gray-700 dark:text-gray-300 text-base leading-relaxed space-y-4 max-w-prose" v-html="principalInvestigator.bio"></div>
                
                <!-- Add contact hint -->
                <div class="mt-4 text-amber-600 dark:text-amber-400 font-medium flex items-center justify-center md:justify-start">
                  <span>Click for contact information</span>
                  <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </router-link>
      </div>

      <!-- Member Sections -->
      <div v-for="(category, index) in memberCategories" :key="index" class="mb-20">
        <h2 class="section-title">{{ category.title }}</h2>

        <!-- Simplified, cleaner member cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div v-for="(member, mIndex) in category.members" :key="mIndex"
               @click="openMemberModal(member)"
               class="bg-white dark:bg-slate-800/90 rounded-lg shadow overflow-hidden border border-gray-100 dark:border-slate-700/60 transition-all duration-300 hover:shadow-md hover:border-amber-200 dark:hover:border-amber-800/30 cursor-pointer group">
            
            <!-- Simple accent line -->
            <div class="h-1 bg-amber-400 dark:bg-amber-500/80"></div>
            
            <!-- Cleaner card content with better spacing -->
            <div class="p-5">
              <div class="flex flex-row items-center gap-5">
                <!-- Simplified image styling -->
                <img class="h-28 w-28 object-cover object-center rounded-md shadow flex-shrink-0"
                     :src="member.image"
                     :alt="`${member.name} profile`">
                
                <!-- Content with improved spacing -->
                <div class="flex-1">
                  <!-- Name with clean typography -->
                  <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                    {{ member.name }}
                  </h3>
                  
                  <!-- Simple ID badge -->
                  <div class="mb-2">
                    <span class="text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 bg-amber-50 dark:bg-amber-900/20 rounded-sm">
                      {{ member.id }}
                    </span>
                  </div>
                  
                  <!-- Bio with truncation -->
                  <p class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed line-clamp-2">
                    {{ member.bio }}
                  </p>
                </div>
              </div>
              
              <!-- Subtle view details indicator at the bottom -->
              <div class="mt-3 text-amber-500 dark:text-amber-400 text-xs font-medium flex items-center justify-end">
                <span>View details</span>
                <svg class="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Member Modal Dialog with simplified animations -->
    <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" @click.self="closeModal">
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Improved header with gradient accent -->
        <div class="relative border-b border-gray-200 dark:border-slate-700">
          <div class="h-2 bg-gradient-to-r from-amber-400 to-amber-600 dark:from-amber-500 dark:to-amber-700 rounded-t-xl"></div>
          
          <div class="flex justify-between items-start p-6">
            <div class="flex items-start gap-5">
              <!-- Enhanced image presentation -->
              <div class="relative">
                <img 
                  :src="selectedMember?.image" 
                  :alt="selectedMember?.name" 
                  class="w-20 h-20 rounded-lg object-cover shadow-md border border-amber-100 dark:border-amber-800/30"
                >
              </div>
              
              <!-- Improved name and title layout -->
              <div>
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 text-xs px-2 py-0.5 rounded">
                    {{ selectedMember?.id }}
                  </span>
                </div>
                <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ selectedMember?.name }}</h3>
              </div>
            </div>
            
            <!-- Close button with better hover effect -->
            <button 
              @click="closeModal" 
              class="text-gray-400 hover:text-amber-600 dark:text-gray-500 dark:hover:text-amber-400 transition-colors p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-700"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Content area with improved sections -->
        <div class="p-6">
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Left column: Biography -->
            <div class="md:col-span-2 space-y-6">
              <div class="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                <h4 class="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                  Biography
                </h4>
                <div class="text-gray-700 dark:text-gray-300 leading-relaxed">{{ selectedMember?.bio }}</div>
              </div>

              <!-- Publications with improved styling -->
              <div v-if="selectedMember?.publications && selectedMember?.publications.length > 0" class="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                <h4 class="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  Publications
                </h4>
                <div class="space-y-3">
                  <div v-for="(pub, pIndex) in selectedMember?.publications" :key="pIndex" 
                       class="border-l-2 border-amber-200 dark:border-amber-700 pl-3 py-1">
                    <a 
                      v-if="pub.link" 
                      :href="pub.link" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      class="text-amber-600 dark:text-amber-400 hover:underline font-medium block mb-1"
                    >
                      {{ pub.title }}
                    </a>
                    <span v-else class="font-medium block mb-1">{{ pub.title }}</span>
                    <p v-if="pub.authors" class="text-sm text-gray-600 dark:text-gray-400">{{ pub.authors }}</p>
                    <p v-if="pub.journal" class="text-sm text-gray-600 dark:text-gray-400 italic">{{ pub.journal }}</p>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Right column: Contact info and social links -->
            <div class="space-y-6">
              <!-- Email with icon -->
              <div v-if="selectedMember?.email" class="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                <h4 class="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                  </svg>
                  Contact
                </h4>
                <a 
                  :href="`mailto:${selectedMember?.email}`" 
                  class="text-amber-600 dark:text-amber-400 hover:underline break-all flex items-center gap-1"
                >
                  {{ selectedMember?.email }}
                </a>
                
                <!-- Additional contact information if present -->
                <div v-if="selectedMember?.contact" class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700/50">
                  <p class="text-gray-700 dark:text-gray-300">{{ selectedMember.contact }}</p>
                </div>
              </div>
              
              <!-- Social Links with icons -->
              <div v-if="selectedMember?.github || selectedMember?.twitter || selectedMember?.googleScholar" class="bg-gray-50 dark:bg-slate-700/30 rounded-lg p-4 border border-gray-100 dark:border-slate-700">
                <h4 class="text-lg font-semibold text-amber-700 dark:text-amber-400 mb-3 flex items-center">
                  <svg class="w-5 h-5 mr-2 text-amber-500 dark:text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
                  </svg>
                  Connect
                </h4>
                
                <div class="space-y-2">
                  <a 
                    v-if="selectedMember?.github" 
                    :href="selectedMember.github" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="flex items-center gap-2 p-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
                    </svg>
                    <span>GitHub</span>
                  </a>
                  
                  <a 
                    v-if="selectedMember?.twitter" 
                    :href="selectedMember.twitter" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="flex items-center gap-2 p-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                    <span>X (Twitter)</span>
                  </a>
                  
                  <a 
                    v-if="selectedMember?.googleScholar" 
                    :href="selectedMember.googleScholar" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    class="flex items-center gap-2 p-2 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/20 text-gray-700 dark:text-gray-300 transition-colors"
                  >
                    <svg class="w-5 h-5 text-gray-600 dark:text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M5.242 13.769L0 9.5 12 0l12 9.5-5.242 4.269C17.548 11.249 14.978 9.5 12 9.5c-2.977 0-5.548 1.748-6.758 4.269zM12 10a7 7 0 1 0 0 14 7 7 0 0 0 0-14z"/>
                    </svg>
                    <span>Google Scholar</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

// Modal state management
const showModal = ref(false);
const selectedMember = ref(null);

// Open member modal function
const openMemberModal = (member) => {
  selectedMember.value = member;
  showModal.value = true;
  document.body.classList.add('overflow-hidden'); // Prevent background scrolling
};

// Close member modal function
const closeModal = () => {
  showModal.value = false;
  document.body.classList.remove('overflow-hidden');
};

// Team member data structure
const principalInvestigator = {
  id: "Ke",
  name: "Wang, Ke 王轲 (Ph.D)",
  image: "https://larryivan.github.io/picx-images-hosting/20250507/wk.45hvpslowv.jpg",
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
        image: "https://larryivan.github.io/picx-images-hosting/20250507/yz.7p3tflocz7.jpg",
        bio: "I obtained my Bachelor degree in Medical Laboratory Technology from Tianjin Medical University in 2020 and my Master degree in Immunology from Shanghai Jiao Tong University School of Medicine in 2023. I am currently pursuing a PhD in Human Genetics and Anthropology at the School of Life Sciences, Fudan University. My main work involves constructing whole-genome libraries and conducting data analysis, with a focus on the genetic structure and admixture of populations, exploring the history of population interactions and migrations.",
      },
      {
        id: "shx",
        name: "Sun, Hengxi 孙恒玺",
        image: "https://larryivan.github.io/picx-images-hosting/20250507/3shx-1.7lk7hvtpp8.jpg",
        bio: "I earned my Master’s degree in Biology and Medicine from Northwest A&F University and am currently pursuing a Ph.D. in Biology at Fudan University. My research focuses on the evolutionary analysis of ancient microorganisms, utilizing advanced sequencing technologies to reveal insights into microbial adaptations throughout history.",
        email: "sunhx23@m.fudan.edu.cn",
      },
      {
        id: "gy",
        name: "Gao, Yan 高焱",
        image: "https://larryivan.github.io/picx-images-hosting/20250507/3gy-1.8hgoxc2vh5.jpg",
        bio: "Yan Gao is a doctoral student at Fudan University. He received his Bachelor's degree from Zhejiang Occean University in 2021 and his Master's degree from Shantou University in 2024. In recent years, Yan has primarily focused on understanding the molecular mechanisms of adaptive evolution in marine organisms, such as fish and crabs, as well as their population genetic structures. Currently, his research interest is dedicated to integrating ancient DNA data with modern genomic data to explore the spatiotemporal changes of ancient human populations and their adaptive evolutionary mechanisms.",
      }
    ]
  },
  {
    title: "Master Students",
    members: [
      {
        id: "qym",
        name: "Qi, Yimeng 齐艺萌",
        image: "https://larryivan.github.io/picx-images-hosting/20250507/4qym-1.7zqn8r270u.jpg",
        bio: "I am currently pursuing my Master's degree in Biology and Medicine at Fudan University, studying population genetics and human history in Central and East Asia. Prior to this, I worked as an immunological detection researcher at IVC Company after receiving my Bachelor's degree in Biotechnology from Nanchang University (2021). My research interests lie in understanding human population history through an interdisciplinary approach, combining evidence from population genetics, archaeological findings, and paleoclimatic records. Currently, I focus on reconstructing migration patterns and demographic history across the Asian continent, using ancient DNA data to investigate historical population dynamics and social structures.",
      },
      {
        id: "zcc",
        name: "Zhang, Chengcheng 张骋骋",
        image: "https://larryivan.github.io/picx-images-hosting/20250507/Screenshot-2025-05-07-at-15.44.16.60ugiepzcx.jpg",
        bio: "I received my Bachelor’s degree in Life Sciences from Jilin University and began my Master’s studies at the School of Life Sciences, Fudan University in 2024. My current work focuses on ancient DNA research, particularly wet lab procedures such as the construction of whole-genome libraries from archaeological samples. Currently, I am interested in genome-wide analysis of ancient East Asian populations.Outside of the lab, I enjoy walking around the city, swimming, and spending time with cats.",
        email: "zhangchengcheng62@gmail.com",
      }
    ]
  },
  {
    title: "Bachelor Students",
    members: [
      {
        id: "cly",
        name: "Chen, Lingyu 陈泠妤",
        image: "https://larryivan.github.io/picx-images-hosting/20250507/6cly-1.1lc1d5ku8n.jpg",
        bio: "A curious student majoring in biology, who wants to learn and study anthropology through both evolutionary biology and cultural sociology.",
      },
      {
        id: "Larry",
        name: "Han, Yufan 韩宇帆",
        image: "https://larryivan.github.io/picx-images-hosting/20250507/IMG_202505028154_768x1024.2yykh7oxx8.jpg",
        bio: "Sophomore Biological Sciences student passionate about population genetics and bioinformatics. Skilled in Python, C++, and Vue. Seeking research opportunities to apply computational approaches to genetic analysis.",
        github: "https://github.com/larryivan",
        email: "larryivanhan@gmail.com",
        publications: [
          {
            title: "Bacteria in the phylum Bacillota degrade nicotine through the variant of pyridine and pyrrolidine pathway.",
            journal: "Current Microbiology"
          }
        ]
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

/* Add line-clamp utilities if needed */
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Simplified modal styling without animations */
.bg-white, .dark .dark\:bg-slate-800 {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(245, 158, 11, 0.1);
}

.dark .dark\:bg-slate-800 {
  border: 1px solid rgba(245, 158, 11, 0.05);
}
</style>
