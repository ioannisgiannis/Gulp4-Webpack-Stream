<template>
  <li>
    <span>Hello World! {{ name }}</span>
  </li>
</template>

<script>
export default {
  props: {
    name: {
      required: false,
      type: String,
    },
  },
}
</script>
