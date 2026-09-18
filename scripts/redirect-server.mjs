import http from 'node:http';

const CANONICAL_ORIGIN = 'https://raghav-express.onrender.com';
const port = Number(process.env.PORT || 10000);

const server = http.createServer((request, response) => {
  const requestUrl = new URL(request.url || '/', CANONICAL_ORIGIN);
  const location = `${CANONICAL_ORIGIN}${requestUrl.pathname}${requestUrl.search}`;

  response.writeHead(308, {
    Location: location,
    'Cache-Control': 'no-store, max-age=0',
    'Content-Type': 'text/plain; charset=utf-8',
  });
  response.end(`Redirecting to ${location}\n`);
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Redirecting all traffic to ${CANONICAL_ORIGIN} on port ${port}`);
});
