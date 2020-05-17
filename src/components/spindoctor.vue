<template>
  <div id="spindoctor" class="svgar-canvas" ref="svgar">
    <div 
    class="svgar-content"
    v-html="svgar.svg"
    @pointerdown="onStart"
    @pointermove="onMove"
    @pointerup="onEnd">
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as Svgar from 'svgar'

export default Vue.extend({
  data() {
    return {
      s: 0,
      svg: '',
      svgar: {} as Svgar.Cube,
      cameraPosition: 270,
      isMoving: false,
      prev: 0,
      x: 0,
    }
  },
  mounted() {
    const el: Element = this.$refs.svgar as Element;
    this.s = el.clientWidth

    const svgar = new Svgar.Cube();
    svgar.w = this.s;
    svgar.h = this.s;

    this.svgar = svgar;

    svgar.initialize().then(() => {
      this.stageScene();
    })
  },
  methods: {
    refresh(): void {
      this.svgar.render();
      console.log(Date.now())
    },
    stageScene(): void {
      const svgar: Svgar.Cube = this.svgar;

      const [x, y, z] = this.getCameraCoordinates();

      svgar.camera!.position = { x: x, y: y, z: z }
      svgar.camera!.target(0, 0, 0)

      svgar.elements!.add.svgar.box({x: -1, y: -1, z: -1}, {x: 1, y: 1, z: 1}).then((el) => {
        el.material['fill'] = 'white'
      })

      svgar.render();

      setInterval(() => {this.refresh()}, 20)
    },
    rotateCamera(degrees: number): void {
      this.cameraPosition = (this.cameraPosition + degrees) % 360
      const [x, y, z] = this.getCameraCoordinates();
      this.svgar.camera!.pan(degrees * (Math.PI/180))
      const [i, j, k] = this.svgar.camera!.compile();
      this.svgar.camera!.position = { x: k.x * 5, y: k.y * 5, z: k.z * 5 }
      //this.svgar.render()
    },
    getCameraCoordinates(): [number, number, number] {
      const rad = this.cameraPosition * (Math.PI / 180);
      const x = Math.cos(rad);
      const y = Math.sin(rad);

      return [ x * 5, y * 5, 3.5];
    },
    onStart(event: PointerEvent): void {
      this.isMoving = true;
      this.prev = Date.now();
      this.x = event.clientX;
    },
    onMove(event: PointerEvent): void {
      if (Date.now() - this.prev < 25 || !this.isMoving) {
        return;
      }
      const speed = 1;
      const x = event.clientX;
      const dx = x - this.x;
      this.rotateCamera(dx * speed);
      this.x = x;
      this.prev = Date.now();
    },
    onEnd(): void {
      this.isMoving = false;
    }
  }
})
</script>

<style scoped>

</style>