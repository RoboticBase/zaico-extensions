import Vue from 'vue'
import Vuex from 'vuex'
import { listStocks, listDestinations } from './api'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    stocks: [],
    destinations: [],
    selectedDestination: ''
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
    }
  },
  mutations: {
    listStocks(state, stocks) {
      state.stocks = stocks
    },

    listDestinations(state, destinations) {
      state.destinations = destinations
    },

    setSelectedDestination(state, destination) {
      state.selectedDestination = destination
    }
  },
  getters: {
    stocks: (state) => state.stocks,
    destinations: (state) => state.destinations,
    selectedDestination: (state) => state.selectedDestination
  }
})

export default store
