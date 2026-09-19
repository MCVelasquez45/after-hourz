#!/usr/bin/env node
/*
  Minimal, zero-dependency, FOREGROUND static server for dist/ (used by Playwright's webServer).
  Astro 7's `astro preview` daemonizes and returns immediately, which Playwright reads as
  "server exited early". This stays in the foreground so Playwright can wait on it reliably.
*/
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';

const ROOT = new URL('../dist/', import.meta.url).pathname;
const PORT = Number(process.env.PORT ?? 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
};

async function resolveFile(pathname) {
  // Prevent path traversal.
  let rel = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  let filePath = join(ROOT, rel);
  try {
    const s = await stat(filePath);
    if (s.isDirectory()) filePath = join(filePath, 'index.html');
  } catch {
    // Try directory-style route: /design-lab -> /design-lab/index.html
    filePath = join(ROOT, rel, 'index.html');
  }
  return filePath;
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
    const filePath = await resolveFile(url.pathname);
    const body = await readFile(filePath);
    res.writeHead(200, { 'content-type': TYPES[extname(filePath)] ?? 'application/octet-stream' });
    res.end(body);
  } catch {
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    res.end('<!doctype html><title>404</title><h1>404 — not found</h1>');
  }
});

server.listen(PORT, () => {
  console.log(`serve-dist: http://localhost:${PORT}/ (root: ${ROOT})`);
});
