/* =============================================
   BingoNingo — Full theme editor
   theme-picker-full.js
   Extracted from app.js. Bingocaller.html only.
   Depends on: theme-presets.js, theme-core.js, toast.js
   Globals used from app.js: currentThemeName, showConfirmModal
============================================= */

function getThemeVar(name, fallback) {
  const val = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return val || fallback;
}

(function () {

  /* ── Variable metadata ── */
  const THEME_VARS = {
    "--bg-page":          "Main page background",
    "--bg-surface":       "Panels & modals background",
    "--bg-cell":          "Grid cell background",
    "--bg-input":         "Input field background",
    "--strip-bg":         "Called numbers strip background",
    "--border":           "Border colour",
    "--text-primary":     "Main text",
    "--text-muted":       "Secondary text",
    "--text-faint":       "Faint / disabled text",
    "--btn-bg":           "Button background",
    "--btn-text":         "Button text",
    "--accent":           "Accent colour",
    "--action-btn-bg":    "Action button background",
    "--action-btn-text":  "Action button text",
    "--lingo-text":       "Bingo lingo text",
    "--called-bg":        "Called number background",
    "--called-text":      "Called number text",
    "--last-called-bg":   "Last called background",
    "--last-called-text": "Last called text",
    "--bubble-bg":        "Big number bubble background",
    "--bubble-text":      "Big number bubble text",
    "--card-match-bg":    "Matched Cards highlight",
    "--card-match-text":  "Matched Cards text",
    "--win-glow":         "Win glow colour",
    "--win-text-colour":  "Win animation text",
    "--next-win-text":    "Win text"
  };

  const THEME_GROUPS = {
    "Backgrounds": ["--bg-page","--bg-surface","--bg-cell","--bg-input","--strip-bg","--border"],
    "Text":        ["--text-primary","--text-muted","--text-faint"],
    "Buttons":     ["--btn-bg","--btn-text","--action-btn-bg","--action-btn-text"],
    "Accents":     ["--accent","--lingo-text"],
    "Game States": ["--called-bg","--called-text","--last-called-bg","--last-called-text",
                    "--bubble-bg","--bubble-text","--card-match-bg","--card-match-text",
                    "--win-glow","--win-text-colour","--next-win-text"]
  };

  /* ── State ── */
  let currentTheme    = getActiveTheme();
  let savedThemes     = [];
  let editorOpen      = false;
  let activePickerKey = null;

  function loadSaved()          { savedThemes = getCustomThemes(); }
  function persistSaved()       { persistCustomThemes(savedThemes); }
  function persistActive()      { persistActiveTheme(currentTheme); }

  function applySavedTheme(theme) {
    currentThemeName = theme.name;
    setTheme(theme.vars);
  }

  function setTheme(vars) {
    currentTheme = deepCopy(vars);
    applyTheme(currentTheme);
    persistActive();
    refreshPresets();
    if (editorOpen) rebuildEditor();
  }

  /* ── Colour utilities ── */
  function hexToRgb(hex) {
    hex = hex.replace('#','');
    if (hex.length === 3) hex = hex.split('').map(c=>c+c).join('');
    const n = parseInt(hex, 16);
    return { r:(n>>16)&255, g:(n>>8)&255, b:n&255 };
  }

  function rgbToHex(r,g,b) {
    return '#' + [r,g,b].map(x=>x.toString(16).padStart(2,'0')).join('');
  }

  function rgbToHsl(r,g,b) {
    r/=255; g/=255; b/=255;
    const max=Math.max(r,g,b), min=Math.min(r,g,b);
    let h,s,l=(max+min)/2;
    if (max===min) { h=s=0; }
    else {
      const d=max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case r: h=((g-b)/d+(g<b?6:0))/6; break;
        case g: h=((b-r)/d+2)/6; break;
        case b: h=((r-g)/d+4)/6; break;
      }
    }
    return { h:Math.round(h*360), s:Math.round(s*100), l:Math.round(l*100) };
  }

  function hslToRgb(h,s,l) {
    s/=100; l/=100;
    const k=n=>(n+h/30)%12;
    const a=s*Math.min(l,1-l);
    const f=n=>l-a*Math.max(-1,Math.min(k(n)-3,Math.min(9-k(n),1)));
    return { r:Math.round(f(0)*255), g:Math.round(f(8)*255), b:Math.round(f(4)*255) };
  }

  /* ── Colour picker ── */
  function closeColourPicker(revertTo) {
    const el = document.getElementById('themeColourPickerOverlay');
    if (!el) { activePickerKey = null; return; }

    const scroll     = parseInt(el.dataset.savedScroll || '0');
    const keyAtClose = activePickerKey;
    activePickerKey  = null;
    el.remove();

    if (revertTo && keyAtClose) {
      currentTheme[keyAtClose] = revertTo;
      applyTheme(currentTheme);
      const circle = document.querySelector(`.tcp-target[data-key="${keyAtClose}"]`);
      if (circle) circle.style.background = revertTo;
    }

    setTimeout(() => {
      const dropdown = document.getElementById('settingsDropdown');
      if (dropdown) {
        dropdown.style.display = 'block';
        requestAnimationFrame(() => { dropdown.scrollTop = scroll; });
      }
    }, 10);
  }

  function openColourPicker(cssKey) {
    closeColourPicker();
    activePickerKey = cssKey;

    const originalHex = currentTheme[cssKey] || '#888888';
    const rgb = hexToRgb(originalHex);
    let hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

    const dropdown = document.getElementById('settingsDropdown');
    const savedScroll = dropdown ? dropdown.scrollTop : 0;
    if (dropdown) dropdown.style.display = 'none';

    const overlay = document.createElement('div');
    overlay.id = 'themeColourPickerOverlay';
    overlay.dataset.savedScroll = savedScroll;

    overlay.innerHTML = `
      <div id="themeColourPickerBox">
        <div class="tcp-title">${THEME_VARS[cssKey] || cssKey}</div>
        <div class="tcp-gradient-wrap">
          <canvas id="tcpCanvas" width="184" height="110"></canvas>
          <div id="tcpDot" class="tcp-dot"></div>
        </div>
        <div class="tcp-hue-wrap">
          <canvas id="tcpHueBar" width="184" height="14"></canvas>
          <div id="tcpHueCursor" class="tcp-hue-cursor"></div>
        </div>
        <div class="tcp-preview-row">
          <div class="tcp-swatch" id="tcpSwatch" style="background:${originalHex}"></div>
          <input class="tcp-hex-input" id="tcpHex" type="text" maxlength="7" value="${originalHex}" spellcheck="false">
        </div>
        <div class="tcp-actions">
          <button id="tcpCancel">Cancel</button>
          <button id="tcpApply" class="tcp-apply">Apply</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    requestAnimationFrame(() => {
      const grid = document.getElementById('bingoGrid');
      const box  = document.getElementById('themeColourPickerBox');
      if (grid && box) {
        const gr = grid.getBoundingClientRect();
        box.style.top    = 'auto';
        box.style.left   = 'auto';
        box.style.bottom = (window.innerHeight - gr.bottom) + 'px';
        box.style.right  = (window.innerWidth  - gr.right)  + 'px';
      }
    });

    const canvas    = overlay.querySelector('#tcpCanvas');
    const ctx       = canvas.getContext('2d');
    const dot       = overlay.querySelector('#tcpDot');
    const hueBar    = overlay.querySelector('#tcpHueBar');
    const hueCtx    = hueBar.getContext('2d');
    const hueCursor = overlay.querySelector('#tcpHueCursor');
    const swatch    = overlay.querySelector('#tcpSwatch');
    const hexIn     = overlay.querySelector('#tcpHex');

    const W = canvas.width, H = canvas.height;
    const HW = hueBar.width;

    function drawHueBar() {
      const grad = hueCtx.createLinearGradient(0, 0, HW, 0);
      for (let i = 0; i <= 360; i += 10)
        grad.addColorStop(i / 360, `hsl(${i},100%,50%)`);
      hueCtx.fillStyle = grad;
      hueCtx.fillRect(0, 0, HW, 14);
    }

    function drawGradient() {
      ctx.clearRect(0, 0, W, H);
      const gH = ctx.createLinearGradient(0, 0, W, 0);
      gH.addColorStop(0, '#fff');
      gH.addColorStop(1, `hsl(${hsl.h},100%,50%)`);
      ctx.fillStyle = gH;
      ctx.fillRect(0, 0, W, H);
      const gV = ctx.createLinearGradient(0, 0, 0, H);
      gV.addColorStop(0, 'rgba(0,0,0,0)');
      gV.addColorStop(1, 'rgba(0,0,0,1)');
      ctx.fillStyle = gV;
      ctx.fillRect(0, 0, W, H);
    }

    function hslToXY(h, s, l) {
      const s01 = s / 100, l01 = l / 100;
      const brightness = s01 === 0 ? l01 : l01 / (1 - s01 / 2);
      const x = s01 === 0 ? 0 : Math.min(1, s01 / (1 - Math.abs(2 * l01 - 1)));
      const y = 1 - Math.min(1, brightness);
      return { x: Math.round(x * W), y: Math.round(y * H) };
    }

    function positionDot(x, y)    { dot.style.left = (x - 6) + 'px'; dot.style.top = (y - 6) + 'px'; }
    function positionHueCursor(h) { hueCursor.style.left = (Math.round((h / 360) * HW) - 4) + 'px'; }

    function applyLive(hex) {
      swatch.style.background = hex;
      hexIn.value = hex;
      currentTheme[cssKey] = hex;
      applyTheme(currentTheme);
      const circle = document.querySelector(`.tcp-target[data-key="${cssKey}"]`);
      if (circle) circle.style.background = hex;
    }

    function fullUpdate() {
      drawGradient();
      const xy = hslToXY(hsl.h, hsl.s, hsl.l);
      positionDot(xy.x, xy.y);
      positionHueCursor(hsl.h);
      const rgb2 = hslToRgb(hsl.h, hsl.s, hsl.l);
      applyLive(rgbToHex(rgb2.r, rgb2.g, rgb2.b));
    }

    drawHueBar();
    fullUpdate();

    let draggingCanvas = false;
    let draggingHue    = false;
    function stopDrag() { draggingCanvas = false; draggingHue = false; }

    function onCanvasMove(e) {
      if (!draggingCanvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = Math.max(0, Math.min(W - 1, Math.round((e.clientX - rect.left) * (W / rect.width))));
      const y = Math.max(0, Math.min(H - 1, Math.round((e.clientY - rect.top)  * (H / rect.height))));
      positionDot(x, y);
      const px = ctx.getImageData(x, y, 1, 1).data;
      hsl = { ...hsl, ...rgbToHsl(px[0], px[1], px[2]) };
      applyLive(rgbToHex(px[0], px[1], px[2]));
    }

    function onHueMove(e) {
      if (!draggingHue) return;
      const rect = hueBar.getBoundingClientRect();
      const x = Math.max(0, Math.min(HW - 1, Math.round((e.clientX - rect.left) * (HW / rect.width))));
      hsl.h = Math.round((x / HW) * 360);
      positionHueCursor(hsl.h);
      drawGradient();
      const xy = hslToXY(hsl.h, hsl.s, hsl.l);
      positionDot(xy.x, xy.y);
      applyLive(rgbToHex(...Object.values(hslToRgb(hsl.h, hsl.s, hsl.l))));
    }

    canvas.addEventListener('pointerdown', e => { draggingCanvas = true; canvas.setPointerCapture(e.pointerId); onCanvasMove(e); });
    canvas.addEventListener('pointermove',   onCanvasMove);
    canvas.addEventListener('pointerup',     stopDrag);
    canvas.addEventListener('pointercancel', stopDrag);

    hueBar.addEventListener('pointerdown', e => { draggingHue = true; hueBar.setPointerCapture(e.pointerId); onHueMove(e); });
    hueBar.addEventListener('pointermove',   onHueMove);
    hueBar.addEventListener('pointerup',     stopDrag);
    hueBar.addEventListener('pointercancel', stopDrag);

    hexIn.addEventListener('input', () => {
      const v = hexIn.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) {
        const rgb2 = hexToRgb(v);
        hsl = rgbToHsl(rgb2.r, rgb2.g, rgb2.b);
        drawGradient();
        positionDot(...Object.values(hslToXY(hsl.h, hsl.s, hsl.l)));
        positionHueCursor(hsl.h);
        applyLive(v);
      }
    });

    overlay.addEventListener('mousedown', e => { if (e.target === overlay) closeColourPicker(originalHex); });
    overlay.addEventListener('touchstart', e => { if (e.target === overlay) closeColourPicker(originalHex); }, { passive: true });
    overlay.querySelector('#tcpCancel').addEventListener('click', () => closeColourPicker(originalHex));
    overlay.querySelector('#tcpApply').addEventListener('click', () => { persistActive(); closeColourPicker(null); });
  }

  /* ── Preset list ── */
  function refreshPresets() {
    const container = document.getElementById('themePresetList');
    if (!container) return;

    container.innerHTML = '';

    allThemes().forEach((theme, idx) => {
      const isUserSaved = idx >= BUILTIN_THEMES.length;

      const item = document.createElement('div');
      item.className = 'tm-preset-item';

      const swatch = document.createElement('div');
      swatch.className = 'tm-preset-swatch';
      swatch.style.background = theme.vars['--accent'] || '#888';

      const name = document.createElement('div');
      name.className = 'tm-preset-name';
      name.textContent = theme.name;

      item.appendChild(swatch);
      item.appendChild(name);

      if (isUserSaved) {
        const del = document.createElement('button');
        del.className = 'tm-preset-delete';
        del.textContent = '✕';
        del.title = 'Delete theme';

        del.addEventListener('click', e => {
          e.stopPropagation();

          const savedIndex = idx - BUILTIN_THEMES.length;
          if (savedIndex < 0 || savedIndex >= savedThemes.length) return;

          const themeName = theme.name;
          const isCurrent = currentThemeName === themeName;

          const performDelete = () => {
            savedThemes.splice(savedIndex, 1);
            persistSaved();
            refreshPresets();

            if (isCurrent) {
              const defaultTheme = BUILTIN_THEMES[0];
              currentTheme = deepCopy(defaultTheme.vars);
              currentThemeName = defaultTheme.name;
              applyTheme(currentTheme);
              persistActive();
            }
          };

          if (typeof showConfirmModal === 'function') {
            showConfirmModal(`Delete "${themeName}"?`, performDelete);
          } else {
            if (confirm(`Delete "${themeName}"?`)) performDelete();
          }
        });

        item.appendChild(del);
      }

      item.addEventListener('click', () => {
        currentThemeName = theme.name;
        setTheme(theme.vars);
      });

      container.appendChild(item);
    });
  }

  /* ── Colour editor (customise section) ── */
  function buildEditor() {
    const container = document.getElementById('themeEditorBody');
    if (!container) return;
    container.innerHTML = '';

    Object.entries(THEME_GROUPS).forEach(([groupName, keys]) => {
      const section = document.createElement('div');
      section.className = 'tm-section';

      const title = document.createElement('div');
      title.className = 'tm-section-title';

      const arrow = document.createElement('span');
      arrow.className = 'tm-section-arrow';
      arrow.textContent = '▶';

      title.appendChild(arrow);
      title.appendChild(document.createTextNode(groupName));

      const content = document.createElement('div');
      content.className = 'tm-section-content';

      keys.forEach(key => {
        const row = document.createElement('div');
        row.className = 'tm-row';

        const label = document.createElement('label');
        label.className = 'tm-row-label';
        label.textContent = THEME_VARS[key] || key;

        const circle = document.createElement('div');
        circle.className = 'tm-colour-circle tcp-target';
        circle.dataset.key = key;
        circle.style.background = currentTheme[key] || '#888';
        circle.addEventListener('click', () => openColourPicker(key));

        row.appendChild(label);
        row.appendChild(circle);
        content.appendChild(row);
      });

      title.addEventListener('click', () => {
        const open = content.classList.contains('tm-section-open');
        content.classList.toggle('tm-section-open', !open);
        arrow.textContent = open ? '▶' : '▼';
      });

      section.appendChild(title);
      section.appendChild(content);
      container.appendChild(section);
    });
  }

  function rebuildEditor() { if (editorOpen) buildEditor(); }

  function toggleEditor() {
    const body  = document.getElementById('themeEditorBody');
    const arrow = document.getElementById('themeCustomiseArrow');
    if (!body) return;
    editorOpen = !editorOpen;
    body.style.display = editorOpen ? 'block' : 'none';
    if (arrow) arrow.textContent = editorOpen ? '▼' : '▶';
    if (editorOpen) buildEditor();
  }

  /* ── Save ── */
  function saveCurrentTheme() {
    showInputModal('Save Theme', 'Enter theme name...', function (name) {
      savedThemes.push({ name: name, vars: deepCopy(currentTheme) });
      currentThemeName = name;
      persistSaved();
      persistActive();
      refreshPresets();
      showToast('Theme saved');
    });
  }

  /* ── Input modal (themed) ── */
  function showInputModal(title, placeholder, onSubmit) {
    var overlay = document.createElement('div');

    var cs      = getComputedStyle(document.documentElement);
    var cSurf   = cs.getPropertyValue('--bg-surface').trim();
    var cBorder = cs.getPropertyValue('--border').trim();
    var cText   = cs.getPropertyValue('--text-primary').trim();
    var cBtn    = cs.getPropertyValue('--btn-bg').trim();
    var cBtnT   = cs.getPropertyValue('--btn-text').trim();
    var cAction = cs.getPropertyValue('--action-btn-bg').trim();
    var cActionT= cs.getPropertyValue('--action-btn-text').trim();

    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999';

    var box = document.createElement('div');
    box.style.cssText =
      'background:' + cSurf +
      ';color:' + cText +
      ';padding:24px;border-radius:12px;border:1px solid ' + cBorder +
      ';width:320px;text-align:center';

    var titleEl = document.createElement('div');
    titleEl.textContent = title;
    titleEl.style.marginBottom = '12px';

    var input = document.createElement('input');
    input.type = 'text';
    input.placeholder = placeholder;
    input.maxLength = 20;
    input.setAttribute('maxlength', '20');
    input.style.cssText =
      'width:100%;padding:10px;margin-bottom:12px;border-radius:8px;border:1px solid ' + cBorder +
      ';background:' + cBtn + ';color:' + cText;

    var error = document.createElement('div');
    error.style.cssText = 'color:#ff6b6b;font-size:12px;height:16px;margin-bottom:10px';

    var btnRow = document.createElement('div');
    btnRow.style.cssText = 'display:flex;gap:10px;justify-content:center';

    var okBtn = document.createElement('button');
    okBtn.textContent = 'Save';
    okBtn.style.cssText =
      'padding:8px 16px;background:' + cAction + ';color:' + cActionT +
      ';border:none;border-radius:8px;cursor:pointer';

    var cancelBtn = document.createElement('button');
    cancelBtn.textContent = 'Cancel';
    cancelBtn.style.cssText =
      'padding:8px 16px;background:' + cBtn + ';color:' + cBtnT +
      ';border:1px solid ' + cBorder + ';border-radius:8px;cursor:pointer';

    okBtn.onclick = () => {
      const value = input.value.trim();
      const r = validateThemeName(value);
      if (!r.ok) { error.textContent = r.msg; return; }
      document.body.removeChild(overlay);
      onSubmit(r.name);
    };

    cancelBtn.onclick = () => document.body.removeChild(overlay);

    btnRow.appendChild(cancelBtn);
    btnRow.appendChild(okBtn);
    box.appendChild(titleEl);
    box.appendChild(input);
    box.appendChild(error);
    box.appendChild(btnRow);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    input.focus();
  }

  /* ── Validation ── */
  function validateThemeName(name) {
    if (!name) return { ok: false, msg: 'Name required' };
    name = name.toString().trim();
    if (name.length === 0)  return { ok: false, msg: 'Name cannot be empty' };
    if (name.length > 20)   return { ok: false, msg: 'Max 20 characters' };
    if (!/^[a-zA-Z0-9 _-]+$/.test(name)) return { ok: false, msg: 'Invalid characters' };
    if (themeNameExists(name)) return { ok: false, msg: 'Theme already exists' };
    return { ok: true, name };
  }

  function themeNameExists(name) {
    const n = name.trim().toLowerCase();
    return savedThemes.some(t => (t.name || '').trim().toLowerCase() === n) ||
           BUILTIN_THEMES.some(t => (t.name || '').trim().toLowerCase() === n);
  }

  /* ── Import / Export ── */
  function showImportExport() {
    const overlay = document.createElement('div');

    const cs    = getComputedStyle(document.documentElement);
    const cBg   = cs.getPropertyValue('--bg-surface').trim();
    const cBorder = cs.getPropertyValue('--border').trim();
    const cText = cs.getPropertyValue('--text-primary').trim();
    const cBtn  = cs.getPropertyValue('--btn-bg').trim();
    const cBtnT = cs.getPropertyValue('--btn-text').trim();
    const cAct  = cs.getPropertyValue('--action-btn-bg').trim();
    const cActT = cs.getPropertyValue('--action-btn-text').trim();

    overlay.style.cssText =
      'position:fixed;inset:0;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:9999';

    const box = document.createElement('div');
    box.style.cssText =
      'width:360px;background:' + cBg + ';color:' + cText +
      ';border:1px solid ' + cBorder + ';border-radius:12px;padding:16px;font-family:inherit;text-align:center';

    const title = document.createElement('div');
    title.textContent = 'Import / Export Themes';
    title.style.marginBottom = '12px';

    const importBtn = document.createElement('button');
    const exportBtn = document.createElement('button');
    const closeBtn  = document.createElement('button');

    importBtn.textContent = 'Import';
    exportBtn.textContent = 'Export';
    closeBtn.textContent  = 'Close';

    const baseBtn = 'padding:10px 14px;border:none;border-radius:8px;cursor:pointer;margin:4px;';
    importBtn.style.cssText = baseBtn + 'background:' + cBtn  + ';color:' + cBtnT;
    exportBtn.style.cssText = baseBtn + 'background:' + cAct  + ';color:' + cActT;
    closeBtn.style.cssText  = baseBtn + 'background:' + cBtn  + ';color:' + cBtnT;

    closeBtn.onclick = () => overlay.remove();

    importBtn.onclick = () => {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.accept = '.json';
      fileInput.onchange = () => {
        const file = fileInput.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
          let data;
          try { data = JSON.parse(reader.result); }
          catch { showToast('Invalid JSON file'); return; }
          if (!data.vars) { showToast('Invalid theme format'); return; }

          showInputModal('Name Imported Theme', 'Enter name...', (name) => {
            const r = validateThemeName(name);
            if (!r.ok) { showToast(r.msg); return; }
            savedThemes.push({ name: r.name, vars: deepCopy(data.vars) });
            persistSaved();
            refreshPresets();
            currentTheme = deepCopy(data.vars);
            currentThemeName = r.name;
            applyTheme(currentTheme);
            persistActive();
            showToast('Theme imported');
            overlay.remove();
          });
        };
        reader.readAsText(file);
      };
      fileInput.click();
    };

    exportBtn.onclick = () => {
      showInputModal('Export Theme Name', 'Enter name...', (name) => {
        const r = validateThemeName(name);
        if (!r.ok) { showToast(r.msg); return; }
        const json = JSON.stringify({ name: r.name, vars: currentTheme }, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url; a.download = r.name + '.json'; a.click();
        URL.revokeObjectURL(url);
        showToast('Theme exported');
        overlay.remove();
      });
    };

    const row = document.createElement('div');
    row.appendChild(importBtn);
    row.appendChild(exportBtn);
    row.appendChild(closeBtn);
    box.appendChild(title);
    box.appendChild(row);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
  }

  /* ── Toggle themes section ── */
  function toggleThemesSection() {
    const body  = document.getElementById('themesSectionBody');
    const arrow = document.getElementById('themesSectionArrow');
    if (!body) return;
    const open = body.style.display !== 'none';
    body.style.display = open ? 'none' : 'block';
    if (arrow) arrow.textContent = open ? '▶' : '▼';
  }

  /* ── Init ── */
  function init() {
    loadSaved();
    applyTheme(currentTheme);
    refreshPresets();

    const btnCustomise = document.getElementById('themeCustomiseToggle');
    if (btnCustomise) btnCustomise.addEventListener('click', toggleEditor);

    const btnSave = document.getElementById('themeSaveBtn');
    if (btnSave) btnSave.addEventListener('click', saveCurrentTheme);

    const btnIE = document.getElementById('themeIEBtn');
    if (btnIE) btnIE.addEventListener('click', showImportExport);

    const btnSection = document.getElementById('themesSectionToggle');
    if (btnSection) btnSection.addEventListener('click', toggleThemesSection);
  }

  // Expose for inline onclick fallbacks in Bingocaller.html
  window.themeManager = { init, toggleEditor, toggleThemesSection, saveCurrentTheme, showImportExport };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
