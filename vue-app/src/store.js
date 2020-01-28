import Vue from 'vue'
import Vuex from 'vuex'
import { listStocks, listDestinations, postShipment } from '@/api'
import { isArray, isObject } from '@/utils'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    stocks: [],
    destinations: [],
    selectedDestination: '',
    message: '',
    variant: '',
    ordered: []
  },
  actions: {
    listStocksAction(context) {
      if (isArray(context.state.stocks) && context.state.stocks.length == 0) {
        listStocks().then(data => {
          if (!isArray(data)) return
          let stocks = data.filter((elem) => isObject(elem)).map((elem) => {
            elem.reservation = 0
            return elem
          })
          context.commit('listStocks', stocks)
        })
      }
    },

    listDestinationsAction(context) {
      listDestinations().then(data => {
        context.commit('listDestinations', data)
      })
    },

    postShipmentAction(context, payload) {
      postShipment(payload).then(res => {
        if ('is_busy' in res && !res.is_busy && 'is_navi' in res && !res.is_navi) {
          payload.success(res.data)
        } else if (res.is_busy) {
          let message = '待機中の配送ロボットが無いため、注文は取り消されました。少し待ってからもう一度お試しください。'
          payload.failure(message)
        } else if (res.is_navi) {
          let message = '配送ロボット(' + res.data.robot_id + ')は作業中のため、注文は取り消されました。少し待ってからもう一度お試しください。'
          context.commit('updateMessage', {message: message, variant: 'warning'})
          payload.failure(message)
        } else {
          payload.failure('unsupported api result')
        }
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
    },

    updateStock(state, val) {
      if (state.stocks[val.idx]) {
        state.stocks[val.idx] = val.stock
      }
    },

    resetStocks(state) {
      state.stocks = []
    },

    addOrder(state, data) {
      if (isArray(state.ordered) && isObject(data)) {
        data.orderDate = (new Date()).toISOString()
        state.ordered.push(data)
      }
    }
  },
  getters: {
    stocks: (state) => state.stocks,
    destinations: (state) => state.destinations,
    message: (state) => state.message,
    variant: (state) => state.variant,
    selectedDestination: (state) => state.selectedDestination,
    ordered: (state) => state.ordered,
  }
})

export default store
