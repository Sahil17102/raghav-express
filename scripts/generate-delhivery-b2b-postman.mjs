import { mkdir, writeFile } from 'node:fs/promises';

const base = '{{baseUrl}}/api/delhivery/b2b';
const requests = [
  [
    'Reset Password',
    'POST',
    `${base}/auth/forgot-password`,
    { username: '{{delhiveryUsername}}' },
    true,
  ],
  [
    'Login',
    'POST',
    `${base}/auth/login`,
    { username: '{{delhiveryUsername}}', password: '{{delhiveryPassword}}' },
  ],
  ['Logout', 'GET', `${base}/auth/logout`, undefined, true],
  ['Serviceability', 'GET', `${base}/serviceability/122001?weight=1000`],
  [
    'Expected TAT',
    'GET',
    `${base}/tat?origin_pin=400093&destination_pin=122001`,
  ],
  [
    'Freight Estimate',
    'POST',
    `${base}/freight/estimate`,
    {
      dimensions: [
        { length_cm: 11, width_cm: 10, height_cm: 11, box_count: 1 },
      ],
      weight_g: 1000,
      cheque_payment: false,
      source_pin: '400069',
      consignee_pin: '122001',
      payment_mode: 'prepaid',
      inv_amount: 123,
      freight_mode: 'fop',
      rov_insurance: true,
    },
  ],
  ['Freight Charges', 'GET', `${base}/freight/charges?lrns={{lrn}}`],
  [
    'Create Warehouse',
    'POST',
    `${base}/warehouses`,
    {
      pin_code: '400059',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      address_details: {
        address: 'Test address',
        contact_person: 'Test User',
        phone_number: '9999999999',
      },
      name: '{{warehouseName}}',
    },
    true,
  ],
  [
    'Update Warehouse',
    'PATCH',
    `${base}/warehouses`,
    {
      cl_warehouse_name: '{{warehouseName}}',
      update_dict: {
        address_details: {
          address: 'Updated test address',
          contact_person: 'Test User',
          phone_number: '9999999999',
        },
      },
    },
    true,
  ],
  [
    'Create Shipment',
    'POST',
    `${base}/shipments`,
    {
      pickup_location_name: '{{warehouseName}}',
      payment_mode: 'prepaid',
      weight: 1000,
      dropoff_location: {
        consignee_name: 'Test Consignee',
        address: 'Test address',
        city: 'Gurugram',
        state: 'Haryana',
        zip: '122001',
        phone: '9999999999',
      },
      invoices: [{ inv_num: 'POSTMAN-{{$timestamp}}', inv_amt: 123 }],
      shipment_details: [
        {
          order_id: 'RGX-{{$timestamp}}',
          box_count: 1,
          description: 'Test shipment',
          weight: 1000,
          waybills: [],
          master: false,
        },
      ],
      rov_insurance: false,
      freight_mode: 'fop',
      fm_pickup: true,
    },
    true,
  ],
  [
    'Shipment Creation Status',
    'GET',
    `${base}/shipments/status?job_id={{jobId}}`,
  ],
  [
    'Update Shipment',
    'PUT',
    `${base}/shipments/{{lrn}}`,
    { consignee_name: 'Updated Test Consignee', consignee_phone: '9999999999' },
    true,
  ],
  [
    'Shipment Update Status',
    'GET',
    `${base}/shipments/update/status?job_id={{jobId}}`,
  ],
  ['Cancel Shipment', 'DELETE', `${base}/shipments/{{lrn}}`, undefined, true],
  [
    'Track Shipment',
    'GET',
    `${base}/shipments/track?lrnum={{lrn}}&all_wbns=false`,
  ],
  [
    'Book Appointment',
    'POST',
    `${base}/appointments`,
    {
      lrn: '{{lrn}}',
      date: '{{appointmentDate}}',
      appointment_slot: '12:00 PM-03:00 PM',
      po_number: ['NotApplicable'],
      appointment_id: '',
      po_expiry_date: '{{appointmentDate}}',
    },
    true,
  ],
  [
    'Create Pickup',
    'POST',
    `${base}/pickups`,
    {
      client_warehouse: '{{warehouseName}}',
      pickup_date: '{{pickupDate}}',
      start_time: '13:00:00',
      expected_package_count: 1,
    },
    true,
  ],
  ['Cancel Pickup', 'DELETE', `${base}/pickups/{{pickupId}}`, undefined, true],
  ['Generate Shipping Label URL', 'GET', `${base}/labels/std/{{lrn}}`],
  ['LR Copy', 'GET', `${base}/lr-copy/{{lrn}}`],
  [
    'Generate Shipping Labels',
    'POST',
    `${base}/documents/generate/shipping_label`,
    {
      lrns: ['{{lrn}}'],
      size: 'a4',
      callback: {
        uri: '{{callbackUrl}}',
        method: 'POST',
        authorization: 'Bearer {{callbackToken}}',
      },
    },
    true,
  ],
  [
    'Generate LR Copies',
    'POST',
    `${base}/documents/generate/lr_copy`,
    {
      lrns: ['{{lrn}}'],
      callback: {
        uri: '{{callbackUrl}}',
        method: 'POST',
        authorization: 'Bearer {{callbackToken}}',
      },
    },
    true,
  ],
  [
    'Generated Document Status',
    'GET',
    `${base}/documents/generate/shipping_label/status/{{jobId}}`,
  ],
  [
    'Download POD',
    'GET',
    `${base}/documents/download?lrn={{lrn}}&doc_type=LM_POD&auto_download=false&version=latest`,
  ],
];

const collection = {
  info: {
    name: 'Raghav Express - Delhivery B2B',
    description:
      'Protected application API covering the Delhivery B2B/LTL lifecycle. Set allowMutations=true only with disposable sandbox data.',
    schema:
      'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000' },
    { key: 'internalApiKey', value: '' },
    { key: 'delhiveryUsername', value: '' },
    { key: 'delhiveryPassword', value: '' },
    { key: 'warehouseName', value: 'Raghav Test Warehouse' },
    { key: 'lrn', value: '220110457' },
    { key: 'jobId', value: 'test-job-id' },
    { key: 'pickupId', value: 'test-pickup-id' },
    { key: 'pickupDate', value: '2026-09-18' },
    { key: 'appointmentDate', value: '18/09/2026' },
    { key: 'callbackUrl', value: 'https://example.com/delhivery/callback' },
    { key: 'callbackToken', value: 'test-callback-token' },
    { key: 'allowMutations', value: 'false' },
  ],
  item: requests.map(([name, method, raw, body, destructive = false]) => ({
    name,
    event: [
      ...(destructive
        ? [
            {
              listen: 'prerequest',
              script: {
                exec: [
                  "if (pm.variables.get('allowMutations') !== 'true' && pm.collectionVariables.get('allowMutations') !== 'true') { throw new Error('Set allowMutations=true to run this state-changing request'); }",
                ],
              },
            },
          ]
        : []),
      {
        listen: 'test',
        script: {
          exec: [
            "pm.test('HTTP status is successful', () => pm.expect(pm.response.code).to.be.within(200, 299));",
            "pm.test('Proxy reports success', () => pm.expect(pm.response.json().success).to.eql(true));",
          ],
        },
      },
    ],
    request: {
      method,
      header: [
        { key: 'Authorization', value: 'Bearer {{internalApiKey}}' },
        ...(body ? [{ key: 'Content-Type', value: 'application/json' }] : []),
      ],
      url: raw,
      ...(body
        ? {
            body: {
              mode: 'raw',
              raw: JSON.stringify(body, null, 2),
              options: { raw: { language: 'json' } },
            },
          }
        : {}),
    },
  })),
};

await mkdir('postman', { recursive: true });
await writeFile(
  'postman/raghav-express-delhivery-b2b.postman_collection.json',
  `${JSON.stringify(collection, null, 2)}\n`,
);
