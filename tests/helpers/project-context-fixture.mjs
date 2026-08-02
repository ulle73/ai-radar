import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

export async function writeCanonicalProjectCatalog(root) {
  const sourceUrl = new URL('../../projects/catalog.json', import.meta.url);
  const catalog = JSON.parse(await readFile(sourceUrl, 'utf8'));
  const targetPath = path.join(root, 'projects/catalog.json');
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
}
