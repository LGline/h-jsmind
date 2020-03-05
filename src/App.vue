<template>
  <div id="app">
    <Jsmind :jmData="jmData"></Jsmind>
  </div>
</template>

<script>
import Jsmind from '@/components/jsmind.vue'
export default {
  name: 'app',
  components: {Jsmind},
  data() {
    return {
      jmData: {
        mind: {
          "meta": {
            "name": "demo",
            "author": "linguang",
            "version": "1.0",
          },
          "format": "node_tree",
          "data": {
            "id": "root", 
            "topic": "需求规划", 
            "expanded": true,
            "children": []
          }
        },
        options: {
          container: 'jsmind_container',
          editable: true,
          theme: 'myTheme',
          part: {
            start: 76,
            interval: 295,
            count: 4
          }
        }
      }
    }
  },
  mounted() {
    
  },
  methods: {

  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
