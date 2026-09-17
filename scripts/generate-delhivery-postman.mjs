import { mkdir, writeFile } from 'node:fs/promises';

const base = '{{baseUrl}}/api/delhivery/b2c';
const requests = [
  ['Pincode Serviceability', 'GET', `${base}/serviceability/194103`],
  ['Heavy Serviceability', 'GET', `${base}/heavy-serviceability/400086`],
  ['Expected TAT', 'GET', `${base}/tat?origin_pin=122003&destination_pin=136118&mot=S&pdt=B2C`],
  ['Bulk Waybills', 'GET', `${base}/waybills?count=5`],
  ['Single Waybill', 'GET', `${base}/waybill`],
  ['Shipment Tracking', 'GET', `${base}/shipments/track?waybill={{waybill}}`],
  ['Shipping Cost', 'GET', `${base}/shipping-cost?md=S&cgm=500&o_pin=342001&d_pin=110042&ss=Delivered&pt=Pre-paid`],
  ['Shipping Label', 'GET', `${base}/shipments/label?waybill={{waybill}}&pdf=true&pdf_size=4R`],
  ['Download Document', 'GET', `${base}/documents/download?doc_type=EPOD&waybill={{waybill}}`],
  ['NDR Status', 'GET', `${base}/ndr/{{uplId}}/status?verbose=true`],
  ['Pickup Request', 'POST', `${base}/pickup-requests`, { pickup_time: '11:00:00', pickup_date: '2026-09-18', pickup_location: '{{pickupLocation}}', expected_package_count: 1 }],
  ['Create Warehouse', 'POST', `${base}/warehouses`, { name: '{{pickupLocation}}', phone: '9999999999', pin: '342001', address: 'Test address', return_address: 'Test address' }],
  ['Update Warehouse', 'POST', `${base}/warehouses/update`, { name: '{{pickupLocation}}', phone: '9999999999' }],
  ['Create Shipment', 'POST', `${base}/shipments`, { shipments: [{ order: 'RGX-POSTMAN-{{$timestamp}}', name: 'Test Customer', phone: '9999999999', add: 'Test address', pin: '194103', payment_mode: 'Prepaid', products_desc: 'Test product', total_amount: 100, weight: 500 }] }],
  ['Create MPS Shipment', 'POST', `${base}/shipments/mps`, { shipments: [{ order: 'RGX-MPS-{{$timestamp}}', name: 'Test Customer', phone: '9999999999', add: 'Test address', pin: '194103', payment_mode: 'Prepaid', waybill: '{{waybill}}', master_id: '{{waybill}}', mps_children: 1, mps_amount: 0 }] }],
  ['Create RVP QC Shipment', 'POST', `${base}/shipments/rvp-qc`, { shipments: [{ order: 'RGX-RVP-{{$timestamp}}', name: 'Test Customer', phone: '9999999999', add: 'Test address', pin: '194103', payment_mode: 'Pickup', custom_qc: [{ description: 'Test item', images: ['https://example.com/item.jpg'], quantity: 1, questions: [{ questions_id: 'Q1', options: ['Yes'], value: ['Yes'], required: true, type: 'multi' }] }] }] }],
  ['Edit Shipment', 'POST', `${base}/shipments/edit`, { waybill: '{{waybill}}', name: 'Updated Customer' }],
  ['Cancel Shipment', 'POST', `${base}/shipments/cancel`, { waybill: '{{waybill}}' }],
  ['Submit NDR Action', 'POST', `${base}/ndr/actions`, { data: [{ waybill: '{{waybill}}', act: 'RE-ATTEMPT' }] }],
  ['Update Ewaybill', 'PUT', `${base}/shipments/{{waybill}}/ewaybill`, { data: [{ dcn: 'INV-1', ewbn: '123456789012' }] }],
];

const mutationNames = new Set(requests.filter(([, method]) => method !== 'GET').map(([name]) => name));
const collection = {
  info: { name: 'Raghav Express - Delhivery B2C', schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json' },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000' }, { key: 'internalApiKey', value: '' },
    { key: 'waybill', value: '1234567890123' }, { key: 'uplId', value: 'UPL0000000001' },
    { key: 'pickupLocation', value: 'Raghav Test Warehouse' }, { key: 'allowMutations', value: 'false' },
  ],
  item: requests.map(([name, method, raw, body]) => ({
    name,
    event: [
      ...(mutationNames.has(name) ? [{ listen: 'prerequest', script: { exec: ["if (pm.variables.get('allowMutations') !== 'true' && pm.collectionVariables.get('allowMutations') !== 'true') { postman.setNextRequest(null); }"] } }] : []),
      { listen: 'test', script: { exec: ["pm.test('HTTP status is successful', () => pm.expect(pm.response.code).to.be.within(200, 299));", "pm.test('Proxy reports success', () => pm.expect(pm.response.json().success).to.eql(true));"] } },
    ],
    request: {
      method,
      header: [
        { key: 'Authorization', value: 'Bearer {{internalApiKey}}', type: 'text' },
        ...(body ? [{ key: 'Content-Type', value: 'application/json', type: 'text' }] : []),
      ],
      url: raw,
      ...(body ? { body: { mode: 'raw', raw: JSON.stringify(body, null, 2), options: { raw: { language: 'json' } } } } : {}),
    },
  })),
};

await mkdir('postman', { recursive: true });
await writeFile('postman/raghav-express-delhivery-b2c.postman_collection.json', `${JSON.stringify(collection, null, 2)}\n`);
