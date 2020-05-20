<template>
  <div id="rubric" class="svgar-canvas" ref="svgar">
    <div 
    class="svgar-content"
    @pointerdown="onStart"
    @pointermove="onMove"
    @pointerup="onEnd"
    id="target">
    </div>
    <h1>lather</h1>
    <a href="https://github.com/cdriesler/svgar-sketchbook/blob/master/src/components/lather.vue" target="_blank">source</a>
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

class ExtentsEntity implements GameEntity {

  private universe: Universe;
  public type = 'extents'
  public readonly id: string;
  public position: Point3d;
  public velocity: Point3d;
  public size: number;
  private isDrawn: boolean = false;

  constructor(universe: Universe, position: Point3d, size: number) {
    this.universe = universe;
    this.id = newGuid();

    this.position = {x: 0, y: 0, z: 0}
    this.velocity = {x: 1, y: 0, z: 0}
    this.size = 10;
  }

  public update(): void {

  }

  public interact(): void {

  }

  public draw(f: number): void {
    if(!this.isDrawn) {
      const s = this.size / 2;
      this.universe.scene.elements!.add.svgar.box({x: -s, y: -s, z: -s}, {x: s, y: s, z: s})
        .then((el) => el.tags = ['static'])
      this.isDrawn = true;
    }
  }

}

class BubbleEntity implements GameEntity {

  private universe: Universe;
  public type = 'bubble'
  public readonly id: string;
  public position: Point3d;
  public velocity: Point3d;
  public size: number;

  constructor(universe: Universe, position: Point3d, radius: number) {
    this.universe = universe;
    this.id = newGuid();

    this.position = position;
    this.velocity = {x: 0.1, y: -0.2, z: 0}
    this.size = radius;
  }

  public update(): void {
    const p = this.position;
    const v = this.velocity;

    this.position = {
      x: p.x + v.x,
      y: p.y + v.y,
      z: p.z + v.z
    }
  }

  public interact(): void {
    const extents = this.universe.entities.find((e) => e.type === 'extents');

    if (!extents) {
      throw new Error('Game universe is unbounded!');
    }

    const min = this.size;
    const max = extents.size / 2

    const dx = max - Math.abs(this.position.x - extents.position.x)
    const dy = max - Math.abs(this.position.y - extents.position.y)
    const dz = max - Math.abs(this.position.z - extents.position.z)

    if (dx < min) {
      this.velocity.x = this.velocity.x * -1
    }

    if (dy < min) {
      this.velocity.y = this.velocity.y * -1
    }

    if (dz < min) {
      this.velocity.z = this.velocity.z * -1
    }
  }

  public draw(f: number): void {
    const p = this.position;
    const v = this.velocity;

    this.universe.scene.elements!.add.svgar.sphere({
      x: p.x + (v.x * f), 
      y: p.y + (v.y * f), 
      z: p.z + (v.z * f)},
      this.size)
  }

}

export default Vue.extend({
  data() {
    return {
      svgar: {} as Svgar.Cube,
      prevTick: 0,
      lag: 0,
      universe: {} as Universe
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

      // Cache inputs

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
      this.universe.entities.push(new ExtentsEntity(this.universe, {x: 0, y: 0, z: 0}, 10))
      this.universe.entities.push(new BubbleEntity(this.universe, {x: 0, y: 0, z: 0}, 1))
      this.universe.scene.camera!.extents = { w: 15, h: 15 }
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