/**
 * generate.js — Παράγει όλα τα .html καθώς και sitemap, robots και manifest.
 *
 *   node build/generate.js          (development: ξεχωριστά css/js)
 *   node build/generate.js --prod   (production: app.min.css + *.min.js)
 *
 * Τερματίζει με κωδικό ≠0 αν αποτύχει οποιοσδήποτε έλεγχος ποιότητας,
 * ώστε να μη δημοσιευτεί ποτέ σιωπηλά ελαττωματικό build.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const { layout, D, SITE, PROD } = require('./templates/layout.js');
const main = require('./pages-main.js');
const services = require('./pages-services.js');
const secondary = require('./pages-secondary.js');
const blog = require('./pages-blog.js');
const demos = require('./pages-demos.js');

const ROOT = path.join(__dirname, '..');

/* ============================================================
   ΣΥΛΛΟΓΗ ΣΕΛΙΔΩΝ
   ============================================================ */

const pages = [
  main.home(),
  main.about(),
  main.services(),
  main.portfolio(),
  secondary.faq(),
  secondary.contact(),
  secondary.privacy(),
  secondary.cookies(),
  secondary.terms(),
  secondary.notFound()
].concat(services.all()).concat(blog.all());

/* ============================================================
   ΕΓΓΡΑΦΗ HTML
   ============================================================ */

const problems = [];
const warnings = [];

function fail(msg) { problems.push(msg); }
function warn(msg) { warnings.push(msg); }

const rendered = {};

pages.forEach(p => {
  let html;
  try {
    html = layout(p);
  } catch (e) {
    fail('[' + p.slug + '] Σφάλμα κατά την παραγωγή: ' + e.message);
    return;
  }
  rendered[p.slug] = html;

  const out = path.join(ROOT, p.slug);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html, 'utf8');
});

/* ============================================================
   ΣΕΛΙΔΕΣ-ΔΕΙΓΜΑΤΑ
   ============================================================
   Δεν περνούν από το layout() ούτε από τους ελέγχους schema: είναι
   αυτόνομες σελίδες πλασματικών επιχειρήσεων, noindex και εκτός
   sitemap. Ελέγχονται μόνο για ένα <h1> και για τη μπάρα «ΔΕΙΓΜΑ».
*/
const demoPages = demos.all();

demoPages.forEach(p => {
  const out = path.join(ROOT, p.slug);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, p.html, 'utf8');

  const h1s = (p.html.match(/<h1[\s>]/g) || []).length;
  if (h1s !== 1) fail('[' + p.slug + '] Βρέθηκαν ' + h1s + ' στοιχεία <h1>');

  if (p.html.indexOf('class="demo-bar"') === -1) {
    fail('[' + p.slug + '] Λείπει η μπάρα «ΔΕΙΓΜΑ» — κάθε δείγμα πρέπει να ' +
      'δηλώνει ρητά ότι είναι πλασματικό');
  }
  if (p.html.indexOf('noindex') === -1) {
    fail('[' + p.slug + '] Το δείγμα πρέπει να είναι noindex');
  }
  if (/application\/ld\+json/.test(p.html)) {
    fail('[' + p.slug + '] Δεν εκπέμπουμε structured data πλασματικής επιχείρησης');
  }
});

/* ============================================================
   ΕΛΕΓΧΟΙ ΠΟΙΟΤΗΤΑΣ
   ============================================================ */

/* 1 — Μοναδικοί και σωστού μήκους τίτλοι & περιγραφές */
const seenTitles = {};
const seenDescriptions = {};

pages.forEach(p => {
  if (!p.title) { fail('[' + p.slug + '] Λείπει το title'); return; }
  if (!p.description) { fail('[' + p.slug + '] Λείπει το description'); return; }

  if (seenTitles[p.title]) {
    fail('Διπλότυπο title: «' + p.title + '» σε ' + seenTitles[p.title] + ' και ' + p.slug);
  } else {
    seenTitles[p.title] = p.slug;
  }

  if (seenDescriptions[p.description]) {
    fail('Διπλότυπο description σε ' + seenDescriptions[p.description] + ' και ' + p.slug);
  } else {
    seenDescriptions[p.description] = p.slug;
  }

  if (p.title.length > 70) {
    warn('[' + p.slug + '] Title ' + p.title.length + ' χαρακτήρες (>70)');
  }
  if (p.description.length > 165) {
    fail('[' + p.slug + '] Description ' + p.description.length + ' χαρακτήρες (>165)');
  }
  if (p.description.length < 70) {
    fail('[' + p.slug + '] Description ' + p.description.length + ' χαρακτήρες (<70)');
  }
});

/* 2 — Ακριβώς ένα <h1> ανά σελίδα */
pages.forEach(p => {
  const html = rendered[p.slug];
  if (!html) return;
  const count = (html.match(/<h1[\s>]/g) || []).length;
  if (count !== 1) {
    fail('[' + p.slug + '] Βρέθηκαν ' + count + ' στοιχεία <h1> (πρέπει ακριβώς 1)');
  }
});

/* 3 — Έγκυρο JSON-LD, μοναδικοί κόμβοι @id, μοναδικές ερωτήσεις FAQ */
const definedIds = {};     // @id → slug όπου ορίστηκε πλήρως
const faqQuestions = {};   // ερώτηση → slug

pages.forEach(p => {
  const html = rendered[p.slug];
  if (!html) return;

  const blocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];

  blocks.forEach(block => {
    const raw = block
      .replace(/^<script type="application\/ld\+json">/, '')
      .replace(/<\/script>$/, '')
      .replace(/\\u003c/g, '<');

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (e) {
      fail('[' + p.slug + '] Μη έγκυρο JSON-LD: ' + e.message);
      return;
    }

    const nodes = parsed['@graph'] || [parsed];

    nodes.forEach(node => {
      /* Κόμβος «πλήρους ορισμού» = έχει και άλλα κλειδιά πέρα από @id/@type */
      const keys = Object.keys(node).filter(k => k !== '@id' && k !== '@type');
      const id = node['@id'];

      if (id && keys.length > 0) {
        if (definedIds[id]) {
          fail('Ο κόμβος @id «' + id + '» ορίζεται πλήρως σε δύο σελίδες: ' +
            definedIds[id] + ' και ' + p.slug + ' — πρέπει μία φορά, αλλού μόνο ως αναφορά');
        } else {
          definedIds[id] = p.slug;
        }
      }

      /* Καμία ερώτηση FAQ δεν επιτρέπεται σε δύο FAQPage */
      if (node['@type'] === 'FAQPage' && Array.isArray(node.mainEntity)) {
        node.mainEntity.forEach(q => {
          const name = q.name;
          if (faqQuestions[name]) {
            fail('Η ερώτηση FAQ «' + name.slice(0, 60) + '…» εμφανίζεται σε ' +
              faqQuestions[name] + ' και ' + p.slug);
          } else {
            faqQuestions[name] = p.slug;
          }
        });
      }
    });
  });
});

/* 4 — Κάθε αναφορά @id δείχνει σε κόμβο που ορίζεται κάπου */
pages.forEach(p => {
  const html = rendered[p.slug];
  if (!html) return;
  const blocks = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g) || [];
  blocks.forEach(block => {
    const raw = block
      .replace(/^<script type="application\/ld\+json">/, '')
      .replace(/<\/script>$/, '')
      .replace(/\\u003c/g, '<');
    let parsed;
    try { parsed = JSON.parse(raw); } catch (e) { return; }

    JSON.stringify(parsed).replace(/"@id":"([^"]+)"/g, (m, id) => {
      if (!definedIds[id] && id.indexOf('#breadcrumb') === -1 &&
          id.indexOf('#itemlist') === -1 && id.indexOf('#contactpoint') === -1) {
        warn('[' + p.slug + '] Αναφορά σε @id που δεν ορίζεται πουθενά: ' + id);
      }
      return m;
    });
  });
});

/* 5 — Ελάχιστο μήκος περιεχομένου (πιάνει άδειες σελίδες) */
pages.forEach(p => {
  const text = String(p.content).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  if (text.length < 600) {
    warn('[' + p.slug + '] Λίγο περιεχόμενο: ' + text.length + ' χαρακτήρες κειμένου');
  }
});

/* ============================================================
   SEO ΑΡΧΕΙΑ
   ============================================================ */

const today = new Date().toISOString().slice(0, 10);
const indexable = pages.filter(p => !p.noindex);

function locFor(slug) {
  return slug === 'index.html' ? SITE + '/' : SITE + '/' + slug;
}

function priorityFor(slug) {
  if (slug === 'index.html') return '1.0';
  if (slug.indexOf('services/') === 0) return '0.9';
  if (slug === 'services.html' || slug === 'contact.html') return '0.9';
  if (slug === 'about.html' || slug === 'portfolio.html' || slug === 'faq.html') return '0.8';
  if (slug === 'blog/index.html') return '0.7';
  if (slug.indexOf('blog/') === 0) return '0.6';
  return '0.4';
}

function changefreqFor(slug) {
  if (slug === 'index.html' || slug === 'blog/index.html') return 'weekly';
  if (slug.indexOf('blog/') === 0) return 'monthly';
  if (slug === 'privacy.html' || slug === 'cookies.html' || slug === 'terms.html') return 'yearly';
  return 'monthly';
}

function lastmodFor(p) {
  if (p.slug.indexOf('blog/') === 0 && p.slug !== 'blog/index.html') {
    const post = D.posts.find(x => 'blog/' + x.slug + '.html' === p.slug);
    if (post) return post.dateModified || post.datePublished;
  }
  return today;
}

const xmlEsc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/* sitemap.xml */
const sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  indexable.map(p =>
    '  <url>\n' +
    '    <loc>' + locFor(p.slug) + '</loc>\n' +
    '    <lastmod>' + lastmodFor(p) + '</lastmod>\n' +
    '    <changefreq>' + changefreqFor(p.slug) + '</changefreq>\n' +
    '    <priority>' + priorityFor(p.slug) + '</priority>\n' +
    '  </url>'
  ).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), sitemap);

/* sitemap-images.xml — προς το παρόν μόνο η προεπιλεγμένη εικόνα OG */
const og = D.images.ogDefault;
const imagePages = indexable.filter(p => p.slug === 'index.html' || p.ogImage);
const sitemapImages = '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" ' +
  'xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n' +
  imagePages.map(p =>
    '  <url>\n' +
    '    <loc>' + locFor(p.slug) + '</loc>\n' +
    '    <image:image>\n' +
    '      <image:loc>' + SITE + '/' + (p.ogImage || og.src) + '</image:loc>\n' +
    '      <image:title>' + xmlEsc(og.alt) + '</image:title>\n' +
    '    </image:image>\n' +
    '  </url>'
  ).join('\n') + '\n</urlset>\n';

fs.writeFileSync(path.join(ROOT, 'sitemap-images.xml'), sitemapImages);

/* robots.txt */
const robots = '# robots.txt — gpcode\n' +
  '# Ολόκληρος ο ιστότοπος είναι δημόσιος· δεν υπάρχει περιεχόμενο προς απόκρυψη.\n\n' +
  'User-agent: *\n' +
  'Allow: /\n\n' +
  '# Αρχεία build — δεν ανεβαίνουν στην παραγωγή, εδώ για κάθε ενδεχόμενο.\n' +
  'Disallow: /build/\n' +
  'Disallow: /node_modules/\n\n' +
  'Sitemap: ' + SITE + '/sitemap.xml\n' +
  'Sitemap: ' + SITE + '/sitemap-images.xml\n';

fs.writeFileSync(path.join(ROOT, 'robots.txt'), robots);

/* manifest.webmanifest */
const manifest = {
  name: 'gpcode — Ανάπτυξη Λογισμικού & Κατασκευή Ιστοσελίδων',
  short_name: 'gpcode',
  description: D.business.description,
  lang: 'el',
  dir: 'ltr',
  start_url: '/',
  scope: '/',
  display: 'standalone',
  background_color: '#070B14',
  theme_color: '#070B14',
  icons: [
    { src: '/favicon/favicon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    { src: '/favicon/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
    { src: '/favicon/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    { src: '/favicon/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
  ]
};
fs.writeFileSync(path.join(ROOT, 'manifest.webmanifest'),
  JSON.stringify(manifest, null, 2) + '\n');

/* browserconfig.xml */
fs.writeFileSync(path.join(ROOT, 'browserconfig.xml'),
  '<?xml version="1.0" encoding="utf-8"?>\n' +
  '<browserconfig>\n  <msapplication>\n    <tile>\n' +
  '      <square150x150logo src="/favicon/icon-192.png"/>\n' +
  '      <TileColor>#0B5ED7</TileColor>\n' +
  '    </tile>\n  </msapplication>\n</browserconfig>\n');

/* ============================================================
   ΑΝΑΦΟΡΑ
   ============================================================ */

console.log('');
console.log('  gpcode — build ' + (PROD ? '(production)' : '(development)'));
console.log('  ' + '─'.repeat(52));
console.log('  Σελίδες:        ' + pages.length + ' (' + indexable.length + ' indexable)');
console.log('  Δείγματα:       ' + demoPages.length + ' (noindex, εκτός sitemap)');
console.log('  Υπηρεσίες:      ' + D.services.length);
console.log('  Άρθρα:          ' + D.posts.length);
console.log('  Ερωτήσεις FAQ:  ' + Object.keys(faqQuestions).length + ' μοναδικές');
console.log('  Κόμβοι schema:  ' + Object.keys(definedIds).length + ' μοναδικοί @id');
console.log('  Αρχεία SEO:     sitemap.xml, sitemap-images.xml, robots.txt,');
console.log('                  manifest.webmanifest, browserconfig.xml');

if (warnings.length) {
  console.log('');
  console.log('  ⚠ Προειδοποιήσεις (' + warnings.length + '):');
  warnings.forEach(w => console.log('    · ' + w));
}

if (problems.length) {
  console.log('');
  console.log('  ✖ Σφάλματα (' + problems.length + '):');
  problems.forEach(p => console.log('    · ' + p));
  console.log('');
  process.exit(1);
}

console.log('');
console.log('  ✓ Όλοι οι έλεγχοι ποιότητας πέρασαν.');
console.log('');
