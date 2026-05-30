// Dev-only verification server: serves the built dist/ with SPA fallback so
// client-side routes (/company/NVDA, /admin) resolve to index.html. Once the
// Supabase + api/ functions are live you can proxy /api/* to the deployment.
import { createServer } from 'http';
import { readFile } from 'fs/promises';
import { extname, join, normalize, dirname } from 'path';
import { fileURLToPath } from 'url';

const PORT = 3200;
// Resolve dist/ relative to this script so it works regardless of cwd.
const DIST = join(dirname(fileURLToPath(import.meta.url)), 'dist');
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml' };

createServer(async (req, res) => {
  let path = decodeURIComponent(req.url.split('?')[0]);
  if (path === '/') path = '/index.html';
  const file = normalize(join(DIST, path));
  if (!file.startsWith(DIST)) { res.writeHead(403); return res.end('forbidden'); }
  try {
    const data = await readFile(file);
    res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' });
    res.end(data);
  } catch {
    // SPA fallback: unknown non-asset path -> index.html
    try {
      const html = await readFile(join(DIST, 'index.html'));
      res.writeHead(200, { 'content-type': 'text/html' });
      res.end(html);
    } catch {
      res.writeHead(404); res.end('not found');
    }
  }
}).listen(PORT, () => console.log(`preview server on http://localhost:${PORT}`));
