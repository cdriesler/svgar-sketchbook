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
  private speed = 1.5;

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

function distance(a: Point3d, b: Point3d): number {
  return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2) + Math.pow((b.z - a.z), 2))
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
    const c = this.universe.scene.camera!.position;
    const dist = distance(p, c);
    const opacity = (dist - 5) / 9;
    this.universe.scene.elements!.add.svgar.sphere({x: p.x, y: p.y, z: p.z}, 0.05).then((el) => {
      el.material['opacity'] = opacity.toString()
    })
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
      ).then((el) => {
      el.material['opacity'] = opacity.toString()
    })
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

      this.universe.scene.camera!.tilt(90, true)
      this.universe.scene.camera!.rotate(90, true)
      const [i, j, k] = this.universe.scene.camera!.compile();
      this.universe.scene.camera!.position = {x: k.x * 10, y: k.y * 10, z: k.z * 10}
    },
    onStart(event: PointerEvent): void {
      this.isMoving = true;
      this.x = event.clientX;
      this.y = event.clientY;
      this.prevMove = Date.now();
    },
    onMove(event: PointerEvent): void {
      const t = Date.now();
      if (t - this.prevMove < 50 || !this.isMoving) {
        return;
      }

      const x = event.clientX;
      const y = event.clientY;
      const dx = x - this.x;
      const dy = y - this.y;
      this.x = x;
      this.y = y;

      const speed = 2;

      this.universe.scene.camera!.pan(dx * speed, true);
      this.universe.scene.camera!.tilt(dy * -speed, true);
      const [i, j, k] = this.universe.scene.camera!.compile();
      this.universe.scene.camera!.position = {x: k.x * 10, y: k.y * 10, z: k.z * 10}
    },
    onEnd(event: PointerEvent): void {
      this.isMoving = false;
    }
  }
})
</script>

<style scoped>
#armlet > :first-child {
  background: gainsboro;
  overflow: hidden;
}

#armlet > :first-child > :first-child {
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