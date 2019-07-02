<template>
  <div class="stocks container">
    <Header/>
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
            <td class="form-group"><input type=text class="form-control" v-model="stock.reservation"/></td>
          </tr>
        </tbody>
      </table>
      <div class="row form-group">
        <div class="col-sm-8">
          <label for="destination">出荷先:</label>
          <select id="destination" class="form-control" @input="setSelectedDestination($event.target.value)">
            <option v-for="destination in destinations" :key="destination.id" v-bind:value="destination.id">{{ destination.name }}</option>
          </select>
        </div>
        <div class="col-sm-4 align-self-end">
          <button type="submit" class="btn btn-primary float-right" @click="shipping">出荷指示</button>
        </div>
      </div>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'stocks',
  components: {
    Header
  },
  created: function () {
    this.listStocksAction()
  },
  computed: {
    ...mapGetters(['stocks', 'destinations', 'selectedDestination'])
  },
  methods: {
    ...mapActions(['listStocksAction']),

    setSelectedDestination(destination) {
      this.$store.commit('setSelectedDestination', destination)
    },

    shipping() {
      console.log(this.stocks)
      console.log(this.selectedDestination)
    }
  }
}
</script>
