(function () {
  'use strict';

  // Mirror the thresholds from admob-manager.js so we can display them without
  // needing to expose private constants from that module.
  var COOLDOWN_MS     = 20 * 60 * 1000;
  var SESSION_MS      =  4 * 60 * 60 * 1000;
  var SESSION_CAP     = 3;
  var MIN_DURATION_MS =  3 * 60 * 1000;

  var KEY_LAST_AD       = 'bingoningo_last_ad_ts';
  var KEY_LAST_ACTIVITY = 'bingoningo_last_activity_ts';
  var KEY_SESSION_START = 'bingoningo_session_start';
  var KEY_SESSION_COUNT = 'bingoningo_session_ad_count';
  var KEY_GAME_START    = 'bingoningo_game_start_ts';

  var TAP_TARGET    = 7;
  var TAP_WINDOW_MS = 4000;

  // SHA-256 of the gate password. Never compare plaintext — hash the entered value and
  // compare hashes, so the password itself isn't sitting in plain text in the bundle.
  var PASSWORD_HASH = '547bd6b4f1f1253cc9e4c88261762fb3146fcdc2fd5153bcf5d645196b01d2f7';

  // sessionStorage — cleared on app kill (not on page navigation), so the unlock
  // doesn't survive a restart but does survive moving between pages.
  var SS_KEY_UNLOCKED  = 'bingoningo_addbg_unlocked';
  var SS_KEY_COLLAPSED = 'bingoningo_addbg_collapsed';

  var _taps          = [];
  var _panel         = null;
  var _refreshTimer  = null;

  function isUnlocked()  { return sessionStorage.getItem(SS_KEY_UNLOCKED) === '1'; }
  function isCollapsed() { return sessionStorage.getItem(SS_KEY_COLLAPSED) === '1'; }

  function sha256Hex(text) {
    var data = new TextEncoder().encode(text);
    return crypto.subtle.digest('SHA-256', data).then(function (buf) {
      return Array.prototype.map.call(new Uint8Array(buf), function (b) {
        return b.toString(16).padStart(2, '0');
      }).join('');
    });
  }

  // Format a millisecond duration as "Xm YYs" or "ready"
  function fmtMs(ms) {
    if (ms <= 0) return 'ready';
    var s = Math.ceil(ms / 1000);
    var m = Math.floor(s / 60);
    s = s % 60;
    return m + 'm ' + String(s).padStart(2, '0') + 's';
  }

  function fmtAgo(ts) {
    if (!ts) return 'never';
    return fmtMs(Date.now() - ts) + ' ago';
  }

  function getState() {
    var now          = Date.now();
    var lastAd       = parseInt(localStorage.getItem(KEY_LAST_AD)       || '0', 10);
    var lastActivity = parseInt(localStorage.getItem(KEY_LAST_ACTIVITY)  || '0', 10);
    var sessionStart = parseInt(localStorage.getItem(KEY_SESSION_START)  || '0', 10);
    var sessionCount = parseInt(localStorage.getItem(KEY_SESSION_COUNT)  || '0', 10);
    var gameStart    = parseInt(localStorage.getItem(KEY_GAME_START)     || '0', 10);

    var dbg = (window.AdMobManager && window.AdMobManager.getDebugState)
      ? window.AdMobManager.getDebugState()
      : { adReady: null, initialised: null, lastError: null, initError: null, consentInfo: null,
          adUnitId: null, isTestAdUnit: null, testDeviceCount: 0, buildMode: null,
          pluginAvailable: null, isNative: null, adsEnabled: null };

    return {
      lastAd:            lastAd,
      lastActivity:      lastActivity,
      sessionStart:      sessionStart,
      sessionCount:      sessionCount,
      gameStart:         gameStart,
      cooldownMs:        lastAd ? Math.max(0, COOLDOWN_MS - (now - lastAd)) : 0,
      sessionResetMs:    sessionStart ? Math.max(0, SESSION_MS - (now - sessionStart)) : 0,
      gameDurationMs:    gameStart ? (now - gameStart) : 0,
      adReady:           dbg.adReady,
      initialised:       dbg.initialised,
      lastError:         dbg.lastError,
      initError:         dbg.initError,
      consentInfo:       dbg.consentInfo,
      adUnitId:          dbg.adUnitId,
      isTestAdUnit:      dbg.isTestAdUnit,
      testDeviceCount:   dbg.testDeviceCount,
      buildMode:         dbg.buildMode,
      pluginAvailable:   dbg.pluginAvailable,
      isNative:          dbg.isNative,
      adsEnabled:        dbg.adsEnabled
    };
  }

  function renderRows(s) {
    // Whether this load is expected to come back labelled "Test Ad": always true on the
    // test ad unit, and likely true on the real ad unit if test devices are configured
    // (can't confirm the running device's own ID matches from JS, only that config exists).
    var willBeTestAd = s.isTestAdUnit
      ? '✅ Yes (test ad unit)'
      : (s.testDeviceCount > 0 ? '❓ Likely (if device registered)' : '❌ No — real ads only');

    var rows = [
      ['Build mode',    s.buildMode || '?'],
      ['Ad unit',       s.adUnitId ? (s.isTestAdUnit ? 'Test ID' : 'Real ID') + ' (' + s.adUnitId.slice(-6) + ')' : '?'],
      ['Will be "Test Ad"', willBeTestAd],
      ['Test devices configured', s.testDeviceCount],
      ['Native bridge', s.isNative === null ? '?' : (s.isNative ? '✅ Yes' : '❌ No (web)')],
      ['AdMob plugin',  s.pluginAvailable === null ? '?' : (s.pluginAvailable ? '✅ Found' : '❌ Missing')],
      ['Ads enabled (config)', s.adsEnabled === null ? '?' : (s.adsEnabled ? '✅ Yes' : '❌ No')],
      ['Initialised',   s.initialised === null ? '?' : (s.initialised ? '✅ Yes' : '❌ No')],
      ['Init error',    s.initError ? '⚠ ' + s.initError : 'none'],
      ['Consent status', s.consentInfo
        ? s.consentInfo.status + (s.consentInfo.privacyOptionsRequirementStatus === 'REQUIRED' ? ' (privacy opts required)' : '')
        : '?'],
      ['Force test unit', s.forceTestUnit ? '🔀 ON (sample ID)' : 'off (real ID)'],
      ['Ad loaded',     s.adReady     === null ? '?' : (s.adReady     ? '✅ Yes' : '❌ No')],
      ['Cooldown',      s.cooldownMs  > 0 ? '⏳ ' + fmtMs(s.cooldownMs) : '✅ Ready'],
      ['Last ad shown', fmtAgo(s.lastAd)],
      ['Session ads',   s.sessionCount + ' / ' + SESSION_CAP + (s.sessionCount >= SESSION_CAP ? ' ⛔ CAPPED' : ' ✅')],
      ['Session resets in', s.sessionResetMs > 0 ? fmtMs(s.sessionResetMs) : 'resets now'],
      ['Game running',  s.gameStart ? '✅ ' + fmtMs(s.gameDurationMs) + ' elapsed' : '❌ No'],
      ['Min duration',  s.gameStart
        ? (s.gameDurationMs >= MIN_DURATION_MS ? '✅ Met' : '⏳ Need ' + fmtMs(MIN_DURATION_MS - s.gameDurationMs))
        : 'n/a'],
      ['Last activity', fmtAgo(s.lastActivity)],
      ['Last error',    s.lastError
        ? '⚠ ' + s.lastError.source + ' [' + s.lastError.code + '] ' + fmtAgo(s.lastError.ts)
        : 'none']
    ];

    var html = '<table style="width:100%;font-size:12px;border-collapse:collapse">';
    rows.forEach(function (r) {
      html += '<tr>'
        + '<td style="padding:3px 6px;color:#aaa;white-space:nowrap">' + r[0] + '</td>'
        + '<td style="padding:3px 6px;text-align:right">'              + r[1] + '</td>'
        + '</tr>';
    });
    html += '</table>';
    return html;
  }

  function updateToggleBtn() {
    if (!_panel) return;
    var btn = _panel.querySelector('#addbg-toggle-test');
    if (!btn) return;
    var on = sessionStorage.getItem('bingoningo_addbg_force_test_unit') === '1';
    btn.textContent = on ? '🔀 Using Sample Unit' : 'Use Sample Unit';
    btn.style.borderColor = on ? '#ffcc44' : '#886600';
    btn.style.color = on ? '#ffcc44' : '#886600';
  }

  function refreshPanel() {
    if (!_panel) return;
    _panel.querySelector('.addbg-status').innerHTML = renderRows(getState());
    updateToggleBtn();
  }

  function showMsg(text) {
    var el = _panel && _panel.querySelector('#addbg-msg');
    if (!el) return;
    el.textContent = text;
    setTimeout(function () { if (el) el.textContent = ''; }, 3000);
  }

  // Small floating tab shown when the panel is collapsed — tap to re-expand.
  function renderCollapsed() {
    if (_panel) { _panel.remove(); _panel = null; }
    clearInterval(_refreshTimer);
    _refreshTimer = null;

    _panel = document.createElement('div');
    _panel.style.cssText = [
      'position:fixed', 'bottom:8px', 'right:8px',
      'background:#1a1a1a', 'border:2px solid #ff6644', 'border-radius:20px',
      'padding:6px 12px', 'z-index:99999',
      'font-family:Arial,sans-serif', 'color:#ff6644', 'font-size:12px', 'font-weight:bold',
      'cursor:pointer', 'box-shadow:0 2px 10px rgba(0,0,0,0.8)'
    ].join(';');
    _panel.textContent = '\u{1F527}';
    _panel.addEventListener('click', function () {
      sessionStorage.setItem(SS_KEY_COLLAPSED, '0');
      renderExpanded();
    });
    document.body.appendChild(_panel);
  }

  function renderExpanded() {
    if (_panel) { _panel.remove(); _panel = null; }
    clearInterval(_refreshTimer);
    _refreshTimer = null;

    _panel = document.createElement('div');
    _panel.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:#1a1a1a', 'border-top:2px solid #ff6644',
      'padding:12px 14px 14px',
      'z-index:99999',
      'font-family:Arial,sans-serif', 'color:#eee',
      'box-shadow:0 -4px 20px rgba(0,0,0,0.8)',
      'max-height:70vh', 'overflow-y:auto',
      'box-sizing:border-box'
    ].join(';');

    _panel.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">',
        '<span style="font-size:13px;font-weight:bold;color:#ff6644">&#x1F527; Ad Debug</span>',
        '<div style="display:flex;gap:6px">',
          '<button id="addbg-collapse" style="background:#333;border:1px solid #555;border-radius:4px;',
            'color:#eee;padding:2px 10px;cursor:pointer;font-size:13px;line-height:1.4">&#x2212;</button>',
          '<button id="addbg-close" style="background:#333;border:1px solid #555;border-radius:4px;',
            'color:#eee;padding:2px 10px;cursor:pointer;font-size:13px;line-height:1.4">&#x2715;</button>',
        '</div>',
      '</div>',
      '<div class="addbg-status"></div>',
      '<div style="display:flex;gap:8px;margin-top:10px;flex-wrap:wrap">',
        '<button id="addbg-reset" style="flex:1;min-width:80px;padding:8px 4px;',
          'background:#2a1a1a;border:1px solid #cc4400;border-radius:6px;',
          'color:#ff8866;cursor:pointer;font-size:12px">Reset Timers</button>',
        '<button id="addbg-force" style="flex:1;min-width:80px;padding:8px 4px;',
          'background:#1a2a1a;border:1px solid #00aa44;border-radius:6px;',
          'color:#44ff88;cursor:pointer;font-size:12px">Force Ad</button>',
        '<button id="addbg-load" style="flex:1;min-width:80px;padding:8px 4px;',
          'background:#1a1a2a;border:1px solid #0055aa;border-radius:6px;',
          'color:#4488ff;cursor:pointer;font-size:12px">Reload Ad</button>',
        '<button id="addbg-toggle-test" style="flex:1;min-width:80px;padding:8px 4px;',
          'background:#1a1a2a;border:1px solid #886600;border-radius:6px;',
          'color:#ffcc44;cursor:pointer;font-size:12px">Toggle Test Unit</button>',
      '</div>',
      '<div id="addbg-msg" style="margin-top:6px;font-size:11px;color:#888;min-height:16px;text-align:center"></div>'
    ].join('');

    document.body.appendChild(_panel);

    _panel.querySelector('#addbg-close').addEventListener('click', lockAndClose);
    _panel.querySelector('#addbg-collapse').addEventListener('click', function () {
      sessionStorage.setItem(SS_KEY_COLLAPSED, '1');
      renderCollapsed();
    });

    _panel.querySelector('#addbg-reset').addEventListener('click', function () {
      if (window.AdMobManager && window.AdMobManager.resetDebugTimers) {
        window.AdMobManager.resetDebugTimers();
      } else {
        [KEY_LAST_AD, KEY_LAST_ACTIVITY, KEY_SESSION_START, KEY_SESSION_COUNT, KEY_GAME_START]
          .forEach(function (k) { localStorage.removeItem(k); });
      }
      showMsg('Timers cleared');
      refreshPanel();
    });

    _panel.querySelector('#addbg-force').addEventListener('click', function () {
      if (window.AdMobManager && window.AdMobManager.forceShowAd) {
        window.AdMobManager.forceShowAd();
        showMsg('Force show called');
      } else {
        showMsg('Not available (native only)');
      }
    });

    _panel.querySelector('#addbg-load').addEventListener('click', function () {
      if (window.AdMobManager && window.AdMobManager.forceReloadAd) {
        window.AdMobManager.forceReloadAd();
        showMsg('Reload triggered');
      } else {
        showMsg('Not available (native only)');
      }
    });

    _panel.querySelector('#addbg-toggle-test').addEventListener('click', function () {
      if (!window.AdMobManager) { showMsg('Not available'); return; }
      var on = sessionStorage.getItem('bingoningo_addbg_force_test_unit') === '1';
      var turningOn = !on;
      window.AdMobManager.setForceTestUnit(turningOn);
      if (window.AdMobManager.forceReloadAd) window.AdMobManager.forceReloadAd();
      showMsg(turningOn ? '🔀 Sample test unit active — reloading' : 'Real ad unit restored — reloading');
      updateToggleBtn();
      refreshPanel();
    });
    updateToggleBtn();

    refreshPanel();
    _refreshTimer = setInterval(refreshPanel, 1000);
  }

  // Full dismiss — clears the unlock, so next access needs the 7-tap + password again.
  function lockAndClose() {
    if (_panel) { _panel.remove(); _panel = null; }
    clearInterval(_refreshTimer);
    _refreshTimer = null;
    sessionStorage.removeItem(SS_KEY_UNLOCKED);
    sessionStorage.removeItem(SS_KEY_COLLAPSED);
  }

  function openPanel() {
    if (_panel) return;
    isCollapsed() ? renderCollapsed() : renderExpanded();
  }

  function showPasswordPrompt() {
    if (_panel) return;

    _panel = document.createElement('div');
    _panel.style.cssText = [
      'position:fixed', 'bottom:0', 'left:0', 'right:0',
      'background:#1a1a1a', 'border-top:2px solid #ff6644',
      'padding:14px', 'z-index:99999',
      'font-family:Arial,sans-serif', 'color:#eee',
      'box-shadow:0 -4px 20px rgba(0,0,0,0.8)', 'box-sizing:border-box'
    ].join(';');

    _panel.innerHTML = [
      '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px">',
        '<span style="font-size:13px;font-weight:bold;color:#ff6644">&#x1F512; Ad Debug Locked</span>',
        '<button id="addbg-pw-cancel" style="background:#333;border:1px solid #555;border-radius:4px;',
          'color:#eee;padding:2px 10px;cursor:pointer;font-size:13px;line-height:1.4">&#x2715;</button>',
      '</div>',
      '<input id="addbg-pw-input" type="password" placeholder="Password" autocomplete="off" style="',
        'width:100%;box-sizing:border-box;padding:8px;border-radius:6px;border:1px solid #555;',
        'background:#111;color:#eee;font-size:14px" />',
      '<div id="addbg-pw-msg" style="margin-top:6px;font-size:11px;color:#ff8866;min-height:14px;text-align:center"></div>'
    ].join('');

    document.body.appendChild(_panel);

    var input = _panel.querySelector('#addbg-pw-input');
    var msg   = _panel.querySelector('#addbg-pw-msg');

    function cancel() {
      if (_panel) { _panel.remove(); _panel = null; }
    }

    function trySubmit() {
      var value = input.value;
      sha256Hex(value).then(function (hash) {
        if (hash === PASSWORD_HASH) {
          sessionStorage.setItem(SS_KEY_UNLOCKED, '1');
          sessionStorage.setItem(SS_KEY_COLLAPSED, '0');
          cancel();
          renderExpanded();
        } else {
          msg.textContent = 'Incorrect password';
          input.value = '';
        }
      });
    }

    _panel.querySelector('#addbg-pw-cancel').addEventListener('click', cancel);
    input.addEventListener('keydown', function (e) { if (e.key === 'Enter') trySubmit(); });
    input.focus();
  }

  // Attach the 7-tap trigger to a version label element, and restore the panel on this
  // page if it was already unlocked (open or collapsed) before navigating here.
  // Ignored while big-card-active is set on body.
  function attach(label) {
    label.style.pointerEvents = 'auto';
    label.style.cursor = 'default';

    if (isUnlocked()) openPanel();

    label.addEventListener('click', function () {
      if (document.body.classList.contains('big-card-active')) return;

      var now = Date.now();
      _taps = _taps.filter(function (t) { return now - t < TAP_WINDOW_MS; });
      _taps.push(now);

      if (_taps.length >= TAP_TARGET) {
        _taps = [];
        isUnlocked() ? openPanel() : showPasswordPrompt();
      }
    });
  }

  window.AdDebugPanel = { attach: attach };

})();
