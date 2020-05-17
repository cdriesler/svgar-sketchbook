<template>
  <div id="rubric" class="svgar-canvas" ref="svgar">
    <div 
    class="svgar-content"
    v-html="svgar.svg"
    @pointerdown="onStart"
    @pointermove="onMove"
    @pointerup="onEnd">
    </div>
    <h1>rubric</h1>
    <a href="https://github.com/cdriesler/svgar-sketchbook/blob/master/src/components/rubric.vue" target="_blank">source</a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as Svgar from 'svgar'

interface BoxElement {
  anchor: {
    x: number,
    y: number,
    z: number
  }
  scalar: {
    x: number,
    y: number,
    z: number
  }
}

export default Vue.extend({
  data() {
    return {
      tick: 0,
      s: 0,
      svg: '',
      svgar: {} as Svgar.Cube,
      boxMap: [] as BoxElement[],
      cameraPosition: 270,
      isMoving: false,
      prev: 0,
      x: 0,
      animationPosition: 270,
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
  watch: {
    tick(prevVal: any, val: any): void {
      this.animate();
      this.redraw();
    }
  },
  methods: {
    doTick(): void {
      this.tick = this.tick + 1;
    },
    redraw(): void {
      this.svgar.elements!.reset();

      // Box size
      const size = 1;
      const d = size / 2;

      this.boxMap.forEach((box) => {
        const x = box.anchor.x * box.scalar.x;
        const y = box.anchor.y * box.scalar.y;
        const z = box.anchor.z * box.scalar.z;

        this.svgar.elements!.add.svgar.box({ x: x - d, y: y - d, z: z - d }, {x: x + d, y: y + d, z: z + d})
          .then((el) => el.material['fill'] = `rgba(255, 255, 255, ${1 - ((box.scalar.x - 1) / 2)}`)
      })

      this.svgar.render();
    },
    animate(): void {
      const speed = 5;
      this.animationPosition = (this.animationPosition += speed) % 360;
      const rad = this.animationPosition * (Math.PI / 180);
      const t = (Math.sin(rad) + 1) / 2;
      const max = 2;
      const dt = 1 + (t * (max - 1));
      this.boxMap.forEach((box) => {
        box.scalar.x = dt;
        box.scalar.y = dt;
      })
    },
    stageScene(): void {
      const svgar: Svgar.Cube = this.svgar;

      const [x, y, z] = this.getCameraCoordinates();

      svgar.camera!.position = { x: x, y: y, z: z }
      svgar.camera!.target(0, 0, 0)

      // svgar.elements!.add.svgar.box({x: -1, y: -1, z: -1}, {x: 1, y: 1, z: 1}).then((el) => {
      //   el.material['fill'] = 'white'
      // })

      const d = 1.5;
      const s = 1;
      const n = 4;

      const dt = n * d;
      const o = d * 1.5;

      for (let i = 0; i < n; i++ ) {
        for (let j = 0; j < n; j++ ) {
          for (let k = 0; k < n; k++ ) {
            const x = (i * d) - o;
            const y = (j * d) - o;
            const z = (k * d) - o;
            this.stageBox(x, y, z, s);
          }
        }
      }

      this.redraw();

      setInterval(() => {this.doTick()}, 45);

      // setInterval(() => {this.refresh()}, 15)
    },
    stageBox(i: number, j: number, k: number, s: number): void {
      const d = s / 2;
      this.boxMap.push({ anchor: { x: i, y: j, z: k }, scalar: { x: 1, y: 1, z: 1}})
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

      return [ x * 5, y * 5, 2];
    },
    onStart(event: PointerEvent): void {
      this.isMoving = true;
      this.prev = Date.now();
      this.x = event.clientX;
    },
    onMove(event: PointerEvent): void {
      if (Date.now() - this.prev < 35 || !this.isMoving) {
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
#rubric > :first-child {
  background: var(--dark);
}

h1 {
  color: var(--dark);
  margin: 15px;
  font-size: 1.5rem;
}

a {
  color: var(--dark);
}
</style>