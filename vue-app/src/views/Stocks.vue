<template>
  <div class="stocks">
    <Header/>
    <div>
      <ul>
        <li v-for="stock in stocks" :stock="stock" :key="stock.id">
          {{stock.id}}&nbsp;{{stock.title}}
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import Header from "@/components/Header.vue"
import { mapActions, mapGetters } from "vuex"


export default {
  name: 'stocks',
  components: {
    Header
  },
  created: function () {
    this.listStocksAction()
  },
  computed: {
    ...mapGetters(['stocks'])
  },
  methods: {
    ...mapActions(['listStocksAction'])
  }
}
</script>
