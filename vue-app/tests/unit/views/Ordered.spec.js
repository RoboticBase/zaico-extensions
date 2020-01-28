import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

import Ordered from '@/views/Ordered.vue'

describe('Ordered.vue', () => {
  const localVue = createLocalVue()
  localVue.use(BootstrapVue)
  localVue.use(Vuex)

  let $router = null
  let mutations = null
  let store = null

  beforeEach(() => {
    mutations = {
      resetStocks: jest.fn(),
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
    [{
      orderDate: '2020-01-02T03:04:05+09:00',
      destination: {
        name: 'd01'
      },
      delivery_robot: {
        id: 'r01'
      },
      updated: []
    }],
    [{
      orderDate: '2020-02-03T04:05:06+09:00',
      destination: {
        name: 'd02'
      },
      delivery_robot: {
        id: 'r02'
      },
      updated: [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 1,
        }
      ]
    }],
    [{
      orderDate: '2020-03-04T05:06:07+09:00',
      destination: {
        name: 'd03'
      },
      delivery_robot: {
        id: 'r03'
      },
      updated: [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 1,
        },
        {
          id: 'i02',
          category: 'category',
          code: 'c02',
          title: 't02',
          place: 'p02',
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/02.jpg'
          },
          reservation: 2,
        }
      ]
    }]
  ])('renders ordered view, data=%j', async (data) => {
    const $route = {params: {data: data}}
    const wrapper = mount(Ordered, {store, localVue, mocks: {$router, $route}})
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes()).toMatchObject({class: 'ordered container'})
    expect(wrapper.find('div.ordered').find('div.header').exists()).toBeTruthy()
    expect(wrapper.find('div.ordered').find('div.subtitle').exists()).toBeTruthy()
    expect(wrapper.find('div.ordered').find('div.subtitle').find('span.subtitle').text()).toMatch('注文完了')
    expect(wrapper.find('div.ordered').find('div.alert').exists()).toBeTruthy()
    const msgs = wrapper.find('div.ordered').findAll('p.msg')
    expect(msgs.length).toBe(3)
    expect(msgs.at(0).text()).toMatch(`注文を受け付けました。配送ロボット（${data.delivery_robot.id}）が商品を配送します。`)
    expect(msgs.at(1).text()).toMatch(`お届け先：${data.destination.name}`)
    expect(msgs.at(2).text()).toMatch('お届けする商品')
    const cards = wrapper.find('div.ordered').findAll('div.card')
    expect(cards.length).toBe(data.updated.length)
    if (data.updated.length > 0) {
      cards.wrappers.forEach((card, idx) => {
        expect(card.find('img.card-img-top').attributes('src')).toMatch(data.updated[idx].item_image.url)
        expect(card.find('h5.card-title').text()).toMatch(data.updated[idx].title)
        expect(card.findAll('p.card-text').length).toBe(4)
        expect(card.findAll('p.card-text').at(0).text()).toMatch(`カテゴリ：${data.updated[idx].category}`)
        expect(card.findAll('p.card-text').at(1).text()).toMatch(`JANコード：${data.updated[idx].code}`)
        expect(card.findAll('p.card-text').at(2).text()).toMatch(`倉庫：${data.updated[idx].place}`)
        expect(card.findAll('p.card-text').at(3).text()).toMatch(`注文数：${data.updated[idx].reservation}${data.updated[idx].unit}`)
      })
    } else {
      expect(cards.length).toBe(0)
    }
  })

  it.each([
    [{}],
    [{params: {}}],
    [{params: {data: null}}],
  ])('redirect to stocks view when $route.params does not have data (%j)', ($route) => {
     mount(Ordered, {store, localVue, mocks: {$router, $route}})
    expect($router.push).toHaveBeenCalledTimes(1)
    expect($router.push).toHaveBeenCalledWith({name: 'stocks'})
  })

  it('calls restoreStocks mutation when leave this view', async () => {
    const data = {
      orderDate: '2020-01-02T03:04:05+09:00',
      destination: {
        name: 'd01'
      },
      delivery_robot: {
        id: 'r01'
      },
      updated: []
    }
    const $route = {params: {data: data}}
    const wrapper = mount(Ordered, {store, localVue, mocks: {$router, $route}})
    const next = jest.fn()
    Ordered.beforeRouteLeave.call(wrapper.vm, undefined, undefined, next)
    await wrapper.vm.$nextTick()
    expect(mutations.resetStocks).toHaveBeenCalledTimes(1)
    expect(mutations.resetStocks.mock.calls[0][1]).toBeUndefined()
    expect(next).toHaveBeenCalledTimes(1)
    expect(next).toHaveBeenCalledWith()
  })
})
