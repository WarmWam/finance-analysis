// Build step: compile JSX + bundle React at build time (no in-browser Babel).
// Each source file is wrapped in an IIFE so it keeps the original global-scope
// architecture (the app code uses the global `React`). Output is content-hashed
// into dist/assets for immutable CDN caching. Mirrors the pm25-chiangmai pipeline.

import esbuild from 'esbuild';
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'fs';
import { createHash } from 'crypto';

const hash8 = (s) => createHash('sha256').update(s).digest('hex').slice(0, 8);

rmSync('dist', { recursive: true, force: true });
mkdirSync('dist/assets', { recursive: true });

// 1. Bundle React + ReactDOM and expose them as globals.
const reactBuild = await esbuild.build({
  stdin: {
    contents: `
      import * as React from 'react';
      import * as ReactDOM from 'react-dom';
      import { createRoot, hydrateRoot } from 'react-dom/client';
      window.React = React.default ?? React;
      window.ReactDOM = Object.assign({}, ReactDOM, { createRoot, hydrateRoot });
    `,
    resolveDir: process.cwd(),
    loader: 'js',
  },
  bundle: true,
  write: false,
  format: 'iife',
  minify: true,
  define: { 'process.env.NODE_ENV': '"production"' },
});
const reactJs = reactBuild.outputFiles[0].text;

// 2. Transform each app source in its original load order, wrapping in an IIFE.
//    mock-data.js is bundled only when present (Phase 1 demo data).
const order = [
  'config.js',
  'constants.js',
  'helpers.jsx',
  'charts.jsx',
  'components.jsx',
  'mock-data.js',
  'app.jsx',
].filter(existsSync);

let appJs = '';
for (const file of order) {
  const src = readFileSync(file, 'utf8');
  const loader = file.endsWith('.jsx') ? 'jsx' : 'js';
  const out = await esbuild.transform(src, {
    loader,
    jsx: 'transform', // classic runtime -> React.createElement (uses global React)
    minify: true,
  });
  appJs += `(function(){\n${out.code}\n})();\n`;
}

const bundle = reactJs + '\n' + appJs;
const jsName = `app.${hash8(bundle)}.js`;
writeFileSync(`dist/assets/${jsName}`, bundle);

// 3. Styles (hashed).
const css = readFileSync('styles.css', 'utf8');
const cssName = `styles.${hash8(css)}.css`;
writeFileSync(`dist/assets/${cssName}`, css);

// 4. Generate index.html: swap stylesheet, drop the dev <script> tags, load the
//    single hashed bundle. Everything between the marker and </body> is replaced.
let html = readFileSync('index.html', 'utf8');
html = html.replace('href="styles.css"', `href="assets/${cssName}"`);

const start = html.indexOf('<!-- app scripts -->');
const end = html.indexOf('</body>');
if (start === -1 || end === -1) {
  throw new Error('index.html structure changed: could not find script block markers');
}
html = html.slice(0, start) + `<script src="assets/${jsName}"></script>\n` + html.slice(end);
writeFileSync('dist/index.html', html);

console.log('Built dist/');
console.log('  assets/' + jsName + '  (' + (bundle.length / 1024).toFixed(1) + ' KB)');
console.log('  assets/' + cssName + '  (' + (css.length / 1024).toFixed(1) + ' KB)');
