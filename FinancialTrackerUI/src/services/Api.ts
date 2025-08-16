import { useAuth0 } from '@auth0/auth0-vue'
import axios from 'axios'

const FinancialTransactionsApi = "https://localhost/FinancialTransactions"

export default class Api {
  public async GetFinancialTransactons() {
    try {
      const { getAccessTokenSilently } = useAuth0() // ✅ Now inside the method
      const accessToken = await getAccessTokenSilently()
      const response = await axios.get(FinancialTransactionsApi, {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }
}
