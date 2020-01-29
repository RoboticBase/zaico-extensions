import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

import Cart from '@/views/Cart.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('Cart.vue', () => {
  let state = null
  let store = null

  beforeEach(() => {
    state = {
      stocks: [],
    }
    store = new Vuex.Store({
      state: state,
      actions: {
        listDestinationsAction: jest.fn(),
      },
      getters: {
        stocks: (state) => state.stocks,
        destinations: () => [{id: '', name: ''}, {id: '1', name: 'd01'}],
        message: () => '',
        variant: () => '',
      },
    })
  })

  it.each([
    [
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 1,
        }
      ],
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 1,
        }
      ]
    ],
    [
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 0,
        }, {
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
          reservation: 2,
        }
      ],
      [
        {
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
          reservation: 2,
        }
      ]
    ],
    [
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 1,
        }, {
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
          reservation: 2,
        }
      ],
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 1,
        }, {
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
          reservation: 2,
        }
      ]
    ],
    [
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
          reservation: 0,
        }
      ],
      []
    ],
    [
      [
        {
          id: 'i01',
          category: 'category',
          code: 'c01',
          title: 't01',
          place: 'p01',
          quantity: 1,
          unit: 'unit',
          item_image: {
            url: 'http://localhost/img/01.jpg'
          },
        }
      ],
      []
    ],
    [
      [],
      []
    ]
  ])('renders cart view, stocks=%j', async (stocks, items) => {
    state.stocks = stocks
    const wrapper = mount(Cart, {store, localVue})
    await wrapper.vm.$nextTick()
    expect(wrapper.attributes()).toMatchObject({class: 'cart container'})
    expect(wrapper.find('div.cart').find('div.header').exists()).toBeTruthy()
    expect(wrapper.find('div.cart').find('div.subtitle').exists()).toBeTruthy()
    expect(wrapper.find('div.cart').find('div.subtitle').find('span.subtitle').text()).toMatch('カートの内容')
    expect(wrapper.find('div.cart').find('div.alert').exists()).toBeTruthy()
    if (items.length > 0) {
      expect(wrapper.find('div.cart').find('div.shipping').exists()).toBeTruthy()
      const cards = wrapper.find('div.cart').findAll('div.card')
      expect(cards.length).toBe(items.length)
      cards.wrappers.forEach((card, idx) => {
        expect(card.find('img.card-img-top').attributes('src')).toMatch(items[idx].item_image.url)
        expect(card.find('h5.card-title').text()).toMatch(items[idx].title)
        expect(card.findAll('p.card-text').at(0).text()).toMatch(`カテゴリ：${items[idx].category}`)
        expect(card.findAll('p.card-text').at(1).text()).toMatch(`JANコード：${items[idx].code}`)
        expect(card.findAll('p.card-text').at(2).text()).toMatch(`倉庫：${items[idx].place}`)
        expect(card.findAll('p.card-text').at(3).text()).toMatch(`在庫数：${items[idx].quantity}${items[idx].unit}`)
        expect(card.findAll('p.card-text').at(4).text()).toMatch(`注文数：${items[idx].reservation}${items[idx].unit}`)
      })
    } else {
      expect(wrapper.find('div.cart').find('div.shipping').exists()).toBeFalsy()
      expect(wrapper.find('div.cart').findAll('div.card').length).toBe(0)
    }
  })
})
