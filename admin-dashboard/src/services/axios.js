import axios from 'axios'
import pincodeSeed from '../data/indiaPincodeSeed.json'

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

const LOCATION_STORAGE_KEY = 'raghavAdminLocations'
const LOCATION_SEED_VERSION_KEY = 'raghavAdminLocationSeedVersion'
const COURIER_STORAGE_KEY = 'raghavAdminCouriers'
const COURIER_SEED_VERSION_KEY = 'raghavAdminCourierSeedVersion'
const ZONE_STORAGE_KEY = 'raghavAdminB2CPricingZones'
const ZONE_SEED_VERSION_KEY = 'raghavAdminB2CPricingZoneSeedVersion'
const RATE_STORAGE_KEY = 'raghavAdminB2CPricingRates'
const RATE_SEED_VERSION_KEY = 'raghavAdminB2CPricingRateSeedVersion'
const ACTIVE_SERVICE_PROVIDERS = ['delhivery', 'india_post']

const DEFAULT_LOCATIONS = pincodeSeed.locations.map(([pincode, city, state, tags], index) => ({
  id: index + 1,
  pincode,
  city,
  state,
  country: 'India',
  tags,
}))

const DEFAULT_COURIERS = [
  ['delhivery-b2c', 'Delhivery Surface', 'delhivery', ['b2c']],
  ['delhivery-express', 'Delhivery Express', 'delhivery', ['b2c']],
  ['delhivery-b2b', 'Delhivery B2B LTL', 'delhivery', ['b2b']],
  ['india-post-speed', 'India Post Speed Post', 'india_post', ['b2c']],
  ['india-post-parcel', 'India Post Parcel', 'india_post', ['b2c', 'b2b']],
].map(([id, name, serviceProvider, businessType]) => ({ id, name, serviceProvider, businessType, isEnabled: true, createdAt: '2026-09-17' }))

const DEFAULT_PLANS = [
  { id: 'basic', name: 'Basic' },
  ...'ABCDEFGHIJKLM'.split('').map((suffix) => ({ id: `plan-${suffix.toLowerCase()}`, name: `Plan ${suffix}` })),
]

const DEFAULT_B2C_ZONES = [
  ['1b79e9aa-51c2-48df-b307-f63c5649d5a1', 'WITHIN_CITY', 'Within City', 'PDF Zone A - Within City'],
  ['d3253460-8107-4a49-a2fa-662e8cf36b0b', 'WITHIN_STATE', 'Within State', 'PDF Zone B - Within State'],
  ['62b13792-8187-4a20-8774-311a50bd372b', 'WITHIN_REGION', 'Within Region', 'Mapped to PDF Zone B - Within State'],
  ['5924c0b3-8e03-4bfe-9dad-5a92497d9543', 'METRO_TO_METRO', 'Metro to Metro', 'PDF Zone C - Metro To Metro'],
  ['ff23de9e-e1dc-4eab-9e50-8d1b0711d55d', 'ROI', 'Rest of India', 'PDF Zone D - Rest Of India'],
  ['e6f73c09-e829-46d4-8994-99067725342f', 'KASHMIR', 'Kashmir', 'Mapped to PDF Zone E - North East, Jammu and Kashmir'],
].map(([id, code, name, description]) => ({
  id,
  code,
  name,
  description,
  business_type: 'B2C',
  created_at: '2026-09-09T00:31:00+05:30',
}))

const zoneSlabsForAllZones = (forwardRate, extraRate, weightTo = 0.5, rtoRate = '') =>
  Object.fromEntries(DEFAULT_B2C_ZONES.map((zone) => [
    zone.name,
    {
      forward: [
        {
          weight_from: 0,
          weight_to: weightTo,
          rate: forwardRate,
          extra_rate: extraRate,
          extra_weight_unit: weightTo,
        },
      ],
      rto: rtoRate
        ? [
            {
              weight_from: 0,
              weight_to: weightTo,
              rate: rtoRate,
              extra_rate: extraRate,
              extra_weight_unit: weightTo,
            },
          ]
        : [],
      reverse_pickup: [],
    },
  ]))

const DEFAULT_B2C_RATES = [
  {
    id: 'delhivery-express-air-basic',
    courier_id: 'delhivery-express',
    courier_name: 'Delhivery Express',
    service_provider: 'delhivery',
    business_type: 'b2c',
    plan_id: 'basic',
    mode: 'air',
    min_weight: 0.5,
    cod_charges: 33,
    cod_percent: 1.7,
    cod_slabs: [
      { order_value_from: 0, order_value_to: 2000, charge_type: 'flat', charge_value: 33 },
      { order_value_from: 2000, order_value_to: '', charge_type: 'percent', charge_value: 1.7 },
    ],
    other_charges: 0,
    zone_slabs: zoneSlabsForAllZones(34, 31, 0.5),
  },
  {
    id: 'delhivery-surface-basic',
    courier_id: 'delhivery-b2c',
    courier_name: 'Delhivery Surface',
    service_provider: 'delhivery',
    business_type: 'b2c',
    plan_id: 'basic',
    mode: 'surface',
    min_weight: 0.5,
    cod_charges: 38,
    cod_percent: 1.8,
    cod_slabs: [
      { order_value_from: 0, order_value_to: 2000, charge_type: 'flat', charge_value: 38 },
      { order_value_from: 2000, order_value_to: '', charge_type: 'percent', charge_value: 1.8 },
    ],
    other_charges: 0,
    zone_slabs: zoneSlabsForAllZones(30, 28, 0.5),
  },
  {
    id: 'india-post-speed-basic',
    courier_id: 'india-post-speed',
    courier_name: 'India Post Speed Post',
    service_provider: 'india_post',
    business_type: 'b2c',
    plan_id: 'basic',
    mode: 'air',
    min_weight: 0.5,
    cod_charges: 30,
    cod_percent: 1.5,
    cod_slabs: [
      { order_value_from: 0, order_value_to: 2000, charge_type: 'flat', charge_value: 30 },
      { order_value_from: 2000, order_value_to: '', charge_type: 'percent', charge_value: 1.5 },
    ],
    other_charges: 0,
    zone_slabs: zoneSlabsForAllZones(35, 32, 0.5),
  },
  {
    id: 'india-post-parcel-basic',
    courier_id: 'india-post-parcel',
    courier_name: 'India Post Parcel',
    service_provider: 'india_post',
    business_type: 'b2c',
    plan_id: 'basic',
    mode: 'surface',
    min_weight: 2,
    cod_charges: 30,
    cod_percent: 1.5,
    cod_slabs: [
      { order_value_from: 0, order_value_to: 2000, charge_type: 'flat', charge_value: 30 },
      { order_value_from: 2000, order_value_to: '', charge_type: 'percent', charge_value: 1.5 },
    ],
    other_charges: 0,
    zone_slabs: zoneSlabsForAllZones(45, 35, 2),
  },
]

const readLocalData = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}
const writeLocalData = (key, value) => localStorage.setItem(key, JSON.stringify(value))

const mergeLocationSeeds = (current = []) => {
  const byPincode = new Map(DEFAULT_LOCATIONS.map((item) => [item.pincode, item]))

  current.forEach((item) => {
    if (!item?.pincode || byPincode.has(String(item.pincode))) return
    byPincode.set(String(item.pincode), {
      id: item.id || Date.now() + byPincode.size,
      pincode: String(item.pincode),
      city: item.city || '',
      state: item.state || '',
      country: item.country || 'India',
      tags: Array.isArray(item.tags) ? item.tags : [],
    })
  })

  return Array.from(byPincode.values()).sort((a, b) => String(a.pincode).localeCompare(String(b.pincode)))
}

const readLocations = () => {
  const saved = readLocalData(LOCATION_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(LOCATION_SEED_VERSION_KEY)

  if (savedVersion !== pincodeSeed.version || !Array.isArray(saved) || saved.length < DEFAULT_LOCATIONS.length) {
    const upgraded = mergeLocationSeeds(Array.isArray(saved) ? saved : [])
    writeLocalData(LOCATION_STORAGE_KEY, upgraded)
    localStorage.setItem(LOCATION_SEED_VERSION_KEY, pincodeSeed.version)
    return upgraded
  }

  return saved
}

const readCouriers = () => {
  const saved = readLocalData(COURIER_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(COURIER_SEED_VERSION_KEY)
  const savedCouriers = Array.isArray(saved)
    ? saved.filter((item) => ACTIVE_SERVICE_PROVIDERS.includes(item?.serviceProvider))
    : []

  if (savedVersion !== 'paid-providers-2026-09-17' || savedCouriers.length < DEFAULT_COURIERS.length) {
    const customById = new Map(savedCouriers.map((item) => [String(item.id), item]))
    const upgraded = DEFAULT_COURIERS.map((item) => ({ ...item, ...(customById.get(String(item.id)) || {}) }))
    writeLocalData(COURIER_STORAGE_KEY, upgraded)
    localStorage.setItem(COURIER_SEED_VERSION_KEY, 'paid-providers-2026-09-17')
    return upgraded
  }

  if (savedCouriers.length !== saved.length) {
    writeLocalData(COURIER_STORAGE_KEY, savedCouriers)
  }

  return savedCouriers
}

const readB2CZones = () => {
  const saved = readLocalData(ZONE_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(ZONE_SEED_VERSION_KEY)
  if (savedVersion !== 'fastship-clone-2026-09-18' || !Array.isArray(saved) || saved.length < DEFAULT_B2C_ZONES.length) {
    const customByCode = new Map((Array.isArray(saved) ? saved : []).map((item) => [String(item.code), item]))
    const upgraded = DEFAULT_B2C_ZONES.map((item) => ({ ...item, ...(customByCode.get(String(item.code)) || {}) }))
    writeLocalData(ZONE_STORAGE_KEY, upgraded)
    localStorage.setItem(ZONE_SEED_VERSION_KEY, 'fastship-clone-2026-09-18')
    return upgraded
  }
  return saved
}

const readB2CRates = () => {
  const saved = readLocalData(RATE_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(RATE_SEED_VERSION_KEY)
  if (savedVersion !== 'fastship-clone-2026-09-18' || !Array.isArray(saved) || saved.length < DEFAULT_B2C_RATES.length) {
    const customById = new Map((Array.isArray(saved) ? saved : []).map((item) => [String(item.id || `${item.courier_id}-${item.mode}`), item]))
    const upgraded = DEFAULT_B2C_RATES.map((item) => ({ ...item, ...(customById.get(String(item.id)) || {}) }))
    writeLocalData(RATE_STORAGE_KEY, upgraded)
    localStorage.setItem(RATE_SEED_VERSION_KEY, 'fastship-clone-2026-09-18')
    return upgraded
  }
  return saved
}

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
  let locations = readLocations()
  let couriers = readCouriers()
  let b2cZones = readB2CZones()
  let b2cRates = readB2CRates()
  const providers = ACTIVE_SERVICE_PROVIDERS.map((serviceProvider) => {
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
    const item = { id: Date.now(), ...payload }; locations = [...locations, item]; writeLocalData(LOCATION_STORAGE_KEY, locations)
    return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/serviceability/locations/') && ['put', 'delete'].includes(method)) {
    const id = url.split('/').pop()
    locations = method === 'delete' ? locations.filter((item) => String(item.id) !== id) : locations.map((item) => String(item.id) === id ? { ...item, ...payload } : item)
    writeLocalData(LOCATION_STORAGE_KEY, locations); return createLocalResponse(config, { success: true })
  }
  if (url === '/plans' && method === 'get') return createLocalResponse(config, { success: true, data: DEFAULT_PLANS })
  if (url === '/couriers/full-list') {
    const params = config.params || {}
    const businessType = String(params.businessType || '').toLowerCase()
    const filtered = businessType
      ? couriers.filter((item) => (item.businessType || []).map((type) => String(type).toLowerCase()).includes(businessType))
      : couriers
    return createLocalResponse(config, { success: true, data: filtered })
  }
  if (url === '/couriers/create' && method === 'post') {
    const item = { id: payload.id || `courier-${Date.now()}`, name: payload.name || payload.courierName, serviceProvider: payload.serviceProvider, businessType: payload.businessType || ['b2c', 'b2b'], isEnabled: true, createdAt: new Date().toISOString().slice(0, 10) }
    couriers = [...couriers, item].filter((courier) => ACTIVE_SERVICE_PROVIDERS.includes(courier.serviceProvider)); writeLocalData(COURIER_STORAGE_KEY, couriers); return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/couriers/status/') && method === 'patch') {
    const id = url.split('/').pop(); couriers = couriers.map((item) => String(item.id) === id ? { ...item, ...payload } : item); writeLocalData(COURIER_STORAGE_KEY, couriers)
    return createLocalResponse(config, { success: true })
  }
  if (url.startsWith('/couriers/delete/') && method === 'delete') {
    const id = url.split('/').pop(); couriers = couriers.filter((item) => String(item.id) !== id); writeLocalData(COURIER_STORAGE_KEY, couriers)
    return createLocalResponse(config, { success: true })
  }
  if (url === '/couriers/providers' && method === 'get') return createLocalResponse(config, { success: true, data: providers })
  if (url.startsWith('/couriers/providers/') && method === 'patch') {
    const provider = url.split('/').pop(); couriers = couriers.map((item) => item.serviceProvider === provider ? { ...item, isEnabled: Boolean(payload.isEnabled) } : item); writeLocalData(COURIER_STORAGE_KEY, couriers)
    return createLocalResponse(config, { success: true })
  }
  if (url === '/admin/couriers/credentials' && method === 'get') return createLocalResponse(config, { success: true, data: {
    delhivery: { apiBase: 'https://track.delhivery.com', clientName: 'Raghav Express', apiKeyMasked: 'Configured', hasApiKey: true, configured: true },
    delhiveryB2B: { apiBase: 'https://ltl-clients-api.delhivery.com', username: 'Configured', freightMode: 'fop', fmPickup: true, hasPassword: true, configured: true },
    indiaPost: { apiBase: 'https://test.cept.gov.in', customerId: '1674369691', username: 'Configured', configured: true },
  } })
  if (url.startsWith('/admin/couriers/credentials/') && ['put', 'post'].includes(method)) return createLocalResponse(config, { success: true, data: { ...payload, configured: true } })
  if (url === '/admin/zones/' && method === 'get') {
    const params = config.params || {}
    const businessType = String(params.business_type || params.businessType || '').toUpperCase()
    const data = businessType === 'B2B' ? [] : b2cZones
    return createLocalResponse(config, { success: true, data })
  }
  if (url === '/admin/zones/' && method === 'post') {
    const item = { id: payload.id || `zone-${Date.now()}`, created_at: new Date().toISOString(), ...payload }
    b2cZones = [...b2cZones, item]
    writeLocalData(ZONE_STORAGE_KEY, b2cZones)
    return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/admin/zones/') && ['put', 'delete'].includes(method)) {
    const id = url.split('/').filter(Boolean).pop()
    if (method === 'delete') {
      b2cZones = b2cZones.filter((item) => String(item.id) !== String(id))
    } else {
      b2cZones = b2cZones.map((item) => String(item.id) === String(id) ? { ...item, ...payload } : item)
    }
    writeLocalData(ZONE_STORAGE_KEY, b2cZones)
    return createLocalResponse(config, { success: true, data: payload })
  }
  if (url === '/admin/couriers/shipping-rates' && method === 'get') {
    const params = config.params || {}
    let rows = b2cRates
    if (String(params.businessType || '').toLowerCase() === 'b2b') rows = []
    if (params.planId) rows = rows.filter((row) => String(row.plan_id || 'basic') === String(params.planId))
    if (params.mode) rows = rows.filter((row) => String(row.mode || '').toLowerCase() === String(params.mode).toLowerCase())
    if (params.courier_name) {
      const selected = Array.isArray(params.courier_name) ? params.courier_name : [params.courier_name]
      rows = rows.filter((row) => selected.includes(row.courier_name))
    }
    return createLocalResponse(config, { success: true, data: rows })
  }
  if (url.startsWith('/admin/couriers/shipping-rate/') && method === 'put') {
    const [, , , , courierIdFromUrl, planIdFromUrl] = url.split('/')
    const rowId = payload.id || `${payload.courier_id || courierIdFromUrl}-${payload.mode || 'surface'}-${planIdFromUrl}`
    const saved = {
      id: rowId,
      plan_id: planIdFromUrl || payload.plan_id || 'basic',
      business_type: String(payload.businessType || payload.business_type || 'b2c').toLowerCase(),
      ...payload,
      courier_id: payload.courier_id || courierIdFromUrl,
      service_provider: payload.service_provider || payload.serviceProvider || '',
      updated_at: new Date().toISOString(),
    }
    const matchIndex = b2cRates.findIndex((row) =>
      String(row.courier_id) === String(saved.courier_id) &&
      String(row.plan_id || 'basic') === String(saved.plan_id || 'basic') &&
      String(row.service_provider || '') === String(saved.service_provider || '') &&
      String(row.mode || '') === String(saved.mode || ''),
    )
    b2cRates = matchIndex >= 0
      ? b2cRates.map((row, index) => index === matchIndex ? { ...row, ...saved } : row)
      : [...b2cRates, saved]
    writeLocalData(RATE_STORAGE_KEY, b2cRates)
    return createLocalResponse(config, { success: true, data: saved })
  }
  if (url.startsWith('/admin/couriers/shipping-rates/') && method === 'delete') {
    const parts = url.split('/').filter(Boolean)
    const planId = parts[3]
    const courierId = parts[4]
    const params = config.params || {}
    b2cRates = b2cRates.filter((row) => !(
      String(row.plan_id || 'basic') === String(planId) &&
      String(row.courier_id) === String(courierId) &&
      (!params.serviceProvider || String(row.service_provider || row.serviceProvider || '') === String(params.serviceProvider)) &&
      (!params.mode || String(row.mode || '') === String(params.mode))
    ))
    writeLocalData(RATE_STORAGE_KEY, b2cRates)
    return createLocalResponse(config, { success: true })
  }
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
