/**
 * dist.js — Συγκεντρώνει σε φάκελο dist/ ό,τι ακριβώς πρέπει να ανέβει.
 *
 * Λειτουργεί και ως τελευταία δικλείδα: αρνείται να ολοκληρώσει αν το HTML
 * δείχνει ακόμη σε assets ανάπτυξης, ώστε να μη δημοσιευτεί ποτέ dev build.
 *
 *   node build/dist.js
 *   node build/dist.js --precompress
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const KEEP_COMPRESSED = process.argv.indexOf('--precompress') !== -1;

/* Ό,τι δεν ανεβαίνει: εργαλεία, πηγαία assets, τοπικές ρυθμίσεις */
const EXCLUDE_DIRS = new Set(['build', 'node_modules', '.claude', '.git', 'dist', 'assets']);
const EXCLUDE_FILES = new Set([
  'package.json', 'package-lock.json', 'README.md', '.gitignore'
]);
/* Πηγαία αρχεία — στην παραγωγή σερβίρονται τα minified */
const EXCLUDE_EXACT = new Set([
  'css/bootstrap.min.css', 'css/style.css', 'css/demo.css',
  'js/nav.js', 'js/main.js', 'js/cookie-consent.js', 'js/contact.js'
]);
/* Το data.js χρειάζεται στη ρίζα ως SSOT αλλά δεν το φορτώνει καμία σελίδα */
EXCLUDE_EXACT.add('js/data.js');
/* Το sprite διαβάζεται κατά το build· κάθε σελίδα ενσωματώνει μόνο τα
   symbols που χρησιμοποιεί, άρα το αρχείο δεν ζητείται ποτέ από browser. */
EXCLUDE_EXACT.add('icons/sprite.svg');

const REQUIRED = [
  'index.html', '404.html', 'css/app.min.css', 'js/main.min.js',
  'robots.txt', 'sitemap.xml', 'manifest.webmanifest', 'favicon/favicon.svg'
];

function rimraf(target) {
  if (fs.existsSync(target)) fs.rmSync(target, { recursive: true, force: true });
}

const sizes = {};
let fileCount = 0;

function copyTree(srcDir, destDir, relBase) {
  fs.readdirSync(srcDir, { withFileTypes: true }).forEach(entry => {
    const rel = relBase ? relBase + '/' + entry.name : entry.name;

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name) || entry.name.startsWith('.')) return;
      const nextDest = path.join(destDir, entry.name);
      fs.mkdirSync(nextDest, { recursive: true });
      copyTree(path.join(srcDir, entry.name), nextDest, rel);
      /* Αν ο φάκελος έμεινε άδειος, αφαιρείται */
      if (!fs.readdirSync(nextDest).length) fs.rmdirSync(nextDest);
      return;
    }

    if (EXCLUDE_FILES.has(entry.name)) return;
    if (EXCLUDE_EXACT.has(rel)) return;
    if (entry.name.startsWith('.')) return;
    if (!KEEP_COMPRESSED && /\.(gz|br)$/.test(entry.name)) return;

    const from = path.join(srcDir, entry.name);
    const to = path.join(destDir, entry.name);
    fs.copyFileSync(from, to);

    const ext = path.extname(entry.name).toLowerCase() || '(χωρίς)';
    const size = fs.statSync(from).size;
    sizes[ext] = sizes[ext] || { count: 0, bytes: 0 };
    sizes[ext].count++;
    sizes[ext].bytes += size;
    fileCount++;
  });
}

/* ============================================================
   ΕΚΤΕΛΕΣΗ
   ============================================================ */

console.log('');
console.log('  gpcode — dist');
console.log('  ' + '─'.repeat(52));

rimraf(DIST);
fs.mkdirSync(DIST, { recursive: true });
copyTree(ROOT, DIST, '');

/* ---------- Επαλήθευση ---------- */
const missing = REQUIRED.filter(f => !fs.existsSync(path.join(DIST, f)));
if (missing.length) {
  console.log('');
  console.log('  ✖ Λείπουν απαραίτητα αρχεία:');
  missing.forEach(f => console.log('    · ' + f));
  console.log('');
  process.exit(1);
}

/* Το HTML πρέπει να δείχνει σε assets παραγωγής */
const indexHtml = fs.readFileSync(path.join(DIST, 'index.html'), 'utf8');
const devLeftovers = [];
if (indexHtml.indexOf('css/app.min.css') === -1) devLeftovers.push('css/app.min.css');
if (indexHtml.indexOf('js/main.min.js') === -1) devLeftovers.push('js/main.min.js');

if (devLeftovers.length) {
  console.log('');
  console.log('  ✖ Το index.html δεν δείχνει στα assets παραγωγής: ' + devLeftovers.join(', '));
  console.log('    Τρέξτε:  node build/generate.js --prod && node build/optimize.js');
  console.log('');
  rimraf(DIST);
  process.exit(1);
}

/* ---------- Αναφορά ---------- */
const total = Object.keys(sizes).reduce((sum, ext) => sum + sizes[ext].bytes, 0);

console.log('  Αρχεία:  ' + fileCount + '  ·  Σύνολο: ' + (total / 1024).toFixed(0) + ' KB');
console.log('');
Object.keys(sizes).sort((a, b) => sizes[b].bytes - sizes[a].bytes).forEach(ext => {
  const s = sizes[ext];
  console.log('    ' + ext.padEnd(16) + String(s.count).padStart(3) + ' αρχεία   ' +
    (s.bytes / 1024).toFixed(1).padStart(8) + ' KB');
});

console.log('');
console.log('  ✓ Ο φάκελος dist/ είναι έτοιμος για ανέβασμα.');
console.log('');
