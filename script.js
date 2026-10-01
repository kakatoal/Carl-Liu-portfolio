const year = new Date().getFullYear();
document.getElementById('year').textContent = year;
document.getElementById('year-range').textContent = `2024—${year}`;

// Grid toggle (G key or header button)
const GRID_KEY = 'grid-hidden';

try {
  if (localStorage.getItem(GRID_KEY) === '1') document.body.classList.add('grid-hidden');
} catch (e) {}

function toggleGrid() {
  const hidden = document.body.classList.toggle('grid-hidden');
  try {
    localStorage.setItem(GRID_KEY, hidden ? '1' : '0');
  } catch (e) {}
}

document.querySelector('.grid-toggle').addEventListener('click', toggleGrid);
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'g' && !e.metaKey && !e.ctrlKey && !e.altKey) toggleGrid();
});

// Hero title: gooey hover + click through the design iterations
const title = document.querySelector('.hero-title');
const titleWrap = document.querySelector('.hero-title-wrap');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const VERSIONS = [
  { name: 'Black type',    filter: 'goo-plain',   note: 'The starting point. Clear, but it said nothing.' },
  { name: 'Rainbow glaze', filter: 'goo-plain',   note: 'Too loud. The effect took over and the name disappeared.' },
  { name: 'Gradient',      filter: 'goo-plain',   note: 'A clean blue gradient. Polished, but it could be anyone’s name.' },
  { name: 'Lit glass',     filter: 'goo-glass',   note: 'Closer — the grid shows through. But heavy and over-rendered.' },
  { name: 'Frosted',       filter: 'goo-frost',   note: 'Quiet and tactile. Still just a color, though.' },
  { name: 'Layered glass', filter: 'goo-contour', note: 'Final. Light in layers, following every letter.' },
];

const PULL = reduceMotion ? 0 : 0.4; // how far letters move toward the cursor (0–1)
const RADIUS = 1.4;    // influence radius, × font size
const EASE = 0.12;     // smoothing per frame
const MAX_BLUR = 0.05; // stickiness, × font size

const chars = [];
[...title.childNodes].forEach((node) => {
  if (node.nodeType !== Node.TEXT_NODE) return;
  const frag = document.createDocumentFragment();
  for (const ch of node.textContent) {
    const el = document.createElement('span');
    el.className = 'char';
    el.textContent = ch;
    el.setAttribute('aria-hidden', 'true');
    el.style.setProperty('--i', chars.length);
    frag.appendChild(el);
    chars.push({ el, x: 0, y: 0 });
  }
  node.replaceWith(frag);
});

const pointer = { x: 0, y: 0, active: false };
let fontSize;
let blur = 0;
let rafId = null;
let version;
let filter;

// Filter sizes follow the type size
function sizeFilters() {
  fontSize = parseFloat(getComputedStyle(title).fontSize);
  document.getElementById('contour-blur').setAttribute('stdDeviation', (fontSize * 0.1).toFixed(1));
  document.getElementById('contour-warp').setAttribute('scale', (fontSize * 0).toFixed(1));
  document.getElementById('glass-bump').setAttribute('stdDeviation', (fontSize * 0.025).toFixed(1));
  document.getElementById('glass-rim').setAttribute('radius', (fontSize * 0.01).toFixed(1));
}

function setVersion(index) {
  version = (index + VERSIONS.length) % VERSIONS.length;
  const v = VERSIONS[version];
  const el = document.getElementById(v.filter);
  filter = { url: `url(#${v.filter})`, blur: el.querySelector('.goo-blur'), fade: el.querySelector('.goo-fade') };

  titleWrap.dataset.v = version + 1;
  const pad = (n) => String(n).padStart(2, '0');
  document.querySelector('.iteration-count').textContent = `${pad(version + 1)} / ${pad(VERSIONS.length)}`;
  document.querySelector('.iteration-name').textContent = v.name;
  document.querySelector('.iteration-note').textContent = v.note;
  start();
}

function tick() {
  const radius = fontSize * RADIUS;
  const targetBlur = pointer.active ? fontSize * MAX_BLUR : 0;
  blur += (targetBlur - blur) * EASE;
  let settled = Math.abs(targetBlur - blur) < 0.05;

  chars.forEach((c) => {
    let tx = 0;
    let ty = 0;
    if (pointer.active) {
      const r = c.el.getBoundingClientRect();
      const dx = pointer.x - (r.left + r.width / 2 - c.x);
      const dy = pointer.y - (r.top + r.height / 2 - c.y);
      const s = Math.max(0, 1 - Math.hypot(dx, dy) / radius) ** 2;
      tx = dx * s * PULL;
      ty = dy * s * PULL;
    }
    c.x += (tx - c.x) * EASE;
    c.y += (ty - c.y) * EASE;
    if (Math.abs(tx - c.x) > 0.1 || Math.abs(ty - c.y) > 0.1) settled = false;
    c.el.style.transform = `translate(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px)`;
  });

  const hover = blur / (fontSize * MAX_BLUR);
  filter.blur.setAttribute('stdDeviation', blur.toFixed(2));
  filter.fade?.setAttribute('slope', hover.toFixed(3));
  title.style.setProperty('--hover', hover.toFixed(3));
  // Filter off when idle keeps the type crisp
  title.style.filter = blur < 0.05 && !pointer.active ? 'none' : filter.url;

  rafId = settled && !pointer.active ? null : requestAnimationFrame(tick);
}

function start() {
  if (rafId === null) rafId = requestAnimationFrame(tick);
}

function move(e) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
  start();
}

function leave() {
  pointer.active = false;
  start();
}

title.addEventListener('pointermove', move);
title.addEventListener('pointerdown', move);
title.addEventListener('pointerleave', leave);
title.addEventListener('pointercancel', leave);
title.addEventListener('pointerup', (e) => {
  if (e.pointerType !== 'mouse') leave();
});

title.addEventListener('click', () => setVersion(version + 1));
document.querySelectorAll('.iteration-btn').forEach((btn) => {
  btn.addEventListener('click', () => setVersion(version + Number(btn.dataset.step)));
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') setVersion(version + 1);
  if (e.key === 'ArrowLeft') setVersion(version - 1);
});

window.addEventListener('resize', sizeFilters);
sizeFilters();
setVersion(VERSIONS.length - 1);
