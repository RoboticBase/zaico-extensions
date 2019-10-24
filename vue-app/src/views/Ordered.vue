<template>
  <div class="cart container">
    <Header/>
    <div v-if="data">
      <div class="row">
        <div class="col-8">
          <h4>注文完了</h4>
        </div>
        <div class="col">
          <b-button variant="outline-default" @click="back">戻る</b-button>
        </div>
      </div>
      <p>注文を受け付けました。配送ロボット（{{data.delivery_robot.id}}）が商品を配送します。</p>
      <p>お届け先：{{ data.destination.name }}</p>
    </div>
    <Alert/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Alert from '@/components/Alert.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'ordered',
  components: {
    Header,
    Alert
  },
  computed: {
    data () {
      return this.$route.params.data
    },
    itemStr () {
      return this.$route.params.itemStr
    },
  },
  mounted () {
    if (!this.data) {
      this.$router.push({name: 'stocks'})
    }
  },
  methods: {
    back () {
      this.$store.commit('resetStocks')
      this.$router.push({name: 'stocks'})
    },
  },
}
</script>
