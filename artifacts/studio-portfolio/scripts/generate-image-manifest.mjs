import { existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const imagesRoot = join(root, 'public', 'images');
const outputPath = join(root, 'src', 'generated', 'imageManifest.ts');
const categories = ['weddings', 'events', 'products', 'sports', 'portraits', 'designs', 'editing'];
const supported = /\.(avif|gif|jpe?g|png|webp)$/i;

const manifest = Object.fromEntries(
  categories.map((slug) => {
    const folder = join(imagesRoot, slug);
    const files = existsSync(folder)
      ? readdirSync(folder, { withFileTypes: true })
          .filter((entry) => entry.isFile() && supported.test(entry.name) && entry.name.toLowerCase() !== 'cover.jpg')
          .map((entry) => `/images/${slug}/${entry.name}`)
          .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      : [];
    return [slug, files];
  }),
);

mkdirSync(join(root, 'src', 'generated'), { recursive: true });
writeFileSync(
  outputPath,
  `// Generated from public/images. Add image files to a category folder; no UI edits are needed.\nexport const IMAGE_MANIFEST: Record<string, string[]> = ${JSON.stringify(manifest, null, 2)};\n`,
);

const count = Object.values(manifest).reduce((total, files) => total + files.length, 0);
console.info(`Image manifest updated: ${count} image${count === 1 ? '' : 's'} detected.`);