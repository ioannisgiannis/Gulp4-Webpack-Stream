export default {
  data() {
    return {
      counter: 0,
    }
  },
  mounted() {
    console.log('mounted Counter')
    setInterval(() => {
      this.counter++
    }, 500)
  },
}
