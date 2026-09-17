import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

const received = [];
const upstreamServer = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    received.push({
      method: req.method,
      url: req.url,
      authorization: req.headers.authorization,
      contentType: req.headers['content-type'],
      body: Buffer.concat(chunks).toString(),
    });
    res.writeHead(200, { 'content-type': 'application/json' });
    if (req.url === '/ums/login')
      res.end(JSON.stringify({ token: 'mock-jwt' }));
    else if (req.url?.startsWith('/manifest') && req.method === 'POST')
      res.end(JSON.stringify({ job_id: 'test-job-id' }));
    else res.end(JSON.stringify({ ok: true, path: req.url }));
  });
});
await new Promise((resolve, reject) => {
  upstreamServer.once('error', reject);
  upstreamServer.listen(0, '127.0.0.1', resolve);
});

let appServer;
try {
  process.env.DELHIVERY_B2B_API_BASE = `http://127.0.0.1:${upstreamServer.address().port}`;
  process.env.DELHIVERY_B2B_USERNAME = 'mock-user';
  process.env.DELHIVERY_B2B_PASSWORD = 'mock-password';
  delete process.env.DELHIVERY_B2B_TOKEN;
  process.env.RAGHAV_INTERNAL_API_KEY = 'test-internal-key';
  const worker = (await import('../dist/server/index.js')).default;
  appServer = http.createServer(async (req, res) => {
    const chunks = [];
    for await (const chunk of req) chunks.push(chunk);
    const request = new Request(`http://127.0.0.1${req.url}`, {
      method: req.method,
      headers: req.headers,
      ...(['GET', 'HEAD'].includes(req.method)
        ? {}
        : { body: Buffer.concat(chunks) }),
    });
    const response = await worker.fetch(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  });
  await new Promise((resolve, reject) => {
    appServer.once('error', reject);
    appServer.listen(0, '127.0.0.1', resolve);
  });
  const newman = path.resolve('node_modules/newman/bin/newman.js');
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        newman,
        'run',
        'postman/raghav-express-delhivery-b2b.postman_collection.json',
        '--env-var',
        `baseUrl=http://127.0.0.1:${appServer.address().port}`,
        '--env-var',
        'internalApiKey=test-internal-key',
        '--env-var',
        'delhiveryUsername=mock-user',
        '--env-var',
        'delhiveryPassword=mock-password',
        '--env-var',
        'allowMutations=true',
        '--reporters',
        'cli',
        '--color',
        'off',
        '--disable-unicode',
      ],
      { stdio: 'inherit' },
    );
    child.once('error', reject);
    child.once('exit', (code) => resolve(code ?? 1));
  });
  assert.equal(exitCode, 0, 'Postman/Newman collection failed');
  assert.equal(
    received.filter((item) => item.url === '/ums/login').length,
    2,
    'Explicit login plus one automatic login after logout were expected',
  );
  assert.ok(
    received.some(
      (item) =>
        item.url === '/manifest' &&
        item.contentType?.startsWith('multipart/form-data; boundary='),
    ),
    'Shipment creation must use multipart form data',
  );
  assert.ok(
    received
      .filter(
        (item) => item.url !== '/forgot-password' && item.url !== '/ums/login',
      )
      .every((item) => item.authorization === 'Bearer mock-jwt'),
    'Authenticated requests must use the Delhivery JWT',
  );
  console.log(
    `Delhivery B2B contract and Postman checks passed (${received.length} upstream requests).`,
  );
} finally {
  if (appServer) await new Promise((resolve) => appServer.close(resolve));
  await new Promise((resolve) => upstreamServer.close(resolve));
}
