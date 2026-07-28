/**
 * nav.js — Αντικαθιστά το JavaScript bundle του Bootstrap για τις δύο
 * μόνο συμπεριφορές που χρειάζεται το site: mobile menu και dropdowns.
 *
 * ~1KB αντί για ~80KB. Τα data-bs-* attributes διατηρούνται ώστε να ισχύουν
 * οι κλάσεις που περιμένει το CSS του Bootstrap (.show, .collapse, κ.λπ.).
 */
(function () {
  'use strict';

  /* ---------- Mobile menu ---------- */
  var toggler = document.querySelector('[data-bs-toggle="collapse"]');
  if (toggler) {
    var targetSel = toggler.getAttribute('data-bs-target');
    var panel = targetSel && document.querySelector(targetSel);

    if (panel) {
      toggler.addEventListener('click', function () {
        var open = panel.classList.toggle('show');
        toggler.setAttribute('aria-expanded', open ? 'true' : 'false');
      });

      /* Κλείσιμο με Escape, με επιστροφή του focus στο κουμπί */
      panel.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && panel.classList.contains('show')) {
          panel.classList.remove('show');
          toggler.setAttribute('aria-expanded', 'false');
          toggler.focus();
        }
      });
    }
  }

  /* ---------- Dropdowns ---------- */
  var toggles = Array.prototype.slice.call(
    document.querySelectorAll('[data-bs-toggle="dropdown"]')
  );

  function closeAll(except) {
    toggles.forEach(function (t) {
      if (t === except) return;
      var menu = t.nextElementSibling;
      if (menu && menu.classList.contains('show')) {
        menu.classList.remove('show');
        t.setAttribute('aria-expanded', 'false');
      }
    });
  }

  toggles.forEach(function (toggle) {
    var menu = toggle.nextElementSibling;
    if (!menu) return;

    toggle.addEventListener('click', function (e) {
      e.preventDefault();
      var open = menu.classList.contains('show');
      closeAll(toggle);
      menu.classList.toggle('show', !open);
      toggle.setAttribute('aria-expanded', !open ? 'true' : 'false');
    });

    function onEsc(e) {
      if (e.key === 'Escape' && menu.classList.contains('show')) {
        menu.classList.remove('show');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    }
    toggle.addEventListener('keydown', onEsc);
    menu.addEventListener('keydown', onEsc);
  });

  if (toggles.length) {
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.dropdown')) closeAll(null);
    });
  }
})();
