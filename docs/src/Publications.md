---
layout: page
---
<script setup>
import Header from "./components/PublicationsHeader.vue"
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
  background-color: white;
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 6px 24px 0px, rgba(0, 0, 0, 0.08) 0px 0px 0px 1px;
  font-family: "Georgia", "Times New Roman", serif;
  line-height: 1.8;
  font-size: 1.05rem;
  position: relative;
  overflow-wrap: break-word;
  counter-reset: publication-counter;
}

.dark .publications-list {
  background-color: rgba(15, 23, 42, 0.65);
  box-shadow: rgba(0, 0, 0, 0.25) 0px 6px 24px 0px, rgba(0, 0, 0, 0.12) 0px 0px 0px 1px;
  color: rgba(241, 245, 249, 0.95);
}

/* Add horizontal separation */
.publications-list br {
  display: block;
  content: "";
  margin-top: 1.25rem;
  margin-bottom: 0.25rem;
  border-bottom: 1px dashed rgba(217, 119, 6, 0.15);
}

.dark .publications-list br {
  border-bottom: 1px dashed rgba(245, 158, 11, 0.15);
}

/* Style the title text */
.publications-list {
  counter-reset: publication-item;
}

/* Enhance the numbers */
.publications-list {
  color: rgba(41, 37, 36, 0.95);
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
}

@media (max-width: 576px) {
  .publications-list {
    padding: 1.5rem 1.25rem;
    font-size: 0.9rem;
    margin: 1rem auto 2rem;
  }
}

/* Add an academic journal styled background */
.publications-list::before {
  content: "";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: 
    linear-gradient(to right, rgba(251, 241, 222, 0.1) 0px, transparent 1px) 0 0 / 20px 20px,
    linear-gradient(to bottom, rgba(251, 241, 222, 0.1) 0px, transparent 1px) 0 0 / 20px 20px;
  pointer-events: none;
  border-radius: 8px;
  opacity: 0.4;
}

.dark .publications-list::before {
  background: 
    linear-gradient(to right, rgba(148, 163, 184, 0.05) 0px, transparent 1px) 0 0 / 20px 20px,
    linear-gradient(to bottom, rgba(148, 163, 184, 0.05) 0px, transparent 1px) 0 0 / 20px 20px;
}
</style>

<div class="publications-list">
1. Wang, K., Prüfer, K.,Krause-Kyora, B.,et al. (2023) High-coverage genome of the Tyrolean Iceman reveals unusually high Anatolian farmer ancestry. Cell Genomics 3(9) (Cover Page)
&nbsp; <br/>
2. Wang, K.* Yu, H., Radzeviciute, R. et al. (2023) Middle Holocene Siberian genomes reveal highly connected gene pools throughout North Asia. Current Biology 33(3): 423-433 (* correspondence).
&nbsp; <br/>
3. Naegele, K., Rivollat, M., Yu, H., Wang, K.(2022) Ancient genomic research – From broad strokes to nuanced reconstructions of the past. Journal of Anthropological Sciences 100.
&nbsp; <br/>
4. Wang, K., Bleasdale, M., Le Moyne, C. et al. (2022) 4000-year-old hair from the Middle Nile highlights unusual ancient DNA degradation pattern and a potential source of early eastern Africa pastoralists. Scientific Reports 12(20939)
&nbsp; <br/>
5. Jeong, C. +, Wang, K.+, Wilkin, S., Taylor, W. T. T., et al (2020) A dynamic 6,000-year genetic history of Eurasia’s Eastern Steppe. Cell, 2020;183: 890–904.e29. (+equal contribution)
&nbsp; <br/>
6. Wang, K.+, Goldstein, S.+, Bleasdale, M., et al (2020). Ancient genomes reveal complex patterns of population movement, interaction and replacement in sub-Saharan Africa. Science Advances, 2020;6: eaaz0183. (+equal contribution)
&nbsp; <br/>
7. Schiffels, S., Wang, K. (2020) MSMC and MSMC2: The Multiple Sequentially Markovian Coalescent. In: Dutheil J. (eds) Statistical Population Genomics. Methods in Molecular Biology, vol 2090. Humana, New York, NY
&nbsp; <br/>
8. Wang, K., Mathieson, I., O’Connell, J., Schiffels, S. (2020) Tracking human population structure through time from whole genome sequences. PLoS Genetics 16(3): e1008552.
&nbsp; <br/>
</div>