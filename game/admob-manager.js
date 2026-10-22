(function() {
  'use strict';

  var _initialised   = false;
  var _adReady       = false;
  var _lastError     = null; // { source, code, message, ts } — most recent prepare/show failure, for debug panel
  var _consentInfo   = null; // raw result of requestConsentInfo(), for debug panel
  var _initError     = null; // message from plugin.initialize() failure, if any

  // TODO: Replace with real AdMob interstitial ad unit ID before production build
  var REAL_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
  var TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

  // Devices registered here receive real ads marked as test traffic — they load/display
  // normally but never count toward impressions, clicks, or invalid-activity scoring.
  // Add a device's ID here (from logcat: "...setTestDeviceIds(Arrays.asList(\"ID\"))...")
  // after running a real-ad-unit build on it once.
  // Note: the SDK computes this ID per app package, so different build variants
  // (free/paid, debug/release) report different IDs even on the same physical device.
  var TEST_DEVICE_IDS = [
    '33B162799CB8F705DDDD6D9792AD39D1',
    'DF3B11D5817D90C1745D9C1037FC96AF',
    'F83B9C413A2A7171404EFE1BA9FA1E69'
  ];

  // localStorage keys
  var KEY_LAST_AD       = 'bingoningo_last_ad_ts';
  var KEY_LAST_ACTIVITY = 'bingoningo_last_activity_ts';
  var KEY_SESSION_START = 'bingoningo_session_start';
  var KEY_SESSION_COUNT = 'bingoningo_session_ad_count';
  var KEY_GAME_START    = 'bingoningo_game_start_ts';

  // sessionStorage key (not localStorage — only needs to survive page navigation, not app restarts)
  var SS_KEY_LAST_PRELOAD_ATTEMPT = 'bingoningo_last_preload_attempt_ts';
  // Mirrors _adReady into sessionStorage so it survives page navigation — the native
  // interstitial ad object is a static field that outlives page loads (confirmed: it's
  // only ever replaced on a new successful load, never nulled on dismiss), but _adReady
  // itself is plain JS state that resets every page. This key lets the debug panel show
  // accurate cross-page state instead of the page-local (and often stale) JS flag.
  var SS_KEY_AD_READY = 'bingoningo_ad_ready';

  // Thresholds
  var COOLDOWN_MS      = 20 * 60 * 1000;       // 20 min minimum between ads
  var SESSION_MS       = 4  * 60 * 60 * 1000;  // 4h rolling session window
  var SESSION_CAP      = 3;                     // max ads per 4h session
  var INACTIVITY_MS    = 24 * 60 * 60 * 1000;  // 24h inactivity triggers soft reset
  var MIN_DURATION_MS  = 3  * 60 * 1000;        // 3 min minimum game duration
  var PRELOAD_DEBOUNCE_MS = 20 * 1000;          // ignore preload requests made within 20s of the last attempt

  var SS_KEY_FORCE_TEST_UNIT = 'bingoningo_addbg_force_test_unit';

  function getAdUnitId() {
    if (sessionStorage.getItem(SS_KEY_FORCE_TEST_UNIT) === '1') return TEST_INTERSTITIAL_ID;
    return (typeof APP_BUILD_MODE !== 'undefined' && APP_BUILD_MODE === 'release')
      ? REAL_INTERSTITIAL_ID
      : TEST_INTERSTITIAL_ID;
  }

  function isAdsEnabled() {
    return typeof APP_ADS !== 'undefined' && APP_ADS === 'true';
  }

  function isNative() {
    return !!(window.Capacitor && window.Capacitor.isNativePlatform());
  }

  function getPlugin() {
    return window.Capacitor &&
           window.Capacitor.Plugins &&
           window.Capacitor.Plugins.AdMob;
  }

  function isAdsRemoved() {
    return (typeof APP_EDITION !== 'undefined' && APP_EDITION === 'full') &&
           localStorage.getItem('bingoningo_ads_removed') === 'true';
  }

  function recordError(source, e) {
    var code = e && (e.code !== undefined ? e.code : e.errorCode);

    // The native FailedToLoad/FailedToShow events (which carry the real numeric code)
    // fire just before the paired promise rejects (which never carries a code) — don't
    // let that later, code-less rejection clobber the more useful event-based record.
    if (code === undefined && _lastError && _lastError.code !== undefined && (Date.now() - _lastError.ts) < 2000) {
      return;
    }

    _lastError = {
      source:  source,
      code:    code,
      message: (e && (e.message || String(e))) || 'unknown',
      ts:      Date.now()
    };
  }

  function showPrivacyOptions() {
    var plugin = getPlugin();
    if (!plugin) return;
    plugin.showPrivacyOptionsForm()
      .catch(function(e) { console.warn('[AdMobManager] showPrivacyOptionsForm failed:', e); });
  }

  function preloadInterstitial(retryMs) {
    if (!isAdsEnabled() || !isNative()) return;
    var plugin = getPlugin();
    if (!plugin) return;

    // Debounce fresh (non-retry) requests only — retries already pace themselves via
    // exponential backoff. Prevents a burst of prepareInterstitial calls when init()
    // fires on consecutive page loads during fast navigation between screens.
    if (!retryMs) {
      var lastAttempt = parseInt(sessionStorage.getItem(SS_KEY_LAST_PRELOAD_ATTEMPT) || '0', 10);
      if (lastAttempt && (Date.now() - lastAttempt) < PRELOAD_DEBOUNCE_MS) return;
    }
    sessionStorage.setItem(SS_KEY_LAST_PRELOAD_ATTEMPT, String(Date.now()));

    _adReady = false;

    // Timeout guard: prepareInterstitial() can stall indefinitely on a slow/stalled
    // connection without ever resolving or rejecting, which would otherwise leave
    // _adReady stuck false forever with no error recorded and no retry scheduled —
    // the exact "no ad loads until I manually hit Reload" symptom. If the real call
    // eventually does settle after this fires, its .then()/.catch() below still runs
    // and is harmless (at worst a redundant _adReady=true or an extra retry).
    var prepareTimedOut = new Promise(function(resolve) {
      setTimeout(function() { resolve({ _timedOut: true }); }, 25000);
    });

    Promise.race([plugin.prepareInterstitial({ adId: getAdUnitId() }), prepareTimedOut])
      .then(function(result) {
        if (result && result._timedOut) {
          throw new Error('prepareInterstitial timed out after 25s');
        }
        _adReady = true;
        sessionStorage.setItem(SS_KEY_AD_READY, '1');
      })
      .catch(function(e) {
        console.warn('[AdMobManager] prepareInterstitial failed:', e);
        recordError('prepareInterstitial', e);
        var delay = retryMs || 30000;
        if (delay < 300000) {
          setTimeout(function() { preloadInterstitial(delay * 2); }, delay);
        }
      });
  }

  // Request UMP consent info; show form if required for EEA/UK/Switzerland users, and reveal
  // the "Ad preferences" entry point when Google requires one. Runs once per page and returns
  // the same promise to every caller: the menu calls it on its own (first thing on first run,
  // before What's New), the game pages through init(). Never rejects.
  // Timeout guard: requestConsentInfo() is a network call to Google's UMP servers
  // with no timeout of its own — on a stalled connection its callback may never
  // fire at all (neither resolve nor reject), which would otherwise leave this
  // entire chain hung forever with no error ever recorded.
  var _consentPromise = null;
  function requestConsent() {
    if (_consentPromise) return _consentPromise;
    var plugin = getPlugin();
    if (!isAdsEnabled() || !isNative() || !plugin) return (_consentPromise = Promise.resolve());

    var consentTimedOut = new Promise(function(resolve) {
      setTimeout(function() { resolve({ _timedOut: true }); }, 8000);
    });
    _consentPromise = Promise.race([plugin.requestConsentInfo({}), consentTimedOut])
      .then(function(consentInfo) {
        if (consentInfo && consentInfo._timedOut) {
          console.warn('[AdMobManager] consent info timed out after 8s');
          return;
        }
        _consentInfo = consentInfo;
        // Revocation entry point: only shown when Google requires it (EEA/UK/Switzerland users)
        if (consentInfo.privacyOptionsRequirementStatus === 'REQUIRED') {
          var adPrefRow = document.getElementById('adPreferencesRow');
          var adPrefBtn = document.getElementById('adPreferencesBtn');
          if (adPrefRow) adPrefRow.style.display = '';
          if (adPrefBtn) adPrefBtn.addEventListener('click', showPrivacyOptions);
        }
        // Show initial consent form only if user hasn't consented yet
        if (consentInfo.isConsentFormAvailable && consentInfo.status === 'REQUIRED') {
          return plugin.showConsentForm();
        }
      })
      .catch(function(e) {
        console.warn('[AdMobManager] consent info failed:', e);
      })
      .then(function() {
        if (window.Analytics) window.Analytics.enable();
      });
    return _consentPromise;
  }

  function init() {
    if (!isAdsEnabled() || !isNative() || _initialised) return;
    _initialised = true;
    var plugin = getPlugin();
    if (!plugin) return;

    // Ad dismissed: record timestamp and increment session count here,
    // not at show-time, because showInterstitial() resolving only means
    // the call was accepted — not that the ad was actually displayed.
    plugin.addListener('interstitialAdOpened', function() {
      _adReady = false;
      sessionStorage.removeItem(SS_KEY_AD_READY);
      if (window.Analytics) window.Analytics.adShown();
    });

    plugin.addListener('interstitialAdDismissed', function() {
      localStorage.setItem(KEY_LAST_AD, String(Date.now()));
      var count = parseInt(localStorage.getItem(KEY_SESSION_COUNT) || '0', 10);
      localStorage.setItem(KEY_SESSION_COUNT, String(count + 1));
      preloadInterstitial();
    });

    // The promise rejections from prepareInterstitial/showInterstitial only carry a
    // message string, never the numeric AdMob error code — the code is only available
    // via these listener events, so capture it here for the debug panel.
    plugin.addListener('interstitialAdFailedToLoad', function(e) {
      recordError('interstitialAdFailedToLoad', e);
    });
    plugin.addListener('interstitialAdFailedToShow', function(e) {
      recordError('interstitialAdFailedToShow', e);
    });

    // Consent first; always proceed to initialize regardless of outcome — AdMob serves
    // the appropriate ad type (personalized or non-personalized) based on the consent result.
    requestConsent()
      .then(function() {
        plugin.initialize({
          testingDevices: TEST_DEVICE_IDS,
          // Note: despite the name, this native plugin uses this flag only to decide
          // whether to apply testingDevices at all — it has no other effect. Always
          // true so registered test devices work on release builds too.
          initializeForTesting: true
        })
          .then(function() { preloadInterstitial(); })
          .catch(function(e) {
            console.warn('[AdMobManager] initialize failed:', e);
            _initError = (e && (e.message || String(e))) || 'unknown';
          });
      });
  }

  // Called on page load of Bingocaller.html and playgame.html.
  // Handles warm-start, 24h inactivity reset, 4h session rollover,
  // and clears any stale game_start_ts from a previously interrupted session.
  // Never shows an ad.
  function onEnterGameMode() {
    if (!isAdsEnabled() || !isNative() || isAdsRemoved()) return;

    var now         = Date.now();
    var lastActivity = parseInt(localStorage.getItem(KEY_LAST_ACTIVITY) || '0', 10);

    // 24h inactivity — soft reset ad cooldown and session state
    if (lastActivity && (now - lastActivity) > INACTIVITY_MS) {
      localStorage.setItem(KEY_SESSION_START, String(now));
      localStorage.setItem(KEY_SESSION_COUNT, '0');
    }

    // Warm-start: first ever launch — set cooldown anchor without showing an ad
    if (!localStorage.getItem(KEY_LAST_AD)) {
      localStorage.setItem(KEY_LAST_AD, String(now));
    }

    // Session init or 4h rollover
    var sessionStart = parseInt(localStorage.getItem(KEY_SESSION_START) || '0', 10);
    if (!sessionStart || (now - sessionStart) > SESSION_MS) {
      localStorage.setItem(KEY_SESSION_START, String(now));
      localStorage.setItem(KEY_SESSION_COUNT, '0');
    }

    // Clear stale game_start_ts on fresh app launch only — not on in-session navigation.
    // sessionStorage survives page-to-page navigation within the same WebView session
    // but is cleared when the app is killed, so it reliably identifies true fresh launches.
    if (!sessionStorage.getItem('bingoningo_session_active')) {
      sessionStorage.setItem('bingoningo_session_active', '1');
      localStorage.removeItem(KEY_GAME_START);
    }

    // Update last activity timestamp
    localStorage.setItem(KEY_LAST_ACTIVITY, String(now));
  }

  // Called when a game actually begins:
  //   Caller → inside startGame()
  //   Player → inside Confirm Cards action
  function recordGameStart() {
    if (!isAdsEnabled() || !isNative() || isAdsRemoved()) return;
    localStorage.setItem(KEY_GAME_START, String(Date.now()));
  }

  // Called from End Game confirm callback only — never during active gameplay.
  // activityCount: calledNumbers.length (caller) or marked cells count (player).
  // Consumes game_start_ts immediately to prevent any reuse.
  function maybeShowAd(activityCount) {
    if (!isAdsEnabled() || !isNative() || isAdsRemoved()) return;

    // Consume and validate game duration first
    var gameStart = parseInt(localStorage.getItem(KEY_GAME_START) || '0', 10);
    localStorage.removeItem(KEY_GAME_START);

    var now = Date.now();

    if (!activityCount || activityCount < 1) return;           // nothing happened
    if (!gameStart || (now - gameStart) < MIN_DURATION_MS) return; // < 90s played

    // 30-min cooldown between ads
    var lastAd = parseInt(localStorage.getItem(KEY_LAST_AD) || '0', 10);
    if (lastAd && (now - lastAd) < COOLDOWN_MS) return;

    // Session cap: max 3 ads per 4h window
    var sessionCount = parseInt(localStorage.getItem(KEY_SESSION_COUNT) || '0', 10);
    if (sessionCount >= SESSION_CAP) return;

    var plugin = getPlugin();
    if (!plugin) return;

    // Not gating on _adReady here: the native interstitial ad object is a static
    // field that outlives page navigation, but _adReady is plain JS state that
    // resets on every page load in this multi-page app — it goes stale (false)
    // far more often than the native ad actually is. showInterstitial() itself
    // already rejects cleanly if there's genuinely nothing loaded (handled below).
    plugin.showInterstitial()
      .catch(function(e) {
        console.warn('[AdMobManager] showInterstitial failed:', e);
        recordError('showInterstitial', e);
        _adReady = false;
        sessionStorage.removeItem(SS_KEY_AD_READY);
        preloadInterstitial();
      });
  }

  window.AdMobManager = {
    init:                init,
    requestConsent:      requestConsent,
    onEnterGameMode:     onEnterGameMode,
    recordGameStart:     recordGameStart,
    maybeShowAd:         maybeShowAd,
    preloadInterstitial: preloadInterstitial,
    showPrivacyOptions:  showPrivacyOptions,

    // Debug helpers — used by AdDebugPanel only
    getDebugState: function () {
      return {
        // Read from sessionStorage, not the JS _adReady var — the latter resets on
        // every page navigation and would misreport "No" even when the native ad
        // (a static field that outlives page loads) is genuinely still cached.
        adReady:          sessionStorage.getItem(SS_KEY_AD_READY) === '1',
        initialised:      _initialised,
        lastError:        _lastError,
        initError:        _initError,
        consentInfo:      _consentInfo,
        adUnitId:         getAdUnitId(),
        isTestAdUnit:     getAdUnitId() === TEST_INTERSTITIAL_ID,
        forceTestUnit:    sessionStorage.getItem(SS_KEY_FORCE_TEST_UNIT) === '1',
        testDeviceCount:  TEST_DEVICE_IDS.length,
        buildMode:        (typeof APP_BUILD_MODE !== 'undefined') ? APP_BUILD_MODE : 'undefined',
        pluginAvailable:  !!getPlugin(),
        isNative:         isNative(),
        adsEnabled:       isAdsEnabled()
      };
    },
    setForceTestUnit: function (on) {
      if (on) {
        sessionStorage.setItem(SS_KEY_FORCE_TEST_UNIT, '1');
      } else {
        sessionStorage.removeItem(SS_KEY_FORCE_TEST_UNIT);
      }
    },
    // Like preloadInterstitial() but bypasses the 20s debounce — for debug panel use only.
    forceReloadAd: function () {
      sessionStorage.removeItem(SS_KEY_LAST_PRELOAD_ATTEMPT);
      preloadInterstitial();
    },
    forceShowAd: function () {
      var plugin = getPlugin();
      if (!plugin) return;
      plugin.showInterstitial()
        .catch(function (e) {
          console.warn('[AdMobManager] forceShowAd failed:', e);
          recordError('forceShowAd', e);
        });
    },
    resetDebugTimers: function () {
      [KEY_LAST_AD, KEY_LAST_ACTIVITY, KEY_SESSION_START, KEY_SESSION_COUNT, KEY_GAME_START]
        .forEach(function (k) { localStorage.removeItem(k); });
    }
  };

})();
