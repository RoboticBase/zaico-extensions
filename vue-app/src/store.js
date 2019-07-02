import Vue from 'vue'
import Vuex from 'vuex'
import { listStocks, listDestinations, postShipment } from './api'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    stocks: [],
    destinations: [],
    selectedDestination: '',
    message: '',
    variant: ''
  },
  actions: {
    listStocksAction(context) {
      listStocks().then(data => {
        let stocks = data.map((elem) => {
            elem.reservation = 0
            return elem
        })
        context.commit('listStocks', stocks)
      })
    },

    listDestinationsAction(context) {
      listDestinations().then(data => {
        context.commit('listDestinations', data)
      })
    },

    postShipmentAction(context, payload) {
      postShipment(payload).then(data => {
        let itemStr = data.updated.reduce((acc, current) => {
          return acc + '[物品名:' + current.title + ', 引当数量:' + current.reservation + ']'
        }, '')
        let message = data.destination.name + 'への出荷指示を行いました ' + itemStr
        context.commit('updateMessage', {message: message, variant: 'success'})
        context.dispatch('listStocksAction')
      })
    },
  },
  mutations: {
    listStocks(state, stocks) {
      state.stocks = stocks
    },

    listDestinations(state, destinations) {
      state.destinations = destinations
    },

    updateMessage(state, val) {
      state.message = val.message
      state.variant = val.variant
    },

    setSelectedDestination(state, destination) {
      state.selectedDestination = destination
    }
  },
  getters: {
    stocks: (state) => state.stocks,
    destinations: (state) => state.destinations,
    message: (state) => state.message,
    variant: (state) => state.variant,
    selectedDestination: (state) => state.selectedDestination
  }
})

export default store
