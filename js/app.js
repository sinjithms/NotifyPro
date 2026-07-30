/* ===== APP STATE ===== */
const state = {
  theme: localStorage.getItem('ntf-theme') || 'light',
  activeUser: localStorage.getItem('ntf-user') || 0,
  unreadCount: 4,
};

const users = [
  { name: 'sinjith soman', role: 'Admin', initials: 'SS', color: '#6C5CE7' },
  { name: 'Sarah Chen', role: 'Editor', initials: 'SC', color: '#00B894' },
  { name: 'James Wilson', role: 'Viewer', initials: 'JW', color: '#E17055' },
];

const notifications = [
  { title: 'Server alert #42', sub: 'CPU usage exceeds 90%', time: '2m ago', priority: 'urgent', icon: 'fa-solid fa-circle' },
  { title: 'Campaign sent', sub: 'Weekly digest delivered', time: '15m ago', priority: 'high', icon: 'fa-solid fa-circle' },
  { title: 'New subscriber', sub: 'John joined notifications', time: '1h ago', priority: 'normal', icon: 'fa-solid fa-circle' },
  { title: 'Template approved', sub: 'Welcome series ready', time: '2h ago', priority: 'low', icon: 'fa-solid fa-circle' },
  { title: 'Bounce rate spike', sub: '3.2% bounce detected', time: '3h ago', priority: 'urgent', icon: 'fa-solid fa-circle' },
  { title: 'Report generated', sub: 'Weekly analytics ready', time: '5h ago', priority: 'normal', icon: 'fa-solid fa-circle' },
];

/* ===== DOM REFS ===== */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ===== THEME ===== */
function applyTheme(t) {
  const d = document.documentElement;
  if (t === 'dark') {
    d.classList.add('dark');
  } else {
    d.classList.remove('dark');
  }
}
function initTheme() {
  applyTheme(state.theme);
}
function switchTheme(val) {
  state.theme = val;
  localStorage.setItem('ntf-theme', val);
  applyTheme(val);
  updateThemeIcon(val);
  showToast('Theme updated', `Switched to ${val} mode`, 'fa-solid fa-palette');
}
function updateThemeIcon(mode) {
  const icon = document.getElementById('theme-icon');
  if (!icon) return;
  icon.className = 'fa-solid ' + (mode === 'dark' ? 'fa-moon' : 'fa-sun');
}
function initThemeBtn() {
  const btn = document.getElementById('theme-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const next = state.theme === 'dark' ? 'light' : 'dark';
    switchTheme(next);
  });
}

/* ===== USER DISPLAY ===== */
function initUserDropdown() {
  updateActiveUser();
  const topBtn = document.getElementById('user-top-btn');
  const topMenu = document.getElementById('user-top-menu');
  if (topBtn && topMenu) {
    topBtn.addEventListener('click', e => { e.stopPropagation(); topMenu.classList.toggle('open'); closeOtherDropdowns('topuser'); });
  }
  const sideBtn = document.getElementById('sidebar-user-btn');
  const sideMenu = document.getElementById('sidebar-user-menu');
  if (sideBtn && sideMenu) {
    sideBtn.addEventListener('click', e => { e.stopPropagation(); sideMenu.classList.toggle('open'); closeOtherDropdowns('sidebaruser'); });
  }
  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}
function updateActiveUser() {
  const u = users[0];
  const els = document.querySelectorAll('.js-user-avatar');
  els.forEach(el => {
    el.textContent = u.initials;
    el.style.background = `linear-gradient(135deg,${u.color},${adjustColor(u.color,-20)})`;
  });
  document.querySelectorAll('.js-user-name').forEach(el => el.textContent = u.name);
  document.querySelectorAll('.js-user-role').forEach(el => el.textContent = u.role);
}
function adjustColor(hex, amt) {
  let c = parseInt(hex.slice(1),16);
  let r = Math.min(255,Math.max(0,(c>>16)+amt));
  let g = Math.min(255,Math.max(0,((c>>8)&0xFF)+amt));
  let b = Math.min(255,Math.max(0,(c&0xFF)+amt));
  return '#'+(1<<24|r<<16|g<<8|b).toString(16).slice(1);
}

/* ===== NOTIFICATION DROPDOWN ===== */
function initNotifDropdown() {
  const btn = document.getElementById('notif-btn');
  const menu = document.getElementById('notif-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', e => { e.stopPropagation(); menu.classList.toggle('open'); closeOtherDropdowns('notif'); });
  document.addEventListener('click', () => menu.classList.remove('open'));
  renderNotifications();
}
function renderNotifications() {
  const list = document.getElementById('notif-list');
  if (!list) return;
  list.innerHTML = notifications.map(n => `
    <div class="dropdown-item">
      <span class="prio-dot ${n.priority}"></span>
      <div class="msg">
        <div class="msg-title">${n.title}</div>
        <div class="msg-sub">${n.sub}</div>
      </div>
      <span class="msg-time">${n.time}</span>
    </div>
  `).join('');
}

/* ===== DROPDOWN HELPERS ===== */
function closeOtherDropdowns(exclude) {
  if (exclude !== 'user') document.getElementById('user-menu')?.classList.remove('open');
  if (exclude !== 'notif') document.getElementById('notif-menu')?.classList.remove('open');
  if (exclude !== 'topuser') document.getElementById('user-top-menu')?.classList.remove('open');
  if (exclude !== 'sidebaruser') document.getElementById('sidebar-user-menu')?.classList.remove('open');
}

/* ===== MODAL ===== */
function initModal() {
  document.addEventListener('click', e => {
    const trig = e.target.closest('[data-modal]');
    if (trig) {
      const id = trig.dataset.modal;
      const title = trig.dataset.modalTitle || 'Action';
      const content = trig.dataset.modalContent || 'Are you sure?';
      openModal(id || 'confirm-modal', title, content);
    }
    const close = e.target.closest('.js-modal-close');
    if (close) closeModal(e.target.closest('.modal-overlay'));
  });
  document.querySelectorAll('.modal-overlay').forEach(ov => {
    ov.addEventListener('click', e => { if (e.target === ov) closeModal(ov); });
  });
}
function openModal(id, title, content) {
  const ov = document.getElementById(id);
  if (!ov) return;
  ov.querySelector('.js-modal-title').textContent = title;
  ov.querySelector('.js-modal-body').textContent = content;
  ov.classList.add('open');
}
function closeModal(ov) {
  if (!ov || !ov.classList) return;
  ov.classList.remove('open');
}

/* ===== TOAST ===== */
function initToast() {
  // click toasts
  document.addEventListener('click', e => {
    const trig = e.target.closest('[data-toast]');
    if (trig) {
      e.preventDefault();
      const txt = trig.dataset.toast || 'Action completed';
      const icon = trig.dataset.toastIcon || 'fa-regular fa-circle-check';
      const title = trig.dataset.toastTitle || 'Success';
      showToast(title, txt, icon);
    }
  });
  // close individual toasts
  document.addEventListener('click', e => {
    const btn = e.target.closest('.toast-close-btn');
    if (btn) removeToast(btn.closest('.toast'));
  });
}
function showToast(title, msg, iconClass) {
  const wrap = document.getElementById('toast-wrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast';
  t.innerHTML = `
    <span class="toast-icon"><i aria-hidden="true" class="${iconClass || 'fa-solid fa-circle-info'}"></i></span>
    <div class="toast-body">
      <div class="toast-title">${title}</div>
      <div class="toast-msg">${msg || ''}</div>
    </div>
    <button type="button" class="toast-close-btn" aria-label="Close">&times;</button>
  `;
  wrap.appendChild(t);
  requestAnimationFrame(() => requestAnimationFrame(() => t.classList.add('show')));
  setTimeout(() => { if (t.parentNode) removeToast(t); }, 4000);
}
function removeToast(el) {
  if (!el || !el.parentNode) return;
  el.classList.remove('show');
  setTimeout(() => { if (el.parentNode) el.parentNode.removeChild(el); }, 250);
}

/* ===== SIDEBAR NAV ===== */
function initNav() {
  const items = document.querySelectorAll('.sidebar-nav .sidebar-item');
  items.forEach(item => {
    item.addEventListener('click', () => {
      if (item.classList.contains('has-sub')) {
        const sub = item.nextElementSibling;
        if (sub && sub.classList.contains('sidebar-sub')) {
          sub.classList.toggle('open');
          item.classList.toggle('open');
        }
        return;
      }
      if (item.dataset.page) {
        items.forEach(i => i.classList.remove('active', 'open'));
        document.querySelectorAll('.sidebar-sub-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        navigateTo(item.dataset.page);
        document.querySelector('.sidebar')?.classList.remove('open');
        document.getElementById('sidebar-backdrop')?.classList.remove('open');
        document.getElementById('sidebar-toggle')?.classList.remove('is-open');
      }
    });
    item.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        item.click();
      }
    });
  });
  document.querySelectorAll('.sidebar-sub-item').forEach(item => {
    item.addEventListener('click', () => {
      if (item.dataset.page) {
        items.forEach(i => i.classList.remove('active', 'open'));
        document.querySelectorAll('.sidebar-sub-item').forEach(i => i.classList.remove('active'));
        item.classList.add('active');
        item.closest('.sidebar-sub')?.classList.add('open');
        item.closest('.sidebar-sub')?.previousElementSibling?.classList.add('open', 'active');
        navigateTo(item.dataset.page);
        document.querySelector('.sidebar')?.classList.remove('open');
        document.getElementById('sidebar-backdrop')?.classList.remove('open');
        document.getElementById('sidebar-toggle')?.classList.remove('is-open');
      }
    });
  });
}
function navigateTo(page) {
  // hide all pages
  document.querySelectorAll('.page').forEach(p => p.style.display = 'none');
  // show target
  const target = document.getElementById(`page-${page}`);
  if (target) {
    target.style.display = 'block';
    target.querySelectorAll('[data-animate]').forEach(el => {
      el.style.animation = 'none';
      requestAnimationFrame(() => requestAnimationFrame(() => { el.style.animation = ''; }));
    });
  }
}

/* ===== STATS COUNTER ===== */
function animateCounters() {
  document.querySelectorAll('.stat-val[data-count]').forEach(el => {
    const target = parseInt(el.dataset.count);
    const dur = 1000;
    const start = performance.now();
    function tick(now) {
      const pct = Math.min(1, (now - start) / dur);
      el.textContent = Math.floor(pct * target).toLocaleString();
      if (pct < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
}

/* ===== CHARTS ===== */
function renderCharts() {
  // Bar chart
  const bc = document.getElementById('bar-chart');
  if (bc) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const vals = [320,480,250,560,380,410,290];
    const max = Math.max(...vals);
    bc.innerHTML = days.map((d,i) => `
      <div class="bar-item">
        <div class="bar-fill" style="height:${(vals[i]/max)*100}%;background:var(--primary);opacity:.7"></div>
        <span class="bar-lbl">${d}</span>
      </div>
    `).join('');
  }
  // Donut chart
  const dc = document.getElementById('donut-chart');
  if (dc) {
    const pct = 72;
    const c = `conic-gradient(var(--primary) 0% ${pct}%, var(--surface-2) ${pct}% 100%)`;
    dc.querySelector('.donut').style.background = c;
    dc.querySelector('.donut-val').textContent = pct + '%';
  }
  // Donut chart 2
  const dc2 = document.getElementById('donut-chart-2');
  if (dc2) {
    const pct2 = 45;
    const c2 = `conic-gradient(var(--success) 0% ${pct2}%, var(--surface-2) ${pct2}% 100%)`;
    dc2.querySelector('.donut').style.background = c2;
    dc2.querySelector('.donut-val').textContent = pct2 + '%';
  }
  // Failures bar
  const fbc = document.getElementById('fail-chart');
  if (fbc) {
    const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const vals = [12,8,15,6,10,4,7];
    const max2 = Math.max(...vals);
    fbc.innerHTML = days.map((d,i) => `
      <div class="bar-item">
        <div class="bar-fill" style="height:${(vals[i]/max2)*100}%;background:var(--danger);opacity:.7"></div>
        <span class="bar-lbl">${d}</span>
      </div>
    `).join('');
  }
}

/* ===== THEME SELECT ===== */
function initThemeSelect() {
  const sel = document.getElementById('theme-select');
  if (!sel) return;
  sel.addEventListener('change', () => switchTheme(sel.value));
  sel.value = state.theme;
}

/* ===== INBOX ===== */
function initInbox() {
  document.querySelectorAll('.inbox-item').forEach(item => {
    item.addEventListener('click', function() {
      this.closest('.inbox-list').querySelectorAll('.inbox-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
      const sender = this.querySelector('.inbox-sender')?.textContent || 'Select a message';
      const subj = this.querySelector('.inbox-sub')?.textContent || '';
      const prev = this.querySelector('.inbox-prev')?.textContent || '';
      const detail = document.getElementById('inbox-detail');
      if (detail) {
        detail.innerHTML = `
          <div style="display:flex;align-items:center;gap:12px;margin-bottom:16px">
            <div class="inbox-av" style="background:${this.querySelector('.inbox-av')?.style.background || 'var(--primary)'}">${this.querySelector('.inbox-av')?.textContent || ''}</div>
            <div><div style="font-weight:600;font-size:15px">${sender}</div><div style="font-size:12px;color:var(--text-3)">${subj}</div></div>
          </div>
          <p style="font-size:13px;color:var(--text-2);line-height:1.6">${prev || 'No preview available.'}</p>
          <button class="btn btn-primary btn-sm" style="margin-top:16px" data-toast="Reply sent" data-toast-title="Done" data-toast-icon="fa-regular fa-circle-check">Reply</button>
        `;
      }
    });
  });
}

/* ===== SEARCH ===== */
function initSearch() {
  const inp = document.getElementById('global-search');
  if (!inp) return;
  inp.addEventListener('keydown', e => {
    if (e.key === 'Enter' && inp.value.trim()) {
      showToast('Search', `Results for "${inp.value.trim()}"`, 'fa-solid fa-magnifying-glass');
    }
  });
}

/* ===== MOBILE SIDEBAR ===== */
function initMobileSidebar() {
  const toggle = document.getElementById('sidebar-toggle');
  const sidebar = document.querySelector('.sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');
  if (!toggle || !sidebar || !backdrop) return;
  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    backdrop.classList.toggle('open');
    toggle.classList.toggle('is-open');
  });
  backdrop.addEventListener('click', () => {
    sidebar.classList.remove('open');
    backdrop.classList.remove('open');
    toggle.classList.remove('is-open');
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && sidebar.classList.contains('open')) {
      sidebar.classList.remove('open');
      backdrop.classList.remove('open');
      toggle.classList.remove('is-open');
    }
  });
}

/* ===== KEYBOARD ===== */
function initKeyboard() {
  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('global-search')?.focus();
    }
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay.open').forEach(closeModal);
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
    }
  });
}

/* ===== INIT ===== */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  updateThemeIcon(state.theme);
  initThemeBtn();
  initUserDropdown();
  initNotifDropdown();
  initModal();
  initToast();
  initNav();
  initInbox();
  initSearch();
  initMobileSidebar();
  initKeyboard();
  animateCounters();
  renderCharts();
});
