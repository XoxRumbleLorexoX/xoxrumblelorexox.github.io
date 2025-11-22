/**
 * Minimal JSON file-backed API for the shared visitor board.
 * Run: node tools/thoughts-server.js
 * Notes are stored in data/thoughts.json and served at /api/thoughts
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.THOUGHT_PORT || 4000;
const DATA_PATH = path.join(__dirname, '..', 'data', 'thoughts.json');
const ALLOWED_THEMES = new Set(['inspiration', 'build', 'research', 'collaboration']);
const MAX_ITEMS = 200;

function sendJson(res, status, payload) {
    res.writeHead(status, {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
    });
    res.end(JSON.stringify(payload));
}

function spamReason(entry) {
    const text = (entry.text || '').trim();
    const name = (entry.name || '').trim();
    if (text.length < 10) return 'Add a bit more context so others can follow.';
    if (text.length > 600) return 'Keep it under 600 characters.';
    if (/https?:\/\//i.test(text) || /\bwww\./i.test(text)) return 'Links are filtered out—share the idea without URLs.';
    if (/[A-Z]{10,}/.test(text)) return 'Too many shouty caps; soften it.';
    if (/(.)\1{7,}/.test(text)) return 'Repeated characters look spammy.';
    const promo = /(free money|buy now|click here|visit my profile|crypto pump|casino|loan|viagra|adult)/i;
    if (promo.test(text)) return 'Reads like promo language; try a constructive note.';
    if (name && (/\bhttp/i.test(name) || /@/.test(name))) return 'Name looks like a handle/link; please use a plain alias.';
    return null;
}

function readStore() {
    try {
        const raw = fs.readFileSync(DATA_PATH, 'utf8');
        const parsed = JSON.parse(raw);
        if (!parsed.items || !Array.isArray(parsed.items)) return { items: [] };
        return parsed;
    } catch (err) {
        return { items: [] };
    }
}

function writeStore(store) {
    const body = JSON.stringify(store, null, 2);
    fs.writeFileSync(DATA_PATH, body, 'utf8');
}

const server = http.createServer((req, res) => {
    const { method, url } = req;

    if (method === 'OPTIONS') {
        sendJson(res, 200, { ok: true });
        return;
    }

    if (url !== '/api/thoughts') {
        sendJson(res, 404, { error: 'Not found' });
        return;
    }

    if (method === 'GET') {
        const store = readStore();
        sendJson(res, 200, { items: store.items });
        return;
    }

    if (method === 'POST') {
        let body = '';
        req.on('data', (chunk) => {
            body += chunk.toString();
            if (body.length > 1e6) {
                req.socket.destroy();
            }
        });
        req.on('end', () => {
            let payload = {};
            try {
                payload = JSON.parse(body || '{}');
            } catch (err) {
                sendJson(res, 400, { error: 'Invalid JSON' });
                return;
            }
            const name = (payload.name || '').toString().trim().slice(0, 80);
            const text = (payload.text || '').toString().trim();
            const theme = ALLOWED_THEMES.has(payload.theme) ? payload.theme : 'inspiration';
            const reason = spamReason({ name, text });
            if (reason) {
                sendJson(res, 400, { error: reason });
                return;
            }

            const store = readStore();
            const item = {
                name,
                text: text.replace(/\s+/g, ' '),
                theme,
                ts: Date.now(),
            };
            store.items.push(item);
            if (store.items.length > MAX_ITEMS) {
                store.items = store.items.slice(-MAX_ITEMS);
            }
            writeStore(store);
            sendJson(res, 201, { ok: true, item });
        });
        return;
    }

    sendJson(res, 405, { error: 'Method not allowed' });
});

server.listen(PORT, () => {
    console.log(`Thoughts API listening on http://localhost:${PORT}/api/thoughts`);
});
