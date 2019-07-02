import axios from 'axios'

export async function listStocks() {
  const endpoint = '/api/v1/stocks/'

  try {
    const res = await axios.get(endpoint)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('error:' + error)
  }
}

export async function listDestinations() {
  const endpoint = '/api/v1/destinations/'

  try {
    const res = await axios.get(endpoint)
    return res.data
  } catch (error) {
    // eslint-disable-next-line
    console.log('error:' + error)
  }
}
