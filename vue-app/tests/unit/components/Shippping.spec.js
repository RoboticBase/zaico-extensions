import BootstrapVue from 'bootstrap-vue'
import Vuex from 'vuex'
import { mount, createLocalVue } from '@vue/test-utils'

import Shipping from '@/components/Shipping.vue'

const localVue = createLocalVue()
localVue.use(BootstrapVue)
localVue.use(Vuex)

describe('Shipping.vue', () => {
  let store = null
  let state = null
  let mutations = null
  let actions = null
  let $router = null

  beforeEach(() => {
    state = {
      stocks: [],
      destinations: [],
      selectedDestination: '',
    }
    actions = {
      listDestinationsAction: jest.fn(),
      postShipmentAction: jest.fn(),
    }
    mutations = {
      setSelectedDestination: jest.fn(),
      updateMessage: jest.fn(),
      addOrder: jest.fn(),
    }
    store = new Vuex.Store({
      state: state,
      mutations: mutations,
      actions: actions,
      getters: {
        stocks: (state) => state.stocks,
        destinations: (state) => state.destinations,
        selectedDestination: (state) => state.selectedDestination,
      },
    })
    $router = {
      push: jest.fn()
    }
  })

  it.each([
    [[], []],
    [[{id: 'id_1', name: 'dest_1'}], ['<option value="id_1">dest_1</option>']],
    [[{id: 'id_1', name: 'dest_1'}, {id: 'id_2', name: 'dest_2'}], ['<option value="id_1">dest_1</option>', '<option value="id_2">dest_2</option>']],
    [[{foo: 'bar'}], ['<option value=""></option>']],
    [[{id: 'id_1', foo: 'bar'}], ['<option value="id_1"></option>']],
    [[{name: 'dest_1'}], ['<option value="">dest_1</option>']],
  ])('renders a destination select box (destinations=%j)', (destinations, expected_options) => {
    state.destinations = destinations

    const wrapper = mount(Shipping, {store, localVue, mocks: {$router}})

    expect(wrapper.attributes()).toMatchObject({class: 'shipping container'})
    const options = wrapper.find('div.shipping').find('select#destination').findAll('option')
    options.wrappers.forEach((elem, i) => {
      expect(elem.html()).toMatch(expected_options[i])
    })
    expect(wrapper.find('div.shipping').find('button.order').text()).toMatch('注文')
    expect(wrapper.find('div.shipping').find('mark').exists()).toBeFalsy()
    expect(actions.listDestinationsAction).toHaveBeenCalledTimes(1)
    expect(actions.postShipmentAction).not.toHaveBeenCalled()
    expect(mutations.setSelectedDestination).not.toHaveBeenCalled()
    expect(mutations.updateMessage).not.toHaveBeenCalled()
    expect(mutations.addOrder).not.toHaveBeenCalled()
    expect($router.push).not.toHaveBeenCalled()
  })

  it('sets "selectedDestination" when selecting a option', () => {
    state.destinations = [{id: '', name: ''}, {id: 'id_1', name: 'dest_1'}, {id: 'id_2', name: 'dest_2'}, {id: 'id_3', name: 'dest_3'}]
    const wrapper = mount(Shipping, {store, localVue, mocks: {$router}})
    const select = wrapper.find('div.shipping').find('select#destination')
    const options = select.findAll('option')

    options.at(3).setSelected()
    expect(mutations.setSelectedDestination).toHaveBeenCalledTimes(1)
    expect(mutations.setSelectedDestination).toHaveBeenCalledWith(state, 'id_3')
    options.at(1).setSelected()
    expect(mutations.setSelectedDestination).toHaveBeenCalledTimes(2)
    expect(mutations.setSelectedDestination).toHaveBeenCalledWith(state, 'id_1')
    expect(actions.listDestinationsAction).toHaveBeenCalledTimes(1)
    expect(actions.postShipmentAction).not.toHaveBeenCalled()
    expect(mutations.updateMessage).not.toHaveBeenCalled()
    expect(mutations.addOrder).not.toHaveBeenCalled()
    expect($router.push).not.toHaveBeenCalled()
  })

  describe.each([
    ['id_1'],
    ['']
  ])('', (destination_id) => {
    it.each([
      [[{id: 's_1', reservation: 1, foo: 'bar'}], [{id: 's_1', reservation: 1}]],
      [[{id: 's_1', reservation: 1, foo: 'bar'}, {id: 's_2', reservation: 0, foo: 'bar'}, {id: 's_3'}], [{id: 's_1', reservation: 1}]],
      [[],[]],
      [[{id: 's_1', reservation: 0}, {id: 's_2', reservation: 0}],[]]
    ])(`calls "postShipmentAction" when destination_id=(${destination_id}) reserved item(s)=(%j)`, async (stocks, items) => {
      state.stocks = stocks
      state.selectedDestination = destination_id

      const wrapper = mount(Shipping, {store, localVue, mocks: {$router}})
      wrapper.find('div.shipping').find('button.order').trigger('click')

      expect(actions.listDestinationsAction).toHaveBeenCalledTimes(1)
      expect(mutations.setSelectedDestination).not.toHaveBeenCalled()
      expect(mutations.addOrder).not.toHaveBeenCalled()
      expect($router.push).not.toHaveBeenCalled()
      expect(wrapper.vm.$data.processing).toBeTruthy()
      if (destination_id != '' && items.length > 0) {
        expect(actions.postShipmentAction).toHaveBeenCalledTimes(1)
        expect(actions.postShipmentAction.mock.calls[0][1].destination_id).toMatch(destination_id)
        expect(actions.postShipmentAction.mock.calls[0][1].items).toMatchObject(items)
        expect(mutations.updateMessage).toHaveBeenCalledTimes(1)
        expect(mutations.updateMessage.mock.calls[0][1]).toMatchObject({message: '処理中', variant: 'info'})
      }
      else {
        expect(actions.postShipmentAction).not.toHaveBeenCalled()
        expect(mutations.updateMessage).toHaveBeenCalledTimes(1)
        expect(mutations.updateMessage.mock.calls[0][1]).toMatchObject({message: 'お届け先を選択してください', variant: 'warning'})
      }

      await wrapper.vm.$nextTick()
      expect(wrapper.find('div.shipping').find('mark').exists()).toBeFalsy()
    })
  })

  it('succeeds "postShipmentAction"', async () => {
    const destination_id = 'id_1'
    const response_data = 'response data'
    const stocks = [{id: 's_1', reservation: 1, foo: 'bar'}]

    state.stocks = stocks
    state.selectedDestination = destination_id
    actions.postShipmentAction.mockImplementationOnce((_, payload) => {
      payload.success(response_data)
    })

    const wrapper = mount(Shipping, {store, localVue, mocks: {$router}})
    wrapper.find('div.shipping').find('button.order').trigger('click')

    expect(actions.listDestinationsAction).toHaveBeenCalledTimes(1)
    expect(actions.postShipmentAction).toHaveBeenCalledTimes(1)
    expect(mutations.setSelectedDestination).not.toHaveBeenCalled()
    expect(mutations.updateMessage).toHaveBeenCalledTimes(1)
    expect(mutations.addOrder).toHaveBeenCalledTimes(1)
    expect(mutations.addOrder.mock.calls[0][1]).toMatch(response_data)
    expect(wrapper.vm.$data.processing).toBeFalsy()
    expect($router.push).toHaveBeenCalledTimes(1)
    expect($router.push).toHaveBeenCalledWith({name: 'ordered', params: {data: response_data}})

    await wrapper.vm.$nextTick()
    expect(wrapper.find('div.shipping').find('mark').exists()).toBeFalsy()
  })

  it('fails "postShipmentAction"', async () => {
    const destination_id = 'id_1'
    const errmsg = 'error message'
    const stocks = [{id: 's_1', reservation: 1, foo: 'bar'}]

    state.stocks = stocks
    state.selectedDestination = destination_id
    actions.postShipmentAction.mockImplementationOnce((_, payload) => {
      payload.failure(errmsg)
    })

    const wrapper = mount(Shipping, {store, localVue, mocks: {$router}})
    wrapper.find('div.shipping').find('button.order').trigger('click')

    expect(actions.listDestinationsAction).toHaveBeenCalledTimes(1)
    expect(actions.postShipmentAction).toHaveBeenCalledTimes(1)
    expect(mutations.setSelectedDestination).not.toHaveBeenCalled()
    expect(mutations.updateMessage).toHaveBeenCalledTimes(1)
    expect(mutations.addOrder).not.toHaveBeenCalled()
    expect(wrapper.vm.$data.processing).toBeFalsy()
    expect($router.push).not.toHaveBeenCalled()

    await wrapper.vm.$nextTick()
    expect(wrapper.find('div.shipping').find('mark').text()).toMatch(errmsg)
  })

  it('skip "postShipmentAction" when processing', async () => {
    const destination_id = 'id_1'
    const stocks = [{id: 's_1', reservation: 1, foo: 'bar'}]

    state.stocks = stocks
    state.selectedDestination = destination_id

    const wrapper = mount(Shipping, {store, localVue, mocks: {$router}})
    wrapper.setData({processing: true})

    wrapper.find('div.shipping').find('button.order').trigger('click')

    expect(actions.listDestinationsAction).toHaveBeenCalledTimes(1)
    expect(actions.postShipmentAction).not.toHaveBeenCalled()
    expect(mutations.setSelectedDestination).not.toHaveBeenCalled()
    expect(mutations.updateMessage).not.toHaveBeenCalled()
    expect(mutations.addOrder).not.toHaveBeenCalled()
    expect(wrapper.vm.$data.processing).toBeTruthy()
    expect($router.push).not.toHaveBeenCalled()

    await wrapper.vm.$nextTick()
    expect(wrapper.find('div.shipping').find('mark').exists()).toBeFalsy()
  })

})
