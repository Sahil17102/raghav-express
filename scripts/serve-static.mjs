import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import http from 'node:http';
import { extname, join, normalize } from 'node:path';

const CANONICAL_HOST = 'raghav-express.onrender.com';
const LEGACY_HOST = 'raghav-express-web.onrender.com';
const port = Number(process.env.PORT || 10000);
const root = join(process.cwd(), 'dist');

const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

function safePath(pathname) {
  const decoded = decodeURIComponent(pathname);
  const candidate = normalize(join(root, decoded));
  return candidate.startsWith(root) ? candidate : null;
}

async function existingFile(pathname) {
  const base = safePath(pathname);
  if (!base) return null;

  const candidates = pathname.endsWith('/')
    ? [join(base, 'index.html')]
    : [base, join(base, 'index.html')];

  for (const file of candidates) {
    try {
      const info = await stat(file);
      if (info.isFile()) return file;
    } catch {
      // Try the next candidate.
    }
  }

  return null;
}

const server = http.createServer(async (request, response) => {
  const host = request.headers.host?.split(':')[0];
  const requestUrl = new URL(request.url || '/', `https://${CANONICAL_HOST}`);

  if (host === LEGACY_HOST) {
    response.writeHead(308, {
      Location: `https://${CANONICAL_HOST}${requestUrl.pathname}${requestUrl.search}`,
      'Cache-Control': 'no-store, max-age=0',
    });
    response.end();
    return;
  }

  const file =
    (await existingFile(requestUrl.pathname)) || (await existingFile('/'));

  if (!file) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
    return;
  }

  response.writeHead(200, {
    'Content-Type': contentTypes[extname(file)] || 'application/octet-stream',
  });
  createReadStream(file).pipe(response);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Raghav Express static site listening on ${port}`);
});
