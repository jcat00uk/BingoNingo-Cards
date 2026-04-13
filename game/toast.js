/* =============================================
   BingoNingo — Toast notifications
   toast.js
   Loaded by: Bingocaller.html
============================================= */

var _toastsReady = false;

if (!document.getElementById('toastContainer')) {
  var c = document.createElement('div');
  c.id = 'toastContainer';
  document.body.appendChild(c);
}

function showToast(message, type) {
  if (!_toastsReady) return;

  var container = document.getElementById('toastContainer');
  if (!container) return;

  var toast = document.createElement('div');
  toast.className = 'toast';

  var isOk   = type === 'ok';
  var isWarn = type === 'warn';

  if (isOk) {
    toast.style.background = 'var(--accent-green)';
    toast.style.border = '1px solid var(--accent-green)';
    toast.style.color = '#000';
  } else if (isWarn) {
    toast.style.background = 'var(--bubble-bg)';
    toast.style.border = '1px solid var(--border)';
    toast.style.color = 'var(--bubble-text)';
  } else {
    toast.style.background = 'var(--bg-surface)';
    toast.style.border = '1px solid var(--border)';
    toast.style.color = 'var(--text-primary)';
  }

  toast.style.borderRadius = '16px';
  toast.style.padding      = '8px 16px';
  toast.style.fontSize     = '13px';
  toast.style.fontFamily   = 'Arial,sans-serif';
  toast.style.textAlign    = 'center';
  toast.style.opacity      = '0';
  toast.style.transform    = 'translateY(8px)';
  toast.style.transition   = 'all 0.25s ease';

  toast.textContent = (isOk ? '✓ ' : '⚠ ') + message;
  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.style.opacity   = '1';
    toast.style.transform = 'translateY(0)';
  });

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateY(8px)';
    setTimeout(() => toast.remove(), 250);
  }, 2500);
}
