import pincodeSeed from './indiaPincodeSeed.json'

export const b2bDemoPlans = [
  { id: 'basic', name: 'Basic' },
  ...'ABCDEFGHIJKLM'.split('').map((suffix) => ({ id: `plan-${suffix.toLowerCase()}`, name: `Plan ${suffix}` })),
]

export const b2bDemoZones = [
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

export const b2bDemoPincodes = pincodeSeed.locations.slice(0, 22000).map(([pincode, city, state], index) => {
  const upperState = String(state || '').toUpperCase()
  const zone =
    b2bDemoZones.find((candidate) => (candidate.states || []).includes(upperState)) ||
    b2bDemoZones[index % b2bDemoZones.length]

  return {
    id: `b2b-pin-${pincode}`,
    pincode,
    city,
    state,
    zone_id: zone.id,
    zone_code: zone.code,
    zone_name: zone.name,
    courier_name: 'Global',
    attributes: 'Standard',
    sdl_rate_per_kg: '',
  }
})

export const b2bDemoRates = b2bDemoZones.flatMap((origin, originIndex) =>
  b2bDemoZones.map((destination, destinationIndex) => ({
    id: `b2b-rate-${origin.code}-${destination.code}`,
    originZoneId: origin.id,
    destinationZoneId: destination.id,
    origin_zone_id: origin.id,
    destination_zone_id: destination.id,
    ratePerKg: originIndex === destinationIndex ? 18 : 22 + Math.abs(originIndex - destinationIndex),
    rate_per_kg: originIndex === destinationIndex ? 18 : 22 + Math.abs(originIndex - destinationIndex),
    plan_id: 'basic',
  })),
)

export const b2bDemoAdditionalCharges = {
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
  insurance_charge: 0,
  cod_fixed_amount: 33,
  cod_percentage: 1.7,
  cod_method: 'whichever_is_higher',
  rov_fixed_amount: 0,
  rov_percentage: 0,
  rov_method: 'whichever_is_higher',
  liability_limit: 5000,
  liability_method: 'whichever_is_lower',
}
