import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
const root = resolve('.');
const types = { html: 'text/html; charset=utf-8', css: 'text/css', js: 'text/javascript', svg: 'image/svg+xml', xml: 'application/xml', txt: 'text/plain' };
http.createServer(async (req, res) => {
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { res.writeHead(400).end(); return; }
  if (pathname === '/') { res.writeHead(302, { Location: '/soloforge-tools/' }).end(); return; }
  if (!pathname.startsWith('/soloforge-tools/')) { res.writeHead(404).end(); return; }
  const relative = pathname.slice('/soloforge-tools/'.length);
  const target = resolve(root, relative + (pathname.endsWith('/') ? 'index.html' : ''));
  if (!target.startsWith(root + sep) || relative.split('/').some(p => p.startsWith('.'))) { res.writeHead(403).end(); return; }
  try { const data = await readFile(target); res.writeHead(200, { 'Content-Type': types[target.split('.').pop()] || 'application/octet-stream', 'Cache-Control': 'no-store' }).end(data); }
  catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }).end(await readFile('404.html')); }
}).listen(4173, '127.0.0.1', () => console.log('Local: http://127.0.0.1:4173/soloforge-tools/'));
