import { mkdir, rm, cp, readFile, writeFile } from 'node:fs/promises';
import { exec as _exec } from 'node:child_process';
import { promisify } from 'node:util';
const exec = promisify(_exec);

await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('css', 'dist/css', { recursive: true });
await cp('js', 'dist/js', { recursive: true });
for (const f of ['img', 'fonts', 'models', 'data']) {
  await cp(f, `dist/${f}`, { recursive: true });
}
for (const f of ['index.html', 'readme.md']) {
  await cp(f, `dist/${f}`);
}
await exec('npx cleancss -o dist/css/theme-modern.min.css css/theme-modern.css');
await exec('npx terser js/model-viewer.js -o dist/js/model-viewer.min.js -c -m');
const html = await readFile('dist/index.html', 'utf8');
await writeFile('dist/index.html', html.replace('css/theme-modern.css', 'css/theme-modern.min.css'));
await exec('npx html-minifier-terser --collapse-whitespace --remove-comments --minify-css true --minify-js true -o dist/index.html dist/index.html');
console.log('Build output written to dist/');
