import { mkdir, writeFile } from 'node:fs/promises';

const base = '{{baseUrl}}/api/india-post';
const requests = [
  [
    'Login',
    'POST',
    `${base}/auth/login`,
    { username: '{{indiaPostUsername}}', password: '{{indiaPostPassword}}' },
  ],
  ['Pincode Offices', 'GET', `${base}/offices?pincode=570001&limit=50`],
  [
    'Speed Post Tariff',
    'GET',
    `${base}/tariffs/speed-post?product-code=SP&weight=250&source-pincode=400001&destination-pincode=110001&length=30&width=21&height=1&INS=1000&POD=YES`,
  ],
  [
    'Business Parcel Tariff',
    'GET',
    `${base}/tariffs/business-parcel?product-code=BP&weight=550&source-pincode=141010&destination-pincode=110057&length=14&width=9&height=2&ins=1000`,
  ],
  [
    '24 Speed Post Document Tariff',
    'GET',
    `${base}/tariffs/ddd-ndd?product-code=24_SPEEDPOST_DOC&weight=100&source-pincode=110001&destination-pincode=400001&source-office-id=15360005&destination-office-id=24350001&ins=1000&REG=FALSE&OTP=FALSE&ACK=FALSE`,
  ],
  [
    '24 Speed Post Parcel Tariff',
    'GET',
    `${base}/tariffs/parspl?product-code=24_SPP_PARSPL&weight=1000&source-pincode=600001&destination-pincode=560001&source-office-id=29350001&destination-office-id=21840011&length=14&width=14&height=28&ins=1000&REG=FALSE&OTP=FALSE&ACK=FALSE&COD=TRUE&CODVALUE=1000`,
  ],
  [
    '48 Speed Post Document Tariff',
    'GET',
    `${base}/tariffs/ddd-ndd?product-code=48_SPEEDPOST_DOC&weight=350&source-pincode=110001&destination-pincode=400001&source-office-id=15360005&destination-office-id=24350001&ins=1000&REG=FALSE&OTP=FALSE&ACK=FALSE`,
  ],
  [
    'Book Articles',
    'POST',
    `${base}/bookings`,
    {
      customer_id: '{{customerId}}',
      articles: [
        {
          bulk_customer_id: '{{customerId}}',
          contract_id: '{{contractId}}',
          barcode_no: '{{barcode}}',
          pickup_or_dropoff: 'DROPOFF',
          pickup_dropoff_office_id: 21260024,
          article_type: 'SP_INLAND_DOC',
          physical_weight: 15,
          shape_of_article: 'DOC',
          length: 10,
          breadth_diameter: 10,
          height: 1,
          sender_name: 'Raghav Enterprises',
          sender_company: 'Raghav Enterprises',
          sender_add_line_1: 'Test sender address',
          sender_city: 'Jaipur',
          sender_pincode: 302013,
          sender_mobile_no: 9660423241,
          receiver_name: 'Test Receiver',
          receiver_company: 'Test Company',
          receiver_add_line_1: 'Test receiver address',
          receiver_city: 'Mysuru',
          receiver_pincode: 570001,
          receiver_mobile_no: 9999999999,
          alt_address_flag: false,
          pickup_address_flag: false,
        },
      ],
    },
    true,
  ],
  [
    'Create Address Label',
    'POST',
    `${base}/labels`,
    [
      {
        customer_id: '{{customerId}}',
        channel_type: 'E',
        user_type: 'R',
        barcode_no: '{{barcode}}',
        service_type: 'Speed Post',
        booking_type: 'COMMERCIAL',
        recipient_name: 'Test Receiver',
        recipient_addressl1: 'Test address',
        sender_name: 'Raghav Enterprises',
        transmission_mode: 'S',
        payment_mode: 'contract',
        booking_office_name: 'Test Office',
        booking_office_pin: '302013',
        size: 'A6',
        payment_status: 'PC',
        identifier: 'Domestic',
      },
    ],
  ],
  [
    'Download Events',
    'POST',
    `${base}/events`,
    { Cust_Id: '0000000000', Event_Code: 'LE', Event_Date: '01032026' },
  ],
  [
    'Bulk Tracking',
    'POST',
    `${base}/tracking`,
    { bulk: ['RK775227016IN', 'RK440375064IN'] },
  ],
];

const collection = {
  info: {
    name: 'Raghav Express - India Post UAT',
    description:
      'India Post external-customer UAT APIs. Booking is disabled unless allowBookings=true.',
    schema:
      'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
  },
  variable: [
    { key: 'baseUrl', value: 'http://localhost:3000' },
    { key: 'internalApiKey', value: '' },
    { key: 'indiaPostUsername', value: '' },
    { key: 'indiaPostPassword', value: '' },
    { key: 'customerId', value: '3000064781' },
    { key: 'contractId', value: '41585456' },
    { key: 'barcode', value: 'ET21433001XIN' },
    { key: 'allowBookings', value: 'false' },
  ],
  item: requests.map(([name, method, raw, body, booking = false]) => ({
    name,
    event: [
      ...(booking
        ? [
            {
              listen: 'prerequest',
              script: {
                exec: [
                  "if (pm.variables.get('allowBookings') !== 'true' && pm.collectionVariables.get('allowBookings') !== 'true') { throw new Error('Set allowBookings=true only with an unused UAT barcode'); }",
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
  'postman/raghav-express-india-post-uat.postman_collection.json',
  `${JSON.stringify(collection, null, 2)}\n`,
);
