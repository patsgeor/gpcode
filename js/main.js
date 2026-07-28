/**
 * main.js — Καθολικές συμπεριφορές. Όλες είναι progressive enhancement:
 * χωρίς JavaScript η σελίδα παραμένει πλήρως λειτουργική και αναγνώσιμη.
 */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------
     1. Sticky header — glassmorphism μόλις ξεκινήσει η κύλιση
     ------------------------------------------------------------ */
  var header = document.querySelector('.site-header');
  if (header) {
    var syncHeader = function () {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
    };
    window.addEventListener('scroll', syncHeader, { passive: true });
    syncHeader();   // σωστό και σε ανανέωση στη μέση της σελίδας
  }

  /* ------------------------------------------------------------
     2. Reveal on scroll
     ------------------------------------------------------------ */
  var reveals = document.querySelectorAll('.reveal');
  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      Array.prototype.forEach.call(reveals, function (el) {
        el.classList.add('is-in');
      });
    } else {
      var revealObserver = new IntersectionObserver(function (entries, obs) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-in');
          obs.unobserve(entry.target);   // μία φορά· δεν ξανακρύβεται
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -32px 0px' });

      Array.prototype.forEach.call(reveals, function (el) {
        revealObserver.observe(el);
      });
    }
  }

  /* ------------------------------------------------------------
     3. Μετρητές στα νούμερα
     Η τελική τιμή υπάρχει ήδη στο HTML, άρα είναι σωστή χωρίς JS
     και για τους crawlers. Εδώ απλώς κινείται.
     ------------------------------------------------------------ */
  var counters = document.querySelectorAll('[data-count]');
  if (counters.length && !reduceMotion && 'IntersectionObserver' in window) {
    var countObserver = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        obs.unobserve(entry.target);

        var el = entry.target;
        var target = parseInt(el.getAttribute('data-count'), 10);
        if (isNaN(target) || target === 0) return;

        var duration = 900;
        var start = null;

        var step = function (now) {
          if (start === null) start = now;
          var progress = Math.min((now - start) / duration, 1);
          var eased = 1 - Math.pow(1 - progress, 3);   // easeOutCubic
          el.textContent = Math.round(target * eased).toLocaleString('el-GR');
          if (progress < 1) requestAnimationFrame(step);
        };

        el.textContent = '0';
        requestAnimationFrame(step);
      });
    }, { threshold: 0.5 });

    Array.prototype.forEach.call(counters, function (el) {
      countObserver.observe(el);
    });
  }

  /* ------------------------------------------------------------
     4. Επιστροφή στην κορυφή
     ------------------------------------------------------------ */
  var topBtn = document.querySelector('.fab-top');
  if (topBtn) {
    var syncTop = function () {
      topBtn.classList.toggle('is-visible', window.scrollY > 420);
    };
    window.addEventListener('scroll', syncTop, { passive: true });
    syncTop();

    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ------------------------------------------------------------
     5. Κοινοποίηση άρθρου
     Native share sheet όπου υπάρχει· αλλιώς αντιγραφή συνδέσμου.
     Καμία εξάρτηση από script τρίτου.
     ------------------------------------------------------------ */
  var shareBtns = document.querySelectorAll('[data-share]');
  Array.prototype.forEach.call(shareBtns, function (btn) {
    btn.addEventListener('click', function () {
      var url = window.location.href;
      var title = btn.getAttribute('data-share-title') || document.title;

      if (navigator.share) {
        navigator.share({ title: title, url: url }).catch(function () { /* ακύρωση */ });
        return;
      }

      var restore = function (text) {
        var original = btn.innerHTML;
        btn.textContent = text;
        setTimeout(function () { btn.innerHTML = original; }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(
          function () { restore('Ο σύνδεσμος αντιγράφηκε'); },
          function () { restore('Δεν ήταν δυνατή η αντιγραφή'); }
        );
      } else {
        restore('Αντιγράψτε τη διεύθυνση από τη γραμμή του browser');
      }
    });
  });
})();
