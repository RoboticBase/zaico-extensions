import axios from 'axios'

const stockEndpoint = '/api/v1/stocks/'
const destinationEndpoint = '/api/v1/destinations/'
const shipmentEndpoint = '/api/v1/shipments/'

export async function listStocks() {
  try {
    const res = await axios.get(stockEndpoint)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('error:' + error)
  }
}

export async function listDestinations() {
  try {
    const res = await axios.get(destinationEndpoint)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('error:' + error)
  }
}

export async function postShipment(payload) {
  try {
    const res = await axios.post(shipmentEndpoint, payload)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('error:' + error)
  }
}
