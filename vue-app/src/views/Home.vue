<template>
  <div class="home">
    <Header/>
    <ul>
      <li><router-link to="/stocks">商品一覧</router-link></li>
    </ul>
  </div>
</template>

<script>
// @ is an alias to /src
import Header from '@/components/Header.vue'

export default {
  name: 'home',
  components: {
    Header
  }
}
</script>
