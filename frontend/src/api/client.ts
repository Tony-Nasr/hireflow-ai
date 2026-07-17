import axios from "axios"
import { useAuthStore } from "@/store/authStore"

const api = axios.create({
  baseURL: "http://localhost:5219/api",
})

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

export default api