<template>
  <div class="shipping container">
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
    ...mapActions(['listDestinationsAction']),

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
