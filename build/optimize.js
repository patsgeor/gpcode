/**
 * optimize.js — Παράγει τα assets της παραγωγής.
 *
 *   1. PurgeCSS στο Bootstrap: κρατά μόνο τους κανόνες που χρησιμοποιούνται
 *   2. Συγχώνευση με το style.css (δεύτερο, ώστε να κερδίζει στο cascade)
 *   3. Ελαχιστοποίηση σε ένα css/app.min.css — ένα render-blocking αίτημα
 *   4. Ελαχιστοποίηση κάθε αρχείου JS
 *   5. Προαιρετική προσυμπίεση με --precompress
 *
 * Τρέξτε το ΜΕΤΑ το `node build/generate.js --prod`.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const CleanCSS = require('clean-css');
const { PurgeCSS } = require('purgecss');
const terser = require('terser');

const ROOT = path.join(__dirname, '..');
const PRECOMPRESS = process.argv.indexOf('--precompress') !== -1;

const JS_FILES = ['nav.js', 'main.js', 'cookie-consent.js', 'contact.js'];
const SKIP_DIRS = new Set(['build', 'node_modules', '.claude', '.git', 'dist', 'fonts']);

function walkHtml(dir, acc) {
  acc = acc || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    if (entry.name.startsWith('.') && entry.name !== '.claude') return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkHtml(full, acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(full);
    }
  });
  return acc;
}

function kb(bytes) { return (bytes / 1024).toFixed(1) + ' KB'; }

async function main() {
  /* PurgeCSS θέλει σχετικές διαδρομές POSIX· οι απόλυτες διαδρομές των
     Windows (ιδίως με κενά) δεν ταιριάζουν στα globs. */
  process.chdir(ROOT);

  const allHtml = walkHtml(ROOT).map(f => path.relative(ROOT, f).split(path.sep).join('/'));

  /* Οι σελίδες-δείγματα έχουν δικό τους αυτόνομο stylesheet και δεν
     χρησιμοποιούν Bootstrap. Αν μπουν στο content του purge, κρατούν άσκοπα
     κανόνες (.card, .btn, .grid…) στο app.min.css των κανονικών σελίδων. */
  const htmlFiles = allHtml.filter(f => !f.startsWith('examples/'));
  const demoHtml = allHtml.filter(f => f.startsWith('examples/'));
  if (!htmlFiles.length) {
    console.error('✖ Δεν βρέθηκαν αρχεία HTML. Τρέξτε πρώτα: node build/generate.js --prod');
    process.exit(1);
  }

  console.log('');
  console.log('  gpcode — optimize');
  console.log('  ' + '─'.repeat(52));

  /* ---------- 1+2+3. CSS ---------- */
  const bootstrapPath = 'css/bootstrap.min.css';
  const bootstrapRaw = fs.readFileSync(path.join(ROOT, bootstrapPath), 'utf8');

  const purged = await new PurgeCSS().purge({
    content: htmlFiles.concat(JS_FILES.map(f => 'js/' + f)),
    css: [bootstrapPath],
    /* Κλάσεις που εναλλάσσονται από JavaScript και δεν φαίνονται στο HTML */
    safelist: {
      standard: ['show', 'showing', 'collapse', 'collapsing', 'fade', 'active',
        'is-invalid', 'was-validated', 'disabled'],
      deep: [/^dropdown/, /^collapse/, /^navbar/, /^form-/, /^btn-/],
      greedy: [/data-bs/]
    },
    variables: true,
    keyframes: true,
    fontFace: false   /* τα @font-face ζουν στο style.css, όχι στο Bootstrap */
  });

  const bootstrapSubset = purged[0].css;
  const styleRaw = fs.readFileSync(path.join(ROOT, 'css', 'style.css'), 'utf8');

  const stripCharset = s => s.replace(/@charset\s+["'][^"']+["'];\s*/gi, '');

  const combined = '@charset "UTF-8";\n' +
    stripCharset(bootstrapSubset) + '\n' +
    stripCharset(styleRaw);

  const minified = new CleanCSS({ level: 2, rebase: false }).minify(combined);
  if (minified.errors.length) {
    console.error('✖ Σφάλμα CleanCSS:', minified.errors.join(', '));
    process.exit(1);
  }

  fs.writeFileSync(path.join(ROOT, 'css', 'app.min.css'), minified.styles);

  console.log('  CSS');
  console.log('    bootstrap.min.css  ' + kb(Buffer.byteLength(bootstrapRaw)) +
    ' → ' + kb(Buffer.byteLength(bootstrapSubset)) + ' μετά το purge');
  console.log('    style.css          ' + kb(Buffer.byteLength(styleRaw)));
  console.log('    app.min.css        ' + kb(Buffer.byteLength(minified.styles)) +
    '  (ένα render-blocking αίτημα)');

  /* ---- CSS δειγμάτων: αυτόνομο, χωρίς Bootstrap ---- */
  const demoSrc = path.join(ROOT, 'css', 'demo.css');
  if (fs.existsSync(demoSrc) && demoHtml.length) {
    const demoRaw = fs.readFileSync(demoSrc, 'utf8');
    const demoMin = new CleanCSS({ level: 2, rebase: false }).minify(demoRaw);
    if (demoMin.errors.length) {
      console.error('✖ Σφάλμα CleanCSS στο demo.css:', demoMin.errors.join(', '));
      process.exit(1);
    }
    fs.writeFileSync(path.join(ROOT, 'css', 'demo.min.css'), demoMin.styles);
    console.log('    demo.min.css       ' + kb(Buffer.byteLength(demoMin.styles)) +
      '  (' + demoHtml.length + ' σελίδες-δείγματα)');
  }

  if (minified.warnings.length > 3) {
    console.log('    · ' + minified.warnings.length + ' προειδοποιήσεις CleanCSS (αγνοήθηκαν)');
  }

  /* ---------- 4. JavaScript ---------- */
  console.log('  JavaScript');
  let jsTotal = 0;

  for (const file of JS_FILES) {
    const src = path.join(ROOT, 'js', file);
    if (!fs.existsSync(src)) continue;

    const code = fs.readFileSync(src, 'utf8');
    const result = await terser.minify(code, {
      compress: { drop_console: false },
      mangle: true,
      format: { comments: false }
    });

    if (result.error) {
      console.error('✖ Σφάλμα terser στο ' + file + ': ' + result.error);
      process.exit(1);
    }

    const out = src.replace(/\.js$/, '.min.js');
    fs.writeFileSync(out, result.code);
    jsTotal += Buffer.byteLength(result.code);
    console.log('    ' + file.padEnd(19) + kb(Buffer.byteLength(code)) +
      ' → ' + kb(Buffer.byteLength(result.code)));
  }

  console.log('    ' + 'σύνολο'.padEnd(19) + kb(jsTotal) + '  (όλα με defer)');

  /* ---------- 5. Προσυμπίεση ---------- */
  if (PRECOMPRESS) {
    /* Χρήσιμο μόνο σε nginx με gzip_static, ή σε Netlify / Cloudflare Pages.
       Σε Apache ή LiteSpeed (τυπικό ελληνικό hosting) η συμπίεση γίνεται
       ούτως ή άλλως on the fly και αυτά τα αρχεία απλώς πιάνουν χώρο. */
    const exts = /\.(html|css|js|json|xml|svg|txt|webmanifest)$/;
    let count = 0;

    const compressWalk = dir => {
      fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
          if (!SKIP_DIRS.has(entry.name) && !entry.name.startsWith('.')) compressWalk(full);
        } else if (exts.test(entry.name)) {
          const buf = fs.readFileSync(full);
          fs.writeFileSync(full + '.gz', zlib.gzipSync(buf, { level: 9 }));
          fs.writeFileSync(full + '.br', zlib.brotliCompressSync(buf, {
            params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 }
          }));
          count++;
        }
      });
    };

    compressWalk(ROOT);
    console.log('  Προσυμπίεση');
    console.log('    ' + count + ' αρχεία → .gz + .br');
  }

  console.log('');
  console.log('  ✓ Τα assets παραγωγής είναι έτοιμα.');
  console.log('');
}

main().catch(err => {
  console.error('✖ ' + err.stack);
  process.exit(1);
});
