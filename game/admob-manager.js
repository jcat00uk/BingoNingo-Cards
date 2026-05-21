(function() {
  'use strict';

  var _initialised     = false;
  var _adReady         = false;
  var _afterAdCallback = null;  // set by maybeShowAdThenDo; called on interstitialAdDismissed

  // TODO: Replace with your real AdMob interstitial ad unit ID before production build
  var REAL_INTERSTITIAL_ID = 'ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX';
  var TEST_INTERSTITIAL_ID = 'ca-app-pub-3940256099942544/1033173712';

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

  function preloadInterstitial() {
    if (!isAdsEnabled() || !isNative()) return;
    var plugin = getPlugin();
    if (!plugin) return;
    _adReady = false;
    console.log('[AdMobManager] preloadInterstitial: requesting adId=' + getAdUnitId());
    plugin.prepareInterstitial({ adId: getAdUnitId() })
      .then(function() {
        _adReady = true;
        console.log('[AdMobManager] preloadInterstitial: ready');
      })
      .catch(function(e) {
        console.warn('[AdMobManager] prepareInterstitial failed:', e);
      });
  }

  function init() {
    console.log('[AdMobManager] init: adsEnabled=' + isAdsEnabled() + ' isNative=' + isNative() + ' initialised=' + _initialised);
    if (!isAdsEnabled() || !isNative() || _initialised) return;
    _initialised = true;
    var plugin = getPlugin();
    console.log('[AdMobManager] init: plugin=' + (plugin ? 'found' : 'NOT FOUND'));
    if (!plugin) return;

    plugin.initialize({})
      .then(function() { console.log('[AdMobManager] initialize: ok'); })
      .catch(function(e) {
        console.warn('[AdMobManager] initialize failed:', e);
      });

    // When the user closes an ad: record the time, fire any pending navigation
    // callback, then queue the next preload
    plugin.addListener('interstitialAdDismissed', function() {
      console.log('[AdMobManager] interstitialAdDismissed');
      localStorage.setItem('bingoningo_last_ad_ts', String(Date.now()));
      var cb = _afterAdCallback;
      _afterAdCallback = null;
      preloadInterstitial();
      if (cb) cb();
    });

    preloadInterstitial();
  }

  // Checks all gates; shows ad and calls callback after dismiss.
  // If any gate blocks (not native, freq cap, not ready, etc.) calls callback immediately.
  // First-ever trigger sets the 30-min timer without showing an ad (warm-start).
  function maybeShowAdThenDo(activityCount, callback) {
    var adsEnabled   = isAdsEnabled();
    var native       = isNative();
    var adsRemoved   = (typeof APP_EDITION !== 'undefined' && APP_EDITION === 'full')
                       && localStorage.getItem('bingoningo_ads_removed') === 'true';
    var zeroActivity = (activityCount !== null && activityCount !== undefined && activityCount === 0);

    // Not eligible for ads — skip immediately
    if (!adsEnabled || !native || adsRemoved || zeroActivity) {
      if (callback) callback();
      return;
    }

    var last = localStorage.getItem('bingoningo_last_ad_ts');

    // First ever trigger — warm the 30-min timer, no ad shown
    if (!last) {
      localStorage.setItem('bingoningo_last_ad_ts', String(Date.now()));
      if (callback) callback();
      return;
    }

    // Within the 30-min window — skip
    var freqBlocked = (Date.now() - parseInt(last, 10)) < 30 * 60 * 1000;
    if (freqBlocked || !_adReady) {
      if (callback) callback();
      return;
    }

    var plugin = getPlugin();
    if (!plugin) { if (callback) callback(); return; }

    _afterAdCallback = callback;
    plugin.showInterstitial()
      .then(function() { console.log('[AdMobManager] showInterstitial: shown'); })
      .catch(function(e) {
        console.warn('[AdMobManager] showInterstitial failed:', e);
        _adReady = false;
        _afterAdCallback = null;
        preloadInterstitial();
        if (callback) callback();
      });
  }

  // Fire-and-forget version (end-of-game triggers — no navigation needed)
  function maybeShowAd(activityCount) {
    maybeShowAdThenDo(activityCount, null);
  }

  window.AdMobManager = {
    init:                init,
    maybeShowAd:         maybeShowAd,
    maybeShowAdThenDo:   maybeShowAdThenDo,
    preloadInterstitial: preloadInterstitial
  };

})();
