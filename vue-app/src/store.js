import Vue from 'vue'
import Vuex from 'vuex'
import axios from 'axios'

Vue.use(Vuex)

async function listStocks() {
  const endpoint = '/api/v1/stocks/'

  try {
    const res = await axios.get(endpoint)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('error:' + error)
  }
}

const store = new Vuex.Store({
  state: {
    stocks: [],
    destinations: [
      {id: -1, name: ''},
      {id: 1, name: 'LICTiA管理室'},
      {id: 2, name: 'オープンスペース'}
    ],
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
    }
  },
  mutations: {
    listStocks(state, stocks) {
      state.stocks = stocks
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
