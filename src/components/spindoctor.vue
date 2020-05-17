<template>
  <div id="spindoctor" class="svgar-canvas" ref="svgar">
    <div class="svgar-content" v-html="svg">
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      s: 0,
      svg: '',
    }
  },
  mounted() {
    const el: Element = this.$refs.svgar as Element;
    this.s = el.clientWidth
  }
})
</script>

<style scoped>

</style>