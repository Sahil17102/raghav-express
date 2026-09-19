import api from './axios' // your pre-configured axios instance
import pincodeSeed from '../data/indiaPincodeSeed.json'

const DEFAULT_COURIERS = [
  ['delhivery-b2c', 'Delhivery Surface', 'delhivery', ['b2c']],
  ['delhivery-express', 'Delhivery Express', 'delhivery', ['b2c']],
  ['delhivery-b2b', 'Delhivery B2B LTL', 'delhivery', ['b2b']],
  ['india-post-speed', 'India Post Speed Post', 'india_post', ['b2c']],
  ['india-post-parcel', 'India Post Parcel', 'india_post', ['b2c', 'b2b']],
].map(([id, name, serviceProvider, businessType]) => ({
  id,
  name,
  serviceProvider,
  businessType,
  isEnabled: true,
  createdAt: '2026-09-17',
}))

const DEFAULT_CREDENTIALS = {
  delhivery: {
    apiBase: 'https://track.delhivery.com',
    clientName: 'Raghav Express',
    apiKeyMasked: 'Configured',
    hasApiKey: true,
    configured: true,
  },
  delhiveryB2B: {
    apiBase: 'https://ltl-clients-api.delhivery.com',
    username: 'Configured',
    freightMode: 'fop',
    fmPickup: true,
    hasPassword: true,
    configured: true,
  },
  indiaPost: {
    apiBase: 'https://test.cept.gov.in',
    customerId: '1674369691',
    username: 'Configured',
    configured: true,
  },
}

const B2C_ZONES = [
  ['WITHIN_CITY', 'Within City', [29, 34, 45, 82, 145, 260]],
  ['WITHIN_STATE', 'Within State', [34, 39, 54, 94, 168, 305]],
  ['WITHIN_REGION', 'Within Region', [39, 46, 64, 112, 205, 365]],
  ['METRO_TO_METRO', 'Metro to Metro', [42, 49, 68, 118, 218, 390]],
  ['ROI', 'Rest of India', [48, 56, 78, 138, 252, 455]],
  ['KASHMIR', 'Kashmir', [62, 74, 105, 190, 355, 640]],
]

const B2C_SLABS = [
  { weight_from: 0, weight_to: 0.5, extra_weight_unit: 0.5 },
  { weight_from: 0.5, weight_to: 1, extra_weight_unit: 0.5 },
  { weight_from: 1, weight_to: 2, extra_weight_unit: 1 },
  { weight_from: 2, weight_to: 5, extra_weight_unit: 1 },
  { weight_from: 5, weight_to: 10, extra_weight_unit: 1 },
  { weight_from: 10, weight_to: 20, extra_weight_unit: 1 },
]

const COURIER_RATE_PROFILES = {
  'delhivery-express': {
    mode: 'air',
    multiplier: 1.12,
    minWeight: 0.5,
    codFlat: 34,
    codPercent: 1.8,
    edd: '2-4 days',
  },
  'delhivery-b2c': {
    mode: 'surface',
    multiplier: 1,
    minWeight: 0.5,
    codFlat: 38,
    codPercent: 1.8,
    edd: '3-6 days',
  },
  'india-post-speed': {
    mode: 'air',
    multiplier: 1.08,
    minWeight: 0.5,
    codFlat: 30,
    codPercent: 1.5,
    edd: '2-5 days',
  },
  'india-post-parcel': {
    mode: 'surface',
    multiplier: 0.92,
    minWeight: 2,
    codFlat: 30,
    codPercent: 1.5,
    edd: '4-8 days',
  },
}

const getZoneSlabsForCourier = (profile) =>
  Object.fromEntries(
    B2C_ZONES.map(([, zoneName, baseRates]) => [
      zoneName,
      {
        forward: B2C_SLABS.map((slab, index) => {
          const rate = Math.round(baseRates[index] * profile.multiplier)
          return {
            ...slab,
            rate,
            extra_rate: Math.max(18, Math.round(rate * 0.72)),
          }
        }),
        rto: B2C_SLABS.map((slab, index) => {
          const rate = Math.round(baseRates[index] * profile.multiplier * 0.92)
          return {
            ...slab,
            rate,
            extra_rate: Math.max(16, Math.round(rate * 0.7)),
          }
        }),
        reverse_pickup: [],
      },
    ]),
  )

const DEFAULT_B2C_RATES = DEFAULT_COURIERS.filter((courier) =>
  (courier.businessType || []).includes('b2c'),
).map((courier) => {
  const profile = COURIER_RATE_PROFILES[courier.id] || COURIER_RATE_PROFILES['delhivery-b2c']
  return {
    id: `${courier.id}-basic-${profile.mode}`,
    courier_id: courier.id,
    courier_name: courier.name,
    service_provider: courier.serviceProvider,
    serviceProvider: courier.serviceProvider,
    business_type: 'b2c',
    plan_id: 'basic',
    mode: profile.mode,
    min_weight: profile.minWeight,
    cod_charges: profile.codFlat,
    cod_percent: profile.codPercent,
    cod_slabs: [
      { order_value_from: 0, order_value_to: 2000, charge_type: 'flat', charge_value: profile.codFlat },
      { order_value_from: 2000, order_value_to: '', charge_type: 'percent', charge_value: profile.codPercent },
    ],
    other_charges: 0,
    zone_slabs: getZoneSlabsForCourier(profile),
    edd: profile.edd,
  }
})

const normalizePincode = (value) => String(value || '').replace(/\D/g, '').slice(0, 6)

const getSeedLocation = (pincode) => {
  const normalized = normalizePincode(pincode)
  const found = pincodeSeed.locations.find(([pin]) => String(pin) === normalized)
  return found ? { pincode: found[0], city: found[1], state: found[2], tags: found[3] || [] } : null
}

const getApproxB2CZone = ({ origin, destination }) => {
  const originLoc = getSeedLocation(origin)
  const destLoc = getSeedLocation(destination)
  const originPin = normalizePincode(origin)
  const destPin = normalizePincode(destination)

  if (originPin && destPin && originPin === destPin) {
    return { code: 'WITHIN_CITY', name: 'Within City' }
  }
  if (originPin.slice(0, 3) && originPin.slice(0, 3) === destPin.slice(0, 3)) {
    return { code: 'WITHIN_CITY', name: 'Within City' }
  }
  if (originLoc?.state && originLoc.state === destLoc?.state) {
    return { code: 'WITHIN_STATE', name: 'Within State' }
  }
  if ((originLoc?.tags || []).includes('metro') && (destLoc?.tags || []).includes('metro')) {
    return { code: 'METRO_TO_METRO', name: 'Metro to Metro' }
  }
  if (['Jammu and Kashmir', 'Kashmir', 'Ladakh'].includes(destLoc?.state)) {
    return { code: 'KASHMIR', name: 'Kashmir' }
  }
  return { code: 'ROI', name: 'Rest of India' }
}

const getChargeableWeightKg = (params = {}) => {
  const actualGrams = Number(params.weight || params.actualWeight || 0)
  const volumetricKg =
    Number(params.length || 0) && Number(params.breadth || params.width || 0) && Number(params.height || 0)
      ? (Number(params.length) * Number(params.breadth || params.width) * Number(params.height)) / 5000
      : 0
  const actualKg = actualGrams > 20 ? actualGrams / 1000 : actualGrams
  return Math.max(actualKg || 0, volumetricKg || 0, 0.5)
}

const pickSlab = (slabs = [], chargeableKg) =>
  slabs.find((slab) => chargeableKg <= Number(slab.weight_to || Infinity)) || slabs[slabs.length - 1]

const calculateSeededAvailableCouriers = (params = {}) => {
  const zone = getApproxB2CZone({
    origin: params.origin || params.pickupPincode,
    destination: params.destination || params.deliveryPincode,
  })
  const chargeableKg = getChargeableWeightKg(params)
  const paymentType = String(params.payment_type || params.paymentType || '').toLowerCase()
  const orderAmount = Number(params.order_amount || params.orderAmount || 0)

  return DEFAULT_B2C_RATES.map((rateRow) => {
    const zoneSlabs = rateRow.zone_slabs?.[zone.name]?.forward || []
    const slab = pickSlab(zoneSlabs, chargeableKg)
    const baseRate = Number(slab?.rate || 0)
    const codPercentCharge = orderAmount > 0 ? (orderAmount * Number(rateRow.cod_percent || 0)) / 100 : 0
    const codCharge = paymentType === 'cod' ? Math.max(Number(rateRow.cod_charges || 0), codPercentCharge) : 0

    return {
      id: rateRow.courier_id,
      name: rateRow.courier_name,
      displayName: rateRow.courier_name,
      serviceProvider: rateRow.service_provider,
      mode: rateRow.mode,
      rate: baseRate,
      freight_charges: baseRate,
      cod_charges: codCharge,
      total_charges: baseRate + codCharge,
      edd: rateRow.edd,
      approxZone: zone,
      chargeable_weight: Math.round(chargeableKg * 1000),
      volumetric_weight:
        Number(params.length || 0) && Number(params.breadth || params.width || 0) && Number(params.height || 0)
          ? Math.round((Number(params.length) * Number(params.breadth || params.width) * Number(params.height)) / 5)
          : 0,
      max_slab_weight: slab?.weight_to,
      slabs: `${slab?.weight_from || 0}-${slab?.weight_to || 'open'} kg`,
      localRates: {
        forward: {
          ...slab,
          cod_charges: rateRow.cod_charges,
          cod_percent: rateRow.cod_percent,
          max_slab_weight: slab?.weight_to,
        },
      },
    }
  }).sort((a, b) => a.total_charges - b.total_charges)
}

const getSeededCouriers = (filters = {}) => {
  const businessType = String(filters.businessType || '').toLowerCase()
  const serviceProvider = String(filters.serviceProvider || '').toLowerCase()
  const search = String(filters.search || '').toLowerCase()

  return DEFAULT_COURIERS.filter((courier) => {
    if (serviceProvider && String(courier.serviceProvider).toLowerCase() !== serviceProvider) {
      return false
    }
    if (
      businessType &&
      !(courier.businessType || []).map((type) => String(type).toLowerCase()).includes(businessType)
    ) {
      return false
    }
    if (
      search &&
      !`${courier.id} ${courier.name} ${courier.serviceProvider}`.toLowerCase().includes(search)
    ) {
      return false
    }
    return true
  })
}

const getSeededProviders = () =>
  ['delhivery', 'india_post'].map((serviceProvider) => {
    const matches = DEFAULT_COURIERS.filter((item) => item.serviceProvider === serviceProvider)
    return {
      serviceProvider,
      totalCouriers: matches.length,
      enabledCouriers: matches.filter((item) => item.isEnabled).length,
      isEnabled: matches.some((item) => item.isEnabled),
    }
  })

const normalizeArrayPayload = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.data)) return payload.data
  if (Array.isArray(payload?.couriers)) return payload.couriers
  if (Array.isArray(payload?.rates)) return payload.rates
  if (Array.isArray(payload?.items)) return payload.items
  return []
}

export const fetchShippingRates = async (filters = {}) => {
  const params = {}
  if (filters.courier_name) params.courier_name = filters.courier_name
  if (filters.mode) params.mode = filters.mode
  if (filters.min_weight !== undefined && filters.businessType?.toLowerCase() !== 'b2c') {
    params.min_weight = filters.min_weight
  }
  if (filters.businessType) params.businessType = filters.businessType
  if (filters.planId) params.planId = filters.planId
  try {
    const response = await api.get('/admin/couriers/shipping-rates', { params })
    const rows = normalizeArrayPayload(response.data)
    if (rows.length) return rows
  } catch (error) {
    console.warn('Using seeded B2C shipping rates:', error?.message)
  }

  if (String(filters.businessType || '').toLowerCase() === 'b2b') return []

  return DEFAULT_B2C_RATES.map((row) => ({
    ...row,
    plan_id: filters.planId || row.plan_id || 'basic',
  })).filter((row) => {
    if (filters.mode && String(row.mode || '').toLowerCase() !== String(filters.mode).toLowerCase()) {
      return false
    }
    if (filters.courier_name) {
      const selected = Array.isArray(filters.courier_name) ? filters.courier_name : [filters.courier_name]
      if (!selected.includes(row.courier_name)) return false
    }
    return true
  })
}

export const fetchAvailableCouriers = async (params) => {
  try {
    const res = await api.post('/admin/couriers/available', {
      ...params,
      shipment_type: params.shipment_type ?? 'b2c',
    })

    if (!res.data.success) {
      throw new Error(res.data.error || 'Failed to fetch couriers')
    }

    return res.data.data
  } catch (error) {
    console.warn('Using seeded available couriers:', error.response?.data || error.message)
    return calculateSeededAvailableCouriers(params)
  }
}

export const fetchAllCouriers = async () => {
  const res = await api.get(`/admin/couriers/list`)
  if (!res.data?.success) throw new Error('Failed to fetch couriers')
  return normalizeArrayPayload(res.data) // returns an array of courier names
}

export const fetchAllCouriersList = async (filters = {}) => {
  const params = {}
  if (filters.search) params.search = filters.search
  if (filters.serviceProvider) params.serviceProvider = filters.serviceProvider
  if (filters.businessType) params.businessType = filters.businessType

  let couriers = []
  try {
    const res = await api.get(`/couriers/full-list`, { params })
    if (!res.data?.success) throw new Error('Failed to fetch couriers')
    couriers = normalizeArrayPayload(res.data)
  } catch (error) {
    console.warn('Using seeded courier list:', error?.message)
    couriers = getSeededCouriers(filters)
  }
  const businessType = String(filters.businessType || '').toLowerCase()
  const paidProviders = new Set(['delhivery', 'india_post'])
  const paidB2BIds = new Set(['delhivery-b2b', 'india-post-parcel'])
  const paidB2CIds = new Set([
    'delhivery-b2c',
    'delhivery-express',
    'india-post-speed',
    'india-post-parcel',
  ])

  return couriers.filter((courier) => {
    const provider = courier.serviceProvider || courier.service_provider
    if (!paidProviders.has(provider)) return false
    if (businessType === 'b2b') return paidB2BIds.has(String(courier.id))
    if (businessType === 'b2c') return paidB2CIds.has(String(courier.id))
    return true
  }) // returns an array of courier objects
}

export const createCourier = async (payload) => {
  const { data } = await api.post(`/couriers/create`, payload)
  return data
}
export const deleteCourier = async ({ id, serviceProvider }) => {
  const { data } = await api.delete(`/couriers/delete/${id}`, {
    data: { serviceProvider },
  })
  return data
}

export const updateCourierStatus = async ({ id, serviceProvider, isEnabled, businessType }) => {
  const { data } = await api.patch(`/couriers/status/${id}`, {
    serviceProvider,
    isEnabled,
    businessType, // Optional: array of ['b2c'], ['b2b'], or ['b2c', 'b2b']
  })
  return data
}

export const fetchServiceProviders = async () => {
  try {
    const { data } = await api.get(`/couriers/providers`)
    if (!data?.success) throw new Error('Failed to fetch service providers')
    return Array.isArray(data.data) && data.data.length ? data.data : getSeededProviders()
  } catch (error) {
    console.warn('Using seeded service providers:', error?.message)
    return getSeededProviders()
  }
}

export const updateServiceProviderStatus = async ({ serviceProvider, isEnabled }) => {
  const { data } = await api.patch(`/couriers/providers/${serviceProvider}`, {
    isEnabled,
  })
  return data
}

export const updateShippingRate = async (id, updates, planId) => {
  const { data } = await api.put(`/admin/couriers/shipping-rate/${id}/${planId}`, updates)
  return data
}

export const uploadShippingRates = async ({ file, planId, businessType, targetCourier }) => {
  if (!file) throw new Error('No file provided for import')

  const formData = new FormData()
  formData.append('file', file?.file) // must be File or Blob
  const params = new URLSearchParams()
  if (planId) {
    params.set('planId', planId)
    params.set('plan_id', planId)
  }
  if (businessType) {
    const normalizedBusinessType = businessType.toLowerCase()
    params.set('businessType', normalizedBusinessType)
    params.set('business_type', normalizedBusinessType)
  }
  if (targetCourier?.courierId) {
    params.set('targetCourierId', String(targetCourier.courierId))
    params.set('target_courier_id', String(targetCourier.courierId))
  }
  if (targetCourier?.courierName) {
    params.set('targetCourierName', String(targetCourier.courierName))
    params.set('target_courier_name', String(targetCourier.courierName))
  }
  if (targetCourier?.serviceProvider) {
    params.set('targetServiceProvider', String(targetCourier.serviceProvider))
    params.set('target_service_provider', String(targetCourier.serviceProvider))
  }
  if (targetCourier?.mode) {
    params.set('targetMode', String(targetCourier.mode))
    params.set('target_mode', String(targetCourier.mode))
  }

  try {
    const { data } = await api.post(
      `/admin/couriers/shipping-rates/import?${params.toString()}`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
    )

    return data
  } catch (error) {
    const serverMessage =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      'Failed to upload shipping rates'

    throw new Error(serverMessage)
  }
}
// Unified delete function: B2C zone, B2B zone, B2B courier
export const deleteShippingRateAPI = async ({
  courierId,
  planId,
  businessType,
  zoneId,
  serviceProvider,
  mode,
}) => {
  if (!courierId || !planId || !businessType) {
    throw new Error('courierId, planId and businessType are required')
  }

  const { data } = await api.delete(`/admin/couriers/shipping-rates/${planId}/${courierId}`, {
    params: {
      businessType,
      zoneId,
      serviceProvider,
      mode,
    },
  })

  return data
}

export const fetchCourierCredentials = async () => {
  try {
    const { data } = await api.get('/admin/couriers/credentials')
    if (!data?.success) throw new Error('Failed to fetch courier credentials')
    return data.data || DEFAULT_CREDENTIALS
  } catch (error) {
    console.warn('Using seeded courier credentials:', error?.message)
    return DEFAULT_CREDENTIALS
  }
}

export const updateDelhiveryCredentials = async (payload) => {
  const { data } = await api.put('/admin/couriers/credentials/delhivery', payload)
  if (!data?.success) throw new Error('Failed to update Delhivery credentials')
  return data.data
}

export const updateDelhiveryB2BCredentials = async (payload) => {
  const { data } = await api.put('/admin/couriers/credentials/delhivery-b2b', payload)
  if (!data?.success) throw new Error('Failed to update Delhivery B2B credentials')
  return data.data
}

export const testDelhiveryB2BCredentials = async () => {
  const { data } = await api.post('/admin/couriers/credentials/delhivery-b2b/test')
  if (!data?.success) throw new Error(data?.message || 'Failed to test Delhivery B2B credentials')
  return data.data
}

export const updateEkartCredentials = async (payload) => {
  const { data } = await api.put('/admin/couriers/credentials/ekart', payload)
  if (!data?.success) throw new Error('Failed to update Ekart credentials')
  return data.data
}

export const updateXpressbeesCredentials = async (payload) => {
  const { data } = await api.put('/admin/couriers/credentials/xpressbees', payload)
  if (!data?.success) throw new Error('Failed to update Xpressbees credentials')
  return data.data
}

export const testXpressbeesCredentials = async (payload) => {
  const { data } = await api.post('/admin/couriers/credentials/xpressbees/test', payload)
  if (!data?.success) throw new Error(data?.message || 'Failed to test Xpressbees credentials')
  return data.data
}

export const updateXpressbeesAwbRange = async (payload) => {
  const { data } = await api.put('/admin/couriers/credentials/xpressbees/awb-range', payload)
  if (!data?.success) throw new Error(data?.message || 'Failed to update Xpressbees AWB range')
  return data.data
}

export const updateShadowfaxCredentials = async (payload) => {
  const { data } = await api.put('/admin/couriers/credentials/shadowfax', payload)
  if (!data?.success) throw new Error('Failed to update Shadowfax credentials')
  return data.data
}
