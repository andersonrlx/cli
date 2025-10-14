import path from 'node:path';
import fs from 'fs-extra';
import ejs from 'ejs';
import simpleGit from 'simple-git';
import { walkDir, ensureCleanDir } from './utils.js';

const ROOT = path.resolve(process.cwd());
let TPL_DIR = path.join(ROOT, 'templates'); // default local

export async function useTemplateRepo(repoUrl, ref='main') {
  const dest = path.join(ROOT, '.tpl_repos', sanitizeRepo(repoUrl), ref);
  await fs.ensureDir(dest);
  if (await fs.pathExists(path.join(dest,'.git'))) {
    const git = simpleGit(dest);
    await git.fetch(['--all']);
    await git.checkout(ref);
    await git.pull('origin', ref);
  } else {
    const git = simpleGit();
    await git.clone(repoUrl, dest, ['--branch', ref, '--single-branch']);
  }
  TPL_DIR = path.join(dest, 'templates');
  return TPL_DIR;
}

function sanitizeRepo(url) {
  return url.replace(/[^\w.-]+/g,'_');
}

export async function listTemplates(type) {
  const base = path.join(TPL_DIR, type);
  if (!(await fs.pathExists(base))) return [];
  const dirs = await fs.readdir(base);
  return dirs.filter(d => fs.lstatSync(path.join(base,d)).isDirectory());
}

export async function loadTemplateSchema(type, template) {
  const schemaPath = path.join(TPL_DIR, type, template, 'template.json');
  if (await fs.pathExists(schemaPath)) {
    const raw = await fs.readFile(schemaPath, 'utf8');
    return JSON.parse(raw);
  }
  return null;
}

export async function generateFromTemplate({ type, template, variables, outdir }) {
  const src = path.join(TPL_DIR, type, template);
  const target = path.join(ROOT, outdir, type, variables.name);
  await ensureCleanDir(target);

  const files = await walkDir(src);
  for (const file of files) {
    if (file.endsWith('template.json')) continue; // não renderiza schema
    const rel = path.relative(src, file);
    const outPath = path.join(target, rel.replace(/\.ejs$/, ''));
    await fs.ensureDir(path.dirname(outPath));

    if (file.endsWith('.ejs')) {
      const tpl = await fs.readFile(file, 'utf8');
      const rendered = ejs.render(tpl, variables, { rmWhitespace: true });
      await fs.writeFile(outPath, rendered, 'utf8');
    } else {
      await fs.copy(file, outPath);
    }
  }
}
