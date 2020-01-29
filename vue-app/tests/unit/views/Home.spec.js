import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue, RouterLinkStub } from '@vue/test-utils'

import Home from '@/views/Home.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('Home.vue', () => {
  let store = null
  let mutations = null

  beforeEach(() => {
    mutations = {
      updateMessage: jest.fn()
    }
    store = new Vuex.Store({
      state: {},
      mutations: mutations,
    })
  })

  it('renders Home view', () => {
    const wrapper = mount(Home, {store, localVue, stubs: {RouterLink: RouterLinkStub}})
    expect(wrapper.attributes()).toMatchObject({class: 'home container'})
    expect(wrapper.find('div.home').find('div.header').exists()).toBeTruthy()
    expect(wrapper.find('div.home').find('a.stock').text()).toMatch('在庫引当と出荷指示')
    expect(mutations.updateMessage).toHaveBeenCalledTimes(1)
    expect(mutations.updateMessage.mock.calls[0][1]).toMatchObject({message: '', variant: ''})

    const links = wrapper.findAll(RouterLinkStub)
    expect(links.length).toBe(1)
    expect(links.at(0).props().to).toMatch('/stocks')
  })
})
