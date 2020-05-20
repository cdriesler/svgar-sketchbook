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
      this.universe.scene.elements!.add.svgar.polyline([
        {x: s, y: s, z: s},
        {x: s, y: s, z: -s},
        {x: -s, y: -s, z: -s},
        {x: -s, y: -s, z: s}
      ], true)
        .then((el) => {el.tags = ['static']; el.material['stroke'] = 'white'; el.material['stroke-width'] = '0.35mm';})
      this.universe.scene.elements!.add.svgar.polyline([
        {x: -s, y: s, z: s},
        {x: -s, y: s, z: -s},
        {x: s, y: -s, z: -s},
        {x: s, y: -s, z: s}
      ], true)
        .then((el) => {el.tags = ['static']; el.material['stroke'] = 'white'; el.material['stroke-width'] = '0.35mm';})
      // this.universe.scene.elements!.add.svgar.box({x: -s, y: -s, z: -s}, {x: s, y: s, z: s})
      //   .then((el) => el.tags = ['static'])
      this.isDrawn = true;
    }
  }

}

function distance(a: Point3d, b: Point3d): number {
  return Math.sqrt(Math.pow((b.x - a.x), 2) + Math.pow((b.y - a.y), 2) + Math.pow((b.z - a.z), 2))
}

class BubbleEntity implements GameEntity {

  private universe: Universe;
  public type = 'bubble'
  public readonly id: string;
  public position: Point3d;
  public velocity: Point3d;
  public size: number;
  private isColliding = false;

  constructor(universe: Universe, position: Point3d, velocity: Point3d, radius: number) {
    this.universe = universe;
    this.id = newGuid();

    this.position = position;
    this.velocity = velocity;
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

    this.isColliding = false;

    this.universe.entities.forEach((e) => {
      if (this.isColliding) {
        return;
      }

      if (e.type === 'bubble' && e.id !== this.id) {
        const min = this.size + e.size;
        const dist = distance(this.position, e.position);
        this.isColliding = dist < min;
      }
    })

  }

  public draw(f: number): void {
    const p = this.position;
    const v = this.velocity;

    const tx = p.x + (v.x * f)
    const ty = p.y + (v.y * f)
    const tz = p.z + (v.z * f)

    const material = {
      'fill': `${this.isColliding ? '#444444' : '#222222'}`,
      'stroke': 'white',
      'stroke-width': '0.7mm'
    }

    const lineMaterial = {
      'fill': 'none',
      'stroke': 'white',
      'stroke-width': '0.2mm'
    }

    const [i, j, k] = this.universe.scene.camera!.compile()

    this.universe.scene.elements!.add.svgar.sphere({
      x: -k.x + tx, 
      y: -k.y + ty, 
      z: -k.z + tz,},
      0.025)
      .then((el) => {el.material = material})
    this.universe.scene.elements!.add.svgar.sphere({
      x: tx, 
      y: ty, 
      z: tz},
      this.size)
      .then((el) => {el.material = material})
    
    //this.universe.scene.elements!.add.svgar.lineCurve({x: tx, y: ty, z: tz - this.size}, {x: tx, y: ty, z: -5}).then((el) => el.material = lineMaterial)
    this.universe.scene.elements!.add.svgar.lineCurve({x: tx, y: ty, z: tz + this.size}, {x: tx, y: ty, z: 5}).then((el) => el.material = lineMaterial)
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
      for(let i = 0; i < 10; i++) {
        const xr = Math.random() - 0.5;
        const yr = Math.random() - 0.5;
        const zr = Math.random() - 0.5;

        this.universe.entities.push(new BubbleEntity(
          this.universe,
          {x: xr * 3, y: yr * 3, z: zr *3},
          {x: xr * 0.8, y: yr * 0.8, z: zr * 0.8},
          (zr + 0.8)
        ))
      }
      this.universe.scene.camera!.extents = { w: 11, h: 11 }
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