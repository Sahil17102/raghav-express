import api from './axios'
import {
  b2bDemoAdditionalCharges,
  b2bDemoPincodes,
  b2bDemoRates,
  b2bDemoZones,
} from '../data/b2bFastshipDemo'

const BASE_URL = '/admin/b2b'

const normalizeArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.zones)) return payload.zones
  if (Array.isArray(payload?.rates)) return payload.rates
  if (Array.isArray(payload?.overheads)) return payload.overheads
  if (Array.isArray(payload?.states)) return payload.states
  if (Array.isArray(payload?.holidays)) return payload.holidays
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

const buildQuery = (params = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => searchParams.append(key, item))
    } else {
      searchParams.append(key, value)
    }
  })
  return searchParams.toString()
}

export const b2bAdminService = {
  // Zones
  async getZones(params = {}) {
    try {
      const query = buildQuery(params)
      const { data } = await api.get(`${BASE_URL}/zones${query ? `?${query}` : ''}`)
      const zones = normalizeArrayPayload(data)
      return zones.length ? zones : b2bDemoZones
    } catch (error) {
      console.warn('Using seeded B2B zones:', error?.message)
      return b2bDemoZones
    }
  },

  async createZone(payload) {
    const { data } = await api.post(`${BASE_URL}/zones`, payload)
    return data.data ?? data
  },

  async updateZone(id, payload) {
    const { data } = await api.put(`${BASE_URL}/zones/${id}`, payload)
    return data.data ?? data
  },

  async deleteZone(id) {
    const { data } = await api.delete(`${BASE_URL}/zones/${id}`)
    return data
  },

  async remapZone(id) {
    const { data } = await api.post(`${BASE_URL}/zones/${id}/remap`)
    return data
  },

  async getStates() {
    const { data } = await api.get(`${BASE_URL}/states`)
    return normalizeArrayPayload(data)
  },

  // Pincodes
  async getPincodes(params = {}) {
    try {
      const query = buildQuery(params)
      const { data } = await api.get(`${BASE_URL}/pincodes${query ? `?${query}` : ''}`)
      const rows = Array.isArray(data.data) ? data.data : []
      if (rows.length) {
        return {
          data: rows,
          pagination: data.pagination ?? { total: rows.length, page: 1, limit: 20 },
        }
      }
    } catch (error) {
      console.warn('Using seeded B2B pincodes:', error?.message)
    }

      let demoRows = b2bDemoPincodes
      if (params.pincode) {
        demoRows = demoRows.filter((item) => String(item.pincode).includes(String(params.pincode)))
      }
      if (params.zone_id || params.zoneId) {
        const zoneId = params.zone_id || params.zoneId
        demoRows = demoRows.filter((item) => String(item.zone_id) === String(zoneId))
      }
      const page = Number(params.page || 1)
      const limit = Number(params.limit || 20)
      return {
        data: demoRows.slice((page - 1) * limit, page * limit),
        pagination: { total: demoRows.length, page, limit, totalPages: Math.ceil(demoRows.length / limit) },
      }
  },

  async createPincode(payload) {
    const { data } = await api.post(`${BASE_URL}/pincodes`, payload)
    return data.data ?? data
  },

  async updatePincode(id, payload) {
    const { data } = await api.put(`${BASE_URL}/pincodes/${id}`, payload)
    return data.data ?? data
  },

  async deletePincode(id) {
    const { data } = await api.delete(`${BASE_URL}/pincodes/${id}`)
    return data
  },

  async bulkDeletePincodes(payload) {
    const { data } = await api.post(`${BASE_URL}/pincodes/bulk-delete`, payload)
    return data
  },

  async bulkMovePincodes(payload) {
    const { data } = await api.post(`${BASE_URL}/pincodes/bulk-move`, payload)
    return data
  },

  async bulkUpdatePincodeFlags(payload) {
    const { data } = await api.post(`${BASE_URL}/pincodes/bulk-update-flags`, payload)
    return data
  },

  async importPincodes(formData) {
    const { data } = await api.post(`${BASE_URL}/pincodes/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Zone rates
  async getZoneRates(params = {}) {
    try {
      const query = buildQuery(params)
      const { data } = await api.get(`${BASE_URL}/zone-rates${query ? `?${query}` : ''}`)
      const rates = normalizeArrayPayload(data)
      return rates.length ? rates : b2bDemoRates
    } catch (error) {
      console.warn('Using seeded B2B zone rates:', error?.message)
      return b2bDemoRates
    }
  },

  async upsertZoneRate(payload) {
    const { id, ...rest } = payload
    const url = id ? `${BASE_URL}/zone-rates/${id}` : `${BASE_URL}/zone-rates`
    const method = id ? 'put' : 'post'
    const { data } = await api[method](url, rest)
    return data.data ?? data
  },

  async deleteZoneRate(id) {
    const { data } = await api.delete(`${BASE_URL}/zone-rates/${id}`)
    return data
  },

  async importZoneRates(formData) {
    const { data } = await api.post(`${BASE_URL}/zone-rates/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Overheads
  async getOverheads(params = {}) {
    try {
      const query = buildQuery(params)
      const { data } = await api.get(`${BASE_URL}/overheads${query ? `?${query}` : ''}`)
      return normalizeArrayPayload(data)
    } catch (error) {
      console.warn('Using empty B2B overheads:', error?.message)
      return []
    }
  },

  async upsertOverhead(payload) {
    const { id, ...rest } = payload
    const url = id ? `${BASE_URL}/overheads/${id}` : `${BASE_URL}/overheads`
    const method = id ? 'put' : 'post'
    const { data } = await api[method](url, rest)
    return data.data ?? data
  },

  async deleteOverhead(id) {
    const { data } = await api.delete(`${BASE_URL}/overheads/${id}`)
    return data
  },

  // Rate calculator
  async calculateRate(payload) {
    try {
      const { data } = await api.post(`${BASE_URL}/calculate-rate`, payload)
      return data.data ?? data
    } catch (error) {
      console.warn('Using seeded B2B rate calculation:', error?.message)
      const origin =
        b2bDemoPincodes.find((item) => String(item.pincode) === String(payload.originPincode)) ||
        b2bDemoPincodes[0]
      const destination =
        b2bDemoPincodes.find((item) => String(item.pincode) === String(payload.destinationPincode)) ||
        b2bDemoPincodes[1]
      const rate =
        b2bDemoRates.find(
          (item) =>
            String(item.origin_zone_id || item.originZoneId) === String(origin.zone_id) &&
            String(item.destination_zone_id || item.destinationZoneId) === String(destination.zone_id),
        ) || b2bDemoRates[0]
      const charges = b2bDemoAdditionalCharges
      const actualWeight = Number(payload.weightKg || payload.totalWeight || 0)
      const volumetricWeight =
        payload.length && payload.width && payload.height
          ? (Number(payload.length) * Number(payload.width) * Number(payload.height)) /
            Number(charges.cft_factor || 4500)
          : 0
      const billableWeight = Math.max(
        actualWeight,
        volumetricWeight,
        Number(charges.minimum_chargeable_weight || 20),
      )
      const baseFreight = billableWeight * Number(rate?.rate_per_kg || rate?.ratePerKg || 0)
      const codCharge =
        String(payload.paymentMode || '').toUpperCase() === 'COD'
          ? Math.max(
              Number(charges.cod_fixed_amount || 0),
              (Number(payload.invoiceValue || 0) * Number(charges.cod_percentage || 0)) / 100,
            )
          : 0
      return {
        origin: { zoneCode: origin.zone_code, zoneName: origin.zone_name },
        destination: { zoneCode: destination.zone_code, zoneName: destination.zone_name },
        calculation: { actualWeight, volumetricWeight, billableWeight, usedVolumetric: volumetricWeight > actualWeight },
        charges: {
          baseFreight,
          overheads: codCharge ? [{ id: 'cod', name: 'COD Charges', amount: codCharge }] : [],
          total: baseFreight + codCharge,
        },
        rate,
      }
    }
  },

  // Pricing Configuration
  // Additional Charges
  async getAdditionalCharges(params = {}) {
    try {
      const query = buildQuery(params)
      const { data } = await api.get(`${BASE_URL}/additional-charges${query ? `?${query}` : ''}`)
      const charges = data.data ?? data
      return charges && Object.keys(charges).length ? charges : b2bDemoAdditionalCharges
    } catch (error) {
      console.warn('Using seeded B2B additional charges:', error?.message)
      return b2bDemoAdditionalCharges
    }
  },

  async upsertAdditionalCharges(payload) {
    const { data } = await api.post(`${BASE_URL}/additional-charges`, payload)
    return data.data ?? data
  },

  async importAdditionalCharges(formData) {
    const { data } = await api.post(`${BASE_URL}/additional-charges/import`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return data
  },

  // Zone States
  async getZoneStates(params = {}) {
    const query = buildQuery(params)
    const { data } = await api.get(`${BASE_URL}/zone-states${query ? `?${query}` : ''}`)
    return normalizeArrayPayload(data)
  },

  async createZoneState(payload) {
    const { data } = await api.post(`${BASE_URL}/zone-states`, payload)
    return data.data ?? data
  },

  async bulkCreateZoneStates(payload) {
    const { data } = await api.post(`${BASE_URL}/zone-states/bulk`, payload)
    return data.data ?? data
  },

  async deleteZoneState(id) {
    const { data } = await api.delete(`${BASE_URL}/zone-states/${id}`)
    return data
  },

  // Holidays
  async getHolidays(params = {}) {
    const query = buildQuery(params)
    const { data } = await api.get(`${BASE_URL}/holidays${query ? `?${query}` : ''}`)
    return normalizeArrayPayload(data)
  },

  async getHoliday(id) {
    const { data } = await api.get(`${BASE_URL}/holidays/${id}`)
    return data.data ?? data
  },

  async createHoliday(payload) {
    const { data } = await api.post(`${BASE_URL}/holidays`, payload)
    return data.data ?? data
  },

  async updateHoliday(id, payload) {
    const { data } = await api.put(`${BASE_URL}/holidays/${id}`, payload)
    return data.data ?? data
  },

  async deleteHoliday(id) {
    const { data } = await api.delete(`${BASE_URL}/holidays/${id}`)
    return data
  },

  async seedNationalHolidays(year) {
    const { data } = await api.post(`${BASE_URL}/holidays/seed-national`, { year })
    return data.data ?? data
  },
}
