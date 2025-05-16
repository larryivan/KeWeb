---
layout: page
title: 公众科普
---
<script setup>
import Header from "./components/POHeader.vue"
</script>

<div class="full-width-container">
  <Header/>
</div>

<style>
:root {
  --vp-layout-max-width: 100% !important;
}
.VPDoc {
  padding: 0 !important;
}
.VPDoc .container {
  max-width: 100% !important;
  margin: 0 !important;
  padding: 0 !important;
}
.VPDocFooter {
  max-width: 100% !important;
}
.full-width-container {
  overflow-x: hidden;
  width: 100%;
}

.publications-list {
  max-width: 1100px;
  margin: 2rem auto 4rem;
  padding: 2.5rem 3rem;
  background-color: var(--vp-c-bg-soft);
  border-radius: 12px;
  box-shadow: var(--vp-c-divider) 0px 0px 0px 1px, rgba(0, 0, 0, 0.05) 0px 6px 24px 0px;
  font-family: var(--vp-font-family-base);
  line-height: 1.8;
  font-size: 1.05rem;
  position: relative;
  overflow-wrap: break-word;
}

/* Year headers styling */
.publications-list h2 {
  font-size: 1.8rem;
  color: var(--vp-c-brand-1);
  margin-top: 2rem;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--vp-c-divider);
  font-weight: 600;
}

.publications-list h2:first-of-type {
  margin-top: 0;
}

/* Talk and lecture items */
.publications-list p {
  margin-bottom: 1.2rem;
  padding-left: 1.5rem;
  position: relative;
}

.publications-list p:before {
  content: "";
  position: absolute;
  left: 0;
  top: 0.6rem;
  width: 0.5rem;
  height: 0.5rem;
  background-color: var(--vp-c-brand-2);
  border-radius: 50%;
}

/* Style talk titles */
.publications-list p strong {
  color: var(--vp-c-text-1);
  font-weight: 600;
}

/* Style location and date */
.publications-list p em {
  color: var(--vp-c-text-2);
  display: block;
  font-size: 0.9rem;
  margin-top: 0.3rem;
}

/* Add subtle variations for talk types */
.publications-list p.talk:before {
  background-color: var(--vp-c-brand-1);
}

.publications-list p.lecture:before {
  background-color: var(--vp-c-brand-2);
}

/* Responsive adjustments */
@media (max-width: 1200px) {
  .publications-list {
    max-width: 90%;
    margin: 1.5rem auto 3rem;
  }
}

@media (max-width: 992px) {
  .publications-list {
    padding: 2rem 2.5rem;
  }
}

@media (max-width: 768px) {
  .publications-list {
    padding: 1.75rem 1.5rem;
    font-size: 0.95rem;
    line-height: 1.7;
  }
  
  .publications-list h2 {
    font-size: 1.5rem;
  }
  
  .publications-list p {
    padding-left: 1.2rem;
  }
}

@media (max-width: 576px) {
  .publications-list {
    padding: 1.5rem 1.25rem;
    font-size: 0.9rem;
    margin: 1rem auto 2rem;
  }
}
</style>

<div class="publications-list">
  <h2>2024</h2>
  
  <p class="talk"><strong>Ancient DNA reveals the genetic ancestry, family pedigree and phenotypes of ancient Eurasian populations</strong> (Chinese)<br>
  <em>October, Annual conference of the Bioinformatics Society of China, Haikou, China</em></p>
  
  <p class="talk"><strong>The co-evolution of genes and cultures in human evolutionary history from the perspective of ancient DNA</strong> (Chinese)<br>
  <em>April, Medical School of Fudan University, Shanghai, China</em></p>
  
  <p class="talk"><strong>The settlement history of Altai inhabitants from the perspective of paleogenomics</strong> (Chinese)<br>
  <em>March, The first annual conference of Genomics and Bioinformatics of China, Wuhan, China</em></p>
  
  <h2>2023</h2>
  
  <p class="talk"><strong>Ancient DNA sheds new lights into the Tyrolean Iceman mummy</strong> (Chinese)<br>
  <em>December, Annual conference of the Chinese Society for the History of Science and Technology, Beijing, China</em></p>
  
  <p class="talk"><strong>High-coverage genome of the Tyrolean mummy reveals the Anatolian ancestry and potential phenotypic traits of Iceman</strong> (Chinese)<br>
  <em>November, Annual conference of the Genetics Society of China, Wuhan, China</em></p>
  
  <p class="talk"><strong>The ancient population dynamics across North Asia and Eurasian Steppe</strong> (Chinese)<br>
  <em>October, Annual conference of the Environmental Archeology Society of China, Kaifeng, China</em></p>
  
  <p class="talk"><strong>High-coverage genome of the Tyrolean Iceman reveals high Anatolian farmer ancestry</strong><br>
  <em>October, SMBE Shanghai, Shanghai, China</em></p>
  
  <p class="talk"><strong>The prehistorical migration and adxmiture history of Eurasian steppe populations and northern Siberians</strong> (Chinese)<br>
  <em>September, International conference on the ancient cultures along Silk Road and Dunhuang, Dunhuang, China</em></p>
  
  <p class="talk"><strong>New insights into the peopling history of Eurasian Steppe and Siberia</strong> (Chinese)<br>
  <em>August, Annual conference of the Anthropological Archaeological Society of China, Tongliao, China</em></p>
  
  <p class="lecture"><strong>Ancient DNA reveals highly connected gene pools across North Asia</strong> (Chinese)<br>
  <em>November, Kunming Institute of Zoology Chines Academy of Sciences, Kunming, China</em></p>
  
  <p class="lecture"><strong>Genomic insights into the peopling of Eurasia and Africa Steppe</strong> (Chinese)<br>
  <em>November, China University of Geosciences, Wuhan, China</em></p>
  
  <p class="lecture"><strong>Ancient population dynamics across North Asia and Eurasian Steppe</strong> (Chinese)<br>
  <em>August, Jilin University, Changchun, China</em></p>
  
  <p class="lecture"><strong>Ancient genomes reveal the migration and admixture history of early Africans</strong> (Chinese)<br>
  <em>June, East China Normal University, Shanghai, China</em></p>
  
  <p class="lecture"><strong>Investigating human origins from the perspective of molecular anthropology</strong> (Chinese)<br>
  <em>April, Shaanxi Normal University, Xi'an, China</em></p>
  
  <h2>2022-2017 (部分)</h2>
  
  <p class="lecture"><strong>Using ancient DNA to learn about recent human evolution</strong><br>
  <em>October 2022, Department of Anthropology and Human Genetics, Fudan University, Shanghai, China</em></p>
  
  <p class="talk"><strong>Reconstructing population separation history from whole genome sequences</strong><br>
  <em>March 2019, EMBO | EMBL Symposium: Reconstructing the Human Past - Using Ancient and Modern Genomics, Heidelberg, Germany</em></p>
  
  <p class="talk"><strong>Investigating East African population structure through ancient genomes</strong><br>
  <em>May 2019, International conference - "Africa, the cradle of human diversity", Uppsala University, Uppsala, Sweden</em></p>
</div> 