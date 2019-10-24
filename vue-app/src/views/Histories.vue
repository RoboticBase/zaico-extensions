<template>
  <div class="histories container">
    <Header/>
    <div class="row">
      <div class="col-8">
        <h4>注文履歴</h4>
      </div>
      <div class="col">
        <b-button :to="{ name: 'stocks'}" variant="outline-default">戻る</b-button>
      </div>
    </div>
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
          </b-card-body>
        </b-collapse>
      </b-card>
    </div>
    <Alert/>
  </div>
</template>

<script>
import Header from '@/components/Header.vue'
import Alert from '@/components/Alert.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'histories',
  components: {
    Header,
    Alert
  },
  computed: {
    ...mapGetters(['ordered']),
  }
}
</script>
