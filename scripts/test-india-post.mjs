import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import http from 'node:http';
import path from 'node:path';

const received = [];
const upstream = http.createServer((req, res) => {
  const chunks = [];
  req.on('data', (chunk) => chunks.push(chunk));
  req.on('end', () => {
    received.push({
      method: req.method,
      url: req.url,
      auth: req.headers.authorization,
      body: Buffer.concat(chunks).toString(),
    });
    if (req.url === '/beextcustomer/v1/access/login') {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(
        JSON.stringify({
          success: true,
          data: { access_token: 'mock-india-post-token', expires_in: 3600 },
        }),
      );
    }
    if (req.url === '/beextcustomer/v1/event/download') {
      res.writeHead(200, { 'content-type': 'application/xml' });
      return res.end(
        '<LatestEventDetails><ArticleDetails><ArticleNumber>MOCK1IN</ArticleNumber></ArticleDetails></LatestEventDetails>',
      );
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ success: true, path: req.url }));
  });
});
await new Promise((resolve, reject) => {
  upstream.once('error', reject);
  upstream.listen(0, '127.0.0.1', resolve);
});

let app;
try {
  process.env.INDIA_POST_API_BASE = `http://127.0.0.1:${upstream.address().port}`;
  process.env.INDIA_POST_USERNAME = 'test-user';
  process.env.INDIA_POST_PASSWORD = 'test-password';
  process.env.INDIA_POST_CUSTOMER_ID = '3000064781';
  process.env.RAGHAV_INTERNAL_API_KEY = 'test-internal-key';
  const worker = (await import('../dist/server/index.js')).default;
  app = http.createServer(async (req, res) => {
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
    app.once('error', reject);
    app.listen(0, '127.0.0.1', resolve);
  });
  const exitCode = await new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        path.resolve('node_modules/newman/bin/newman.js'),
        'run',
        'postman/raghav-express-india-post-uat.postman_collection.json',
        '--env-var',
        `baseUrl=http://127.0.0.1:${app.address().port}`,
        '--env-var',
        'internalApiKey=test-internal-key',
        '--env-var',
        'indiaPostUsername=test-user',
        '--env-var',
        'indiaPostPassword=test-password',
        '--env-var',
        'allowBookings=true',
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
  assert.equal(exitCode, 0, 'India Post Newman collection failed');
  assert.equal(
    received.filter((item) => item.url === '/beextcustomer/v1/access/login')
      .length,
    1,
    'Token should be cached after explicit login',
  );
  assert.ok(
    received
      .filter((item) => item.url !== '/beextcustomer/v1/access/login')
      .every((item) => item.auth === 'Bearer mock-india-post-token'),
  );
  assert.ok(
    received.some(
      (item) => item.url === '/beextcustomer/process-articles/3000064781',
    ),
  );
  console.log(
    `India Post proxy and Postman checks passed (${received.length} upstream requests).`,
  );
} finally {
  if (app) await new Promise((resolve) => app.close(resolve));
  await new Promise((resolve) => upstream.close(resolve));
}
