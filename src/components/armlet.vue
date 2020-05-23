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

function newGuid() {
    return 'xxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
    });
}

class PointEntity implements GameEntity {

  private universe: Universe;
  public type = 'Point'
  public readonly id: string;
  public position: Point3d;
  public velocity: Point3d = {x: 0, y: 0, z: 0}
  public size = 0;
  public u: number;
  public v: number;

  constructor(universe: Universe, position: Point3d, u: number, v: number) {
    this.universe = universe;
    this.position = position;
    this.u = u;
    this.v = v;
    this.id = newGuid()
  }

  public update(): void {

  }

  public interact(): void {

  }

  public draw(f: number): void {
    const p = this.position;
    this.universe.scene.elements!.add.svgar.sphere({x: p.x, y: p.y, z: p.z}, 0.05)
    if (this.v !== 4) {
      const next = this.universe.entities.find((e) => {
        if (e.type !== 'Point') {
          return
        }
        const pt = e as PointEntity

        return pt.u === this.u && pt.v === this.v + 1
      })

      if (!next) {
        return
      }

      const n = next.position;

      this.universe.scene.elements!.add.svgar.lineCurve(
        {x: p.x, y: p.y, z: p.z},
        {x: n.x, y: n.y, z: n.z}
      )
    }
  }

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
      const uDivisions = 16
      const uDomain = { start: 0, end: 360 }
      const uStep = (uDomain.end - uDomain.start) / uDivisions
      const vDisivions = 4
      const vDomain = { start: 70, end: 110 }
      const vStep = (vDomain.end - vDomain.start) / vDisivions

      const r = 4

      for (let i = 0; i < uDivisions; i++) {
        // row iterator
        const azimuth = ((i * uStep) + uDomain.start) * (Math.PI / 180)

        for (let j = 0; j < vDisivions + 1; j++) {
          // column iterator
          const polar = ((j * vStep) + vDomain.start) * (Math.PI / 180)

          const x = r * Math.cos(azimuth) * Math.sin(polar)
          const y = r * Math.sin(azimuth) * Math.sin(polar)
          const z = r * Math.cos(polar)

          this.universe.entities.push(new PointEntity(this.universe, {x: x, y: y, z: z}, i, j))
        }

      }

      this.universe.scene.camera!.tilt(45, true)
      this.universe.scene.camera!.pan(-45, true)
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
  background: gainsboro;
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