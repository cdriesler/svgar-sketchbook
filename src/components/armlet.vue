<template>
    <div id="armlet" class="svgar-canvas" ref="svgar">
    <div 
    class="svgar-content"
    @pointerdown="onStart"
    @pointermove="onMove"
    @pointerup="onEnd"
    id="target">
    </div>
    <h1>armlet</h1>
    <a href="https://github.com/cdriesler/svgar-sketchbook/blob/master/src/components/armlet.vue" target="_blank">source</a>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import * as Svgar from 'svgar'

class Universe {

  public entities: GameEntity[] = [];
  public scene: Svgar.Cube;

  constructor() {
    this.scene = new Svgar.Cube();
  }

  // Update all entities
  public update(): void {
    this.entities.forEach((e) => e.update());
  }

  // Run all entity interactions
  public interact(): void {
    this.entities.forEach((e) => e.interact());
  }

  // Redraw all entities
  public redraw(f: number): void {
    this.scene.elements!.remove((el) => !el.tags.includes('static'));
    this.entities.forEach((e) => e.draw(f));
  }

}

interface Point3d {
  x: number,
  y: number,
  z: number
}

interface GameEntity {
  type: string;
  position: Point3d;
  velocity: Point3d;
  size: number;
  id: string;
  update: () => void;
  interact: () => void;
  draw: (f: number) => void;
}

export default Vue.extend({
  data() {
    return {
      svgar: {} as Svgar.Cube,
      prevTick: 0,
      lag: 0,
      universe: {} as Universe,
      prevMove: 0,
      isMoving: false,
      x: 0,
      y: 0
    }
  },
  mounted() {
    const el: Element = this.$refs.svgar as Element;
    const s = el.clientWidth
    const u = new Universe();
    u.scene.w = u.scene.h = s;

    this.universe = u;

    u.scene.initialize().then(() => {
      this.stage();
      window.requestAnimationFrame(this.loop)
    })
  },
  methods: {
    loop(time: DOMHighResTimeStamp): void {
      const t = Date.now();
      if (this.prevTick == 0) {
        this.prevTick = t;
      }
      const elapsed = t - this.prevTick;
      this.prevTick = t;
      this.lag = this.lag + elapsed;

      while (this.lag >= 200) {
        this.universe.update();
        this.universe.interact();
        this.lag = this.lag - 200;
      }
      
      this.universe.redraw(this.lag / 200);
      this.universe.scene.render();
      (document.getElementById('target') as Element).innerHTML = this.universe.scene.svg;
      window.requestAnimationFrame(this.loop)
    },
    stage(): void {
      
    },
    onStart(event: PointerEvent): void {

    },
    onMove(event: PointerEvent): void {

    },
    onEnd(event: PointerEvent): void {

    }
  }
})
</script>

<style scoped>
#rubric > :first-child {
  background: #222222;
  overflow: hidden;
}

#rubric > :first-child > :first-child {
  transform: scale(1.05);
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