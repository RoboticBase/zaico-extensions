import store from '@/store'
import { listStocks, listDestinations, postShipment } from '@/api'

jest.mock('@/api')

const dateStr = '2020-01-02T03:04:05.678Z'
const dateToUse = new Date(dateStr)
const spyDate = jest.spyOn(global, 'Date')
spyDate.mockImplementation(() => dateToUse)

function checkDefaultState() {
  expect(store.state.stocks).toMatchObject([])
  expect(store.state.destinations).toMatchObject([])
  expect(store.state.selectedDestination).toMatch('')
  expect(store.state.message).toMatch('')
  expect(store.state.variant).toMatch('')
  expect(store.state.ordered).toMatchObject([])
}

describe('state', () => {
  it('has default value', () => {
    checkDefaultState()
  })
})

describe('mutations', () => {
  let defaultState = null
  beforeEach(() => {
    checkDefaultState()
    defaultState = JSON.stringify(store.state)
  })
  afterEach(() => {
    store.replaceState(JSON.parse(defaultState))
  })

  describe('listStocks', () => {
    it.each([
      null,
      undefined,
      'dummy',
      1,
      [],
      [1, 2, 3],
      {},
      {id: 1},
    ])('updates state.stocks to %j', (stocks) => {
      store.commit('listStocks', stocks)
      expect(store.state.stocks).toBe(stocks)
      expect(store.getters.stocks).toBe(stocks)
    })
  })

  describe('listDestinations', () => {
    it.each([
      null,
      undefined,
      'dummy',
      1,
      [],
      [1, 2, 3],
      {},
      {id: 1},
    ])('updates state.destinations to %j', (destinations) => {
      store.commit('listDestinations', destinations)
      expect(store.state.destinations).toBe(destinations)
      expect(store.getters.destinations).toBe(destinations)
    })
  })

  describe('updateMessage', () => {
    describe.each([
      null,
      undefined,
      'dummy',
      1,
      [],
      [1, 2, 3],
      {},
      {id: 1},
    ])('', (message) => {
      it.each([
        null,
        undefined,
        'dummy',
        1,
        [],
        [1, 2, 3],
        {},
        {id: 1},
      ])(`updates state.message to ${JSON.stringify(message)} and state.variant to %j`, (variant) => {
        store.commit('updateMessage', {message, variant})
        expect(store.state.message).toBe(message)
        expect(store.getters.message).toBe(message)
        expect(store.state.variant).toBe(variant)
        expect(store.getters.variant).toBe(variant)
      })
    })
  })

  describe('setSelectedDestination', () => {
    it.each([
      null,
      undefined,
      'dummy',
      1,
      [],
      [1, 2, 3],
      {},
      {id: 1},
    ])('updates state.selectedDestination to %j', (destination) => {
      store.commit('setSelectedDestination', destination)
      expect(store.state.selectedDestination).toBe(destination)
      expect(store.getters.selectedDestination).toBe(destination)
    })
  })

  describe('updateStock', () => {
    describe.each([
      [[]],
      [[{id: 1}]],
      [[{id: 1}, {id: 2}]],
      [[{id: 1}, {id: 2}, {id: 3}]]
    ])('', (orgStocks) => {
      it.each([
        [0, {id: 9}],
        [1, {id: 19}],
        [2, {id: 29}],
        [3, {id: 39}],
      ])(`updates state.stocks[%j](origin=${JSON.stringify(orgStocks)}) to %j when idx is exists, otherwise nothing to do`, (idx, stock) => {
        store.commit('listStocks', orgStocks)
        store.commit('updateStock', {idx, stock})
        store.state.stocks.forEach((s, i) => {
          if (i == idx) {
            expect(s).toBe(stock)
          } else {
            expect(s).toBe(orgStocks[i])
          }
        })
      })
    })
  })

  describe('resetStocks', () => {
    it('initializes state.stocks', () => {
      const stocks = [{id: 1}]
      store.commit('listStocks', stocks)
      expect(store.state.stocks).toBe(stocks)
      store.commit('resetStocks')
      expect(store.state.stocks).toMatchObject([])
    })
  })

  describe('addOrder', () => {
    describe.each([
      [[]],
      [[{id: 1, orderDate: '2020-01-01T00:00:01.000Z'}]],
      [[{id: 1, orderDate: '2020-01-01T00:00:01.000Z'}, {id:2, orderDate: '2020-01-01T00:00:02.000Z'}]],
      [null],
      ['dummy'],
      [1],
      [{id: 1}],
    ])('', (orgOrdered) => {
      it.each([
        [{}, true],
        [{id: 9}, true],
        [null, false],
        [undefined, false],
        [[], false],
        ['dummy', false],
        [1, false],
      ])(`pushes an order data(%j) to state.ordered(${JSON.stringify(orgOrdered)}) when state.ordered is array and the data is object, otherwise nothing to do`, (data, isProcess) => {
        const state = JSON.parse(defaultState)
        state.ordered = JSON.parse(JSON.stringify(orgOrdered))
        store.replaceState(state)

        expect(JSON.stringify(store.state.ordered)).toMatch(JSON.stringify(orgOrdered))
        store.commit('addOrder', data)
        if (Array.isArray(orgOrdered) && isProcess) {
          expect(store.state.ordered.length).toBe(orgOrdered.length + 1)
          orgOrdered.forEach((orgOrder, idx) => {
            expect(orgOrder).toMatchObject(store.state.ordered[idx])
            expect(orgOrder).toMatchObject(store.getters.ordered[idx])
          })
          const d = Object.assign({}, data)
          d.orderDate = dateStr
          expect(store.state.ordered[store.state.ordered.length - 1]).toMatchObject(d)
          expect(store.getters.ordered[store.state.ordered.length - 1]).toMatchObject(d)
        } else {
          expect(JSON.stringify(store.state.ordered)).toMatch(JSON.stringify(orgOrdered))
          expect(JSON.stringify(store.getters.ordered)).toMatch(JSON.stringify(orgOrdered))
        }
      })
    })
  })
})

describe('actions', () => {
  let defaultState = null
  beforeEach(() => {
    checkDefaultState()
    defaultState = JSON.stringify(store.state)
  })
  afterEach(() => {
    store.replaceState(JSON.parse(defaultState))
    listStocks.mockClear()
    listDestinations.mockClear()
    postShipment.mockClear()
  })

  describe('listStocksAction', () => {
    it.each([
      [[]],
      [[{id: 1}]],
      [[{id: 1}, {id: 2}]],
      [[{id: 1}, {id: 2}, {}]],
    ])('stores stock data(%j) when state.stocks is empty and storing data is an array of object', async (data) => {
      listStocks.mockResolvedValue(data)
      await store.dispatch('listStocksAction')
      const res = data.map((e) => Object.assign({}, e, {reservation: 0}))
      expect(store.state.stocks).toMatchObject(res)
    })

    it.each([
      [null], [undefined], ['dummy'], [1], [[]], [[1, 2, 3]]
    ])('does not store stock data(%j) when storing data is invalid', async (data) => {
      listStocks.mockResolvedValue(data)
      await store.dispatch('listStocksAction')
      expect(store.state.stocks).toMatchObject([])
    })

    describe.each([
      [null], [undefined], ['dummy'], [1], [{}], [[{id: 999}]]
    ])('', (stocks) => {
      it.each([
        [[]],
        [[{id: 1}]],
        [[{id: 1}, {id: 2}]],
        [[{id: 1}, {id: 2}, {}]],
      ])(`does not store sotck data(%j) when state.stocks(${JSON.stringify(stocks)}) is not array or is not empty array`, async (data) => {
        store.commit('listStocks', stocks)

        listStocks.mockResolvedValue(data)
        await store.dispatch('listStocksAction')
        expect(store.state.stocks).toBe(stocks)
      })
    })
  })

  describe('listDestinationsAction', () => {
    it.each([
      [[]], [[1, 2]], [{}], [{id: 1}], ['dummy'], [1], [null], [undefined],
    ])('stores destination data(%j)', async (data) => {
      listDestinations.mockResolvedValue(data)
      await store.dispatch('listDestinationsAction')
      expect(store.state.destinations).toBe(data)
    })
  })

  describe('postShipmentAction', () => {
    const payload = {
      success: jest.fn(),
      failure: jest.fn(),
    }

    afterEach(() => {
      payload.success.mockClear()
      payload.failure.mockClear()
    })

    it('calls payload.success when robot is not busy and robot is not navigating', async () => {
      const res = {
        is_busy: false,
        is_navi: false,
        data: 'test data',
      }
      postShipment.mockResolvedValue(res)
      await store.dispatch('postShipmentAction', payload)
      expect(payload.success).toHaveBeenCalledTimes(1)
      expect(payload.success).toHaveBeenCalledWith('test data')
      expect(payload.failure).toHaveBeenCalledTimes(0)
      expect(store.state.message).toMatch('')
      expect(store.state.variant).toMatch('')
    })

    it.each([
      [true], [false],
    ])('calls payload.failure when robot is busy (navigating=%j)', async (is_navi) => {
      const res = {
        is_busy: true,
        is_navi: is_navi,
        data: 'test data',
      }
      postShipment.mockResolvedValue(res)
      await store.dispatch('postShipmentAction', payload)
      expect(payload.success).toHaveBeenCalledTimes(0)
      expect(payload.failure).toHaveBeenCalledTimes(1)
      expect(payload.failure).toHaveBeenCalledWith('待機中の配送ロボットが無いため、注文は取り消されました。少し待ってからもう一度お試しください。')
      expect(store.state.message).toMatch('')
      expect(store.state.variant).toMatch('')
    })

    it('calls payload.failure when robot is not busy but navigating', async () => {
      const res = {
        is_busy: false,
        is_navi: true,
        data: {
          robot_id: 'r01'
        }
      }
      postShipment.mockResolvedValue(res)
      await store.dispatch('postShipmentAction', payload)
      expect(payload.success).toHaveBeenCalledTimes(0)
      expect(payload.failure).toHaveBeenCalledTimes(1)
      const message = '配送ロボット(r01)は作業中のため、注文は取り消されました。少し待ってからもう一度お試しください。'
      expect(payload.failure).toHaveBeenCalledWith(message)
      expect(store.state.message).toMatch(message)
      expect(store.state.variant).toMatch('warning')
    })

    it('throws error when response does not have is_buby and is_navi', async () => {
      const res = {}
      postShipment.mockResolvedValue(res)
      await store.dispatch('postShipmentAction', payload)
      expect(payload.success).toHaveBeenCalledTimes(0)
      expect(payload.failure).toHaveBeenCalledTimes(1)
      expect(payload.failure).toHaveBeenCalledWith('unsupported api result')
      expect(store.state.message).toMatch('')
      expect(store.state.variant).toMatch('')
    })
  })
})
