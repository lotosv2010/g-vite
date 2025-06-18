<template>
  <h1>App</h1>
  <p>{{ msg }}</p>
</template>

<script>
import { msg } from './msg.js'
export default {
  name: 'App',
  data() {
    return {
      msg
    }
  }
}
</script>

<style>
body {
  margin: 0;
  min-height: 100vh;
  width: 100vw;
  background-color: beige;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
h1 {
  color: brown;
  margin: 0;
}
p {
  color: darkorange;
}
</style>