// TheCrazyCat — Tweaks panel  (OPTIONAL — you can ignore this file)
// ---------------------------------------------------------------
// This powers only the little "Tweaks" panel used to preview colour
// themes and density. It does NOT affect your live site's words or
// links. You normally never need to edit this. The site looks the
// same with or without it. To change the DEFAULT theme that visitors
// see, edit data-direction="..." on the <html> tag in index.html.
// ---------------------------------------------------------------

const TC_DEFAULTS = /*EDITMODE-BEGIN*/{
  "direction": "arcade",
  "accent": "auto",
  "density": "regular"
}/*EDITMODE-END*/;

const DIRECTIONS = [
  { id: "arcade", label: "Arcade",        sw: ["#9b6dff", "#2fe0cf"] },
  { id: "warm",   label: "Warm Studio",   sw: ["#ff6a3d", "#ffb454"] },
  { id: "mono",   label: "Midnight Mono", sw: ["#c9ff46", "#0b0c0e"] },
];

const ACCENTS = [
  { id: "auto",    color: null,       label: "Match theme" },
  { id: "violet",  color: "#9b6dff" },
  { id: "cyan",    color: "#2fe0cf" },
  { id: "coral",   color: "#ff6a3d" },
  { id: "lime",    color: "#c9ff46" },
  { id: "pink",    color: "#ff5da2" },
  { id: "blue",    color: "#4c8dff" },
];

function App() {
  const [t, setTweak] = useTweaks(TC_DEFAULTS);
  const root = document.documentElement;

  // apply direction
  React.useEffect(() => {
    root.setAttribute("data-direction", t.direction);
  }, [t.direction]);

  // apply density
  React.useEffect(() => {
    root.setAttribute("data-density", t.density);
  }, [t.density]);

  // apply accent override
  React.useEffect(() => {
    const found = ACCENTS.find((a) => a.id === t.accent);
    if (found && found.color) {
      root.style.setProperty("--accent", found.color);
      root.style.setProperty("--glow", found.color + "73");
    } else {
      root.style.removeProperty("--accent");
      root.style.removeProperty("--glow");
    }
  }, [t.accent, t.direction]);

  return (
    <TweaksPanel>
      <TweakSection label="Visual direction" />
      <div style={{ display: "grid", gap: 8 }}>
        {DIRECTIONS.map((d) => {
          const active = t.direction === d.id;
          return (
            <button
              key={d.id}
              onClick={() => setTweak("direction", d.id)}
              style={{
                display: "flex", alignItems: "center", gap: 11, width: "100%",
                padding: "10px 12px", borderRadius: 11, cursor: "pointer",
                textAlign: "left", fontFamily: "inherit", fontSize: 13.5,
                background: active ? "rgba(255,255,255,0.07)" : "transparent",
                border: active ? "1px solid rgba(255,255,255,0.22)" : "1px solid rgba(255,255,255,0.08)",
                color: "inherit", transition: "all .18s",
              }}
            >
              <span style={{ display: "flex" }}>
                {d.sw.map((c, i) => (
                  <span key={i} style={{
                    width: 18, height: 18, borderRadius: "50%", background: c,
                    marginLeft: i ? -6 : 0, border: "2px solid rgba(20,20,30,0.9)",
                  }} />
                ))}
              </span>
              <span style={{ flex: 1, fontWeight: active ? 600 : 500 }}>{d.label}</span>
              {active && <span style={{ fontSize: 11, opacity: 0.7 }}>●</span>}
            </button>
          );
        })}
      </div>

      <TweakSection label="Accent color" />
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {ACCENTS.map((a) => {
          const active = t.accent === a.id;
          return (
            <button
              key={a.id}
              title={a.label || a.id}
              onClick={() => setTweak("accent", a.id)}
              style={{
                width: 30, height: 30, borderRadius: "50%", cursor: "pointer",
                background: a.color
                  ? a.color
                  : "conic-gradient(#9b6dff,#2fe0cf,#ff6a3d,#c9ff46,#9b6dff)",
                border: active ? "2px solid #fff" : "2px solid rgba(255,255,255,0.2)",
                boxShadow: active ? "0 0 0 3px rgba(255,255,255,0.18)" : "none",
                transition: "all .15s", padding: 0,
              }}
            />
          );
        })}
      </div>

      <TweakSection label="Card density" />
      <TweakRadio
        label="Layout"
        value={t.density}
        options={["regular", "compact"]}
        onChange={(v) => setTweak("density", v)}
      />
    </TweaksPanel>
  );
}

ReactDOM.createRoot(document.getElementById("tweaks-root")).render(<App />);
