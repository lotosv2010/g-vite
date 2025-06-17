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