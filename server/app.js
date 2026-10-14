'use strict';

/**
 * Máy chủ HTTP Node của ứng dụng:
 *  - phục vụ file tĩnh theo danh sách cho phép (index.html, css/, js/, data/) – không bao giờ trả .env hay mã server;
 *  - API chấm Writing (server/writing-api.js).
 * Khoá AI chỉ nằm ở server; trình duyệt chỉ gửi mã đề + bài viết.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { createWritingApi, HttpError, MAX_BODY_BYTES, SECURITY_HEADERS } = require('./writing-api');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_PREFIXES = ['/css/', '/js/', '/data/'];
const PUBLIC_FILES = ['/index.html', '/favicon.ico'];
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

function readBody(req) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let size = 0;
        let tooLarge = false;
        req.on('data', chunk => {
            if (tooLarge) return;
            size += chunk.length;
            if (size > MAX_BODY_BYTES) {
                tooLarge = true;
                chunks.length = 0;
                reject(new HttpError(413, 'too_large', 'Dữ liệu gửi lên quá lớn.', { Connection: 'close' }));
                return;
            }
            chunks.push(chunk);
        });
        req.on('end', () => {
            if (!tooLarge) resolve(Buffer.concat(chunks).toString('utf8'));
        });
        req.on('error', reject);
    });
}

function clientIp(req, trustProxy) {
    if (trustProxy) {
        const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
        if (fwd) return fwd;
    }
    return req.socket.remoteAddress || 'unknown';
}

function createApp({ config, tasks, fetchImpl = globalThis.fetch, log = console, now = Date.now, root = ROOT }) {
    const api = createWritingApi({ config, tasks, fetchImpl, log, now });

    function serveStatic(req, res, pathname) {
        const notFound = () => {
            res.writeHead(404, { ...SECURITY_HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
            res.end('Not found');
        };
        if (req.method !== 'GET' && req.method !== 'HEAD') {
            res.writeHead(405, { ...SECURITY_HEADERS, Allow: 'GET, HEAD' });
            return res.end();
        }
        if (pathname === '/') pathname = '/index.html';
        const allowed = PUBLIC_FILES.includes(pathname) || PUBLIC_PREFIXES.some(p => pathname.startsWith(p));
        const hidden = pathname.split('/').some(seg => seg.startsWith('.'));
        const ext = path.extname(pathname).toLowerCase();
        if (!allowed || hidden || !MIME[ext] || /[\\\0]/.test(pathname)) return notFound();
        const file = path.join(root, pathname);
        const rel = path.relative(root, file).split(path.sep).join('/');
        const inside = PUBLIC_FILES.includes(`/${rel}`) || PUBLIC_PREFIXES.some(p => `/${rel}`.startsWith(p));
        if (!file.startsWith(root + path.sep) || !inside) return notFound();
        fs.readFile(file, (err, data) => {
            if (err) return notFound();
            res.writeHead(200, {
                ...SECURITY_HEADERS,
                'Cross-Origin-Resource-Policy': 'same-origin',
                'Content-Type': MIME[ext],
                'Cache-Control': 'no-cache',
            });
            res.end(req.method === 'HEAD' ? undefined : data);
        });
    }

    return http.createServer(async (req, res) => {
        let pathname;
        try {
            pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
        } catch (e) {
            res.writeHead(400, SECURITY_HEADERS).end('Bad request');
            return;
        }
        if (!pathname.startsWith('/api/')) return serveStatic(req, res, pathname);
        const out = await api.handle({
            method: req.method,
            pathname,
            headers: req.headers,
            readBody: () => readBody(req),
            clientIp: clientIp(req, config.trustProxy),
        });
        if (res.headersSent) return;
        res.writeHead(out.status, out.headers);
        res.end(out.body);
    });
}

module.exports = { createApp, ROOT };
