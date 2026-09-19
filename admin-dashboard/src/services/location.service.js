import api from './axios'
import pincodeSeed from '../data/indiaPincodeSeed.json'

const API_BASE = '/serviceability' // adjust based on your setup

const DEFAULT_LOCATIONS = pincodeSeed.locations.map(([pincode, city, state, tags], index) => ({
  id: index + 1,
  pincode,
  city,
  state,
  country: 'India',
  tags,
}))

const getSeededLocations = (params = {}) => {
  const page = Number(params.page || 1)
  const limit = Number(params.limit || 50)
  const filtered = DEFAULT_LOCATIONS.filter(
    (item) =>
      (!params.pincode || item.pincode.includes(String(params.pincode))) &&
      (!params.city || item.city.toLowerCase().includes(String(params.city).toLowerCase())) &&
      (!params.state || item.state.toLowerCase().includes(String(params.state).toLowerCase())),
  )

  return {
    success: true,
    data: filtered.slice((page - 1) * limit, page * limit),
    total: filtered.length,
    page,
    totalPages: Math.ceil(filtered.length / limit),
  }
}

export const normalizePincodeInput = (value) =>
  String(value || '')
    .replace(/\D/g, '')
    .slice(0, 6)

export const getExactLocation = (response, pincode) => {
  const rows = Array.isArray(response?.data) ? response.data : []
  return rows.find((row) => String(row?.pincode || '') === pincode) ?? rows[0]
}

const lookupPincodeViaPostalApi = async (pincode) => {
  const res = await fetch(`https://api.postalpincode.in/pincode/${pincode}`)
  if (!res.ok) return null

  const data = await res.json()
  const loc = data?.[0]?.PostOffice?.[0]
  const status = data?.[0]?.Status
  if (status !== 'Success' || !loc) return null

  return {
    pincode,
    city: loc.District || '',
    state: loc.State || '',
    country: 'India',
  }
}

export const locationService = {
  fetchLocations: async (params) => {
    try {
      const res = await api.get(`${API_BASE}/locations`, { params })
      if (Array.isArray(res.data?.data) && res.data.data.length > 0) return res.data
      return getSeededLocations(params)
    } catch (error) {
      console.warn('Using seeded serviceability locations:', error?.message)
      return getSeededLocations(params)
    }
  },

  lookupPincode: async (value, { fallbackToPostalApi = true } = {}) => {
    const pincode = normalizePincodeInput(value)
    if (!/^\d{6}$/.test(pincode)) return null

    try {
      const res = await api.get(`${API_BASE}/locations`, { params: { pincode, limit: 1 } })
      const location = getExactLocation(res.data, pincode)
      if (location?.city && location?.state) {
        return {
          pincode,
          city: location.city,
          state: location.state,
          country: location.country || 'India',
        }
      }
    } catch {
      // Fall back below if the serviceability lookup is unavailable.
    }

    const seededLocation = getSeededLocations({ pincode, limit: 1 }).data[0]
    if (seededLocation?.city && seededLocation?.state) {
      return {
        pincode,
        city: seededLocation.city,
        state: seededLocation.state,
        country: seededLocation.country || 'India',
      }
    }

    if (!fallbackToPostalApi) return null
    return lookupPincodeViaPostalApi(pincode)
  },

  getLocationById: async (id) => {
    const res = await api.get(`${API_BASE}/locations/${id}`)
    return res.data
  },

  createLocation: async (data) => {
    const res = await api.post(`${API_BASE}/locations`, data)
    return res.data
  },

  updateLocation: async (id, data) => {
    const res = await api.put(`${API_BASE}/locations/${id}`, data)
    return res.data
  },

  deleteLocation: async (id) => {
    await api.delete(`${API_BASE}/locations/${id}`)
  },
}
