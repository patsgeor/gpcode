/**
 * setup-assets.js — Παράγει τα στατικά assets που δεν γράφονται στο χέρι.
 *
 *   1. icons/sprite.svg      από το πακέτο bootstrap-icons
 *   2. favicon/*             SVG + πραγματικά PNG (το iOS αγνοεί SVG apple-touch-icon)
 *   3. images/og-default.png  προεπιλεγμένη εικόνα Open Graph
 *   4. fonts/, css/bootstrap.min.css  αντιγραφή από node_modules (idempotent)
 *
 * Τρέχει μία φορά μετά το `npm install`:  node build/setup-assets.js
 * Δεν χρειάζεται σε κάθε build — τα παραγόμενα αρχεία ανεβαίνουν στο repo.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.join(__dirname, '..');
const NM = path.join(ROOT, 'node_modules');

/* ============================================================
   01. ICON SPRITE
   ============================================================ */

/* Τα εικονίδια που χρησιμοποιεί το site. Το layout() ενσωματώνει σε κάθε
   σελίδα ΜΟΝΟ όσα symbols αναφέρονται πραγματικά σε αυτήν, οπότε η λίστα
   μπορεί να είναι γενναιόδωρη χωρίς κόστος στο DOM. */
const ICONS = [
  // Πλοήγηση & UI
  'arrow-right', 'arrow-up', 'arrow-up-right', 'chevron-right', 'chevron-down',
  'check-lg', 'check-circle-fill', 'x-lg', 'list', 'dash-lg', 'plus-lg',
  // Υπηρεσίες
  'code-slash', 'window-stack', 'braces', 'database', 'hdd-network',
  'lightbulb', 'diagram-3', 'terminal', 'filetype-sql', 'bezier2',
  // Τεχνολογίες & εργαλεία
  'gear-fill', 'sliders', 'stack', 'cloud-arrow-up', 'arrow-repeat',
  'file-earmark-code', 'git', 'puzzle', 'layers-half',
  // Εμπιστοσύνη
  'shield-check', 'patch-check-fill', 'lock-fill', 'award', 'clipboard-check',
  'file-earmark-text', 'bullseye',
  // Επικοινωνία
  'envelope-fill', 'telephone-fill', 'geo-alt-fill', 'clock-fill', 'send-fill',
  'linkedin', 'github', 'share-fill', 'link-45deg', 'building',
  // Περιεχόμενο
  'journal-text', 'calendar3', 'tag-fill', 'person-circle', 'people-fill',
  // Διαδικασία
  'search', 'pencil-square', 'code-square', 'life-preserver', 'rocket-takeoff',
  'chat-left-text', 'hourglass-split',
  // Απόδοση & προσβασιμότητα
  'speedometer2', 'graph-up-arrow', 'lightning-charge-fill', 'universal-access',
  'activity',
  // Διάφορα
  'exclamation-triangle-fill', 'info-circle-fill', 'question-circle-fill',
  'currency-euro', 'box-seam', 'translate', 'phone', 'globe2', 'briefcase'
];

function buildSprite() {
  const iconDir = path.join(NM, 'bootstrap-icons', 'icons');
  if (!fs.existsSync(iconDir)) {
    throw new Error('Λείπει το πακέτο bootstrap-icons. Τρέξτε: npm install');
  }

  const missing = [];
  const symbols = [];

  ICONS.forEach(name => {
    const file = path.join(iconDir, name + '.svg');
    if (!fs.existsSync(file)) { missing.push(name); return; }

    const raw = fs.readFileSync(file, 'utf8');
    const inner = raw
      .replace(/^[\s\S]*?<svg[^>]*>/, '')
      .replace(/<\/svg>\s*$/, '')
      .replace(/\s+/g, ' ')
      .trim();

    symbols.push('<symbol id="i-' + name + '" viewBox="0 0 16 16">' + inner + '</symbol>');
  });

  if (missing.length) {
    throw new Error('Άγνωστα ονόματα εικονιδίων: ' + missing.join(', '));
  }

  const sprite =
    '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
    symbols.join('') +
    '</svg>\n';

  fs.writeFileSync(path.join(ROOT, 'icons', 'sprite.svg'), sprite);
  return { count: symbols.length, bytes: Buffer.byteLength(sprite) };
}

/* ============================================================
   02. ΕΛΑΧΙΣΤΟΣ PNG ENCODER (χωρίς εξαρτήσεις)
   ============================================================ */

const CRC_TABLE = (() => {
  const t = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
    t[n] = c;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function pngChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const body = Buffer.concat([typeBuf, data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

/** rgba: Uint8Array μήκους w*h*4 → Buffer με PNG (colour type 6). */
function encodePNG(rgba, w, h) {
  const stride = w * 4;
  const raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) {
    raw[y * (stride + 1)] = 0; // filter: None
    Buffer.from(rgba.buffer, rgba.byteOffset + y * stride, stride)
      .copy(raw, y * (stride + 1) + 1);
  }

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8;   // bit depth
  ihdr[9] = 6;   // colour type: RGBA
  ihdr[10] = 0;  // compression
  ihdr[11] = 0;  // filter
  ihdr[12] = 0;  // interlace

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]),
    pngChunk('IHDR', ihdr),
    pngChunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    pngChunk('IEND', Buffer.alloc(0))
  ]);
}

/* ============================================================
   03. ΤΟ ΣΗΜΑ gpcode — γεωμετρία
   ============================================================

   Αγκύλες κώδικα με κάθετο slash, σχεδιασμένες σε καμβά 180×180.
   Ίδια γεωμετρία σε SVG και σε raster, ώστε τα εικονίδια να ταιριάζουν. */

const MARK = {
  canvas: 180,
  radius: 40,
  stroke: 12,
  segments: [
    [[66, 62], [42, 90]], [[42, 90], [66, 118]],   // «<»
    [[114, 62], [138, 90]], [[138, 90], [114, 118]], // «>»
    [[100, 54], [80, 126]]                          // «/»
  ]
};

function segDistance(px, py, a, b) {
  const vx = b[0] - a[0], vy = b[1] - a[1];
  const wx = px - a[0], wy = py - a[1];
  const len2 = vx * vx + vy * vy;
  let t = len2 === 0 ? 0 : (wx * vx + wy * vy) / len2;
  t = t < 0 ? 0 : (t > 1 ? 1 : t);
  const dx = px - (a[0] + t * vx), dy = py - (a[1] + t * vy);
  return Math.sqrt(dx * dx + dy * dy);
}

function markDistance(px, py) {
  let d = Infinity;
  for (const s of MARK.segments) {
    const dist = segDistance(px, py, s[0], s[1]);
    if (dist < d) d = dist;
  }
  return d;
}

/** Στρογγυλεμένο ορθογώνιο: signed distance (αρνητικό = μέσα). */
function roundedRectDistance(px, py, w, h, r) {
  const qx = Math.abs(px - w / 2) - (w / 2 - r);
  const qy = Math.abs(py - h / 2) - (h / 2 - r);
  const ax = Math.max(qx, 0), ay = Math.max(qy, 0);
  return Math.sqrt(ax * ax + ay * ay) + Math.min(Math.max(qx, qy), 0) - r;
}

const GRAD_FROM = [0x0B, 0x5E, 0xD7];
const GRAD_TO = [0x1E, 0x40, 0xAF];

/**
 * Ζωγραφίζει το σήμα σε μέγεθος `size`.
 * @param {number} size  πλευρά σε pixels
 * @param {boolean} bleed  true = χωρίς στρογγυλεμένες γωνίες (maskable icon)
 */
function renderMark(size, bleed) {
  const px = new Uint8Array(size * size * 4);
  const scale = size / MARK.canvas;
  const r = bleed ? 0 : MARK.radius * scale;
  const strokeHalf = (MARK.stroke / 2) * scale;
  const SS = 3;               // 3×3 supersampling για antialiasing
  const inv = 1 / (SS * SS);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let bgCov = 0, fgCov = 0;

      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const fx = x + (sx + 0.5) / SS;
          const fy = y + (sy + 0.5) / SS;
          if (roundedRectDistance(fx, fy, size, size, r) < 0) bgCov++;
          if (markDistance(fx / scale, fy / scale) <= MARK.stroke / 2) fgCov++;
        }
      }

      bgCov *= inv;
      fgCov *= inv;

      const t = (x + y) / (2 * size);
      const bg = [
        Math.round(GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * t),
        Math.round(GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * t),
        Math.round(GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * t)
      ];

      // Το σήμα είναι λευκό, μόνο μέσα στο πλαίσιο
      const mark = Math.min(fgCov, bgCov);
      const o = (y * size + x) * 4;
      px[o] = Math.round(bg[0] + (255 - bg[0]) * mark);
      px[o + 1] = Math.round(bg[1] + (255 - bg[1]) * mark);
      px[o + 2] = Math.round(bg[2] + (255 - bg[2]) * mark);
      px[o + 3] = Math.round(bgCov * 255);
    }
  }

  void strokeHalf;
  return encodePNG(px, size, size);
}

function markSVG() {
  const pathData = MARK.segments
    .map(s => 'M' + s[0][0] + ' ' + s[0][1] + 'L' + s[1][0] + ' ' + s[1][1])
    .join('');

  return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180" width="180" height="180">' +
    '<defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">' +
    '<stop offset="0" stop-color="#0B5ED7"/><stop offset="1" stop-color="#1E40AF"/>' +
    '</linearGradient></defs>' +
    '<rect width="180" height="180" rx="' + MARK.radius + '" fill="url(#g)"/>' +
    '<path d="' + pathData + '" fill="none" stroke="#fff" stroke-width="' + MARK.stroke +
    '" stroke-linecap="round" stroke-linejoin="round"/>' +
    '</svg>\n';
}

/* ============================================================
   03b. ΔΙΑΚΟΣΜΗΤΙΚΑ ΜΟΤΙΒΑ
   ============================================================

   Παράγονται ως SVG αντί για raster: μερικά KB, τέλεια σε κάθε
   ανάλυση, και το χρώμα ελέγχεται από το CSS μέσω opacity. */

/** Ντετερμινιστική ψευδοτυχαία ακολουθία — ίδιο μοτίβο σε κάθε build. */
function mulberry32(seed) {
  return function () {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Μοτίβο δυαδικών ψηφίων που επαναλαμβάνεται χωρίς ραφή. */
function binaryPattern() {
  const rand = mulberry32(20260728);
  const W = 320, H = 200;
  const rowH = 20, cols = 40;
  const rows = [];

  for (let y = 0; y < H / rowH; y++) {
    let bits = '';
    for (let x = 0; x < cols; x++) bits += rand() > 0.5 ? '1' : '0';
    /* Μεταβλητή αδιαφάνεια ανά σειρά ώστε να μη μοιάζει μηχανικό */
    const op = (0.5 + rand() * 0.5).toFixed(2);
    rows.push('<text x="0" y="' + (y * rowH + 14) + '" opacity="' + op + '">' + bits + '</text>');
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + W + '" height="' + H + '" ' +
    'viewBox="0 0 ' + W + ' ' + H + '">' +
    '<g fill="#7DD3FC" font-family="monospace" font-size="11" letter-spacing="1.2">' +
    rows.join('') + '</g></svg>\n';
}

/** Λεπτές γραμμές κυκλώματος — υπαινιγμός υποδομής, χωρίς θόρυβο. */
function circuitPattern() {
  const rand = mulberry32(714);
  const S = 260;
  const paths = [];

  for (let i = 0; i < 14; i++) {
    const y = Math.round(rand() * S);
    const x = Math.round(rand() * S);
    const len = 40 + Math.round(rand() * 90);
    const down = rand() > 0.5;
    paths.push(down
      ? 'M' + x + ' ' + y + 'h' + len + 'l14 14v' + Math.round(len / 2)
      : 'M' + x + ' ' + y + 'v' + len + 'l14 14h' + Math.round(len / 2));
  }

  const dots = [];
  for (let i = 0; i < 10; i++) {
    dots.push('<circle cx="' + Math.round(rand() * S) + '" cy="' + Math.round(rand() * S) +
      '" r="2"/>');
  }

  return '<svg xmlns="http://www.w3.org/2000/svg" width="' + S + '" height="' + S + '" ' +
    'viewBox="0 0 ' + S + ' ' + S + '">' +
    '<g fill="none" stroke="#38BDF8" stroke-width="1" stroke-linecap="round">' +
    paths.map(d => '<path d="' + d + '"/>').join('') + '</g>' +
    '<g fill="#38BDF8">' + dots.join('') + '</g></svg>\n';
}

/* ============================================================
   04. OPEN GRAPH IMAGE (1200×630)
   ============================================================ */

function renderOG() {
  const W = 1200, H = 630;
  const px = new Uint8Array(W * H * 4);

  const DARK_FROM = [0x0F, 0x17, 0x2A];
  const DARK_TO = [0x11, 0x2B, 0x5E];

  const markSize = 200;
  const markX = (W - markSize) / 2;
  const markY = 168;
  const scale = markSize / MARK.canvas;
  const SS = 2, inv = 1 / (SS * SS);

  // Διακοσμητική λάμψη πίσω από το σήμα
  const glowX = W / 2, glowY = markY + markSize / 2, glowR = 300;

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const t = (x / W) * 0.45 + (y / H) * 0.55;
      let r = DARK_FROM[0] + (DARK_TO[0] - DARK_FROM[0]) * t;
      let g = DARK_FROM[1] + (DARK_TO[1] - DARK_FROM[1]) * t;
      let b = DARK_FROM[2] + (DARK_TO[2] - DARK_FROM[2]) * t;

      const gd = Math.sqrt((x - glowX) ** 2 + (y - glowY) ** 2);
      if (gd < glowR) {
        const gi = Math.pow(1 - gd / glowR, 2) * 0.28;
        r += (0x14 - r) * gi; g += (0xB8 - g) * gi; b += (0xA6 - b) * gi;
      }

      // Σήμα
      let bgCov = 0, fgCov = 0;
      if (x >= markX - 2 && x < markX + markSize + 2 && y >= markY - 2 && y < markY + markSize + 2) {
        for (let sy = 0; sy < SS; sy++) {
          for (let sx = 0; sx < SS; sx++) {
            const lx = (x + (sx + 0.5) / SS - markX) / scale;
            const ly = (y + (sy + 0.5) / SS - markY) / scale;
            if (roundedRectDistance(lx, ly, MARK.canvas, MARK.canvas, MARK.radius) < 0) bgCov++;
            if (markDistance(lx, ly) <= MARK.stroke / 2) fgCov++;
          }
        }
        bgCov *= inv; fgCov *= inv;

        const bt = (lerpClamp(x - markX, markSize) + lerpClamp(y - markY, markSize)) / 2;
        const br = GRAD_FROM[0] + (GRAD_TO[0] - GRAD_FROM[0]) * bt;
        const bg2 = GRAD_FROM[1] + (GRAD_TO[1] - GRAD_FROM[1]) * bt;
        const bb = GRAD_FROM[2] + (GRAD_TO[2] - GRAD_FROM[2]) * bt;

        const mk = Math.min(fgCov, bgCov);
        const cr = br + (255 - br) * mk, cg = bg2 + (255 - bg2) * mk, cb = bb + (255 - bb) * mk;
        r += (cr - r) * bgCov; g += (cg - g) * bgCov; b += (cb - b) * bgCov;
      }

      // Accent γραμμή κάτω από το σήμα
      const barY = markY + markSize + 56, barH = 6, barW = 120;
      if (y >= barY && y < barY + barH && Math.abs(x - W / 2) < barW / 2) {
        r = 0x14; g = 0xB8; b = 0xA6;
      }

      const o = (y * W + x) * 4;
      px[o] = Math.round(r); px[o + 1] = Math.round(g); px[o + 2] = Math.round(b); px[o + 3] = 255;
    }
  }

  return encodePNG(px, W, H);
}

function lerpClamp(v, max) {
  const t = v / max;
  return t < 0 ? 0 : (t > 1 ? 1 : t);
}

/* ============================================================
   05. ΑΝΤΙΓΡΑΦΗ VENDOR ASSETS
   ============================================================ */

const FONT_WEIGHTS = [400, 500, 700, 800];
const FONT_SUBSETS = ['greek', 'latin'];

function copyVendorAssets() {
  const out = [];

  const fontSrc = path.join(NM, '@fontsource', 'inter', 'files');
  if (fs.existsSync(fontSrc)) {
    FONT_WEIGHTS.forEach(w => FONT_SUBSETS.forEach(s => {
      const from = path.join(fontSrc, `inter-${s}-${w}-normal.woff2`);
      const to = path.join(ROOT, 'fonts', `inter-${w}-${s}.woff2`);
      if (fs.existsSync(from)) { fs.copyFileSync(from, to); out.push(path.basename(to)); }
    }));
  }

  const bs = path.join(NM, 'bootstrap', 'dist', 'css', 'bootstrap.min.css');
  if (fs.existsSync(bs)) {
    fs.copyFileSync(bs, path.join(ROOT, 'css', 'bootstrap.min.css'));
    out.push('bootstrap.min.css');
  }

  return out;
}

/* ============================================================
   ΕΚΤΕΛΕΣΗ
   ============================================================ */

function ensureDir(p) { fs.mkdirSync(path.join(ROOT, p), { recursive: true }); }

function main() {
  ['icons', 'favicon', 'images', 'fonts', 'css'].forEach(ensureDir);

  const sprite = buildSprite();
  console.log(`✓ icons/sprite.svg — ${sprite.count} symbols, ${(sprite.bytes / 1024).toFixed(1)} KB`);

  fs.writeFileSync(path.join(ROOT, 'favicon', 'favicon.svg'), markSVG());
  console.log('✓ favicon/favicon.svg');

  const bin = binaryPattern();
  fs.writeFileSync(path.join(ROOT, 'images', 'pattern-binary.svg'), bin);
  console.log(`✓ images/pattern-binary.svg — ${(Buffer.byteLength(bin) / 1024).toFixed(1)} KB`);

  const circuit = circuitPattern();
  fs.writeFileSync(path.join(ROOT, 'images', 'pattern-circuit.svg'), circuit);
  console.log(`✓ images/pattern-circuit.svg — ${(Buffer.byteLength(circuit) / 1024).toFixed(1)} KB`);

  const rasters = [
    ['favicon-32.png', 32, false],
    ['favicon-180.png', 180, false],   // apple-touch-icon
    ['icon-192.png', 192, false],
    ['icon-512.png', 512, false],
    ['icon-maskable-512.png', 512, true]
  ];

  rasters.forEach(([name, size, bleed]) => {
    const buf = renderMark(size, bleed);
    fs.writeFileSync(path.join(ROOT, 'favicon', name), buf);
    console.log(`✓ favicon/${name} — ${(buf.length / 1024).toFixed(1)} KB`);
  });

  const og = renderOG();
  fs.writeFileSync(path.join(ROOT, 'images', 'og-default.png'), og);
  console.log(`✓ images/og-default.png — ${(og.length / 1024).toFixed(1)} KB`);

  const vendor = copyVendorAssets();
  console.log(`✓ vendor assets — ${vendor.length} αρχεία (fonts + bootstrap)`);
}

main();
