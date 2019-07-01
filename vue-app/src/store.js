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
    stocks: []
  },
  actions: {
    listStocksAction(context) {
      listStocks().then(data => {
        context.commit('listStocks', data)
      })
    }
  },
  mutations: {
    listStocks(state, data) {
      state.stocks = data
    }
  },
  getters: {
    stocks: (state) => state.stocks
  }
})

export default store
