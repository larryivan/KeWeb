---
layout: page
---

<script setup>
import MemberHeader from "./components/MemberHeader.vue"
import MemberContent from "./components/MemberContent.vue"
</script>

<div class="full-width-container">
  <MemberHeader/>
</div>

<MemberContent/>

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
</style>
