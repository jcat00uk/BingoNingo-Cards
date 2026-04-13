 /*=============================================
   BingoNingo — Shared built-in theme definitions
   themes.js
   Used by app.js, builder.js
============================================= */

var BINGONINGO_BUILTIN_THEMES = [
   {
      name: "Default",
      vars: {
        "--bg-page": "#121212", "--bg-surface": "#1e1e1e", "--bg-cell": "#2a2a2a",
        "--bg-input": "#333333", "--strip-bg": "#333333", "--border": "#444444",
        "--text-primary": "#eeeeee", "--text-muted": "#888888", "--text-faint": "#555555",
        "--btn-bg": "#444444", "--btn-text": "#eeeeee",
        "--accent": "#ff6666", "--action-btn-bg": "#cc0000", "--action-btn-text": "#ffffff",
        "--lingo-text": "#ff6666",
        "--called-bg": "#ff6666", "--called-text": "#ffffff",
        "--last-called-bg": "#3399ff", "--last-called-text": "#ffffff",
        "--bubble-bg": "#ffcc00", "--bubble-text": "#cc0000",
        "--card-match-bg": "#e6b800", "--card-match-text": "#000000",
        "--win-glow": "#ff0000", "--win-text-colour": "#ffff00",
        "--next-win-text": "#ff6666"

      }
    },
    {
      name: "Soft Mint",
      vars: {
        "--bg-page": "#1E2423", "--bg-surface": "#2A3A37", "--bg-cell": "#324540",
        "--bg-input": "#3d5450", "--strip-bg": "#2A3A37", "--border": "#6FAF9E",
        "--text-primary": "#E0E0E0", "--text-muted": "#A0A0A0", "--text-faint": "#777777",
        "--btn-bg": "#3A3A3A", "--btn-text": "#DDDDDD",
        "--accent": "#6FB9A6", "--action-btn-bg": "#6FB9A6", "--action-btn-text": "#1A1A1A",
        "--lingo-text": "#6FB9A6",
        "--called-bg": "#4CAF50", "--called-text": "#FFFFFF",
        "--last-called-bg": "#69F0AE", "--last-called-text": "#1A1A1A",
        "--bubble-bg": "#B2FF59", "--bubble-text": "#1A1A1A",
        "--card-match-bg": "#47ffea", "--card-match-text": "#0A0A0A",
        "--win-glow": "#47ffea", "--win-text-colour": "#FFFFFF",
        "--next-win-text": "#6FB9A6"

      }
    },
    {
      name: "Pastel Sunset",
      vars: {
        "--bg-page": "#2A1F1A", "--bg-surface": "#3A2A24", "--bg-cell": "#4A362E",
        "--bg-input": "#5a433a", "--strip-bg": "#3A2A24", "--border": "#C48A6A",
        "--text-primary": "#E8E0DC", "--text-muted": "#B8A8A0", "--text-faint": "#8A7A72",
        "--btn-bg": "#3A3A3A", "--btn-text": "#DDDDDD",
        "--accent": "#E88A63", "--action-btn-bg": "#E88A63", "--action-btn-text": "#1A1A1A",
        "--lingo-text": "#E88A63",
        "--called-bg": "#FF7043", "--called-text": "#FFFFFF",
        "--last-called-bg": "#FFAB91", "--last-called-text": "#1A1A1A",
        "--bubble-bg": "#FFD180", "--bubble-text": "#1A1A1A",
        "--card-match-bg": "#FFB74D", "--card-match-text": "#1A1A1A",
        "--win-glow": "#FF9100", "--win-text-colour": "#FFFFFF",
        "--next-win-text": "#E88A63"

      }
    },
    {
      name: "Lavender Mist",
      vars: {
        "--bg-page": "#221E2A", "--bg-surface": "#2E2838", "--bg-cell": "#3A3245",
        "--bg-input": "#453c52", "--strip-bg": "#2E2838", "--border": "#A98BFF",
        "--text-primary": "#E8E4F5", "--text-muted": "#B8B0C8", "--text-faint": "#8A8298",
        "--btn-bg": "#3A3A3A", "--btn-text": "#DDDDDD",
        "--accent": "#B79AF0", "--action-btn-bg": "#B79AF0", "--action-btn-text": "#1A1A1A",
        "--lingo-text": "#B79AF0",
        "--called-bg": "#B388FF", "--called-text": "#FFFFFF",
        "--last-called-bg": "#732ef5", "--last-called-text": "#1A1A1A",
        "--bubble-bg": "#EDE7F6", "--bubble-text": "#1A1A1A",
        "--card-match-bg": "#e8dbff", "--card-match-text": "#1A1A1A",
        "--win-glow": "#e8dbff", "--win-text-colour": "#FFFFFF",
        "--next-win-text": "#B79AF0"

      }
    },
    {
      name: "Pastel Ocean",
      vars: {
        "--bg-page": "#1A222A", "--bg-surface": "#24303A", "--bg-cell": "#2E3C48",
        "--bg-input": "#384858", "--strip-bg": "#24303A", "--border": "#7BC7FF",
        "--text-primary": "#E0E8F0", "--text-muted": "#A0A8B0", "--text-faint": "#707880",
        "--btn-bg": "#3A3A3A", "--btn-text": "#DDDDDD",
        "--accent": "#6FB9FF", "--action-btn-bg": "#6FB9FF", "--action-btn-text": "#1A1A1A",
        "--lingo-text": "#6FB9FF",
        "--called-bg": "#42A5F5", "--called-text": "#FFFFFF",
        "--last-called-bg": "#0a5cff", "--last-called-text": "#1A1A1A",
        "--bubble-bg": "#B3E5FC", "--bubble-text": "#1A1A1A",
        "--card-match-bg": "#86d8fe", "--card-match-text": "#1A1A1A",
        "--win-glow": "#86d8fe", "--win-text-colour": "#FFFFFF",
        "--next-win-text": "#6FB9FF"

      }
    },
    {
      name: "Muted Candy",
      vars: {
        "--bg-page": "#2A1E26", "--bg-surface": "#382A34", "--bg-cell": "#463542",
        "--bg-input": "#543f50", "--strip-bg": "#382A34", "--border": "#FF9EC7",
        "--text-primary": "#F0E8F0", "--text-muted": "#C0B0C0", "--text-faint": "#8A7A8A",
        "--btn-bg": "#3A3A3A", "--btn-text": "#DDDDDD",
        "--accent": "#E68EB8", "--action-btn-bg": "#E68EB8", "--action-btn-text": "#1A1A1A",
        "--lingo-text": "#E68EB8",
        "--called-bg": "#e51f7f", "--called-text": "#FFFFFF",
        "--last-called-bg": "#FFB6D9", "--last-called-text": "#1A1A1A",
        "--bubble-bg": "#FFD1E8", "--bubble-text": "#1A1A1A",
        "--card-match-bg": "#fbacd2", "--card-match-text": "#1A1A1A",
        "--win-glow": "#fbacd2", "--win-text-colour": "#FFFFFF",
        "--next-win-text": "#E68EB8"

      }
    }
  ];

  // Loads built-in themes Important: THIS is your dependency point
  var BUILTIN_THEMES = window.BINGONINGO_BUILTIN_THEMES || [];

  var currentTheme = deepCopy(BUILTIN_THEMES[0].vars);
  var LS_ACTIVE  = 'bingoningo_theme_active';


  /* ── Helpers ── */
  function deepCopy(o) { return JSON.parse(JSON.stringify(o)); }

//This updates CSS variables on <html> Applies a theme
  function applyTheme(vars) {
    Object.entries(vars).forEach(([k, v]) => {
      document.documentElement.style.setProperty(k, v);
    });
  }


    //Restores saved theme on load So refresh SHOULD restore theme automatically
  var stored = JSON.parse(localStorage.getItem(LS_ACTIVE));
  if (stored && typeof stored === 'object') {
    currentTheme = stored;
    applyTheme(currentTheme);
  }

