'use strict';

/* =========================================================
   ВАШИ ДАННЫЕ: меняйте здесь
   ========================================================= */
const TELEGRAM = 'your_name';   // ваш ник в Telegram, без @
const TIKTOK   = 'your_name';   // ваш ник в TikTok, без @

const NICK = 'Chillud';
const BIO  = ['Со основатель км Осинтерс, Вайбодер, p2pшник, воркер, вбивер'];  // можно несколько строк, они печатаются по очереди

const BG_VIDEO = 'background.mp4';  // видео на фоне (положите рядом с index.html), '' чтобы отключить
const ENTER_SCREEN = true;          // экран «Нажмите, чтобы войти»: нужен, чтобы музыка гарантированно включилась

// Музыка: положите mp3 в папку music рядом с index.html и добавьте строку в список.
// Если треков несколько, они играют по кругу. Пустой список скрывает плеер.
const TRACKS = [
  { title: 'Мой трек', artist: 'Chillud', src: 'music/track1.mp3' },
  // { title: 'Второй трек', artist: 'Исполнитель', src: 'music/track2.mp3' },
];
const AUTOPLAY = true;          // пытаться включить музыку сразу (браузер может дождаться первого клика)

/* =========================================================
   Платформы. tpl: шаблон ссылки для ника, copy: просто копирует текст.
   Иконки упрощённые, нарисованы линиями.
   ========================================================= */
const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

const PLATFORMS = {
  telegram: { label: 'Telegram', ph: 'ник без @', tpl: 'https://t.me/{v}', icon: svg('<path d="M21 4 3 11l5.5 2L10 19l3-3.5L18 20z"/>') },
  tiktok:   { label: 'TikTok',   ph: 'ник без @', tpl: 'https://tiktok.com/@{v}', icon: svg('<path d="M14 4v10.5a3.5 3.5 0 1 1-3.5-3.5M14 4c.5 2.5 2 4 4.5 4.2"/>') },
};

/* =========================================================
   Настройки по умолчанию и безопасная загрузка
   ========================================================= */
const KEY = 'social-links:v3';
const VIEWS_KEY = 'social-links:visits';
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (id) => document.getElementById(id);
const uid = () => Math.random().toString(36).slice(2, 9);

// Видео на фоне: без звука, по кругу (звук играет плеер)
const bgVideo = $('bgVideo');
if (BG_VIDEO) {
  bgVideo.src = BG_VIDEO;
  bgVideo.addEventListener('error', () => document.body.classList.remove('has-video')); // нет файла: остаётся градиент
} else {
  bgVideo.remove();
}

const DEFAULTS = {
  name: NICK,
  bio: BIO.slice(),
  avatar: 'avatar.png',
  bgType: 'video', c1: '#1a1033', c2: '#05050a', bgImage: '',
  accent: '#a78bfa', blur: 14, alpha: 55,
  glow: true, typewriter: true, layout: 'icons',
  links: [
    { platform: 'telegram', value: TELEGRAM, label: '' },
    { platform: 'tiktok', value: TIKTOK, label: '' },
  ],
};

const str = (v, d, max = 200) => (typeof v === 'string' ? v.slice(0, max) : d);
const num = (v, d, min, max) => (Number.isFinite(+v) && v !== '' ? Math.min(max, Math.max(min, +v)) : d);
const color = (v, d) => (/^#[0-9a-f]{6}$/i.test(v) ? v : d);
const img = (v) => (typeof v === 'string' && (/^(https?:\/\/|data:image\/)/i.test(v) || /^[\w\-./]+\.(png|jpe?g|webp|gif|svg)$/i.test(v)) ? v : ''); // http(s), data:image или локальный файл

// Приводим любые данные (из localStorage или файла) к корректному виду
function sanitize(o) {
  o = o && typeof o === 'object' ? o : {};
  const D = DEFAULTS;
  const links = (Array.isArray(o.links) ? o.links : D.links).filter((l) => l && l.platform in PLATFORMS).slice(0, 20).map((l) => ({
    id: uid(),
    platform: l.platform,
    value: str(l.value, '', 200),
    label: str(l.label, '', 30),
  }));
  return {
    name: str(o.name, D.name, 40),
    bio: Array.isArray(o.bio) ? o.bio.map((x) => str(x, '', 120)).slice(0, 6) : D.bio.slice(),
    avatar: img(o.avatar),
    bgType: ['image', 'video'].includes(o.bgType) ? o.bgType : 'gradient',
    c1: color(o.c1, D.c1), c2: color(o.c2, D.c2), bgImage: img(o.bgImage),
    accent: color(o.accent, D.accent),
    blur: num(o.blur, D.blur, 0, 30), alpha: num(o.alpha, D.alpha, 0, 90),
    glow: o.glow !== false, typewriter: o.typewriter !== false,
    layout: o.layout === 'buttons' ? 'buttons' : 'icons',
    links,
  };
}

function load() {
  try { return sanitize(JSON.parse(localStorage.getItem(KEY))); }
  catch { return sanitize({}); }
}

let cfg = load();
let saveTimer;
function saveSoon() { // небольшая задержка, чтобы не писать на каждую букву
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    try { localStorage.setItem(KEY, JSON.stringify(cfg)); }
    catch { toast('Не удалось сохранить: возможно, картинка слишком большая'); }
  }, 250);
}

let toastTimer;
function toast(msg) {
  const t = $('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

/* =========================================================
   Отрисовка страницы
   ========================================================= */
const cssUrl = (u) => `url("${u.replace(/"/g, '%22')}")`;

function applyStyle() {
  const root = document.documentElement.style;
  root.setProperty('--accent', cfg.accent);
  root.setProperty('--blur', cfg.blur + 'px');
  root.setProperty('--alpha', cfg.alpha / 100);
  document.body.classList.toggle('glow', cfg.glow);
  const showVideo = cfg.bgType === 'video' && !!BG_VIDEO;
  document.body.classList.toggle('has-video', showVideo);
  if (showVideo) bgVideo.play().catch(() => {});

  const bg = $('bg').style;
  const grad = `linear-gradient(135deg, ${cfg.c1}, ${cfg.c2})`;
  bg.backgroundImage = cfg.bgType === 'image' && cfg.bgImage
    ? `linear-gradient(rgba(0,0,0,.45), rgba(0,0,0,.45)), ${cssUrl(cfg.bgImage)}`
    : grad;
}

function renderProfile() {
  $('name').textContent = cfg.name || ' ';
  document.title = cfg.name || 'Мои соцсети';
  const av = $('avatar');
  av.style.backgroundImage = cfg.avatar ? cssUrl(cfg.avatar) : 'none';
  av.textContent = cfg.avatar ? '' : (cfg.name || '?').trim().charAt(0);
}

// Печатающаяся подпись
let twTimer;
function startTypewriter() {
  clearTimeout(twTimer);
  const el = $('bioText');
  const lines = cfg.bio.map((s) => s.trim()).filter(Boolean);
  document.querySelector('.caret').hidden = !cfg.typewriter || reduced;
  if (!lines.length) { el.textContent = ''; return; }
  if (!cfg.typewriter || reduced) { el.textContent = lines.join(' | '); return; }

  let li = 0, ci = 0, erasing = false;
  const tick = () => {
    const text = lines[li];
    ci += erasing ? -1 : 1;
    el.textContent = text.slice(0, ci);
    let delay = erasing ? 35 : 70;
    if (!erasing && ci === text.length) {
      if (lines.length === 1) return; // одна строка: напечатали и остановились
      erasing = true; delay = 1600;
    } else if (erasing && ci === 0) {
      erasing = false; li = (li + 1) % lines.length; delay = 350;
    }
    twTimer = setTimeout(tick, delay);
  };
  tick();
}

// Собираем безопасную ссылку: только http(s), остальное отбрасываем
function buildUrl(p, raw) {
  const v = raw.trim();
  if (!v) return null;
  if (/^https?:\/\//i.test(v)) return v;
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return null; // javascript: и подобное
  if (p.tpl) return p.tpl.replace('{v}', encodeURIComponent(v.replace(/^@/, '')));
  return 'https://' + v;
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Скопировано: ' + text); }
  catch { prompt('Скопируйте вручную:', text); }
}

function renderLinks() {
  const nav = $('links');
  nav.replaceChildren();
  nav.className = 'links ' + cfg.layout;

  cfg.links.forEach((l) => {
    const p = PLATFORMS[l.platform] || PLATFORMS.telegram;
    if (!l.value.trim()) return;
    const title = l.label || p.label;
    const a = document.createElement('a');
    a.className = 'link';
    a.title = title;
    a.setAttribute('aria-label', title);
    a.innerHTML = p.icon; // иконки заданы в коде выше, не из пользовательских данных
    if (cfg.layout === 'buttons') {
      const s = document.createElement('span');
      s.textContent = title;
      a.append(s);
    }
    if (p.copy) {
      a.href = '#';
      a.addEventListener('click', (e) => { e.preventDefault(); copyText(l.value.trim()); });
    } else {
      const url = buildUrl(p, l.value);
      if (!url) return;
      a.href = url; // переход сразу, в этой же вкладке
    }
    nav.append(a);
  });
}

function refresh() { applyStyle(); renderProfile(); }

/* =========================================================
   Панель настроек
   ========================================================= */
const panel = $('panel');

function syncPanel() {
  $('pName').value = cfg.name;
  $('pBio').value = cfg.bio.join('\n');
  $('pAvatarUrl').value = cfg.avatar.startsWith('data:') ? '' : cfg.avatar;
  $('pBgType').value = cfg.bgType;
  $('pC1').value = cfg.c1; $('pC2').value = cfg.c2;
  $('pBgUrl').value = cfg.bgImage.startsWith('data:') ? '' : cfg.bgImage;
  $('pAccent').value = cfg.accent;
  $('pBlur').value = cfg.blur; $('pAlpha').value = cfg.alpha;
  $('pGlow').checked = cfg.glow; $('pType').checked = cfg.typewriter;
  $('pLayout').value = cfg.layout;
  toggleBgRows();
  renderEditor();
}

function toggleBgRows() {
  const isImg = cfg.bgType === 'image';
  $('bgUrlRow').hidden = $('bgFileRow').hidden = !isImg;
}

function on(id, fn, ev = 'input') {
  $(id).addEventListener(ev, (e) => { fn(e.target); refresh(); saveSoon(); });
}

on('pName', (el) => { cfg.name = el.value.slice(0, 40); });
on('pBio', (el) => { cfg.bio = el.value.split('\n').slice(0, 6); startTypewriter(); });
on('pAvatarUrl', (el) => { cfg.avatar = img(el.value.trim()); });
on('pBgType', (el) => { cfg.bgType = el.value; toggleBgRows(); }, 'change');
on('pC1', (el) => { cfg.c1 = el.value; });
on('pC2', (el) => { cfg.c2 = el.value; });
on('pBgUrl', (el) => { cfg.bgImage = img(el.value.trim()); });
on('pAccent', (el) => { cfg.accent = el.value; });
on('pBlur', (el) => { cfg.blur = +el.value; });
on('pAlpha', (el) => { cfg.alpha = +el.value; });
on('pGlow', (el) => { cfg.glow = el.checked; }, 'change');
on('pType', (el) => { cfg.typewriter = el.checked; startTypewriter(); }, 'change');
on('pLayout', (el) => { cfg.layout = el.value; renderLinks(); }, 'change');

/* ---------- Загрузка картинок: уменьшаем, чтобы влезли в localStorage ---------- */
function readImage(file, maxSize, done) {
  const reader = new FileReader();
  reader.onload = () => {
    const im = new Image();
    im.onload = () => {
      const k = Math.min(1, maxSize / Math.max(im.width, im.height));
      const c = document.createElement('canvas');
      c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
      c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
      done(c.toDataURL('image/jpeg', 0.82));
    };
    im.onerror = () => toast('Не удалось открыть картинку');
    im.src = reader.result;
  };
  reader.readAsDataURL(file);
}

$('pAvatarPick').addEventListener('click', () => $('pAvatarFile').click());
$('pAvatarFile').addEventListener('change', (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (f) readImage(f, 512, (u) => { cfg.avatar = u; $('pAvatarUrl').value = ''; refresh(); saveSoon(); });
});
$('pAvatarClear').addEventListener('click', () => { cfg.avatar = ''; $('pAvatarUrl').value = ''; refresh(); saveSoon(); });

$('pBgPick').addEventListener('click', () => $('pBgFile').click());
$('pBgFile').addEventListener('change', (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (f) readImage(f, 1600, (u) => { cfg.bgImage = u; $('pBgUrl').value = ''; refresh(); saveSoon(); });
});

/* ---------- Редактор списка ссылок ---------- */
function mk(tag, cls, text) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text !== undefined) el.textContent = text;
  return el;
}

function renderEditor() {
  const box = $('linkList');
  box.replaceChildren();

  cfg.links.forEach((l, i) => {
    const row = mk('div', 'lrow');

    const sel = mk('select');
    Object.entries(PLATFORMS).forEach(([k, p]) => sel.append(new Option(p.label, k)));
    sel.value = l.platform;
    sel.setAttribute('aria-label', 'Платформа');
    sel.addEventListener('change', () => { l.platform = sel.value; renderEditor(); renderLinks(); saveSoon(); });

    const mini = mk('div', 'mini');
    const move = (dir, label, text) => {
      const b = mk('button', '', text);
      b.type = 'button'; b.setAttribute('aria-label', label);
      b.disabled = (dir < 0 && i === 0) || (dir > 0 && i === cfg.links.length - 1);
      b.addEventListener('click', () => {
        [cfg.links[i], cfg.links[i + dir]] = [cfg.links[i + dir], cfg.links[i]];
        renderEditor(); renderLinks(); saveSoon();
      });
      return b;
    };
    const del = mk('button', '', '✕');
    del.type = 'button'; del.setAttribute('aria-label', 'Удалить ссылку');
    del.addEventListener('click', () => { cfg.links.splice(i, 1); renderEditor(); renderLinks(); saveSoon(); });
    mini.append(move(-1, 'Выше', '↑'), move(1, 'Ниже', '↓'), del);

    const val = mk('input', 'full');
    val.type = 'text'; val.maxLength = 200; val.value = l.value;
    val.placeholder = PLATFORMS[l.platform].ph;
    val.setAttribute('aria-label', 'Ник или ссылка');
    val.addEventListener('input', () => { l.value = val.value; renderLinks(); saveSoon(); });

    const lab = mk('input', 'full');
    lab.type = 'text'; lab.maxLength = 30; lab.value = l.label;
    lab.placeholder = 'Подпись (необязательно)';
    lab.setAttribute('aria-label', 'Подпись');
    lab.addEventListener('input', () => { l.label = lab.value; renderLinks(); saveSoon(); });

    row.append(sel, mini, val, lab);
    box.append(row);
  });
}

$('addLink').addEventListener('click', () => {
  if (cfg.links.length >= 20) return toast('Максимум 20 ссылок');
  cfg.links.push({ id: uid(), platform: 'telegram', value: '', label: '' });
  renderEditor(); saveSoon();
  const inputs = $('linkList').querySelectorAll('input.full');
  inputs[inputs.length - 2]?.focus();
});

/* ---------- Экспорт, импорт, сброс ---------- */
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify(cfg, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'social-links.json';
  a.click();
  URL.revokeObjectURL(a.href);
});

$('importBtn').addEventListener('click', () => $('importFile').click());
$('importFile').addEventListener('change', (e) => {
  const f = e.target.files[0]; e.target.value = '';
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    try {
      cfg = sanitize(JSON.parse(r.result));
      saveSoon(); refresh(); renderLinks(); startTypewriter(); syncPanel();
      toast('Настройки импортированы');
    } catch { toast('Не удалось прочитать файл: нужен JSON с настройками'); }
  };
  r.readAsText(f);
});

$('resetBtn').addEventListener('click', () => {
  if (!confirm('Сбросить все настройки к начальным?')) return;
  cfg = sanitize({});
  saveSoon(); refresh(); renderLinks(); startTypewriter(); syncPanel();
});

/* ---------- Открытие и закрытие панели ---------- */
function setPanel(open) {
  panel.hidden = !open;
  $('gear').hidden = open;
  if (open) { syncPanel(); $('pName').focus(); } else { $('gear').focus(); }
}
$('gear').addEventListener('click', () => setPanel(true));
$('closePanel').addEventListener('click', () => setPanel(false));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !panel.hidden) setPanel(false); });

/* =========================================================
   Наклон карточки за курсором (только с мышью)
   ========================================================= */
if (matchMedia('(hover: hover)').matches && !reduced) {
  const card = $('card');
  document.addEventListener('pointermove', (e) => {
    if (!panel.hidden) { card.style.transform = ''; return; }
    const x = e.clientX / innerWidth - 0.5, y = e.clientY / innerHeight - 0.5;
    card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
  });
}

/* =========================================================
   Запуск
   ========================================================= */
refresh();
renderLinks();
startTypewriter();

// Счётчик открытий страницы (считается только в этом браузере)
let visits = 0;
try { visits = (+localStorage.getItem(VIEWS_KEY) || 0) + 1; localStorage.setItem(VIEWS_KEY, visits); } catch { /* без счётчика */ }
$('views').textContent = visits ? `Открытий: ${visits}` : '';

/* =========================================================
   Музыкальный плеер (треки берутся из TRACKS в начале файла)
   ========================================================= */
const audio = $('audio');
const VOL_KEY = 'social-links:volume';
let trackIndex = 0, seeking = false;

const ICONS = {
  play:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
  pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 5h4v14H7zM13 5h4v14h-4z"/></svg>',
  prev:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 5h2v14H6zM20 5v14L9 12z"/></svg>',
  next:  '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 5h2v14h-2zM4 5l11 7-11 7z"/></svg>',
};

function fmtTime(sec) {
  if (!Number.isFinite(sec)) return '0:00';
  return `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, '0')}`;
}

function loadTrack(i, play) {
  trackIndex = (i + TRACKS.length) % TRACKS.length;
  const t = TRACKS[trackIndex];
  $('pTitle').textContent = t.title || 'Без названия';
  $('pArtist').textContent = t.artist || '';
  $('pSeek').value = 0;
  $('pTime').textContent = $('pDur').textContent = '0:00';
  audio.src = t.src;
  if (play) audio.play().catch(() => {});
}

function initPlayer() {
  if (!TRACKS.length) return;
  $('player').hidden = false;
  $('pPrev').innerHTML = ICONS.prev;
  $('pNext').innerHTML = ICONS.next;
  $('pPlay').innerHTML = ICONS.play;

  const single = TRACKS.length === 1;
  $('pPrev').hidden = $('pNext').hidden = single;
  audio.loop = single; // один трек повторяется

  let vol = 0.6;
  try { const v = localStorage.getItem(VOL_KEY); if (v !== null) vol = Math.min(1, Math.max(0, +v)); } catch { /* по умолчанию */ }
  audio.volume = vol;
  $('pVol').value = vol * 100;

  $('pPlay').addEventListener('click', () => { audio.paused ? audio.play().catch(() => {}) : audio.pause(); });
  $('pPrev').addEventListener('click', () => loadTrack(trackIndex - 1, true));
  $('pNext').addEventListener('click', () => loadTrack(trackIndex + 1, true));
  $('pSeek').addEventListener('input', (e) => {
    seeking = true;
    if (audio.duration) audio.currentTime = (e.target.value / 1000) * audio.duration;
  });
  $('pSeek').addEventListener('change', () => { seeking = false; });
  $('pVol').addEventListener('input', (e) => {
    audio.volume = e.target.value / 100;
    try { localStorage.setItem(VOL_KEY, audio.volume); } catch { /* не страшно */ }
  });

  audio.addEventListener('loadedmetadata', () => { $('pDur').textContent = fmtTime(audio.duration); });
  audio.addEventListener('timeupdate', () => {
    if (!seeking && audio.duration) $('pSeek').value = (audio.currentTime / audio.duration) * 1000;
    $('pTime').textContent = fmtTime(audio.currentTime);
  });
  audio.addEventListener('play', () => { $('pPlay').innerHTML = ICONS.pause; $('pPlay').setAttribute('aria-label', 'Пауза'); });
  audio.addEventListener('pause', () => { $('pPlay').innerHTML = ICONS.play; $('pPlay').setAttribute('aria-label', 'Играть'); });
  audio.addEventListener('ended', () => loadTrack(trackIndex + 1, true));
  audio.addEventListener('error', () => {
    $('pTitle').textContent = 'Не найден файл ' + TRACKS[trackIndex].src;
    $('pArtist').textContent = 'Положите его в папку music или поправьте TRACKS в app.js';
  });

  loadTrack(0, false);

  // Экран входа: клик по нему даёт браузеру разрешение на звук
  const enter = $('enter');
  if (ENTER_SCREEN && AUTOPLAY) {
    enter.hidden = false;
    enter.focus();
    enter.addEventListener('click', () => {
      enter.classList.add('gone');
      setTimeout(() => { enter.hidden = true; }, 400);
      audio.play().catch(() => {});
    });
    audio.addEventListener('play', () => { enter.hidden = true; });
  }

  // Автозапуск: браузеры часто блокируют звук до первого клика, тогда ждём его
  if (AUTOPLAY) {
    const stop = () => { removeEventListener('pointerdown', kick); removeEventListener('keydown', kick); };
    const kick = (e) => {
      if (e.target.closest && e.target.closest('.player')) return;
      audio.play().then(stop).catch(() => {});
    };
    audio.addEventListener('play', stop);
    audio.play().catch(() => {
      addEventListener('pointerdown', kick);
      addEventListener('keydown', kick);
    });
  }
}
initPlayer();
