<template>
  <div class="subtitle container">
    <div class="row">
      <div class="col-8 my-auto">
        <span class="subtitle">{{ subtitle }}</span>
      </div>
      <div class="col">
        <b-button :to="{ name: 'stocks'}" variant="outline-default" class="float-right">戻る</b-button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'subtitle',
  props: ['subtitle'],
}
</script>

<style scoped>
.subtitle {
  font-size: 1.2em;
}
</style>
