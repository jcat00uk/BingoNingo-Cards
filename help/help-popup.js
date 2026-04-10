/* =============================================
   BingoNingo Help System — help-popup.js
   Single reusable long-press help engine.
   Include after help-content.js on each page.
   ============================================= */

(function () {
  'use strict';

  var LONG_PRESS_MS = 600;
  var overlay, popup, titleEl, bodyEl, closeBtn;
  var imgOverlay, imgOverlayImg;
  var pressTimer = null;
  var currentTarget = null;

  // ── IMAGE OVERLAY ─────────────────────────────────────────
  function openImageOverlay(src, alt) {
    imgOverlayImg.src = src;
    imgOverlayImg.alt = alt || '';
    imgOverlay.classList.add('visible');
    document.body.style.overflow = 'hidden';
    // Lock landscape on native only
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      var SO = window.Capacitor.Plugins.ScreenOrientation;
      if (SO) SO.lock({ orientation: 'landscape' }).catch(function(){});
    }
  }

  function closeImageOverlay() {
    imgOverlay.classList.remove('visible');
    imgOverlayImg.src = '';
    document.body.style.overflow = '';
    // Unlock and return to portrait on native only
    if (window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform()) {
      var SO = window.Capacitor.Plugins.ScreenOrientation;
      if (SO) SO.lock({ orientation: 'portrait' }).catch(function(){});
    }
  }

  // ── BUILD DOM ──────────────────────────────────────────────
  function buildPopupDOM() {
    overlay = document.createElement('div');
    overlay.id = 'helpOverlay';

    popup = document.createElement('div');
    popup.id = 'helpPopup';

    var header = document.createElement('div');
    header.id = 'helpPopupHeader';

    titleEl = document.createElement('span');
    titleEl.id = 'helpPopupTitle';

    closeBtn = document.createElement('button');
    closeBtn.id = 'helpPopupClose';
    closeBtn.textContent = '✕';
    closeBtn.setAttribute('aria-label', 'Close help');

    header.appendChild(titleEl);
    header.appendChild(closeBtn);

    bodyEl = document.createElement('div');
    bodyEl.id = 'helpPopupBody';

    popup.appendChild(header);
    popup.appendChild(bodyEl);
    overlay.appendChild(popup);
    document.body.appendChild(overlay);

    // Image fullscreen overlay
    imgOverlay = document.createElement('div');
    imgOverlay.id = 'helpImageOverlay';
    imgOverlayImg = document.createElement('img');
    var imgOverlayClose = document.createElement('button');
    imgOverlayClose.id = 'helpImageOverlayClose';
    imgOverlayClose.textContent = '✕';
    imgOverlayClose.setAttribute('aria-label', 'Close image');
    imgOverlay.appendChild(imgOverlayImg);
    imgOverlay.appendChild(imgOverlayClose);
    document.body.appendChild(imgOverlay);

    imgOverlayClose.addEventListener('click', closeImageOverlay);
    imgOverlay.addEventListener('pointerdown', function (e) {
      if (e.target === imgOverlay || e.target === imgOverlayImg) closeImageOverlay();
    });

    // Close on backdrop tap
    overlay.addEventListener('pointerdown', function (e) {
      if (e.target === overlay) closePopup();
    });
    closeBtn.addEventListener('click', closePopup);

    // Prevent popup scroll from closing
    popup.addEventListener('pointerdown', function (e) {
      e.stopPropagation();
    });
  }

  // ── OPEN / CLOSE ───────────────────────────────────────────
  function openPopup(key) {
    var content = window.helpContent && window.helpContent[key];
    if (!content) return;

    titleEl.textContent = content.title || key;

    // Build body HTML
    var html = '';
    if (content.image) {
      html += '<img id="helpPopupImage" src="help/images/' + content.image + '" alt="' + (content.title || '') + '" />';
    }
    if (content.body) {
      // Support array of paragraphs or plain string
      var paragraphs = Array.isArray(content.body) ? content.body : [content.body];
      paragraphs.forEach(function (p) {
        html += '<p>' + p + '</p>';
      });
    }
    if (content.list) {
      html += '<ul>';
      content.list.forEach(function (item) {
        html += '<li>' + item + '</li>';
      });
      html += '</ul>';
    }
    bodyEl.innerHTML = html;
    bodyEl.scrollTop = 0;

    // Wire double-tap to enlarge on the image if present
    var popupImg = bodyEl.querySelector('#helpPopupImage');
    if (popupImg) {
      // Add tap hint below image
      var hint = document.createElement('span');
      hint.className = 'help-image-hint';
      hint.textContent = 'Tap image to enlarge';
      popupImg.parentNode.insertBefore(hint, popupImg.nextSibling);

      // Tap-to-enlarge — single tap opens overlay
      // (touch-action:manipulation blocks dblclick/double-tap globally,
      //  so we just use a single tap on the image directly)
      popupImg.addEventListener('click', function (e) {
        e.stopPropagation();
        openImageOverlay(popupImg.src, popupImg.alt);
      });
    }

    overlay.classList.add('visible');
    document.body.style.overflow = 'hidden';

    // Mark first use
    if (!localStorage.getItem('bingoningo_help_used')) {
      localStorage.setItem('bingoningo_help_used', '1');
    }
  }

  function closePopup() {
    overlay.classList.remove('visible');
    document.body.style.overflow = '';
    bodyEl.innerHTML = '';
    currentTarget = null;
  }

  // ── LONG PRESS WIRING ──────────────────────────────────────
  function attachLongPress(el, key) {
    var moved = false;
    var startX, startY;

    function onDown(e) {
      moved = false;
      startX = e.clientX;
      startY = e.clientY;
      pressTimer = setTimeout(function () {
         // Disable long‑press when dots are hidden
       if (document.body.classList.contains('help-dots-hidden')) return;
        if (!moved) {
          currentTarget = el;
          triggerVibrate(30);
          openPopup(key);
        }
      }, LONG_PRESS_MS);
    }

    function onMove(e) {
      if (Math.abs(e.clientX - startX) > 8 || Math.abs(e.clientY - startY) > 8) {
        moved = true;
        clearTimeout(pressTimer);
      }
    }

    function onUp() {
      clearTimeout(pressTimer);
    }

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup',   onUp);
    el.addEventListener('pointercancel', onUp);

    // Prevent context menu on long press (mobile)
    el.addEventListener('contextmenu', function (e) {
      if (currentTarget === el) e.preventDefault();
    });
  }

  // ── INDICATOR DOTS ─────────────────────────────────────────
  // For positioned buttons: adds .help-available class (CSS ::after dot)
  function addButtonDot(el, lightBg) {
    el.classList.add('help-available');
    if (lightBg) el.classList.add('light-bg');
  }

  // For inline labels: injects a <span class="help-dot">?</span> after text
  function addInlineDot(el, lightBg) {
    var dot = document.createElement('span');
    dot.className = 'help-dot' + (lightBg ? ' light-bg' : '');
    dot.setAttribute('aria-hidden', 'true');
    dot.textContent = '?';
    el.appendChild(dot);
  }

  // ── VIBRATE ────────────────────────────────────────────────
  function triggerVibrate(ms) {
    if (navigator.vibrate) navigator.vibrate(ms);
  }

  // ── FIRST VISIT HINT ───────────────────────────────────────
  function showFirstVisitHint() {
    if (localStorage.getItem('bingoningo_help_used')) return;
    if (localStorage.getItem('bingoningo_help_hint_shown')) return;

    var hint = document.createElement('div');
    hint.id = 'helpFirstVisitHint';
    hint.innerHTML = 'Press and hold any <span style="display:inline-block;width:12px;height:12px;border-radius:50%;background:rgba(160,180,210,0.7);color:#fff;font-size:7px;font-weight:700;line-height:12px;text-align:center;vertical-align:middle;">?</span> button or label for a feature explanation';
    document.body.appendChild(hint);
    setTimeout(function () { hint.remove(); }, 5000);
    localStorage.setItem('bingoningo_help_hint_shown', '1');
  }

  // ── INIT ───────────────────────────────────────────────────
  // Call after DOM ready with a targets config array:
  //   { id: 'elementId', key: 'help_content_key', type: 'button'|'label'|'row' }
  // type 'button' → CSS ::after dot, long press on the element itself
  // type 'label'  → inline dot appended, long press on the element
  // type 'row'    → inline dot on label, long press on whole row element

  window.initDotsToggle = function () { initDotsToggle(); };

  window.initHelpSystem = function (targets) {
    buildPopupDOM();

    targets.forEach(function (cfg) {
      var el = document.getElementById(cfg.id);
      if (!el) return;

      var pressTarget = el; // element that receives the long press

      if (cfg.type === 'button') {
        addButtonDot(el, cfg.lightBg);
      } else if (cfg.type === 'label') {
        addInlineDot(el, cfg.lightBg);
      } else if (cfg.type === 'row') {
        // dot on the label child, press on the whole row
        var lbl = el.querySelector('label, span.options-row-label, span.settings-row-label, span.autocheck-options-label, span.tts-sub-label, span.player-codes-title, span.share-code-label, div');
        if (lbl) addInlineDot(lbl, cfg.lightBg);
        pressTarget = el;
      }

      attachLongPress(pressTarget, cfg.key);
    });

    showFirstVisitHint();
    initDotsToggle();
  };

  // ── DOTS TOGGLE ────────────────────────────────────────────
  function initDotsToggle() {
    // Apply saved preference on load
    if (localStorage.getItem('bingoningo_help_dots_hidden') === '1') {
      document.body.classList.add('help-dots-hidden');
    }
    // Wire up all toggle buttons
    document.querySelectorAll('.help-dots-toggle').forEach(function(btn) {
      updateToggleLabel(btn);
      btn.addEventListener('click', function() {
        var hidden = document.body.classList.toggle('help-dots-hidden');
        localStorage.setItem('bingoningo_help_dots_hidden', hidden ? '1' : '0');
        document.querySelectorAll('.help-dots-toggle').forEach(updateToggleLabel);
      });
    });
  }

  function updateToggleLabel(btn) {
    var hidden = document.body.classList.contains('help-dots-hidden');
    btn.innerHTML = '<span class="toggle-dot-sample">?</span>' +
      (hidden ? 'Show feature hints' : 'Hide feature hints');
  }

}());
