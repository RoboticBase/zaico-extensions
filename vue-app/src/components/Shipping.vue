<template>
  <div class="shipping container">
    <div class="row form-group">
      <div class="col-sm-8">
        <label for="destination">送り先:</label>
        <select id="destination" class="form-control" @input="setSelectedDestination($event.target.value)">
          <option v-for="destination in destinations" :key="destination.id" v-bind:value="destination.id">{{ destination.name }}</option>
        </select>
      </div>
      <div class="col-sm-4 align-self-end">
        <b-button :to="{ name: 'stocks'}" variant="outline-default">戻る</b-button>
        <button type="submit" class="btn btn-primary float-right" @click="shipping">注文</button>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'shipping',
  created: function () {
    this.listDestinationsAction()
  },
  computed: {
    ...mapGetters(['stocks', 'destinations', 'selectedDestination'])
  },
  methods: {
    ...mapActions(['listDestinationsAction', 'postShipmentAction']),

    setSelectedDestination(destination) {
      this.$store.commit('setSelectedDestination', destination)
    },

    shipping() {
      let items = this.stocks.filter((stock) => stock.reservation > 0).map((stock) => {
        return {
          id: stock.id,
          reservation: stock.reservation
        }
      })

      if (this.selectedDestination != '' && items.length > 0) {
        let payload = {
          destination_id: this.selectedDestination,
          items: items,
          cb: () => {
            this.$store.commit('resetStocks')
            this.$router.push({name: 'stocks'})
          }
        }
        this.$store.commit('updateMessage', {message: '処理中', variant: 'info'})
        this.postShipmentAction(payload)
      } else {
        this.$store.commit('updateMessage', {message: '入力値に誤りがあります', variant: 'warning'})
      }
    }
  }
}
</script>
