<template>
  <div class="detail container">
    <Header/>
    <div v-if="stock">
      <div class="card img-thumbnail">
        <img class="card-img-top" :src="stock.item_image.url">
        <div class="card-body px-2 py-3">
          <h5 class="card-title">{{ stock.title }}</h5>
          <p class="card-text">カテゴリ：{{ stock.category }}</p>
          <p class="card-text">JANコード：{{ stock.code }}</p>
          <p class="card-text">倉庫：{{ stock.place }}</p>
          <p class="card-text">在庫数：{{ parseInt(stock.quantity) + stock.unit }}</p>
          <p class="card-text form-group">注文数：<input type="number" class="form-control" v-model.number="reservation"/></p>
          <p class="mb-0 form-group"><b-button :to="{ name: 'stocks'}" variant="outline-default">戻る</b-button><b-button @click="reserve" variant="outline-primary">カートに入れる</b-button></p>
        </div>
      </div>
    </div>
    <Alert/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Alert from '@/components/Alert.vue'

export default {
  name: 'detail',
  components: {
    Header,
    Alert
  },
  data () {
    return {
      reservation: 0
    }
  },
  computed: {
    stock () {
      return this.$route.params.stock
    },
    idx () {
      return this.$route.params.idx
    },
  },
  mounted () {
    if (this.$route.params && this.$route.params.stock) {
      this.reservation = this.stock.reservation
    } else {
      this.$router.push({name: 'stocks'})
    }
  },
  methods: {
    reserve () {
      this.stock.reservation = this.reservation
      this.$store.commit('updateStock', {idx: this.idx, stock: this.stock})
      this.$router.push({name: 'stocks'})
    }
  },
}
</script>
