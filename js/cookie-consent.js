/**
 * cookie-consent.js — Συγκατάθεση cookies κατά GDPR, με opt-in.
 *
 * Αρχές που τηρούνται:
 *   • Τα προαιρετικά πλαίσια ξεκινούν ΑΠΕΝΕΡΓΟΠΟΙΗΜΕΝΑ (άρθρο 7 ΓΚΠΔ:
 *     η συγκατάθεση πρέπει να δίνεται με σαφή θετική ενέργεια).
 *   • Κανένα script τρίτου δεν φορτώνεται πριν τη συγκατάθεση.
 *   • Η επιλογή ανακαλείται ανά πάσα στιγμή από το footer.
 *   • Το «Μόνο τα απαραίτητα» δεν προκαλεί κανένα εξωτερικό αίτημα.
 */
(function () {
  'use strict';

  var KEY = 'gpcode_consent_v1';

  var banner = document.getElementById('cookie-banner');
  if (!banner) return;

  var prefs = document.getElementById('cookie-prefs');
  var customizeBtn = document.getElementById('cookie-customize');
  var statsBox = document.getElementById('cookie-stats');
  var marketingBox = document.getElementById('cookie-marketing');

  /* ---------- Αποθήκευση ---------- */

  function readConsent() {
    try {
      var raw = window.localStorage.getItem(KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;   // ιδιωτική περιήγηση ή απενεργοποιημένο localStorage
    }
  }

  function saveConsent(consent) {
    consent.necessary = true;
    consent.timestamp = new Date().toISOString();
    try {
      window.localStorage.setItem(KEY, JSON.stringify(consent));
    } catch (e) { /* αγνοείται σκόπιμα */ }
    applyConsent(consent);
    closeBanner();
  }

  /* ---------- Εμφάνιση ---------- */

  function openBanner(focusSave) {
    banner.classList.add('is-open');
    banner.setAttribute('aria-hidden', 'false');
    if (focusSave) {
      var save = document.getElementById('cookie-save');
      if (save) save.focus();
    }
  }

  function closeBanner() {
    banner.classList.remove('is-open');
    banner.setAttribute('aria-hidden', 'true');
  }

  function togglePrefs(force) {
    if (!prefs || !customizeBtn) return;
    var show = typeof force === 'boolean' ? force : prefs.hasAttribute('hidden');
    if (show) prefs.removeAttribute('hidden'); else prefs.setAttribute('hidden', '');
    customizeBtn.setAttribute('aria-expanded', show ? 'true' : 'false');
  }

  /* ---------- Ενεργοποίηση ---------- */

  function applyConsent(consent) {
    if (consent.statistics || consent.marketing) loadTrackingScripts(consent);
  }

  /**
   * Φόρτωση εργαλείων παρακολούθησης — ΜΟΝΟ μετά από συγκατάθεση.
   *
   * Όλα τα παρακάτω είναι σχολιασμένα. Για να ενεργοποιήσετε κάποιο:
   *   1. Αφαιρέστε τα σχόλια του αντίστοιχου μπλοκ.
   *   2. Αντικαταστήστε το αναγνωριστικό με το δικό σας.
   *   3. Ενημερώστε το cookies.html ώστε να αναφέρει τι χρησιμοποιείται.
   *   4. Τρέξτε ξανά: npm run build
   */
  function loadTrackingScripts(consent) {
    if (window.__gpcodeTrackingLoaded) return;
    window.__gpcodeTrackingLoaded = true;

    if (consent.statistics) {

      /* --- Google Analytics 4 ---------------------------------------
      var GA4_ID = 'G-XXXXXXXXXX';
      var gaScript = document.createElement('script');
      gaScript.async = true;
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      document.head.appendChild(gaScript);
      window.dataLayer = window.dataLayer || [];
      function gtag(){ window.dataLayer.push(arguments); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', GA4_ID, { anonymize_ip: true });
      ----------------------------------------------------------------- */

      /* --- Google Tag Manager ----------------------------------------
         Προσοχή: το GTM μπορεί να φορτώσει και εργαλεία μάρκετινγκ.
         Αν το χρησιμοποιήσετε, ρυθμίστε consent mode μέσα στο GTM.
      var GTM_ID = 'GTM-XXXXXXX';
      (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
      var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
      j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;
      f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer',GTM_ID);
      ----------------------------------------------------------------- */

      /* --- Microsoft Clarity -----------------------------------------
      var CLARITY_ID = 'xxxxxxxxxx';
      (function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
      t=l.createElement(r);t.async=1;t.src='https://www.clarity.ms/tag/'+i;
      y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})
      (window,document,'clarity','script',CLARITY_ID);
      ----------------------------------------------------------------- */

    }

    if (consent.marketing) {

      /* --- Google Ads -------------------------------------------------
      var ADS_ID = 'AW-XXXXXXXXX';
      var adsScript = document.createElement('script');
      adsScript.async = true;
      adsScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + ADS_ID;
      document.head.appendChild(adsScript);
      window.dataLayer = window.dataLayer || [];
      function gtagAds(){ window.dataLayer.push(arguments); }
      gtagAds('js', new Date());
      gtagAds('config', ADS_ID);
      ----------------------------------------------------------------- */

      /* --- Meta Pixel -------------------------------------------------
      var PIXEL_ID = 'XXXXXXXXXXXXXXX';
      !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
      n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
      n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
      t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}
      (window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', PIXEL_ID);
      fbq('track', 'PageView');
      ----------------------------------------------------------------- */

      /* --- LinkedIn Insight Tag ---------------------------------------
      var LINKEDIN_ID = 'XXXXXXX';
      window._linkedin_partner_id = LINKEDIN_ID;
      window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
      window._linkedin_data_partner_ids.push(LINKEDIN_ID);
      (function(l){if(!l){window.lintrk=function(a,b){window.lintrk.q.push([a,b])};
      window.lintrk.q=[]}var s=document.getElementsByTagName('script')[0];
      var t=document.createElement('script');t.type='text/javascript';t.async=true;
      t.src='https://snap.licdn.com/li.lms-analytics/insight.min.js';
      s.parentNode.insertBefore(t,s);})(window.lintrk);
      ----------------------------------------------------------------- */

    }
  }

  /* ---------- Χειριστές ---------- */

  var acceptBtn = document.getElementById('cookie-accept-all');
  if (acceptBtn) {
    acceptBtn.addEventListener('click', function () {
      saveConsent({ statistics: true, marketing: true });
    });
  }

  var rejectBtn = document.getElementById('cookie-reject');
  if (rejectBtn) {
    rejectBtn.addEventListener('click', function () {
      saveConsent({ statistics: false, marketing: false });
    });
  }

  if (customizeBtn) {
    customizeBtn.addEventListener('click', function () { togglePrefs(); });
  }

  var saveBtn = document.getElementById('cookie-save');
  if (saveBtn) {
    saveBtn.addEventListener('click', function () {
      saveConsent({
        statistics: !!(statsBox && statsBox.checked),
        marketing: !!(marketingBox && marketingBox.checked)
      });
    });
  }

  /* Επανάκληση από το footer */
  Array.prototype.forEach.call(
    document.querySelectorAll('[data-cookie-settings]'),
    function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var saved = readConsent();
        if (statsBox) statsBox.checked = !!(saved && saved.statistics);
        if (marketingBox) marketingBox.checked = !!(saved && saved.marketing);
        togglePrefs(true);
        openBanner(true);
      });
    }
  );

  /* ---------- Εκκίνηση ---------- */

  var existing = readConsent();
  if (existing) {
    applyConsent(existing);   // χωρίς εμφάνιση banner
  } else {
    openBanner(false);
  }
})();
