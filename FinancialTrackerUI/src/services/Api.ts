import { useAuth0 } from '@auth0/auth0-vue'
import axios from 'axios'

const FinancialTransactionsApi = "https://localhost/FinancialTransactions"
const EmbeddingTransactionsApi = "http://localhost:5005/EmbeddingTransactions"
const VectorTransactionsApi = "http://localhost:5005/VectorTransactions"

export function Api() {
  const { getAccessTokenSilently } = useAuth0()

  const authHeader = async () => {
    const token = await getAccessTokenSilently()
    return { Authorization: `Bearer ${token}` }
  }

  const GetFinancialTransactons = async () => {
    try {
      const headers = await authHeader()
      const response = await axios.get(FinancialTransactionsApi, {
        headers
      })
      return response.data
    } catch (err) {
      console.error(err)
      throw err
    }
  }

    // ✅ Get Vector Transactions with pagination + filtering
  const GetVectorTransactions = async (
    pageNumber: number = 1,
    pageSize: number = 10,
    startDate: string = "",
    endDate: string = ""
  ) => {
    try {
      const headers = await authHeader()

      const response = await axios.get(VectorTransactionsApi, {
        headers,
        params: {
          pageNumber,
          pageSize,
          startDate,
          endDate
        }
      })

      return response.data
    } catch (err) {
      console.error("GetVectorTransactions error:", err)
      throw err
    }
  }

  // ✅ Upload CSV
  const UploadCsv = async (bank: string, file: File) => {
    try {
      const headers = await authHeader()

      const formData = new FormData()
      formData.append("file", file)

      const response = await axios.post(
        `${EmbeddingTransactionsApi}/${bank}/upload`,
        formData,
        {
          headers
        }
      )

      return response.data
    } catch (err) {
      console.error("UploadCsv error:", err)
      throw err
    }
  }

  // 👇 must return the methods
  return {
    GetFinancialTransactons,
    UploadCsv,
    GetVectorTransactions
  }
}
