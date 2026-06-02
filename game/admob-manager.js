(function() {
  'use strict';

  var _initialised = false;
  var _adReady     = false;

  // TODO: Replace with real AdMob interstitial ad unit ID before production build
  var REAL_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
  var TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

  // localStorage keys
  var KEY_LAST_AD       = 'bingoningo_last_ad_ts';
  var KEY_LAST_ACTIVITY = 'bingoningo_last_activity_ts';
  var KEY_SESSION_START = 'bingoningo_session_start';
  var KEY_SESSION_COUNT = 'bingoningo_session_ad_count';
  var KEY_GAME_START    = 'bingoningo_game_start_ts';

  // Thresholds
  var COOLDOWN_MS     = 20 * 60 * 1000;       // 20 min minimum between ads
  var SESSION_MS      = 4  * 60 * 60 * 1000;  // 4h rolling session window
  var SESSION_CAP     = 3;                     // max ads per 4h session
  var INACTIVITY_MS   = 24 * 60 * 60 * 1000;  // 24h inactivity triggers soft reset
  var MIN_DURATION_MS = 3  * 60 * 1000;        // 3 min minimum game duration

  function getAdUnitId() {
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

  function preloadInterstitial(retryMs) {
    if (!isAdsEnabled() || !isNative()) return;
    var plugin = getPlugin();
    if (!plugin) return;
    _adReady = false;
    plugin.prepareInterstitial({ adId: getAdUnitId() })
      .then(function() { _adReady = true; })
      .catch(function(e) {
        console.warn('[AdMobManager] prepareInterstitial failed:', e);
        var delay = retryMs || 30000;
        if (delay < 300000) {
          setTimeout(function() { preloadInterstitial(delay * 2); }, delay);
        }
      });
  }

  function init() {
    if (!isAdsEnabled() || !isNative() || _initialised) return;
    _initialised = true;
    var plugin = getPlugin();
    if (!plugin) return;

    plugin.initialize({})
      .catch(function(e) { console.warn('[AdMobManager] initialize failed:', e); });

    // Ad dismissed: record timestamp and increment session count here,
    // not at show-time, because showInterstitial() resolving only means
    // the call was accepted — not that the ad was actually displayed.
    plugin.addListener('interstitialAdOpened', function() {
      _adReady = false;
    });

    plugin.addListener('interstitialAdDismissed', function() {
      localStorage.setItem(KEY_LAST_AD, String(Date.now()));
      var count = parseInt(localStorage.getItem(KEY_SESSION_COUNT) || '0', 10);
      localStorage.setItem(KEY_SESSION_COUNT, String(count + 1));
      preloadInterstitial();
    });

    preloadInterstitial();
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

    // Clear stale game_start_ts from a previously force-closed session
    localStorage.removeItem(KEY_GAME_START);

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

    if (!_adReady) return;
    var plugin = getPlugin();
    if (!plugin) return;

    plugin.showInterstitial()
      .catch(function(e) {
        console.warn('[AdMobManager] showInterstitial failed:', e);
        _adReady = false;
        preloadInterstitial();
      });
  }

  window.AdMobManager = {
    init:                init,
    onEnterGameMode:     onEnterGameMode,
    recordGameStart:     recordGameStart,
    maybeShowAd:         maybeShowAd,
    preloadInterstitial: preloadInterstitial
  };

})();
