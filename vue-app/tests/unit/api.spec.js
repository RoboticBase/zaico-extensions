import axios from 'axios'

import {listStocks, listDestinations, postShipment} from '@/api'

jest.mock('axios')
const spyLog = jest.spyOn(console, 'log')
spyLog.mockImplementation(x => x)

describe('listStocks', () => {
  afterEach(() => {
    axios.get.mockClear()
    axios.post.mockClear()
    spyLog.mockClear()
  })

  it.each([
    null,
    undefined,
    'dummy',
    1,
    [],
    [{id: 'r01'}, {id: 'r02'}],
    {},
    {id: 'r01'},
  ])('returns the retrieved list of stock, data=%j', async (data) => {
    axios.get.mockResolvedValue({data: data})
    const result = await listStocks()
    expect(result).toBe(data)
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/v1/stocks/')
    expect(axios.post).toHaveBeenCalledTimes(0)
    expect(axios.patch).toHaveBeenCalledTimes(0)
    expect(axios.put).toHaveBeenCalledTimes(0)
    expect(axios.delete).toHaveBeenCalledTimes(0)
  })

  it('returns error data when axios rejects error response', async () => {
    axios.get.mockRejectedValue(new Error('test error'))
    const result = await listStocks()
    expect(result).toBeUndefined()
    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('listStocks error: Error: test error')
    expect(axios.post).toHaveBeenCalledTimes(0)
    expect(axios.patch).toHaveBeenCalledTimes(0)
    expect(axios.put).toHaveBeenCalledTimes(0)
    expect(axios.delete).toHaveBeenCalledTimes(0)
  })
})

describe('listDestinations', () => {
  afterEach(() => {
    axios.get.mockClear()
    axios.post.mockClear()
    spyLog.mockClear()
  })

  it.each([
    null,
    undefined,
    'dummy',
    1,
    [],
    [{id: 'd01'}, {id: 'd02'}],
    {},
    {id: 'd01'},
  ])('returns the retrieved list of destination, data=%j', async (data) => {
    axios.get.mockResolvedValue({data: data})
    const result = await listDestinations()
    expect(result).toBe(data)
    expect(axios.get).toHaveBeenCalledTimes(1)
    expect(axios.get).toHaveBeenCalledWith('/api/v1/destinations/')
    expect(axios.post).toHaveBeenCalledTimes(0)
    expect(axios.patch).toHaveBeenCalledTimes(0)
    expect(axios.put).toHaveBeenCalledTimes(0)
    expect(axios.delete).toHaveBeenCalledTimes(0)
  })

  it('returns error data when axios rejects error response', async () => {
    axios.get.mockRejectedValue(new Error('test error'))
    const result = await listDestinations()
    expect(result).toBeUndefined()
    expect(console.log).toHaveBeenCalledTimes(1)
    expect(console.log).toHaveBeenCalledWith('listDestinations error: Error: test error')
    expect(axios.post).toHaveBeenCalledTimes(0)
    expect(axios.patch).toHaveBeenCalledTimes(0)
    expect(axios.put).toHaveBeenCalledTimes(0)
    expect(axios.delete).toHaveBeenCalledTimes(0)
  })
})

describe('postShipment', () => {
  afterEach(() => {
    axios.get.mockClear()
    axios.post.mockClear()
    spyLog.mockClear()
  })

  describe.each([
    null,
    undefined,
    'dummy',
    1,
    [],
    [1, 2, 3],
    {},
    {id: 'p01'},
  ])('', (payload) => {
    it.each([
      null,
      undefined,
      'dummy',
      1,
      [],
      [{id: 'd01'}, {id: 'd02'}],
      {},
      {id: 'd01'},
    ])(`returns the retrieved list of destination, payload=${JSON.stringify(payload)}, data=%j`, async (data) => {
      axios.post.mockResolvedValue({data: data})
      const result = await postShipment(payload)
      expect(result).toMatchObject({data: data, is_busy: false, is_navi: false})
      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledWith('/api/v1/shipments/', payload)
      expect(axios.get).toHaveBeenCalledTimes(0)
      expect(axios.put).toHaveBeenCalledTimes(0)
      expect(axios.delete).toHaveBeenCalledTimes(0)
    })

    it.each([
      422,
      423,
      400,
      500,
    ])(`returns busy data or error data when axios rejects error response, payload=${JSON.stringify(payload)}, status=%j`, async (status) => {
      const err = new Error('test error')
      err.response = {
        status: status,
        data: 'error data'
      }

      axios.post.mockRejectedValue(err)
      const result = await postShipment(payload)
      if (status == 422) {
        expect(result).toMatchObject({data: 'error data', is_busy: true, is_navi: false})
      } else if (status == 423) {
        expect(result).toMatchObject({data: 'error data', is_busy: false, is_navi: true})
      } else {
        expect(result).toBeUndefined()
        expect(console.log).toHaveBeenCalledTimes(1)
        expect(console.log).toHaveBeenCalledWith('postShipment error: Error: test error')
      }
      expect(axios.post).toHaveBeenCalledTimes(1)
      expect(axios.post).toHaveBeenCalledWith('/api/v1/shipments/', payload)
      expect(axios.get).toHaveBeenCalledTimes(0)
      expect(axios.put).toHaveBeenCalledTimes(0)
      expect(axios.delete).toHaveBeenCalledTimes(0)
    })
  })
})
