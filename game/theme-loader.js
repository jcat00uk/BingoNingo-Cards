/* =============================================
   BingoNingo — Page UI theme loader
   theme-loader.js
   Reads the saved page UI theme from localStorage and applies it on load.
   Loaded by: playgame.html only. No picker, no UI.
============================================= */

document.addEventListener('DOMContentLoaded', function() {
  applyTheme(getActiveTheme());
});
