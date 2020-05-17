<template>
  <div id="app">
    <main>
      <router-view/>
    </main>
    <footer>
      powered by <a href="https://github.com/cdriesler/svgar" target="_blank">svgar</a>
    </footer>
  </div>
</template>

<style>
html * {
  padding: 0;
  margin: 0;
}

#app {
  font-family: 'Inter', sans-serif;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.svgar-canvas {
  width: 100%;
  max-width: 500px;
  min-height: 500px;
  background: grey;
}

main {
  width: 100%;
  flex-grow: 1;
}

footer {
  width: 100%;
  height: 50px;
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
}

a {
  margin-left: 5px;
}
</style>
