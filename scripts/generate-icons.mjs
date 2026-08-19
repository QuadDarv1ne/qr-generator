import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import sharp from 'sharp';

const root = resolve(import.meta.dirname, '..');
const svg = await readFile(join(root, 'public', 'favicon.svg'));
const outDir = join(root, 'public', 'icons');
mkdirSync(outDir, { recursive: true });

const plain = sharp(svg, { density: 96 });

await plain.resize(192, 192).png().toFile(join(outDir, 'icon-192.png'));
await plain.resize(512, 512).png().toFile(join(outDir, 'icon-512.png'));
await plain.resize(180, 180).png().toFile(join(outDir, 'apple-touch-icon.png'));

const qrContent = await plain.resize(410, 410).png().toBuffer();
await sharp({
  create: { width: 512, height: 512, channels: 4, background: '#1a1a1a' },
})
  .composite([{ input: qrContent, left: 51, top: 51 }])
  .png()
  .toFile(join(outDir, 'maskable-512.png'));

console.log('Icons generated in public/icons/');