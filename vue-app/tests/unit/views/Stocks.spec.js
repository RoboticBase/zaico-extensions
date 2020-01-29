import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'

import Stocks from '@/views/Stocks.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('Stocks.vue', () => {
  let store = null
  let state = null
  let actions = null

  beforeEach(() => {
    state = {
      stocks: [],
    }
    actions = {
      listStocksAction: jest.fn(),
    }
    store = new Vuex.Store({
      state: state,
      actions: actions,
      getters: {
        stocks: (state) => state.stocks,
        message: () => '',
        variant: () => '',
      },
    })
  })

  it.each([
    [[]],
    [
      [
        {id: 'i01', title: 't01', place: 'p01', quantity: 1, unit: 'unit', item_image: {url: 'http://localhost/img/01.jpg'}}
      ]
    ],
    [
      [
        {id: 'i01', title: 't01', place: 'p01', quantity: 1, unit: 'unit', item_image: {url: 'http://localhost/img/01.jpg'}},
        {id: 'i02', title: 't02', place: 'p02', quantity: 2, unit: 'unit', item_image: {url: 'http://localhost/img/02.jpg'}}
      ]
    ],
  ])('renders sotck(s)=%j', (stocks) => {
    state.stocks = stocks

    const wrapper = mount(Stocks, {store, localVue, stubs: {BButton: RouterLinkStub}})
    expect(wrapper.attributes()).toMatchObject({class: 'stocks container'})
    expect(wrapper.find('div.stocks').find('div.header').exists()).toBeTruthy()
    expect(wrapper.find('div.stocks').find('div.subtitle').exists()).toBeFalsy()
    expect(wrapper.find('div.stocks').find('div.alert').exists()).toBeTruthy()
    expect(actions.listStocksAction).toHaveBeenCalledTimes(1)

    const cards = wrapper.find('div.stocks').findAll('div.card')
    expect(cards.length).toBe(stocks.length)
    if (stocks.length > 0) {
      expect(wrapper.find('div.stocks').find('span.empty-stock').exists()).toBeFalsy()
      cards.wrappers.forEach((elem, idx) => {
        const i = idx + 1
        expect(elem.find('img.card-img-top').attributes('src')).toMatch(`http://localhost/img/0${i}.jpg`)
        expect(elem.find('h5.card-title').text()).toMatch(`t0${i}`)
        expect(elem.findAll('p.card-text').at(0).text()).toMatch(`倉庫：p0${i}`)
        expect(elem.findAll('p.card-text').at(1).text()).toMatch(`在庫数：${i}unit`)

        const buttons = elem.findAll(RouterLinkStub)
        expect(buttons.length).toBe(1)
        expect(buttons.at(0).props().to).toMatchObject({name: 'detail', params: {stock: stocks[idx], idx: idx}})
      })
    } else {
      expect(wrapper.find('div.stocks').find('span.empty-stock').exists()).toBeTruthy()
      expect(wrapper.find('div.stocks').find('span.empty-stock').text()).toMatch('読込中')
      expect(cards.length).toBe(0)
    }
  })
})
