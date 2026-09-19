// src/services/zoneService.ts
import api from './axios'

const API_URL = '/admin/zones/'

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

const normalizeArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.zones)) return payload.zones
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export const zoneService = {
  getZones: async (businessType, filters = {}) => {
    // Build query params dynamically
    const params = new URLSearchParams()
    if (businessType) params.append('business_type', businessType)

    // Only include courier filter if B2B
    if (businessType === 'B2B' && filters.courier_id) {
      params.append('courier_id', filters.courier_id)
    }

    try {
      const res = await api.get(`${API_URL}?${params.toString()}`)
      const zones = normalizeArrayPayload(res.data)
      if (zones.length) return zones
      return String(businessType || '').toUpperCase() === 'B2C' ? DEFAULT_B2C_ZONES : []
    } catch (error) {
      console.warn('Using seeded B2C zones:', error?.message)
      return String(businessType || '').toUpperCase() === 'B2C' ? DEFAULT_B2C_ZONES : []
    }
  },

  getZoneById: async (zoneId) => {
    const res = await api.get(`${API_URL}${zoneId}`)
    return res.data
  },
  createZone: async (data) => {
    const res = await api.post(API_URL, data)
    return res.data
  },
  deleteZone: async (id) => {
    await api.delete(`${API_URL}${id}`)
    return id
  },
  updateZone: async (zone) => {
    const res = await api.put(`${API_URL}${zone.id}`, zone)
    return res.data
  },
  getZoneMappings: async (zoneId, params) => {
    if (!zoneId) throw new Error('Zone ID is required')
    const query = new URLSearchParams(params).toString() // optional params
    const { data } = await api.get(`${API_URL}${zoneId}/mappings?${query}`)
    return data
  },
  createZoneMapping: async (zoneId, mappingData) => {
    const res = await api.post(`${API_URL}${zoneId}/mappings`, mappingData)
    return res.data
  },
  updateZoneMapping: async (mappingId, mappingData) => {
    console.log('mapping data', mappingData)
    if (!mappingId) throw new Error('Mapping ID is required')
    const res = await api.put(`${API_URL}mappings/${mappingId}`, mappingData)
    return res.data
  },
  deleteZoneMapping: async (mappingId) => {
    if (!mappingId) throw new Error('Mapping ID is required')
    await api.delete(`${API_URL}mappings/${mappingId}`)
    return mappingId
  },
  importZoneMappings: async (zoneId, fileObj, userChoices) => {
    const formData = new FormData()
    formData.append('file', fileObj)
    console.log('user choices', userChoices)

    // Send the user choices as a JSON string
    if (userChoices) {
      formData.append('userChoices', JSON.stringify(userChoices))
    }

    const response = await api.post(`${API_URL}${zoneId}/mappings/import`, formData)

    return response.data
  },
}
