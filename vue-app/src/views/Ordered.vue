<template>
  <div class="ordered container">
    <Header/>
    <div v-if="data">
      <SubTitle subtitle="注文完了"/>
      <p class="msg">注文を受け付けました。配送ロボット（{{data.delivery_robot.id}}）が商品を配送します。</p>
      <p class="msg">お届け先：{{ data.destination.name }}</p>
      <p class="msg">お届けする商品</p>
      <div class="row">
        <div class="col-sm-6 col-md-3" v-for="item in data.updated" :key="item.id">
          <div class="card img-thumbnail">
            <img class="card-img-top" :src="item.item_image.url">
            <div class="card-body px-2 py-3">
              <h5 class="card-title">{{ item.title }}</h5>
              <p class="card-text">カテゴリ：{{ item.category }}</p>
              <p class="card-text">JANコード：{{ item.code }}</p>
              <p class="card-text">倉庫：{{ item.place }}</p>
              <p class="card-text">注文数：{{ parseInt(item.reservation) + item.unit }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
    <Alert/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import SubTitle from '@/components/SubTitle.vue'
import Alert from '@/components/Alert.vue'

export default {
  name: 'ordered',
  components: {
    Header,
    SubTitle,
    Alert
  },
  computed: {
    data () {
      return (this.$route.params && 'data' in this.$route.params ? this.$route.params.data : undefined)
    },
  },
  mounted () {
    if (!this.data) {
      this.$router.push({name: 'stocks'})
    }
  },
  beforeRouteLeave (to, from , next) {
    this.$store.commit('resetStocks')
    next()
  },
}
</script>
