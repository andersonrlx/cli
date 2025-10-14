import fs from 'fs-extra';
import path from 'node:path';

export async function walkDir(dir) {
  const list = [];
  const items = await fs.readdir(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = await fs.lstat(full);
    if (stat.isDirectory()) {
      list.push(...await walkDir(full));
    } else {
      list.push(full);
    }
  }
  return list;
}

export async function ensureCleanDir(dir) {
  await fs.ensureDir(dir);
  // Para evitar apagar conteúdo antigo automaticamente, não limpamos aqui.
  // Se quiser esvaziar sempre, descomente:
  // await fs.emptyDir(dir);
}
