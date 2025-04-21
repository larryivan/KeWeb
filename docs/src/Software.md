---
# 你可以在本页面填写你自己的开源项目介绍
# 当然你也可以删掉这个页面，记得在配置文件的 `nav` 中删掉对应的字段
layout: page
---

<script setup>
import SoftwareHeader from "./components/SoftwareHeader.vue"
</script>

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

<SoftwareHeader/>

<div class="publications-list">
Developed bioinformatic tool for inferring migration rate and effective population size across populations available at: <a href="https://github.com/wangke16/MSMC-IM">MSMC-IM</a>.
&nbsp; <br/>
More tools are coming...
</div>