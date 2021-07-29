<template>
  <div class="wrapper">
    <h2>App Default.</h2>
    <h3>
      <HellowWorld v-bind:name="name" />
    </h3>
    <h4>This is a random number: {{ random }}</h4>
  </div>
</template>

<script>
import HellowWorld from './../components/HelloWorld.vue'
import randomCountryName from 'random-country-name'
import { random } from './../../modules/lib'

export default {
  components: {
    HellowWorld,
  },

  data() {
    return {
      name: randomCountryName.random(),
      random: random(),
    }
  },

  methods: {},
}
</script>
