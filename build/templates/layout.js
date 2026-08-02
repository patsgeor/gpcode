/**
 * layout.js — Το κέλυφος κάθε σελίδας.
 *
 * Μια σελίδα είναι ένα απλό αντικείμενο· το layout() το μετατρέπει σε HTML.
 * Έτσι το <head>, το navbar, το footer και το cookie banner γράφονται ΜΙΑ φορά.
 *
 * Συμβόλαιο σελίδας:
 * {
 *   slug:        'services/web-development.html'  — διαδρομή εξόδου & κλειδί sitemap
 *   depth:       1                                — 0 = ρίζα· καθορίζει το πρόθεμα '../'
 *   navId:       'web-development'                — ταιριάζει με id του NAV → .active
 *   title:       '…'                              — μοναδικό site-wide, ≤70 χαρακτήρες
 *   description: '…'                              — μοναδικό site-wide, 70–165 χαρακτήρες
 *   content:     '<section>…'                     — το innerHTML του <main>
 *   breadcrumbs: [{name, href}]                   — προαιρετικό· παράγει και BreadcrumbList
 *   graph:       [ {...} ]                        — προαιρετικοί κόμβοι JSON-LD
 *   scripts:     ['js/contact.js']                — προαιρετικά επιπλέον scripts
 *   ogType:      'article'                        — προεπιλογή 'website'
 *   ogImage:     'images/x.png'                   — προεπιλογή images/og-default.png
 *   noindex:     true                             — robots noindex + εκτός sitemap
 *   absoluteLinks: true                           — base '/' αντί για '../' (404)
 *   bodyClass:   '…'
 * }
 */
'use strict';

const fs = require('fs');
const path = require('path');

const D = require('../../js/data.js');
const SITE = D.business.domain;
const PROD = process.argv.indexOf('--prod') !== -1;

/* Το sprite διαβάζεται μία φορά· ενσωματώνονται μόνο τα symbols που
   χρησιμοποιεί κάθε σελίδα, ώστε το DOM να μένει μικρό. */
const SPRITE_RAW = fs.readFileSync(path.join(__dirname, '..', '..', 'icons', 'sprite.svg'), 'utf8');
const SYMBOLS = {};
SPRITE_RAW.replace(/<symbol id="i-([^"]+)"[\s\S]*?<\/symbol>/g, (m, name) => {
  SYMBOLS[name] = m;
  return m;
});

/* ============================================================
   ΒΟΗΘΗΤΙΚΑ
   ============================================================ */

function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** Εικονίδιο από το sprite. Το `cls` προστίθεται στο <svg>. */
function icon(name, cls) {
  return '<svg class="bi' + (cls ? ' ' + cls : '') + '" width="1em" height="1em" ' +
    'aria-hidden="true" focusable="false"><use href="#i-' + name + '"></use></svg>';
}

/** Πρόθεμα διαδρομής ανάλογα με το βάθος της σελίδας. */
function base(depth) {
  let p = '';
  for (let i = 0; i < depth; i++) p += '../';
  return p;
}

/** Απόλυτο URL για canonical / schema. */
function abs(slug) {
  if (!slug) return SITE + '/';
  if (slug === 'index.html') return SITE + '/';
  return SITE + '/' + slug;
}

/** Στην παραγωγή δείχνουμε στα minified JS. */
const jsFile = name => PROD ? name.replace(/\.js$/, '.min.js') : name;

/* ============================================================
   ΠΛΟΗΓΗΣΗ — μία πηγή για navbar και footer
   ============================================================ */

/* Μόνο οι δύο κύριες υπηρεσίες μπαίνουν στο κύριο μενού. Οι υπόλοιπες πέντε
   (.NET, Angular, βάσεις, API, συμβουλευτική) παραμένουν προσβάσιμες από το
   footer (όλες) και από ειδική ενότητα μέσα στη σελίδα web-applications —
   δεν εξαφανίζονται, απλώς δεν γεμίζουν το κύριο μενού. */
const NAV = [
  { id: 'home', label: 'Αρχική', href: 'index.html' },
  { id: 'web-development', label: 'Κατασκευή Site', href: 'services/web-development.html' },
  { id: 'web-applications', label: 'Web Εφαρμογές', href: 'services/web-applications.html' },
  { id: 'pricing', label: 'Τιμές', href: 'services/web-development.html#pricing' },
  { id: 'portfolio', label: 'Έργα', href: 'portfolio.html' },
  { id: 'blog', label: 'Άρθρα', href: 'blog/index.html' },
  {
    id: 'company', label: 'Εταιρεία', href: 'about.html',
    children: [
      { id: 'about', label: 'Σχετικά με εμάς', href: 'about.html', icon: 'person-circle' },
      { id: 'faq', label: 'Συχνές ερωτήσεις', href: 'faq.html', icon: 'question-circle-fill' }
    ]
  },
  { id: 'contact', label: 'Επικοινωνία', href: 'contact.html', cta: true }
];

function isActive(item, navId) {
  if (item.id === navId) return true;
  return !!(item.children && item.children.some(c => c.id === navId));
}

function renderNav(b, navId) {
  const items = NAV.map(item => {
    if (item.children) {
      const open = isActive(item, navId);
      const links = item.children.map(c =>
        '<li><a class="dropdown-item' + (c.id === navId ? ' active' : '') + '" href="' + b + c.href + '"' +
        (c.id === navId ? ' aria-current="page"' : '') + '>' +
        icon(c.icon) + '<span>' + esc(c.label) + '</span></a></li>'
      ).join('');

      return '<li class="nav-item dropdown">' +
        '<a class="nav-link' + (open ? ' active' : '') + '" href="' + b + item.href + '" ' +
        'id="nav-' + item.id + '" data-bs-toggle="dropdown" aria-expanded="false">' +
        esc(item.label) + icon('chevron-down', 'ms-1') + '</a>' +
        '<ul class="dropdown-menu" aria-labelledby="nav-' + item.id + '">' + links + '</ul>' +
        '</li>';
    }

    const active = item.id === navId;
    return '<li class="nav-item"><a class="nav-link' + (item.cta ? ' nav-cta' : '') +
      (active ? ' active' : '') + '" href="' + b + item.href + '"' +
      (active ? ' aria-current="page"' : '') + '>' + esc(item.label) + '</a></li>';
  }).join('');

  return '<header class="site-header">' +
    '<nav class="navbar navbar-expand-lg container" aria-label="Κύρια πλοήγηση">' +
    '<a class="navbar-brand" href="' + b + 'index.html">' +
    '<span class="brand-mark" aria-hidden="true">' + icon('code-slash') + '</span>' +
    '<span class="brand-text">gpcode<span class="brand-sub">Software Studio</span></span>' +
    '</a>' +
    '<button class="navbar-toggler" type="button" data-bs-toggle="collapse" ' +
    'data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" ' +
    'aria-label="Άνοιγμα μενού πλοήγησης">' + icon('list', 'fs-4') + '</button>' +
    '<div class="collapse navbar-collapse" id="mainNav">' +
    '<ul class="navbar-nav ms-auto">' + items + '</ul>' +
    '</div></nav></header>';
}

/* ============================================================
   BREADCRUMBS
   ============================================================ */

function renderBreadcrumbs(crumbs, b) {
  if (!crumbs || !crumbs.length) return '';

  const items = crumbs.map((c, i) => {
    const last = i === crumbs.length - 1;
    const sep = i > 0 ? '<span class="sep" aria-hidden="true">' + icon('chevron-right') + '</span>' : '';
    const body = last || !c.href
      ? '<span aria-current="page">' + esc(c.name) + '</span>'
      : '<a href="' + b + c.href + '">' + esc(c.name) + '</a>';
    return '<li>' + sep + body + '</li>';
  }).join('');

  return '<nav class="breadcrumb-bar" aria-label="Διαδρομή πλοήγησης">' +
    '<div class="container"><ol>' + items + '</ol></div></nav>';
}

function breadcrumbSchema(crumbs, canonical) {
  if (!crumbs || crumbs.length < 2) return null;
  return {
    '@type': 'BreadcrumbList',
    '@id': canonical + '#breadcrumb',
    itemListElement: crumbs.map((c, i) => {
      const item = { '@type': 'ListItem', position: i + 1, name: c.name };
      if (c.href) item.item = c.href === 'index.html' ? SITE + '/' : SITE + '/' + c.href;
      return item;
    })
  };
}

/* ============================================================
   FOOTER
   ============================================================ */

function renderFooter(b) {
  const serviceLinks = D.services.map(s =>
    '<li><a href="' + b + 'services/' + s.slug + '.html">' + esc(s.navLabel) + '</a></li>'
  ).join('');

  const companyLinks = [
    ['about.html', 'Σχετικά με εμάς'],
    ['portfolio.html', 'Έργα'],
    ['faq.html', 'Συχνές ερωτήσεις'],
    ['blog/index.html', 'Άρθρα'],
    ['contact.html', 'Επικοινωνία']
  ].map(([href, label]) => '<li><a href="' + b + href + '">' + esc(label) + '</a></li>').join('');

  const socials = [
    ['github', D.social.github, 'GitHub'],
    ['linkedin', D.social.linkedin, 'LinkedIn']
  ].filter(s => s[1]);

  const socialHtml = socials.length
    ? '<div class="footer-social">' + socials.map(([ic, url, label]) =>
        '<a href="' + esc(url) + '" rel="noopener noreferrer" target="_blank" ' +
        'aria-label="' + esc(label) + ' (ανοίγει σε νέα καρτέλα)">' + icon(ic) + '</a>'
      ).join('') + '</div>'
    : '';

  const legalBits = ['<b>' + esc(D.business.legalName) + '</b> — ' + esc(D.business.legalForm),
    'ΑΦΜ ' + esc(D.business.vatId) + ' · ΔΟΥ ' + esc(D.business.taxOffice)];
  if (D.business.gemi) legalBits.push('ΓΕΜΗ ' + esc(D.business.gemi));

  return '<footer class="site-footer">' +
    '<div class="container">' +
    '<div class="row g-3 g-lg-4">' +

    /* Στήλη 1 — μάρκα */
    '<div class="col-lg-4 col-md-6">' +
    '<a class="footer-brand" href="' + b + 'index.html">' +
    '<span class="brand-mark" aria-hidden="true">' + icon('code-slash') + '</span>gpcode</a>' +
    '<p class="footer-about">' + esc(D.business.tagline) + '. Ανάπτυξη σε ASP.NET Core, ' +
    'Angular και SQL, με σαφή άδεια χρήσης του τελικού αποτελέσματος.</p>' +
    '<div class="footer-legal-box">' + legalBits.join('<br>') + '</div>' +
    socialHtml +
    '</div>' +

    /* Στήλη 2 — υπηρεσίες */
    '<div class="col-lg-3 col-md-6"><h2>Υπηρεσίες</h2>' +
    '<ul class="footer-links">' + serviceLinks + '</ul></div>' +

    /* Στήλη 3 — εταιρεία */
    '<div class="col-lg-2 col-6"><h2>Εταιρεία</h2>' +
    '<ul class="footer-links">' + companyLinks + '</ul></div>' +

    /* Στήλη 4 — επικοινωνία */
    '<div class="col-lg-3 col-6"><h2>Επικοινωνία</h2>' +
    '<ul class="footer-contact">' +
    '<li>' + icon('telephone-fill') + '<a href="tel:' + esc(D.contact.phone) + '">' +
    esc(D.contact.phoneDisplay) + '</a></li>' +
    '<li>' + icon('envelope-fill') + '<a href="mailto:' + esc(D.contact.email) + '">' +
    esc(D.contact.email) + '</a></li>' +
    '<li>' + icon('geo-alt-fill') + '<span>' + esc(D.business.city) + ', ' +
    esc(D.business.region) + '</span></li>' +
    '<li>' + icon('globe2') + '<span>Εξ αποστάσεως σε ' + esc(D.contact.areaRemote) + '</span></li>' +
    '</ul></div>' +

    '</div>' +

    '<div class="footer-bottom">' +
    '<span>© ' + new Date().getFullYear() + ' gpcode — ' + esc(D.business.legalName) + '</span>' +
    '<nav aria-label="Νομικές πληροφορίες">' +
    '<a href="' + b + 'privacy.html">Πολιτική Απορρήτου</a>' +
    '<a href="' + b + 'cookies.html">Cookies</a>' +
    '<a href="' + b + 'terms.html">Όροι Χρήσης</a>' +
    '<button type="button" data-cookie-settings>Ρυθμίσεις cookies</button>' +
    '</nav></div>' +

    '</div></footer>';
}

/* ============================================================
   ΑΙΩΡΟΥΜΕΝΕΣ ΕΝΕΡΓΕΙΕΣ & COOKIE BANNER
   ============================================================ */

function renderFloatActions() {
  return '<div class="float-actions">' +
    '<a class="fab fab-call" href="tel:' + esc(D.contact.phone) + '" ' +
    'aria-label="Τηλεφωνική κλήση στο ' + esc(D.contact.phoneDisplay) + '">' +
    icon('telephone-fill') + '</a>' +
    '<button type="button" class="fab fab-top" aria-label="Επιστροφή στην κορυφή">' +
    icon('arrow-up') + '</button>' +
    '</div>';
}

function renderCookieBanner(b) {
  return '<div class="cookie-banner" id="cookie-banner" role="dialog" aria-modal="false" ' +
    'aria-labelledby="cookie-title" aria-describedby="cookie-desc" aria-hidden="true">' +
    '<h2 id="cookie-title">Χρησιμοποιούμε cookies</h2>' +
    '<p id="cookie-desc">Τα απαραίτητα cookies κρατούν τη σελίδα λειτουργική. ' +
    'Τα υπόλοιπα φορτώνουν μόνο αν συμφωνήσετε. Δείτε την ' +
    '<a href="' + b + 'cookies.html">πολιτική cookies</a>.</p>' +

    '<div class="cookie-actions">' +
    '<button type="button" class="btn btn-brand btn-sm-cta" id="cookie-accept-all">Αποδοχή όλων</button>' +
    '<button type="button" class="btn btn-outline-brand btn-sm-cta" id="cookie-reject">Μόνο τα απαραίτητα</button>' +
    '<button type="button" class="btn btn-outline-brand btn-sm-cta" id="cookie-customize" ' +
    'aria-expanded="false" aria-controls="cookie-prefs">Προσαρμογή</button>' +
    '</div>' +

    '<div class="cookie-prefs" id="cookie-prefs" hidden>' +
    '<div class="cookie-opt">' +
    '<input type="checkbox" id="cookie-necessary" checked disabled>' +
    '<div><label for="cookie-necessary">Απαραίτητα</label>' +
    '<p>Χρειάζονται για τη βασική λειτουργία και τη μνήμη της επιλογής σας. Πάντα ενεργά.</p></div>' +
    '</div>' +
    '<div class="cookie-opt">' +
    '<input type="checkbox" id="cookie-stats">' +
    '<div><label for="cookie-stats">Στατιστικά</label>' +
    '<p>Ανώνυμη μέτρηση επισκεψιμότητας, ώστε να ξέρουμε ποιες σελίδες βοηθούν.</p></div>' +
    '</div>' +
    '<div class="cookie-opt">' +
    '<input type="checkbox" id="cookie-marketing">' +
    '<div><label for="cookie-marketing">Μάρκετινγκ</label>' +
    '<p>Μέτρηση αποτελεσματικότητας διαφημίσεων. Ανενεργά εξ ορισμού.</p></div>' +
    '</div>' +
    '<button type="button" class="btn btn-brand btn-sm-cta" id="cookie-save">Αποθήκευση επιλογών</button>' +
    '</div></div>';
}

/* ============================================================
   ΤΟ LAYOUT
   ============================================================ */

function layout(o) {
  const b = o.absoluteLinks ? '/' : base(o.depth || 0);
  const canonical = abs(o.slug);
  const ogImage = SITE + '/' + (o.ogImage || D.images.ogDefault.src);

  /* — JSON-LD ως ενιαίο @graph: τα cross-@id references λύνονται αξιόπιστα — */
  const graph = (o.graph || []).slice();
  const crumbNode = breadcrumbSchema(o.breadcrumbs, canonical);
  if (crumbNode) graph.push(crumbNode);

  const jsonLd = graph.length
    ? '<script type="application/ld+json">' +
      JSON.stringify({ '@context': 'https://schema.org', '@graph': graph })
        .replace(/</g, '\\u003c') +
      '</script>'
    : '';

  /* — Στυλ: ένα αρχείο στην παραγωγή, δύο στο development — */
  const styles = PROD
    ? '<link rel="stylesheet" href="' + b + 'css/app.min.css">'
    : '<link rel="stylesheet" href="' + b + 'css/bootstrap.min.css">' +
      '<link rel="stylesheet" href="' + b + 'css/style.css">';

  const bodyHtml =
    renderNav(b, o.navId) +
    renderBreadcrumbs(o.breadcrumbs, b) +
    '<main id="main-content">' + o.content + '</main>' +
    renderFooter(b) +
    renderFloatActions() +
    renderCookieBanner(b);

  /* — Ενσωμάτωση ΜΟΝΟ των εικονιδίων που χρησιμοποιεί η σελίδα — */
  const used = new Set();
  bodyHtml.replace(/href="#i-([^"]+)"/g, (m, n) => { used.add(n); return m; });
  const missingIcons = [...used].filter(n => !SYMBOLS[n]);
  if (missingIcons.length) {
    throw new Error('[' + o.slug + '] Άγνωστα εικονίδια: ' + missingIcons.join(', ') +
      ' — προσθέστε τα στο build/setup-assets.js και τρέξτε npm run setup:assets');
  }
  const sprite = used.size
    ? '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">' +
      [...used].map(n => SYMBOLS[n]).join('') + '</svg>'
    : '';

  const scripts = ['js/nav.js', 'js/main.js', 'js/cookie-consent.js']
    .concat(o.scripts || [])
    .map(s => '<script src="' + b + jsFile(s) + '" defer></script>').join('');

  return '<!DOCTYPE html>\n' +
    '<html lang="el">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(o.title) + '</title>\n' +
    '<meta name="description" content="' + esc(o.description) + '">\n' +
    '<link rel="canonical" href="' + canonical + '">\n' +
    '<meta name="robots" content="' + (o.noindex ? 'noindex, follow' : 'index, follow, max-image-preview:large') + '">\n' +
    '<meta name="theme-color" content="#070B14">\n' +
    '<meta name="color-scheme" content="dark">\n' +
    '<meta name="author" content="' + esc(D.business.legalName) + '">\n' +

    '\n<!-- Open Graph -->\n' +
    '<meta property="og:type" content="' + (o.ogType || 'website') + '">\n' +
    '<meta property="og:site_name" content="gpcode">\n' +
    '<meta property="og:locale" content="el_GR">\n' +
    '<meta property="og:title" content="' + esc(o.title) + '">\n' +
    '<meta property="og:description" content="' + esc(o.description) + '">\n' +
    '<meta property="og:url" content="' + canonical + '">\n' +
    '<meta property="og:image" content="' + ogImage + '">\n' +
    '<meta property="og:image:width" content="1200">\n' +
    '<meta property="og:image:height" content="630">\n' +
    '<meta property="og:image:alt" content="' + esc(D.images.ogDefault.alt) + '">\n' +

    '\n<!-- Twitter -->\n' +
    '<meta name="twitter:card" content="summary_large_image">\n' +
    '<meta name="twitter:title" content="' + esc(o.title) + '">\n' +
    '<meta name="twitter:description" content="' + esc(o.description) + '">\n' +
    '<meta name="twitter:image" content="' + ogImage + '">\n' +

    '\n<!-- Εικονίδια & PWA -->\n' +
    '<link rel="icon" href="' + b + 'favicon/favicon.svg" type="image/svg+xml">\n' +
    '<link rel="icon" href="' + b + 'favicon/favicon-32.png" sizes="32x32" type="image/png">\n' +
    '<link rel="apple-touch-icon" href="' + b + 'favicon/favicon-180.png">\n' +
    '<link rel="manifest" href="' + b + 'manifest.webmanifest">\n' +
    '<meta name="msapplication-config" content="' + b + 'browserconfig.xml">\n' +

    '\n<!-- Γραμματοσειρές: preload των subsets που χρειάζονται στο first paint -->\n' +
    '<link rel="preload" href="' + b + 'fonts/inter-400-greek.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="preload" href="' + b + 'fonts/inter-800-greek.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="preload" href="' + b + 'fonts/inter-400-latin.woff2" as="font" type="font/woff2" crossorigin>\n' +

    '\n' + styles + '\n' +

    /* Δίχτυ ασφαλείας: τα .reveal ξεκινούν με opacity:0 και τα εμφανίζει το
       main.js. Αν το JavaScript είναι απενεργοποιημένο ή αποτύχει να φορτώσει,
       το περιεχόμενο θα έμενε αόρατο. */
    '<noscript><style>.reveal{opacity:1!important;transform:none!important}</style></noscript>\n' +

    '<meta name="google-site-verification" content="6nNs4_RrRZJVhavTmr-ov50b7zYAi0oXVNGuQY7neh8">\n' +

    (jsonLd ? '\n' + jsonLd + '\n' : '') +
    '</head>\n' +
    '<body' + (o.bodyClass ? ' class="' + o.bodyClass + '"' : '') + '>\n' +
    '<a class="skip-link" href="#main-content">Μετάβαση στο περιεχόμενο</a>\n' +
    sprite + '\n' +
    bodyHtml + '\n' +
    scripts + '\n' +
    '</body>\n</html>\n';
}

module.exports = { layout, icon, esc, base, abs, NAV, D, SITE, PROD };
