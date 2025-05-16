<template>
  <div class="bg-white dark:bg-slate-900 px-4 py-12 sm:px-6 lg:px-8">
    <div class="max-w-6xl mx-auto">
      <!-- Fudan University Logo Carousel with Auto-rotation -->
      <div class="mb-10">
        <div class="relative overflow-hidden rounded-xl shadow-lg"
             @mouseenter="pauseCarousel" 
             @mouseleave="resumeCarousel">
          <div class="flex transition-transform duration-500" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
            <div v-for="(image, index) in fuLogos" :key="index" class="w-full flex-shrink-0">
              <img :src="image" :alt="`复旦大学图片 ${index + 1}`" class="w-full h-48 object-cover" />
            </div>
          </div>
          <!-- Navigation dots -->
          <div class="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
            <button v-for="(_, index) in fuLogos" 
                    :key="index" 
                    @click="goToSlide(index)"
                    class="w-3 h-3 rounded-full transition-colors duration-200"
                    :class="index === currentSlide ? 'bg-amber-500' : 'bg-gray-300'">
            </button>
          </div>
        </div>
      </div>
      
      <!-- Grid layout for contact information and research details -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12">
        <!-- Left column: Contact info -->
        <div class="lg:col-span-5">
          <!-- Contact card with improved layout -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden border border-gray-100 dark:border-slate-700 transform transition duration-300 hover:shadow-xl">
            <div class="bg-gradient-to-r from-amber-500 to-amber-600 p-8 flex items-center">
              <div class="h-24 w-24 rounded-full bg-white dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-amber-600 shadow-lg border-4 border-amber-100 dark:border-amber-800/50 overflow-hidden">
                <img src="https://larryivan.github.io/picx-images-hosting/20250507/C0tPlA-R_400x400.1e8thpvevd.jpg" alt="王轲博士" class="w-full h-full object-cover" />
              </div>
              <div class="ml-6">
                <h2 class="text-2xl font-bold text-white">王轲 Dr. Ke Wang</h2>
                <p class="text-sm text-amber-100 font-medium">青年研究员 | Tenured-track PI</p>
              </div>
            </div>
            
            <div class="p-6">              
              <div class="space-y-5 pt-3">
                <div class="flex items-center hover:transform hover:translate-x-1 transition-transform">
                  <div class="text-amber-500 dark:text-amber-400 flex-shrink-0 w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                      <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                    </svg>
                  </div>
                  <a href="mailto:ke_wang@fudan.edu.cn" class="ml-3 text-gray-700 dark:text-gray-200 hover:text-amber-600 dark:hover:text-amber-400 transition font-medium">
                    ke_wang@fudan.edu.cn
                  </a>
                </div>
                
                <div class="flex items-center hover:transform hover:translate-x-1 transition-transform">
                  <div class="text-amber-500 dark:text-amber-400 flex-shrink-0 w-6 h-6">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M9.293 2.293a1 1 0 011.414 0l7 7A1 1 0 0117 11h-1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-3a1 1 0 00-1-1H9a1 1 0 00-1 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-6H3a1 1 0 01-.707-1.707l7-7z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <span class="ml-3 text-gray-700 dark:text-gray-200">
                    江湾校区生命科学学院
                  </span>
                </div>
              </div>
              
              <!-- Gaode Map Location -->
              <div class="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <h4 class="font-semibold text-gray-800 dark:text-gray-200 mb-3 flex items-center">
                  <svg class="w-4 h-4 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                  办公地点
                </h4>
                <div id="gaodeMap" class="h-56 w-full rounded-lg overflow-hidden border border-gray-100 dark:border-slate-700"></div>
              </div>
              
              <!-- Social Links -->
              <div class="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700 flex space-x-4">
                <a href="#" class="text-gray-400 hover:text-amber-500 transition">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.7 3H4.3C3.582 3 3 3.582 3 4.3v15.4c0 .718.582 1.3 1.3 1.3h15.4c.718 0 1.3-.582 1.3-1.3V4.3c0-.718-.582-1.3-1.3-1.3zm-4.2 16h-2.4v-6.5c0-.718-.05-1.643-1-1.643-1.035 0-1.2.776-1.2 1.576V19h-2.4v-9.5h2.305v1.059h.033C11.39 9.85 12.03 9 13.348 9 15.789 9 16 10.357 16 12.235V19z"></path>
                  </svg>
                </a>
                <a href="https://github.com/wangke16" class="text-gray-400 hover:text-amber-500 transition">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.156-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.53 2.341 1.088 2.91.832.091-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.272.098-2.65 0 0 .84-.269 2.75 1.025A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.294 2.747-1.025 2.747-1.025.546 1.378.203 2.397.1 2.65.64.699 1.028 1.592 1.028 2.683 0 3.841-2.337 4.687-4.565 4.935.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481C19.138 20.161 22 16.416 22 12c0-5.523-4.477-10-10-10z"></path>
                  </svg>
                </a>
                <a href="https://x.com/kwangwangk" class="text-gray-400 hover:text-amber-500 transition">
                  <svg class="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <!-- Research Areas with improved styling -->
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg mt-6 p-6 border border-gray-100 dark:border-slate-700 transform transition duration-300 hover:shadow-xl">
            <h3 class="font-semibold text-lg text-gray-900 dark:text-white mb-4 flex items-center">
              <svg class="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z"></path>
              </svg>
              研究方向
            </h3>
            <div class="flex flex-wrap gap-2">
              <span v-for="area in researchAreas" :key="area.name"
                    class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 transition duration-300 hover:bg-amber-200 dark:hover:bg-amber-900/50">
                {{ area.name }}
              </span>
            </div>
          </div>
        </div>
        
        <!-- Right column: Research info -->
        <div class="lg:col-span-7">
          <div class="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 lg:p-8 border border-gray-100 dark:border-slate-700 h-full transform transition duration-300 hover:shadow-xl">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center">
              <svg class="w-6 h-6 mr-3 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"></path>
              </svg>
              研究方向简介
            </h2>
            
            <div class="border-b border-gray-100 dark:border-slate-700 pb-6 mb-6">
              <p class="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                通过古基因组与开发新型计算方法探究亚欧非人群内、间的分化、隔离与交流。
              </p>
            </div>
            
            <!-- Achievements Section with improved styling -->
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <svg class="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
                </svg>
                个人简介与获奖情况
              </h3>
              <ul class="space-y-4">
                <li v-for="achievement in achievements" :key="achievement" 
                    class="flex items-start bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg transition duration-300 hover:bg-amber-100 dark:hover:bg-amber-900/20">
                  <svg class="h-5 w-5 text-amber-500 mr-3 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clip-rule="evenodd" />
                  </svg>
                  <span class="text-gray-700 dark:text-gray-300">{{ achievement }}</span>
                </li>
              </ul>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <svg class="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976A3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zM13.723 10.146a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-2-2a1 1 0 111.414-1.414L10 13.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                    授课与招生
                </h3>
                <p class="text-gray-700 dark:text-gray-300 mb-2"><strong>授课情况：</strong>{{ teachingInfo }}</p>
                <p class="text-gray-700 dark:text-gray-300"><strong>招生专业：</strong>{{ admissionMajors }}</p>
            </div>

            <div class="mt-6 pt-6 border-t border-gray-100 dark:border-slate-700">
                <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                     <svg class="w-5 h-5 mr-2 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fill-rule="evenodd" d="M5 5a3 3 0 013-3h8a3 3 0 013 3v12a3 3 0 01-3 3H8a3 3 0 01-3-3V5zm3-1a1 1 0 00-1 1v12a1 1 0 001 1h8a1 1 0 001-1V5a1 1 0 00-1-1H8z" clip-rule="evenodd" />
                        <path fill-rule="evenodd" d="M10 9a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1zm-2 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clip-rule="evenodd" />
                    </svg>
                    科研项目
                </h3>
                <ul class="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-1">
                    <li v-for="project in researchProjects" :key="project">{{ project }}</li>
                </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';

const currentSlide = ref(0);
const fuLogos = [
  'https://larryivan.github.io/picx-images-hosting/20250507/1.67xodug9di.jpg',
  'https://larryivan.github.io/picx-images-hosting/20250507/3.32i6ewlxou.jpg',
  'https://larryivan.github.io/picx-images-hosting/20250507/5.3nru17j1cf.jpg',
  'https://larryivan.github.io/picx-images-hosting/20250507/6.6iki6zyhhp.jpg',
  'https://larryivan.github.io/picx-images-hosting/20250507/7.2yykh6w1r0.jpg',
  'https://larryivan.github.io/picx-images-hosting/20250507/8.1ovnave9z1.jpg'
];
const carouselInterval = ref(null);
const autoPlayDelay = 4000; // 4 seconds between slides

const goToSlide = (index) => {
  currentSlide.value = index;
  restartCarouselTimer();
};
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % fuLogos.length;
};
const startCarouselTimer = () => {
  carouselInterval.value = setInterval(nextSlide, autoPlayDelay);
};
const restartCarouselTimer = () => {
  if (carouselInterval.value) {
    clearInterval(carouselInterval.value);
  }
  startCarouselTimer();
};
const pauseCarousel = () => {
  if (carouselInterval.value) {
    clearInterval(carouselInterval.value);
    carouselInterval.value = null;
  }
};
const resumeCarousel = () => {
  if (!carouselInterval.value) {
    startCarouselTimer();
  }
};

const researchAreas = [
  { name: '古DNA' },
  { name: '人群演化' },
  { name: '群体遗传学' },
  { name: '进化生物学' },
  { name: '生物信息学' },
  { name: '计算生物学' }
];

const achievements = [
  '2022.5-至今 复旦大学生命科学学院 人类学系 青年研究员',
  '2020.4-2022.4 德国马克斯普朗克进化人类研究所 考古遗传系 博士后',
  '2016.10-2020.4 德国马克斯普朗克人类历史研究所 考古遗传系 遗传学 博士',
  '2015.9-2016.9 英国伦敦大学学院 遗传系 遗传学 硕士',
  '2011.9-2015.6 山东大学 生物技术 学士',
  '德国马普协会Dieter Rampacher Prize 2021 （Max Planck Society）'
];

const teachingInfo = '基因组学';
const admissionMajors = '人类生物学、计算生物学';
const researchProjects = ['国自然面上', '上海市启明星', 'ERC Horizon地平线项目'];

onMounted(() => {
  startCarouselTimer();
  const script = document.createElement('script');
  script.src = 'https://webapi.amap.com/maps?v=2.0&key=69548046e517d28d9d50056c97aa362d';
  script.async = true;
  document.head.appendChild(script);
  
  script.onload = () => {
    const map = new AMap.Map('gaodeMap', {
      center: [121.50816,31.340422],
      zoom: 17,
      resizeEnable: true
    });
    const marker = new AMap.Marker({
      position: new AMap.LngLat(121.50816,31.340422),
      title: '复旦大学生命科学学院 江湾校区'
    });
    map.add(marker);
    const infoWindow = new AMap.InfoWindow({
      content: '<div class="p-2"><strong>王轲博士</strong><br>复旦大学生命科学学院<br>江湾校区</div>',
      offset: new AMap.Pixel(0, -30)
    });
    marker.on('click', () => {
      infoWindow.open(map, marker.getPosition());
    });
  };
});

onUnmounted(() => {
  if (carouselInterval.value) {
    clearInterval(carouselInterval.value);
  }
});
</script> 