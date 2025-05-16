---
layout: page
---

<script setup>
import ContactHeader from "./components/ContactHeader.vue"
import ContactView from "./components/ContactView.vue"
</script>

<div class="full-width-container">
  <ContactHeader/>
</div>

<ContactView/>

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