/**
 * components.js — Επαναχρησιμοποιήσιμα κομμάτια HTML και οι κόμβοι JSON-LD.
 *
 * Κανόνας για τα schemas: κάθε κόμβος ορίζεται ΠΛΗΡΩΣ ακριβώς μία φορά
 * σε όλο το site. Παντού αλλού εμφανίζεται μόνο ως αναφορά {'@id': '…'}.
 * Το build/generate.js απορρίπτει την παραγωγή αν παραβιαστεί.
 */
'use strict';

const { icon, esc, abs, D, SITE } = require('./layout.js');

/* Σταθερά @id — μία πηγή αλήθειας για τις διασταυρούμενες αναφορές */
const ID = {
  org: SITE + '/#organization',
  website: SITE + '/#website',
  person: SITE + '/about.html#person',
  blog: SITE + '/blog/#blog'
};

const REF = id => ({ '@id': id });

/* ============================================================
   ΕΠΙΚΕΦΑΛΙΔΕΣ ΕΝΟΤΗΤΩΝ
   ============================================================ */

function sectionHead(eyebrow, title, lead, opts) {
  const o = opts || {};
  const cls = 'section-head' + (o.center ? ' text-center' : '');
  const tag = o.h1 ? 'h1' : 'h2';
  return '<div class="' + cls + (o.reveal === false ? '' : ' reveal') + '">' +
    (eyebrow ? '<span class="eyebrow">' + esc(eyebrow) + '</span>' : '') +
    '<' + tag + (o.id ? ' id="' + o.id + '"' : '') + '>' + esc(title) + '</' + tag + '>' +
    (lead ? '<p class="lead">' + lead + '</p>' : '') +
    '</div>';
}

/* ============================================================
   ΕΙΚΟΝΕΣ
   ============================================================
   Πάντα με ρητά width/height ώστε ο browser να δεσμεύει τον χώρο
   πριν φορτώσει η εικόνα — μηδέν μετατόπιση διάταξης (CLS).
   Όλες lazy: καμία δεν βρίσκεται πάνω από το πρώτο ορατό μέρος.
   ============================================================ */

function mediaFrame(b, key, opts) {
  const o = opts || {};
  const img = D.images[key];
  if (!img || !img.src) return '';

  return '<figure class="mb-0' + (o.reveal === false ? '' : ' reveal') + '">' +
    '<div class="media-frame' + (o.tall ? ' tall' : '') + '">' +
    '<img src="' + b + img.src + '" alt="' + esc(img.alt) + '" ' +
    'width="' + img.width + '" height="' + img.height + '" ' +
    'loading="lazy" decoding="async">' +
    '</div>' +
    (o.caption ? '<figcaption class="media-caption">' + esc(o.caption) + '</figcaption>' : '') +
    '</figure>';
}

/* ============================================================
   ΚΑΡΤΕΣ ΥΠΗΡΕΣΙΩΝ
   ============================================================ */

function serviceCards(b, opts) {
  const o = opts || {};
  const excluded = o.exclude ? [].concat(o.exclude) : [];
  const list = excluded.length ? D.services.filter(s => excluded.indexOf(s.slug) === -1) : D.services;
  const limit = o.limit ? list.slice(0, o.limit) : list;

  return '<div class="row g-3">' + limit.map((s, i) =>
    '<div class="col-lg-4 col-md-6">' +
    '<article class="card-modern reveal reveal-d' + (i % 3) + '">' +
    '<span class="card-icon" aria-hidden="true">' + icon(s.icon) + '</span>' +
    '<h3>' + esc(s.name) + '</h3>' +
    '<p>' + esc(s.cardText) + '</p>' +
    '<a class="card-link stretch" href="' + b + 'services/' + s.slug + '.html">' +
    'Δείτε την υπηρεσία' + icon('arrow-right', 'arw') + '</a>' +
    '</article></div>'
  ).join('') + '</div>';
}

/* ============================================================
   ΤΕΧΝΟΛΟΓΙΕΣ
   ============================================================ */

function techStack() {
  return '<div class="row g-3">' + D.technologies.map((g, i) =>
    '<div class="col-lg-3 col-md-6">' +
    '<div class="tech-group reveal reveal-d' + (i % 3) + '">' +
    '<div class="tech-group-head">' + icon(g.icon) + '<h3>' + esc(g.group) + '</h3></div>' +
    g.items.map(it =>
      '<div class="tech-item">' +
      '<span class="tech-name">' + esc(it.name) + '</span>' +
      '<p class="tech-why">' + esc(it.why) + '</p>' +
      '</div>'
    ).join('') +
    '</div></div>'
  ).join('') + '</div>';
}

/* ============================================================
   ΔΙΑΔΙΚΑΣΙΑ
   ============================================================ */

function processSteps() {
  return '<div class="process-grid">' + D.process.map((p, i) =>
    '<div class="process-step reveal reveal-d' + (i % 3) + '">' +
    '<span class="process-num" aria-hidden="true">' + (i + 1) + '</span>' +
    '<h3>' + esc(p.title) + '</h3>' +
    '<p class="process-line"><b>Τι παίρνετε</b>' + esc(p.youGet) + '</p>' +
    '<p class="process-line"><b>Τι δίνετε</b>' + esc(p.youGive) + '</p>' +
    '</div>'
  ).join('') + '</div>';
}

/* ============================================================
   ΝΟΥΜΕΡΑ
   Κάθε τιμή υπάρχει ήδη στο HTML — σωστή χωρίς JS και για crawlers.
   Το main.js απλώς την κινεί όταν μπει στο viewport.
   ============================================================ */

function statsRow() {
  return '<div class="stats-grid">' + D.stats.map(s =>
    '<div class="stat reveal">' +
    '<div class="stat-value"><span data-count="' + esc(s.value) + '">' + esc(s.value) + '</span>' +
    esc(s.suffix) + '</div>' +
    '<div class="stat-label">' + esc(s.label) + '</div>' +
    '<p class="stat-note">' + esc(s.note) + '</p>' +
    '</div>'
  ).join('') + '</div>';
}

/* ============================================================
   ΔΕΣΜΕΥΣΕΙΣ / ΜΑΡΤΥΡΙΕΣ
   Όσο ο πίνακας testimonials είναι κενός, εμφανίζονται οι γραπτές
   δεσμεύσεις. Δεν στήνεται άδειο carousel και δεν εφευρίσκονται
   κριτικές — αυτό θα υπονόμευε ακριβώς το E-E-A-T που χτίζουμε.
   ============================================================ */

function socialProof() {
  if (D.testimonials.length) {
    return '<div class="row g-3">' + D.testimonials.map((t, i) =>
      '<div class="col-lg-4 col-md-6">' +
      '<figure class="testimonial reveal reveal-d' + (i % 3) + '">' +
      '<blockquote>' + esc(t.quote) + '</blockquote>' +
      '<figcaption><b>' + esc(t.author) + '</b>' +
      esc([t.role, t.company].filter(Boolean).join(', ')) + '</figcaption>' +
      '</figure></div>'
    ).join('') + '</div>';
  }

  return '<div class="row g-3">' + D.guarantees.map((g, i) =>
    '<div class="col-lg-6">' +
    '<div class="guarantee reveal reveal-d' + (i % 3) + '">' +
    '<span class="card-icon accent" aria-hidden="true">' + icon(g.icon) + '</span>' +
    '<div><h3>' + esc(g.title) + '</h3><p>' + esc(g.text) + '</p></div>' +
    '</div></div>'
  ).join('') + '</div>';
}

function proofHeading() {
  return D.testimonials.length
    ? { eyebrow: 'Μαρτυρίες', title: 'Τι λένε οι πελάτες μας' }
    : { eyebrow: 'Δεσμεύσεις', title: 'Οι δεσμεύσεις μας, γραπτώς' };
}

/* ============================================================
   ΑΡΧΕΤΥΠΑ ΕΡΓΩΝ
   ============================================================ */

function archetypeCards(b, limit) {
  const list = limit ? D.projectArchetypes.slice(0, limit) : D.projectArchetypes;
  return '<div class="row g-3">' + list.map((a, i) => {
    const svc = D.services.find(s => s.slug === a.service);
    return '<div class="col-lg-4 col-md-6">' +
      '<article class="archetype reveal reveal-d' + (i % 3) + '">' +
      '<span class="card-icon" aria-hidden="true">' + icon(a.icon) + '</span>' +
      '<h3>' + esc(a.title) + '</h3>' +
      '<div class="archetype-row">' +
      '<span class="archetype-tag problem">Πρόβλημα</span>' +
      '<p>' + esc(a.problem) + '</p></div>' +
      '<div class="archetype-row">' +
      '<span class="archetype-tag solution">Λύση</span>' +
      '<p>' + esc(a.solution) + '</p></div>' +
      '<a class="card-link stretch" href="' + b + 'services/' + a.service + '.html">' +
      esc(svc.navLabel) + icon('arrow-right', 'arw') + '</a>' +
      '</article></div>';
  }).join('') + '</div>';
}

/* ============================================================
   FAQ
   ============================================================ */

/** Επίπεδη λίστα από όλες τις ομάδες του data.faqGroups. */
function allFaqs() {
  return D.faqGroups.reduce((acc, g) => acc.concat(g.items), []);
}

/** Accordion χωρίς ομαδοποίηση (αρχική, σελίδες υπηρεσιών). */
function faqAccordion(items) {
  return '<div class="faq-list">' + items.map(f =>
    '<details class="faq-item reveal">' +
    '<summary>' + esc(f.q) + '</summary>' +
    '<div class="faq-answer"><p>' + esc(f.a) + '</p></div>' +
    '</details>'
  ).join('') + '</div>';
}

/** Accordion με τίτλους ομάδων (faq.html). */
function faqGrouped() {
  return '<div class="faq-list">' + D.faqGroups.map(g =>
    '<h2 class="faq-group-title">' + icon(g.icon) + esc(g.group) + '</h2>' +
    g.items.map(f =>
      '<details class="faq-item" id="faq-' + esc(f.id) + '">' +
      '<summary><h3 class="h6 mb-0 d-inline">' + esc(f.q) + '</h3></summary>' +
      '<div class="faq-answer"><p>' + f.a + '</p></div>' +
      '</details>'
    ).join('')
  ).join('') + '</div>';
}

/* ============================================================
   CTA BAND
   ============================================================ */

function ctaBand(b, opts) {
  const o = opts || {};
  return '<div class="cta-band reveal">' +
    '<h2>' + esc(o.title || 'Πείτε μας τι θέλετε να φτιάξετε') + '</h2>' +
    '<p>' + esc(o.text || 'Περιγράψτε το έργο σας και θα λάβετε γραπτή προσφορά με ' +
      'συγκεκριμένο κόστος και χρονοδιάγραμμα.') + '</p>' +
    '<div class="cta-actions">' +
    '<a class="btn btn-light-solid btn-lg-cta" href="' + b + 'contact.html">' +
    icon('send-fill') + 'Ζητήστε προσφορά</a>' +
    '<a class="btn btn-ghost-light btn-lg-cta" href="tel:' + esc(D.contact.phone) + '">' +
    icon('telephone-fill') + esc(D.contact.phoneDisplay) + '</a>' +
    '</div>' +
    '<p class="cta-fineprint">' + esc(o.fineprint ||
      'Μια πρώτη συζήτηση δεν κοστίζει και δεν δεσμεύει. Απάντηση εντός ' +
      D.contact.responseHours + ' ωρών.') + '</p>' +
    '</div>';
}

/** Μικρό CTA για το τέλος άρθρων και σελίδων υπηρεσιών. */
function inlineCta(b, text, href, label) {
  return '<div class="callout accent">' +
    '<p>' + text + ' <a href="' + b + href + '"><b>' + esc(label) + '</b></a></p>' +
    '</div>';
}

/* ============================================================
   ΣΧΕΤΙΚΑ ΑΡΘΡΑ
   ============================================================ */

function postCard(b, post, i) {
  const cat = D.blogCategories[post.category];
  const thumb = post.image && D.images[post.image];

  /* Η μικρογραφία είναι διακοσμητική — το εικονίδιο κατηγορίας από πάνω
     μεταφέρει την πληροφορία, οπότε η εικόνα μένει aria-hidden. */
  const thumbInner = thumb
    ? '<img src="' + b + thumb.src + '" alt="" width="' + thumb.width + '" height="' +
      thumb.height + '" loading="lazy" decoding="async">' + icon(iconForCategory(post.category))
    : icon(iconForCategory(post.category));

  return '<div class="col-lg-3 col-md-6">' +
    '<article class="post-card reveal reveal-d' + ((i || 0) % 3) + '">' +
    '<div class="post-thumb" aria-hidden="true">' + thumbInner + '</div>' +
    '<div class="post-body">' +
    '<div class="post-meta">' +
    '<span class="post-cat">' + esc(cat) + '</span>' +
    '<time datetime="' + post.datePublished + '">' + formatDate(post.datePublished) + '</time>' +
    '<span>·</span><span>' + post.readingMinutes + ' λεπτά</span>' +
    '</div>' +
    '<h3><a href="' + b + 'blog/' + post.slug + '.html">' + esc(post.title) + '</a></h3>' +
    '<p>' + esc(post.excerpt) + '</p>' +
    '</div></article></div>';
}

function iconForCategory(cat) {
  return {
    'web-development': 'code-slash',
    'dotnet': 'braces',
    'databases': 'database',
    'performance': 'speedometer2'
  }[cat] || 'journal-text';
}

const MONTHS = ['Ιανουαρίου', 'Φεβρουαρίου', 'Μαρτίου', 'Απριλίου', 'Μαΐου', 'Ιουνίου',
  'Ιουλίου', 'Αυγούστου', 'Σεπτεμβρίου', 'Οκτωβρίου', 'Νοεμβρίου', 'Δεκεμβρίου'];

function formatDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return d + ' ' + MONTHS[m - 1] + ' ' + y;
}

/* ============================================================
   JSON-LD
   ============================================================ */

/**
 * Organization — ορίζεται ΜΟΝΟ στην index.html.
 *
 * Σκόπιμα ΔΕΝ χρησιμοποιούμε LocalBusiness/ProfessionalService: και τα δύο
 * προϋποθέτουν streetAddress, ωράριο και επαληθεύσιμη έδρα. Χωρίς οδό και
 * χωρίς Google Business Profile θα ήταν ισχυρισμός που δεν στηρίζεται —
 * μηδενικό όφελος και ρίσκο. Μόλις συμπληρωθούν business.street και
 * business.postalCode, η αναβάθμιση σε ProfessionalService είναι ασφαλής.
 */
function organizationNode() {
  const addr = {
    '@type': 'PostalAddress',
    addressLocality: D.business.city,
    addressRegion: D.business.region,
    addressCountry: D.business.country
  };
  if (D.business.street) addr.streetAddress = D.business.street;
  if (D.business.postalCode) addr.postalCode = D.business.postalCode;

  const node = {
    '@type': 'Organization',
    '@id': ID.org,
    name: D.business.name,
    legalName: D.business.legalName,
    url: SITE + '/',
    description: D.business.description,
    email: D.contact.email,
    telephone: D.contact.phone,
    vatID: D.business.vatIdIntl,
    taxID: D.business.vatId,
    address: addr,
    areaServed: [
      { '@type': 'City', name: D.contact.areaLocal },
      { '@type': 'Country', name: 'Ελλάδα' }
    ],
    knowsLanguage: ['el', 'en'],
    founder: REF(ID.person),
    logo: {
      '@type': 'ImageObject',
      url: SITE + '/favicon/icon-512.png',
      width: 512, height: 512
    },
    image: SITE + '/' + D.images.ogDefault.src,
    contactPoint: {
      '@type': 'ContactPoint',
      '@id': SITE + '/#contactpoint',
      contactType: 'customer support',
      telephone: D.contact.phone,
      email: D.contact.email,
      availableLanguage: ['Greek', 'English'],
      areaServed: 'GR'
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Υπηρεσίες ανάπτυξης λογισμικού',
      itemListElement: D.services.map(s => REF(abs('services/' + s.slug + '.html') + '#service'))
    }
  };

  const sameAs = [D.social.github, D.social.linkedin, D.social.x].filter(Boolean);
  if (sameAs.length) node.sameAs = sameAs;

  /* ΣΚΟΠΙΜΑ ΑΠΟΝΤΑ μέχρι να υπάρξουν επαληθεύσιμα δεδομένα:
     foundingDate, numberOfEmployees, aggregateRating, review, openingHours. */
  return node;
}

function websiteNode() {
  return {
    '@type': 'WebSite',
    '@id': ID.website,
    url: SITE + '/',
    name: 'gpcode',
    description: D.business.description,
    inLanguage: 'el-GR',
    publisher: REF(ID.org)
  };
}

function personNode() {
  const node = {
    '@type': 'Person',
    '@id': ID.person,
    name: 'Γεώργιος Πατσιαλής',
    jobTitle: 'Software Developer',
    worksFor: REF(ID.org),
    url: SITE + '/about.html',
    knowsAbout: [
      '.NET', 'ASP.NET Core', 'C#', 'Angular', 'TypeScript',
      'SQL Server', 'PostgreSQL', 'Oracle PL/SQL',
      'REST API design', 'Database design', 'Software architecture',
      'Web performance optimization'
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: D.business.city,
      addressRegion: D.business.region,
      addressCountry: D.business.country
    }
  };
  const sameAs = [D.social.github, D.social.linkedin].filter(Boolean);
  if (sameAs.length) node.sameAs = sameAs;
  if (D.images.founder.src) node.image = SITE + '/' + D.images.founder.src;
  return node;
}

function webPageNode(slug, name, description, type) {
  return {
    '@type': type || 'WebPage',
    '@id': abs(slug) + '#webpage',
    url: abs(slug),
    name: name,
    description: description,
    inLanguage: 'el-GR',
    isPartOf: REF(ID.website)
  };
}

function serviceNode(service) {
  const url = abs('services/' + service.slug + '.html');
  return {
    '@type': 'Service',
    '@id': url + '#service',
    name: service.name,
    serviceType: service.primaryKeyword,
    description: service.description,
    url: url,
    provider: REF(ID.org),
    areaServed: [
      { '@type': 'City', name: D.contact.areaLocal },
      { '@type': 'Country', name: 'Ελλάδα' }
    ],
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: abs('contact.html'),
      servicePhone: D.contact.phone
    }
  };
}

function faqNode(slug, items) {
  return {
    '@type': 'FAQPage',
    '@id': abs(slug) + '#faq',
    mainEntity: items.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: stripTags(f.a) }
    }))
  };
}

function itemListNode(slug, urls, name) {
  return {
    '@type': 'ItemList',
    '@id': abs(slug) + '#itemlist',
    name: name,
    numberOfItems: urls.length,
    itemListElement: urls.map((u, i) => ({
      '@type': 'ListItem', position: i + 1, url: u
    }))
  };
}

function blogPostingNode(post) {
  const url = abs('blog/' + post.slug + '.html');
  return {
    '@type': 'BlogPosting',
    '@id': url + '#article',
    headline: post.title,
    description: post.description,
    url: url,
    datePublished: post.datePublished,
    dateModified: post.dateModified || post.datePublished,
    author: REF(ID.person),
    publisher: REF(ID.org),
    mainEntityOfPage: REF(url + '#webpage'),
    articleSection: D.blogCategories[post.category],
    keywords: post.keywords.join(', '),
    inLanguage: 'el-GR',
    image: SITE + '/' + D.images.ogDefault.src,
    isPartOf: REF(ID.blog)
  };
}

function blogNode() {
  return {
    '@type': 'Blog',
    '@id': ID.blog,
    url: abs('blog/index.html'),
    name: 'Άρθρα gpcode',
    description: 'Τεχνικά άρθρα για κατασκευή ιστοσελίδων, .NET, βάσεις δεδομένων και απόδοση.',
    inLanguage: 'el-GR',
    publisher: REF(ID.org)
  };
}

function contactPageNode(slug, name, description) {
  return {
    '@type': 'ContactPage',
    '@id': abs(slug) + '#webpage',
    url: abs(slug),
    name: name,
    description: description,
    inLanguage: 'el-GR',
    isPartOf: REF(ID.website),
    mainEntity: REF(ID.org)
  };
}

function stripTags(html) {
  return String(html).replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

module.exports = {
  ID, REF, mediaFrame,
  sectionHead, serviceCards, techStack, processSteps, statsRow,
  socialProof, proofHeading, archetypeCards,
  allFaqs, faqAccordion, faqGrouped,
  ctaBand, inlineCta, postCard, formatDate, iconForCategory,
  organizationNode, websiteNode, personNode, webPageNode, serviceNode,
  faqNode, itemListNode, blogPostingNode, blogNode, contactPageNode, stripTags
};
