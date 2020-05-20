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

  }

  // Run all entity interactions
  public interact(): void {

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
    }
  }

}

class BubbleEntity implements GameEntity {

  private universe: Universe;
  public readonly id: string;
  public position: Point3d;
  public velocity: Point3d;
  public size: number;

  constructor(universe: Universe) {
    this.universe = universe;
    this.id = newGuid();

    this.position = {x: 0, y: 0, z: 0}
    this.velocity = {x: 1, y: 0, z: 0}
    this.size = 1;
  }

  public update(): void {

  }

  public interact(): void {

  }

  public draw(f: number): void {
    console.log(f)
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
    loop(t: DOMHighResTimeStamp): void {
      if (this.prevTick = 0) {
        this.prevTick = t;
      }

      const elapsed = t - this.prevTick;
      this.prevTick = t;
      this.lag += elapsed;
      //console.log(this.lag)

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