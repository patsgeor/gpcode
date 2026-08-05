/**
 * pages-main.js — Αρχική, Σχετικά, Υπηρεσίες (hub), Έργα.
 */
'use strict';

const { icon, esc, abs, D } = require('./templates/layout.js');
const C = require('./templates/components.js');

const CRUMB_HOME = { name: 'Αρχική', href: 'index.html' };

/* ============================================================
   ΑΡΧΙΚΗ
   ============================================================
   Κανόνας: καμία τιμή, κανένα όνομα πελάτη, κανένας αριθμός έργων,
   καμία κριτική, κανένα έτος ίδρυσης. Κάθε νούμερο πάνω της είναι
   επαληθεύσιμο σήμερα.
*/
function home() {
  const b = '';
  const proof = C.proofHeading();
  const homeFaqs = C.allFaqs().filter(f => D.homeFaqIds.indexOf(f.id) !== -1);

  const content =

    /* 1. HERO */
    '<section class="hero">' +
    /* Διακοσμητική στρώση με φωτογραφία κώδικα· φορτώνεται από CSS ώστε να
       μη διεκδικεί τη θέση του LCP. */
    '<div class="hero-code" aria-hidden="true"></div>' +
    '<div class="container">' +
    '<div class="hero-badge">' +
    '<span class="bullet" aria-hidden="true"></span>Διαθέσιμο για νέα έργα</div>' +
    '<h1>Κατασκευή ιστοσελίδων και custom λογισμικού για ελληνικές επιχειρήσεις</h1>' +
    '<p class="lead">Το gpcode είναι ένα software studio που γράφει κώδικα αντί να ' +
    'συναρμολογεί plugins. Ιστοσελίδες, web εφαρμογές και διασυνδέσεις συστημάτων ' +
    'σε ASP.NET Core, Angular και SQL.</p>' +
    '<div class="hero-actions">' +
    '<a class="btn btn-brand btn-lg-cta" href="' + b + 'contact.html">' +
    icon('send-fill') + 'Ζητήστε προσφορά</a>' +
    '<a class="btn btn-ghost-light btn-lg-cta" href="' + b + 'services.html">' +
    'Δείτε τις υπηρεσίες' + icon('arrow-right') + '</a>' +
    '</div>' +
    '<div class="hero-stack">' +
    ['ASP.NET Core', 'C#', 'Angular', 'TypeScript', 'SQL Server', 'PostgreSQL', 'REST APIs']
      .map(t => '<span class="chip">' + icon('check-lg') + esc(t) + '</span>').join('') +
    '</div>' +
    '<p class="hero-note">Έδρα ' + esc(D.business.city) + ', Αθήνα · Συνεργασία εξ ' +
    'αποστάσεως σε ' + esc(D.contact.areaRemote) + '</p>' +
    '</div></section>' +

    /* 2. ΥΠΗΡΕΣΙΕΣ */
    '<section class="section"><div class="container">' +
    C.sectionHead('Υπηρεσίες', 'Υπηρεσίες ανάπτυξης λογισμικού',
      'Επτά υπηρεσίες που καλύπτουν τη διαδρομή από μια ιστοσελίδα παρουσίασης ' +
      'μέχρι ένα ολοκληρωμένο επιχειρησιακό σύστημα.', { center: true }) +
    C.serviceCards(b) +
    '</div></section>' +

    /* Η στοίβα τεχνολογιών ζει ήδη στα hero chips (γρήγορη σάρωση) και σε
       πλήρη ανάλυση στο about.html + στις σελίδες υπηρεσιών — μια τρίτη
       επανάληψη εδώ ήταν καθαρή αντιγραφή, αφαιρέθηκε για λιγότερη πυκνότητα
       πληροφορίας στην αρχική. */

    /* 3. ΓΙΑΤΙ gpcode */
    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Γιατί gpcode', 'Τι σας δίνει ένα μικρό studio',
      'Και τι σας κοστίζει. Και τα δύο, γραπτώς.', { center: true }) +
    '<div class="row g-3">' +
    D.differentiators.map((d, i) =>
      '<div class="col-lg-6">' +
      '<div class="card-modern reveal reveal-d' + (i % 3) + '">' +
      '<span class="card-icon" aria-hidden="true">' + icon(d.icon) + '</span>' +
      '<h3>' + esc(d.title) + '</h3>' +
      '<p>' + esc(d.text) + '</p>' +
      '<p class="text-muted-2 small mt-2 mb-0"><b>Το αντίστοιχο κόστος:</b> ' +
      esc(d.tradeoff.replace(/^Το αντίστοιχο κόστος:\s*/, '')) + '</p>' +
      '</div></div>'
    ).join('') +
    '</div></div></section>' +

    /* 4. ΔΙΑΔΙΚΑΣΙΑ */
    '<section class="section"><div class="container">' +
    C.sectionHead('Διαδικασία', 'Πώς δουλεύουμε — 5 βήματα',
      'Σε κάθε βήμα ξέρετε τι παίρνετε και τι χρειάζεται από εσάς.', { center: true }) +
    C.processSteps() +
    '</div></section>' +

    /* 5. ΕΡΓΑ — αρχέτυπα, όχι εφευρεμένα case studies */
    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Έργα', 'Τι είδους έργα φτιάχνουμε',
      'Δεν υπάρχει λίστα λογοτύπων σε αυτή τη σελίδα. Υπάρχουν τα σχήματα προβλήματος ' +
      'που αναλαμβάνω και ο τρόπος που τα λύνω.', { center: true }) +
    C.archetypeCards(b, 3) +
    '<div class="row g-3 mt-1 align-items-center">' +
    '<div class="col-lg-7">' +
    '<div class="callout accent mb-0">' +
    '<span class="callout-title">Ένα έργο που μπορείτε να ελέγξετε τώρα</span>' +
    '<p>Αυτό το site είναι δείγμα δουλειάς: στατικό, χωρίς framework στο frontend, ' +
    'με self-hosted γραμματοσειρές και μηδέν third-party requests πριν τη συγκατάθεσή σας. ' +
    'Δείτε τον κώδικα με view-source ή τρέξτε του PageSpeed. ' +
    '<a href="' + b + 'portfolio.html">Περισσότερα για τα έργα</a></p>' +
    '</div></div>' +
    '<div class="col-lg-5">' +
    C.mediaFrame(b, 'screenCode') +
    '</div></div>' +
    '</div></section>' +

    /* 6. ΔΕΣΜΕΥΣΕΙΣ + ΝΟΥΜΕΡΑ — μία ενότητα εμπιστοσύνης αντί για δύο συνεχόμενες.
       Και οι δύο απαντούν στο ίδιο ερώτημα («γιατί να σας εμπιστευτώ»), οπότε
       μοιράζονται μία επικεφαλίδα· τα νούμερα μπαίνουν ως συνέχεια, όχι ξεχωριστό θέμα. */
    '<section class="section-sm bg-dark-section"><div class="container">' +
    C.sectionHead(proof.eyebrow, proof.title,
      'Δεν υπάρχουν ακόμη δημοσιευμένες μαρτυρίες πελατών. Αντί για κριτικές που δεν ' +
      'μπορείτε να επαληθεύσετε, παρακάτω είναι οι δεσμεύσεις που ισχύουν σε κάθε έργο.',
      { center: true }) +
    C.socialProof() +
    '<h3 class="text-center h6 mt-4 mb-3">Τι σημαίνει αυτό με νούμερα</h3>' +
    C.statsRow() +
    '</div></section>' +

    /* 7. FAQ — χωρίς FAQPage schema· ζει μόνο στο faq.html */
    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Ερωτήσεις', 'Αυτά που ρωτούν οι περισσότεροι',
      'Οι έξι ερωτήσεις που επανέρχονται σχεδόν σε κάθε πρώτη συζήτηση.', { center: true }) +
    C.faqAccordion(homeFaqs) +
    '<p class="text-center mt-3 mb-0">' +
    '<a class="btn btn-outline-brand" href="' + b + 'faq.html">' +
    'Δείτε και τις 14 ερωτήσεις' + icon('arrow-right') + '</a></p>' +
    '</div></section>' +

    /* Το preview άρθρων αφαιρέθηκε — τα άρθρα παραμένουν 1 κλικ μακριά μέσω
       του μενού «Άρθρα». Λιγότερη πληροφορία στην αρχική, τίποτα δεν χάνεται. */

    /* 8. ΤΕΛΙΚΟ CTA */
    '<section class="section"><div class="container">' + C.ctaBand(b) + '</div></section>';

  return {
    slug: 'index.html', depth: 0, navId: 'home',
    title: 'Κατασκευή Ιστοσελίδων & Custom Software | gpcode',
    description: 'Κατασκευή ιστοσελίδων, web εφαρμογών και custom λογισμικού σε .NET, ' +
      'Angular και SQL. Καθαρός κώδικας με σαφή άδεια χρήσης, από έναν developer στην Αθήνα.',
    content: content,
    graph: [
      C.organizationNode(),
      C.websiteNode(),
      C.webPageNode('index.html', 'gpcode — Software Studio',
        'Ανάπτυξη ιστοσελίδων, web εφαρμογών και custom λογισμικού.')
    ]
  };
}

/* ============================================================
   ΣΧΕΤΙΚΑ
   ============================================================ */
function about() {
  const b = '';

  const content =
    '<section class="page-hero"><div class="container">' +
    '<span class="eyebrow">Σχετικά</span>' +
    '<h1>Ο developer πίσω από το gpcode</h1>' +
    '<p class="lead">Το gpcode δεν είναι εταιρεία με τμήματα. Είναι ένας developer που ' +
    'αναλαμβάνει έργα από άκρη σε άκρη και βάζει το όνομά του πάνω τους.</p>' +
    '</div></section>' +

    /* 1. Ποιος είμαι */
    '<section class="section"><div class="container">' +
    '<div class="row g-4">' +
    '<div class="col-lg-7">' +
    /* Το id="person" είναι ο στόχος του Person @id στο schema και του
       συνδέσμου υπογραφής σε κάθε άρθρο του blog. */
    '<h2 id="person">Ποιος είμαι</h2>' +
    '<p>Ονομάζομαι <b>Γεώργιος Πατσιαλής</b> και γράφω λογισμικό. Δημιουργός του GPcode.</p>' +
    '<p>Δουλεύω κυρίως στο οικοσύστημα .NET: backend σε ASP.NET Core και C#, frontend ' +
    'σε Angular όταν το έργο το χρειάζεται, και βάσεις δεδομένων σε SQL Server, ' +
    'PostgreSQL ή Oracle. Αυτό σημαίνει ότι σε ένα τυπικό έργο δεν χρειάζεται να ' +
    'συντονιστούν τρεις άνθρωποι για να αλλάξει ένα πεδίο σε μια φόρμα.</p>' +
    '<p>Αναλαμβάνω και μικρά έργα — μια landing page, ένα script που διορθώνει δεδομένα, ' +
    'έναν τεχνικό έλεγχο σε προσφορά που έχετε ήδη στα χέρια σας. Δεν υπάρχει ελάχιστο ' +
    'μέγεθος έργου, υπάρχει μόνο ελάχιστη σαφήνεια για το τι θέλουμε να πετύχουμε.</p>' +
    '</div>' +
    '<div class="col-lg-5">' +
    '<div class="founder-card">' +
    '<img class="founder-portrait" src="' + b + D.images.founder.src + '" ' +
    'alt="' + esc(D.images.founder.alt) + '" width="' + D.images.founder.width +
    '" height="' + D.images.founder.height + '" loading="lazy" decoding="async">' +
    '<p class="founder-caption">Γεώργιος Πατσιαλής — Καισαριανή, Αθήνα.</p>' +
    '</div>' +
    '<div class="panel mt-3">' +
    '<h3 class="h6">Με μια ματιά</h3>' +
    '<ul class="check-list mt-2">' +
    '<li>Ανάπτυξη full stack: backend, frontend και βάση από τον ίδιο</li>' +
    '<li>Έδρα Αθήνα · συνεργασία εξ αποστάσεως σε όλη την Ελλάδα</li>' +
    '<li>Τιμολόγιο παροχής υπηρεσιών σε κάθε συνεργασία</li>' +
    '<li>Άδεια πλήρους χρήσης· domain, hosting και credentials πρόσβασης δικά σας</li>' +
    '<li>Επικοινωνία στα ελληνικά ή στα αγγλικά</li>' +
    '</ul></div></div>' +
    '</div></div></section>' +

    /* 2. Πώς δουλεύω */
    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Αρχές', 'Πώς δουλεύω',
      'Πέντε πράγματα που ισχύουν σε κάθε έργο, ανεξάρτητα από μέγεθος και προϋπολογισμό.') +
    '<div class="row g-3">' +
    [
      ['file-earmark-text', 'Γραπτά, πριν ξεκινήσουμε',
        'Αντικείμενο, τιμή, χρονοδιάγραμμα και ρητά όσα ΔΕΝ περιλαμβάνονται. Οι ' +
        'παρεξηγήσεις κοστίζουν πάντα περισσότερο από τον χρόνο που θέλει η καταγραφή.'],
      ['translate', 'Χωρίς ορολογία που δεν χρειάζεται',
        'Θα σας εξηγήσω τι σημαίνει η κάθε τεχνική απόφαση για το κόστος και τον χρόνο σας. ' +
        'Αν κάτι δεν έγινε κατανοητό, το λάθος είναι δικό μου.'],
      ['bullseye', 'Το απλούστερο που λύνει το πρόβλημα',
        'Δεν προτείνω αρχιτεκτονική για κλίμακα που δεν έχετε. Η υπερμηχανική είναι ' +
        'το ίδιο ακριβή με την προχειρότητα, απλώς φαίνεται αργότερα.'],
      ['patch-check-fill', 'Θα ακούσετε και «όχι»',
        'Αν το WordPress σας κάνει, θα σας το πω. Αν ένα έργο είναι εκτός των δυνατοτήτων ' +
        'μου ή του χρόνου μου, θα σας το πω πριν το αναλάβω και όχι στη μέση.'],
      ['shield-check', 'Χωρίς κλείδωμα σε πλατφόρμα',
        'Το domain, το hosting και τα credentials πρόσβασης είναι πάντα στα δικά σας ' +
        'στοιχεία. Ο πηγαίος κώδικας παραμένει δικός μου, με σαφή άδεια χρήσης για εσάς.']
    ].map(([ic, title, text], i) =>
      '<div class="col-lg-4 col-md-6">' +
      '<div class="card-modern reveal reveal-d' + (i % 3) + '">' +
      '<span class="card-icon" aria-hidden="true">' + icon(ic) + '</span>' +
      '<h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></div></div>'
    ).join('') +
    '</div></div></section>' +

    /* 3. Στοίβα */
    '<section class="section"><div class="container">' +
    C.sectionHead('Τεχνολογίες', 'Το τεχνολογικό μου στοίβαγμα',
      'Δείτε αναλυτικά τι χρησιμοποιώ και γιατί στις σελίδες ' +
      '<a href="' + b + 'services/dotnet-development.html">.NET</a>, ' +
      '<a href="' + b + 'services/angular-development.html">Angular</a> και ' +
      '<a href="' + b + 'services/database-development.html">βάσεων δεδομένων</a>.') +
    C.techStack() +
    '</div></section>' +

    /* 4. Ένας developer αντί για agency */
    '<section class="section section-subtle"><div class="container">' +
    '<div class="row g-4 align-items-start">' +
    '<div class="col-lg-6">' +
    '<h2>Ένας developer αντί για agency</h2>' +
    '<p>Αυτή η επιλογή έχει και τις δύο όψεις. Παρακάτω είναι και οι δύο, χωρίς ' +
    'ωραιοποίηση — γιατί αν τη μάθετε στη μέση του έργου, θα είναι ήδη αργά.</p>' +
    '</div>' +
    '<div class="col-lg-3">' +
    '<div class="panel h-100">' +
    '<h3 class="h6 text-accent">Τι κερδίζετε</h3>' +
    '<ul class="check-list mt-2">' +
    '<li>Μιλάτε απευθείας με αυτόν που γράφει τον κώδικα</li>' +
    '<li>Καμία απώλεια πληροφορίας μεταξύ ομάδων</li>' +
    '<li>Χαμηλότερο κόστος χωρίς overhead δομής</li>' +
    '<li>Γρήγορες αποφάσεις σε αλλαγές</li>' +
    '</ul></div></div>' +
    '<div class="col-lg-3">' +
    '<div class="panel h-100">' +
    '<h3 class="h6">Τι δεν κερδίζετε</h3>' +
    '<ul class="cross-list mt-2">' +
    '<li>Υποστήριξη 24/7 ή βάρδιες</li>' +
    '<li>Παράλληλες ομάδες σε πολλά μέτωπα</li>' +
    '<li>Κάλυψη σε άδεια ή ασθένεια</li>' +
    '<li>Ξεχωριστό γραφικό σχεδιαστή στο ίδιο πακέτο</li>' +
    '</ul></div></div>' +
    '</div>' +
    '<div class="callout mt-3">' +
    '<span class="callout-title">Πώς αντισταθμίζεται το ρίσκο</span>' +
    '<p>Το domain και το hosting είναι πάντα στα δικά σας στοιχεία, οπότε το site ή η ' +
    'εφαρμογή δεν εξαρτώνται από τη δική μου συνέχεια για να παραμείνουν online. Ο ' +
    'πηγαίος κώδικας παραμένει δικός μου, με σαφή άδεια χρήσης για εσάς· αν θέλετε εκ ' +
    'των προτέρων όρο πρόσβασης σε αυτόν για συγκεκριμένη περίπτωση, το συζητάμε και ' +
    'μπαίνει γραπτώς στη σύμβαση.</p>' +
    '</div>' +
    '</div></section>' +

    /* 5. Νομικά */
    '<section class="section"><div class="container">' +
    '<div class="row g-4">' +
    '<div class="col-lg-6">' +
    '<h2>Νομικά και τιμολόγηση</h2>' +
    '<p>Τα πλήρη στοιχεία είναι δημόσια και επαληθεύσιμα. Στην Ελλάδα οι επιχειρήσεις ' +
    'ελέγχουν συχνά τον ΑΦΜ ενός συνεργάτη πριν την πρώτη ανάθεση — και σωστά κάνουν.</p>' +
    '<ul class="check-list">' +
    '<li>Εκδίδεται τιμολόγιο παροχής υπηρεσιών για κάθε συνεργασία</li>' +
    '<li>Πληρωμή με τραπεζική κατάθεση ή έμβασμα</li>' +
    '<li>Υπογραφή NDA όπου απαιτείται, πριν σταλεί οτιδήποτε</li>' +
    '</ul></div>' +
    '<div class="col-lg-6">' +
    '<div class="panel">' +
    '<h3 class="h6">Στοιχεία επιχείρησης</h3>' +
    '<dl class="row mb-0 mt-2 small">' +
    '<dt class="col-5 text-muted-2 fw-normal">Επωνυμία</dt><dd class="col-7 mb-1">' + esc(D.business.legalName) + '</dd>' +
    '<dt class="col-5 text-muted-2 fw-normal">Διακριτικός τίτλος</dt><dd class="col-7 mb-1">gpcode</dd>' +
    '<dt class="col-5 text-muted-2 fw-normal">Νομική μορφή</dt><dd class="col-7 mb-1">' + esc(D.business.legalForm) + '</dd>' +
    '<dt class="col-5 text-muted-2 fw-normal">ΑΦΜ</dt><dd class="col-7 mb-1">' + esc(D.business.vatId) + '</dd>' +
    '<dt class="col-5 text-muted-2 fw-normal">ΔΟΥ</dt><dd class="col-7 mb-1">' + esc(D.business.taxOffice) + '</dd>' +
    '<dt class="col-5 text-muted-2 fw-normal">Έδρα</dt><dd class="col-7 mb-0">' +
    esc(D.business.city) + ', ' + esc(D.business.region) + '</dd>' +
    '</dl></div></div>' +
    '</div></div></section>' +

    /* 6. Επαλήθευση — το κρίσιμο EEAT section */
    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Διαφάνεια', 'Πώς μπορείτε να επαληθεύσετε τη δουλειά μου',
      'Το gpcode είναι νέο ως μάρκα και δεν έχει ακόμη δημοσιευμένο πελατολόγιο. ' +
      'Αντί να σας ζητήσω να με εμπιστευτείτε στα λόγια, ορίστε τέσσερις τρόποι να ' +
      'ελέγξετε μόνοι σας.') +
    '<div class="row g-3">' +
    [
      ['code-square', 'Αυτό το site είναι το δείγμα',
        'Δεξί κλικ, «Προβολή πηγαίου κώδικα». Θα δείτε semantic HTML, structured data ' +
        'και μηδέν κλήσεις σε τρίτους πριν δώσετε συγκατάθεση. Τρέξτε του PageSpeed ' +
        'Insights και συγκρίνετε το με σελίδες ανταγωνιστών.'],
      ['chat-left-text', 'Τεχνική κλήση 30 λεπτών',
        'Χωρίς χρέωση και χωρίς δέσμευση. Ρωτήστε ό,τι θέλετε για την προσέγγιση, την ' +
        'αρχιτεκτονική ή το κόστος. Αν έχετε δικό σας τεχνικό, καλέστε τον μαζί.'],
      ['file-earmark-code', 'Δείγμα κώδικα κατόπιν αιτήματος',
        'Μπορώ να μοιραστώ κώδικα από έργο που δεν καλύπτεται από NDA, ή να κάνω ' +
        'screen share σε πραγματικό repository ώστε να δείτε πώς γράφω και πώς ' +
        'τεκμηριώνω.'],
      ['clipboard-check', 'Ξεκινήστε με έναν τεχνικό έλεγχο',
        'Ένα audit σταθερής τιμής είναι ο χαμηλού ρίσκου τρόπος να δουλέψουμε πρώτη ' +
        'φορά μαζί. Παίρνετε γραπτή αναφορά που μπορεί να χρησιμοποιήσει και άλλος ' +
        'developer, χωρίς καμία δέσμευση για συνέχεια.']
    ].map(([ic, title, text], i) =>
      '<div class="col-lg-6">' +
      '<div class="card-modern reveal reveal-d' + (i % 3) + '">' +
      '<span class="card-icon accent" aria-hidden="true">' + icon(ic) + '</span>' +
      '<h3>' + esc(title) + '</h3><p>' + esc(text) + '</p></div></div>'
    ).join('') +
    '</div>' +
    '<p class="mt-3 mb-0"><a class="btn btn-outline-brand" href="' + b +
    'services/technical-consulting.html">Δείτε την τεχνική συμβουλευτική' +
    icon('arrow-right') + '</a></p>' +
    '</div></section>' +

    '<section class="section"><div class="container">' +
    C.ctaBand(b, {
      title: 'Ξεκινάμε με μια συζήτηση',
      text: 'Πείτε μου τι θέλετε να λύσετε. Αν δεν είμαι ο κατάλληλος για αυτό, θα σας το πω.'
    }) + '</div></section>';

  return {
    slug: 'about.html', depth: 0, navId: 'about',
    title: 'Σχετικά — Ο Developer Πίσω από το gpcode',
    description: 'Ποιος είναι πίσω από το gpcode: ο Γεώργιος Πατσιαλής, οι τεχνολογίες, ' +
      'ο τρόπος συνεργασίας και πώς μπορείτε να επαληθεύσετε τη δουλειά μου.',
    content: content,
    breadcrumbs: [CRUMB_HOME, { name: 'Σχετικά' }],
    graph: [
      C.webPageNode('about.html', 'Σχετικά με το gpcode',
        'Ο developer πίσω από το gpcode και ο τρόπος συνεργασίας.', 'AboutPage'),
      C.personNode()
    ]
  };
}

/* ============================================================
   ΥΠΗΡΕΣΙΕΣ — hub
   ============================================================
   Router, όχι competitor: ~120 λέξεις ανά υπηρεσία, καμία τιμή,
   κανένα FAQ, κανένα H2 που να διπλασιάζει child H1.
*/
function services() {
  const b = '';

  const content =
    '<section class="page-hero"><div class="container">' +
    '<span class="eyebrow">Υπηρεσίες</span>' +
    '<h1>Υπηρεσίες ανάπτυξης λογισμικού</h1>' +
    '<p class="lead">Επτά υπηρεσίες, από μια σελίδα παρουσίασης μέχρι τη διασύνδεση ' +
    'συστημάτων. Διαλέξτε από πού θέλετε να ξεκινήσουμε — ή περιγράψτε το πρόβλημα και ' +
    'θα σας πω εγώ πού ανήκει.</p>' +
    '<div class="page-hero-actions">' +
    '<a class="btn btn-light-solid" href="' + b + 'contact.html">' +
    icon('send-fill') + 'Ζητήστε προσφορά</a>' +
    '<a class="btn btn-ghost-light" href="' + b + 'services/technical-consulting.html">' +
    icon('lightbulb') + 'Δεν είστε σίγουροι τι χρειάζεστε;</a>' +
    '</div>' +
    '</div></section>' +

    '<section class="section"><div class="container">' +
    '<div class="row g-3">' +
    D.services.map((s, i) =>
      '<div class="col-lg-6">' +
      '<article class="card-modern reveal reveal-d' + (i % 3) + '">' +
      '<span class="card-icon" aria-hidden="true">' + icon(s.icon) + '</span>' +
      '<h2 class="h5">' + esc(s.name) + '</h2>' +
      '<p>' + esc(s.intro) + '</p>' +
      '<a class="card-link stretch" href="' + b + 'services/' + s.slug + '.html">' +
      esc(s.navLabel) + icon('arrow-right', 'arw') + '</a>' +
      '</article></div>'
    ).join('') +
    '</div>' +

    '<div class="callout mt-4">' +
    '<span class="callout-title">Δεν ξέρετε ποια υπηρεσία σας ταιριάζει;</span>' +
    '<p>Είναι το συνηθέστερο σημείο εκκίνησης. Περιγράψτε τι δεν λειτουργεί σήμερα και ' +
    'θα σας πω τι χρειάζεται — ακόμη κι αν η απάντηση είναι ότι δεν χρειάζεστε τίποτα ' +
    'από όσα κάνω. Δείτε επίσης τις <a href="' + b + 'faq.html">συχνές ερωτήσεις</a>.</p>' +
    '</div>' +
    '</div></section>' +

    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Διαδικασία', 'Η ίδια διαδικασία σε κάθε υπηρεσία',
      'Ανεξάρτητα από το μέγεθος του έργου, τα βήματα είναι τα ίδια.', { center: true }) +
    C.processSteps() +
    '</div></section>' +

    '<section class="section"><div class="container">' + C.ctaBand(b) + '</div></section>';

  return {
    slug: 'services.html', depth: 0, navId: 'services',
    title: 'Υπηρεσίες Ανάπτυξης Λογισμικού | gpcode',
    description: 'Επτά υπηρεσίες ανάπτυξης λογισμικού: ιστοσελίδες, web εφαρμογές, .NET, ' +
      'Angular, βάσεις δεδομένων, APIs και τεχνική συμβουλευτική για επιχειρήσεις.',
    content: content,
    breadcrumbs: [CRUMB_HOME, { name: 'Υπηρεσίες' }],
    graph: [
      C.webPageNode('services.html', 'Υπηρεσίες gpcode',
        'Όλες οι υπηρεσίες ανάπτυξης λογισμικού.', 'CollectionPage'),
      C.itemListNode('services.html',
        D.services.map(s => abs('services/' + s.slug + '.html')),
        'Υπηρεσίες ανάπτυξης λογισμικού')
    ]
  };
}

/* ============================================================
   ΕΡΓΑ
   ============================================================ */
function portfolio() {
  const b = '';

  const content =
    '<section class="page-hero"><div class="container">' +
    '<span class="eyebrow">Έργα</span>' +
    '<h1>Έργα και τύποι custom software</h1>' +
    '<p class="lead">Τι αναλαμβάνω, τι παραδίδεται σε κάθε έργο και πώς μπορείτε να ' +
    'δείτε κώδικα πριν αναθέσετε οτιδήποτε.</p>' +
    '</div></section>' +

    /* Case study: αυτό το site */
    '<section class="section section-subtle"><div class="container">' +
    C.sectionHead('Δείγμα', 'Το πρώτο δείγμα είναι αυτό που διαβάζετε') +
    '<div class="row g-3">' +
    '<div class="col-lg-7">' +
    '<div class="panel h-100">' +
    '<h3 class="h6">Πώς είναι φτιαγμένο αυτό το site</h3>' +
    '<ul class="check-list mt-2">' +
    '<li>Στατικό HTML που παράγεται από build system — μηδέν βάση δεδομένων, μηδέν CMS</li>' +
    '<li>Ένα μόνο αρχείο CSS: purged Bootstrap συγχωνευμένο με το design system</li>' +
    '<li>Χωρίς framework στο frontend — περίπου 4KB δικού μας JavaScript συνολικά</li>' +
    '<li>Self-hosted γραμματοσειρές με ξεχωριστό ελληνικό subset περίπου 8KB</li>' +
    '<li>Εικονίδια ως inline SVG sprite· μόνο όσα χρησιμοποιεί η κάθε σελίδα</li>' +
    '<li>Μηδέν αιτήματα σε τρίτους πριν δώσετε συγκατάθεση για cookies</li>' +
    '<li>Structured data σε κάθε σελίδα, με ελέγχους εγκυρότητας στο build</li>' +
    '</ul></div></div>' +
    '<div class="col-lg-5">' +
    C.mediaFrame(b, 'integrations') +
    '<div class="panel mt-3">' +
    '<h3 class="h6">Ελέγξτε το μόνοι σας</h3>' +
    '<p class="small text-muted-2">Τρεις έλεγχοι που παίρνουν λιγότερο από δύο λεπτά ' +
    'και δεν χρειάζονται τεχνικές γνώσεις.</p>' +
    '<ol class="small mt-2">' +
    '<li class="mb-2"><b>Ταχύτητα:</b> τρέξτε <a href="https://pagespeed.web.dev/analysis?url=' +
    encodeURIComponent(D.business.domain) + '" rel="noopener nofollow" target="_blank">' +
    'PageSpeed Insights' + icon('arrow-up-right', 'ms-1') + '</a> σε αυτή τη διεύθυνση.</li>' +
    '<li class="mb-2"><b>Κώδικας:</b> δεξί κλικ → «Προβολή πηγαίου κώδικα σελίδας».</li>' +
    '<li class="mb-0"><b>Structured data:</b> επικολλήστε το URL στο ' +
    '<a href="https://search.google.com/test/rich-results" rel="noopener nofollow" ' +
    'target="_blank">Rich Results Test' + icon('arrow-up-right', 'ms-1') + '</a>.</li>' +
    '</ol></div></div>' +
    '</div></div></section>' +

    /* 3. Αρχέτυπα */
    '<section class="section"><div class="container">' +
    C.sectionHead('Τύποι έργων', 'Τι είδους έργα αναλαμβάνω',
      'Έξι σχήματα προβλήματος που επανέρχονται. Το δικό σας πιθανότατα μοιάζει με ένα ' +
      'από αυτά — και αν όχι, ρωτήστε.') +
    C.archetypeCards(b) +
    '</div></section>' +

    /* 4. Τι παραδίδεται */
    '<section class="section section-subtle"><div class="container">' +
    '<div class="row g-4">' +
    '<div class="col-lg-6">' +
    '<h2>Τι παραδίδεται σε κάθε έργο</h2>' +
    '<p>Ανεξάρτητα από το μέγεθος, ένα ολοκληρωμένο έργο περιλαμβάνει τα παρακάτω. Αν ' +
    'κάποιο δεν έχει νόημα για το δικό σας, αφαιρείται ρητά από την προσφορά αντί να ' +
    'παραλειφθεί σιωπηλά.</p>' +
    '<ul class="check-list">' +
    '<li>Άδεια πλήρους χρήσης της εφαρμογής ή του site που παραδίδεται</li>' +
    '<li>Τεκμηρίωση χρήσης και των endpoints όπου υπάρχει API</li>' +
    '<li>Όλα τα credentials και οι πρόσβασεις σε λογαριασμούς στο όνομά σας</li>' +
    '<li>Το live deployment σε περιβάλλον της επιλογής σας</li>' +
    '<li>90 ημέρες διόρθωσης σφαλμάτων χωρίς χρέωση</li>' +
    '</ul>' +
    '<p class="small text-muted-2 mt-2 mb-0">Ο πηγαίος κώδικας παραμένει πνευματική ' +
    'ιδιοκτησία του gpcode και δεν περιλαμβάνεται στα παραπάνω — δείτε <a href="' + b +
    'faq.html#faq-idioktisia">πώς λειτουργεί η άδεια χρήσης</a>.</p>' +
    '</div>' +
    '<div class="col-lg-6">' +
    '<h2>Θέλετε να δείτε κώδικα;</h2>' +
    '<p>Λογικό αίτημα, ειδικά όταν δεν υπάρχει δημόσιο πελατολόγιο. Υπάρχουν δύο τρόποι ' +
    'και κανένας δεν σας δεσμεύει σε τίποτα.</p>' +
    '<div class="panel">' +
    '<h3 class="h6">' + icon('chat-left-text') + ' Τεχνική κλήση με screen share</h3>' +
    '<p class="small mb-3">Τριάντα λεπτά σε πραγματικό repository: δομή, ονοματολογία, ' +
    'testing, τεκμηρίωση. Φέρτε και δικό σας τεχνικό αν έχετε.</p>' +
    '<h3 class="h6">' + icon('file-earmark-code') + ' Δείγμα repository</h3>' +
    '<p class="small mb-0">Κώδικας από έργο εκτός NDA, ώστε να τον εξετάσετε με την ' +
    'ησυχία σας.</p>' +
    '</div>' +
    '<p class="mt-3 mb-0"><a class="btn btn-brand" href="' + b + 'contact.html">' +
    icon('send-fill') + 'Ζητήστε δείγμα κώδικα</a></p>' +
    '</div></div></div></section>' +

    '<section class="section"><div class="container">' +
    C.ctaBand(b, {
      title: 'Το επόμενο έργο μπορεί να είναι το δικό σας',
      text: 'Περιγράψτε τι θέλετε να φτιάξετε και θα λάβετε γραπτή προσφορά με σαφές ' +
        'κόστος και χρονοδιάγραμμα.'
    }) + '</div></section>';

  return {
    slug: 'portfolio.html', depth: 0, navId: 'portfolio',
    title: 'Έργα & Τύποι Custom Software | gpcode',
    description: 'Τι είδους έργα custom software αναλαμβάνει το gpcode, τι παραδίδεται σε ' +
      'κάθε έργο και πώς μπορείτε να δείτε δείγμα κώδικα πριν αναθέσετε.',
    content: content,
    breadcrumbs: [CRUMB_HOME, { name: 'Έργα' }],
    graph: [
      C.webPageNode('portfolio.html', 'Έργα gpcode',
        'Τύποι έργων custom software και τι παραδίδεται.', 'CollectionPage'),
      C.itemListNode('portfolio.html',
        D.projectArchetypes.map(a => abs('services/' + a.service + '.html')),
        'Τύποι έργων')
    ]
  };
}

module.exports = { home, about, services, portfolio };
