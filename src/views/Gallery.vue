<template>
  <div id="gallery">
    <div class="content">
      <router-view />
      <div v-if="isAtRoot" class="links">
        Links
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
export default Vue.extend({
  data() {
    return {
      isAtRoot: false,
    }
  },
  created() {
    const path = this.$route.path.replace('/', '').replace('/', '')
    if (path === 'i') {
      this.isAtRoot = true
    }
  },
})
</script>

<style scoped>
#gallery {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  align-items: center;
}

.content {
  width: 100%;
  max-width: 1000px;
  min-height: 500px;
  box-sizing: border-box;
  padding: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.description {
  width: 100%;
  height: 80px;
  background: blue;
}
</style>