import axios from 'axios'

const RENDER_API_BASE_URL = 'https://express-magic-backend.onrender.com/api'

const getDefaultApiBaseUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1' || host === '::1') {
      return 'http://localhost:4000/api'
    }
  }

  return RENDER_API_BASE_URL
}

const normalizeApiBaseUrl = (configuredUrl) => {
  const fallback = getDefaultApiBaseUrl()
  const value = String(configuredUrl || '').trim().replace(/\/+$/, '')

  if (!value || /(^|\.)up\.railway\.app(?=\/|$)/i.test(value.replace(/^https?:\/\//i, ''))) {
    return fallback
  }

  try {
    const url = new URL(value)
    const hostname = url.hostname.toLowerCase()

    if (
      !['http:', 'https:'].includes(url.protocol) ||
      hostname === 'express-magic.onrender.com' ||
      hostname === 'express-magic-admin.onrender.com'
    ) {
      return fallback
    }

    if (!url.pathname || url.pathname === '/') {
      url.pathname = '/api'
    }

    return url.toString().replace(/\/+$/, '')
  } catch {
    return fallback
  }
}

const apiBaseURL = normalizeApiBaseUrl(process.env.REACT_APP_API_BASE_URL)

const api = axios.create({
  baseURL: apiBaseURL,
  // Do not leave the sign-in UI spinning forever when a hosted API is down
  // or stuck while waking up.
  timeout: 8000,
  withCredentials: true, // only if using cookies
})

let refreshPromise = null

const isLocalAdminSession = () => {
  const token = localStorage.getItem('accessToken') || ''
  return token.endsWith('.local')
}

const isRaghavAdminHost = () => {
  const host = window.location.hostname.toLowerCase()
  return host === 'raghav-express-admin.onrender.com' || host === 'localhost' || host === '127.0.0.1'
}

const DEFAULT_LOCATIONS = [
  ['110001', 'New Delhi', 'Delhi', ['north', 'metros']],
  ['122001', 'Gurugram', 'Haryana', ['north', 'metros']],
  ['302013', 'Jaipur', 'Rajasthan', ['north']],
  ['306401', 'Pali', 'Rajasthan', ['west']],
  ['342001', 'Jodhpur', 'Rajasthan', ['west']],
  ['400001', 'Mumbai', 'Maharashtra', ['west', 'metros']],
  ['400093', 'Mumbai', 'Maharashtra', ['west', 'metros']],
  ['560001', 'Bengaluru', 'Karnataka', ['south', 'metros']],
  ['570001', 'Mysuru', 'Karnataka', ['south']],
  ['600001', 'Chennai', 'Tamil Nadu', ['south', 'metros']],
  ['700001', 'Kolkata', 'West Bengal', ['east', 'metros']],
].map(([pincode, city, state, tags], index) => ({ id: index + 1, pincode, city, state, country: 'India', tags }))

const DEFAULT_COURIERS = [
  ['delhivery-b2c', 'Delhivery Surface', 'delhivery', ['b2c']],
  ['delhivery-b2b', 'Delhivery B2B LTL', 'delhivery', ['b2b']],
  ['india-post-speed', 'India Post Speed Post', 'india_post', ['b2c']],
  ['india-post-parcel', 'India Post Parcel', 'india_post', ['b2c', 'b2b']],
  ['ekart', 'Ekart Logistics', 'ekart', ['b2c']],
  ['shadowfax', 'Shadowfax', 'shadowfax', ['b2c']],
  ['xpressbees', 'Xpressbees', 'xpressbees', ['b2c', 'b2b']],
].map(([id, name, serviceProvider, businessType]) => ({ id, name, serviceProvider, businessType, isEnabled: true, createdAt: '2026-09-17' }))

const readLocalData = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}
const writeLocalData = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const createLocalResponse = (config, data) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config,
  request: null,
})

const localAdapter = async (config) => {
  const method = String(config.method || 'get').toLowerCase()
  const url = String(config.url || '').split('?')[0]
  const payload = typeof config.data === 'string' ? JSON.parse(config.data || '{}') : (config.data || {})
  let locations = readLocalData('raghavAdminLocations', DEFAULT_LOCATIONS)
  let couriers = readLocalData('raghavAdminCouriers', DEFAULT_COURIERS)
  const providers = ['delhivery', 'india_post', 'ekart', 'shadowfax', 'xpressbees'].map((serviceProvider) => {
    const matches = couriers.filter((item) => item.serviceProvider === serviceProvider)
    return { serviceProvider, totalCouriers: matches.length, enabledCouriers: matches.filter((item) => item.isEnabled).length, isEnabled: matches.some((item) => item.isEnabled) }
  })

  if (url === '/serviceability/locations' && method === 'get') {
    const params = config.params || {}
    const filtered = locations.filter((item) => (!params.pincode || item.pincode.includes(params.pincode)) && (!params.city || item.city.toLowerCase().includes(String(params.city).toLowerCase())) && (!params.state || item.state.toLowerCase().includes(String(params.state).toLowerCase())))
    const page = Number(params.page || 1); const limit = Number(params.limit || 50)
    return createLocalResponse(config, { success: true, data: filtered.slice((page - 1) * limit, page * limit), total: filtered.length, page, totalPages: Math.ceil(filtered.length / limit) })
  }
  if (url === '/serviceability/locations' && method === 'post') {
    const item = { id: Date.now(), ...payload }; locations = [...locations, item]; writeLocalData('raghavAdminLocations', locations)
    return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/serviceability/locations/') && ['put', 'delete'].includes(method)) {
    const id = url.split('/').pop()
    locations = method === 'delete' ? locations.filter((item) => String(item.id) !== id) : locations.map((item) => String(item.id) === id ? { ...item, ...payload } : item)
    writeLocalData('raghavAdminLocations', locations); return createLocalResponse(config, { success: true })
  }
  if (url === '/couriers/full-list') return createLocalResponse(config, { success: true, data: couriers })
  if (url === '/couriers/create' && method === 'post') {
    const item = { id: payload.id || `courier-${Date.now()}`, name: payload.name || payload.courierName, serviceProvider: payload.serviceProvider, businessType: payload.businessType || ['b2c', 'b2b'], isEnabled: true, createdAt: new Date().toISOString().slice(0, 10) }
    couriers = [...couriers, item]; writeLocalData('raghavAdminCouriers', couriers); return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/couriers/status/') && method === 'patch') {
    const id = url.split('/').pop(); couriers = couriers.map((item) => String(item.id) === id ? { ...item, ...payload } : item); writeLocalData('raghavAdminCouriers', couriers)
    return createLocalResponse(config, { success: true })
  }
  if (url.startsWith('/couriers/delete/') && method === 'delete') {
    const id = url.split('/').pop(); couriers = couriers.filter((item) => String(item.id) !== id); writeLocalData('raghavAdminCouriers', couriers)
    return createLocalResponse(config, { success: true })
  }
  if (url === '/couriers/providers' && method === 'get') return createLocalResponse(config, { success: true, data: providers })
  if (url.startsWith('/couriers/providers/') && method === 'patch') {
    const provider = url.split('/').pop(); couriers = couriers.map((item) => item.serviceProvider === provider ? { ...item, isEnabled: Boolean(payload.isEnabled) } : item); writeLocalData('raghavAdminCouriers', couriers)
    return createLocalResponse(config, { success: true })
  }
  if (url === '/admin/couriers/credentials' && method === 'get') return createLocalResponse(config, { success: true, data: {
    delhivery: { apiBase: 'https://track.delhivery.com', clientName: 'Raghav Express', apiKeyMasked: 'Configured', hasApiKey: true, configured: true },
    delhiveryB2B: { apiBase: 'https://ltl-clients-api.delhivery.com', username: 'Configured', freightMode: 'fop', fmPickup: true, hasPassword: true, configured: true },
    indiaPost: { apiBase: 'https://test.cept.gov.in', customerId: '1674369691', username: 'Configured', configured: true },
    ekart: { configured: false }, shadowfax: { configured: false }, xpressbees: { configured: false },
  } })
  if (url.startsWith('/admin/couriers/credentials/') && ['put', 'post'].includes(method)) return createLocalResponse(config, { success: true, data: { ...payload, configured: true } })
  return createLocalResponse(config, { success: true, data: [], items: [], rows: [], orders: [], users: [], tickets: [], couriers: [], locations: [], plans: [], total: 0, totalCount: 0, totalPages: 0, page: 1, pagination: { page: 1, limit: 50, total: 0, totalPages: 0 } })
}

// Request interceptor: attach access token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken')
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`
  }

  if (isLocalAdminSession() && isRaghavAdminHost()) {
    config.adapter = localAdapter
  }
  return config
})

// Response interceptor: auto-refresh token on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Prevent infinite loops
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      localStorage.getItem('refreshToken')
    ) {
      originalRequest._retry = true

      try {
        const refreshToken = localStorage.getItem('refreshToken')
        if (!refreshPromise) {
          refreshPromise = axios
            .post(
              `${apiBaseURL}/auth/refresh-token`,
              { refreshToken },
              {
                headers: {
                  'x-refresh-token': refreshToken, // ✅ Send in header for better security
                },
              },
            )
            .finally(() => {
              refreshPromise = null
            })
        }
        const res = await refreshPromise

        const newAccessToken = res.data.accessToken
        const newRefreshToken = res.data.refreshToken

        // Save tokens
        localStorage.setItem('accessToken', newAccessToken)
        localStorage.setItem('refreshToken', newRefreshToken)

        // Update Zustand store - import it dynamically to avoid circular dependencies
        import('../store/useAuthStore').then(({ useAuthStore }) => {
          const userId = localStorage.getItem('userId')
          useAuthStore.getState().login(newAccessToken, userId, newRefreshToken)
        })

        // Retry original request with new access token
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return api(originalRequest)
      } catch (refreshErr) {
        console.error('❌ Refresh token failed:', refreshErr)
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        localStorage.removeItem('userId')

        // Update Zustand store
        import('../store/useAuthStore').then(({ useAuthStore }) => {
          useAuthStore.getState().logout()
        })

        window.location.href = '/#/auth/signin' // Force logout without relying on a host rewrite
      }
    }

    // Reject if not handled
    return Promise.reject(error)
  },
)

export { apiBaseURL, getDefaultApiBaseUrl, normalizeApiBaseUrl }
export default api
