<template>
  <div class="home container">
    <Header/>
    <div class="row">
      <div class="col-sm"><router-link class="stock" to="/stocks">在庫引当と出荷指示</router-link></div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue'

export default {
  name: 'home',
  components: {
    Header
  },
  mounted: function() {
    this.$store.commit('updateMessage', {message: '', variant: ''})
  }
}
</script>
