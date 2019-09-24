<template>
  <div class="stocks container">
    <Header/>
    <div v-if="message">
      <b-alert :variant="variant" show>{{ message }}</b-alert>
    </div>
    <h3>在庫引当と出荷指示</h3>
    <table class="table">
      <thead>
        <tr>
          <th scope="col">JANコード</th>
          <th scope="col">物品名</th>
          <th scope="col">カテゴリ</th>
          <th scope="col">保管場所</th>
          <th scope="col">現在数量</th>
          <th scope="col">引当数量</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="stock in stocks" :key="stock.id">
          <td>{{ stock.code }}</td>
          <td>{{ stock.title }}</td>
          <td>{{ stock.category }}</td>
          <td>{{ stock.place }}</td>
          <td>{{ parseInt(stock.quantity) + stock.unit }}</td>
          <td class="form-group"><input type="number" class="form-control" v-model="stock.reservation"/></td>
        </tr>
      </tbody>
    </table>
    <Shipping/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Shipping from '@/components/Shipping.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'stocks',
  components: {
    Header,
    Shipping
  },
  created: function () {
    this.listStocksAction()
  },
  computed: {
    ...mapGetters(['stocks', 'message', 'variant'])
  },
  methods: {
    ...mapActions(['listStocksAction']),
  }
}
</script>
