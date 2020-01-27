import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

import Detail from '@/views/Detail.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('Detail.vue', () => {
  let $router = null
  let store = null
  let mutations = null

  beforeEach(() => {
    mutations = {
      updateStock: jest.fn(),
    }

    store = new Vuex.Store({
      mutations: mutations,
      getters: {
        message: () => '',
        variant: () => '',
      },
    })
    $router = {
      push: jest.fn()
    }
  })

  it.each([
    [{}],
    [{params: {}}],
    [{params: {stock: null}}],
  ])('redirect to stocks view when $route.params does not have stock (%j)', ($route) => {
    mount(Detail, {store, localVue, mocks: {$router, $route}})
    expect($router.push).toHaveBeenCalledTimes(1)
    expect($router.push).toHaveBeenCalledWith({name: 'stocks'})
  })

  it.each([
    [{
      id: 'i01',
      category: 'category',
      code: 'c01',
      title: 't01',
      place: 'p01',
      quantity: 1,
      unit: 'unit',
      item_image: {
        url: 'http://localhost/img/01.jpg'
      }
    }],
    [{
      id: 'i02',
      category: 'category',
      code: 'c02',
      title: 't02',
      place: 'p02',
      quantity: 2,
      unit: 'unit',
      item_image: {
        url: 'http://localhost/img/02.jpg'
      },
      reservation: 1,
    }],
  ])('renders detail view stock=%j', async (stock) => {
    const $route = {params: {stock: stock}}
    const wrapper = mount(Detail, {store, localVue, mocks: {$router, $route}})
    const reservation = stock.reservation !== undefined ? stock.reservation : 0
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes()).toMatchObject({class: 'detail container'})
    expect(wrapper.find('div.detail').find('div.header').exists()).toBeTruthy()
    expect(wrapper.find('div.detail').find('div.subtitle').exists()).toBeTruthy()
    expect(wrapper.find('div.detail').find('div.alert').exists()).toBeTruthy()
    const card = wrapper.find('div.detail').find('div.card')
    expect(card.find('img.card-img-top').attributes('src')).toMatch(stock.item_image.url)
    expect(card.find('h5.card-title').text()).toMatch(stock.title)
    expect(card.findAll('p.card-text').at(0).text()).toMatch(`カテゴリ：${stock.category}`)
    expect(card.findAll('p.card-text').at(1).text()).toMatch(`JANコード：${stock.code}`)
    expect(card.findAll('p.card-text').at(2).text()).toMatch(`倉庫：${stock.place}`)
    expect(card.findAll('p.card-text').at(3).text()).toMatch(`在庫数：${stock.quantity}${stock.unit}`)
    expect(wrapper.vm.$data.reservation).toBe(reservation)
    expect(card.find('input.reservation').element.value).toMatch(`${reservation}`)
    expect(card.find('button.reserve').text()).toMatch('カートに入れる')
  })

  describe.each([
    [{
      id: 'i01',
      category: 'category',
      code: 'c01',
      title: 't01',
      place: 'p01',
      quantity: 2,
      unit: 'unit',
      item_image: {
        url: 'http://localhost/img/01.jpg'
      }
    }],
    [{
      id: 'i02',
      category: 'category',
      code: 'c02',
      title: 't02',
      place: 'p02',
      quantity: 2,
      unit: 'unit',
      item_image: {
        url: 'http://localhost/img/02.jpg'
      },
      reservation: 1,
    }],
  ])('', (stock) => {
    it.each([
      [{idx: 0, stock: stock}, {idx: 0, stock: stock}],
      [{stock: stock}, {idx: undefined, stock: stock}]
    ])('updates sotcks and redirect to sotcks view, params=%j', async (params, expected) => {
      const $route = {params: params}
      const wrapper = mount(Detail, {store, localVue, mocks: {$router, $route}})
      const reservation = stock.reservation !== undefined ? stock.reservation : 0
      await wrapper.vm.$nextTick()
      expect(wrapper.vm.$data.reservation).toBe(reservation)
      expect(wrapper.find('div.detail').find('div.card').find('input.reservation').element.value).toMatch(`${reservation}`)

      wrapper.find('div.detail').find('div.card').find('input.reservation').setValue("2")
      wrapper.find('div.detail').find('div.card').find('button.reserve').trigger('click')
      await wrapper.vm.$nextTick()

      expect(wrapper.vm.$data.reservation).toBe(2)
      expect(mutations.updateStock).toHaveBeenCalledTimes(1)
      expect(mutations.updateStock.mock.calls[0][1]).toMatchObject(expected)
      expect($router.push).toHaveBeenCalledTimes(1)
      expect($router.push).toHaveBeenCalledWith({name: 'stocks'})
    })
  })
})
