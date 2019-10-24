<template>
  <div class="cart container">
    <Header/>
    <div class="row">
      <div class="col-8">
        <h4>カートの内容</h4>
      </div>
      <div class="col">
        <b-button :to="{ name: 'stocks'}" variant="outline-default">戻る</b-button>
      </div>
    </div>
    <div class="row">
      <div class="col-sm-6 col-md-3" v-for="item in items" :key="item.id">
        <div class="card img-thumbnail">
          <img class="card-img-top" src="{{ item.img }}">
          <div class="card-body px-2 py-3">
            <h5 class="card-title">{{ item.title }}</h5>
            <p class="card-text">カテゴリ：{{ item.category }}</p>
            <p class="card-text">JANコード：{{ item.code }}</p>
            <p class="card-text">倉庫：{{ item.place }}</p>
            <p class="card-text">在庫数：{{ parseInt(item.quantity) + item.unit }}</p>
            <p class="card-text">注文数：{{ parseInt(item.reservation) + item.unit }}</p>
          </div>
        </div>
      </div>
    </div>
    <div v-if="items.length > 0">
      <Shipping/>
    </div>
    <Alert/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Alert from '@/components/Alert.vue'
import Shipping from '@/components/Shipping.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'cart',
  components: {
    Header,
    Alert,
    Shipping
  },
  computed: {
    ...mapGetters(['stocks']),
    items () {
      return this.stocks.filter((stock) => {
          return stock.reservation != 0
      })
    },
  },
}
</script>

