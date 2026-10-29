import { cp, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
await mkdir(output, { recursive: true });
for (const item of ['index.html', 'css', 'js', 'assets']) {
  await cp(path.join(root, item), path.join(output, item), { recursive: true });
}
console.log('Sitio estático preparado en dist/. Sin dependencias.');
