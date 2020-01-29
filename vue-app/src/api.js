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
    console.log('listStocks error: ' + error)
  }
}

export async function listDestinations() {
  try {
    const res = await axios.get(destinationEndpoint)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('listDestinations error: ' + error)
  }
}

export async function postShipment(payload) {
  try {
    const res = await axios.post(shipmentEndpoint, payload)
    return {data: res.data, is_busy: false, is_navi: false}
  } catch (error) {
    if (error.response.status == 422) {
      return {data: error.response.data, is_busy: true, is_navi: false}
    }
    else if (error.response.status == 423) {
      return {data: error.response.data, is_busy: false, is_navi: true}
    }
    // eslint-disable-next-line
    console.log('postShipment error: ' + error)
  }
}
