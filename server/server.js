// Sweet Crumbs order server (training use only).
// Zero dependencies. Needs Node 18 or newer.  Start it with:  node server.js

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DELAY_MS = Number(process.env.DELAY_MS ?? 400); // artificial delay so loading indicators are visible
const TOKEN = 'sweetcrumbs-token';
const DATA_FILE = path.join(__dirname, 'orders.json');

const FLAVOURS = ['Chocolate', 'Vanilla', 'Red Velvet', 'Butterscotch'];
const TOWNS = ['Northfield', 'Southbay'];
const STATUSES = ['New', 'Baking', 'Out for Delivery', 'Delivered', 'Cancelled'];
const MIN_KG = 0.5;
const MAX_KG = 10;
const BIG_KG = 5;

// ---------- data ----------
function daysFromToday(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function seed() {
  const o = (id, accountName, flavour, sizeKg, days, deliveryTown, status, price) => ({
    id: String(id),
    orderNumber: 'SCO-' + String(id).padStart(4, '0'),
    accountName, flavour, sizeKg,
    deliveryDate: daysFromToday(days),
    deliveryTown, status, price,
    bigOrder: sizeKg >= BIG_KG,
    webReference: null,
  });
  return {
    nextId: 6,
    orders: [
      o(1, 'Hotel Bluebell', 'Chocolate', 2, 3, 'Northfield', 'New', 1800),
      o(2, 'Sunrise School', 'Red Velvet', 3.5, 5, 'Southbay', 'Baking', 2900),
      o(3, 'TechPark Cafe', 'Vanilla', 1, 2, 'Northfield', 'New', 950),
      o(4, 'Harbour Gym', 'Butterscotch', 6, 9, 'Southbay', 'New', 4200),
      o(5, 'Hotel Bluebell', 'Chocolate', 5, 1, 'Northfield', 'Out for Delivery', 3600),
    ],
  };
}

let db;
function load() {
  try {
    db = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch {
    db = seed();
    save();
  }
}
function save() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

// ---------- validation ----------
// Returns a list of { field, message }. An empty list means valid.
function validate(o, { isNew }) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });

  if (typeof o.accountName !== 'string' || !o.accountName.trim()) add('accountName', 'Customer is required.');
  if (!FLAVOURS.includes(o.flavour)) add('flavour', 'Flavour must be one of: ' + FLAVOURS.join(', ') + '.');
  if (typeof o.sizeKg !== 'number' || Number.isNaN(o.sizeKg) || o.sizeKg < MIN_KG || o.sizeKg > MAX_KG) {
    add('sizeKg', `Size must be between ${MIN_KG} and ${MAX_KG} kg.`);
  }
  if (typeof o.deliveryDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(o.deliveryDate) || Number.isNaN(Date.parse(o.deliveryDate))) {
    add('deliveryDate', 'Delivery date must look like 2026-11-20.');
  } else if (isNew && o.deliveryDate < daysFromToday(0)) {
    add('deliveryDate', "Delivery date can't be in the past.");
  }
  if (!TOWNS.includes(o.deliveryTown)) add('deliveryTown', 'Town must be one of: ' + TOWNS.join(', ') + '.');
  if (!STATUSES.includes(o.status)) add('status', 'Status must be one of: ' + STATUSES.join(', ') + '.');
  if (o.price != null && (typeof o.price !== 'number' || Number.isNaN(o.price) || o.price < 0)) {
    add('price', 'Price must be a number that is not negative.');
  }
  if (o.status === 'Delivered' && o.price == null) add('price', 'Add the price before marking an order Delivered.');
  return errors;
}

// Fields a client is allowed to send. id, orderNumber and bigOrder are set by the server.
function pick(body) {
  const out = {};
  for (const k of ['accountName', 'flavour', 'sizeKg', 'deliveryDate', 'deliveryTown', 'status', 'price', 'webReference']) {
    if (k in body) out[k] = body[k];
  }
  return out;
}

// ---------- http helpers ----------
function send(res, status, body) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  if (body === undefined) {
    res.writeHead(status, headers);
    return res.end();
  }
  res.writeHead(status, { ...headers, 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (c) => (raw += c));
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        const parsed = JSON.parse(raw);
        if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) return reject(new Error('shape'));
        resolve(parsed);
      } catch (e) {
        reject(e);
      }
    });
  });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------- routes ----------
async function handle(req, res) {
  const url = new URL(req.url, 'http://localhost');
  const parts = url.pathname.split('/').filter(Boolean); // ['api', 'orders', '3']
  const method = req.method;

  if (method === 'OPTIONS') return send(res, 204); // CORS preflight
  if (parts[0] !== 'api') return send(res, 404, { message: 'Not found. The API lives under /api.' });

  // Open endpoint: no token needed, useful as a connection check.
  if (parts[1] === 'health' && method === 'GET') return send(res, 200, { status: 'ok' });

  await sleep(DELAY_MS);

  if (req.headers.authorization !== 'Bearer ' + TOKEN) {
    return send(res, 401, { message: 'Missing or invalid token. Send the header Authorization: Bearer ' + TOKEN });
  }

  // GET /api/fail/:code  -> answers with that status, for testing your error handling
  if (parts[1] === 'fail' && parts[2]) {
    const code = Number(parts[2]);
    if (!Number.isInteger(code) || code < 400 || code > 599) return send(res, 400, { message: 'Use a code from 400 to 599.' });
    return send(res, code, { message: `Test error ${code} from the server.` });
  }

  // POST /api/reset  -> back to the five starting orders
  if (parts[1] === 'reset' && method === 'POST') {
    db = seed();
    save();
    return send(res, 204);
  }

  if (parts[1] !== 'orders') return send(res, 404, { message: 'Unknown endpoint.' });
  const id = parts[2];

  // GET /api/orders?town=Northfield&q=blue
  if (!id && method === 'GET') {
    const town = url.searchParams.get('town');
    const q = (url.searchParams.get('q') || '').trim().toLowerCase();
    let list = db.orders;
    if (town) list = list.filter((o) => o.deliveryTown === town);
    if (q) list = list.filter((o) => o.accountName.toLowerCase().includes(q));
    return send(res, 200, list);
  }

  // POST /api/orders
  if (!id && method === 'POST') {
    let body;
    try { body = pick(await readJson(req)); } catch { return send(res, 400, { message: 'The body must be valid JSON.' }); }
    const order = { price: null, webReference: null, ...body };
    const errors = validate(order, { isNew: true });
    if (errors.length) return send(res, 400, { message: 'Validation failed.', errors });
    const n = db.nextId++;
    const created = { id: String(n), orderNumber: 'SCO-' + String(n).padStart(4, '0'), ...order, bigOrder: order.sizeKg >= BIG_KG };
    db.orders.push(created);
    save();
    return send(res, 201, created);
  }

  const index = db.orders.findIndex((o) => o.id === id);
  if (id && index === -1) return send(res, 404, { message: `Order ${id} not found.` });

  // GET /api/orders/:id
  if (id && method === 'GET') return send(res, 200, db.orders[index]);

  // PUT (replace all fields) and PATCH (change only the fields you send)
  if (id && (method === 'PUT' || method === 'PATCH')) {
    let body;
    try { body = pick(await readJson(req)); } catch { return send(res, 400, { message: 'The body must be valid JSON.' }); }
    const current = db.orders[index];
    const next = method === 'PUT'
      ? { price: null, webReference: null, ...body }
      : { ...current, ...body };
    const errors = validate(next, { isNew: false });
    if (errors.length) return send(res, 400, { message: 'Validation failed.', errors });
    const updated = { id: current.id, orderNumber: current.orderNumber, ...next, bigOrder: next.sizeKg >= BIG_KG };
    db.orders[index] = updated;
    save();
    return send(res, 200, updated);
  }

  // DELETE /api/orders/:id
  if (id && method === 'DELETE') {
    db.orders.splice(index, 1);
    save();
    return send(res, 204);
  }

  return send(res, 405, { message: `${method} is not allowed here.` });
}

load();
http
  .createServer((req, res) => {
    handle(req, res).catch((err) => {
      console.error(err);
      send(res, 500, { message: 'Unexpected server error.' });
    });
  })
  .listen(PORT, () => {
    console.log(`Sweet Crumbs server running at http://localhost:${PORT}/api`);
    console.log(`Token: Bearer ${TOKEN}   |   Delay: ${DELAY_MS} ms   |   Data file: ${DATA_FILE}`);
  });
