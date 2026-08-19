import { cpSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const standalone = join(root, '.next', 'standalone');

if (!existsSync(standalone)) {
  console.error('.next/standalone not found — run `next build` first');
  process.exit(1);
}

cpSync(join(root, '.next', 'static'), join(standalone, '.next', 'static'), { recursive: true });
if (existsSync(join(root, 'public'))) {
  cpSync(join(root, 'public'), join(standalone, 'public'), { recursive: true });
}

console.log('Copied .next/static and public into .next/standalone');