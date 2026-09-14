import { cp, mkdir, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const projectRoot = process.cwd();
const outputRoot = join(projectRoot, 'dist');
const clientRoot = join(outputRoot, 'client');

const server = (await import('../dist/server/index.js')).default;

await mkdir(outputRoot, { recursive: true });
for (const entry of await readdir(clientRoot, { withFileTypes: true })) {
  await cp(join(clientRoot, entry.name), join(outputRoot, entry.name), {
    recursive: true,
    force: true,
  });
}

const staticRoutes = [
  { path: '/', file: 'index.html' },
  { path: '/login', file: 'login/index.html' },
  { path: '/client', file: 'client/index.html' },
];

for (const route of staticRoutes) {
  const response = await server.fetch(
    new Request(`https://raghav-express-client.onrender.com${route.path}`),
  );
  if (!response.ok) {
    throw new Error(`${route.path} static render failed with HTTP ${response.status}`);
  }
  const destination = join(outputRoot, route.file);
  await mkdir(join(destination, '..'), { recursive: true });
  await writeFile(destination, await response.text(), 'utf8');
}

console.log('Static routes generated: /, /login and /client');
