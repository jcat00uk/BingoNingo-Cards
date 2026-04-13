/* =============================================
   BingoNingo — Shared theme logic
   theme-core.js
   Load AFTER theme-presets.js.
   Loaded by: Bingocaller.html, index.html, playgame.html
   NOT loaded by: printcards.html
============================================= */

var BUILTIN_THEMES = window.BINGONINGO_BUILTIN_THEMES || [];
var LS_ACTIVE = 'bingoningo_theme_active';
var LS_SAVED  = 'bingoningo_theme_saved';

function deepCopy(o) {
  return JSON.parse(JSON.stringify(o));
}

function applyTheme(vars) {
  Object.entries(vars).forEach(function(pair) {
    document.documentElement.style.setProperty(pair[0], pair[1]);
  });
}

function getActiveTheme() {
  try {
    var stored = JSON.parse(localStorage.getItem(LS_ACTIVE));
    if (stored && typeof stored === 'object') return stored;
  } catch(e) {}
  return deepCopy(BUILTIN_THEMES[0].vars);
}

function persistActiveTheme(vars) {
  localStorage.setItem(LS_ACTIVE, JSON.stringify(vars));
}

function getCustomThemes() {
  try {
    return JSON.parse(localStorage.getItem(LS_SAVED)) || [];
  } catch(e) { return []; }
}

function persistCustomThemes(arr) {
  localStorage.setItem(LS_SAVED, JSON.stringify(arr));
}

function allThemes() {
  return [].concat(BUILTIN_THEMES, getCustomThemes());
}
