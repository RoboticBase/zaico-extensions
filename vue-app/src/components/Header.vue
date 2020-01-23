<template>
  <div class="header container">
    <b-navbar>
      <b-navbar-brand>UOA-POC2</b-navbar-brand>
      <b-navbar-nav class="ml-auto">
        <b-nav-form right>
          <b-button variant="outline-dark" class="btn-sm cart" :to="{ name: 'cart' }">カート</b-button>
          <b-button variant="outline-dark" class="btn-sm histories" :to="{ name: 'histories' }">注文履歴</b-button>
        </b-nav-form>
      </b-navbar-nav>
    </b-navbar>
  </div>
</template>

<script>
export default {
  name: 'hdr',
  data: function () {
    return {}
  },
}
</script>

<style scoped>
div.header {
  text-align: center;
}
</style>
