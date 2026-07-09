import axios from 'axios'

// VITE_API_URL: API server origin for production (e.g. Render URL).
// Empty in dev — the Vite proxy forwards /api to the local server.
const apiOrigin = import.meta.env.VITE_API_URL ?? ''

const api = axios.create({
  baseURL: `${apiOrigin}/api`,
  headers: { 'Content-Type': 'application/json' },
})

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('maxt-token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('maxt-token')
    }
    return Promise.reject(error)
  }
)

export default api
