import { api, download, session } from './api.js';
import { getLanguage, languageSelect, setLanguage, t } from './i18n.js';

/* ========================================================== tiny helpers */
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = (value) => String(value ?? '').replace(/[&<>"']/g,
  (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ini = (name) => String(name || 'YEP').trim().split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
const dt = (iso) => (iso ? new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—');
const d = (iso) => (iso ? new Date(iso).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
const money = (n) => 'UGX ' + Number(n || 0).toLocaleString();
const tag = (status, label) => `<span class="tag ${esc(String(status || '').replace(/\s/g, ''))}">${esc(label || String(status || '').replace(/_/g, ' '))}</span>`;
const bar = (percent) => `<div class="bar"><i style="width:${Math.max(0, Math.min(100, Number(percent) || 0))}%"></i></div>`;
const empty = (text) => `<div class="empty">${esc(text)}</div>`;

const state = { page: 'dashboard', thread: null, report: null, quiz: null };

function toast(text) {
  const el = $('#toast');
  el.textContent = text;
  el.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { el.hidden = true; }, 3200);
}

function grep(event) {
  const box = event.target.closest('.card');
  const needle = event.target.value.toLowerCase();
  if (!box) return;
  $$('[data-body] tr', box).forEach((row) => { row.hidden = !!needle && !row.textContent.toLowerCase().includes(needle); });
}

function busy(button, on) {
  if (!button) return;
  button.dataset.label = button.dataset.label || button.textContent;
  button.disabled = on;
  button.textContent = on ? 'Working…' : button.dataset.label;
}

function vals(form) { return Object.fromEntries(new FormData(form).entries()); }

/* form atoms */
const fld = (label, name, opts = {}) => `<label class="lbl">${esc(t(label))}
  <div class="fld"><input name="${name}" type="${opts.type || 'text'}" ${opts.required ? 'required' : ''}
    ${opts.value !== undefined ? `value="${esc(opts.value)}"` : ''} ${opts.min !== undefined ? `min="${opts.min}"` : ''}
    ${opts.max !== undefined ? `max="${opts.max}"` : ''} ${opts.step ? `step="${opts.step}"` : ''}
    placeholder="${esc(opts.placeholder || '')}"></div></label>`;
const sel = (label, name, options, selected) => `<label class="lbl">${esc(t(label))}
  <div class="fld"><select name="${name}">${options.map((o) => {
    const value = typeof o === 'object' ? o.value : o;
    const text = typeof o === 'object' ? o.label : o;
    return `<option value="${esc(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${esc(text)}</option>`;
  }).join('')}</select></div></label>`;
const txt = (label, name, opts = {}) => `<label class="lbl">${esc(t(label))}
  <div class="fld"><textarea name="${name}" ${opts.required ? 'required' : ''}
    placeholder="${esc(opts.placeholder || '')}">${esc(opts.value || '')}</textarea></div></label>`;

const head = (title, subtitle, actions = '') => `<div class="ph2"><div><h1>${esc(t(title))}</h1><p>${esc(t(subtitle))}</p></div><div class="pgh">${actions}</div></div>`;
const card = (title, body, action = '') => `<section class="card"><h3>${esc(t(title))}${action || ''}</h3>${body}</section>`;
const stats = (items, className = '') => `<div class="card stats ${className}">${items.map(([icon, colour, value, label]) =>
  `<div class="st"><div class="ic ${colour}">${icon}</div><b>${esc(value)}</b><span>${esc(label)}</span></div>`).join('')}</div>`;
const act = (icon, colour, title, subtitle) => `<div class="act"><div class="ic ${colour}">${icon}</div>
  <div class="grow"><b>${esc(title)}</b><small>${esc(subtitle)}</small></div></div>`;
const hero = (title, subtitle, actions, emoji) => `<div class="hb"><div class="t"><h1>${esc(title)}</h1>
  <p>${esc(subtitle)}</p>${actions || ''}</div><div class="ph" aria-hidden="true"><span>${emoji || '🎓'}</span></div></div>`;
const donut = (percent) => {
  const p = Math.max(0, Math.min(100, Number(percent) || 0));
  return `<svg viewBox="0 0 100 100" width="110" height="110" role="img" aria-label="${p}% progress">
    <circle cx="50" cy="50" r="40" fill="none" stroke="var(--soft)" stroke-width="11"/>
    <circle cx="50" cy="50" r="40" fill="none" stroke="#16a34a" stroke-width="11" stroke-linecap="round"
      stroke-dasharray="${p * 2.513} 251.3" transform="rotate(-90 50 50)"/>
    <text x="50" y="57" font-size="22" font-weight="800" text-anchor="middle" fill="var(--tx)">${p}%</text></svg>`;
};
const bars = (rows, unit = '') => {
  const max = Math.max(1, ...rows.map(([, value]) => value));
  return `<div class="bars" style="height:190px">${rows.map(([label, value]) => `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:flex-end;height:100%;font-size:12px;color:var(--mut);gap:4px">
    <b style="color:var(--tx)">${esc(value)}${unit}</b><i style="flex:none;width:100%;height:${Math.round(value / max * 70)}%"></i>${esc(label)}</div>`).join('')}</div>`;
};
const table = (columns, rows, search = true) => `${search
  ? `<label class="fld" style="margin-bottom:12px"><span>🔍</span><input data-q placeholder="Search…" aria-label="Search"></label>` : ''}
  <div class="tw"><table><thead><tr>${columns.map((c) => `<th>${esc(t(c))}</th>`).join('')}</tr></thead>
  <tbody data-body>${rows.length ? rows.map((row) => `<tr>${row.map((cell) => `<td>${cell}</td>`).join('')}</tr>`).join('')
    : `<tr><td colspan="${columns.length}" style="color:var(--mut)">Nothing here yet.</td></tr>`}</tbody></table></div>`;

/* Tabs are always [value, label] pairs. A bare string passed here used to be
   iterated character by character, which is how a tab label rendered as
   "v e / i l / o r" instead of one word. Plain strings and objects are
   normalised instead of spread, so that class of bug cannot come back. */
const tabStrip = (pairs, active, opts = {}) => {
  const { attribute = 'data-tab', counts = {}, className = '' } = opts;
  const entries = (pairs || []).map((entry) => {
    if (Array.isArray(entry)) return [String(entry[0]), entry[1] ?? entry[0]];
    if (entry && typeof entry === 'object') return [String(entry.value ?? entry.id ?? ''), entry.label ?? ''];
    return [String(entry ?? ''), String(entry ?? '')];
  });
  return `<div class="tabs${className ? ' ' + className : ''}">${entries.map(([value, label]) => {
    const count = counts[value];
    return `<button type="button" class="${value === (active ?? '') ? 'on' : ''}" ${attribute}="${esc(value)}"
      aria-pressed="${value === (active ?? '')}">${esc(t(label))}${typeof count === 'number' ? `<span class="tag">${count}</span>` : ''}</button>`;
  }).join('')}</div>`;
};

function modal(html) {
  $$('.modal').forEach((node) => node.remove());
  const wrap = document.createElement('div');
  wrap.className = 'modal';
  wrap.innerHTML = `<div class="mb">${html}</div>`;
  wrap.addEventListener('click', (event) => { if (event.target === wrap) wrap.remove(); });
  document.body.appendChild(wrap);
  return wrap;
}
const closeModal = () => $$('.modal').forEach((node) => node.remove());

/* ============================================================= navigation */
const NAV = {
  admin: [['dashboard', 'Dashboard', '▦'], ['participants', 'Users', '👥'], ['programmes', 'Programmes', '📚'],
    ['academies', 'Academies', '🏫'], ['exchange', 'Virtual Exchange', '🌍'], ['projects', 'Impact Projects', '🚀'], ['assessments', 'Assessments', '📝'],
    ['certificates', 'Certificates', '🏅'], ['reports', 'Reports', '📈'], ['settings', 'Settings', '⚙️']],
  participant: [['dashboard', 'Dashboard', '▦'], ['profile', 'My Profile', '👤'], ['programmes', 'Programmes', '📚'],
    ['academies', 'Academies', '🏫'], ['learning', 'Learning Hub', '🎓'], ['projects', 'My Projects', '🚀'], ['sessions', 'Sessions & Events', '📅'],
    ['assessments', 'Assessments', '📝'], ['certificates', 'Certificates', '🏅'], ['jobs', 'Jobs & Portfolio', '💼'],
    ['notifications', 'Notifications', '🔔']],
  mentor: [['dashboard', 'Dashboard', '▦'], ['mentees', 'My Mentees', '👥'], ['requests', 'Mentorship Requests', '📨'],
    ['sessions', 'Sessions', '📅'], ['resources', 'Resources', '📁'], ['reports', 'Reports', '📈']],
  facilitator: [['dashboard', 'Dashboard', '▦'], ['programmes', 'Programmes', '📚'], ['sessions', 'Sessions', '📅'],
    ['participants', 'Participants', '👥'], ['assessments', 'Assessments', '📝'], ['reports', 'Reports', '📈']],
  sponsor: [['dashboard', 'Dashboard', '▦'], ['contributions', 'My Contributions', '💰'],
    ['impact', 'Impact Reports', '📈'], ['partnerships', 'Partnerships', '🏢'], ['messages', 'Messages', '💬']],
  instructor: [['dashboard', 'Dashboard', '▦'], ['courses', 'My Courses', '📘'], ['sessions', 'Sessions', '📅']],
  reviewer: [['dashboard', 'Dashboard', '▦'], ['courses', 'Review Queue', '🔎']],
  employer: [['dashboard', 'Dashboard', '▦'], ['jobs', 'Jobs & Applicants', '💼']],
};

const PAGES = {
  admin: {}, participant: {}, mentor: {}, facilitator: {}, sponsor: {},
  instructor: {}, reviewer: {}, employer: {},
};

function shell(role, key) {
  const user = session.user || {};
  const items = NAV[role] || [];
  const unread = state.unread || 0;
  document.body.innerHTML = `
    <div class="shell" id="shell">
      <aside class="side" aria-label="Main navigation">
        <a class="logo" href="#/app"><span class="brand-mark" style="width:38px;height:38px;border-radius:11px;background:var(--yel);color:var(--navy);display:grid;place-items:center;font-weight:800;font-size:18px">Y</span>
          <span><b style="font-size:22px">YEP</b><small>Youth Empowerment Programme</small></span></a>
        ${items.map(([slug, label, icon]) => `<button class="nav ${slug === key ? 'on' : ''}" data-page="${slug}"><span>${icon}</span>${esc(t(label))}</button>`).join('')}
        <button class="nav out" data-logout><span>⏻</span>${esc(t('Sign out'))}</button>
      </aside>
      <div class="main">
        <header class="top">
          <button class="burger" id="burger" aria-label="Menu">☰</button>
          <span class="sp"></span>
          ${languageSelect()}
          ${items.some(([slug]) => slug === 'notifications')
            ? `<button class="bell" data-page="notifications" aria-label="Notifications">🔔${unread ? '<i></i>' : ''}</button>`
            : ''}
          <div class="me"><span class="ava">${esc(ini(user.fullName))}</span><span>${esc(user.fullName)}</span></div>
        </header>
        <main class="pg" id="page"><div class="empty">Loading…</div></main>
      </div>
    </div>
    <div class="toast" id="toast" hidden role="status" aria-live="polite"></div>`;

  $$('[data-page]').forEach((button) => button.addEventListener('click', () => go(button.dataset.page)));
  $('[data-logout]').addEventListener('click', () => { session.clear(); location.hash = '#/login'; });
  $('#burger').addEventListener('click', () => $('#shell').classList.toggle('open'));
  const language = $('[data-lang]');
  if (language) language.addEventListener('change', (event) => { setLanguage(event.target.value); route(); });
}

async function go(key) {
  const role = (session.user?.role || '').toLowerCase();
  state.page = key;
  shell(role, key);
  $$('.nav').forEach((button) => button.classList.toggle('on', button.dataset.page === key));
  const fn = PAGES[role]?.[key];
  const page = $('#page');
  if (!fn) { page.innerHTML = head('Page not found', 'That section does not exist for your role.'); return; }
  try {
    await fn(page);
    $$('input[data-q]').forEach((input) => input.addEventListener('input', grep));
  } catch (error) {
    if (error.status === 401) { session.clear(); location.hash = '#/login'; return; }
    page.innerHTML = head('Something went wrong', error.message || 'Please try again.') +
      `<div class="card"><button class="btn ghost" onclick="location.reload()">Reload</button></div>`;
  }
}

/* ================================================================ public */
function publicPage(html) {
  document.body.innerHTML = `<div class="auth"><div style="width:min(1100px,100%)">${html}</div></div>
    <div class="toast" id="toast" hidden role="status"></div>`;
}

async function landing() {
  publicPage(`
    <header style="display:flex;align-items:center;gap:16px;padding:14px 6px">
      <div class="logo" style="color:var(--navy)"><b style="font-size:26px">YEP</b><small style="color:var(--mut)">Youth Empowerment Programme</small></div>
      <span class="sp"></span>
      ${languageSelect()}
      <a class="btn ghost sm" href="#/login">${esc(t('Sign In'))}</a>
      <a class="btn y sm" href="#/signup">${esc(t('Join YEP'))}</a>
    </header>
    <div class="acard" style="grid-template-columns:1fr">
      <div class="hero1" style="min-height:0;border-radius:24px 24px 0 0">
        <div class="swirl" aria-hidden="true"></div>
        <h2>Empowering young people to <b>learn, build and earn</b></h2>
        <p><b>Two levels. One verifiable certificate.</b> Digital and AI literacy first, then a funded community project with real milestones.</p>
        <div class="crowd" aria-hidden="true"><span>🧑‍💻</span><span>👩‍🎓</span><span>🧑‍🔧</span><span>👩‍💼</span></div>
      </div>
      <div class="form" style="gap:18px">
        <div class="stats" id="landingStats" style="margin:0;padding:0;background:none;border:0;box-shadow:none">
          <div class="st"><b>—</b><span>Loading</span></div></div>
        <div class="cards" id="landingProgrammes"></div>
        <form id="verifyForm" style="display:flex;gap:8px;flex-wrap:wrap">
          <label class="fld" style="flex:1;min-width:220px"><span>🏅</span>
            <input name="code" placeholder="Verify a certificate code, e.g. YEP-2026-0001" aria-label="Certificate code"></label>
          <button class="btn r" type="submit">${esc(t('Verify'))}</button>
        </form>
        <div id="verifyResult"></div>
        <div class="copy">© 2026 YEP. All rights reserved.</div>
      </div>
    </div>`);

  $('#verifyForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const code = vals(event.target).code.trim();
    const box = $('#verifyResult');
    try {
      const result = await api.get(`/public/certificates/${encodeURIComponent(code)}`);
      box.innerHTML = `<div class="note">Valid certificate · ${esc(result.holderName)} completed ${esc(result.programmeLabel)} on ${d(result.issuedAt)} (${esc(result.code)})</div>`;
    } catch {
      box.innerHTML = `<div class="note" style="background:#fee2e2;color:#b91c1c">No certificate matches that code.</div>`;
    }
  });

  try {
    const [statsData, programmes] = await Promise.all([api.get('/public/stats'), api.get('/public/programmes')]);
    $('#landingStats').innerHTML = [['👥', 'c1', statsData.participants, 'Participants'], ['📚', 'c2', statsData.programmes, 'Programmes'],
      ['🏅', 'c3', statsData.certificates, 'Certificates'], ['🚀', 'c4', statsData.projects, 'Projects']]
      .map(([icon, colour, value, label]) => `<div class="st"><div class="ic ${colour}">${icon}</div><b>${esc(value)}</b><span>${label}</span></div>`).join('');
    $('#landingProgrammes').innerHTML = programmes.slice(0, 3).map((p) => `<article class="card pc">
      <div class="im">${esc(p.icon || '🎓')}</div><h3 style="margin:0">${esc(p.title)}</h3>
      <div class="meta"><span class="tag Review">${esc(p.category)}</span><span>${p.placesLeft} places left</span><span>Closes ${d(p.registrationDeadline)}</span></div>
      <a class="btn ghost sm" href="#/signup">Apply</a></article>`).join('');
  } catch { /* the API may be starting */ }
}

function loginScreen() {
  publicPage(`<div class="acard">
    <div class="hero1">
      <div class="swirl" aria-hidden="true"></div>
      <div class="logo"><b>YEP</b><small>Youth Empowerment<br>Management System</small></div>
      <h2>Welcome back to <b>your future</b></h2>
      <p><b>Sign in to continue</b>Learning, mentorship, projects and certificates in one place.</p>
      <div class="crowd" aria-hidden="true"><span>🧑‍💻</span><span>👩‍🎓</span><span>🧑‍🔧</span><span>👩‍💼</span></div>
    </div>
    <form class="form" id="loginForm">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <h1>${esc(t('Welcome Back'))}</h1>${languageSelect()}</div>
      <p class="sub">${esc(t('Sign in to your account'))}</p>
      <label class="lbl">Email address<div class="fld"><span>✉️</span><input name="email" type="email" required placeholder="you@example.com" autocomplete="email"></div></label>
      <label class="lbl">Password<div class="fld"><span>🔒</span><input name="password" type="password" required placeholder="Your password" autocomplete="current-password"></div></label>
      <div class="row"><label><input type="checkbox" checked> Remember me</label><span style="color:var(--mut)">Demo: Password123!</span></div>
      <div class="err" data-err></div>
      <button class="btn full" type="submit">${esc(t('Sign In'))}</button>
      <div class="ctr">Don’t have an account? <a class="lnk" href="#/signup">Create one</a></div>
      <div class="copy">© 2026 YEP. All rights reserved.</div>
    </form></div>`);

  $('#loginForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type=submit]');
    busy(button, true);
    try {
      const result = await api.post('/auth/login', vals(form));
      session.save(result.token, result.user);
      state.unread = 0;
      location.hash = '#/app';
    } catch (error) {
      form.querySelector('[data-err]').textContent = error.message;
      busy(button, false);
    }
  });
}

function signupScreen() {
  publicPage(`<div class="acard">
    <div class="hero1">
      <div class="swirl" aria-hidden="true"></div>
      <div class="logo"><b>YEP</b><small>Youth Empowerment<br>Management System</small></div>
      <h2>Start your <b>YEP journey</b></h2>
      <p><b>Open to ages 18–35</b>Apply once, learn for free, and earn a certificate employers can verify.</p>
      <div class="crowd" aria-hidden="true"><span>🧑‍💻</span><span>👩‍🎓</span><span>🧑‍🔧</span></div>
    </div>
    <form class="form" id="signupForm">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:8px">
        <h1>${esc(t('Create Account'))}</h1>${languageSelect()}</div>
      <p class="sub">Register as a participant — an administrator reviews every application.</p>
      <div class="fgrid">
        <label class="lbl">Full name<div class="fld"><input name="fullName" required placeholder="Your full name"></div></label>
        <label class="lbl">Email<div class="fld"><input name="email" type="email" required placeholder="you@example.com"></div></label>
        <label class="lbl">Mobile number<div class="fld" style="gap:6px">
          <select name="phoneCountryCode" id="dialSelect" aria-label="Country dial code" style="max-width:150px">
            <option value="+256">+256 Uganda</option></select>
          <input name="phone" inputmode="tel" required placeholder="700 000 000" aria-label="Mobile number"></div></label>
        <label class="lbl">Date of birth<div class="fld"><input name="dateOfBirth" type="date" required max="${new Date().getFullYear() - 18}-12-31"></div></label>
        ${sel('Gender', 'gender', ['', 'Female', 'Male', 'Other', 'Prefer not to say'])}
        <label class="lbl">Country<div class="fld"><input name="country" list="countryOptions"
          autocomplete="off" required placeholder="Start typing a country"></div></label>
        <label class="lbl">District<div class="fld"><input name="district"></div></label>
      </div>
      <div class="fgrid">
        <label class="lbl">Institution<div class="fld"><input name="institution"></div></label>
        <label class="lbl">Field of study<div class="fld"><input name="fieldOfStudy"></div></label>
        ${sel('Education level', 'educationLevel', ['', 'Primary', 'Secondary', 'Certificate', 'Diploma', 'University', 'Postgraduate'])}
        ${sel('Employment status', 'employmentStatus', ['', 'Unemployed', 'Self-employed', 'Employed', 'Student', 'Looking for work'])}
      </div>
      <label class="lbl">Career goal<div class="fld"><input name="careerGoal" placeholder="e.g. Become a front-end developer"></div></label>
      ${sel('Preferred language', 'preferredLanguage', [{ value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' },
        { value: 'lg', label: 'Luganda' }, { value: 'rw', label: 'Kinyarwanda' }], getLanguage())}
      <div class="lbl">Interests<div class="chips" style="margin-top:6px">
        ${['Technology', 'Business', 'Health', 'Creative arts', 'Agriculture', 'Climate', 'Education', 'Civic engagement']
          .map((interest) => `<label class="chip"><input type="checkbox" name="interests" value="${esc(interest)}"> ${esc(interest)}</label>`).join('')}
      </div></div>
      <input type="hidden" name="countryCode">
      <datalist id="countryOptions"></datalist>
      <div class="fgrid">
        <label class="lbl">Password<div class="fld"><input name="password" type="password" required minlength="8" autocomplete="new-password"></div>
          <div class="pw" data-pw><div class="pw-bars"><i></i><i></i><i></i><i></i></div>
            <small data-pw-label>At least 8 characters</small></div></label>
        <label class="lbl">Confirm password<div class="fld"><input name="confirmPassword" type="password" required minlength="8" autocomplete="new-password"></div></label>
      </div>
      <label class="row" style="justify-content:flex-start;gap:8px">
        <input type="checkbox" name="termsAccepted" required> I accept the participation terms</label>
      <label class="row" style="justify-content:flex-start;gap:8px">
        <input type="checkbox" name="privacyAccepted" required> I have read the privacy notice</label>
      <div class="err" data-err></div>
      <button class="btn y full" type="submit">Create Account</button>
      <div class="ctr">Already registered? <a class="lnk" href="#/login">Sign in</a></div>
    </form></div>`);

  loadCountryOptions($('#signupForm'));
  bindPasswordStrength($('#signupForm'));

  $('#signupForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const form = event.target;
    const button = form.querySelector('button[type=submit]');
    busy(button, true);
    const v = vals(form);
    const payload = {
      ...v,
      interests: $$('input[name="interests"]:checked', form).map((box) => box.value),
      termsAccepted: v.termsAccepted === 'on',
      privacyAccepted: v.privacyAccepted === 'on',
    };
    try {
      const result = await api.post('/auth/signup', payload);
      form.querySelector('[data-err]').style.color = 'var(--ok)';
      form.querySelector('[data-err]').textContent = 'Application received. An administrator will review your account.';
      form.reset();
    } catch (error) {
      form.querySelector('[data-err]').style.color = 'var(--bad)';
      form.querySelector('[data-err]').textContent = error.message;
    } finally { busy(button, false); }
  });
}

/* Countries and password strength shared by the sign-up form. */
let countryCache = null;
async function countryOptions() {
  if (!countryCache) countryCache = await api.get('/public/countries');
  return countryCache;
}

async function loadCountryOptions(form) {
  if (!form) return;
  try {
    const countries = await countryOptions();
    const list = form.querySelector('#countryOptions');
    const dial = form.querySelector('#dialSelect');
    if (list) {
      list.innerHTML = countries.map((country) => `<option value="${esc(country.name)}" data-code="${esc(country.code)}"></option>`).join('');
    }
    if (dial) {
      dial.innerHTML = countries.filter((country) => country.dialCode).map((country) =>
        `<option value="${esc(country.dialCode)}" ${country.code === 'UG' ? 'selected' : ''}>${esc(country.dialCode)} ${esc(country.name)}</option>`).join('');
    }
    const countryInput = form.querySelector('input[name="country"]');
    const codeInput = form.querySelector('input[name="countryCode"]');
    if (!countryInput || !codeInput) return;
    countryInput.addEventListener('change', () => {
      const match = countries.find((country) => country.name.toLowerCase() === countryInput.value.trim().toLowerCase());
      codeInput.value = match ? match.code : '';
      if (match && match.dialCode && dial) dial.value = match.dialCode;
    });
  } catch { /* the learner can still type their country */ }
}

function passwordScore(value) {
  if (!value) return 0;
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((re) => re.test(value)).length;
  if (classes >= 3) score++;
  if (classes >= 4) score++;
  return Math.min(4, score);
}

function bindPasswordStrength(form) {
  const input = form?.querySelector('input[name="password"]');
  const meter = form?.querySelector('[data-pw]');
  if (!input || !meter) return;
  const bars = [...meter.querySelectorAll('i')];
  const label = meter.querySelector('[data-pw-label]');
  const words = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  input.addEventListener('input', () => {
    const score = passwordScore(input.value);
    bars.forEach((bar, index) => bar.classList.toggle('on', index < score));
    label.textContent = input.value ? words[score] : 'At least 8 characters';
  });
}

/* ========================================================= admin pages */
PAGES.admin.dashboard = async (page) => {
  const [statsData, audit] = await Promise.all([api.get('/admin/dashboard'), api.get('/admin/audit').catch(() => [])]);
  page.innerHTML = hero('Welcome, Administrator', 'Here’s what’s happening on YEP today', '', '🏛️') +
    stats([['👥', 'c1', statsData.participants, 'Total Participants'], ['📚', 'c2', statsData.programmes, 'Live Programmes'],
      ['🚀', 'c3', statsData.activeProjects, 'Active Projects'], ['🏅', 'c4', statsData.certificates, 'Certificates Issued']]) +
    `<div class="g g2">
      <div class="card"><h3>Participant growth</h3>${bars([['Q1', Math.max(1, Math.round(statsData.participants * 0.35))],
        ['Q2', Math.max(2, Math.round(statsData.participants * 0.6))], ['Q3', Math.max(3, Math.round(statsData.participants * 0.8))],
        ['Now', statsData.participants]])}</div>
      <div class="card"><h3>Recent activity <button class="lnk" data-goto="participants">View all →</button></h3>
        ${audit.slice(0, 4).map((entry) => act('•', 'c1', entry.action.replace(/_/g, ' '), `${entry.actorName} · ${dt(entry.createdAt)}`)).join('') || empty('No activity yet.')}</div>
    </div>
    <div class="ban"><span>🏆</span><h3>${statsData.pendingApprovals} registration(s) waiting for review</h3>
      <button class="btn y sm" data-goto="participants">Review now →</button></div>`;
};

const USER_ROLES = [
  { value: '', label: 'All users' },
  { value: 'PARTICIPANT', label: 'Participants' },
  { value: 'MENTOR', label: 'Mentors' },
  { value: 'FACILITATOR', label: 'Facilitators' },
  { value: 'SPONSOR', label: 'Sponsors' },
  { value: 'INSTRUCTOR', label: 'Instructors' },
  { value: 'REVIEWER', label: 'Reviewers' },
  { value: 'EMPLOYER', label: 'Employers' },
  { value: 'ADMIN', label: 'Admins' },
];

PAGES.admin.participants = async (page) => {
  const role = state.userRole || '';
  const filters = new URLSearchParams();
  if (role) filters.set('role', role);
  if (state.userCountry) filters.set('country', state.userCountry);
  if (state.userEducation) filters.set('education', state.userEducation);
  const [users, allUsers] = await Promise.all([
    api.get(`/admin/users${filters.toString() ? '?' + filters.toString() : ''}`),
    api.get('/admin/users'),
  ]);
  const counts = allUsers.reduce((map, user) => ({ ...map, [user.role]: (map[user.role] || 0) + 1 }), {});
  const distinct = (key) => [...new Set(allUsers.map((user) => user[key]).filter(Boolean))].sort();
  page.innerHTML = head('User management', 'Create accounts and approve, suspend or reject any user',
    '<button class="btn sm" data-new>+ Create user</button>') +
    `<section class="card">${tabStrip(USER_ROLES.map((tab) => [tab.value, tab.label]), role,
      { attribute: 'data-role', className: 'role-tabs', counts: USER_ROLES.reduce((map, tab) => (tab.value ? { ...map, [tab.value]: counts[tab.value] || 0 } : map), {}) })}
    <div class="fgrid" style="margin-bottom:12px">
      ${sel('Country', 'countryFilter', [{ value: '', label: 'All countries' }, ...distinct('country')], state.userCountry || '')}
      ${sel('Education level', 'educationFilter', [{ value: '', label: 'All education levels' }, ...distinct('educationLevel')], state.userEducation || '')}
    </div>
    ${table(['Name', 'Role', 'Country', 'Education', 'District', 'Status', 'Joined', 'Actions'], users.map((u) => [
      `<strong>${esc(u.fullName)}</strong>`, `<span class="tag Review">${esc(u.role)}</span>`,
      esc(u.country || '—'), esc(u.educationLevel || '—'), esc(u.district || '—'), tag(u.status), d(u.createdAt),
      `<span class="pgh">${u.status !== 'APPROVED' ? `<button class="btn ok sm" data-status="${u.id}" data-next="APPROVED">Approve</button>` : ''}
        ${u.status === 'APPROVED' ? `<button class="btn ghost sm" data-status="${u.id}" data-next="SUSPENDED">Suspend</button>` : ''}
        ${u.status !== 'REJECTED' ? `<button class="btn bad sm" data-status="${u.id}" data-next="REJECTED">Reject</button>` : ''}</span>`,
    ]))}</section>`;

  $$('[data-role]').forEach((button) => button.addEventListener('click', () => {
    state.userRole = button.dataset.role;
    go('participants');
  }));
  $('select[name="countryFilter"]').addEventListener('change', (event) => {
    state.userCountry = event.target.value;
    go('participants');
  });
  $('select[name="educationFilter"]').addEventListener('change', (event) => {
    state.userEducation = event.target.value;
    go('participants');
  });

  const decide = async (id, next) => {
    try { await api.put(`/admin/users/${id}/status`, { status: next }); toast('Account updated.'); go('participants'); }
    catch (error) { toast(error.message); }
  };
  $$('[data-status]').forEach((b) => b.addEventListener('click', () => decide(b.dataset.status, b.dataset.next)));

  $('[data-new]').addEventListener('click', () => {
    modal(`<h3>Create a user</h3><form id="newUser" class="fgrid">
      ${fld('Full name', 'fullName', { required: true })}${fld('Email', 'email', { type: 'email', required: true })}
      ${fld('Phone', 'phone')}
      ${sel('Role', 'role', USER_ROLES.filter((r) => r.value))}
      ${fld('Temporary password', 'password', { type: 'password', value: 'Password123!' })}
      <div class="pgh" style="grid-column:1/-1"><button class="btn" type="submit">Create account</button>
      <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newUser').addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await api.post('/admin/users', vals(event.target));
        closeModal(); toast('Account created.'); go('participants');
      } catch (error) { toast(error.message); }
    });
  });
};

PAGES.admin.programmes = async (page) => {
  const list = await api.get('/admin/programmes');
  page.innerHTML = head('Programmes', 'Create programmes, set capacity and close registration',
    '<button class="btn sm" data-new>+ New programme</button>') +
    `<div class="cards">${list.map((p) => `<article class="card pc">
      <div class="im">${esc(p.icon || '🎓')}</div>
      <h3 style="margin:0">${esc(p.title)}</h3>
      <div class="meta"><span class="tag Review">${esc(p.category)}</span><span>${p.placesLeft}/${p.capacity} places</span><span>Closes ${d(p.registrationDeadline)}</span></div>
      <div class="pgh">${tag(p.published ? 'Published' : 'Draft')}
        <button class="btn ghost sm" data-toggle="${p.id}">${p.published ? 'Unpublish' : 'Publish'}</button></div>
    </article>`).join('') || empty('No programmes yet.')}</div>`;

  $$('[data-toggle]').forEach((button) => button.addEventListener('click', async () => {
    const programme = list.find((item) => String(item.id) === button.dataset.toggle);
    try {
      await api.put(`/admin/programmes/${programme.id}`, {
        title: programme.title, category: programme.category, icon: programme.icon, capacity: programme.capacity,
        registrationDeadline: programme.registrationDeadline, eligibilityText: programme.eligibilityText || '',
        published: !programme.published,
      });
      toast('Programme updated.'); go('programmes');
    } catch (error) { toast(error.message); }
  }));

  $('[data-new]').addEventListener('click', () => {
    modal(`<h3>New programme</h3><form id="newProgramme">
      ${fld('Title', 'title', { required: true })}${fld('Category', 'category', { required: true })}
      <div class="fgrid">${fld('Icon', 'icon', { placeholder: '🎓' })}${fld('Capacity', 'capacity', { type: 'number', min: 1, value: 30 })}</div>
      ${fld('Registration deadline', 'registrationDeadline', { type: 'datetime-local', required: true })}
      ${txt('Eligibility', 'eligibilityText')}
      <label class="row"><span>Publish immediately</span><input type="checkbox" name="published" checked></label>
      <div class="pgh"><button class="btn" type="submit">Create programme</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newProgramme').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      try {
        await api.post('/admin/programmes', { ...v, capacity: Number(v.capacity), published: v.published === 'on',
          registrationDeadline: new Date(v.registrationDeadline).toISOString() });
        closeModal(); toast('Programme created.'); go('programmes');
      } catch (error) { toast(error.message); }
    });
  });
};

PAGES.admin.academies = async (page) => {
  const [tree, allCourses] = await Promise.all([api.get('/admin/catalogue'), api.get('/admin/courses')]);
  const paths = tree.flatMap((entry) => entry.careerPaths);
  const pathOptions = paths.map((path) => ({ value: path.id, label: `${path.academyName} · ${path.title}` }));

  page.innerHTML = head('Academies', 'Create academy groups, career paths and courses — no code changes needed',
    '<button class="btn sm" data-new-academy>+ New academy</button><button class="btn ghost sm" data-new-path>+ Career path</button><button class="btn ghost sm" data-new-course>+ Course</button>') +
    `<div class="cards">${tree.map((entry) => {
      const academy = entry.academy;
      return `<article class="card pc">
        <div class="im" style="${academy.colour ? `background:linear-gradient(135deg,${esc(academy.colour)},var(--navy))` : ''}">${esc(academy.icon || '🏫')}</div>
        <h3 style="margin:0">${esc(academy.name)} ${tag(academy.published ? 'Published' : 'Draft')}</h3>
        <small style="color:var(--mut)">${esc(academy.tagline || academy.slug)}</small>
        <div class="meta"><span>${academy.careerPathCount} career path(s)</span><span>${academy.courseCount} course(s)</span></div>
        <div class="pgh">
          <button class="btn ghost sm" data-edit-academy="${academy.id}">Edit</button>
          <button class="btn ghost sm" data-publish-academy="${academy.id}">${academy.published ? 'Unpublish' : 'Publish'}</button>
          <button class="btn sm" data-add-path="${academy.id}">+ Career path</button>
        </div>
        <div style="display:grid;gap:8px;margin-top:6px">${entry.careerPaths.length ? entry.careerPaths.map((path) => `<div class="act">
          <div class="ic c2">${esc(path.icon || '🧭')}</div>
          <div class="grow"><b>${esc(path.title)}</b><small>${path.courses.length} course(s) · ${path.published ? 'published' : 'draft'}</small></div>
          <button class="btn ghost sm" data-edit-path="${path.id}">Edit</button>
        </div>`).join('') : `<small style="color:var(--mut)">No career paths yet.</small>`}</div>
      </article>`;
    }).join('') || empty('No academies yet. Create the first one.')}</div>` +
    card('All courses', table(['Course', 'Career path', 'Level', 'Modules', 'Status', 'Actions'], allCourses.map((course) => [
      `<strong>${esc(course.title)}</strong><br><small style="color:var(--mut)">${esc(course.code)}</small>`,
      esc(course.careerPathTitle), `Level ${course.level}`, String(course.moduleCount),
      tag(course.published ? 'Published' : 'Draft'),
      `<span class="pgh"><button class="btn ghost sm" data-edit-course="${course.id}">Edit</button>
        <button class="btn ghost sm" data-course-content="${course.id}">Content</button>
        <button class="btn ghost sm" data-publish-course="${course.id}">${course.published ? 'Unpublish' : 'Publish'}</button></span>`,
    ])));

  const academyById = new Map(tree.map((entry) => [entry.academy.id, entry.academy]));
  const pathById = new Map(paths.map((path) => [path.id, path]));
  const courseById = new Map(allCourses.map((course) => [course.id, course]));

  $$('[data-new-academy]').forEach((b) => b.addEventListener('click', () => academyForm()));
  $$('[data-edit-academy]').forEach((b) => b.addEventListener('click', () => academyForm(academyById.get(Number(b.dataset.editAcademy)))));
  $$('[data-new-path]').forEach((b) => b.addEventListener('click', () => pathForm()));
  $$('[data-add-path]').forEach((b) => b.addEventListener('click', () => pathForm(null, Number(b.dataset.addPath))));
  $$('[data-edit-path]').forEach((b) => b.addEventListener('click', () => pathForm(pathById.get(Number(b.dataset.editPath)))));
  $$('[data-new-course]').forEach((b) => b.addEventListener('click', () => courseForm(null, pathOptions)));
  $$('[data-edit-course]').forEach((b) => b.addEventListener('click', () => courseForm(courseById.get(Number(b.dataset.editCourse)), pathOptions)));
  $$('[data-course-content]').forEach((b) => b.addEventListener('click', () => {
    state.adminCourseId = Number(b.dataset.courseContent);
    go('courseContent');
  }));

  $$('[data-publish-academy]').forEach((b) => b.addEventListener('click', () => {
    const academy = academyById.get(Number(b.dataset.publishAcademy));
    publish('academies', academy.id, !academy.published);
  }));
  $$('[data-publish-course]').forEach((b) => b.addEventListener('click', () => {
    const course = courseById.get(Number(b.dataset.publishCourse));
    publish('courses', course.id, !course.published);
  }));

  function academyForm(academy) {
    modal(`<h3>${academy ? 'Edit academy' : 'New academy'}</h3><form id="academyForm">
      ${fld('Name', 'name', { required: true, value: academy?.name || '' })}
      ${fld('Tagline', 'tagline', { value: academy?.tagline || '', placeholder: 'One line that describes it' })}
      ${txt('Description', 'description', { value: academy?.description || '' })}
      <div class="fgrid">${fld('Icon', 'icon', { value: academy?.icon || '🏫' })}
        ${fld('Colour', 'colour', { value: academy?.colour || '#1d4ed8', placeholder: '#1d4ed8' })}
        ${fld('Sort order', 'sortOrder', { type: 'number', min: 0, value: academy?.sortOrder ?? 0 })}</div>
      <label class="row"><span>Published</span><input type="checkbox" name="published" ${!academy || academy.published ? 'checked' : ''}></label>
      <div class="pgh"><button class="btn" type="submit">${academy ? 'Save changes' : 'Create academy'}</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#academyForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      const payload = { name: v.name, tagline: v.tagline, description: v.description, icon: v.icon,
        colour: v.colour, sortOrder: Number(v.sortOrder || 0), published: v.published === 'on' };
      try {
        if (academy) await api.put(`/admin/academies/${academy.id}`, payload);
        else await api.post('/admin/academies', payload);
        closeModal(); toast(academy ? 'Academy updated.' : 'Academy created.'); go('academies');
      } catch (error) { toast(error.message); }
    });
  }

  function pathForm(path, presetAcademyId) {
    const academyId = path?.academyId || presetAcademyId || tree[0]?.academy.id;
    if (!academyId) { toast('Create an academy first.'); return; }
    modal(`<h3>${path ? 'Edit career path' : 'New career path'}</h3><form id="pathForm">
      ${sel('Academy', 'academyId', tree.map((entry) => ({ value: entry.academy.id, label: entry.academy.name })), academyId)}
      ${fld('Title', 'title', { required: true, value: path?.title || '' })}
      ${fld('Summary', 'summary', { value: path?.summary || '' })}
      ${txt('Description', 'description', { value: path?.description || '' })}
      <div class="fgrid">${fld('Icon', 'icon', { value: path?.icon || '🧭' })}
        ${fld('Sort order', 'sortOrder', { type: 'number', min: 0, value: path?.sortOrder ?? 0 })}</div>
      <label class="row"><span>Published</span><input type="checkbox" name="published" ${!path || path.published ? 'checked' : ''}></label>
      <div class="pgh"><button class="btn" type="submit">${path ? 'Save changes' : 'Create career path'}</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#pathForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      const payload = { academyId: Number(v.academyId), title: v.title, summary: v.summary,
        description: v.description, icon: v.icon, sortOrder: Number(v.sortOrder || 0),
        published: v.published === 'on' };
      try {
        if (path) await api.put(`/admin/career-paths/${path.id}`, payload);
        else await api.post('/admin/career-paths', payload);
        closeModal(); toast(path ? 'Career path updated.' : 'Career path created.'); go('academies');
      } catch (error) { toast(error.message); }
    });
  }

  function courseForm(course, options) {
    if (!options.length) { toast('Create a career path first.'); return; }
    const careerPathId = course?.careerPathId || options[0].value;
    modal(`<h3>${course ? 'Edit course' : 'New course'}</h3><form id="courseForm">
      ${sel('Career path', 'careerPathId', options, careerPathId)}
      <div class="fgrid">${fld('Code', 'code', { required: true, value: course?.code || '' , placeholder: 'TECH-WEB-L1' })}
        ${fld('Title', 'title', { required: true, value: course?.title || '' })}</div>
      ${fld('Summary', 'summary', { value: course?.summary || '' })}
      ${txt('Description', 'description', { value: course?.description || '' })}
      <div class="fgrid">${sel('Level', 'level', [{ value: 1, label: 'Level One' }, { value: 2, label: 'Level Two' }], course?.level || 1)}
        ${fld('Duration (hours)', 'durationHours', { type: 'number', min: 0, value: course?.durationHours ?? 20 })}
        ${fld('Icon', 'icon', { value: course?.icon || '📘' })}
        ${fld('Sort order', 'sortOrder', { type: 'number', min: 0, value: course?.sortOrder ?? 0 })}</div>
      <label class="row"><span>Published</span><input type="checkbox" name="published" ${!course || course.published ? 'checked' : ''}></label>
      <div class="pgh"><button class="btn" type="submit">${course ? 'Save changes' : 'Create course'}</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#courseForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      const payload = { careerPathId: Number(v.careerPathId), code: v.code, title: v.title,
        summary: v.summary, description: v.description, level: Number(v.level),
        durationHours: Number(v.durationHours || 0), icon: v.icon,
        sortOrder: Number(v.sortOrder || 0), published: v.published === 'on' };
      try {
        if (course) await api.put(`/admin/courses/${course.id}`, payload);
        else await api.post('/admin/courses', payload);
        closeModal(); toast(course ? 'Course updated.' : 'Course created.'); go('academies');
      } catch (error) { toast(error.message); }
    });
  }

  async function publish(kind, id, published) {
    try {
      await api.put(`/admin/${kind}/${id}/publish?published=${published}`, {});
      toast('Visibility updated.'); go('academies');
    } catch (error) { toast(error.message); }
  }
};

/* Admin: course content authoring — modules and lessons are data, not code. */
PAGES.admin.courseContent = async (page) => {
  const courseId = state.adminCourseId;
  if (!courseId) { go('academies'); return; }
  const outline = await api.get(`/content/courses/${courseId}/outline`);
  const course = outline.course;

  page.innerHTML = head(`${course.title} — content`,
    `${course.code} · ${outline.modules.length} module(s) · ${course.published ? 'published' : 'draft'}`,
    '<button class="btn ghost sm" data-back>← All courses</button><button class="btn sm" data-new-module>+ Module</button>') +
    (outline.modules.length ? outline.modules.map((module) => `<section class="card">
      <h3 style="margin-bottom:6px">${esc(module.icon || '📘')} ${esc(module.name)}</h3>
      <div class="pgh" style="margin-bottom:8px">
        <button class="btn ghost sm" data-edit-module="${module.id}">Edit module</button>
        <button class="btn ghost sm" data-delete-module="${module.id}">Delete module</button>
        <button class="btn sm" data-add-lesson="${module.id}">+ Lesson</button></div>
      ${module.lessons.length ? table(['Lesson', 'Type', 'Minutes', 'Actions'], module.lessons.map((lesson) => [
        `<strong>${esc(lesson.title)}</strong>`, esc(lesson.type), String(lesson.durationMinutes),
        `<span class="pgh"><button class="btn ghost sm" data-edit-lesson="${lesson.id}" data-module="${module.id}">Edit</button>
          <button class="btn ghost sm" data-delete-lesson="${lesson.id}">Delete</button></span>`]), false)
        : empty('No lessons in this module yet.')}
    </section>`).join('') : `<div class="card">${empty('No modules yet. Add the first module.')}</div>`);

  const moduleById = new Map(outline.modules.map((module) => [module.id, module]));
  $('[data-back]').addEventListener('click', () => go(state.contentBack || 'academies'));
  $$('[data-new-module]').forEach((b) => b.addEventListener('click', () => moduleForm()));
  $$('[data-edit-module]').forEach((b) => b.addEventListener('click', () => moduleForm(moduleById.get(Number(b.dataset.editModule)))));
  $$('[data-add-lesson]').forEach((b) => b.addEventListener('click', () => lessonForm(Number(b.dataset.addLesson))));
  $$('[data-edit-lesson]').forEach((b) => b.addEventListener('click', async () => {
    try {
      const lesson = await api.get(`/learning/lessons/${b.dataset.editLesson}`);
      lessonForm(Number(b.dataset.module), lesson);
    } catch (error) { toast(error.message); }
  }));
  $$('[data-delete-module]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Delete this module? Modules with lessons are protected.')) return;
    try { await api.del(`/content/modules/${b.dataset.deleteModule}`); toast('Module deleted.'); go('courseContent'); }
    catch (error) { toast(error.message); }
  }));
  $$('[data-delete-lesson]').forEach((b) => b.addEventListener('click', async () => {
    if (!confirm('Delete this lesson? Completed lessons are protected.')) return;
    try { await api.del(`/content/lessons/${b.dataset.deleteLesson}`); toast('Lesson deleted.'); go('courseContent'); }
    catch (error) { toast(error.message); }
  }));

  function moduleForm(module) {
    modal(`<h3>${module ? 'Edit module' : 'New module'}</h3><form id="moduleForm">
      ${fld('Name', 'name', { required: true, value: module?.name || '' })}
      <div class="fgrid">${fld('Icon', 'icon', { value: module?.icon || '📘' })}
        ${fld('Sort order', 'sortOrder', { type: 'number', min: 0, value: module?.sortOrder ?? 0 })}</div>
      ${txt('Outcome', 'outcome', { value: module?.outcome || '' })}
      ${sel('Level', 'level', [{ value: 1, label: 'Level One' }, { value: 2, label: 'Level Two' }], module?.level || course.level)}
      <div class="pgh"><button class="btn" type="submit">${module ? 'Save module' : 'Create module'}</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#moduleForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      const payload = { name: v.name, icon: v.icon, outcome: v.outcome,
        sortOrder: Number(v.sortOrder || 0), level: Number(v.level) };
      try {
        if (module) await api.put(`/content/modules/${module.id}`, payload);
        else await api.post(`/content/courses/${courseId}/modules`, payload);
        closeModal(); toast(module ? 'Module updated.' : 'Module created.'); go('courseContent');
      } catch (error) { toast(error.message); }
    });
  }

  function lessonForm(moduleId, lesson) {
    modal(`<h3>${lesson ? 'Edit lesson' : 'New lesson'}</h3><form id="lessonForm">
      ${fld('Title', 'title', { required: true, value: lesson?.title || '' })}
      <div class="fgrid">${sel('Type', 'type', ['VIDEO', 'NOTES', 'ACTIVITY'], lesson?.type || 'NOTES')}
        ${fld('Minutes', 'durationMinutes', { type: 'number', min: 0, value: lesson?.durationMinutes ?? 10 })}
        ${fld('Sort order', 'sortOrder', { type: 'number', min: 0, value: lesson?.sortOrder ?? 0 })}</div>
      ${txt('Content', 'content', { value: lesson?.content || '', placeholder: 'Lesson notes, transcript or activity brief' })}
      <div class="pgh"><button class="btn" type="submit">${lesson ? 'Save lesson' : 'Create lesson'}</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#lessonForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      const payload = { title: v.title, type: v.type, sortOrder: Number(v.sortOrder || 0),
        durationMinutes: Number(v.durationMinutes || 0), content: v.content };
      try {
        if (lesson) await api.put(`/content/lessons/${lesson.id}`, payload);
        else await api.post(`/content/modules/${moduleId}/lessons`, payload);
        closeModal(); toast(lesson ? 'Lesson updated.' : 'Lesson created.'); go('courseContent');
      } catch (error) { toast(error.message); }
    });
  }
};

PAGES.admin.exchange = async (page) => {
  const [sessions, partners, teams] = await Promise.all([
    api.get('/sessions'), api.get('/admin/partners').catch(() => []), api.get('/admin/teams').catch(() => []),
  ]);
  page.innerHTML = head('Virtual Exchange', 'Live rooms, partner organisations and exchange cohorts') +
    `<div class="g g2">
      <div class="card"><h3>Live exchange sessions</h3>${sessions.length ? sessions.map((s) => `<div class="act">
        <div class="ic cal">📅</div><div class="grow"><b>${esc(s.title)}</b><small>${esc(s.type)} · ${dt(s.startsAt)} · ${s.registeredCount} registered</small></div>
        <button class="btn r sm" data-room="${s.id}">Open room</button></div>`).join('') : empty('No sessions scheduled.')}</div>
      <div class="card"><h3>Partner network</h3><div class="cards" style="grid-template-columns:1fr 1fr">
        ${partners.map((p) => `<div class="card" style="box-shadow:none"><div class="im" style="height:60px;font-size:26px">${esc(p.icon || '🏢')}</div>
          <b>${esc(p.name)}</b><small>${esc(p.type)}</small></div>`).join('') || empty('No partners recorded.')}</div></div>
    </div>
    ${card('Exchange cohorts', table(['Team', 'Project', 'Milestones', 'Members'], teams.map((t) => [
      esc(t.name), esc(t.project ? t.project.title : 'Unassigned'), `${t.milestonesCompleted}/${t.milestonesTotal}`,
      String(t.members.length)])))}`;
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
};

PAGES.admin.projects = async (page) => {
  const [projects, teams, participants] = await Promise.all([
    api.get('/projects'), api.get('/admin/teams'), api.get('/admin/users?role=PARTICIPANT'),
  ]);
  const columns = ['PROPOSED', 'APPROVED', 'IN_PROGRESS', 'COMPLETED'];
  page.innerHTML = head('Impact Projects', 'Level Two projects, teams and milestones',
    '<button class="btn sm" data-team>+ Create team</button>') +
    `<div class="kan">${columns.map((status) => `<div class="col"><h4>${status.replace('_', ' ')}
      <span>${projects.filter((p) => p.status === status).length}</span></h4>
      ${projects.filter((p) => p.status === status).map((p) => `<div class="kc"><b>${esc(p.title)}</b>
        <small style="color:var(--mut)">${esc(p.category)}</small>${tag(status)}</div>`).join('') || '<small style="color:var(--mut)">Empty</small>'}
      </div>`).join('')}</div>` +
    card('Teams', table(['Team', 'Project', 'Lead', 'Milestones', 'Members'], teams.map((t) => [
      `<strong>${esc(t.name)}</strong>`, esc(t.project ? t.project.title : '—'), esc(t.lead ? t.lead.fullName : '—'),
      `${t.milestonesCompleted}/${t.milestonesTotal}`, String(t.members.length)])));

  $('[data-team]').addEventListener('click', () => {
    modal(`<h3>Create a Level Two team</h3><form id="newTeam">
      ${fld('Team name', 'name', { required: true })}
      ${sel('Project', 'projectId', projects.map((p) => ({ value: p.id, label: p.title })))}
      ${sel('Team lead', 'leadUserId', participants.map((p) => ({ value: p.id, label: p.fullName })))}
      ${fld('Cohort', 'cohort', { placeholder: 'Cohort A' })}
      <div class="lbl">Members<div class="chips" style="margin-top:6px">${participants.map((p) =>
        `<label class="chip"><input type="checkbox" name="memberIds" value="${p.id}"> ${esc(p.fullName)}</label>`).join('')}</div></div>
      <div class="pgh"><button class="btn" type="submit">Create team</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newTeam').addEventListener('submit', async (event) => {
      event.preventDefault();
      const form = event.target;
      const v = vals(form);
      const memberIds = $$('input[name="memberIds"]:checked', form).map((box) => Number(box.value));
      if (!memberIds.includes(Number(v.leadUserId))) memberIds.push(Number(v.leadUserId));
      try {
        await api.post('/admin/teams', { name: v.name, cohort: v.cohort, leadUserId: Number(v.leadUserId),
          memberIds, projectId: Number(v.projectId) });
        closeModal(); toast('Team created.'); go('projects');
      } catch (error) { toast(error.message); }
    });
  });
};

PAGES.admin.assessments = async (page) => {
  const [list, modules] = await Promise.all([api.get('/assessments'), api.get('/learning/modules')]);
  page.innerHTML = head('Assessments', 'Create quizzes, publish results and review scores',
    '<button class="btn sm" data-new>+ New assessment</button>') +
    card('All assessments', table(['Assessment', 'Module', 'Due', 'Marks', 'Results', 'Actions'], list.map((a) => [
      `<strong>${esc(a.title)}</strong>`, esc(a.moduleName), d(a.dueDate), String(a.totalMarks),
      a.resultsPublished ? tag('Published') : tag('Pending'),
      `<span class="pgh"><button class="btn ghost sm" data-roster="${a.id}">Roster</button>
       <button class="btn sm" data-publish="${a.id}" ${a.resultsPublished ? 'disabled' : ''}>Publish</button></span>`,
    ])));

  $$('[data-publish]').forEach((b) => b.addEventListener('click', async () => {
    busy(b, true);
    try { await api.post(`/assessments/${b.dataset.publish}/publish`); toast('Results published.'); go('assessments'); }
    catch (error) { toast(error.message); busy(b, false); }
  }));
  $$('[data-roster]').forEach((b) => b.addEventListener('click', async () => {
    try {
      const rows = await api.get(`/assessments/${b.dataset.roster}/roster`);
      modal(`<h3>Roster</h3>${table(['Participant', 'Score', 'Percent', 'Submitted'], rows.map((r) => [
        esc(r.student), `${r.score ?? '—'}/${r.totalMarks}`, r.percentage ?? '—', d(r.submittedAt)]), false)}
        <button class="btn ghost" data-close>Close</button>`);
      $('[data-close]').addEventListener('click', closeModal);
    } catch (error) { toast(error.message); }
  }));

  $('[data-new]').addEventListener('click', () => {
    const questions = [1, 2, 3].map((n) => `<fieldset style="border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:8px">
      <legend>Question ${n}</legend>${fld('Prompt', `q${n}_prompt`)}
      <div class="fgrid">${fld('Option A', `q${n}_a`)}${fld('Option B', `q${n}_b`)}</div>
      <div class="fgrid">${fld('Option C', `q${n}_c`)}${fld('Option D', `q${n}_d`)}</div>
      ${sel('Correct option', `q${n}_correct`, ['A', 'B', 'C', 'D'])}</fieldset>`).join('');
    modal(`<h3>New assessment</h3><form id="newAssessment">
      ${sel('Module', 'moduleId', modules.map((m) => ({ value: m.id, label: m.name })))}
      ${fld('Title', 'title', { required: true })}
      ${fld('Due date', 'dueDate', { type: 'datetime-local', required: true })}
      ${questions}
      <div class="pgh"><button class="btn" type="submit">Create</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newAssessment').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      const bank = [1, 2, 3].filter((n) => v[`q${n}_prompt`] && v[`q${n}_a`] && v[`q${n}_b`])
        .map((n) => ({ prompt: v[`q${n}_prompt`], optionA: v[`q${n}_a`], optionB: v[`q${n}_b`],
          optionC: v[`q${n}_c`] || null, optionD: v[`q${n}_d`] || null, correctOption: v[`q${n}_correct`] }));
      try {
        await api.post('/assessments', { moduleId: Number(v.moduleId), title: v.title,
          dueDate: new Date(v.dueDate).toISOString(), published: true, questions: bank });
        closeModal(); toast('Assessment created.'); go('assessments');
      } catch (error) { toast(error.message); }
    });
  });
};

PAGES.admin.certificates = async (page) => {
  const [issued, participants] = await Promise.all([
    api.get('/certificates/issued').catch(() => []), api.get('/admin/users?role=PARTICIPANT'),
  ]);
  page.innerHTML = head('Certificates', 'Issued only when both levels reach 100%',
    '<button class="btn sm" data-issue>+ Issue certificate</button>') +
    card('Issued certificates', table(['Code', 'Holder', 'Programme', 'Issued', 'Download'], issued.map((c) => [
      `<strong>${esc(c.code)}</strong>`, esc(c.holderName), esc(c.programmeLabel), d(c.issuedAt),
      `<button class="btn ghost sm" data-pdf="${c.holderId}">PDF</button>`])));

  $$('[data-pdf]').forEach((b) => b.addEventListener('click', async () => {
    try { await download(`/certificates/${b.dataset.pdf}/pdf`, 'yep-certificate.pdf'); } catch (error) { toast(error.message); }
  }));

  $('[data-issue]').addEventListener('click', () => {
    modal(`<h3>Issue a certificate</h3><form id="issueForm">
      ${sel('Participant', 'userId', participants.map((p) => ({ value: p.id, label: `${p.fullName} (${p.status})` })))}
      ${fld('Programme label', 'programmeLabel', { value: 'YEP Youth Empowerment Programme' })}
      <div class="pgh"><button class="btn" type="submit">Issue</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#issueForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      try {
        const result = await api.post('/certificates', { userId: Number(v.userId), programmeLabel: v.programmeLabel });
        closeModal(); toast(`Issued ${result.code}.`); go('certificates');
      } catch (error) { toast(error.message); }
    });
  });
};

PAGES.admin.reports = async (page) => {
  const catalogue = await api.get('/reports');
  page.innerHTML = head('Reports', 'Live data, exportable as CSV or PDF') +
    card('Choose a report', `<div class="chips">${catalogue.map((r) =>
      `<button class="chip" data-report="${esc(r.key)}">${esc(r.title)}</button>`).join('')}</div>`) +
    `<div id="reportOut">${empty('Pick a report above.')}</div>`;

  $$('[data-report]').forEach((button) => button.addEventListener('click', async () => {
    const key = button.dataset.report;
    const out = $('#reportOut');
    out.innerHTML = `<div class="card">${empty('Running…')}</div>`;
    try {
      const report = await api.get(`/reports/${key}`);
      out.innerHTML = card(`${report.title} · ${report.rows.length} rows`,
        `<div class="pgh" style="margin-bottom:10px"><button class="btn ghost sm" data-export="csv">CSV</button>
          <button class="btn ghost sm" data-export="pdf">PDF</button></div>` +
        table(report.columns, report.rows.map((row) => row.map((cell) => esc(cell))), false),
        '<span class="pgh"></span>');
      $$('[data-export]', out).forEach((b) => b.addEventListener('click', async () => {
        try { await download(`/reports/${key}/export?format=${b.dataset.export}`, `${key}.${b.dataset.export}`); }
        catch (error) { toast(error.message); }
      }));
    } catch (error) { out.innerHTML = card('Report failed', `<div class="err">${esc(error.message)}</div>`); }
  }));
};

PAGES.admin.settings = async (page) => {
  const [values, matrix, audit] = await Promise.all([
    api.get('/admin/settings'), api.get('/admin/permissions'), api.get('/admin/audit'),
  ]);
  const labels = Object.keys(matrix[0]?.permissions || {});
  page.innerHTML = head('Settings', 'Business rules, permissions and the audit trail') +
    card('Business rules', `<form id="settingsForm" class="fgrid">
      ${Object.entries(values).map(([key, value]) => fld(key.replace(/_/g, ' '), key, { value })).join('')}
      <div class="pgh" style="grid-column:1/-1"><button class="btn" type="submit">Save rules</button></div></form>`) +
    card('Roles & permissions', `<div class="tw"><table><thead><tr><th>Role</th>
      ${labels.map((l) => `<th>${esc(l)}</th>`).join('')}</tr></thead><tbody>
      ${matrix.map((row) => `<tr><td>${esc(row.role)}</td>${labels.map((label) =>
        `<td><button class="sw2 ${row.permissions[label] ? 'on' : ''}" data-perm="${esc(row.role)}|${esc(label)}" aria-label="${esc(label)} for ${esc(row.role)}"></button></td>`).join('')}</tr>`).join('')}
      </tbody></table></div>`) +
    card('Audit trail', table(['When', 'Actor', 'Action', 'Details'], audit.slice(0, 40).map((entry) => [
      dt(entry.createdAt), esc(entry.actorName), esc(entry.action), esc(entry.details || '')])));

  $('#settingsForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await api.put('/admin/settings', { values: vals(event.target) }); toast('Rules saved.'); }
    catch (error) { toast(error.message); }
  });
  $$('[data-perm]').forEach((button) => button.addEventListener('click', async () => {
    const [role, permission] = button.dataset.perm.split('|');
    const allowed = !button.classList.contains('on');
    button.classList.toggle('on', allowed);
    try { await api.put('/admin/permissions', { role, permission, allowed }); toast('Permission updated.'); }
    catch (error) { button.classList.toggle('on', !allowed); toast(error.message); }
  }));
};

/* =================================================== participant pages */
const pct = (value) => Math.round(Number(value) || 0);
const firstName = (name) => String(name || 'there').split(' ')[0];

async function uploadFile(path, file) {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch(`/api${path}`, {
    method: 'POST',
    headers: session.token ? { Authorization: `Bearer ${session.token}` } : {},
    body,
  });
  if (!response.ok) throw new Error('That file could not be uploaded (PDF, image or document, max 10 MB).');
  return response.json();
}

async function openRoom(sessionId) {
  try {
    const detail = await api.get(`/sessions/${sessionId}`);
    const custom = detail.meetingLink && !/example\.(org|com)/i.test(detail.meetingLink) ? detail.meetingLink : '';
    const room = detail.roomName || `yep-session-${detail.id}`;
    const link = custom || `https://meet.jit.si/${room}`;
    const joinUrl = link.includes('?') ? `${link}&config.prejoinPageEnabled=true`
      : `${link}?config.prejoinPageEnabled=true`;
    modal(`<div class="conf-head">
        <div><h3 style="margin:0">${esc(detail.title)}</h3>
          <div class="conf-meta"><span>📅 ${dt(detail.startsAt)}</span><span>${esc(detail.type)}</span>
          <span>${esc(detail.cohort || 'All cohorts')}</span><span>👥 ${detail.registeredCount} registered</span></div></div>
        <button class="btn ghost sm" data-close>Close</button></div>
      <div class="conf-bar">
        <button class="btn r sm" data-copy="${esc(link)}">Copy invite link</button>
        <a class="btn ghost sm" href="${esc(link)}" target="_blank" rel="noopener">Open in new tab</a>
        <a class="btn ghost sm" href="${esc(joinUrl)}" target="_blank" rel="noopener">Test camera &amp; mic</a>
        ${detail.registered ? '<span class="tag Completed">You are registered</span>' : ''}
        <span class="conf-note">Room: ${esc(room)}</span>
      </div>
      <iframe class="conf-frame" src="${esc(joinUrl)}" title="Virtual classroom"
        allow="camera; microphone; fullscreen; display-capture; autoplay; clipboard-write"></iframe>
      <p class="conf-note">You will join in a browser — no account is needed. Allow camera and microphone when prompted,
        use headphones to avoid echo, and keep the session tab open. If the embedded room is blocked by your network,
        use “Open in new tab”. Sessions can be recorded only with everyone’s consent.</p>`);
    $('[data-close]').addEventListener('click', closeModal);
    const copy = $('[data-copy]');
    if (copy) copy.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(link);
        toast('Invite link copied.');
      } catch { toast('Copy failed — select the room link instead.'); }
    });
  } catch (error) { toast(error.message); }
}

let levelTwoTimer = null;
function watchLevelTwo(unlocked) {
  clearInterval(levelTwoTimer);
  if (unlocked) return;
  levelTwoTimer = setInterval(async () => {
    if (state.page !== 'dashboard' && state.page !== 'learning') { clearInterval(levelTwoTimer); return; }
    try {
      const progress = await api.get('/learning/progress');
      if (progress.levelTwoUnlocked) {
        clearInterval(levelTwoTimer);
        toast('Level Two is now unlocked. Welcome to the impact project level.');
        go(state.page);
      }
    } catch { /* keep watching quietly */ }
  }, 20000);
}

PAGES.participant.dashboard = async (page) => {
  const [dash, applications] = await Promise.all([api.get('/dashboard'), api.get('/programmes/mine').catch(() => [])]);
  const p = dash.progress || {};
  const next = (dash.sessions || [])[0];
  page.innerHTML = hero(`Hello, ${firstName(dash.user?.fullName)} 👋`, 'Keep learning, grow your skills, and make an impact.',
    '<button class="btn y" data-goto="programmes">Explore Programmes →</button>', '🎓') +
    `<div class="g g2">
      <div class="card"><h3>My Learning Progress</h3><div class="don">${donut(p.overallScore || 0)}
        <div><div class="on-t">${(p.overallScore || 0) >= 80 ? 'On Track' : 'In Progress'}</div>
        <p style="color:var(--mut);margin:2px 0 6px">Overall score <b>${p.overallScore || 0}%</b> · lessons ${pct(p.levelOnePercent)}% · assessments ${p.assessmentAverage || 0}% · attendance ${p.attendancePercent || 0}%</p>
        <p style="color:var(--mut);margin:0 0 10px">${p.levelTwoUnlocked ? 'Level Two unlocked' : 'Reach an overall score of 80% to unlock Level Two'}</p>
        <button class="btn ghost sm" data-goto="learning">View Details →</button></div></div></div>
      <div class="card"><h3>Upcoming Session</h3>${next ? `<div class="act"><div class="ic cal">📅</div>
        <div class="grow"><b>${esc(next.title)}</b><small>${dt(next.startsAt)} · ${esc(next.type)}</small></div></div>
        <button class="btn r full" data-room="${next.id}" style="margin-top:10px">Join Session</button>` : empty('No sessions scheduled yet.')}</div>
    </div>
    <div class="card l2card ${p.levelTwoUnlocked ? '' : 'locked'}" id="levelTwoCard">
      <div class="l2-head"><span class="l2-lock ${p.levelTwoUnlocked ? '' : 'lock-blink'}">${p.levelTwoUnlocked ? '🔓' : '🔒'}</span>
        <div class="grow"><h3 style="margin:0">${esc(t('Level Two'))} · ${esc(t(p.levelTwoUnlocked ? 'Unlocked' : 'Locked'))}</h3>
          <p style="color:var(--mut);margin-top:4px">${p.levelTwoUnlocked
            ? 'Your impact project is open. Work on milestones with your team and upload deliverables.'
            : esc(t('Complete 80% of Level One to open Level Two automatically'))}</p></div>
        <button class="btn ${p.levelTwoUnlocked ? 'r' : 'ghost'} sm" data-goto="${p.levelTwoUnlocked ? 'projects' : 'learning'}">
          ${p.levelTwoUnlocked ? 'Open Level Two' : 'Continue Level One'} →</button></div>
      ${bar(p.levelOnePercent)}
      <div class="steps">
        <span class="step ${pct(p.levelOnePercent) >= 100 ? 'done' : pct(p.levelOnePercent) >= 80 ? 'now' : ''}">Level One 80%</span>
        <span class="step ${p.levelTwoUnlocked ? 'done' : ''}">Unlock Level Two</span>
        <span class="step ${p.levelTwoPercent >= 100 ? 'done' : ''}">Milestones 100%</span>
        <span class="step ${p.certificateEligible ? 'done' : ''}">Certificate</span>
      </div>
    </div>
    <div class="g g3">
      <div class="card"><h3>My Programmes <button class="lnk" data-goto="programmes">View All →</button></h3>
        ${applications.slice(0, 2).map((a) => `<div class="prog" style="padding:8px 0"><div class="thumb">🎓</div>
          <div class="grow"><b>${esc(a.programmeTitle)}</b><br>${tag(a.status)}</div></div>`).join('')
          || empty('You have not applied to a programme yet.')}</div>
      <div class="card ql"><h3>Quick Links</h3>
        ${[['projects', '📁', 'My Projects'], ['assessments', '✅', 'Assessments'], ['certificates', '🏅', 'Certificates']]
          .map(([slug, icon, label]) => `<a href="#/app" data-goto="${slug}"><span class="ic c1">${icon}</span>${esc(t(label))}</a>`).join('')}
      </div>
    </div>`;
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
  watchLevelTwo(p.levelTwoUnlocked);
};

PAGES.participant.profile = async (page) => {
  const me = await api.get('/auth/me');
  page.innerHTML = head('My Profile', 'Keep your details current — they appear on your certificate') +
    `<div class="g g2">
      <div class="card"><h3>Personal details</h3><form id="profileForm" class="fgrid">
        ${fld('Full name', 'fullName', { value: me.fullName, required: true })}
        ${fld('Phone', 'phone', { value: me.phone || '' })}
        ${fld('Country', 'country', { value: me.country || '' })}
        ${fld('District', 'district', { value: me.district || '' })}
        ${fld('Date of birth', 'dateOfBirth', { type: 'date', value: me.dateOfBirth || '' })}
        ${fld('Institution', 'institution', { value: me.institution || '' })}
        ${fld('Field of study', 'fieldOfStudy', { value: me.fieldOfStudy || '' })}
        ${sel('Gender', 'gender', ['', 'Female', 'Male', 'Other', 'Prefer not to say'], me.gender || '')}
        ${sel('Education level', 'educationLevel', ['', 'Primary', 'Secondary', 'Certificate', 'Diploma', 'University', 'Postgraduate'], me.educationLevel || '')}
        ${sel('Employment status', 'employmentStatus', ['', 'Unemployed', 'Self-employed', 'Employed', 'Student', 'Looking for work'], me.employmentStatus || '')}
        ${sel('Preferred language', 'preferredLanguage', [{ value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' },
          { value: 'lg', label: 'Luganda' }, { value: 'rw', label: 'Kinyarwanda' }], me.preferredLanguage || 'en')}
        ${fld('Career goal', 'careerGoal', { value: me.careerGoal || '' })}
        ${fld('Interests (comma separated)', 'interests', { value: (me.interests || []).join(', ') })}
        ${fld('Skills (comma separated)', 'skills', { value: (me.skills || []).join(', ') })}
        <div class="pgh" style="grid-column:1/-1"><button class="btn" type="submit">Save changes</button></div>
      </form></div>
      <div class="card"><h3>Account</h3>
        <div class="act"><span class="ava">${esc(ini(me.fullName))}</span><div class="grow"><b>${esc(me.email)}</b>
          <small>${esc(me.role)} · ${esc(me.status)}</small></div>${tag(me.status)}</div>
        <h3 style="margin-top:18px">Change password</h3><form id="passwordForm">
          ${fld('Current password', 'currentPassword', { type: 'password', required: true })}
          ${fld('New password', 'newPassword', { type: 'password', required: true })}
          <button class="btn ghost" type="submit">Update password</button></form></div>
    </div>`;

  $('#profileForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const v = vals(event.target);
    try {
      const updated = await api.put('/auth/profile', { ...v, dateOfBirth: v.dateOfBirth || null,
        interests: v.interests ? v.interests.split(',').map((s) => s.trim()).filter(Boolean) : [],
        skills: v.skills ? v.skills.split(',').map((s) => s.trim()).filter(Boolean) : [] });
      session.setUser(updated); toast('Profile saved.');
    } catch (error) { toast(error.message); }
  });
  $('#passwordForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await api.post('/auth/password', vals(event.target)); toast('Password updated.'); event.target.reset(); }
    catch (error) { toast(error.message); }
  });
};

PAGES.participant.programmes = async (page) => {
  const [catalogue, mine] = await Promise.all([api.get('/programmes'), api.get('/programmes/mine').catch(() => [])]);
  const applied = new Map(mine.map((a) => [a.programmeId, a.status]));
  page.innerHTML = head('Programmes', 'Apply to a programme and track your application') +
    `<div class="cards">${catalogue.map((p) => `<article class="card pc">
      <div class="im">${esc(p.icon || '🎓')}</div><h3 style="margin:0">${esc(p.title)}</h3>
      <div class="meta"><span class="tag Review">${esc(p.category)}</span><span>${p.placesLeft} places left</span>
        <span>Closes ${d(p.registrationDeadline)}</span></div>
      ${p.eligibilityText ? `<small style="color:var(--mut)">${esc(p.eligibilityText)}</small>` : ''}
      ${applied.has(p.id) ? tag(applied.get(p.id), 'Application ' + applied.get(p.id).toLowerCase())
        : `<button class="btn sm" data-apply="${p.id}" ${p.open ? '' : 'disabled'}>${p.open ? 'Apply now' : 'Closed'}</button>`}
    </article>`).join('') || empty('No programmes are open right now.')}</div>` +
    card('My applications', table(['Programme', 'Applied', 'Status'], mine.map((a) => [
      esc(a.programmeTitle), d(a.createdAt), tag(a.status)])));

  $$('[data-apply]').forEach((button) => button.addEventListener('click', async () => {
    busy(button, true);
    try { await api.post('/programmes/apply', { programmeId: Number(button.dataset.apply) }); toast('Application submitted.'); go('programmes'); }
    catch (error) { toast(error.message); busy(button, false); }
  }));
};

PAGES.participant.academies = async (page) => {
  const [academies, mine] = await Promise.all([
    api.get('/academies'), api.get('/me/enrollments').catch(() => []),
  ]);
  page.innerHTML = head('Academies', 'Choose an academy, search the catalogue and enrol in a course') +
    hero(`${academies.length} academy groups, one journey`,
      'Every academy has career paths that start at Level One and unlock Level Two at 80%.',
      '<button class="btn y sm" data-goto="learning">Go to Learning Hub →</button>', '🏫') +
    `<section class="card"><h3>Find a course</h3>
      <form id="catalogueFilters" class="fgrid">
        <label class="lbl">Search<div class="fld"><input name="q" placeholder="Course, code or topic"></div></label>
        <label class="lbl">Academy<div class="fld"><select name="academy"><option value="">All academies</option>
          ${academies.map((academy) => `<option value="${esc(academy.slug)}">${esc(academy.name)}</option>`).join('')}</select></div></label>
        ${sel('Level', 'level', [{ value: '', label: 'Any level' }, { value: '1', label: 'Level One' }, { value: '2', label: 'Level Two' }])}
        ${sel('Language', 'language', [{ value: '', label: 'Any language' }, { value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' }, { value: 'fr', label: 'French' }])}
        ${sel('Duration', 'maxHours', [{ value: '', label: 'Any duration' }, { value: '10', label: 'Under 10 hours' }, { value: '30', label: 'Under 30 hours' }, { value: '60', label: 'Under 60 hours' }])}
        ${sel('Certificate', 'certificate', [{ value: '', label: 'Any' }, { value: 'true', label: 'Certificate available' }])}
        ${sel('Rating', 'minRating', [{ value: '', label: 'Any rating' }, { value: '3', label: '3 stars and up' }, { value: '4', label: '4 stars and up' }])}
      </form>
      <div id="catalogueResults" style="margin-top:12px"><small style="color:var(--mut)">Loading courses…</small></div></section>` +
    `<div class="cards">${academies.map((academy) => `<article class="card pc">
      <div class="im" style="${academy.colour ? `background:linear-gradient(135deg,${esc(academy.colour)},var(--navy))` : ''}">${esc(academy.icon || '🏫')}</div>
      <h3 style="margin:0">${esc(academy.name)}</h3>
      ${academy.tagline ? `<small style="color:var(--mut)">${esc(academy.tagline)}</small>` : ''}
      <div class="meta"><span>${academy.careerPathCount} career path(s)</span><span>${academy.courseCount} course(s)</span></div>
      <button class="btn sm" data-academy="${esc(academy.slug)}">Explore academy →</button>
    </article>`).join('') || empty('No academies have been published yet.')}</div>` +
    card('My courses', table(['Course', 'Enrolled', 'Status'], mine.map((enrollment) => [
      esc(enrollment.courseTitle), d(enrollment.enrolledAt), tag(enrollment.status)])));

  $$('[data-academy]').forEach((button) => button.addEventListener('click', async () => {
    busy(button, true);
    try { await academyDetail(page, button.dataset.academy); } catch (error) { toast(error.message); busy(button, false); }
  }));

  const filters = $('#catalogueFilters');
  const results = $('#catalogueResults');
  const loadCourses = async () => {
    const values = Object.fromEntries(new FormData(filters).entries());
    const params = new URLSearchParams();
    Object.entries(values).forEach(([key, value]) => { if (value) params.set(key, value); });
    try {
      const list = await api.get(`/courses${params.toString() ? '?' + params.toString() : ''}`);
      results.innerHTML = list.length ? `<div class="cards">${list.map((course) => `<article class="card pc">
        <div class="im" style="height:64px;font-size:28px">${esc(course.icon || '📘')}</div>
        <b>${esc(course.title)}</b>
        <small style="color:var(--mut)">${esc(course.academyName)} · Level ${course.level} · ${course.durationHours}h · ${esc(course.language.toUpperCase())}</small>
        <div class="meta"><span>${course.ratingCount ? `★ ${Number(course.ratingAverage).toFixed(1)} (${course.ratingCount})` : 'No ratings yet'}</span>
          <span>${course.certificateAvailable ? 'Certificate' : 'Completion statement'}</span>
          <span>${course.lessonCount} lesson(s)</span></div>
        <div class="pgh">${course.enrolled
          ? `<button class="btn sm" data-open-course="${esc(course.slug)}">Open course →</button>`
          : `<button class="btn ghost sm" data-course-info="${esc(course.slug)}">Details</button><button class="btn sm" data-enrol="${course.id}">Enrol</button>`}</div>
      </article>`).join('')}</div>` : empty('No course matches those filters yet.');
      $$('[data-open-course]').forEach((button) => button.addEventListener('click', () => {
        state.courseSlug = button.dataset.openCourse;
        go('course');
      }));
      $$('[data-course-info]').forEach((button) => button.addEventListener('click', () => {
        state.courseSlug = button.dataset.courseInfo;
        go('course');
      }));
      $$('[data-enrol]').forEach((button) => button.addEventListener('click', async () => {
        busy(button, true);
        try {
          const enrollment = await api.post(`/courses/${button.dataset.enrol}/enrol`);
          toast('You are enrolled.');
          state.courseSlug = enrollment.courseSlug;
          go('course');
        } catch (error) { toast(error.message); busy(button, false); }
      }));
    } catch (error) {
      results.innerHTML = `<small style="color:var(--bad)">${esc(error.message)}</small>`;
    }
  };
  filters.addEventListener('change', loadCourses);
  filters.addEventListener('submit', (event) => { event.preventDefault(); loadCourses(); });
  filters.querySelector('input[name="q"]').addEventListener('input', loadCourses);
  loadCourses();
};

async function academyDetail(page, slug) {
  const detail = await api.get(`/academies/${encodeURIComponent(slug)}`);
  const academy = detail.academy;
  page.innerHTML = head(academy.name, academy.tagline || 'Career paths and courses in this academy',
    '<button class="btn ghost sm" data-back>← All academies</button>') +
    (academy.description ? `<div class="card"><p style="margin:0">${esc(academy.description)}</p></div>` : '') +
    (detail.careerPaths.length ? detail.careerPaths.map((path) => `<section class="card">
      <h3>${esc(path.icon || '🧭')} ${esc(path.title)}</h3>
      ${path.summary ? `<p style="color:var(--mut);margin:-6px 0 12px">${esc(path.summary)}</p>` : ''}
      <div class="cards">${path.courses.map((course) => `<article class="card pc" style="box-shadow:none">
        <div class="im" style="height:64px;font-size:28px">${esc(course.icon || '📘')}</div>
        <b>${esc(course.title)}</b><small style="color:var(--mut)">${esc(course.code)} · Level ${course.level}</small>
        <div class="meta"><span>${course.moduleCount} module(s)</span><span>${course.lessonCount} lesson(s)</span>
          <span>${course.durationHours}h</span></div>
        ${course.enrolled ? `<button class="btn sm" data-open-course="${esc(course.slug)}">Open course →</button>`
          : `<button class="btn sm" data-enrol="${course.id}">Enrol</button>`}
      </article>`).join('') || empty('Courses are being prepared for this career path.')}</div>
    </section>`).join('') : empty('No career paths are published in this academy yet.'));

  const back = $('[data-back]');
  if (back) back.addEventListener('click', () => go('academies'));
  $$('[data-open-course]').forEach((button) => button.addEventListener('click', () => {
    state.courseSlug = button.dataset.openCourse;
    go('course');
  }));
  $$('[data-enrol]').forEach((button) => button.addEventListener('click', async () => {
    busy(button, true);
    try {
      const enrollment = await api.post(`/courses/${button.dataset.enrol}/enrol`);
      toast('You are enrolled.');
      state.courseSlug = enrollment.courseSlug;
      go('course');
    } catch (error) { toast(error.message); busy(button, false); }
  }));
}

/* Course player: outline, resume point, lesson reader and completion. */
PAGES.participant.course = async (page) => {
  const outline = await api.get(`/courses/${encodeURIComponent(state.courseSlug)}/outline`);
  const course = outline.course;
  const lessons = outline.modules.flatMap((module) => module.lessons);
  const resume = outline.resumeLessonId || lessons.find((lesson) => !lesson.completed)?.id || lessons[0]?.id;

  page.innerHTML = head(course.title, `${course.academyName} · ${course.careerPathTitle} · Level ${course.level}`,
    '<button class="btn ghost sm" data-back>← Back to academy</button>') +
    `<div class="g g2">
      <div class="card"><h3>Your progress</h3><div class="don">${donut(outline.percent)}
        <div><div class="on-t">${outline.completedLessons}/${outline.totalLessons} lessons</div>
          <p style="color:var(--mut);margin:2px 0 10px">Overall score ${outline.overallScore}% · ${course.durationHours}h course</p>
          ${resume ? `<button class="btn sm" data-lesson="${resume}">${outline.completedLessons ? 'Resume' : 'Start'} →</button>` : ''}
        </div></div></div>
      <div class="card"><h3>Course</h3>
        ${course.summary ? `<p style="color:var(--mut);margin-top:0">${esc(course.summary)}</p>` : ''}
        ${outline.enrolled ? tag('Registered', 'Enrolled') : `<button class="btn" data-enrol-course="${course.id}">Enrol in this course</button>`}
        ${outline.impactProjectId ? `<div class="act" style="margin-top:12px"><div class="ic c1">🚀</div>
          <div class="grow"><b>${esc(outline.impactProjectTitle)}</b><small>Your Level Two impact project</small></div>
          <button class="btn ghost sm" data-goto="projects">Open</button></div>` : ''}
      </div>
    </div>` +
    (outline.modules.map((module) => `<section class="card">
      <h3>${esc(module.icon || '📘')} ${esc(module.name)} <span>${module.percent}%</span></h3>
      ${module.outcome ? `<p style="color:var(--mut);font-size:13px;margin-bottom:8px">${esc(module.outcome)}</p>` : ''}
      ${bar(module.percent)}
      <div class="lsn" style="margin-top:8px">${module.lessons.map((lesson) => `<label>
        <span>${lesson.completed ? '✅' : '⬜'}</span>
        <span class="grow"><b>${esc(lesson.title)}</b><small style="display:block;color:var(--mut)">${esc(lesson.type)} · ${lesson.durationMinutes} min</small></span>
        <button class="btn ghost sm" data-lesson="${lesson.id}">${lesson.completed ? 'Review' : 'Open'}</button>
      </label>`).join('') || empty('Lessons are being prepared.')}</div>
    </section>`).join('') || empty('This course has no lessons yet.')) + attributionBlock(outline);

  $('[data-back]').addEventListener('click', () => go('academies'));
  $$('[data-goto]').forEach((button) => button.addEventListener('click', () => go(button.dataset.goto)));
  $$('[data-lesson]').forEach((button) => button.addEventListener('click', () => openLesson(button.dataset.lesson)));
  const enrol = $('[data-enrol-course]');
  if (enrol) enrol.addEventListener('click', async () => {
    busy(enrol, true);
    try { await api.post(`/courses/${enrol.dataset.enrolCourse}/enrol`); toast('You are enrolled.'); go('course'); }
    catch (error) { toast(error.message); busy(enrol, false); }
  });

  /* Attribution is part of the course page (content-licensing rule). */
  function attributionBlock(o) {
    const c = o.course;
    return `<div class="g g2">
      <section class="card"><h3>Source, licence and attribution</h3>
        <p style="margin-top:0">${esc(c.attributionText || 'Attribution is being finalised for this course.')}</p>
        <div class="meta"><span>${esc(c.sourceName || 'YEP original')}</span><span>${esc(c.licence || '—')}</span>
          ${c.author ? `<span>${esc(c.author)}</span>` : ''}
          ${c.instructorName ? `<span>Instructor: ${esc(c.instructorName)}</span>` : ''}</div>
        <div class="pgh" style="margin-top:10px">
          ${c.sourceUrl ? `<a class="btn ghost sm" href="${esc(c.sourceUrl)}" target="_blank" rel="noopener">Source</a>` : ''}
          ${c.licenceUrl ? `<a class="btn ghost sm" href="${esc(c.licenceUrl)}" target="_blank" rel="noopener">Licence</a>` : ''}
        </div></section>
      <section class="card"><h3>Ratings and reviews</h3>
        <div class="on-t">${c.ratingCount ? `★ ${Number(c.ratingAverage).toFixed(1)} from ${c.ratingCount} learner(s)` : 'No ratings yet'}</div>
        <div id="reviewList" style="margin-top:10px"><small style="color:var(--mut)">Loading reviews…</small></div>
        ${o.enrolled ? `<form id="reviewForm" style="margin-top:12px">
          ${sel('Your rating', 'rating', [{ value: '5', label: '5 — Excellent' }, { value: '4', label: '4 — Good' },
            { value: '3', label: '3 — Fair' }, { value: '2', label: '2 — Weak' }, { value: '1', label: '1 — Poor' }], '5')}
          ${txt('Comment', 'body', { placeholder: 'What worked and what could improve?' })}
          <button class="btn sm" type="submit">Save review</button></form>`
          : '<p style="color:var(--mut)">Enrol to leave a review.</p>'}
      </section></div>`;
  }

  const loadReviews = async () => {
    try {
      const list = await api.get(`/courses/${encodeURIComponent(state.courseSlug)}/reviews`);
      const box = $('#reviewList');
      if (box) {
        box.innerHTML = list.length ? list.map((review) => `<div class="act">
          <div class="ic c4">${'★'.repeat(review.rating)}</div>
          <div class="grow"><b>${esc(review.learnerName)}</b>
          <small style="display:block;color:var(--mut)">${esc(review.body || 'No comment')} · ${d(review.createdAt)}</small></div></div>`).join('')
          : '<small style="color:var(--mut)">No reviews yet. Be the first.</small>';
      }
    } catch (error) { toast(error.message); }
  };
  loadReviews();

  const reviewForm = $('#reviewForm');
  if (reviewForm) reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = vals(event.target);
    try {
      await api.post(`/courses/${encodeURIComponent(state.courseSlug)}/reviews`,
        { rating: Number(values.rating), body: values.body });
      toast('Review saved.');
      go('course');
    } catch (error) { toast(error.message); }
  });

  async function openLesson(lessonId) {
    try {
      const lesson = await api.get(`/learning/lessons/${lessonId}`);
      const extras = await api.get(`/learning/lessons/${lessonId}/extras`).catch(() => null);
      modal(`<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <div><h3 style="margin:0">${esc(lesson.title)}</h3>
          <small style="color:var(--mut)">${esc(lesson.moduleName)} · ${esc(lesson.type)} · ${lesson.durationMinutes} min</small></div>
          <button class="btn ghost sm" data-close>Close</button></div>
        <div class="lesson-body">${esc(lesson.content || 'Lesson notes will appear here.')}</div>
        <button class="btn ${lesson.completed ? 'ghost' : ''}" data-complete="${lesson.id}" data-done="${lesson.completed}">
          ${lesson.completed ? 'Mark as not completed' : 'Mark lesson complete'}</button>
        ${extras ? `<section class="card" style="margin-top:14px"><h3>Your notes</h3>
          <form id="noteForm"><textarea name="body" rows="4" style="width:100%">${esc(extras.note.body || '')}</textarea>
          <button class="btn ghost sm" type="submit" style="margin-top:8px">Save note</button></form></section>
        ${extras.practice.length ? `<section class="card"><h3>Practice</h3>
          ${extras.practice.map((q) => `<div style="margin-bottom:10px"><b>${esc(q.prompt)}</b>
            <div class="pgh">${q.options.map((option, index) => `<button class="btn ghost sm" data-practice="${q.id}"
              data-choice="${String.fromCharCode(65 + index)}">${esc(option)}</button>`).join('')}</div></div>`).join('')}
          <small id="practiceResult" style="color:var(--mut)"></small></section>` : ''}
        <section class="card"><h3>Questions & answers <span>${extras.posts.length}</span></h3>
          <div id="lessonPosts">${extras.posts.length ? extras.posts.map((post) => `<div class="act">
            <div class="ic c3">${esc(post.author.slice(0, 1))}</div>
            <div class="grow"><b>${esc(post.author)}</b><small style="display:block">${esc(post.body)}</small></div></div>`).join('')
            : '<small style="color:var(--mut)">No questions yet. Ask the first one.</small>'}</div>
          <form id="postForm" style="margin-top:10px"><textarea name="body" rows="2" style="width:100%" placeholder="Ask a question about this lesson"></textarea>
          <button class="btn ghost sm" type="submit" style="margin-top:8px">Post</button></form></section>` : ''}`);
      $('[data-close]').addEventListener('click', closeModal);
      if (extras) {
        $('#noteForm').addEventListener('submit', async (event) => {
          event.preventDefault();
          try { await api.put(`/learning/lessons/${lessonId}/note`, { body: event.target.body.value }); toast('Note saved.'); }
          catch (error) { toast(error.message); }
        });
        $('#postForm').addEventListener('submit', async (event) => {
          event.preventDefault();
          try {
            await api.post(`/learning/lessons/${lessonId}/posts`, { body: event.target.body.value });
            openLesson(lessonId);
          } catch (error) { toast(error.message); }
        });
        $$('[data-practice]').forEach((button) => button.addEventListener('click', async () => {
          try {
            const result = await api.post(`/learning/lessons/${lessonId}/practice`,
              { questionId: Number(button.dataset.practice), choice: button.dataset.choice });
            $('#practiceResult').textContent = (result.correct ? 'Correct. ' : 'Not quite. ')
              + `Mastery ${result.masteryPercent}%. Correct answer: ${result.correctOption}.`;
          } catch (error) { toast(error.message); }
        }));
      }
      $('[data-complete]').addEventListener('click', async (event) => {
        const id = event.currentTarget.dataset.complete;
        const done = event.currentTarget.dataset.done === 'true';
        try {
          if (done) await api.del(`/courses/${course.id}/lessons/${id}/complete`);
          else await api.post(`/courses/${course.id}/lessons/${id}/complete`);
          closeModal(); toast(done ? 'Lesson reopened.' : 'Lesson completed.'); go('course');
        } catch (error) { toast(error.message); }
      });
    } catch (error) { toast(error.message); }
  }
};

PAGES.participant.learning = async (page) => {
  const [modules, materials, threads, progress] = await Promise.all([
    api.get('/learning/modules'), api.get('/learning/materials').catch(() => []),
    api.get('/learning/discussions').catch(() => []), api.get('/learning/progress'),
  ]);
  page.innerHTML = head('Learning Hub', 'Level One: five modules, three lessons each') +
    `<div class="card l2card ${progress.levelTwoUnlocked ? '' : 'locked'}">
      <div class="l2-head"><span class="l2-lock ${progress.levelTwoUnlocked ? '' : 'lock-blink'}">${progress.levelTwoUnlocked ? '🔓' : '🔒'}</span>
        <div class="grow"><h3 style="margin:0">${esc(t('Level Two'))} · ${esc(t(progress.levelTwoUnlocked ? 'Unlocked' : 'Locked'))}</h3>
          <p style="color:var(--mut);margin-top:4px">${progress.levelTwoUnlocked
            ? 'Unlocked automatically at 80% of Level One. Your project, milestones and deliverables are in My Projects.'
            : `Learning is ${pct(progress.levelOnePercent)}% complete and your overall score is ${progress.overallScore}%. At an overall 80% this level opens automatically.`}</p></div>
        <button class="btn ${progress.levelTwoUnlocked ? 'r' : 'ghost'} sm" data-goto="${progress.levelTwoUnlocked ? 'projects' : 'assessments'}">
          ${progress.levelTwoUnlocked ? 'Go to My Projects' : 'Keep learning'} →</button></div>
      ${bar(progress.levelOnePercent)}
    </div>` +
    `<div class="g g2"><div style="display:grid;gap:14px">${modules.map((m) => `<section class="card">
      <h3>${esc(m.icon || '📘')} ${esc(m.name)} <span>${pct(m.percent)}%</span></h3>
      ${m.outcome ? `<p style="color:var(--mut);font-size:13px;margin-bottom:8px">${esc(m.outcome)}</p>` : ''}
      ${bar(m.percent)}<div class="lsn" style="margin-top:8px">${m.lessons.map((l) => `<label>
        <span>${l.completed ? '✅' : '⬜'}</span><span class="grow"><b>${esc(l.title)}</b>
        <small style="display:block;color:var(--mut)">${esc(l.type)} · ${l.durationMinutes} min</small></span>
        <button class="btn ghost sm" data-lesson="${l.id}">${l.completed ? 'Review' : 'Open'}</button></label>`).join('')}</div>
    </section>`).join('')}</div>
    <div style="display:grid;gap:14px">
      ${card('Learning materials', materials.length ? materials.map((m) => `<div class="act">
        <div class="ic c2">${m.type === 'PDF' ? '📄' : m.type === 'VIDEO' ? '🎬' : '🔗'}</div>
        <div class="grow"><b>${esc(m.title)}</b><small>${esc(m.type)}</small></div>
        <a class="btn ghost sm" href="${esc(m.url)}" target="_blank" rel="noopener">Open</a></div>`).join('') : empty('No materials yet.'))}
      <section class="card"><h3>Discussions <button class="btn sm" data-new-thread>+ New</button></h3>
        ${threads.length ? threads.map((t) => `<div class="act"><div class="ic c3">💬</div>
          <div class="grow"><b>${esc(t.title)}</b><small>${esc(t.author)} · ${t.posts.length} replies</small></div>
          <button class="btn ghost sm" data-thread="${t.id}">Open</button></div>`).join('') : empty('No discussions yet — start one.')}
      </section>
    </div></div>`;

  $$('[data-lesson]').forEach((button) => button.addEventListener('click', async () => {
    try {
      const lesson = await api.get(`/learning/lessons/${button.dataset.lesson}`);
      modal(`<div style="display:flex;justify-content:space-between;gap:10px;align-items:flex-start">
          <div><h3 style="margin:0">${esc(lesson.title)}</h3>
          <small style="color:var(--mut)">${esc(lesson.moduleName)} · ${esc(lesson.type)} · ${lesson.durationMinutes} min</small></div>
          <button class="btn ghost sm" data-close>Close</button></div>
        <div class="lesson-body">${esc(lesson.content || 'Lesson notes will appear here.')}</div>
        <button class="btn ${lesson.completed ? 'ghost' : ''}" data-complete="${lesson.id}" data-done="${lesson.completed}">
          ${lesson.completed ? 'Mark as not completed' : 'Mark lesson complete'}</button>`);
      $('[data-close]').addEventListener('click', closeModal);
      $('[data-complete]').addEventListener('click', async (event) => {
        const id = event.currentTarget.dataset.complete;
        const done = event.currentTarget.dataset.done === 'true';
        try {
          if (done) await api.del(`/learning/lessons/${id}/complete`);
          else await api.post(`/learning/lessons/${id}/complete`);
          closeModal(); toast(done ? 'Lesson reopened.' : 'Lesson completed.'); go('learning');
        } catch (error) { toast(error.message); }
      });
    } catch (error) { toast(error.message); }
  }));

  $$('[data-thread]').forEach((button) => button.addEventListener('click', () => {
    const thread = threads.find((t) => String(t.id) === button.dataset.thread);
    modal(`<h3>${esc(thread.title)}</h3><div class="chat">${thread.posts.map((post) => `<div class="msg ${post.author === session.user.fullName ? 'me' : ''}">
      <b style="display:block;font-size:12px">${esc(post.author)}</b>${esc(post.body)}</div>`).join('')}</div>
      <form id="replyForm"><label class="fld"><input name="body" placeholder="Write a reply…" required aria-label="Reply"></label>
      <button class="btn sm" type="submit">Reply</button></form>`);
    $('#replyForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      try { await api.post(`/learning/discussions/${thread.id}/posts`, vals(event.target)); closeModal(); toast('Reply posted.'); go('learning'); }
      catch (error) { toast(error.message); }
    });
  }));

  $('[data-new-thread]').addEventListener('click', () => {
    modal(`<h3>Start a discussion</h3><form id="threadForm">${fld('Title', 'title', { required: true })}
      ${txt('Your message', 'body', { required: true })}<div class="pgh"><button class="btn" type="submit">Post</button>
      <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#threadForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      try { await api.post('/learning/discussions', vals(event.target)); closeModal(); toast('Discussion started.'); go('learning'); }
      catch (error) { toast(error.message); }
    });
  });
  watchLevelTwo(progress.levelTwoUnlocked);
};

PAGES.participant.projects = async (page) => {
  const team = await api.get('/projects/my-team').catch(() => null);
  if (!team) {
    page.innerHTML = head('My Projects', 'Level Two impact projects') +
      card('No team yet', empty('Level Two unlocks at 80% of Level One. Your facilitator will place you on a team.'));
    return;
  }
  const deliverables = team.project ? await api.get(`/projects/${team.project.id}/deliverables`).catch(() => []) : [];
  page.innerHTML = head(team.name, `${team.project ? team.project.title : 'No project assigned'} · ${team.cohort || 'Cohort'}`) +
    `<div class="g g2">${card('Milestones', team.milestones.map((m) => `<label class="lsn">
        <span>${m.completed ? '✅' : '⬜'}</span><span class="grow"><b>${esc(m.title)}</b>
        <small style="display:block;color:var(--mut)">${m.completed ? 'Completed ' + d(m.completedAt) : 'Outstanding'}</small></span>
        <button class="btn ghost sm" data-milestone="${m.id}" data-done="${m.completed}">${m.completed ? 'Reopen' : 'Complete'}</button></label>`).join('')
        || empty('No milestones yet.'))}
      ${card('Team', team.members.map((m) => `<div class="act"><span class="ava">${esc(ini(m.fullName))}</span>
        <div class="grow"><b>${esc(m.fullName)}</b><small>${esc(m.email)}</small></div>${m.lead ? tag('Lead') : ''}</div>`).join(''))}
    </div>` +
    card('Deliverables', `${deliverables.length ? table(['File', 'Uploaded by', 'Date', 'Status'], deliverables.map((f) => [
      esc(f.fileName), esc(f.uploadedBy), d(f.createdAt), tag(f.status)]), false) : empty('Nothing uploaded yet.')}
      ${team.project ? `<form id="uploadForm" class="pgh" style="margin-top:12px">
        <label class="fld" style="flex:1"><input type="file" name="file" required aria-label="Deliverable file"></label>
        <button class="btn sm" type="submit">Upload</button></form>` : ''}`);

  $$('[data-milestone]').forEach((button) => button.addEventListener('click', async () => {
    try {
      await api.put(`/projects/milestones/${button.dataset.milestone}`, { completed: button.dataset.done !== 'true' });
      toast('Milestone updated.'); go('projects');
    } catch (error) { toast(error.message); }
  }));
  const uploadForm = $('#uploadForm');
  if (uploadForm) uploadForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const file = event.target.querySelector('input[type=file]').files[0];
    if (!file) return;
    try { await uploadFile(`/projects/${team.project.id}/deliverables`, file); go('projects'); toast('Deliverable uploaded.'); }
    catch (error) { toast(error.message); }
  });
};

PAGES.participant.sessions = async (page) => {
  const sessions = await api.get('/sessions');
  page.innerHTML = head('Sessions & Events', 'Workshops, webinars and mentoring events') +
    card('Schedule', table(['Session', 'Type', 'When', 'Cohort', 'Registered', 'Actions'], sessions.map((s) => [
      `<strong>${esc(s.title)}</strong>`, esc(s.type), dt(s.startsAt), esc(s.cohort || '—'),
      `${s.registeredCount}${s.registered ? ' (you)' : ''}`,
      `<span class="pgh">${s.registered ? '' : `<button class="btn ghost sm" data-register="${s.id}">Register</button>`}
        <button class="btn r sm" data-room="${s.id}">Join</button></span>`,
    ])));
  $$('[data-register]').forEach((b) => b.addEventListener('click', async () => {
    busy(b, true);
    try { await api.post(`/sessions/${b.dataset.register}/register`); toast('Registered.'); go('sessions'); }
    catch (error) { toast(error.message); busy(b, false); }
  }));
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
};

PAGES.participant.assessments = async (page) => {
  const list = await api.get('/assessments');
  page.innerHTML = head('Assessments', 'Quizzes and reflections — results appear once published') +
    card('My assessments', table(['Assessment', 'Module', 'Due', 'Marks', 'Result', 'Actions'], list.map((a) => [
      `<strong>${esc(a.title)}</strong>`, esc(a.moduleName), d(a.dueDate), String(a.totalMarks),
      a.submitted ? (a.resultsPublished ? `${a.myScore}/${a.totalMarks} (${a.myPercentage}%)` : 'Awaiting publication') : 'Not started',
      a.submitted ? tag('Completed') : `<button class="btn sm" data-start="${a.id}">Start</button>`,
    ])));

  $$('[data-start]').forEach((b) => b.addEventListener('click', async () => {
    try {
      const quiz = await api.get(`/assessments/${b.dataset.start}/questions`);
      const questions = quiz.questions || quiz;
      modal(`<h3>${esc(b.closest('tr')?.querySelector('strong')?.textContent || 'Assessment')}</h3><form id="quizForm">
        ${questions.map((q, index) => `<fieldset style="border:1px solid var(--bd);border-radius:12px;padding:10px;margin-bottom:10px">
          <legend>Question ${index + 1}</legend><p style="margin-bottom:8px"><b>${esc(q.prompt)}</b></p>
          ${(q.options || []).map((option) => `<label style="display:flex;gap:8px;padding:4px 0"><input type="radio"
            name="q${q.id}" value="${esc(option)}" required> ${esc(option)}</label>`).join('')}</fieldset>`).join('')}
        <div class="pgh"><button class="btn" type="submit">Submit answers</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
      $('[data-close]').addEventListener('click', closeModal);
      $('#quizForm').addEventListener('submit', async (event) => {
        event.preventDefault();
        const answers = {};
        questions.forEach((q) => {
          const chosen = event.target.querySelector(`input[name="q${q.id}"]:checked`);
          if (!chosen) return;
          const index = (q.options || []).indexOf(chosen.value);
          answers[q.id] = index >= 0 ? 'ABCD'[index] : chosen.value;
        });
        try {
          await api.post(`/assessments/${b.dataset.start}/submit`, { answers });
          closeModal(); go('assessments'); toast('Your answers were submitted. Results appear once published.');
        } catch (error) { toast(error.message); }
      });
    } catch (error) { toast(error.message); }
  }));
};

PAGES.participant.certificates = async (page) => {
  const [certificate, progress] = await Promise.all([api.get('/certificates/me').catch(() => null), api.get('/learning/progress')]);
  const checks = [
    ['Level One lessons', `${progress.completedLessons}/${progress.totalLessons}`, progress.levelOnePercent],
    ['Level Two milestones', `${progress.milestonesCompleted}/${progress.milestonesTotal}`, progress.levelTwoPercent],
    ['Assessment average', `${progress.assessmentAverage}%`, progress.assessmentAverage],
    ['Attendance', `${progress.attendancePercent}%`, progress.attendancePercent],
  ];
  page.innerHTML = head('Certificates', 'Issued automatically at 100% of both levels') +
    `<div class="g g2">${card('Requirement checklist', checks.map(([label, value, percent]) =>
      `<div style="padding:8px 0"><div class="row"><b>${label}</b><span>${esc(value)}</span></div>${bar(percent)}</div>`).join('') +
      `<p style="color:var(--mut);margin-top:10px">Certificate requires both levels at 100%, assessments ≥ ${progress.policy.level2MinAssessment}% and attendance ≥ ${progress.policy.level2MinAttendance}%.</p>`)}
      ${certificate ? `<div class="card"><div class="cert"><small>YOUTH EMPOWERMENT PROGRAMME</small><h2>Certificate of Completion</h2>
        <p>This certifies that</p><b style="font-size:20px">${esc(certificate.holderName)}</b>
        <p>has completed ${esc(certificate.programmeLabel)}</p><small>${esc(certificate.code)} · ${d(certificate.issuedAt)}</small></div>
        <div class="pgh" style="margin-top:12px"><button class="btn" data-pdf="${certificate.holderId}">Download PDF</button>
        <a class="btn ghost" href="#/" >Public verification</a></div></div>`
        : `<div class="card"><h3>No certificate yet</h3>${empty('Complete both levels to earn your certificate.')}</div>`}</div>`;
  const pdf = $('[data-pdf]');
  if (pdf) pdf.addEventListener('click', async () => {
    try { await download(`/certificates/${pdf.dataset.pdf}/pdf`, 'yep-certificate.pdf'); } catch (error) { toast(error.message); }
  });
};

PAGES.participant.notifications = async (page) => {
  const feed = await api.get('/messages/notifications');
  page.innerHTML = head('Notifications', `${feed.unread} unread`, feed.unread ? '<button class="btn ghost sm" data-read-all>Mark all read</button>' : '') +
    card('Inbox', feed.items.length ? feed.items.map((n) => `<div class="act ${n.read ? '' : 'unread'}">
      <div class="ic c1">🔔</div><div class="grow"><b>${esc(n.category)}</b><small>${esc(n.message)}<br>${dt(n.createdAt)}</small></div>
      ${n.read ? '' : `<button class="btn ghost sm" data-read="${n.id}">Mark read</button>`}</div>`).join('') : empty('You have no notifications.'));
  const readAll = $('[data-read-all]');
  if (readAll) readAll.addEventListener('click', async () => {
    try { await api.post('/messages/notifications/read'); toast('All marked read.'); go('notifications'); } catch (error) { toast(error.message); }
  });
  $$('[data-read]').forEach((b) => b.addEventListener('click', async () => {
    try { await api.post(`/messages/notifications/${b.dataset.read}/read`); go('notifications'); } catch (error) { toast(error.message); }
  }));
};

/* ======================================================== mentor pages */
PAGES.mentor.dashboard = async (page) => {
  const [mentorships, teams, sessions] = await Promise.all([
    api.get('/mentorships'), api.get('/projects/teams').catch(() => []), api.get('/sessions'),
  ]);
  const accepted = mentorships.filter((m) => m.status === 'ACCEPTED');
  const next = sessions.filter((s) => new Date(s.startsAt) > new Date())[0];
  page.innerHTML = hero('Welcome, Mentor', 'Guide. Inspire. Empower.', '', '🧭') +
    stats([['👥', 'c1', accepted.length, 'My Mentees'], ['📅', 'c2', sessions.length, 'Sessions'],
      ['🚀', 'c3', teams.length, 'Project Teams']], 'n3') +
    `<div class="g g3">${card('Mentees overview', accepted.length ? `<div class="mentees">${accepted.map((m) =>
      `<span class="ava" title="${esc(m.mentee)}">${esc(ini(m.mentee))}</span>`).join('')}</div>` : empty('No mentees yet.'),
      '<button class="lnk" data-goto="mentees">View all →</button>')}
      ${card('Next session', next ? `${act('📅', 'cal', next.title, `${dt(next.startsAt)} · ${next.type}`)}
        <button class="btn ghost sm" data-room="${next.id}" style="margin-top:6px">Open room →</button>` : empty('Nothing scheduled.'))}</div>`;
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
};

PAGES.mentor.mentees = async (page) => {
  const mentorships = (await api.get('/mentorships')).filter((m) => m.status === 'ACCEPTED');
  page.innerHTML = head('My Mentees', 'Track progress and schedule meetings') +
    card('Mentees', table(['Mentee', 'Goal', 'Progress', 'Next meeting', 'Actions'], mentorships.map((m) => [
      `<strong>${esc(m.mentee)}</strong>`, esc(m.goal), `<div class="pgh">${bar(m.progressPercent)}<b>${m.progressPercent}%</b></div>`,
      m.meetings.length ? dt(m.meetings[m.meetings.length - 1].startsAt) : '—',
      `<span class="pgh"><button class="btn ghost sm" data-progress="${m.id}" data-value="${m.progressPercent}">Progress</button>
       <button class="btn sm" data-meeting="${m.id}">Schedule</button></span>`,
    ])));

  $$('[data-progress]').forEach((b) => b.addEventListener('click', () => {
    modal(`<h3>Update progress</h3><form id="progressForm">${fld('Progress %', 'progressPercent', { type: 'number', min: 0, max: 100, value: b.dataset.value })}
      <div class="pgh"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#progressForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      try { await api.put(`/mentorships/${b.dataset.progress}/progress`, { progressPercent: Number(vals(event.target).progressPercent) });
        closeModal(); toast('Progress updated.'); go('mentees'); } catch (error) { toast(error.message); }
    });
  }));
  $$('[data-meeting]').forEach((b) => b.addEventListener('click', () => {
    modal(`<h3>Schedule a meeting</h3><form id="meetingForm">${fld('Title', 'title', { required: true })}
      ${fld('When', 'startsAt', { type: 'datetime-local', required: true })}
      <div class="pgh"><button class="btn" type="submit">Schedule</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#meetingForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      try { await api.post(`/mentorships/${b.dataset.meeting}/sessions`, { title: v.title, startsAt: new Date(v.startsAt).toISOString() });
        closeModal(); toast('Meeting scheduled.'); go('mentees'); } catch (error) { toast(error.message); }
    });
  }));
};

PAGES.mentor.requests = async (page) => {
  const requests = (await api.get('/mentorships')).filter((m) => m.status === 'REQUESTED');
  page.innerHTML = head('Mentorship Requests', 'Accept or decline requests from participants') +
    card('Open requests', requests.length ? requests.map((m) => `<div class="act"><span class="ava">${esc(ini(m.mentee))}</span>
      <div class="grow"><b>${esc(m.mentee)}</b><small>${esc(m.goal)} · ${dt(m.createdAt)}</small></div>
      <button class="btn ok sm" data-accept="${m.id}">Accept</button>
      <button class="btn bad sm" data-decline="${m.id}">Decline</button></div>`).join('') : empty('No pending requests.'));
  $$('[data-accept], [data-decline]').forEach((b) => b.addEventListener('click', async () => {
    const accept = !!b.dataset.accept;
    busy(b, true);
    try { await api.put(`/mentorships/${b.dataset.accept || b.dataset.decline}`, { accept });
      toast(accept ? 'Request accepted.' : 'Request declined.'); go('requests'); } catch (error) { toast(error.message); busy(b, false); }
  }));
};

PAGES.mentor.sessions = PAGES.facilitator.sessions = async (page) => {
  const sessions = await api.get('/sessions');
  page.innerHTML = head('Sessions', 'Live virtual and in-person events') +
    card('Schedule', table(['Session', 'Type', 'When', 'Cohort', 'Registered', 'Actions'], sessions.map((s) => [
      `<strong>${esc(s.title)}</strong>`, esc(s.type), dt(s.startsAt), esc(s.cohort || '—'), String(s.registeredCount),
      `<button class="btn r sm" data-room="${s.id}">Open room</button>`])));
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
};

PAGES.mentor.resources = async (page) => {
  const resources = await api.get('/mentor/resources');
  page.innerHTML = head('Resources', 'Share guides, slides and videos with your mentees',
    '<button class="btn sm" data-new>+ Add resource</button>') +
    card('Library', resources.length ? table(['Title', 'Type', 'Owner', 'Link'], resources.map((r) => [
      `<strong>${esc(r.title)}</strong>`, esc(r.type), esc(r.owner || '—'),
      `<a class="lnk" href="${esc(r.url)}" target="_blank" rel="noopener">Open</a>`])) : empty('No resources yet.'));
  $('[data-new]').addEventListener('click', () => {
    modal(`<h3>Add a resource</h3><form id="resourceForm">${fld('Title', 'title', { required: true })}
      ${sel('Type', 'type', ['PDF', 'VIDEO', 'SLIDES', 'LINK', 'ARTICLE'])}
      ${fld('URL', 'url', { type: 'url', required: true, placeholder: 'https://…' })}
      <div class="pgh"><button class="btn" type="submit">Save</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#resourceForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      try { await api.post('/mentor/resources', vals(event.target)); closeModal(); toast('Resource added.'); go('resources'); }
      catch (error) { toast(error.message); }
    });
  });
};

async function reportBrowser(page, keys) {
  const catalogue = (await api.get('/reports')).filter((r) => !keys || keys.includes(r.key));
  page.innerHTML = head('Reports', 'Live data, exportable as CSV or PDF') +
    card('Choose a report', `<div class="chips">${catalogue.map((r) => `<button class="chip" data-report="${esc(r.key)}">${esc(r.title)}</button>`).join('')}</div>`) +
    `<div id="reportOut">${empty('Pick a report above.')}</div>`;
  $$('[data-report]').forEach((button) => button.addEventListener('click', async () => {
    const key = button.dataset.report;
    const out = $('#reportOut');
    out.innerHTML = `<div class="card">${empty('Running…')}</div>`;
    try {
      const report = await api.get(`/reports/${key}`);
      out.innerHTML = card(`${report.title} · ${report.rows.length} rows`,
        `<div class="pgh" style="margin-bottom:10px"><button class="btn ghost sm" data-export="csv">CSV</button>
         <button class="btn ghost sm" data-export="pdf">PDF</button></div>` +
        table(report.columns, report.rows.map((row) => row.map((cell) => esc(cell))), false));
      $$('[data-export]', out).forEach((b) => b.addEventListener('click', async () => {
        try { await download(`/reports/${key}/export?format=${b.dataset.export}`, `${key}.${b.dataset.export}`); }
        catch (error) { toast(error.message); }
      }));
    } catch (error) { out.innerHTML = card('Report failed', `<div class="err">${esc(error.message)}</div>`); }
  }));
}

PAGES.mentor.reports = (page) => reportBrowser(page, ['progress', 'attendance', 'assessments']);

/* ==================================================== facilitator pages */
PAGES.facilitator.dashboard = async (page) => {
  const [participants, sessions, programmes, assessments] = await Promise.all([
    api.get('/facilitator/participants'), api.get('/facilitator/sessions'),
    api.get('/programmes').catch(() => []), api.get('/assessments').catch(() => []),
  ]);
  const upcoming = sessions.filter((s) => new Date(s.startsAt) > new Date());
  page.innerHTML = hero('Welcome, Facilitator', 'Deliver. Engage. Evaluate.', '', '🧑‍🏫') +
    stats([['👥', 'c1', participants.length, 'Participants'], ['📚', 'c2', programmes.length, 'Programmes'],
      ['📅', 'c3', upcoming.length, 'Upcoming sessions']], 'n3') +
    card('Upcoming activities', upcoming.length ? upcoming.slice(0, 4).map((s) => `<div class="act">
      <div class="ic cal">📅</div><div class="grow"><b>${esc(s.title)}</b><small>${dt(s.startsAt)} · ${esc(s.cohort || 'All cohorts')}</small></div>
      <button class="btn r sm" data-room="${s.id}">Manage</button></div>`).join('') : empty('No sessions scheduled.'),
      '<button class="lnk" data-goto="sessions">View all →</button>') +
    `<div class="g g2">${card('Assessment activity', table(['Assessment', 'Module', 'Due', 'Results'], assessments.map((a) => [
      esc(a.title), esc(a.moduleName), d(a.dueDate), a.resultsPublished ? tag('Published') : tag('Pending')]), false))}
      ${card('Quick links', `<div class="ql">${[['sessions', '📅', 'Session roster'], ['assessments', '📝', 'Assessments'], ['reports', '📈', 'Reports']]
        .map(([slug, icon, label]) => `<a href="#/app" data-goto="${slug}"><span class="ic c1">${icon}</span>${label}</a>`).join('')}</div>`)}</div>`;
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
};

PAGES.facilitator.programmes = async (page) => {
  const programmes = await api.get('/programmes');
  page.innerHTML = head('Programmes', 'The published catalogue you deliver') +
    `<div class="cards">${programmes.map((p) => `<article class="card pc"><div class="im">${esc(p.icon || '🎓')}</div>
      <h3 style="margin:0">${esc(p.title)}</h3>
      <div class="meta"><span class="tag Review">${esc(p.category)}</span><span>${p.capacity - p.placesLeft}/${p.capacity} enrolled</span>
      <span>Closes ${d(p.registrationDeadline)}</span></div></article>`).join('') || empty('No published programmes.')}</div>`;
};

PAGES.facilitator.sessions = async (page) => {
  const [sessions, programmes] = await Promise.all([api.get('/facilitator/sessions'), api.get('/programmes').catch(() => [])]);
  page.innerHTML = head('Sessions', 'Schedule sessions and take attendance',
    '<button class="btn sm" data-new>+ New session</button>') +
    card('Schedule', table(['Session', 'Type', 'When', 'Cohort', 'Registered', 'Actions'], sessions.map((s) => [
      `<strong>${esc(s.title)}</strong>`, esc(s.type), dt(s.startsAt), esc(s.cohort || '—'), String(s.registeredCount),
      `<span class="pgh"><button class="btn ghost sm" data-roster="${s.id}">Attendance</button>
       <button class="btn r sm" data-room="${s.id}">Room</button></span>`])));

  $('[data-new]').addEventListener('click', () => {
    modal(`<h3>New session</h3><form id="newSession">${fld('Title', 'title', { required: true })}
      ${sel('Type', 'type', ['WORKSHOP', 'WEBINAR', 'MENTORING', 'DISCUSSION'])}
      ${fld('Starts at', 'startsAt', { type: 'datetime-local', required: true })}
      ${fld('Cohort', 'cohort', { placeholder: 'Cohort A' })}
      ${sel('Programme', 'programmeId', [{ value: '', label: 'None' }, ...programmes.map((p) => ({ value: p.id, label: p.title }))])}
      ${fld('Meeting link (optional)', 'meetingLink', { placeholder: 'https://meet.jit.si/…' })}
      <div class="pgh"><button class="btn" type="submit">Create</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newSession').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      try {
        await api.post('/facilitator/sessions', { title: v.title, type: v.type, startsAt: new Date(v.startsAt).toISOString(),
          cohort: v.cohort || null, programmeId: v.programmeId ? Number(v.programmeId) : null, meetingLink: v.meetingLink || null });
        closeModal(); toast('Session created.'); go('sessions');
      } catch (error) { toast(error.message); }
    });
  });

  $$('[data-roster]').forEach((b) => b.addEventListener('click', async () => {
    try {
      const roster = await api.get(`/facilitator/sessions/${b.dataset.roster}/roster`);
      modal(`<h3>Attendance</h3>${roster.length ? `<div class="tw"><table><thead><tr><th>Participant</th><th>Present</th></tr></thead><tbody>
        ${roster.map((r) => `<tr><td>${esc(r.name)}</td><td><button class="sw2 ${r.present ? 'on' : ''}" data-mark="${b.dataset.roster}|${r.userId}" aria-label="Attendance for ${esc(r.name)}"></button></td></tr>`).join('')}
        </tbody></table></div>` : empty('Nobody registered for this session yet.')}
        <button class="btn ghost" data-close>Close</button>`);
      $('[data-close]').addEventListener('click', closeModal);
      $$('[data-mark]').forEach((toggle) => toggle.addEventListener('click', async () => {
        const [sessionId, userId] = toggle.dataset.mark.split('|');
        const present = !toggle.classList.contains('on');
        toggle.classList.toggle('on', present);
        try { await api.put(`/facilitator/sessions/${sessionId}/attendance`, { userId: Number(userId), present }); toast('Attendance saved.'); }
        catch (error) { toggle.classList.toggle('on', !present); toast(error.message); }
      }));
    } catch (error) { toast(error.message); }
  }));
  $$('[data-room]').forEach((b) => b.addEventListener('click', () => openRoom(b.dataset.room)));
};

PAGES.facilitator.participants = async (page) => {
  const participants = await api.get('/facilitator/participants');
  page.innerHTML = head('Participants', 'Everyone enrolled across your cohorts') +
    card('Register', table(['Name', 'Email', 'District', 'Cohort', 'Status'], participants.map((p) => [
      `<strong>${esc(p.fullName)}</strong>`, esc(p.email), esc(p.district || '—'), esc(p.institution || '—'), tag(p.status)])));
};

PAGES.facilitator.assessments = PAGES.admin.assessments;
PAGES.facilitator.reports = (page) => reportBrowser(page, ['enrolment', 'progress', 'attendance', 'assessments']);

/* ======================================================== sponsor pages */
PAGES.sponsor.dashboard = async (page) => {
  const [impact, pledges] = await Promise.all([api.get('/sponsor/impact'), api.get('/sponsor/pledges')]);
  page.innerHTML = hero('Welcome, Sponsor', 'Together for greater impact.', '', '🤝') +
    stats([['💰', 'c4', money(impact.myTotalUgx), 'Committed'], ['👥', 'c1', impact.participants, 'Beneficiaries'],
      ['🚀', 'c3', impact.projects, 'Supported projects']], 'n3') +
    `<div class="g g2">${card('Impact overview', bars([['Participants', impact.participants], ['Certificates', impact.certificates],
      ['Projects', impact.projects], ['Pledges', impact.myPledges]]), '<button class="lnk" data-goto="impact">View reports →</button>')}
      ${card('Recent commitments', pledges.length ? pledges.slice(0, 3).map((p) => act('💰', 'c4', p.projectTitle, `${money(p.amountUgx)} · ${dt(p.pledgedAt)}`)).join('') : empty('No pledges yet.'),
      '<button class="lnk" data-goto="contributions">Manage →</button>')}</div>`;
};

PAGES.sponsor.contributions = async (page) => {
  const pledges = await api.get('/sponsor/pledges');
  page.innerHTML = head('My Contributions', 'Every pledge and its disbursement status',
    '<button class="btn sm" data-new>+ New pledge</button>') +
    card('Pledges', table(['Project', 'Amount', 'Status', 'Pledged'], pledges.map((p) => [
      esc(p.projectTitle), money(p.amountUgx), tag(p.status), d(p.pledgedAt)])));
  $('[data-new]').addEventListener('click', () => {
    modal(`<h3>Record a pledge</h3><form id="pledgeForm">${fld('Project or fund', 'projectTitle', { required: true, placeholder: 'General fund' })}
      ${fld('Amount (UGX)', 'amountUgx', { type: 'number', min: 1000, required: true })}
      <div class="pgh"><button class="btn" type="submit">Pledge</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#pledgeForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      try { await api.post('/sponsor/pledges', { projectTitle: v.projectTitle, amountUgx: Number(v.amountUgx) });
        closeModal(); toast('Pledge recorded.'); go('contributions'); } catch (error) { toast(error.message); }
    });
  });
};

PAGES.sponsor.impact = async (page) => {
  const [impact, pledges] = await Promise.all([api.get('/sponsor/impact'), api.get('/sponsor/pledges')]);
  const byProject = {};
  pledges.forEach((p) => { byProject[p.projectTitle] = (byProject[p.projectTitle] || 0) + p.amountUgx; });
  page.innerHTML = head('Impact Reports', 'Where your investment goes') +
    stats([['👥', 'c1', impact.participants, 'Beneficiaries'], ['🏅', 'c2', impact.certificates, 'Certificates'],
      ['🚀', 'c3', impact.projects, 'Projects'], ['💰', 'c4', money(impact.myTotalUgx), 'Your contribution']]) +
    `<div class="g g2">${card('Reach by measure', bars([['Beneficiaries', impact.participants], ['Certificates', impact.certificates],
      ['Projects', impact.projects]]))}
      ${card('Your commitments', Object.keys(byProject).length ? Object.entries(byProject).map(([title, amount]) =>
        `<div style="padding:8px 0"><div class="row"><b>${esc(title)}</b><span>${money(amount)}</span></div>${bar(Math.min(100, amount / Math.max(1, impact.myTotalUgx) * 100))}</div>`).join('')
        : empty('Record a pledge to see it here.'))}</div>`;
};

PAGES.sponsor.partnerships = async (page) => {
  const partners = await api.get('/sponsor/partners');
  page.innerHTML = head('Partnerships', 'Universities, NGOs, employers and technology partners') +
    `<div class="cards">${partners.map((p) => `<article class="card pc"><div class="im">${esc(p.icon || '🏢')}</div>
      <h3 style="margin:0">${esc(p.name)}</h3><div class="meta"><span class="tag Review">${esc(p.type)}</span></div></article>`).join('')
      || empty('No partners recorded.')}</div>`;
};

async function messagesPage(page) {
  const [threads, directory] = await Promise.all([api.get('/messages'), api.get('/messages/directory').catch(() => [])]);
  const active = state.thread && threads.find((t) => t.id === state.thread);
  page.innerHTML = head('Messages', 'Direct conversations and announcements',
    '<button class="btn sm" data-new>+ New message</button>') +
    `<div class="mg"><div class="ml">${threads.length ? threads.map((t) => `<button class="thi ${active?.id === t.id ? 'on' : ''}" data-thread="${t.id}">
      <b>${esc(t.title)}</b><small>${esc((t.memberNames || t.members || []).join(', '))}</small><span class="tag">${esc(t.kind)}</span></button>`).join('') : empty('No conversations yet.')}</div>
      <div class="mr">${active ? `        <div class="mh"><b>${esc(active.title)}</b><br><small style="color:var(--mut)">${esc((active.memberNames || active.members || []).join(', '))}</small></div>
        <div class="mm">${active.messages.map((m) => `<div class="msg ${m.senderId === session.user.id ? 'me' : ''}">
          <b style="display:block;font-size:12px">${esc(m.senderName)}</b>${esc(m.body)}</div>`).join('') || empty('No messages yet.')}</div>
        ${active.canReply ? `<form class="mc" id="replyForm"><label class="fld" style="flex:1"><input name="body" required placeholder="Write a message…" aria-label="Message"></label>
          <button class="btn" type="submit">Send</button></form>` : '<div class="mc"><small style="color:var(--mut)">This thread is read-only.</small></div>'}`
        : `<div class="mm">${empty('Select a conversation to read it.')}</div>`}</div></div>`;

  $$('[data-thread]').forEach((b) => b.addEventListener('click', () => { state.thread = Number(b.dataset.thread); go('messages'); }));
  const replyForm = $('#replyForm');
  if (replyForm) replyForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await api.post(`/messages/${active.id}/posts`, vals(event.target)); toast('Message sent.'); go('messages'); }
    catch (error) { toast(error.message); }
  });
  $('[data-new]').addEventListener('click', () => {
    modal(`<h3>New message</h3><form id="newMessage">${fld('Subject', 'title', { required: true })}
      ${sel('To', 'targetUserId', directory.map((u) => ({ value: u.id, label: `${u.fullName} (${u.role})` })))}
      ${txt('Message', 'body', { required: true })}
      <div class="pgh"><button class="btn" type="submit">Send</button><button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newMessage').addEventListener('submit', async (event) => {
      event.preventDefault();
      const v = vals(event.target);
      try {
        const thread = await api.post('/messages', { kind: 'DIRECT', title: v.title, body: v.body, targetUserId: Number(v.targetUserId) });
        closeModal(); state.thread = thread.id; toast('Message sent.'); go('messages');
      } catch (error) { toast(error.message); }
    });
  });
}

PAGES.sponsor.messages = messagesPage;

/* ==================================================== instructor workspace */
PAGES.instructor.dashboard = async (page) => {
  const data = await api.get('/dashboard');
  const numbers = data.stats || {};
  page.innerHTML = hero('Welcome, Instructor', 'Build lessons, answer learners and follow your course numbers', '', '📘') +
    stats([['📘', 'c1', numbers.courses ?? 0, 'Courses'], ['🎓', 'c2', numbers.participants ?? 0, 'Learners'],
      ['🚀', 'c3', numbers.projects ?? 0, 'Impact projects'], ['📅', 'c4', numbers.sessions ?? 0, 'Sessions']]) +
    card('Course authoring', empty('Open My Courses to add modules and lessons.'),
      '<button class="lnk" data-goto="courses">My courses →</button>');
};

const REVIEW_LABELS = { DRAFT: 'Draft', SUBMITTED: 'In review', CHANGES_REQUESTED: 'Changes requested',
  APPROVED: 'Approved', PUBLISHED: 'Published' };
const REVIEW_TAGS = { DRAFT: 'Draft', SUBMITTED: 'Review', CHANGES_REQUESTED: 'Rejected',
  APPROVED: 'Published', PUBLISHED: 'Published' };

PAGES.instructor.courses = async (page) => {
  const courses = await api.get('/instructor/courses');
  page.innerHTML = head('My Courses', 'Draft a course, add modules and lessons, then submit it for review',
    '<button class="btn sm" data-new-course>+ New course</button>') +
    card('Courses', table(['Course', 'Career path', 'Level', 'Modules', 'Status', 'Actions'], courses.map((course) => [
      `<strong>${esc(course.title)}</strong><br><small style="color:var(--mut)">${esc(course.code)}</small>`,
      esc(course.careerPathTitle), `Level ${course.level}`, String(course.moduleCount),
      tag(REVIEW_TAGS[course.reviewStatus] || course.reviewStatus, REVIEW_LABELS[course.reviewStatus]),
      `<span class="pgh"><button class="btn ghost sm" data-course-content="${course.id}">Content</button>
        ${course.reviewStatus === 'DRAFT' || course.reviewStatus === 'CHANGES_REQUESTED'
          ? `<button class="btn sm" data-submit-course="${course.id}">Submit for review</button>` : ''}</span>`,
    ])));
  $$('[data-course-content]').forEach((button) => button.addEventListener('click', () => {
    state.adminCourseId = Number(button.dataset.courseContent);
    state.contentBack = 'courses';
    go('courseContent');
  }));
  $$('[data-submit-course]').forEach((button) => button.addEventListener('click', async () => {
    busy(button, true);
    try {
      await api.post(`/instructor/courses/${button.dataset.submitCourse}/submit`);
      toast('Course submitted for review.');
      go('courses');
    } catch (error) { toast(error.message); busy(button, false); }
  }));

  $('[data-new-course]').addEventListener('click', async () => {
    let paths = [];
    try {
      const tree = await api.get('/instructor/catalogue');
      paths = tree.flatMap((entry) => entry.careerPaths.map((path) =>
        ({ value: path.id, label: `${entry.academy.name} · ${path.title}` })));
    } catch (error) { toast(error.message); return; }
    modal(`<h3>New course</h3><form id="newCourse" class="fgrid">
      ${fld('Title', 'title', { required: true })}${fld('Code', 'code', { required: true, placeholder: 'TECH-WEB-L2' })}
      ${sel('Career path', 'careerPathId', paths)}
      <div class="fgrid">${sel('Level', 'level', [{ value: 1, label: 'Level One' }, { value: 2, label: 'Level Two' }], 1)}
        ${fld('Duration (hours)', 'durationHours', { type: 'number', min: 0, value: 20 })}
        ${sel('Language', 'language', [{ value: 'en', label: 'English' }, { value: 'sw', label: 'Kiswahili' }, { value: 'fr', label: 'French' }], 'en')}</div>
      ${fld('Summary', 'summary', { placeholder: 'One line for the catalogue' })}
      ${txt('Description', 'description')}
      <h3 style="grid-column:1/-1;margin:8px 0 0">Attribution (required before submission)</h3>
      ${fld('Source', 'sourceName', { required: true, placeholder: 'OpenStax — Entrepreneurship' })}
      ${fld('Source URL', 'sourceUrl', { placeholder: 'https://…' })}
      <div class="fgrid">${fld('Licence', 'licence', { required: true, placeholder: 'CC BY 4.0' })}
        ${fld('Licence URL', 'licenceUrl', { placeholder: 'https://creativecommons.org/…' })}</div>
      ${fld('Author', 'author', { required: true, placeholder: 'Original author or organisation' })}
      ${txt('Attribution text', 'attributionText', { required: true, placeholder: 'How credit is given on the course page' })}
      <label class="row"><span>Verified certificate available</span><input type="checkbox" name="certificateAvailable" checked></label>
      <div class="pgh" style="grid-column:1/-1"><button class="btn" type="submit">Create draft</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#newCourse').addEventListener('submit', async (event) => {
      event.preventDefault();
      const values = vals(event.target);
      const payload = {
        careerPathId: Number(values.careerPathId), code: values.code, title: values.title,
        summary: values.summary, description: values.description, level: Number(values.level),
        durationHours: Number(values.durationHours || 0), language: values.language,
        certificateAvailable: values.certificateAvailable === 'on',
        sourceName: values.sourceName, sourceUrl: values.sourceUrl, licence: values.licence,
        licenceUrl: values.licenceUrl, author: values.author, attributionText: values.attributionText,
      };
      try {
        const created = await api.post('/instructor/courses', payload);
        closeModal(); toast('Draft created. Add modules and lessons, then submit it.');
        state.adminCourseId = created.id;
        state.contentBack = 'courses';
        go('courseContent');
      } catch (error) { toast(error.message); }
    });
  });
};

/* ======================================================= reviewer workspace */
PAGES.reviewer.dashboard = async (page) => {
  const data = await api.get('/dashboard');
  const numbers = data.stats || {};
  page.innerHTML = hero('Welcome, Reviewer', 'Check quality, licensing and accessibility before publication', '', '🔎') +
    stats([['📘', 'c1', numbers.courses ?? 0, 'Courses'], ['👩‍🏫', 'c2', numbers.instructors ?? 0, 'Instructors'],
      ['🎓', 'c3', numbers.participants ?? 0, 'Learners'], ['🏅', 'c4', numbers.certificates ?? 0, 'Certificates']]) +
    card('Review queue', empty('Open the Review Queue to inspect course outlines and lesson content.'),
      '<button class="lnk" data-goto="courses">Review queue →</button>');
};

PAGES.reviewer.courses = async (page) => {
  const [courses, queue] = await Promise.all([
    api.get('/reviewer/courses'), api.get('/reviewer/submissions').catch(() => []),
  ]);
  page.innerHTML = head('Review Queue', 'Approve submissions, ask for changes and inspect published outlines') +
    card('Waiting for a decision', queue.length ? table(['Course', 'Instructor', 'Modules', 'Status', 'Decision'], queue.map((course) => [
      `<strong>${esc(course.title)}</strong><br><small style="color:var(--mut)">${esc(course.code)}</small>`,
      esc(course.instructorName || 'Unassigned'), String(course.moduleCount),
      tag(REVIEW_TAGS[course.reviewStatus] || course.reviewStatus, REVIEW_LABELS[course.reviewStatus]),
      `<span class="pgh"><button class="btn ok sm" data-approve="${course.id}">Approve</button>
        <button class="btn bad sm" data-changes="${course.id}">Request changes</button></span>`,
    ]), false) : empty('Nothing waiting for review.')) +
    card('All courses', table(['Course', 'Career path', 'Level', 'Modules', 'Status', 'Actions'], courses.map((course) => [
      `<strong>${esc(course.title)}</strong><br><small style="color:var(--mut)">${esc(course.code)}</small>`,
      esc(course.careerPathTitle), `Level ${course.level}`, String(course.moduleCount),
      tag(course.published ? 'Published' : 'Draft'),
      `<button class="btn ghost sm" data-outline="${course.id}">View outline</button>`,
    ])));
  $$('[data-outline]').forEach((button) => button.addEventListener('click', async () => {
    try {
      const outline = await api.get(`/content/courses/${button.dataset.outline}/outline`);
      modal(`<h3>${esc(outline.course.title)}</h3>
        <p style="color:var(--mut)">${esc(outline.course.summary || '')}</p>
        ${outline.modules.map((module) => `<div class="act"><div class="ic c1">${esc(module.icon || '📘')}</div>
          <div class="grow"><b>${esc(module.name)}</b><small>${module.lessons.length} lesson(s) · ${esc(module.outcome || '')}</small></div></div>`).join('')
          || empty('This course has no modules yet.')}
        <div class="pgh"><button class="btn ghost" type="button" data-close>Close</button></div>`);
      $('[data-close]').addEventListener('click', closeModal);
    } catch (error) { toast(error.message); }
  }));

  const decide = async (courseId, decision, label) => {
    const note = prompt(`${label} — optional note for the instructor`);
    if (note === null) return;
    try {
      await api.post(`/reviewer/submissions/${courseId}/decision`, { decision, note });
      toast(decision === 'APPROVE' ? 'Course approved and published.' : 'Changes requested.');
      go('courses');
    } catch (error) { toast(error.message); }
  };
  $$('[data-approve]').forEach((button) => button.addEventListener('click',
    () => decide(button.dataset.approve, 'APPROVE', 'Approve course')));
  $$('[data-changes]').forEach((button) => button.addEventListener('click',
    () => decide(button.dataset.changes, 'CHANGES', 'Request changes')));
};

/* ======================================================= employer workspace */
PAGES.employer.dashboard = async (page) => {
  const data = await api.get('/dashboard');
  const numbers = data.stats || {};
  page.innerHTML = hero('Welcome, Employer', 'Hire verified young talent from across Africa', '', '🏢') +
    stats([['👥', 'c1', numbers.approvedParticipants ?? 0, 'Verified learners'],
      ['🏅', 'c2', numbers.certificates ?? 0, 'Certificates earned'],
      ['🚀', 'c3', numbers.projects ?? 0, 'Impact projects'], ['📘', 'c4', numbers.courses ?? 0, 'Courses']]) +
    card('Opportunities', `<p style="color:var(--mut)">Your organisation account is ready. The job, internship and tender board opens in the next
      phase; learners' verified certificates and Level Two projects will be searchable there.</p>`);
};

PAGES.instructor.courseContent = PAGES.admin.courseContent;

/* ================================================================ router */
let delegated = false;
function delegate() {
  if (delegated) return;
  delegated = true;
  document.addEventListener('click', (event) => {
    const target = event.target.closest('[data-goto]');
    if (!target) return;
    event.preventDefault();
    go(target.dataset.goto);
  });
}

/* ------------------------------------------------ jobs, applications, portfolio */
PAGES.participant.jobs = async (page) => {
  const [jobs, applications, portfolio] = await Promise.all([
    api.get('/jobs').catch(() => []), api.get('/me/job-applications').catch(() => []),
    api.get('/me/portfolio').catch(() => []),
  ]);
  page.innerHTML = head('Jobs & portfolio', 'Apply to opportunities and show the work you have done') +
    card('Open opportunities', jobs.length ? table(['Role', 'Organisation', 'Location', 'Mode', 'Closes', 'Actions'], jobs.map((job) => [
      `<strong>${esc(job.title)}</strong><br><small style="color:var(--mut)">${esc(job.skills || '')}</small>`,
      esc(job.organisation), esc(job.location), esc(job.workMode),
      job.closesAt ? d(job.closesAt) : 'Open',
      `<span class="pgh"><button class="btn ghost sm" data-view-job="${job.id}">Details</button>
        <button class="btn sm" data-apply="${job.id}">Apply</button></span>`,
    ])) : empty('No open opportunities yet. Check back soon.')) +
    card('My applications', applications.length ? table(['Role', 'Organisation', 'Status', 'Applied'], applications.map((row) => [
      esc(row.title), esc(row.organisation), tag(row.status === 'HIRED' ? 'Published' : row.status === 'REJECTED' ? 'Rejected' : 'Review', row.status), d(row.createdAt),
    ])) : empty('You have not applied to anything yet.')) +
    card('My portfolio', `<form id="portfolioForm" class="fgrid">
      ${fld('Title', 'title', { required: true })}
      ${sel('Type', 'type', [{ value: 'PROJECT', label: 'Project' }, { value: 'CERTIFICATE', label: 'Certificate' },
        { value: 'WRITING', label: 'Writing' }, { value: 'CODE', label: 'Code' }])}
      ${fld('Link', 'url', { placeholder: 'https://github.com/…' })}
      ${txt('Description', 'description')}
      <div class="pgh"><button class="btn sm" type="submit">Add to portfolio</button></div></form>
      <div style="margin-top:12px">${portfolio.length ? portfolio.map((item) => `<div class="act">
        <div class="ic c1">📁</div><div class="grow"><b>${esc(item.title)}</b>
        <small style="display:block;color:var(--mut)">${esc(item.type)} · ${esc(item.description || '')}</small></div>
        ${item.url ? `<a class="btn ghost sm" href="${esc(item.url)}" target="_blank" rel="noopener">Open</a>` : ''}
        <button class="btn ghost sm" data-remove-portfolio="${item.id}">Remove</button></div>`).join('') : empty('Add your first piece of work.')}</div>`);

  $$('[data-apply]').forEach((button) => button.addEventListener('click', () => {
    const job = jobs.find((row) => String(row.id) === button.dataset.apply);
    modal(`<h3>Apply: ${esc(job.title)}</h3><p style="color:var(--mut)">${esc(job.organisation)} · ${esc(job.location)}</p>
      <p>${esc(job.description)}</p>
      <form id="applyForm">${txt('Why you are a good fit', 'coverNote', { required: true })}
      <div class="pgh"><button class="btn" type="submit">Send application</button>
        <button class="btn ghost" type="button" data-close>Cancel</button></div></form>`);
    $('[data-close]').addEventListener('click', closeModal);
    $('#applyForm').addEventListener('submit', async (event) => {
      event.preventDefault();
      try {
        await api.post(`/jobs/${job.id}/apply`, { coverNote: vals(event.target).coverNote });
        closeModal(); toast('Application sent.'); go('jobs');
      } catch (error) { toast(error.message); }
    });
  }));
  $$('[data-view-job]').forEach((button) => button.addEventListener('click', () => {
    const job = jobs.find((row) => String(row.id) === button.dataset.viewJob);
    modal(`<h3>${esc(job.title)}</h3><p style="color:var(--mut)">${esc(job.organisation)} · ${esc(job.location)} · ${esc(job.workMode)}</p>
      <p>${esc(job.description)}</p><p><b>Skills:</b> ${esc(job.skills || 'Not listed')}</p>
      <div class="pgh"><button class="btn ghost" data-close>Close</button></div>`);
    $('[data-close]').addEventListener('click', closeModal);
  }));
  $('#portfolioForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const values = vals(event.target);
    try { await api.post('/me/portfolio', values); toast('Added to your portfolio.'); go('jobs'); }
    catch (error) { toast(error.message); }
  });
  $$('[data-remove-portfolio]').forEach((button) => button.addEventListener('click', async () => {
    try { await api.del(`/me/portfolio/${button.dataset.removePortfolio}`); toast('Removed.'); go('jobs'); }
    catch (error) { toast(error.message); }
  }));
};

PAGES.employer.jobs = async (page) => {
  const jobs = await api.get('/employer/jobs').catch(() => []);
  page.innerHTML = head('Jobs & applicants', 'Post opportunities and screen applicants by their verified work') +
    card('Post an opportunity', `<form id="jobForm" class="fgrid">
      ${fld('Role title', 'title', { required: true })}${fld('Organisation', 'organisation', { required: true })}
      ${fld('Location', 'location', { required: true, value: 'Kampala, Uganda' })}
      ${sel('Work mode', 'workMode', [{ value: 'ONSITE', label: 'On site' }, { value: 'HYBRID', label: 'Hybrid' }, { value: 'REMOTE', label: 'Remote' }])}
      ${fld('Skills (comma separated)', 'skills')}
      ${txt('Description', 'description', { required: true })}
      <div class="pgh"><button class="btn" type="submit">Publish posting</button></div></form>`) +
    card('My postings', jobs.length ? table(['Role', 'Location', 'Applicants', 'Status', 'Actions'], jobs.map((job) => [
      `<strong>${esc(job.title)}</strong><br><small style="color:var(--mut)">${esc(job.organisation)}</small>`,
      esc(job.location), '', tag(job.open ? 'Published' : 'Draft', job.open ? 'Open' : 'Closed'),
      `<span class="pgh"><button class="btn ghost sm" data-applicants="${job.id}">Applicants</button>
        ${job.open ? `<button class="btn ghost sm" data-close-job="${job.id}">Close</button>` : ''}</span>`,
    ])) : empty('No postings yet.'));

  $('#jobForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    try { await api.post('/employer/jobs', vals(event.target)); toast('Posting published.'); go('jobs'); }
    catch (error) { toast(error.message); }
  });
  $$('[data-close-job]').forEach((button) => button.addEventListener('click', async () => {
    try { await api.post(`/employer/jobs/${button.dataset.closeJob}/close`); toast('Posting closed.'); go('jobs'); }
    catch (error) { toast(error.message); }
  }));
  $$('[data-applicants]').forEach((button) => button.addEventListener('click', async () => {
    try {
      const rows = await api.get(`/employer/jobs/${button.dataset.applicants}/applicants`);
      modal(`<h3>Applicants</h3>${rows.length ? rows.map((row) => `<div class="act">
        <div class="ic c2">${esc((row.learner || '?').slice(0, 1))}</div>
        <div class="grow"><b>${esc(row.learner)}</b>
        <small style="display:block;color:var(--mut)">${esc(row.country || '')} · ${esc(row.status)}</small>
        <small style="display:block">${esc(row.coverNote)}</small></div>
        <button class="btn ok sm" data-hire="${row.id}">Hire</button>
        <button class="btn ghost sm" data-reject="${row.id}">Reject</button></div>`).join('') : empty('No applicants yet.')}
        <div class="pgh"><button class="btn ghost" data-close>Close</button></div>`);
      $('[data-close]').addEventListener('click', closeModal);
      const decide = async (id, status) => {
        try { await api.post(`/employer/applications/${id}/decision`, { status }); closeModal(); toast('Decision saved.'); go('jobs'); }
        catch (error) { toast(error.message); }
      };
      $$('[data-hire]').forEach((b) => b.addEventListener('click', () => decide(b.dataset.hire, 'HIRED')));
      $$('[data-reject]').forEach((b) => b.addEventListener('click', () => decide(b.dataset.reject, 'REJECTED')));
    } catch (error) { toast(error.message); }
  }));
};

async function route() {
  delegate();
  const hash = location.hash || '#/';
  const user = session.user;
  if (hash.startsWith('#/app')) {
    if (!user || !user.role) { location.hash = '#/login'; return; }
    const key = hash.split('/')[2] || 'dashboard';
    const role = user.role.toLowerCase();
    const allowed = (NAV[role] || []).some(([slug]) => slug === key);
    await go(allowed ? key : 'dashboard');
    return;
  }
  if (hash.startsWith('#/login')) { loginScreen(); return; }
  if (hash.startsWith('#/signup')) { signupScreen(); return; }
  landing();
}

window.addEventListener('hashchange', () => { route(); });
route();
