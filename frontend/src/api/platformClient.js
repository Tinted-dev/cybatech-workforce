import axios from "axios"

const platformApiClient = axios.create({
  baseURL: "http://127.0.0.1:8000",
})

platformApiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem("platform_access_token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

export default platformApiClient
