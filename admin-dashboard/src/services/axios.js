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
  if (typeof window === 'undefined') return false
  const token = localStorage.getItem('accessToken') || ''
  return token.endsWith('.local')
}

const isRaghavAdminHost = () => {
  if (typeof window === 'undefined') return false
  const host = window.location.hostname.toLowerCase()
  return host === 'raghav-express-admin.onrender.com' || host === 'localhost' || host === '127.0.0.1'
}

const LOCAL_ADMIN_DATA_ROUTES = [
  '/admin/b2b/',
  '/admin/couriers/credentials',
  '/admin/couriers/shipping-rate',
  '/admin/couriers/shipping-rates',
  '/admin/zones/',
  '/couriers/',
  '/plans',
  '/serviceability/',
]

const shouldUseLocalAdminData = (config = {}) => {
  const rawUrl = String(config.url || '')
  const url = rawUrl.split('?')[0]

  return isRaghavAdminHost() && LOCAL_ADMIN_DATA_ROUTES.some((route) => url.startsWith(route))
}

const LOCATION_STORAGE_KEY = 'raghavAdminLocations'
const LOCATION_SEED_VERSION_KEY = 'raghavAdminLocationSeedVersion'
const COURIER_STORAGE_KEY = 'raghavAdminCouriers'
const COURIER_SEED_VERSION_KEY = 'raghavAdminCourierSeedVersion'
const ZONE_STORAGE_KEY = 'raghavAdminB2CPricingZones'
const ZONE_SEED_VERSION_KEY = 'raghavAdminB2CPricingZoneSeedVersion'
const RATE_STORAGE_KEY = 'raghavAdminB2CPricingRates'
const RATE_SEED_VERSION_KEY = 'raghavAdminB2CPricingRateSeedVersion'
const B2B_ZONE_STORAGE_KEY = 'raghavAdminB2BPricingZones'
const B2B_ZONE_SEED_VERSION_KEY = 'raghavAdminB2BPricingZoneSeedVersion'
const B2B_PINCODE_STORAGE_KEY = 'raghavAdminB2BPricingPincodes'
const B2B_PINCODE_SEED_VERSION_KEY = 'raghavAdminB2BPricingPincodeSeedVersion'
const B2B_RATE_STORAGE_KEY = 'raghavAdminB2BPricingRates'
const B2B_RATE_SEED_VERSION_KEY = 'raghavAdminB2BPricingRateSeedVersion'
const B2B_CHARGES_STORAGE_KEY = 'raghavAdminB2BAdditionalCharges'
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

const DEFAULT_B2B_ZONES = [
  ['41bc95d2-11cd-4c0d-bffd-09431576053b', 'N1', 'Zone N1', 'DELHI, FBD, GZB, GGN, NOIDA', ['DELHI']],
  ['cd1fb249-c150-4cca-a550-a11116072b69', 'N2', 'Zone N2', 'HR, PB, RJ, UP, UK', ['HARYANA', 'PUNJAB', 'RAJASTHAN', 'UTTAR PRADESH', 'UTTARAKHAND']],
  ['89bdcf7c-3939-40b9-a4fe-dbf0d7387815', 'N3', 'Zone N3', 'HIMACHAL PRADESH, JAMMU & KASHMIR', ['HIMACHAL PRADESH', 'JAMMU & KASHMIR', 'JAMMU AND KASHMIR']],
  ['c50a2369-cce5-43d7-ad64-6e3ff7c7f9f1', 'C1', 'Zone C1', 'BHOPAL, INDORE, RAIPUR', ['MADHYA PRADESH']],
  ['d2999bf4-cde1-45f5-9048-0e882e2a66a6', 'C2', 'Zone C2', 'CHHATTISGARH, MADHYA PRADESH', ['CHHATTISGARH', 'MADHYA PRADESH']],
  ['ba1c458e-6eef-4392-b47c-60a2b26f4fed', 'W1', 'Zone W1', 'MUM, PUNE, AHMADABAD, BARODA, BHIWANDI, THANE', []],
  ['7b285749-d225-48db-9240-123abb135fdd', 'W2', 'Zone W2', 'GUJRAT, GOA, MH, DAMAN & DIU, DADRA HAVELI', ['GUJARAT', 'GOA', 'MAHARASHTRA', 'DAMAN AND DIU', 'DADRA AND NAGAR HAVELI']],
  ['f18edc5b-045c-4d2f-9215-522085efc9fb', 'E1', 'Zone E1', 'PATNA, KOLKATA, JAMSHEDPUR, BHUBANESWAR', []],
  ['a8e7ae1f-20aa-4aae-8cac-d39dde38700d', 'E2', 'Zone E2', 'BIHAR, JHARKHAND, ODISHA, WEST BENGAL', ['BIHAR', 'JHARKHAND', 'ODISHA', 'WEST BENGAL']],
  ['d5863747-3548-49ad-b7a1-53f19c0aa316', 'S1', 'Zone S1', 'BANGALORE, CHENNAI, HYDRABAD, SECUNDRABAD, SRIPERUMBUDUR', []],
  ['d27e40da-b818-4b08-af4a-301fa8ef3744', 'S2', 'Zone S2', 'ANDHRA PRADESH, KARNATAKA, TAMIL NADU, TELANGANA', ['ANDHRA PRADESH', 'KARNATAKA', 'TAMIL NADU', 'TELANGANA']],
  ['bcab543e-2f77-40e8-ac25-d18f70ede9af', 'S3', 'Zone S3', 'KERLA, PONDICHERRY', ['KERALA', 'PUDUCHERRY']],
  ['bbfb5a59-64a1-4c8b-b50d-a8d6249db3a9', 'NE1', 'Zone NE1', 'GUWAHATI', []],
  ['270b3fe2-6639-40cc-8622-9ec9e6934349', 'NE2', 'Zone NE2', 'ARUNACHAL, ASSAM, MANIPUR, MEGHALAYA, MIZORAM, NAGALAND, SIKKIM, TRIPURA', ['ARUNACHAL PRADESH', 'ASSAM', 'MANIPUR', 'MEGHALAYA', 'MIZORAM', 'NAGALAND', 'SIKKIM', 'TRIPURA']],
  ['34e4aa66-df82-441c-afcf-99ac19baab90', 'SPECIAL_B2B', 'Special Zone (B2B)', 'Custom rules and exceptions', ['ANDAMAN AND NICOBAR', 'ANDAMAN & NICOBAR', 'CHANDIGARH', 'LAKSHADWEEP', 'LADAKH', 'SIKKIM', 'TRIPURA']],
  ['2e6a4203-b13a-4478-a5aa-9e5b7c973c65', 'TEST781001', 'Guwahati 781001 Zone', 'ASSAM', ['ASSAM']],
].map(([id, code, name, description, states]) => ({
  id,
  code,
  name,
  description,
  states,
  business_type: 'B2B',
  created_at: '2026-09-09T00:31:00+05:30',
}))

const DEFAULT_B2B_PINCODES = DEFAULT_LOCATIONS.slice(0, 22000).map((item, index) => {
  const state = String(item.state || '').toUpperCase()
  const matchingZone =
    DEFAULT_B2B_ZONES.find((zone) => (zone.states || []).includes(state)) ||
    DEFAULT_B2B_ZONES[index % DEFAULT_B2B_ZONES.length]
  return {
    id: `b2b-pin-${item.pincode}`,
    pincode: item.pincode,
    city: item.city,
    state: item.state,
    zone_id: matchingZone.id,
    zone_code: matchingZone.code,
    zone_name: matchingZone.name,
    courier_name: 'Global',
    courier_id: '',
    service_provider: '',
    attributes: 'Standard',
    sdl_rate_per_kg: '',
    is_oda: false,
    is_remote: false,
    is_mall: false,
    is_sez: false,
    is_airport: false,
    is_high_security: false,
  }
})

const DEFAULT_B2B_RATES = DEFAULT_B2B_ZONES.flatMap((origin, originIndex) =>
  DEFAULT_B2B_ZONES.map((destination, destinationIndex) => ({
    id: `b2b-rate-${origin.code}-${destination.code}`,
    originZoneId: origin.id,
    destinationZoneId: destination.id,
    origin_zone_id: origin.id,
    destination_zone_id: destination.id,
    ratePerKg: originIndex === destinationIndex ? 18 : 22 + Math.abs(originIndex - destinationIndex),
    rate_per_kg: originIndex === destinationIndex ? 18 : 22 + Math.abs(originIndex - destinationIndex),
    courier_id: undefined,
    service_provider: undefined,
    plan_id: 'basic',
  })),
)

const DEFAULT_B2B_CHARGES = {
  awb_charges: 0,
  cft_factor: 4500,
  minimum_chargeable_amount: 0,
  minimum_chargeable_weight: 20,
  minimum_chargeable_method: 'whichever_is_higher',
  free_storage_days: 2,
  demurrage_per_awb_day: 0,
  demurrage_per_kg_day: 0,
  demurrage_method: 'whichever_is_higher',
  public_holiday_pickup_charge: 0,
  fuel_surcharge_percentage: 0,
  green_tax: 0,
  fm_charge_per_awb: 0,
  fm_charge_per_kg: 0,
  fm_calculation_method: 'whichever_is_higher',
  to_pay_charge_fixed: 0,
  to_pay_charge_percent: 0,
  green_tax_fixed: 0,
  green_tax_per_kg: 0,
  oda_charges: 0,
  oda_per_kg_charge: 0,
  oda_method: 'whichever_is_higher',
  csd_delivery_charge: 0,
  time_specific_per_kg: 0,
  time_specific_per_awb: 0,
  time_specific_method: 'whichever_is_higher',
  mall_delivery_per_kg: 0,
  mall_delivery_per_awb: 0,
  mall_delivery_method: 'whichever_is_higher',
  delivery_reattempt_per_kg: 0,
  delivery_reattempt_per_awb: 0,
  delivery_reattempt_method: 'whichever_is_higher',
  handling_single_piece: 0,
  handling_below_100_kg: 0,
  handling_100_to_200_kg: 0,
  handling_above_200_kg: 0,
  cod_fixed_amount: 33,
  cod_percentage: 1.7,
  cod_method: 'whichever_is_higher',
  rov_fixed_amount: 0,
  rov_percentage: 0,
  rov_method: 'whichever_is_higher',
  insurance_charge: 0,
  liability_limit: 0,
  liability_method: 'whichever_is_lower',
}

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

const readB2BZones = () => {
  const saved = readLocalData(B2B_ZONE_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(B2B_ZONE_SEED_VERSION_KEY)
  if (savedVersion !== 'fastship-clone-2026-09-18' || !Array.isArray(saved) || saved.length < DEFAULT_B2B_ZONES.length) {
    const customByCode = new Map((Array.isArray(saved) ? saved : []).map((item) => [String(item.code), item]))
    const upgraded = DEFAULT_B2B_ZONES.map((item) => ({ ...item, ...(customByCode.get(String(item.code)) || {}) }))
    writeLocalData(B2B_ZONE_STORAGE_KEY, upgraded)
    localStorage.setItem(B2B_ZONE_SEED_VERSION_KEY, 'fastship-clone-2026-09-18')
    return upgraded
  }
  return saved
}

const readB2BPincodes = () => {
  const saved = readLocalData(B2B_PINCODE_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(B2B_PINCODE_SEED_VERSION_KEY)
  if (savedVersion !== 'fastship-clone-2026-09-18' || !Array.isArray(saved) || saved.length < 20000) {
    writeLocalData(B2B_PINCODE_STORAGE_KEY, DEFAULT_B2B_PINCODES)
    localStorage.setItem(B2B_PINCODE_SEED_VERSION_KEY, 'fastship-clone-2026-09-18')
    return DEFAULT_B2B_PINCODES
  }
  return saved
}

const readB2BRates = () => {
  const saved = readLocalData(B2B_RATE_STORAGE_KEY, null)
  const savedVersion = localStorage.getItem(B2B_RATE_SEED_VERSION_KEY)
  if (savedVersion !== 'fastship-clone-2026-09-18' || !Array.isArray(saved) || saved.length < DEFAULT_B2B_RATES.length) {
    const customById = new Map((Array.isArray(saved) ? saved : []).map((item) => [String(item.id), item]))
    const upgraded = DEFAULT_B2B_RATES.map((item) => ({ ...item, ...(customById.get(String(item.id)) || {}) }))
    writeLocalData(B2B_RATE_STORAGE_KEY, upgraded)
    localStorage.setItem(B2B_RATE_SEED_VERSION_KEY, 'fastship-clone-2026-09-18')
    return upgraded
  }
  return saved
}

const readB2BCharges = () => readLocalData(B2B_CHARGES_STORAGE_KEY, DEFAULT_B2B_CHARGES)

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
  const rawUrl = String(config.url || '')
  const url = rawUrl.split('?')[0]
  const queryParams = Object.fromEntries(new URLSearchParams(rawUrl.split('?')[1] || '').entries())
  config.params = { ...queryParams, ...(config.params || {}) }
  let payload = {}
  if (typeof config.data === 'string') {
    try {
      payload = JSON.parse(config.data || '{}')
    } catch {
      payload = {}
    }
  } else if (
    config.data &&
    (typeof FormData === 'undefined' || !(config.data instanceof FormData))
  ) {
    payload = config.data
  }
  let locations = readLocations()
  let couriers = readCouriers()
  let b2cZones = readB2CZones()
  let b2cRates = readB2CRates()
  let b2bZones = readB2BZones()
  let b2bPincodes = readB2BPincodes()
  let b2bRates = readB2BRates()
  let b2bCharges = readB2BCharges()
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
  if (url === '/admin/b2b/states' && method === 'get') {
    const states = Array.from(new Set(DEFAULT_LOCATIONS.map((item) => item.state).filter(Boolean))).sort()
    return createLocalResponse(config, { success: true, data: states })
  }
  if (url === '/admin/b2b/zones' && method === 'get') return createLocalResponse(config, { success: true, data: b2bZones })
  if (url === '/admin/b2b/zones' && method === 'post') {
    const item = { id: payload.id || `b2b-zone-${Date.now()}`, created_at: new Date().toISOString(), business_type: 'B2B', ...payload }
    b2bZones = [...b2bZones, item]
    writeLocalData(B2B_ZONE_STORAGE_KEY, b2bZones)
    return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/admin/b2b/zones/') && ['put', 'delete'].includes(method)) {
    const id = url.split('/').filter(Boolean).pop()
    b2bZones = method === 'delete'
      ? b2bZones.filter((item) => String(item.id) !== String(id))
      : b2bZones.map((item) => String(item.id) === String(id) ? { ...item, ...payload } : item)
    writeLocalData(B2B_ZONE_STORAGE_KEY, b2bZones)
    return createLocalResponse(config, { success: true, data: payload })
  }
  if (url === '/admin/b2b/pincodes' && method === 'get') {
    const params = config.params || {}
    let rows = b2bPincodes
    if (params.pincode) rows = rows.filter((item) => String(item.pincode).includes(String(params.pincode)))
    if (params.zone_id || params.zoneId) {
      const zoneId = params.zone_id || params.zoneId
      rows = rows.filter((item) => String(item.zone_id) === String(zoneId))
    }
    if (params.state) rows = rows.filter((item) => String(item.state).toLowerCase().includes(String(params.state).toLowerCase()))
    const page = Number(params.page || 1)
    const limit = Number(params.limit || 20)
    return createLocalResponse(config, {
      success: true,
      data: rows.slice((page - 1) * limit, page * limit),
      pagination: { total: rows.length, page, limit, totalPages: Math.ceil(rows.length / limit) },
    })
  }
  if (url === '/admin/b2b/pincodes' && method === 'post') {
    const zone = b2bZones.find((item) => String(item.id) === String(payload.zone_id || payload.zoneId)) || b2bZones[0]
    const item = { id: `b2b-pin-${payload.pincode}-${Date.now()}`, ...payload, zone_id: zone?.id, zone_code: zone?.code, zone_name: zone?.name }
    b2bPincodes = [item, ...b2bPincodes]
    writeLocalData(B2B_PINCODE_STORAGE_KEY, b2bPincodes)
    return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/admin/b2b/pincodes/') && ['put', 'delete'].includes(method)) {
    const id = url.split('/').filter(Boolean).pop()
    b2bPincodes = method === 'delete'
      ? b2bPincodes.filter((item) => String(item.id) !== String(id))
      : b2bPincodes.map((item) => String(item.id) === String(id) ? { ...item, ...payload } : item)
    writeLocalData(B2B_PINCODE_STORAGE_KEY, b2bPincodes)
    return createLocalResponse(config, { success: true, data: payload })
  }
  if (url === '/admin/b2b/zone-rates' && method === 'get') {
    const params = config.params || {}
    let rows = b2bRates
    if (params.plan_id) rows = rows.filter((row) => String(row.plan_id || 'basic') === String(params.plan_id))
    if (params.courier_id) rows = rows.filter((row) => !row.courier_id || String(row.courier_id) === String(params.courier_id))
    if (params.service_provider) rows = rows.filter((row) => !row.service_provider || String(row.service_provider) === String(params.service_provider))
    return createLocalResponse(config, { success: true, data: rows })
  }
  if (url === '/admin/b2b/zone-rates' && method === 'post') {
    const item = {
      id: payload.id || `b2b-rate-${payload.originZoneId}-${payload.destinationZoneId}-${Date.now()}`,
      ...payload,
      origin_zone_id: payload.originZoneId || payload.origin_zone_id,
      destination_zone_id: payload.destinationZoneId || payload.destination_zone_id,
      rate_per_kg: payload.ratePerKg || payload.rate_per_kg,
      plan_id: payload.plan_id || payload.planId || 'basic',
    }
    b2bRates = [...b2bRates.filter((row) => row.id !== item.id), item]
    writeLocalData(B2B_RATE_STORAGE_KEY, b2bRates)
    return createLocalResponse(config, { success: true, data: item })
  }
  if (url.startsWith('/admin/b2b/zone-rates/') && ['put', 'delete'].includes(method)) {
    const id = url.split('/').filter(Boolean).pop()
    b2bRates = method === 'delete'
      ? b2bRates.filter((item) => String(item.id) !== String(id))
      : b2bRates.map((item) => String(item.id) === String(id) ? { ...item, ...payload, rate_per_kg: payload.ratePerKg || payload.rate_per_kg } : item)
    writeLocalData(B2B_RATE_STORAGE_KEY, b2bRates)
    return createLocalResponse(config, { success: true, data: payload })
  }
  if (url === '/admin/b2b/additional-charges' && method === 'get') return createLocalResponse(config, { success: true, data: b2bCharges })
  if (url === '/admin/b2b/additional-charges' && method === 'post') {
    b2bCharges = { ...b2bCharges, ...payload }
    writeLocalData(B2B_CHARGES_STORAGE_KEY, b2bCharges)
    return createLocalResponse(config, { success: true, data: b2bCharges })
  }
  if (url === '/admin/b2b/overheads' && method === 'get') return createLocalResponse(config, { success: true, data: [] })
  if (url === '/admin/b2b/calculate-rate' && method === 'post') {
    const origin = b2bPincodes.find((item) => String(item.pincode) === String(payload.originPincode)) || b2bPincodes[0]
    const destination = b2bPincodes.find((item) => String(item.pincode) === String(payload.destinationPincode)) || b2bPincodes[1]
    const rate = b2bRates.find((item) => String(item.origin_zone_id) === String(origin.zone_id) && String(item.destination_zone_id) === String(destination.zone_id)) || b2bRates[0]
    const actualWeight = Number(payload.weightKg || 0)
    const volumetricWeight = payload.length && payload.width && payload.height
      ? (Number(payload.length) * Number(payload.width) * Number(payload.height)) / Number(b2bCharges.cft_factor || 4500)
      : 0
    const billableWeight = Math.max(actualWeight, volumetricWeight, Number(b2bCharges.minimum_chargeable_weight || 0))
    const baseFreight = billableWeight * Number(rate?.rate_per_kg || rate?.ratePerKg || 0)
    const codCharge = String(payload.paymentMode || '').toUpperCase() === 'COD' ? Number(b2bCharges.cod_fixed_amount || 0) : 0
    return createLocalResponse(config, { success: true, data: {
      origin: { zoneCode: origin.zone_code, zoneName: origin.zone_name },
      destination: { zoneCode: destination.zone_code, zoneName: destination.zone_name },
      calculation: { actualWeight, volumetricWeight, billableWeight, usedVolumetric: volumetricWeight > actualWeight },
      charges: { baseFreight, overheads: codCharge ? [{ id: 'cod', name: 'COD Charges', amount: codCharge }] : [], total: baseFreight + codCharge },
    } })
  }
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

  if (shouldUseLocalAdminData(config) || (isLocalAdminSession() && isRaghavAdminHost())) {
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
