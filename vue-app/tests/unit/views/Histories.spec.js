import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

import Histories from '@/views/Histories.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('Histories.vue', () => {
  let state = null
  let store = null
  let stubVueQRCode = null

 
  beforeEach(() => {
    state = {
      ordered: [],
    }
    store = new Vuex.Store({
      state: state,
      getters: {
        ordered: (state) => state.ordered,
        message: () => '',
        variant: () => '',
      },
    })
    stubVueQRCode = {
      template: '<div/>',
      props: ['value', 'options', 'tag']
    }
  })

  describe.each([
    [[]],
    [[
      {
        id: 'i01',
        title: 't01',
        place: 'p01',
        reservation: 1,
        unit: 'unit'
      }
    ]],
    [[
      {
        id: 'i01',
        title: 't01',
        place: 'p01',
        reservation: 1,
        unit: 'unit'
      },
      {
        id: 'i02',
        title: 't02',
        place: 'p02',
        reservation: 2,
        unit: 'unit'
      }
    ]]
  ])('', (updated1) => {
    describe.each([
      [[]],
      [[
        {
          id: 'i11',
          title: 't11',
          place: 'p11',
          reservation: 11,
          unit: 'unit'
        }
      ]],
      [[
        {
          id: 'i11',
          title: 't11',
          place: 'p11',
          reservation: 11,
          unit: 'unit'
        },
        {
          id: 'i12',
          title: 't12',
          place: 'p12',
          reservation: 12,
          unit: 'unit'
        }
      ]]
    ])('', (updated2) => {
      it.each([
        [
          [
            {
              orderDate: '2020-01-02T03:04:05+09:00',
              destination: {
                name: 'd01'
              },
              delivery_robot: {
                id: 'r01'
              },
              updated: updated1
            }
          ],
        ],
        [
          [
            {
              orderDate: '2020-01-02T03:04:05+09:00',
              destination: {
                name: 'd01'
              },
              delivery_robot: {
                id: 'r01'
              },
              updated: updated1
            }, {
              orderDate: '2020-11-12T13:14:15+09:00',
              destination: {
                name: 'd02'
              },
              delivery_robot: {
                id: 'r02'
              },
              updated: updated2
            }
          ]
        ],
        [
          []
        ]
      ])('renders histories view, ordered=%j', async (ordered) => {
        state.ordered = ordered
        const wrapper = mount(Histories, {store, localVue, stubs: {'vue-qrcode': stubVueQRCode}})
        await wrapper.vm.$nextTick()
        expect(wrapper.attributes()).toMatchObject({class: 'histories container'})
        expect(wrapper.find('div.histories').find('div.header').exists()).toBeTruthy()
        expect(wrapper.find('div.histories').find('div.subtitle').exists()).toBeTruthy()
        expect(wrapper.find('div.histories').find('div.subtitle').find('span.subtitle').text()).toMatch('注文履歴')
        expect(wrapper.find('div.histories').find('div.alert').exists()).toBeTruthy()
        const cards = wrapper.find('div.histories').findAll('div.card')
        expect(cards.length).toBe(ordered.length)
        const stubVueQRCodes = wrapper.findAll(stubVueQRCode)
        expect(stubVueQRCodes.length).toBe(ordered.length)
        if (ordered.length > 0) {
          expect(wrapper.find('div.histories').find('div.card').exists()).toBeTruthy()
          cards.wrappers.forEach((card, idx) => {
            expect(card.find('header.card-header').find('a.orderDate').text()).toMatch(`${ordered[idx].orderDate}のご注文`)
            expect(card.find('div.card-body').find('p.card-text.destination').text()).toMatch(`${ordered[idx].destination.name}へお届け`)
            const items = card.find('div.card-body').findAll('p.card-text.item')
            expect(items.length).toBe(ordered[idx].updated.length)
            let value = ''
            items.wrappers.forEach((item, i) => {
              const order = ordered[idx].updated[i]
              expect(item.text()).toMatch(`${order.title}を${order.place}から${order.reservation}${order.unit}`)
              value += `[title:${order.title}, num:${order.reservation}] `
            })
            expect(card.find('div.card-body').find('p.card-text.qrcode').text()).toMatch('受取コード')
            value = `${ordered[idx].orderDate} robot:${ordered[idx].delivery_robot.id} dest:${ordered[idx].destination.name} items:${value}`
            expect(wrapper.findAll(stubVueQRCode).wrappers[idx].props().value).toMatch(value)
            expect(wrapper.findAll(stubVueQRCode).wrappers[idx].props().options).toMatchObject({
              errorCorrectionLevel: "M",
              maskPattern: 0,
              margin: 1,
              scale: 4,
              width: 300,
              color: {
                dark: "#000000FF",
                light: "#FFFFFFFF"
              }
            })
            expect(wrapper.findAll(stubVueQRCode).wrappers[idx].props().tag).toMatch('img')
          })
        } else {
          expect(wrapper.find('div.histories').findAll('div.card').exists()).toBeFalsy()
          expect(wrapper.findAll(stubVueQRCode).exists()).toBeFalsy()
        }
      })
    })
  })
})
