/**
 * demo-layout.js — Κέλυφος ΜΟΝΟ για τις σελίδες-δείγματα.
 *
 * Χωριστό από το layout() του gpcode επίτηδες: τα δείγματα πρέπει να
 * μοιάζουν με site πελάτη, όχι με το site του κατασκευαστή.
 *
 * Κάθε σελίδα:
 *   • φέρει μόνιμη ορατή μπάρα «ΔΕΙΓΜΑ» με σύνδεσμο επιστροφής
 *   • είναι noindex, follow και εξαιρείται από το sitemap
 *   • ΔΕΝ εκπέμπει structured data — δεν δημοσιεύουμε schema
 *     πλασματικής επιχείρησης, ούτε ως δείγμα
 */
'use strict';

const { esc } = require('./layout.js');

const PROD = process.argv.indexOf('--prod') !== -1;

/** Αρχικά της επωνυμίας για το σήμα του «πελάτη». */
function initials(name) {
  return name.split(/\s+/).slice(0, 2).map(w => w.charAt(0)).join('').toUpperCase();
}

function demoLayout(o) {
  const d = o.demo;
  const css = PROD ? '../css/demo.min.css' : '../css/demo.css';
  const tierLabel = d.tier === 'pro' ? 'Landing Page Pro — από 400€' : 'Απλή Landing Page — από 200€';

  const nav = (o.navLinks || []).map(n =>
    '<a href="#' + n.id + '">' + esc(n.label) + '</a>'
  ).join('');

  return '<!DOCTYPE html>\n<html lang="el">\n<head>\n' +
    '<meta charset="utf-8">\n' +
    '<meta name="viewport" content="width=device-width, initial-scale=1">\n' +
    '<title>' + esc(o.title) + '</title>\n' +
    '<meta name="description" content="' + esc(o.description) + '">\n' +
    /* Τα δείγματα δεν πρέπει ποτέ να ευρετηριαστούν ως πραγματικές επιχειρήσεις */
    '<meta name="robots" content="noindex, nofollow">\n' +
    '<meta name="theme-color" content="' + d.accent + '">\n' +
    '<link rel="icon" href="../favicon/favicon.svg" type="image/svg+xml">\n' +
    '<link rel="preload" href="../fonts/inter-400-greek.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<link rel="preload" href="../fonts/inter-800-greek.woff2" as="font" type="font/woff2" crossorigin>\n' +
    '<style>' +
    "@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;" +
    "src:url('../fonts/inter-400-greek.woff2') format('woff2');" +
    'unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF}' +
    "@font-face{font-family:'Inter';font-style:normal;font-weight:400;font-display:swap;" +
    "src:url('../fonts/inter-400-latin.woff2') format('woff2');" +
    'unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122}' +
    "@font-face{font-family:'Inter';font-style:normal;font-weight:700;font-display:swap;" +
    "src:url('../fonts/inter-700-greek.woff2') format('woff2');" +
    'unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF}' +
    "@font-face{font-family:'Inter';font-style:normal;font-weight:700;font-display:swap;" +
    "src:url('../fonts/inter-700-latin.woff2') format('woff2');" +
    'unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122}' +
    "@font-face{font-family:'Inter';font-style:normal;font-weight:800;font-display:swap;" +
    "src:url('../fonts/inter-800-greek.woff2') format('woff2');" +
    'unicode-range:U+0370-0377,U+037A-037F,U+0384-038A,U+038C,U+038E-03A1,U+03A3-03FF}' +
    "@font-face{font-family:'Inter';font-style:normal;font-weight:800;font-display:swap;" +
    "src:url('../fonts/inter-800-latin.woff2') format('woff2');" +
    'unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+2000-206F,U+20AC,U+2122}' +
    '</style>\n' +
    '<link rel="stylesheet" href="' + css + '">\n' +
    '<style>:root{--accent:' + d.accent + ';--accent-dark:' + d.accentDark +
    ';--accent-tint:' + d.accentTint + '}</style>\n' +
    '</head>\n<body>\n' +

    /* ---- Μπάρα δείγματος ---- */
    '<div class="demo-bar">' +
    '<span><b>ΔΕΙΓΜΑ</b> — πλασματική επιχείρηση, μόνο για επίδειξη σχεδίασης. ' +
    'Τα στοιχεία επικοινωνίας δεν είναι υπαρκτά.</span>' +
    '<span>' + esc(tierLabel) + '</span>' +
    '<a href="../services/web-development.html">← Πίσω στα πακέτα gpcode</a>' +
    '</div>\n' +

    /* ---- Header «πελάτη» ---- */
    '<header class="site-top"><div class="wrap">' +
    '<a class="logo" href="#top">' +
    '<span class="logo-mark" aria-hidden="true">' + esc(initials(d.business)) + '</span>' +
    '<span><span class="logo-name">' + esc(d.business) + '</span>' +
    '<span class="logo-sub">' + esc(d.sector) + '</span></span></a>' +
    (nav ? '<nav class="top-nav" aria-label="Πλοήγηση">' + nav + '</nav>' : '') +
    '<a class="btn btn-main" href="tel:' + d.phone.replace(/\s/g, '') + '">' +
    esc(d.phone) + '</a>' +
    '</div></header>\n' +

    '<main id="top">' + o.content + '</main>\n' +

    /* ---- Footer «πελάτη» ---- */
    '<footer class="site-bottom"><div class="wrap">' +
    '<div>' +
    '<h3>' + esc(d.business) + '</h3>' +
    '<p>' + esc(d.tagline) + '</p>' +
    '</div>' +
    '<div>' +
    '<h3>Επικοινωνία</h3>' +
    '<p>' + esc(d.address) + '<br>' +
    '<a href="tel:' + d.phone.replace(/\s/g, '') + '">' + esc(d.phone) + '</a></p>' +
    '</div>' +
    '<div>' +
    '<h3>Ωράριο</h3>' +
    '<p>Δευτέρα – Παρασκευή<br>' + esc(o.hoursShort || '09:00 – 20:00') + '</p>' +
    '</div>' +
    '</div>' +
    '<div class="wrap"><p class="bottom-note">' +
    'Σελίδα-δείγμα κατασκευασμένη από το <a href="../index.html">gpcode</a>. ' +
    'Η επιχείρηση και τα στοιχεία της είναι πλασματικά.' +
    '</p></div>' +
    '</footer>\n' +

    '<a class="call-fab" href="tel:' + d.phone.replace(/\s/g, '') + '">' +
    'Καλέστε μας ' + esc(d.phone) + '</a>\n' +
    '</body>\n</html>\n';
}

module.exports = { demoLayout, initials };
