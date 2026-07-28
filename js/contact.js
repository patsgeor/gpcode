/**
 * contact.js — Επικύρωση και αποστολή της φόρμας επικοινωνίας.
 *
 * Φορτώνεται μόνο στη σελίδα contact.html.
 * Χωρίς JavaScript η φόρμα εξακολουθεί να είναι πλήρως ορατή και τα
 * στοιχεία επικοινωνίας (τηλέφωνο, email) βρίσκονται δίπλα της.
 */
(function () {
  'use strict';

  var form = document.getElementById('contact-form');
  if (!form) return;

  var status = document.getElementById('form-status');
  var submitBtn = document.getElementById('cf-submit');
  var ENDPOINT = 'https://api.web3forms.com/submit';

  /* ------------------------------------------------------------
     Κανόνες επικύρωσης
     ------------------------------------------------------------ */
  var RULES = {
    'cf-name': function (v) {
      if (!v.trim()) return 'Συμπληρώστε το ονοματεπώνυμό σας.';
      if (v.trim().length < 2) return 'Το όνομα φαίνεται πολύ σύντομο.';
      return '';
    },
    'cf-email': function (v) {
      if (!v.trim()) return 'Συμπληρώστε το email σας για να μπορώ να απαντήσω.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim())) {
        return 'Ελέγξτε τη διεύθυνση email — φαίνεται να λείπει κάτι.';
      }
      return '';
    },
    'cf-phone': function (v) {
      if (!v.trim()) return '';   // προαιρετικό
      if (v.replace(/\D/g, '').length < 10) {
        return 'Το τηλέφωνο φαίνεται ελλιπές. Αφήστε το κενό αν προτιμάτε.';
      }
      return '';
    },
    'cf-message': function (v) {
      if (!v.trim()) return 'Περιγράψτε σύντομα τι χρειάζεστε.';
      if (v.trim().length < 20) {
        return 'Λίγες λέξεις παραπάνω βοηθούν να σας απαντήσω χρήσιμα.';
      }
      return '';
    },
    'cf-consent': function (v, el) {
      if (!el.checked) return 'Χρειάζεται η συγκατάθεσή σας για να επικοινωνήσω μαζί σας.';
      return '';
    }
  };

  function setError(id, message) {
    var field = document.getElementById(id);
    var slot = document.getElementById(id + '-error');
    if (!field) return;

    if (message) {
      field.classList.add('is-invalid');
      field.setAttribute('aria-invalid', 'true');
      if (slot) slot.textContent = message;
    } else {
      field.classList.remove('is-invalid');
      field.removeAttribute('aria-invalid');
      if (slot) slot.textContent = '';
    }
  }

  function validateField(id) {
    var field = document.getElementById(id);
    if (!field) return true;
    var message = RULES[id](field.value, field);
    setError(id, message);
    return !message;
  }

  function validateAll() {
    return Object.keys(RULES).filter(function (id) {
      return !validateField(id);
    });
  }

  /* Επικύρωση στο blur· επαναξιολόγηση καθώς διορθώνει ο χρήστης */
  Object.keys(RULES).forEach(function (id) {
    var field = document.getElementById(id);
    if (!field) return;

    field.addEventListener('blur', function () { validateField(id); });
    field.addEventListener('input', function () {
      if (field.classList.contains('is-invalid')) validateField(id);
    });
    field.addEventListener('change', function () {
      if (field.type === 'checkbox') validateField(id);
    });
  });

  /* ------------------------------------------------------------
     Υποβολή
     ------------------------------------------------------------ */
  function showStatus(kind, text) {
    if (!status) return;
    status.className = 'form-status ' + kind;
    status.textContent = text;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    /* Honeypot: αν συμπληρώθηκε, είναι bot. Προσποιούμαστε επιτυχία. */
    var honeypot = form.querySelector('input[name="botcheck"]');
    if (honeypot && honeypot.checked) {
      showStatus('ok', 'Το μήνυμά σας στάλθηκε.');
      return;
    }

    var invalid = validateAll();
    if (invalid.length) {
      showStatus('err', 'Ελέγξτε τα πεδία που επισημαίνονται παραπάνω.');
      var first = document.getElementById(invalid[0]);
      if (first) first.focus();
      return;
    }

    var key = form.querySelector('input[name="access_key"]');
    if (!key || key.value.indexOf('{') === 0) {
      showStatus('err',
        'Η φόρμα δεν έχει ρυθμιστεί ακόμη. Καλέστε στο 697 960 5534 ή στείλτε email — ' +
        'θα λάβετε την ίδια απάντηση.');
      return;
    }

    var originalLabel = submitBtn ? submitBtn.innerHTML : '';
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Αποστολή…';
    }
    showStatus('', '');

    fetch(ENDPOINT, {
      method: 'POST',
      body: new FormData(form),
      headers: { Accept: 'application/json' }
    })
      .then(function (res) { return res.json().catch(function () { return {}; }); })
      .then(function (data) {
        if (data && data.success) {
          form.reset();
          showStatus('ok',
            'Ευχαριστώ — το μήνυμα στάλθηκε. Θα λάβετε απάντηση εντός 24 ωρών.');
        } else {
          showStatus('err',
            'Κάτι πήγε στραβά στην αποστολή. Δοκιμάστε ξανά ή καλέστε στο 697 960 5534.');
        }
      })
      .catch(function () {
        showStatus('err',
          'Δεν ήταν δυνατή η σύνδεση. Ελέγξτε τη σύνδεσή σας ή καλέστε στο 697 960 5534.');
      })
      .finally(function () {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalLabel;
        }
      });
  });
})();
