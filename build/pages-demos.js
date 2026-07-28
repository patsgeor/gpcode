/**
 * pages-demos.js — Οι σελίδες-δείγματα για τα πακέτα landing page.
 *
 * Δύο κλάδοι (ιατρείο, συνεργείο) × δύο επίπεδα (απλό, pro) = 4 σελίδες.
 * Ο ίδιος κλάδος σε δύο επίπεδα είναι το ζητούμενο: ο πελάτης βλέπει
 * ακριβώς τι προσθέτουν τα επιπλέον 200€.
 *
 * Όλες noindex, εκτός sitemap, χωρίς structured data.
 */
'use strict';

const { esc, D } = require('./templates/layout.js');
const { demoLayout } = require('./templates/demo-layout.js');

/* ============================================================
   ΠΕΡΙΕΧΟΜΕΝΟ ΑΝΑ ΚΛΑΔΟ
   Κρατιέται γενικό και χωρίς υποσχέσεις αποτελέσματος — είναι
   επίδειξη σχεδίασης, όχι διαφημιστικό κείμενο πραγματικής
   επιχείρησης.
   ============================================================ */
const SECTORS = {
  iatreio: {
    badge: 'Ραντεβού και αυθημερόν',
    h1: 'Παθολογικό ιατρείο στο κέντρο της Αθήνας',
    lead: 'Τακτική παρακολούθηση, προληπτικός έλεγχος και αντιμετώπιση ' +
      'καθημερινών περιστατικών, με ραντεβού που τηρείται.',
    ctaMain: 'Κλείστε ραντεβού',
    services: [
      ['Γενική παθολογία', 'Εκτίμηση συμπτωμάτων, κλινική εξέταση και ' +
        'καθοδήγηση για τα επόμενα βήματα.'],
      ['Προληπτικός έλεγχος', 'Προγραμματισμένος έλεγχος ρουτίνας με ' +
        'παραπομπή για εργαστηριακές εξετάσεις όπου χρειάζεται.'],
      ['Παρακολούθηση', 'Τακτική παρακολούθηση χρόνιων καταστάσεων και ' +
        'προσαρμογή αγωγής σε συνεννόηση με τον θεράποντα.'],
      ['Ιατρικές βεβαιώσεις', 'Έκδοση βεβαιώσεων για εργασία, άθληση ή ' +
        'σχολείο κατά την επίσκεψη.']
    ],
    why: [
      'Ραντεβού με ακρίβεια — χωρίς αναμονή στην αίθουσα',
      'Χρόνος επίσκεψης που επαρκεί για ερωτήσεις',
      'Ηλεκτρονική συνταγογράφηση επιτόπου',
      'Επικοινωνία και τηλεφωνικά για απλά ερωτήματα'
    ],
    hours: [['Δευτέρα – Παρασκευή', '09:00 – 20:00'], ['Σάββατο', '10:00 – 14:00'],
      ['Κυριακή', 'Κλειστά']],
    hoursShort: '09:00 – 20:00',
    faq: [
      ['Χρειάζεται ραντεβού;', 'Ναι, η επίσκεψη γίνεται κατόπιν ραντεβού ώστε να ' +
        'τηρείται η ώρα σας. Για επείγοντα περιστατικά καλέστε μας.'],
      ['Δέχεστε ΕΟΠΥΥ;', 'Σε αυτό το δείγμα η απάντηση θα περιέγραφε τη συνεργασία ' +
        'με ασφαλιστικά ταμεία και τον τρόπο κάλυψης.'],
      ['Πόσο διαρκεί η επίσκεψη;', 'Ο χρόνος που δεσμεύεται ανά ραντεβού επαρκεί ' +
        'για λήψη ιστορικού, εξέταση και συζήτηση.'],
      ['Υπάρχει πρόσβαση για ΑμεΑ;', 'Η πληροφορία προσβασιμότητας του χώρου θα ' +
        'αναγραφόταν εδώ, μαζί με οδηγίες στάθμευσης.']
    ],
    formTitle: 'Ζητήστε ραντεβού',
    formNote: 'Θα επικοινωνήσουμε για να επιβεβαιώσουμε ημέρα και ώρα.'
  },

  synergeio: {
    badge: 'Έλεγχος αυθημερόν',
    h1: 'Service και επισκευές αυτοκινήτων',
    lead: 'Τακτικό service, διάγνωση βλαβών και επισκευές με γραπτή ' +
      'προσφορά πριν ξεκινήσει οποιαδήποτε εργασία.',
    ctaMain: 'Ζητήστε προσφορά',
    services: [
      ['Τακτικό service', 'Λάδια, φίλτρα, υγρά και έλεγχος σημείων ασφαλείας ' +
        'σύμφωνα με το πρόγραμμα του κατασκευαστή.'],
      ['Διάγνωση βλαβών', 'Ηλεκτρονικός έλεγχος και εντοπισμός της αιτίας πριν ' +
        'προταθεί οποιαδήποτε αντικατάσταση.'],
      ['Φρένα και ανάρτηση', 'Έλεγχος και αντικατάσταση δισκόπλακων, τακακιών, ' +
        'αμορτισέρ και ελατηρίων.'],
      ['Προετοιμασία ΚΤΕΟ', 'Προληπτικός έλεγχος των σημείων που ελέγχονται, ' +
        'ώστε να περάσετε με την πρώτη.']
    ],
    why: [
      'Γραπτή προσφορά πριν από κάθε εργασία',
      'Ανταλλακτικά με απόδειξη και εγγύηση',
      'Παράδοση την ημέρα που συμφωνήθηκε',
      'Ενημέρωση με φωτογραφίες αν προκύψει κάτι επιπλέον'
    ],
    hours: [['Δευτέρα – Παρασκευή', '08:00 – 18:00'], ['Σάββατο', '08:00 – 14:00'],
      ['Κυριακή', 'Κλειστά']],
    hoursShort: '08:00 – 18:00',
    faq: [
      ['Δίνετε προσφορά πριν την επισκευή;', 'Ναι. Καμία εργασία δεν ξεκινά πριν ' +
        'εγκρίνετε γραπτώς το κόστος.'],
      ['Πόσο διαρκεί ένα service;', 'Το τακτικό service ολοκληρώνεται συνήθως ' +
        'εντός της ημέρας, κατόπιν ραντεβού.'],
      ['Υπάρχει εγγύηση στις εργασίες;', 'Σε αυτό το δείγμα θα αναγραφόταν η ' +
        'διάρκεια εγγύησης ανά τύπο εργασίας και ανταλλακτικού.'],
      ['Δέχεστε όλες τις μάρκες;', 'Η λίστα των μαρκών που εξυπηρετούνται θα ' +
        'εμφανιζόταν εδώ, μαζί με τυχόν εξειδικεύσεις.']
    ],
    formTitle: 'Ζητήστε προσφορά',
    formNote: 'Γράψτε μοντέλο, έτος και τι παρατηρείτε.'
  }
};

const sectorOf = slug => SECTORS[slug.replace(/-pro$/, '')];

/* ============================================================
   ΚΟΙΝΑ ΚΟΜΜΑΤΙΑ
   ============================================================ */

function hero(d, s, extraCta) {
  return '<section class="hero"><div class="wrap">' +
    '<span class="hero-badge">' + esc(s.badge) + '</span>' +
    '<h1>' + esc(s.h1) + '</h1>' +
    '<p>' + esc(s.lead) + '</p>' +
    '<div class="hero-cta">' +
    '<a class="btn btn-white" href="tel:' + d.phone.replace(/\s/g, '') + '">' +
    'Καλέστε ' + esc(d.phone) + '</a>' +
    (extraCta ? '<a class="btn btn-ghost" href="#epikoinonia">' + esc(s.ctaMain) + '</a>' : '') +
    '</div></div></section>';
}

function servicesGrid(s, count) {
  const list = s.services.slice(0, count);
  return '<div class="grid ' + (count > 3 ? 'g4' : 'g3') + '">' +
    list.map((sv, i) =>
      '<article class="card">' +
      '<span class="card-num" aria-hidden="true">' + (i + 1) + '</span>' +
      '<h3>' + esc(sv[0]) + '</h3><p>' + esc(sv[1]) + '</p></article>'
    ).join('') + '</div>';
}

function infoBox(d, s) {
  return '<div class="info-box">' +
    '<div class="info-row"><div><b>Τηλέφωνο</b>' +
    '<span><a href="tel:' + d.phone.replace(/\s/g, '') + '">' + esc(d.phone) + '</a></span></div></div>' +
    '<div class="info-row"><div><b>Διεύθυνση</b><span>' + esc(d.address) + '</span></div></div>' +
    '<div class="info-row"><div style="width:100%"><b>Ωράριο</b>' +
    '<ul class="hours">' + s.hours.map(h =>
      '<li><span>' + esc(h[0]) + '</span><span>' + esc(h[1]) + '</span></li>'
    ).join('') + '</ul></div></div>' +
    '</div>';
}

/* ============================================================
   ΑΠΛΟ ΔΕΙΓΜΑ — από 200€
   Μία σελίδα, χωρίς φόρμα, χωρίς πλοήγηση. Το ζητούμενο είναι
   να βρει κάποιος το τηλέφωνο σε δύο δευτερόλεπτα.
   ============================================================ */
function basicDemo(d) {
  const s = sectorOf(d.slug);

  const content =
    hero(d, s, false) +

    '<section class="sec"><div class="wrap">' +
    '<div class="sec-head">' +
    '<span class="kicker">Υπηρεσίες</span>' +
    '<h2>Τι προσφέρουμε</h2>' +
    '</div>' +
    servicesGrid(s, 3) +
    '</div></section>' +

    '<section class="sec sec-alt"><div class="wrap">' +
    '<div class="grid g2">' +
    '<div>' +
    '<span class="kicker">Γιατί εμάς</span>' +
    '<h2>Τι να περιμένετε</h2>' +
    '<ul class="ticks">' + s.why.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul>' +
    '</div>' +
    '<div>' + infoBox(d, s) + '</div>' +
    '</div></div></section>' +

    '<section class="sec"><div class="wrap">' +
    '<div class="cta-strip">' +
    '<h2>Καλέστε μας σήμερα</h2>' +
    '<p>Είμαστε διαθέσιμοι στο ωράριο λειτουργίας για ερωτήσεις και ραντεβού.</p>' +
    '<p style="margin-top:1.1rem"><a class="btn btn-white" href="tel:' +
    d.phone.replace(/\s/g, '') + '">' + esc(d.phone) + '</a></p>' +
    '</div></div></section>';

  return {
    slug: 'examples/' + d.slug + '.html',
    demo: d,
    hoursShort: s.hoursShort,
    title: d.business + ' — ' + s.h1 + ' (δείγμα)',
    description: 'Σελίδα-δείγμα για το πακέτο Απλή Landing Page του gpcode. ' +
      'Πλασματική επιχείρηση, μόνο για επίδειξη σχεδίασης.',
    content: content
  };
}

/* ============================================================
   PRO ΔΕΙΓΜΑ — από 400€
   Ενότητες, πλοήγηση, φόρμα, χάρτης, FAQ.
   ============================================================ */
function proDemo(d) {
  const s = sectorOf(d.slug);

  const content =
    hero(d, s, true) +

    '<section class="sec" id="ypiresies"><div class="wrap">' +
    '<div class="sec-head">' +
    '<span class="kicker">Υπηρεσίες</span>' +
    '<h2>Τι προσφέρουμε</h2>' +
    '<p class="lead">Τέσσερις βασικές κατηγορίες, με σύντομη περιγραφή στην ' +
    'καθεμία ώστε ο επισκέπτης να καταλάβει αμέσως αν τον αφορά.</p>' +
    '</div>' +
    servicesGrid(s, 4) +
    '</div></section>' +

    '<section class="sec sec-alt" id="giati"><div class="wrap">' +
    '<div class="grid g2">' +
    '<div>' +
    '<span class="kicker">Γιατί εμάς</span>' +
    '<h2>Τι να περιμένετε</h2>' +
    '<ul class="ticks">' + s.why.map(w => '<li>' + esc(w) + '</li>').join('') + '</ul>' +
    '</div>' +
    '<div>' + infoBox(d, s) + '</div>' +
    '</div></div></section>' +

    '<section class="sec" id="epikoinonia"><div class="wrap">' +
    '<div class="sec-head">' +
    '<span class="kicker">Επικοινωνία</span>' +
    '<h2>' + esc(s.formTitle) + '</h2>' +
    '<p class="lead">' + esc(s.formNote) + '</p>' +
    '</div>' +
    '<div class="grid g2">' +
    '<div class="info-box">' +
    /* Η φόρμα του δείγματος δεν στέλνει πουθενά — δεν συλλέγουμε
       δεδομένα από επισκέπτες σε σελίδα επίδειξης. */
    '<form onsubmit="return false">' +
    '<div class="field"><label for="dn">Ονοματεπώνυμο</label>' +
    '<input type="text" id="dn" name="name" autocomplete="name"></div>' +
    '<div class="field"><label for="dp">Τηλέφωνο</label>' +
    '<input type="tel" id="dp" name="phone" autocomplete="tel"></div>' +
    '<div class="field"><label for="dm">Μήνυμα</label>' +
    '<textarea id="dm" name="message" rows="4"></textarea></div>' +
    '<button class="btn btn-main" type="submit">Αποστολή</button>' +
    '<p class="field-note">Η φόρμα είναι ανενεργή σε αυτό το δείγμα και δεν ' +
    'αποστέλλει δεδομένα πουθενά.</p>' +
    '</form></div>' +
    '<div>' +
    '<div class="map-box"><p><b>Χάρτης</b><br>' +
    'Στο πραγματικό site εμφανίζεται διαδραστικός χάρτης, ο οποίος φορτώνει ' +
    'μόνο μετά από κλικ ώστε να μην τοποθετούνται cookies τρίτων.</p></div>' +
    '<p class="field-note" style="margin-top:.6rem">' + esc(d.address) + '</p>' +
    '</div>' +
    '</div></div></section>' +

    '<section class="sec sec-alt" id="erotiseis"><div class="wrap">' +
    '<div class="sec-head">' +
    '<span class="kicker">Ερωτήσεις</span>' +
    '<h2>Συχνές ερωτήσεις</h2>' +
    '</div>' +
    '<div style="max-width:48rem">' +
    s.faq.map(f =>
      '<details class="qa"><summary>' + esc(f[0]) + '</summary>' +
      '<div>' + esc(f[1]) + '</div></details>'
    ).join('') +
    '</div></div></section>' +

    '<section class="sec"><div class="wrap">' +
    '<div class="cta-strip">' +
    '<h2>Είμαστε εδώ για εσάς</h2>' +
    '<p>Καλέστε μας ή στείλτε το αίτημά σας από τη φόρμα και θα λάβετε ' +
    'απάντηση την ίδια ημέρα.</p>' +
    '<p style="margin-top:1.1rem"><a class="btn btn-white" href="tel:' +
    d.phone.replace(/\s/g, '') + '">' + esc(d.phone) + '</a></p>' +
    '</div></div></section>';

  return {
    slug: 'examples/' + d.slug + '.html',
    demo: d,
    hoursShort: s.hoursShort,
    navLinks: [
      { id: 'ypiresies', label: 'Υπηρεσίες' },
      { id: 'giati', label: 'Γιατί εμάς' },
      { id: 'erotiseis', label: 'Ερωτήσεις' },
      { id: 'epikoinonia', label: 'Επικοινωνία' }
    ],
    title: d.business + ' Pro — ' + s.h1 + ' (δείγμα)',
    description: 'Σελίδα-δείγμα για το πακέτο Landing Page Pro του gpcode. ' +
      'Πλασματική επιχείρηση, μόνο για επίδειξη σχεδίασης.',
    content: content
  };
}

/* ============================================================
   ΕΞΑΓΩΓΗ
   Επιστρέφει {slug, html} — τα δείγματα δεν περνούν από το
   layout() ούτε από τους ελέγχους schema του generate.js.
   ============================================================ */
function all() {
  return D.demos.map(d => {
    const page = d.tier === 'pro' ? proDemo(d) : basicDemo(d);
    return { slug: page.slug, html: demoLayout(page) };
  });
}

module.exports = { all, SECTORS };
