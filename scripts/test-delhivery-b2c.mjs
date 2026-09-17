import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

const requests = [];
const upstream = http.createServer((request, response) => {
  let body = '';
  request.on('data', (chunk) => { body += chunk; });
  request.on('end', () => {
    requests.push({ method: request.method, url: request.url, authorization: request.headers.authorization, body });
    response.writeHead(200, { 'content-type': 'application/json' });
    if (request.url.startsWith('/c/api/pin-codes/json/')) {
      response.end(JSON.stringify({ delivery_codes: [{ postal_code: { pin: 194103, remarks: '' } }] }));
    } else if (request.url.startsWith('/api/cmu/create.json')) {
      response.end(JSON.stringify({ success: true, packages: [{ waybill: 'MOCK-AWB-1' }] }));
    } else {
      response.end(JSON.stringify({ success: true }));
    }
  });
});

await new Promise((resolve, reject) => {
  upstream.once('error', reject);
  upstream.listen(0, '127.0.0.1', resolve);
});

try {
  const address = upstream.address();
  process.env.DELHIVERY_B2C_TOKEN = 'test-token';
  process.env.DELHIVERY_B2C_API_BASE = `http://127.0.0.1:${address.port}`;
  process.env.DELHIVERY_B2C_PICKUP_LOCATION = 'Raghav Test Warehouse';
  process.env.RAGHAV_INTERNAL_API_KEY = 'test-internal-key';
  const server = (await import('../dist/server/index.js')).default;

  const serviceability = await server.fetch(new Request('http://localhost/api/delhivery/b2c/serviceability/194103'));
  assert.equal(serviceability.status, 200);
  assert.equal((await serviceability.json()).serviceable, true);

  const shipment = await server.fetch(new Request('http://localhost/api/delhivery/b2c/shipments', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ shipments: [{ order: 'RGX-TEST-1', name: 'Test User', phone: '9999999999', add: 'Test Address', pin: '194103', payment_mode: 'Prepaid' }] }),
  }));
  assert.equal(shipment.status, 200);
  assert.equal((await shipment.json()).data.packages[0].waybill, 'MOCK-AWB-1');
  assert.equal(requests.length, 2);
  assert.equal(requests[0].authorization, 'Token test-token');
  const manifest = JSON.parse(new URLSearchParams(requests[1].body).get('data'));
  assert.equal(manifest.pickup_location.name, 'Raghav Test Warehouse');
  const app = http.createServer(async (nodeRequest, nodeResponse) => {
    const chunks = [];
    for await (const chunk of nodeRequest) chunks.push(chunk);
    const requestBody = Buffer.concat(chunks);
    const request = new Request(`http://127.0.0.1${nodeRequest.url}`, {
      method: nodeRequest.method,
      headers: nodeRequest.headers,
      ...(['GET', 'HEAD'].includes(nodeRequest.method) ? {} : { body: requestBody }),
    });
    const response = await server.fetch(request);
    nodeResponse.writeHead(response.status, Object.fromEntries(response.headers));
    nodeResponse.end(Buffer.from(await response.arrayBuffer()));
  });
  await new Promise((resolve, reject) => {
    app.once('error', reject);
    app.listen(0, '127.0.0.1', resolve);
  });
  try {
    const appAddress = app.address();
    const newman = path.resolve('node_modules/newman/bin/newman.js');
    const exitCode = await new Promise((resolve, reject) => {
      const child = spawn(process.execPath, [newman, 'run', 'postman/raghav-express-delhivery-b2c.postman_collection.json', '--env-var', `baseUrl=http://127.0.0.1:${appAddress.port}`, '--env-var', 'internalApiKey=test-internal-key', '--env-var', 'allowMutations=true', '--reporters', 'cli', '--color', 'off', '--disable-unicode'], { stdio: 'inherit' });
      child.once('error', reject);
      child.once('exit', (code) => resolve(code ?? 1));
    });
    assert.equal(exitCode, 0, 'Postman/Newman collection failed');
  } finally {
    await new Promise((resolve) => app.close(resolve));
  }
  console.log('Raghav Express Delhivery B2C proxy and Postman checks passed.');
} finally {
  await new Promise((resolve) => upstream.close(resolve));
}
