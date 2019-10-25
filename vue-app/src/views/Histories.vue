<template>
  <div class="histories container">
    <Header/>
    <SubTitle subtitle="注文履歴"/>
    <div v-for="(order, idx) in ordered" :key="idx">
      <b-card no-body class="mx-auto">
        <b-card-header header-tag="header" class="p-1" role="tab">
          <b-button block href="#" v-b-toggle="'accordion-'+idx" variant="default">{{ order.orderDate }}のご注文</b-button>
        </b-card-header>
        <b-collapse v-bind:id="'accordion-'+idx" accordion="my-accordion" role="tabpanel">
          <b-card-body>
            <b-card-text>{{ order.destination.name }}へお届け</b-card-text>
            <div v-for="item in order.updated" :key="item.id">
              <b-card-text><b>{{ item.title}}</b><br/>を{{ item.place }}から{{ parseInt(item.reservation) + item.unit }}</b-card-text>
            </div>
            <div>
              <hr/>
              <b-card-text>受取コード</b-card-text>
              <vue-qrcode :value="targetText(order)" :options="option" tag="img"></vue-qrcode>
            </div>
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
    <Alert/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import SubTitle from '@/components/SubTitle.vue'
import Alert from '@/components/Alert.vue'
import { mapGetters } from 'vuex'
import VueQrcode from "@chenfengyuan/vue-qrcode"

export default {
  name: 'histories',
  components: {
    Header,
    SubTitle,
    Alert,
    VueQrcode
  },
  data () {
    return {
      option: {
        errorCorrectionLevel: "M",
        maskPattern: 0,
        margin: 1,
        scale: 4,
        width: 300,
        color: {
          dark: "#000000FF",
          light: "#FFFFFFFF"
        }
      },
    }
  },
  computed: {
    ...mapGetters(['ordered']),
  },
  methods: {
    targetText (order) {
      let items = order.updated.reduce((acc, current) => {
        return acc + '[title:' + current.title + ', num:' + current.reservation + '] '
      }, '')
      return order.orderDate + ' robot:' + order.delivery_robot.id + ' dest:' + order.destination.name + ' items: ' + items
    },
  },
}
</script>
