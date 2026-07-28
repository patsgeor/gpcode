/**
 * check-links.js — Επαληθεύει κάθε εσωτερικό σύνδεσμο και κάθε άγκυρα.
 *
 * Πιάνει ακριβώς τα λάθη που ένα στατικό site δημοσιεύει σιωπηλά:
 * χαλασμένα relative paths, λάθος βάθος '../', άγκυρες που δείχνουν σε
 * id που δεν υπάρχει, εικόνες που λείπουν.
 *
 *   node build/check-links.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SKIP_DIRS = new Set(['build', 'node_modules', '.claude', '.git', 'dist']);

const problems = [];
const idsCache = {};

function walk(dir, acc) {
  acc = acc || [];
  fs.readdirSync(dir, { withFileTypes: true }).forEach(entry => {
    if (entry.name.startsWith('.')) return;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walk(full, acc);
    } else if (entry.name.endsWith('.html')) {
      acc.push(full);
    }
  });
  return acc;
}

/** Όλα τα id= μιας σελίδας (με cache, τα διαβάζουμε πολλές φορές). */
function idsOf(absFile) {
  if (idsCache[absFile]) return idsCache[absFile];
  if (!fs.existsSync(absFile)) return (idsCache[absFile] = new Set());

  const html = fs.readFileSync(absFile, 'utf8');
  const set = new Set();
  html.replace(/\sid="([^"]+)"/g, (m, id) => { set.add(id); return m; });
  idsCache[absFile] = set;
  return set;
}

const htmlFiles = walk(ROOT);

htmlFiles.forEach(file => {
  const rel = path.relative(ROOT, file).split(path.sep).join('/');
  const html = fs.readFileSync(file, 'utf8');
  const dir = path.posix.dirname(rel);

  const refs = [];
  html.replace(/(?:href|src)="([^"]+)"/g, (m, url) => { refs.push(url); return m; });

  refs.forEach(url => {
    /* Εξωτερικά και ειδικά σχήματα δεν ελέγχονται εδώ */
    if (/^(https?:)?\/\//.test(url)) return;
    if (/^(mailto:|tel:|data:|javascript:|#i-)/.test(url)) return;

    /* Καθαρή άγκυρα μέσα στην ίδια σελίδα */
    if (url.startsWith('#')) {
      const id = decodeURIComponent(url.slice(1));
      if (id && !idsOf(file).has(id)) {
        problems.push('[' + rel + '] Άγκυρα προς ανύπαρκτο id: ' + url);
      }
      return;
    }

    const hashAt = url.indexOf('#');
    const targetPath = hashAt === -1 ? url : url.slice(0, hashAt);
    const hash = hashAt === -1 ? '' : decodeURIComponent(url.slice(hashAt + 1));

    /* Επίλυση σε διαδρομή σχετική με τη ρίζα του project */
    let resolved;
    if (targetPath.startsWith('/')) {
      resolved = path.posix.normalize(targetPath.slice(1));
    } else {
      resolved = path.posix.normalize(path.posix.join(dir === '.' ? '' : dir, targetPath));
    }

    if (resolved.startsWith('..')) {
      problems.push('[' + rel + '] Ο σύνδεσμος βγαίνει εκτός project: ' + url);
      return;
    }

    const abs = path.join(ROOT, resolved.split('/').join(path.sep));
    if (!fs.existsSync(abs)) {
      problems.push('[' + rel + '] Ανύπαρκτο αρχείο: ' + url + '  → ' + resolved);
      return;
    }

    /* Άγκυρα σε άλλη σελίδα */
    if (hash && resolved.endsWith('.html')) {
      if (!idsOf(abs).has(hash)) {
        problems.push('[' + rel + '] Άγκυρα προς ανύπαρκτο id στο ' + resolved + ': #' + hash);
      }
    }
  });
});

/* ============================================================
   ΑΝΑΦΟΡΑ
   ============================================================ */

console.log('');
console.log('  gpcode — check-links');
console.log('  ' + '─'.repeat(52));
console.log('  Ελέγχθηκαν:  ' + htmlFiles.length + ' αρχεία HTML');

if (problems.length) {
  console.log('');
  console.log('  ✖ Προβλήματα (' + problems.length + '):');
  problems.forEach(p => console.log('    · ' + p));
  console.log('');
  process.exit(1);
}

console.log('  ✓ Όλοι οι εσωτερικοί σύνδεσμοι και οι άγκυρες είναι έγκυροι.');
console.log('');
