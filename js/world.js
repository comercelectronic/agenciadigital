/* Agència Digital — món explorable estil RPG (vista zenital, moviment per caselles).
   L'alumne es mou per Vic, el seu despatx i els negocis dels clients, troba pistes útils per a les missions,
   ajuda els botiguers i fa accions de màrqueting reals. Les converses importants continuen sent les escenes cara a cara. */
(function () {
  'use strict';
  const TS = 16;
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const INK = '#2b1d22';
  let API = null, S = null;
  let root, cv, ctx, zoom = 3, cssW = 0, cssH = 0, dpr = 1;
  let map = null, player = null, npcs = [], birds = [], raf = 0, last = 0, clock = 0;
  let busy = false, held = null, path = [], minigame = null, bannerT = 0;
  const keysDown = new Set();

  /* =================================================================
     Art: rajoles, objectes i personatges dibuixats píxel a píxel
     ================================================================= */
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
  const R = (g, x, y, w, h, c) => { g.fillStyle = c; g.fillRect(x, y, w, h); };
  const hash = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function shade(hex, a) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, v + a));
    return '#' + [f(n >> 16), f((n >> 8) & 255), f(n & 255)].map(v => v.toString(16).padStart(2, '0')).join('');
  }
  // Contorn fosc al voltant de tot el que s'ha dibuixat (estil sprite)
  function outline(c, col) {
    const g = c.getContext('2d'); const { width: w, height: h } = c;
    const d = g.getImageData(0, 0, w, h); const a = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d.data[(y * w + x) * 4 + 3] > 40;
    const pts = [];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (!a(x, y) && (a(x - 1, y) || a(x + 1, y) || a(x, y - 1) || a(x, y + 1))) pts.push([x, y]);
    g.fillStyle = col || INK; pts.forEach(([x, y]) => g.fillRect(x, y, 1, 1));
    return c;
  }

  // --- Rajoles de terra ---
  function tileGround(g, ch, x, y, phase) {
    const r = (s) => hash(x, y, s);
    const ox = x * TS, oy = y * TS;
    if (ch === '.' || ch === ',' || ch === '@') {
      R(g, ox, oy, TS, TS, '#86cf6e');
      for (let i = 0; i < 5; i++) { const px = Math.floor(r(i) * 15), py = Math.floor(r(i + 9) * 14); R(g, ox + px, oy + py, 1, 2, '#6fb85a'); }
      if (r(30) > .7) R(g, ox + Math.floor(r(31) * 14), oy + Math.floor(r(32) * 14), 2, 1, '#a6e08c');
      if (ch === ',') {
        const cols = ['#ff8fb3', '#ffe066', '#ffffff', '#b28cff'];
        for (let i = 0; i < 3; i++) { const px = 2 + Math.floor(r(40 + i) * 11), py = 2 + Math.floor(r(50 + i) * 11); R(g, ox + px, oy + py, 2, 2, cols[Math.floor(r(60 + i) * 4)]); R(g, ox + px, oy + py + 2, 1, 1, '#5a9a48'); }
      }
    } else if (ch === '=') {
      R(g, ox, oy, TS, TS, '#d8c39f');
      const off = (y % 2) * 4;
      for (let row = 0; row < 4; row++) for (let col = -1; col < 3; col++) {
        const sx = ox + col * 8 + off + (row % 2) * 4, sy = oy + row * 4;
        R(g, sx + 1, sy + 1, 6, 3, r(row * 7 + col + 70) > .5 ? '#e4d1ad' : '#d2bc96');
        R(g, sx + 1, sy + 3, 6, 1, '#bfa47c');
      }
      g.clearRect(0, 0, 0, 0);
    } else if (ch === '-') {
      R(g, ox, oy, TS, TS, '#e8dcc2'); R(g, ox, oy + 15, TS, 1, '#d4c4a4'); R(g, ox + 15, oy, 1, TS, '#d4c4a4');
    } else if (ch === 'r') { // carretera
      R(g, ox, oy, TS, TS, '#7d7f86'); if (r(3) > .6) R(g, ox + Math.floor(r(4) * 14), oy + Math.floor(r(5) * 14), 2, 1, '#8c8e95');
      if (y % 2 === 0 && x % 3 === 0) R(g, ox + 2, oy + 7, 10, 2, '#f1f1e6');
    } else if (ch === 'w') {
      R(g, ox, oy, TS, TS, '#4fa6e0');
      for (let i = 0; i < 3; i++) { const wy = (i * 5 + Math.floor(r(80 + i) * 3) + phase * 2) % 15; const wx = Math.floor(r(90 + i) * 10); R(g, ox + wx, oy + wy, 5, 1, '#8ccdf4'); }
      if (r(99) > .8) R(g, ox + Math.floor(r(98) * 14), oy + Math.floor(r(97) * 14), 1, 1, '#e8f7ff');
    } else if (ch === 'b') {
      R(g, ox, oy, TS, TS, '#b98654');
      for (let i = 0; i < 4; i++) R(g, ox, oy + i * 4 + 3, TS, 1, '#94643c');
      R(g, ox, oy, TS, 1, '#6b4426');
    } else if (ch === '_') { // parquet
      R(g, ox, oy, TS, TS, '#d1a46c');
      for (let i = 0; i < 4; i++) { R(g, ox, oy + i * 4 + 3, TS, 1, '#b8874f'); R(g, ox + ((i * 7 + x * 5) % 16), oy + i * 4, 1, 3, '#bd8c55'); }
    } else if (ch === ':') { // rajola
      R(g, ox, oy, TS, TS, (x + y) % 2 ? '#ece5d6' : '#dcd3c0'); R(g, ox, oy, TS, 1, '#f6f1e6');
    } else if (ch === ';') { // terra de nau industrial
      R(g, ox, oy, TS, TS, '#a9adb3'); if (r(2) > .5) R(g, ox + Math.floor(r(6) * 13), oy + Math.floor(r(7) * 13), 3, 1, '#9a9ea5');
    } else if (ch === 'W') { // paret interior
      const top = !map || y === 0 || (map.grid[y - 1] && map.grid[y - 1][x] !== 'W');
      R(g, ox, oy, TS, TS, map && map.wall || '#f2e2c4');
      for (let i = 0; i < TS; i += 4) R(g, ox + i, oy, 1, TS, shade(map && map.wall || '#f2e2c4', -14));
      if (map && map.grid[y + 1] && map.grid[y + 1][x] !== 'W') { R(g, ox, oy + 12, TS, 4, '#8a5a3a'); R(g, ox, oy + 12, TS, 1, '#a8744c'); }
      if (top) R(g, ox, oy, TS, 2, '#5b3c2c');
    } else if (ch === 'D') { // estora de sortida
      R(g, ox, oy, TS, TS, map && map.floorCol || '#d1a46c'); R(g, ox + 1, oy + 2, 14, 12, '#b0413e'); R(g, ox + 2, oy + 3, 12, 10, '#d0605a'); R(g, ox + 4, oy + 6, 8, 1, '#f3b2a4'); R(g, ox + 4, oy + 9, 8, 1, '#f3b2a4');
    } else if (ch === 'X') {
      R(g, ox, oy, TS, TS, '#2a2340');
    }
  }

  // --- Objectes (arbres, mobiliari...) ---
  const SPR = {};
  function spr(key, w, h, draw, noOutline) {
    if (SPR[key]) return SPR[key];
    const [c, g] = mk(w, h); draw(g, w, h); if (!noOutline) outline(c);
    return (SPR[key] = c);
  }
  const OBJ = {
    tree: () => spr('tree', 18, 30, (g) => {
      R(g, 7, 20, 4, 9, '#7a4a2a'); R(g, 8, 20, 1, 9, '#9a6238');
      const blob = (x, y, w, h, c) => { R(g, x + 1, y, w - 2, h, c); R(g, x, y + 1, w, h - 2, c); };
      blob(1, 6, 16, 15, '#3f9a4a'); blob(3, 1, 12, 12, '#4fb05a'); blob(5, 3, 6, 5, '#6cc874'); R(g, 6, 4, 2, 1, '#9ae09c');
      R(g, 2, 15, 3, 2, '#2f7d3a'); R(g, 12, 17, 3, 2, '#2f7d3a');
    }),
    pine: () => spr('pine', 16, 30, (g) => {
      R(g, 7, 22, 3, 7, '#7a4a2a');
      for (let i = 0; i < 4; i++) { const w = 6 + i * 3, y = 2 + i * 5; R(g, 8 - w / 2, y, w, 7, i % 2 ? '#2e7d4f' : '#3b9460'); }
      R(g, 7, 0, 2, 3, '#3b9460');
    }),
    hedge: () => spr('hedge', 16, 16, (g) => { R(g, 1, 4, 14, 11, '#4aa356'); R(g, 0, 6, 16, 8, '#4aa356'); R(g, 3, 5, 5, 3, '#6cc874'); R(g, 9, 9, 4, 2, '#3a8a46'); }),
    lamp: () => spr('lamp', 8, 30, (g) => { R(g, 3, 6, 2, 22, '#3a3f4a'); R(g, 1, 27, 6, 2, '#3a3f4a'); R(g, 1, 1, 6, 6, '#3a3f4a'); R(g, 2, 2, 4, 4, '#ffe9a0'); }),
    bench: () => spr('bench', 16, 12, (g) => { R(g, 1, 2, 14, 3, '#9a6238'); R(g, 1, 6, 14, 3, '#b8784a'); R(g, 2, 9, 2, 3, '#4a3a30'); R(g, 12, 9, 2, 3, '#4a3a30'); }),
    sign: () => spr('sign', 14, 18, (g) => { R(g, 6, 8, 2, 10, '#7a4a2a'); R(g, 0, 1, 14, 8, '#c8945a'); R(g, 1, 2, 12, 6, '#e0b07a'); R(g, 3, 4, 8, 1, '#7a4a2a'); }),
    busstop: () => spr('busstop', 12, 30, (g) => { R(g, 5, 8, 2, 21, '#5a6070'); R(g, 0, 0, 12, 10, '#2f6fc8'); R(g, 2, 2, 8, 6, '#ffffff'); R(g, 3, 3, 6, 1, '#2f6fc8'); R(g, 3, 5, 4, 1, '#2f6fc8'); }),
    fountain: (ph) => spr('fountain' + ph, 32, 32, (g) => {
      R(g, 1, 8, 30, 22, '#b8b0a2'); R(g, 0, 10, 32, 18, '#b8b0a2'); R(g, 3, 10, 26, 17, '#4fa6e0');
      R(g, 5 + ph * 2, 13, 6, 1, '#8ccdf4'); R(g, 18 - ph * 2, 21, 7, 1, '#8ccdf4');
      R(g, 13, 2, 6, 18, '#cfc8bb'); R(g, 12, 2, 8, 3, '#e0dacd'); R(g, 15, 0, 2, 3, '#8ccdf4');
      R(g, 10 - ph, 4 + ph, 1, 2, '#e8f7ff'); R(g, 21 + ph, 5 - ph, 1, 2, '#e8f7ff');
    }),
    stall: (c) => spr('stall' + c, 32, 30, (g) => {
      R(g, 2, 14, 28, 14, '#a8744c'); R(g, 3, 15, 26, 4, '#c8945a');
      const prod = ['#ffcf4a', '#ff7a6a', '#7ac85a', '#f6e7c8', '#d07a3a'];
      for (let i = 0; i < 8; i++) R(g, 4 + i * 3, 12, 2, 3, prod[(i + c.length) % 5]);
      for (let i = 0; i < 8; i++) R(g, i * 4, 2, 4, 9, i % 2 ? '#ffffff' : c);
      R(g, 0, 10, 32, 2, shade(c, -40)); R(g, 3, 11, 2, 17, '#6b4426'); R(g, 27, 11, 2, 17, '#6b4426');
    }),
    table: () => spr('table', 16, 16, (g) => { R(g, 2, 4, 12, 7, '#c8945a'); R(g, 3, 5, 10, 2, '#e0b07a'); R(g, 7, 11, 2, 4, '#7a4a2a'); }),
    tableCloth: () => spr('tablec', 16, 16, (g) => { R(g, 1, 3, 14, 9, '#ffffff'); R(g, 1, 9, 14, 3, '#d65a5a'); R(g, 6, 5, 4, 2, '#f2c46a'); R(g, 7, 12, 2, 3, '#7a4a2a'); }),
    parasol: () => spr('parasol', 30, 30, (g) => { R(g, 14, 12, 2, 16, '#6b4426'); for (let i = 0; i < 6; i++) R(g, 3 + i * 4, 2 + Math.abs(2.5 - i), 4, 9, i % 2 ? '#ffffff' : '#2f9a6e'); R(g, 1, 10, 28, 2, '#1f6a4a'); }),
    counter: (w) => spr('counter' + w, w * TS, 22, (g, W) => { R(g, 0, 4, W, 18, '#a8744c'); R(g, 0, 2, W, 5, '#e6d2b0'); R(g, 0, 7, W, 1, '#7a4a2a'); for (let i = 8; i < W; i += 16) R(g, i, 10, 1, 10, '#8a5a3a'); }),
    breadCase: (w) => spr('bread' + w, w * TS, 22, (g, W) => {
      R(g, 0, 6, W, 16, '#a8744c'); R(g, 0, 0, W, 10, '#cfe8f5'); R(g, 0, 0, W, 1, '#ffffff');
      for (let x = 2; x < W - 4; x += 6) { R(g, x, 4, 5, 3, '#d99a4a'); R(g, x + 1, 4, 3, 1, '#f0c27a'); }
      R(g, 0, 10, W, 1, '#7a4a2a');
    }),
    shelfBread: () => spr('shelfB', 32, 30, (g) => {
      R(g, 0, 0, 32, 30, '#8a5a3a'); for (let s = 0; s < 3; s++) { R(g, 2, 2 + s * 9, 28, 7, '#5b3c2c'); for (let i = 0; i < 4; i++) { R(g, 3 + i * 7, 4 + s * 9, 6, 4, s === 0 ? '#e0a050' : '#c98a3a'); R(g, 4 + i * 7, 4 + s * 9, 3, 1, '#f3cf8a'); } }
    }),
    bookshelf: () => spr('books', 32, 30, (g) => {
      R(g, 0, 0, 32, 30, '#7a4a2a'); const c = ['#d65a5a', '#3d6fb8', '#f2b134', '#2f9a6e', '#7a5ac8', '#e6e0d0'];
      for (let s = 0; s < 3; s++) { R(g, 2, 2 + s * 9, 28, 7, '#4a2e1c'); for (let i = 0; i < 9; i++) R(g, 3 + i * 3, 3 + s * 9 + (i % 3 === 0 ? 1 : 0), 2, 6 - (i % 3 === 0 ? 1 : 0), c[(i + s * 2) % 6]); }
    }),
    desk: () => spr('desk', 32, 24, (g) => {
      R(g, 0, 8, 32, 12, '#b8844f'); R(g, 0, 8, 32, 3, '#d6a46e'); R(g, 2, 20, 3, 4, '#6b4426'); R(g, 27, 20, 3, 4, '#6b4426');
      R(g, 9, 0, 14, 10, '#2a2f3a'); R(g, 10, 1, 12, 7, '#5ac8e8'); R(g, 12, 3, 6, 1, '#ffffff'); R(g, 12, 5, 8, 1, '#c8f0ff'); R(g, 15, 9, 2, 2, '#2a2f3a');
      R(g, 24, 6, 4, 4, '#ffffff'); R(g, 25, 7, 2, 2, '#7a4a2a');
    }),
    whiteboard: () => spr('wb', 48, 26, (g) => {
      R(g, 0, 0, 48, 22, '#9aa0a8'); R(g, 2, 2, 44, 18, '#ffffff');
      R(g, 5, 5, 14, 1, '#3d6fb8'); R(g, 5, 8, 20, 1, '#3d6fb8'); R(g, 5, 11, 10, 1, '#d65a5a'); R(g, 28, 5, 1, 12, '#2f9a6e'); R(g, 29, 14, 12, 1, '#2f9a6e'); R(g, 31, 12, 3, 2, '#2f9a6e'); R(g, 36, 9, 3, 5, '#2f9a6e');
      R(g, 4, 22, 40, 2, '#9aa0a8');
    }, true),
    phone: () => spr('phone', 16, 16, (g) => { R(g, 3, 8, 10, 7, '#7a4a2a'); R(g, 4, 3, 8, 6, '#3a3f4a'); R(g, 5, 4, 6, 2, '#5a6070'); R(g, 6, 6, 1, 1, '#ffd24a'); R(g, 9, 6, 1, 1, '#ffd24a'); }),
    plant: () => spr('plant', 16, 24, (g) => { R(g, 4, 15, 8, 8, '#c8653d'); R(g, 4, 15, 8, 2, '#e07a4a'); R(g, 7, 6, 2, 10, '#3a8a46'); R(g, 2, 4, 6, 6, '#4fb05a'); R(g, 8, 2, 6, 7, '#57b862'); R(g, 5, 9, 7, 5, '#3f9a4a'); }),
    coffee: () => spr('coffee', 16, 24, (g) => { R(g, 2, 8, 12, 15, '#7a4a2a'); R(g, 3, 0, 10, 10, '#3a3f4a'); R(g, 4, 2, 8, 3, '#d65a5a'); R(g, 6, 7, 4, 3, '#ffffff'); }),
    sofa: () => spr('sofa', 32, 18, (g) => { R(g, 0, 2, 32, 14, '#7a5ac8'); R(g, 2, 6, 28, 8, '#9a7ae0'); R(g, 0, 2, 4, 14, '#5a3fa0'); R(g, 28, 2, 4, 14, '#5a3fa0'); }),
    oven: (ph) => spr('oven' + ph, 32, 30, (g) => { R(g, 0, 4, 32, 26, '#b8a088'); R(g, 2, 0, 28, 8, '#9a8670'); R(g, 6, 12, 20, 14, '#3a2a22'); R(g, 8, 18 - ph, 16, 8 + ph, ph ? '#ff9a3a' : '#ff7a2a'); R(g, 10, 22, 12, 4, '#ffd24a'); }),
    register: () => spr('reg', 16, 16, (g) => { R(g, 2, 6, 12, 9, '#5a6070'); R(g, 3, 2, 10, 5, '#3a3f4a'); R(g, 4, 3, 8, 3, '#7ae0a0'); R(g, 4, 9, 2, 2, '#e6e6e6'); R(g, 7, 9, 2, 2, '#e6e6e6'); R(g, 10, 9, 2, 2, '#e6e6e6'); }),
    fridge: () => spr('fridge', 32, 30, (g) => { R(g, 0, 0, 32, 30, '#e8eef2'); R(g, 2, 2, 28, 18, '#bfe2f2'); for (let i = 0; i < 6; i++) { R(g, 4 + i * 4, 6, 2, 10, '#b84a3a'); R(g, 4 + i * 4, 6, 2, 1, '#e8eef2'); } R(g, 0, 22, 32, 1, '#9aa0a8'); }),
    rack: (c) => spr('rack' + c, 32, 28, (g) => { R(g, 1, 2, 30, 2, '#5a6070'); R(g, 2, 2, 2, 25, '#5a6070'); R(g, 28, 2, 2, 25, '#5a6070'); for (let i = 0; i < 6; i++) R(g, 5 + i * 4, 4, 3, 14, i % 2 ? c : shade(c, -40)); }),
    aisle: (c) => spr('aisle' + c, 64, 26, (g) => { R(g, 0, 0, 64, 26, '#e0e4ea'); for (let s = 0; s < 2; s++) for (let i = 0; i < 15; i++) R(g, 2 + i * 4, 3 + s * 11, 3, 8, ['#d65a5a', '#f2b134', '#3d6fb8', '#2f9a6e', c][(i + s) % 5]); R(g, 0, 12, 64, 2, '#9aa0a8'); }),
    machine: (ph) => spr('mach' + ph, 32, 30, (g) => { R(g, 0, 6, 32, 24, '#6a7a8a'); R(g, 2, 8, 28, 8, '#8a9aaa'); R(g, 4, 10, 10, 4, '#2a2f3a'); R(g, 5, 11, 8, 2, ph ? '#7ae0a0' : '#5ac8e8'); for (let i = 0; i < 8; i++) R(g, i * 4, 26, 2, 4, '#f2b134'); R(g, 18, 0, 8, 8, '#5a6070'); R(g, 20 + ph * 2, 2, 2, 4, '#d6d9de'); }),
    crates: () => spr('crates', 16, 18, (g) => { R(g, 0, 6, 16, 12, '#b8844f'); R(g, 0, 6, 16, 2, '#d6a46e'); R(g, 7, 6, 2, 12, '#8a5a3a'); R(g, 2, 0, 12, 7, '#c8945a'); }),
    booth: (c) => spr('booth' + c, 48, 30, (g) => { R(g, 0, 0, 48, 8, c); R(g, 0, 8, 48, 2, shade(c, -50)); R(g, 2, 10, 2, 18, '#5a6070'); R(g, 44, 10, 2, 18, '#5a6070'); R(g, 4, 18, 40, 10, '#ffffff'); R(g, 4, 18, 40, 2, shade(c, 40)); R(g, 10, 2, 28, 3, '#ffffff'); }),
    poster: (c) => spr('poster' + c, 14, 18, (g) => { R(g, 0, 0, 14, 18, '#ffffff'); R(g, 1, 1, 12, 9, c); R(g, 2, 12, 10, 1, '#5a6070'); R(g, 2, 14, 7, 1, '#5a6070'); }),
    window: () => spr('win', 32, 22, (g) => { R(g, 0, 0, 32, 22, '#8a5a3a'); R(g, 2, 2, 28, 16, '#bfe6ff'); R(g, 15, 2, 2, 16, '#8a5a3a'); R(g, 4, 4, 6, 2, '#ffffff'); R(g, 0, 18, 32, 4, '#b8844f'); }, true),
    rug: () => spr('rug', 48, 32, (g) => { R(g, 0, 0, 48, 32, '#c8653d'); R(g, 3, 3, 42, 26, '#e0905a'); R(g, 8, 8, 32, 16, '#f2c46a'); }, true),
    tray: () => spr('tray', 16, 14, (g) => { R(g, 1, 6, 14, 6, '#c8945a'); R(g, 3, 3, 4, 4, '#e0a050'); R(g, 8, 2, 5, 5, '#d99a4a'); R(g, 9, 3, 2, 1, '#f3cf8a'); }),
    gate: () => spr('gate', 48, 20, (g) => { for (let i = 0; i < 12; i++) R(g, 2 + i * 4, 2, 2, 18, '#3a3f4a'); R(g, 0, 2, 48, 2, '#3a3f4a'); R(g, 0, 12, 48, 2, '#3a3f4a'); }),
    bin: () => spr('bin', 12, 16, (g) => { R(g, 1, 3, 10, 12, '#2f9a6e'); R(g, 0, 1, 12, 3, '#1f6a4a'); }),
    car: (c) => spr('car' + c, 32, 22, (g) => { R(g, 1, 8, 30, 10, c); R(g, 6, 2, 18, 8, shade(c, -20)); R(g, 8, 3, 14, 5, '#bfe6ff'); R(g, 4, 17, 6, 5, '#2a2a2a'); R(g, 22, 17, 6, 5, '#2a2a2a'); R(g, 28, 10, 3, 3, '#ffe9a0'); })
  };

  // --- Edificis (sostre de teula + façana + porta + rètol) ---
  function buildingSprite(b) {
    const key = 'bld:' + [b.w, b.h, b.wall, b.roof, b.door, b.awning, b.kind, b.shutter].join('|');
    return spr(key, b.w * TS, b.h * TS, (g, W, H) => {
      const roofH = b.kind === 'church' ? H - 3 * TS : Math.max(TS * 2, Math.round(H * .45));
      // façana
      R(g, 0, roofH - 2, W, H - roofH + 2, b.wall); R(g, 0, H - 3, W, 3, shade(b.wall, -45));
      for (let x = 0; x < W; x += 4) R(g, x, roofH, 1, H - roofH - 3, shade(b.wall, -10));
      // teulada
      const rc = b.roof;
      R(g, 0, 0, W, roofH, rc);
      for (let y = 3; y < roofH; y += 4) { R(g, 0, y, W, 1, shade(rc, -35)); for (let x = (y % 8 ? 0 : 4); x < W; x += 8) R(g, x, y - 3, 1, 3, shade(rc, -20)); }
      R(g, 0, roofH - 3, W, 3, shade(rc, -60)); R(g, 0, 0, W, 2, shade(rc, 30));
      if (b.kind === 'church') { const cx = W / 2; R(g, cx - 12, 0, 24, roofH + 10, '#cfc8bb'); R(g, cx - 10, 4, 20, roofH, '#e0dacd'); R(g, cx - 4, 8, 8, 12, '#3a2f4a'); R(g, cx - 1, 2, 2, 6, '#ffd24a'); }
      // finestres
      const wy = roofH + 4, wh = Math.min(12, H - roofH - 22);
      const doorX = (b.door != null ? b.door : -9) * TS;
      for (let x = 4; x + 12 < W; x += 18) {
        if (doorX >= 0 && x + 14 > doorX - 2 && x < doorX + TS + 2) continue;
        if (wh > 4) { R(g, x, wy, 12, wh, '#5a4030'); R(g, x + 1, wy + 1, 10, wh - 2, b.shutter ? '#8a8a8a' : '#a8dcf5'); if (!b.shutter) R(g, x + 2, wy + 2, 3, 2, '#e8f7ff'); R(g, x - 1, wy + wh, 14, 2, '#d6d0c4'); }
      }
      // tendal
      if (b.awning) for (let x = 0; x < W; x += 6) { R(g, x, roofH, 6, 6, (x / 6) % 2 ? '#ffffff' : b.awning); R(g, x, roofH + 6, 6, 1, shade(b.awning, -40)); }
      // porta
      if (b.door != null) {
        const dx = b.door * TS + 2, dy = H - TS - 8;
        R(g, dx - 2, dy - 2, TS, TS + 10, '#5a4030');
        R(g, dx, dy, TS - 4, TS + 8, b.shutter ? '#7a7a7a' : (b.doorCol || '#7a4a2a'));
        if (b.shutter) for (let i = 0; i < 6; i++) R(g, dx, dy + i * 4, TS - 4, 1, '#5a5a5a');
        else { R(g, dx + 2, dy + 3, TS - 8, 8, '#a8dcf5'); R(g, dx + TS - 8, dy + 14, 2, 2, '#ffd24a'); }
      }
      if (b.flag) { R(g, W - 10, 2, 1, 14, '#5a4030'); R(g, W - 9, 2, 7, 5, '#ffd24a'); R(g, W - 9, 3, 7, 1, '#d63c3c'); R(g, W - 9, 5, 7, 1, '#d63c3c'); }
    });
  }

  // --- Personatges (16x24) generats a partir dels colors de cada personatge ---
  const PAU_COLS = ['#4a78c8', '#2f9a6e', '#7a5ac8', '#2e3a5a', '#1d1b2b'];
  function palette(id, extra) {
    if (extra) return extra;
    const c = ART.CHARS[id] || ART.CHARS.client;
    const oc = id === 'pau' ? PAU_COLS[API ? API.rank() : 0] : (c.oc || '#6a7a8a');
    return { hair: c.hair, skin: c.skin, eye: c.eye || '#3a2a20', cloth: oc === '#ffffff' ? '#f4f4f4' : oc, style: c.style, acc: c.acc || [], apron: c.outfit === 'apron', chef: c.outfit === 'chef', pants: c.outfit === 'suit' || c.outfit === 'blazer' ? shade(oc, -20) : '#3a4a6a' };
  }
  function charSprite(key, P, dir, frame) {
    const k = 'ch:' + key + ':' + dir + ':' + frame;
    if (SPR[k]) return SPR[k];
    const [c, g] = mk(16, 24);
    const side = dir === 'left' || dir === 'right';
    const step = frame === 1 ? 1 : frame === 2 ? -1 : 0;
    const long = ['long', 'wavy', 'bob', 'pony'].includes(P.style);
    // cames
    if (!side) {
      R(g, 5, 18, 2, step === 1 ? 3 : 4, P.pants); R(g, 9, 18, 2, step === -1 ? 3 : 4, P.pants);
      R(g, 4, step === 1 ? 21 : 22, 3, 1, '#2a2a2a'); R(g, 9, step === -1 ? 21 : 22, 3, 1, '#2a2a2a');
    } else {
      R(g, 6 + step * 2, 18, 2, 4, P.pants); R(g, 8 - step * 2, 18, 2, 4, shade(P.pants, -20));
      R(g, 6 + step * 2, 22, 3, 1, '#2a2a2a'); R(g, 8 - step * 2, 22, 3, 1, '#2a2a2a');
    }
    // tors
    const cl = P.chef ? '#f4f4f4' : P.cloth;
    R(g, 4, 12, 8, 7, cl); R(g, 4, 12, 8, 1, shade(cl, 25)); R(g, side ? 4 : 10, 13, 2, 6, shade(cl, -25));
    if (P.apron && !(dir === 'up')) { R(g, side ? 7 : 5, 13, side ? 4 : 6, 6, '#f4f0e6'); R(g, side ? 7 : 5, 13, side ? 4 : 6, 1, '#d8d0c0'); }
    // braços
    if (!side) {
      R(g, 3, 13 + (step === 1 ? 1 : 0), 1, 5, cl); R(g, 12, 13 + (step === -1 ? 1 : 0), 1, 5, cl);
      R(g, 3, 18 + (step === 1 ? 1 : 0), 1, 1, P.skin); R(g, 12, 18 + (step === -1 ? 1 : 0), 1, 1, P.skin);
    } else {
      const ax = dir === 'right' ? 7 + step : 7 - step;
      R(g, ax, 13, 2, 5, shade(cl, -15)); R(g, ax, 18, 2, 1, P.skin);
    }
    // cap
    R(g, 3, 2, 10, 10, P.skin); R(g, 2, 3, 12, 8, P.skin);
    const H = P.hair, Hd = shade(H, -30);
    if (dir === 'down') {
      R(g, 2, 1, 12, 4, H); R(g, 3, 0, 10, 2, H); R(g, 2, 4, 2, long ? 9 : 5, H); R(g, 12, 4, 2, long ? 9 : 5, H);
      R(g, 4, 5, 2, 1, H); R(g, 7, 5, 3, 1, H); R(g, 11, 5, 1, 1, H);
      R(g, 5, 7, 2, 2, INK); R(g, 9, 7, 2, 2, INK); R(g, 5, 7, 1, 1, '#ffffff'); R(g, 9, 7, 1, 1, '#ffffff');
      R(g, 4, 9, 1, 1, '#ffb0b0'); R(g, 11, 9, 1, 1, '#ffb0b0'); R(g, 7, 10, 2, 1, '#c46a6a');
      if (P.acc.includes('glassesRound') || P.acc.includes('glassesRect')) { R(g, 4, 6, 4, 1, INK); R(g, 8, 6, 4, 1, INK); R(g, 4, 9, 4, 1, INK); R(g, 8, 9, 4, 1, INK); }
      if (P.acc.includes('sunglasses')) R(g, 4, 7, 8, 2, '#1a1a1a');
    } else if (dir === 'up') {
      R(g, 2, 1, 12, 10, H); R(g, 3, 0, 10, 2, H); R(g, 4, 8, 8, 1, Hd);
      if (long) R(g, 3, 10, 10, 4, H);
    } else {
      const f = dir === 'right';
      const hx = f ? 2 : 7;
      R(g, 2, 1, 12, 4, H); R(g, 3, 0, 10, 2, H); R(g, hx, 4, 7, long ? 10 : 6, H);
      const ex = f ? 10 : 5;
      R(g, ex, 7, 2, 2, INK); R(g, ex, 7, 1, 1, '#ffffff'); R(g, f ? 12 : 3, 9, 1, 1, '#ffb0b0');
      if (P.acc.includes('glassesRound') || P.acc.includes('glassesRect')) { R(g, ex - 1, 6, 4, 1, INK); R(g, ex - 1, 9, 4, 1, INK); }
      if (P.acc.includes('sunglasses')) R(g, ex - 1, 7, 4, 2, '#1a1a1a');
    }
    if (P.style === 'bun') { R(g, 6, -1 + 1, 4, 2, H); R(g, 5, 0, 6, 1, Hd); }
    if (P.style === 'pony' && dir !== 'down') R(g, dir === 'right' ? 1 : dir === 'left' ? 13 : 7, 6, 2, 7, H);
    if (P.style === 'spiky') { R(g, 3, 0, 2, 1, Hd); R(g, 7, 0, 2, 1, Hd); R(g, 11, 0, 2, 1, Hd); }
    if (P.acc.includes('beret')) { R(g, 2, 0, 12, 2, '#e2577a'); R(g, 7, -1 + 1, 2, 1, '#e2577a'); }
    if (P.chef) { R(g, 3, 0, 10, 2, '#ffffff'); R(g, 4, -1 + 1, 8, 1, '#ffffff'); }
    outline(c);
    return (SPR[k] = c);
  }
  function birdSprite(fr) {
    return spr('bird' + fr, 8, 7, (g) => {
      R(g, 1, 3, 5, 3, '#9aa0aa'); R(g, 4, 1, 3, 3, '#8a90a0'); R(g, 6, 2, 1, 1, '#e8a03a'); R(g, 5, 2, 1, 1, INK); R(g, 2, 6, 1, 1, '#e88a8a'); R(g, 4, 6, 1, 1, '#e88a8a');
      if (fr) { R(g, 0, 0, 3, 3, '#b0b6c0'); }
    });
  }

  /* =================================================================
     Mapes
     ================================================================= */
  const T_ = (s, a) => window.T(s, a);
  function blank(w, h, ch) { return Array.from({ length: h }, () => Array(w).fill(ch)); }
  function fill(G, x, y, w, h, ch) { for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) if (G[j] && G[j][i] != null) G[j][i] = ch; }
  function room(w, h, floor, exitX) {
    const G = blank(w, h, floor);
    fill(G, 0, 0, w, 2, 'W'); fill(G, 0, 0, 1, h, 'X'); fill(G, w - 1, 0, 1, h, 'X'); fill(G, 0, h - 1, w, 1, 'X');
    G[h - 1][exitX] = 'D';
    return G;
  }

  // Cada mapa defineix la quadrícula, els objectes fixos i les sortides
  const MAPS = {
    vic: {
      name: () => T_('Vic · Plaça Major'), outdoor: true,
      build() {
        const G = blank(44, 36, '.');
        fill(G, 19, 6, 6, 6, '=');          // carrer del nord
        fill(G, 13, 12, 18, 7, '=');        // plaça Major
        fill(G, 1, 19, 43, 2, '=');         // carrer principal (est-oest)
        fill(G, 19, 21, 6, 10, '=');        // carrer del sud
        fill(G, 2, 27, 40, 2, '=');         // carrer de baix
        fill(G, 0, 31, 44, 2, 'w');         // riu Mèder
        fill(G, 21, 31, 2, 2, 'b');         // pont
        fill(G, 1, 33, 42, 2, '=');         // passeig del riu
        [[2, 22], [3, 23], [16, 22], [17, 23], [36, 13], [37, 12], [25, 22], [26, 23], [9, 33], [34, 34], [40, 10], [11, 11], [3, 11], [28, 2], [6, 30]].forEach(([x, y]) => { if (G[y] && G[y][x] === '.') G[y][x] = ','; });
        const O = [];
        const tree = (x, y, k) => O.push({ t: k || 'tree', x, y, solid: true });
        for (let x = 0; x < 44; x++) { if (x < 16 || x > 27) tree(x, 0, x % 3 ? 'tree' : 'pine'); tree(x, 35); }
        for (let y = 1; y < 35; y++) { if (y < 31 || y > 32) { if (!(y === 19 || y === 20 || y === 33 || y === 34)) tree(0, y); if (!(y === 19 || y === 20)) tree(43, y, y % 2 ? 'pine' : 'tree'); } }
        [[2, 3], [8, 2], [11, 5], [33, 3], [36, 6], [39, 3], [41, 7], [30, 4], [2, 12], [12, 14], [36, 12], [42, 12], [1, 24], [2, 25], [17, 24], [24, 24], [41, 23], [13, 22], [5, 29], [37, 29], [12, 29], [30, 29], [2, 30], [42, 30], [5, 33], [16, 34], [30, 34], [38, 33]].forEach(([x, y]) => { if (G[y][x] === '.' || G[y][x] === ',') tree(x, y, (x + y) % 4 ? 'tree' : 'pine'); });
        [[18, 6], [25, 6], [13, 18], [30, 18], [18, 26], [25, 26], [20, 30], [23, 30]].forEach(([x, y]) => O.push({ t: 'lamp', x, y, solid: true }));
        [[14, 13], [29, 13]].forEach(([x, y]) => O.push({ t: 'bench', x, y, solid: true }));
        O.push({ t: 'fountain', x: 21, y: 14, w: 2, h: 2, solid: true, anim: true, say: () => [['', T_('La font de la plaça. Hi ha monedes al fons... i un colom que et mira malament.')]] });
        O.push({ t: 'stall', arg: '#d63c3c', x: 15, y: 16, w: 2, solid: true, id: 'parada' });
        O.push({ t: 'stall', arg: '#2f9a6e', x: 26, y: 16, w: 2, solid: true, say: () => [['', T_('Parada de fruita i verdura. «Tot de proximitat», diu el cartell escrit a mà.')]] });
        O.push({ t: 'parasol', x: 25, y: 12, solid: false, deco: true }); O.push({ t: 'parasol', x: 29, y: 12, solid: false, deco: true });
        O.push({ t: 'tableCloth', x: 26, y: 13, solid: true, say: () => [['', T_('Taules de la terrassa del Bar de la Plaça. Totes buides.')]] });
        O.push({ t: 'tableCloth', x: 30, y: 13, solid: true, say: () => [['', T_('Una taula buida. Al bar del costat, la terrassa és plena de turistes.')]] });
        O.push({ t: 'bin', x: 24, y: 18, solid: true });
        // edificis
        const B = (o) => O.push(Object.assign({ t: 'building', solid: true }, o));
        B({ id: 'catedral', x: 16, y: 0, w: 12, h: 6, wall: '#e6dccb', roof: '#8a6a5a', kind: 'church', label: T_('⛪ Catedral'), say: () => [['', T_('La catedral de Vic. Diuen que les pintures de Sert hi són espectaculars.')]] });
        B({ id: 'forn', x: 13, y: 7, w: 5, h: 5, wall: '#f6ead2', roof: '#c8553d', awning: '#d63c3c', door: 2, label: T_('🥖 Forn de la Carme') });
        B({ id: 'bar', x: 25, y: 7, w: 6, h: 5, wall: '#f2dcc4', roof: '#a8473a', awning: '#2f9a6e', door: 2, label: T_('☕ Bar de la Plaça') });
        B({ id: 'oficina', x: 3, y: 14, w: 6, h: 5, wall: '#dfe8f5', roof: '#4a5a7a', door: 2, doorCol: '#3d6fb8', label: () => (S && S.upgrades && S.upgrades.rotul ? '✨ ' : '💼 ') + (S ? S.agency : ''), flag: true, awning: S && S.upgrades && S.upgrades.rotul ? '#3d6fb8' : null });
        B({ id: 'merceria', x: 9, y: 15, w: 4, h: 4, wall: '#f5e0ea', roof: '#b0506a', awning: '#e2577a', door: 1, label: T_('🧵 Merceria Montse') });
        B({ id: 'cansaladeria', x: 31, y: 14, w: 5, h: 5, wall: '#f4e6d0', roof: '#9a3a2a', awning: '#3f7a3a', door: 2, label: T_('🥓 Cansaladeria Núria') });
        B({ id: 'cimtrail', x: 37, y: 14, w: 5, h: 5, wall: '#e0e6ea', roof: '#3a4a5a', awning: '#d63c6b', door: 2, label: T_('🏔️ Cim Trail') });
        B({ id: 'escola', x: 3, y: 22, w: 7, h: 5, wall: '#f6efcf', roof: '#c8853d', door: 3, doorCol: '#2f9a6e', flag: true, label: T_('🏫 Escola') });
        B({ id: 'traspas', x: 11, y: 23, w: 5, h: 4, wall: '#d8d4cc', roof: '#7a6a5a', door: 2, shutter: true, label: T_('🔒 Es traspassa') });
        B({ id: 'cambra', x: 3, y: 4, w: 6, h: 5, wall: '#efe6d8', roof: '#5a4a7a', door: 2, doorCol: '#5a3fa0', flag: true, label: T_('🏛️ Cambra de Comerç') });
        B({ id: 'super', x: 26, y: 21, w: 8, h: 6, wall: '#f2f2f2', roof: '#d6a020', awning: '#2f6fc8', door: 3, doorCol: '#5ac8e8', label: T_('🛒 SuperPreu') });
        B({ id: 'estacio', x: 35, y: 21, w: 7, h: 6, wall: '#e8d8c0', roof: '#6a4a3a', door: 3, label: T_('🚆 Estació') });
        O.push({ t: 'sign', x: 10, y: 27, solid: true, id: 'perruqueriaSign', say: () => [['', T_('«Perruqueria Marisa» — fletxa cap al carrer de baix.')]] });
        O.push({ t: 'busstop', x: 26, y: 33, solid: true, id: 'bus' });
        O.push({ t: 'sign', x: 42, y: 18, solid: true, say: () => [['', T_('→ Recinte firal')]] });
        O.push({ t: 'car', arg: '#d63c3c', x: 34, y: 33, w: 2, solid: true, deco: true });
        return { G, O, warps: [{ x: 43, y: 19, to: 'fira', tx: 9, ty: 9 }, { x: 43, y: 20, to: 'fira', tx: 9, ty: 9 }] };
      }
    },
    oficina: {
      name: () => S ? S.agency : '', wall: '#e6eef8', floorCol: '#d1a46c',
      build() {
        const G = room(13, 10, '_', 6);
        const O = [
          { t: 'window', x: 1, y: 0, w: 2, solid: false, deco: true }, { t: 'window', x: 9, y: 0, w: 2, solid: false, deco: true },
          { t: 'whiteboard', x: 4, y: 0, w: 3, solid: false, deco: true, wall: true, id: 'pissarra' },
          { t: 'desk', x: 2, y: 3, w: 2, solid: true, id: 'ordinador' },
          { t: 'bookshelf', x: 10, y: 1, w: 2, h: 2, solid: true, id: 'prestatge' },
          { t: 'phone', x: 8, y: 2, solid: true, id: 'telefon' },
          { t: 'coffee', x: 11, y: 4, solid: true, say: () => [['', T_('La cafetera. Combustible oficial de l\'agència.')]] },
          { t: 'plant', x: 1, y: 2, solid: true }, { t: 'plant', x: 11, y: 8, solid: true },
          { t: 'rug', x: 5, y: 5, w: 3, h: 2, solid: false, deco: true, floor: true },
          { t: 'sofa', x: 8, y: 7, w: 2, solid: true, say: () => [['', T_('El sofà de les reunions informals amb els clients.')]] }
        ];
        const has = (id) => S && S.upgrades && S.upgrades[id];
        if (has('ordinador')) O.push({ t: 'register', x: 4, y: 3, solid: true, say: () => [['', T_('El segon monitor. Ara caben deu pestanyes i el quadre de comandament alhora.')]] });
        if (has('cafe')) O.push({ t: 'coffee', x: 11, y: 5, solid: true, say: () => [['', T_('La cafetera bona. Els clients sempre en repeteixen.')]] });
        if (has('mobles')) { O.push({ t: 'tableCloth', x: 6, y: 3, solid: true, say: () => [['', T_('La nova taula de reunions. Els clients grans s\'hi senten com a casa.')]] }); O.push({ t: 'plant', x: 1, y: 8, solid: true }); }
        if (has('webAg')) O.push({ t: 'poster', arg: '#7a5ac8', x: 8, y: 0, solid: false, deco: true, wall: true, say: () => [['', T_('Captura de la web de l\'agència amb els casos d\'èxit.')]] });
        if (has('patrocini')) O.push({ t: 'poster', arg: '#ee7b30', x: 3, y: 0, solid: false, deco: true, wall: true, say: () => [['', T_('La samarreta de l\'equip de bàsquet amb el logo de l\'agència. Signada!')]] });
        if (S && S.team.some(t => t.id === 'julia')) O.push({ t: 'desk', x: 2, y: 6, w: 2, solid: true, say: () => [['julia.n', T_('Els KPI d\'aquesta setmana ja són al tauler. Res de mètriques de vanitat, eh?')]] });
        if (S && S.team.some(t => t.id === 'berta')) O.push({ t: 'desk', x: 9, y: 4, w: 2, solid: true, say: () => [['berta.h', T_('Tinc tres propostes de campanya. Totes amb brief, t\'ho prometo.')]] });
        return { G, O, warps: [{ x: 6, y: 9, to: 'vic', tx: 5, ty: 19, dir: 'down' }] };
      }
    },
    forn: {
      name: () => T_('Forn de la Carme'), wall: '#f6ead2', floorCol: '#e8e0d0',
      build() {
        const G = room(11, 9, ':', 5);
        const O = [
          { t: 'window', x: 3, y: 0, w: 2, solid: false, deco: true },
          { t: 'oven', x: 8, y: 0, w: 2, h: 2, solid: true, anim: true, say: () => [['', T_('El forn de llenya. Fa una calor que enganxa i una olor que enamora.')]] },
          { t: 'breadCase', x: 1, y: 3, w: 4, solid: true, through: true },
          { t: 'register', x: 5, y: 3, solid: true, id: 'caixa' },
          { t: 'counter', x: 6, y: 3, w: 1, solid: true, through: true },
          { t: 'plant', x: 7, y: 2, solid: true },
          { t: 'shelfBread', x: 8, y: 2, w: 2, h: 2, solid: true, id: 'lleixa' },
          { t: 'tray', x: 9, y: 6, solid: true, id: 'fotos' },
          { t: 'plant', x: 1, y: 7, solid: true }
        ];
        return { G, O, warps: [{ x: 5, y: 8, to: 'vic', tx: 15, ty: 12, dir: 'down' }] };
      }
    },
    bar: {
      name: () => T_('Bar de la Plaça'), wall: '#f2dcc4', floorCol: '#d1a46c',
      build() {
        const G = room(11, 8, '_', 5);
        const O = [
          { t: 'counter', x: 1, y: 3, w: 5, solid: true, through: true },
          { t: 'coffee', x: 2, y: 1, solid: true }, { t: 'plant', x: 6, y: 2, solid: true }, { t: 'bookshelf', x: 7, y: 0, w: 2, h: 2, solid: true, say: () => [['', T_('Ampolles, trofeus de futbol i una foto del 1992.')]] },
          { t: 'tableCloth', x: 7, y: 4, solid: true }, { t: 'tableCloth', x: 9, y: 4, solid: true }, { t: 'tableCloth', x: 8, y: 6, solid: true },
          { t: 'poster', arg: '#2f9a6e', x: 5, y: 0, solid: false, deco: true, wall: true, say: () => [['', T_('La carta: només en català, sense fotos ni preus clars.')]] }
        ];
        return { G, O, warps: [{ x: 5, y: 7, to: 'vic', tx: 27, ty: 12, dir: 'down' }] };
      }
    },
    merceria: {
      name: () => T_('Merceria Montse'), wall: '#f5e0ea', floorCol: '#e8e0d0',
      build() {
        const G = room(9, 8, ':', 4);
        const O = [
          { t: 'counter', x: 1, y: 3, w: 4, solid: true, through: true }, { t: 'plant', x: 5, y: 2, solid: true },
          { t: 'bookshelf', x: 6, y: 0, w: 2, h: 2, solid: true, say: () => [['', T_('Centenars de bobines de fil de tots els colors. Un tresor.')]] },
          { t: 'rack', arg: '#e2577a', x: 6, y: 4, w: 2, solid: true, say: () => [['', T_('Roba arreglada esperant els clients. Cada peça té una etiqueta amb el nom.')]] }
        ];
        return { G, O, warps: [{ x: 4, y: 7, to: 'vic', tx: 10, ty: 19, dir: 'down' }] };
      }
    },
    cansaladeria: {
      name: () => T_('Cansaladeria Núria'), wall: '#f4e6d0', floorCol: '#e8e0d0',
      build() {
        const G = room(11, 9, ':', 5);
        const O = [
          { t: 'fridge', x: 7, y: 0, w: 2, h: 2, solid: true, say: () => [['', T_('Fuets, llonganisses i bulls. L\'orgull de Vic.')]] },
          { t: 'counter', x: 1, y: 3, w: 4, solid: true, through: true },
          { t: 'register', x: 5, y: 3, solid: true, id: 'llibreta' }, { t: 'plant', x: 6, y: 2, solid: true },
          { t: 'desk', x: 1, y: 6, w: 2, solid: true, id: 'ordiNuria' },
          { t: 'crates', x: 9, y: 4, solid: true }, { t: 'crates', x: 9, y: 6, solid: true }
        ];
        return { G, O, warps: [{ x: 5, y: 8, to: 'vic', tx: 33, ty: 19, dir: 'down' }] };
      }
    },
    cimtrail: {
      name: () => T_('Cim Trail'), wall: '#e0e6ea', floorCol: '#d1a46c',
      build() {
        const G = room(11, 9, '_', 5);
        const O = [
          { t: 'rack', arg: '#d63c6b', x: 1, y: 2, w: 2, solid: true, say: () => [['', T_('Jaquetes tècniques fetes a Osona. Les etiquetes diuen «Testat al Matagalls».')]] },
          { t: 'rack', arg: '#2f6fc8', x: 8, y: 2, w: 2, solid: true },
          { t: 'counter', x: 4, y: 4, w: 3, solid: true, through: true },
          { t: 'poster', arg: '#d63c6b', x: 5, y: 0, solid: false, deco: true, wall: true, id: 'instaPoster' },
          { t: 'plant', x: 9, y: 7, solid: true }
        ];
        return { G, O, warps: [{ x: 5, y: 8, to: 'vic', tx: 39, ty: 19, dir: 'down' }] };
      }
    },
    super: {
      name: () => T_('SuperPreu'), wall: '#f2f2f2', floorCol: '#e8eaee',
      build() {
        const G = room(15, 10, ':', 7);
        const O = [
          { t: 'aisle', arg: '#ff8fb3', x: 2, y: 3, w: 4, solid: true, say: () => [['', T_('Passadís de galetes i brioixeria industrial. Tot amb ofertes 3x2.')]] },
          { t: 'aisle', arg: '#7ac85a', x: 8, y: 3, w: 4, solid: true },
          { t: 'aisle', arg: '#5ac8e8', x: 2, y: 6, w: 4, solid: true },
          { t: 'breadCase', x: 10, y: 6, w: 3, solid: true, id: 'superForn' },
          { t: 'poster', arg: '#2f6fc8', x: 7, y: 0, solid: false, deco: true, wall: true, id: 'superHorari' },
          { t: 'register', x: 13, y: 8, solid: true }
        ];
        return { G, O, warps: [{ x: 7, y: 9, to: 'vic', tx: 29, ty: 27, dir: 'down' }] };
      }
    },
    fira: {
      name: () => T_('Recinte firal'), wall: '#e8e8f0', floorCol: '#cfd3dc',
      build() {
        const G = room(19, 11, ';', 9);
        const O = [
          { t: 'booth', arg: '#1d1b2b', x: 2, y: 2, w: 3, h: 2, solid: true, say: () => [['', T_('Estand de Vidal & Co.: pantalles gegants, cafè gratis i cinc persones amb americana.')]] },
          { t: 'booth', arg: '#2f9a6e', x: 7, y: 2, w: 3, h: 2, solid: true, say: () => [['', T_('Cooperativa agrícola d\'Osona. Busquen agència per a la nova marca de llet.')]] },
          { t: 'booth', arg: '#d6a020', x: 12, y: 2, w: 3, h: 2, solid: true, say: () => [['', T_('Estand d\'una empresa de software de gestió. Regalen bolis.')]] },
          { t: 'booth', arg: '#e2577a', x: 3, y: 6, w: 3, h: 2, solid: true, say: () => [['', T_('Una escola de cuina. Fan tastets i recullen correus amb un sorteig.')]] },
          { t: 'booth', arg: '#3d6fb8', x: 13, y: 6, w: 3, h: 2, solid: true, say: () => [['', T_('Una gestoria. «Digitalitza la teva empresa» en lletres enormes.')]] },
          { t: 'plant', x: 1, y: 9, solid: true }, { t: 'plant', x: 17, y: 9, solid: true }
        ];
        return { G, O, warps: [{ x: 9, y: 10, to: 'vic', tx: 42, ty: 19, dir: 'left' }] };
      }
    },
    tona: {
      name: () => T_('Tona'), outdoor: true,
      build() {
        const G = blank(26, 16, '.');
        fill(G, 0, 9, 26, 2, 'r'); fill(G, 0, 8, 26, 1, '-'); fill(G, 0, 11, 26, 1, '-');
        fill(G, 8, 7, 7, 1, '-'); fill(G, 17, 6, 8, 2, ';');
        const O = [];
        for (let x = 0; x < 26; x++) { O.push({ t: x % 3 ? 'tree' : 'pine', x, y: 0, solid: true }); if (x !== 3) O.push({ t: 'tree', x, y: 15, solid: true }); }
        for (let y = 1; y < 15; y++) if (y < 8 || y > 11) { O.push({ t: 'pine', x: 0, y, solid: true }); O.push({ t: 'tree', x: 25, y, solid: true }); }
        [[3, 3], [5, 5], [2, 13], [7, 13], [12, 13], [20, 13], [15, 3]].forEach(([x, y]) => O.push({ t: 'tree', x, y, solid: true }));
        O.push(Object.assign({ t: 'building', solid: true }, { id: 'restaurant', x: 8, y: 2, w: 7, h: 5, wall: '#f6e2c8', roof: '#b0503a', awning: '#d65a5a', door: 3, label: T_('🍽️ Can Jordi') }));
        O.push(Object.assign({ t: 'building', solid: true }, { id: 'nau1', x: 17, y: 1, w: 4, h: 5, wall: '#b8c0c8', roof: '#6a7a8a', label: T_('🏭 Polígon'), say: () => [['', T_('Naus del polígon. Al migdia en surten desenes de treballadors.')]] }));
        O.push(Object.assign({ t: 'building', solid: true }, { id: 'nau2', x: 21, y: 1, w: 4, h: 5, wall: '#c8ccd2', roof: '#5a6a7a', say: () => [['', T_('Transports Osona. Camions anant i venint tot el dia.')]] }));
        O.push({ t: 'tableCloth', x: 9, y: 12, solid: true, say: () => [['', T_('La terrassa de Can Jordi, buida. És dilluns.')]] });
        O.push({ t: 'tableCloth', x: 12, y: 12, solid: true, say: () => [['', T_('Cadires recollides. Dilluns i dimarts, poca feina.')]] });
        O.push({ t: 'busstop', x: 2, y: 7, solid: true, id: 'bus' });
        O.push({ t: 'car', arg: '#3d6fb8', x: 19, y: 7, w: 2, solid: true, deco: true });
        return { G, O, warps: [] };
      }
    },
    restaurant: {
      name: () => T_('Can Jordi'), wall: '#f6e2c8', floorCol: '#d1a46c',
      build() {
        const G = room(13, 10, '_', 6);
        const O = [
          { t: 'counter', x: 1, y: 3, w: 3, solid: true, through: true },
          { t: 'phone', x: 4, y: 3, solid: true, id: 'telJordi' }, { t: 'plant', x: 4, y: 2, solid: true },
          { t: 'poster', arg: '#e2577a', x: 6, y: 0, solid: false, deco: true, wall: true, id: 'instaJordi' },
          { t: 'whiteboard', x: 8, y: 0, w: 3, solid: false, deco: true, wall: true, id: 'pissarraMenu' },
          { t: 'tableCloth', x: 6, y: 4, solid: true }, { t: 'tableCloth', x: 9, y: 4, solid: true }, { t: 'tableCloth', x: 6, y: 7, solid: true }, { t: 'tableCloth', x: 9, y: 7, solid: true },
          { t: 'oven', x: 1, y: 0, w: 2, h: 2, solid: true, anim: true }
        ];
        return { G, O, warps: [{ x: 6, y: 9, to: 'tona', tx: 11, ty: 7, dir: 'down' }] };
      }
    },
    gurb: {
      name: () => T_('Polígon de Gurb'), outdoor: true,
      build() {
        const G = blank(24, 15, ';');
        fill(G, 0, 9, 24, 2, 'r'); fill(G, 0, 11, 24, 4, '.'); fill(G, 0, 0, 24, 1, '.');
        const O = [];
        for (let x = 0; x < 24; x++) { O.push({ t: 'pine', x, y: 0, solid: true }); if (x !== 2) O.push({ t: 'tree', x, y: 14, solid: true }); }
        for (let y = 1; y < 14; y++) if (y < 9 || y > 10) { O.push({ t: 'pine', x: 0, y, solid: true }); O.push({ t: 'pine', x: 23, y, solid: true }); }
        O.push(Object.assign({ t: 'building', solid: true }, { id: 'fabrica', x: 5, y: 2, w: 9, h: 6, wall: '#c8d0d8', roof: '#4a5a6a', door: 4, doorCol: '#2f4a6d', label: T_('⚙️ Mecanitzats Bellmunt'), flag: true }));
        O.push(Object.assign({ t: 'building', solid: true }, { id: 'nau3', x: 16, y: 2, w: 6, h: 6, wall: '#b8c0c8', roof: '#6a7a8a', say: () => [['', T_('Una nau de logística. Un camió descarrega palets.')]] }));
        O.push({ t: 'crates', x: 15, y: 8, solid: true }); O.push({ t: 'crates', x: 4, y: 8, solid: true });
        O.push({ t: 'busstop', x: 2, y: 8, solid: true, id: 'bus' });
        return { G, O, warps: [] };
      }
    },
    fabrica: {
      name: () => T_('Mecanitzats Bellmunt'), wall: '#d8dde2', floorCol: '#a9adb3',
      build() {
        const G = room(15, 10, ';', 7);
        const O = [
          { t: 'machine', x: 1, y: 2, w: 2, h: 2, solid: true, anim: true, say: () => [['', T_('Un centre de mecanitzat CNC. Peces amb precisió de centèsimes de mil·límetre.')]] },
          { t: 'machine', x: 4, y: 2, w: 2, h: 2, solid: true, anim: true },
          { t: 'machine', x: 10, y: 2, w: 2, h: 2, solid: true, anim: true },
          { t: 'crates', x: 1, y: 6, solid: true }, { t: 'crates', x: 2, y: 6, solid: true },
          { t: 'desk', x: 11, y: 6, w: 2, solid: true, id: 'catalegBellmunt' },
          { t: 'poster', arg: '#2f4a6d', x: 7, y: 0, solid: false, deco: true, wall: true, say: () => [['', T_('Certificat ISO 9001. Al costat, una foto de l\'avi Bellmunt amb la primera màquina, el 1968.')]] }
        ];
        return { G, O, warps: [{ x: 7, y: 9, to: 'gurb', tx: 9, ty: 8, dir: 'down' }] };
      }
    }
  };
  // Portes dels edificis exteriors → interiors
  const DOORS = {
    forn: { to: 'forn', tx: 5, ty: 7 }, bar: { to: 'bar', tx: 5, ty: 6 }, oficina: { to: 'oficina', tx: 6, ty: 8 }, merceria: { to: 'merceria', tx: 4, ty: 6 },
    cansaladeria: { to: 'cansaladeria', tx: 5, ty: 7 }, cimtrail: { to: 'cimtrail', tx: 5, ty: 7 }, super: { to: 'super', tx: 7, ty: 8 },
    restaurant: { to: 'restaurant', tx: 6, ty: 8 }, fabrica: { to: 'fabrica', tx: 7, ty: 8 }
  };

  function loadMap(id) {
    const def = MAPS[id];
    const m = { id, def, wall: def.wall, floorCol: def.floorCol, outdoor: !!def.outdoor };
    map = m; // tileGround consulta el mapa actual
    const b = def.build();
    m.grid = b.G; m.h = b.G.length; m.w = b.G[0].length; m.objs = b.O.filter(o => !o.hidden); m.warps = b.warps || [];
    m.solid = blank(m.w, m.h, false);
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if ('wWX'.includes(m.grid[y][x])) m.solid[y][x] = true;
    m.objs.forEach(o => {
      o.w = o.w || 1; o.h = o.h || 1;
      if (o.t === 'building') {
        o.sprite = buildingSprite(o);
        for (let j = 0; j < o.h; j++) for (let i = 0; i < o.w; i++) m.solid[o.y + j] && (m.solid[o.y + j][o.x + i] = true);
        if (o.door != null) {
          const dx = o.x + o.door, dy = o.y + o.h - 1;
          m.solid[dy][dx] = false;
          if (DOORS[o.id]) m.warps.push(Object.assign({ x: dx, y: dy, door: o.id }, DOORS[o.id]));
          else m.warps.push({ x: dx, y: dy, closed: o.id });
        }
      } else if (o.solid) {
        // els objectes alts (prestatges, nevera...) només ocupen la fila de baix
        const rows = o.wall ? 0 : Math.max(1, o.h === 2 && !o.tall ? 1 : o.h);
        const y0 = o.y + o.h - rows;
        for (let j = 0; j < rows; j++) for (let i = 0; i < o.w; i++) if (m.solid[y0 + j]) m.solid[y0 + j][o.x + i] = true;
        if (o.h === 2 && !o.wall) for (let i = 0; i < o.w; i++) if (m.solid[o.y]) m.solid[o.y][o.x + i] = true;
      }
    });
    // rajoles pre-dibuixades (dues fases per a l'aigua)
    m.ground = [0, 1].map(ph => {
      const [c, g] = mk(m.w * TS, m.h * TS);
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) tileGround(g, m.grid[y][x], x, y, ph);
      m.objs.filter(o => o.floor || (o.wall && o.deco)).forEach(o => g.drawImage(objSprite(o, ph), o.x * TS, o.y * TS));
      return c;
    });
    return m;
  }
  function objSprite(o, ph) {
    const f = OBJ[o.t];
    if (o.t === 'building') return o.sprite;
    if (!f) return null;
    if (o.anim || o.t === 'fountain' || o.t === 'oven' || o.t === 'machine') return f(ph || 0);
    return f(o.arg != null ? o.arg : o.w);
  }

  /* =================================================================
     Contingut: personatges, pistes, botiguers i accions
     ================================================================= */
  const st = () => S.world;
  const done = (c) => !!S.done[c];
  const stageDone = (n) => GD.stages[n - 1].chapters.every(done);
  const unlock = {
    tona: () => stageDone(1) || done('1.5'),
    gurb: () => done('2.1'),
    fira: () => stageDone(2)
  };

  // Pistes que es poden descobrir explorant: activen la mateixa informació que les preguntes dels capítols
  const CLUES = () => ({
    google: { flag: 'f_google', who: 'carme', t: T_('La fitxa de Google del forn diu que tanca a les 14 h: molta gent creu que a la tarda és tancat.') },
    lleixa: { flag: 'f_producte', who: 'carme', t: T_('A la tarda, la lleixa és plena de coca de vidre i pa de motlle sense vendre.') },
    caixa: { flag: 'f_hores', who: 'carme', t: T_('Els tiquets de caixa: el 72 % de les vendes són al matí. Dimarts i dimecres a la tarda gairebé no es ven res.') },
    superForn: { flag: 'f_canvi', who: 'carme', t: T_('El supermercat nou ven barres a 0,59 € i obre fins a les 21 h.') },
    escola: { flag: 'f_canvi', who: 'carme', t: T_('L\'escola ara surt a les 16:30, mitja hora abans: les famílies ja no passen pel forn a l\'hora de berenar.') },
    avia: { flag: 'f_clients', who: 'carme', t: T_('Al matí hi va la gent gran del barri; a la tarda hi passaven sobretot les famílies de l\'escola.') },
    jordiFitxa: { flag: 'r_fitxa', who: 'jordi', t: T_('A Google, Can Jordi no mostra el menú de migdia ni té botó de reserva, i hi ha ressenyes sense resposta.') },
    jordiPublic: { flag: 'r_public', who: 'jordi', t: T_('Al polígon de Tona, a 3 minuts del restaurant, hi treballen centenars de persones que dinen entrepans.') },
    jordiTel: { flag: 'r_reserves', who: 'jordi', t: T_('Al migdia el telèfon sona i ningú no el pot agafar: només es pot reservar per telèfon.') },
    jordiInsta: { flag: 'r_xarxes', who: 'jordi', t: T_('L\'Instagram de Can Jordi té 1.900 seguidors, la majoria de Barcelona, que només hi van el cap de setmana.') },
    nuriaMobil: { flag: 'd_mobil', who: 'nuria', t: T_('Una clienta no pot pagar des del seu mòbil Android: el botó de pagar no respon.') },
    nuriaLlibreta: { flag: 'd_real', who: 'nuria', t: T_('La llibreta de comandes: 31 comandes en línia aquest mes, totes des d\'ordinador.') },
    nuriaOrdi: { flag: 'd_track', who: 'nuria', t: T_('A l\'ordinador de la botiga: l\'etiqueta de compra va desaparèixer en l\'última actualització de la web.') }
  });
  function findClue(id, lines) {
    const c = CLUES()[id];
    if (!st().clues[id]) {
      st().clues[id] = true; S.f[c.flag] = true; S.f['wclue_' + c.flag] = true;
      API.applyFx({ xp: 10 }, true); API.save();
      return (lines || []).concat([['', '🔍 ' + T_('Pista nova per a {0}: {1}', [GD.names[c.who] || '', c.t])]]);
    }
    return lines;
  }

  // Botiguers amb problemes: petits encàrrecs de consultoria (els errors costen diners)
  const PROBLEMS = () => ({
    montse: {
      who: 'montse', name: T_('Montse'), place: T_('Merceria Montse'),
      intro: [['montse.n', T_('Fa trenta anys que faig arreglos de roba, però la gent jove no sap ni que existeixo. I no tinc gaires diners per gastar.')]],
      opts: [
        { t: T_('Fitxa de Google amb el servei d\'arreglos, fotos d\'abans i després i un cartell a l\'aparador'), money: 180, rep: 2, r: T_('En dues setmanes, 14 encàrrecs nous de gent que la va trobar a Google Maps. La Montse et paga 180 € i et recomana a tot el carrer.') },
        { t: T_('Repartir 2.000 fullets per tot Vic'), money: -120, rep: -1, r: T_('Gairebé ningú no es fixa en els fullets i no arriba cap client nou. Has avançat 120 € d\'impremta que no recuperaràs.') },
        { t: T_('Obrir un compte de TikTok i publicar-hi cada dia'), money: 40, rep: 0, r: T_('Dos vídeos funcionen, però la Montse no té temps de mantenir-ho. Et paga 40 € per la feina.') }
      ]
    },
    bar: {
      who: 'baltasar', name: T_('Baltasar'), place: T_('Bar de la Plaça'),
      intro: [['baltasar.n', T_('Tinc la millor terrassa de la plaça, però els turistes s\'asseuen al bar del costat. No ho entenc!')]],
      opts: [
        { t: T_('Fitxa de Google amb fotos de la terrassa, carta en anglès i francès i horari de cuina'), money: 220, rep: 2, r: T_('Els turistes busquen «terrace Vic» al mòbil i ara el troben. La terrassa s\'omple i el Baltasar et paga 220 €.') },
        { t: T_('Posar un cambrer a la plaça per captar clients'), money: -150, rep: -1, r: T_('Els turistes se senten pressionats i passen de llarg. Has pagat 150 € del sou d\'una setmana.') },
        { t: T_('Fer una oferta de 2x1 en cerveses'), money: 50, rep: 0, r: T_('Ve més gent, però el marge és mínim i no repeteixen. Et paga 50 €.') }
      ]
    },
    parada: {
      who: 'roser', name: T_('Roser'), place: T_('Parada de formatges'),
      intro: [['roser.n', T_('Al mercat del dissabte venc molt. Entre setmana, res. I la gent de Barcelona em pregunta si envio formatges.')]],
      opts: [
        { t: T_('Comandes per WhatsApp Business amb catàleg, i recollida o enviament local'), money: 200, rep: 2, r: T_('Les comandes d\'entre setmana arriben pel WhatsApp i ja envia a Barcelona. La Roser et paga 200 €.') },
        { t: T_('Llogar un local a Barcelona'), money: -300, rep: -1, r: T_('La fiança i el primer mes de lloguer es mengen tot el benefici. T\'havies compromès a pagar-ne una part: −300 €.') },
        { t: T_('Vendre a Amazon'), money: 40, rep: 0, r: T_('Comissions altes i guerra de preus. Ven poc. Et paga 40 €.') }
      ]
    },
    marisa: {
      who: 'marisa', name: T_('Marisa'), place: T_('Perruqueria Marisa'),
      intro: [['marisa.n', T_('Perdo cites! Em demanen hora pel WhatsApp mentre tallo i m\'oblido de contestar.')]],
      opts: [
        { t: T_('Reserva en línia amb recordatoris automàtics, enllaçada des d\'Instagram i Google'), money: 160, rep: 2, r: T_('Les cites es reserven soles i ja no se n\'oblida cap. La Marisa et paga 160 €.') },
        { t: T_('Contractar una recepcionista només per al WhatsApp'), money: -250, rep: -1, r: T_('Massa cost per a un negoci petit. Li havies recomanat una empresa de selecció i has de pagar 250 € de la comissió.') },
        { t: T_('Contestar els missatges a la nit'), money: 30, rep: 0, r: T_('Funciona, però la Marisa acaba esgotada. Et paga 30 €.') }
      ]
    }
  });
  const TOWNS = {
    montse: { hair: '#c8c8d0', skin: '#f3d0b4', eye: '#3a2a20', cloth: '#b0506a', style: 'bun', acc: ['glassesRound'], apron: false, pants: '#4a3a5a' },
    baltasar: { hair: '#3a2a20', skin: '#e8be9c', eye: '#3a2a20', cloth: '#ffffff', style: 'buzz', acc: [], apron: true, pants: '#2a2a2a' },
    roser: { hair: '#a3451f', skin: '#f6d6bf', eye: '#3a2a20', cloth: '#f2b134', style: 'pony', acc: [], apron: true, pants: '#3a4a6a' },
    marisa: { hair: '#7a1f3d', skin: '#f6d8c8', eye: '#3a2a20', cloth: '#1d1b2b', style: 'long', acc: ['earrings'], pants: '#1d1b2b' },
    avia: { hair: '#e6e6ea', skin: '#f3d0b4', eye: '#3a2a20', cloth: '#7a5ac8', style: 'bun', acc: [], pants: '#4a3a5a' },
    veina: { hair: '#5a3b2a', skin: '#f6d6bf', eye: '#3a2a20', cloth: '#2f9a6e', style: 'bob', acc: [], pants: '#3a4a6a' },
    pare: { hair: '#26313f', skin: '#eec7a6', eye: '#3a2a20', cloth: '#d65a5a', style: 'neat', acc: [], pants: '#3a4a6a' },
    turista: { hair: '#e9c25a', skin: '#fae3d3', eye: '#3a2a20', cloth: '#5ac8e8', style: 'spiky', acc: ['sunglasses'], pants: '#e6d2b0' },
    obrer: { hair: '#4a2f22', skin: '#e8be9c', eye: '#3a2a20', cloth: '#f2b134', style: 'buzz', acc: [], pants: '#2f4a6d' },
    caixera: { hair: '#151320', skin: '#f2cfb3', eye: '#3a2a20', cloth: '#2f6fc8', style: 'pony', acc: [], pants: '#2a2a2a' },
    jaume: { hair: '#9aa0a8', skin: '#efcdb2', eye: '#3a2a20', cloth: '#6a7a8a', style: 'neat', acc: ['glassesRect'], pants: '#3a3a3a' },
    clienta: { hair: '#e2577a', skin: '#fbe1cf', eye: '#3a2a20', cloth: '#ffffff', style: 'wavy', acc: [], pants: '#3a4a6a' },
    nen: { hair: '#4a2f22', skin: '#f8dcc6', eye: '#3a2a20', cloth: '#ffcf4a', style: 'spiky', acc: [], pants: '#3d6fb8' }
  };

  // On comença cada capítol segons el seu escenari
  const SPOTS = {
    vic: ['vic', 21, 17], despatx: ['oficina', 6, 5], oficina: ['oficina', 6, 5], franca: ['oficina', 6, 5], forn: ['forn', 4, 5],
    restaurant: ['restaurant', 3, 5], fabrica: ['fabrica', 7, 5], botiga: ['cansaladeria', 5, 5], fira: ['fira', 9, 5], barcelona: ['vic', 38, 28]
  };
  const HOME = { carme: ['forn', 3, 2, 'down'], jordi: ['restaurant', 2, 2, 'down'], nuria: ['cansaladeria', 3, 2, 'down'], sergi: ['cimtrail', 5, 3, 'down'], miquel: ['fabrica', 8, 6, 'left'] };
  function chapterSpot(ch) { const k = String(ch.bg || 'despatx').split(':')[0]; return SPOTS[k] || SPOTS.despatx; }

  // Objectiu actual: el capítol obert o el projecte que el bloqueja
  function objective() {
    const ids = Object.keys(GD.chapters);
    const open = ids.find(c => API.chapterState(c) === 'open');
    if (open) {
      const ch = GD.chapters[open], [m, x, y] = chapterSpot(ch);
      return { kind: 'ch', id: open, who: ch.who || 'pau', map: m, x, y, text: T_('Capítol {0}: {1}', [open, API.txt(ch.title)]) };
    }
    const gc = ids.find(c => API.chapterState(c) === 'proj');
    if (gc) {
      const p = API.projGate(gc), h = HOME[p.who] || ['oficina', 7, 4, 'down'];
      return { kind: 'proj', id: p.id, who: p.who, map: h[0], x: h[1], y: h[2], status: API.projStatus(p), text: T_('Projecte real: {0}', [API.txt(p.title)]) };
    }
    const lv = ids.find(c => API.chapterState(c) === 'level');
    if (lv) return { kind: 'level', id: lv, text: T_('Arriba al nivell {0} per continuar: ajuda els botiguers de Vic o fes encàrrecs.', [GD.stages[GD.chapters[lv].stage - 1].minLevel]) };
    return null;
  }

  function buildNpcs() {
    const L = [];
    const add = (o) => L.push(Object.assign({ dir: 'down', frame: 0, mv: 0 }, o, { home: [o.x, o.y] }));
    const obj = objective();
    const placed = new Set();
    if (obj && (obj.kind === 'ch' || obj.kind === 'proj') && obj.map === map.id) {
      placed.add(obj.who);
      if (obj.who === 'pau') add({ id: 'marker', marker: true, x: obj.x, y: obj.y, bubble: '❗', act: () => askChapter(obj.id) });
      else add({ id: obj.who, x: obj.x, y: obj.y, bubble: obj.kind === 'ch' ? '❗' : '📋', act: () => obj.kind === 'ch' ? askChapter(obj.id) : API.projectScreen(obj.id) });
    }
    Object.entries(HOME).forEach(([who, [m, x, y, dir]]) => {
      if (m !== map.id || placed.has(who) || !metOrLocal(who)) return;
      add({ id: who, x, y, dir, act: () => talkHome(who) });
    });
    const P = PROBLEMS(), sol = st().problems;
    const prob = (id, x, y, dir) => add({ id: P[id].who, pal: TOWNS[P[id].who], x, y, dir, bubble: sol[id] ? null : '❗', act: () => problem(id) });
    if (map.id === 'merceria') prob('montse', 2, 2, 'down');
    if (map.id === 'bar') prob('bar', 3, 2, 'down');
    if (map.id === 'vic') {
      prob('parada', 16, 17, 'down'); prob('marisa', 9, 28, 'down');
      add({ id: 'avia', pal: TOWNS.avia, x: 17, y: 14, wander: 2, act: () => say(findClue('avia', [['avia.n', T_('Jo vaig al forn de la Carme cada matí, com fa quaranta anys. A la tarda? A la tarda hi passaven les famílies de l\'escola, però ara ja no.')]])) });
      add({ id: 'veina', pal: TOWNS.veina, x: 14, y: 12, dir: 'up', act: () => say(findClue('google', [['veina.n', T_('Volia pa per berenar, però Google diu que el forn de la Carme tanca a les dues. Llàstima, hauré d\'anar al súper.')]])) });
      add({ id: 'turista', pal: TOWNS.turista, x: 28, y: 15, wander: 2, act: () => say([['turista.n', T_('Excuse me! Is there a nice terrace around here? On Google Maps I only find the other bar...')]]) });
      add({ id: 'jaume', pal: TOWNS.jaume, x: 13, y: 27, dir: 'up', act: () => say([['jaume.n', T_('Aquí hi havia la meva botiga de joguines. Trenta-dos anys. Quan van arribar les compres en línia, no vaig voler canviar res...')], ['jaume.n', T_('Si ho tornés a fer, escoltaria més què volien els clients. Tu que fas màrqueting, no deixis que els passi als altres.')]]) });
      add({ id: 'pare', pal: TOWNS.pare, x: 7, y: 28, wander: 1, act: () => say(st().actions.cupons ? [['pare.h', T_('Gràcies pel cupó del berenar! Els nens ja el demanen cada dimarts.')]] : [['pare.n', T_('Ara l\'escola surt a dos quarts de cinc i anem directes al parc. Abans passàvem pel forn.')]]) });
      add({ id: 'nen', pal: TOWNS.nen, x: 21, y: 25, wander: 3, act: () => say([['nen.h', T_('Saps que al súper venen croissants a 30 cèntims? Són de plàstic, però són barats!')]]) });
      if (done('6.1')) add({ id: 'marta', x: 37, y: 28, dir: 'up', act: () => say([['marta.n', T_('Agafo el tren cap a Barcelona. Els informes, el dilluns a primera hora, d\'acord?')]]) });
    }
    if (map.id === 'super') {
      add({ id: 'caixera', pal: TOWNS.caixera, x: 13, y: 7, dir: 'left', act: () => say([['caixera.n', T_('Obrim fins a les nou del vespre, cada dia. A la tarda ve molta gent a buscar pa de barra.')]]) });
      add({ id: 'clienta', pal: TOWNS.clienta, x: 7, y: 6, wander: 2, act: () => say([['clienta.n', T_('El pa d\'aquí no és com el del forn, però a les set del vespre és l\'únic lloc obert.')]]) });
    }
    if (map.id === 'forn') add({ id: 'clientaForn', pal: TOWNS.avia, x: 3, y: 6, dir: 'up', act: () => say([['avia.h', T_('La coca de llardons de la Carme és la millor de Vic. Però això, a internet, no ho diu enlloc.')]]) });
    if (map.id === 'bar') { add({ id: 'turista', pal: TOWNS.turista, x: 8, y: 5, dir: 'up', act: () => say([['turista.n', T_('No menu in English... I\'ll just point at something.')]]) }); }
    if (map.id === 'tona') add({ id: 'obrer', pal: TOWNS.obrer, x: 19, y: 8, wander: 2, act: () => say(findClue('jordiPublic', [['obrer.n', T_('Entrepà a la nau cada dia. A Can Jordi? Sí que està bé, però no sabia que fessin menú entre setmana.')]])) });
    if (map.id === 'restaurant') add({ id: 'comensal', pal: TOWNS.pare, x: 7, y: 5, dir: 'left', act: () => say([['pare.n', T_('Sóc dels pocs que venen un dilluns. Treballo al polígon i ho vaig descobrir per casualitat.')]]) });
    if (map.id === 'cansaladeria' && done('4.5')) add({ id: 'clientaAndroid', pal: TOWNS.clienta, x: 7, y: 5, dir: 'up', act: () => say(findClue('nuriaMobil', [['clienta.a', T_('He intentat comprar fuets per internet amb el mòbil i el botó de pagar no fa res! He hagut de venir a la botiga.')]])) });
    if (map.id === 'fira' && stageDone(2)) add({ id: 'laia', x: 4, y: 4, dir: 'down', act: () => say([['laia.n', T_('Benvinguda a la fira, competència. Aquí es guanyen els clients que no surten a Google.')]]) });
    if (map.id === 'oficina' && S.upgrades && S.upgrades.becari) add({ id: 'becari', pal: TOWNS.nen, x: 9, y: 5, wander: 1, act: () => say([['becari.h', T_('Ja he programat les publicacions de la setmana! Què més puc fer?')]]) });
    if (map.id === 'oficina' && S.upgrades && S.upgrades.comercial) add({ id: 'comercialAg', pal: TOWNS.pare, x: 4, y: 7, dir: 'right', act: () => say([['comercialAg.n', T_('Tinc tres reunions aquesta setmana amb empreses del polígon. Les propostes, a l\'ordinador.')]]) });
    if (map.id === 'fabrica') add({ id: 'obrerF', pal: TOWNS.obrer, x: 3, y: 5, wander: 1, act: () => say([['obrer.n', T_('Fem peces per a màquines agrícoles de mitja Europa. Però la web... la va fer el nebot del gerent el 2011.')]]) });
    return L;
  }
  function metOrLocal(who) { return who === 'carme' || S.f['met_' + who] || done({ jordi: '2.1', nuria: '2.3', sergi: '2.4', miquel: '2.2' }[who] || 'x'); }

  /* =================================================================
     Interaccions
     ================================================================= */
  function say(lines, then) { dialog(lines, then); }
  function askChapter(id) {
    const ch = GD.chapters[id];
    menu(T_('Capítol {0}: {1}', [id, API.txt(ch.title)]) + '\n' + API.txt(ch.blurb || ''), [
      { t: T_('▶ Començar la missió'), fn: () => { close(); API.startChapter(id); } },
      { t: T_('Encara no'), fn: () => { } }
    ]);
  }
  function talkHome(who) {
    const lines = {
      carme: [['carme.h', T_('Passa, passa! Avui la coca de vidre ha sortit boníssima.')]],
      jordi: [['jordi.n', T_('Dilluns, menjador mig buit... Si saps com omplir-lo, et convido a dinar.')]],
      nuria: [['nuria.h', T_('El fuet de Vic de tota la vida! Ara també l\'enviem a tot Catalunya.')]],
      sergi: [['sergi.n', T_('Mira quina jaqueta nova. Ja tinc la foto per a Instagram... o millor primer mirem les vendes, oi?')]],
      miquel: [['miquel.n', T_('Aquí no es parla de seguidors. Es parla de peces, terminis i compradors.')]]
    }[who] || [[who + '.n', T_('Hola!')]];
    const acts = ACTIONS().filter(a => a.who === who && a.avail() && !st().actions[a.id]);
    if (!acts.length) return say(lines);
    say(lines, () => menu(T_('Què vols fer?'), acts.map(a => ({ t: a.label, fn: a.run })).concat([{ t: T_('Res, gràcies'), fn: () => { } }])));
  }
  function problem(id) {
    const p = PROBLEMS()[id];
    if (st().problems[id]) return say([[p.who + '.h', T_('Gràcies pel consell! El negoci va millor.')]]);
    say(p.intro, () => menu(T_('Què li recomanes?'), p.opts.map(o => ({
      t: o.t, fn: () => {
        st().problems[id] = o.money > 0 && o.rep > 0 ? 'ok' : o.money > 0 ? 'mig' : 'ko';
        API.applyFx({ money: o.money, fee: o.money > 0, rep: o.rep, xp: o.money > 100 ? 40 : 15, log: T_('Va aconsellar {0} ({1}): {2}', [p.name, p.place, o.t]) }, true);
        API.save();
        say([[p.who + (o.money > 100 ? '.h' : o.money < 0 ? '.a' : '.n'), o.r]], () => { API.toast((o.money >= 0 ? '+' : '') + API.eur(o.money) + (o.rep ? ` · ${o.rep > 0 ? '+' : ''}${o.rep} ⭐` : ''), o.money >= 0 ? 'good' : 'bad'); API.hudRefresh(); if (API.bankrupt()) close(); });
      }
    }))));
  }

  // Objectes amb què es pot interactuar
  function objectAct(o) {
    const id = o.id;
    if (o.t === 'building' && o.say) return say(o.say());
    if (o.say) return say(o.say());
    switch (id) {
      case 'ordinador': return menu(T_('💻 L\'ordinador de l\'agència'), [
        { t: T_('🗺️ Campanya i missions'), fn: () => openHub('campanya') }, { t: T_('📋 Projectes reals'), fn: () => openHub('projectes') },
        { t: T_('🛒 Millores de l\'agència'), fn: () => openHub('empresa') }, { t: T_('🏆 Classe: rànquing i mercat'), fn: () => openHub('classe') }, { t: T_('🛠️ Taller web'), fn: () => openHub('taller') }, { t: T_('🏢 Empresa i finances'), fn: () => openHub('empresa') }, { t: T_('Tancar'), fn: () => { } }]);
      case 'prestatge': return openHub('biblioteca');
      case 'telefon': return say([['', T_('El telèfon de l\'agència. Hi ha encàrrecs nous esperant.')]], () => openHub('encarrecs'));
      case 'pissarra': return notebook();
      case 'lleixa': return say(findClue('lleixa', [['', T_('La lleixa del pa. Ara, a la tarda, encara hi ha moltes coques de vidre i pans de motlle.')]]));
      case 'caixa': return say(findClue('caixa', [['', T_('La caixa enregistradora. Els tiquets del mes mostren les vendes per hores.')]]));
      case 'fotos': return photoAction();
      case 'superForn': return say(findClue('superForn', [['', T_('«Barra de pa: 0,59 €. Pa acabat de fer fins a les 21 h.»')]]));
      case 'superHorari': return say([['', T_('«SuperPreu. Obert cada dia de 8 a 21 h.»')]]);
      case 'telJordi': return say(findClue('jordiTel', [['', T_('Ring, ring... El telèfon sona i sona. A la cuina, ningú no el pot agafar.')]]));
      case 'instaJordi': return say(findClue('jordiInsta', [['', T_('Un cartell: «Segueix-nos a Instagram: @canjordi_tona». 1.900 seguidors... la majoria de Barcelona.')]]));
      case 'pissarraMenu': return say(findClue('jordiFitxa', [['', T_('A la pissarra hi ha un menú de migdia boníssim a 13 €. Al mòbil, però, Google no en diu res: ni menú ni botó de reserva.')]]));
      case 'llibreta': return done('4.5') ? say(findClue('nuriaLlibreta', [['', T_('La llibreta de comandes en línia. Totes les compres d\'aquest mes vénen d\'ordinador.')]])) : say([['', T_('La caixa de la cansaladeria. Encara hi ha més tiquets de paper que de targeta.')]]);
      case 'ordiNuria': return done('4.5') ? say(findClue('nuriaOrdi', [['', T_('L\'ordinador de la botiga té obert el panell de la web.')]])) : say([['', T_('L\'ordinador de la botiga, amb l\'Excel de proveïdors obert.')]]);
      case 'instaPoster': return say([['', T_('«8.000 seguidors!», diu un cartell. A sota, en petit: «vendes del mes: ?»')]]);
      case 'catalegBellmunt': return say([['', T_('El catàleg de Mecanitzats Bellmunt: un PDF del 2011 sense fitxes tècniques descarregables.')]]);
      case 'bus': return busStop();
      case 'parada': return problem('parada');
    }
  }
  function warpBlocked(w) {
    if (w.closed === 'escola') return schoolGate();
    if (w.closed === 'traspas') return say([['', T_('«Es traspassa». La persiana està abaixada i plena de cartells vells.')]]);
    if (w.closed === 'estacio') return say([['', T_('L\'estació de tren. Cap a Barcelona cada hora.')]]);
    if (w.closed === 'cambra') return say([['', T_('La Cambra de Comerç d\'Osona. Al tauler hi ha el rànquing de les agències de la classe i les ofertes de col·laboració.')]], () => openHub('classe'));
    if (w.closed === 'catedral') return say([['', T_('La catedral és tancada a aquesta hora.')]]);
    if (w.to === 'fira' && !unlock.fira()) return say([['', T_('El recinte firal està tancat. Obrirà quan arribi la fira (etapa 3).')]]);
    return false;
  }
  function busStop() {
    const here = map.id;
    const dest = [['vic', T_('🏙️ Vic'), () => true], ['tona', T_('🍽️ Tona (Can Jordi)'), unlock.tona], ['gurb', T_('🏭 Polígon de Gurb (Bellmunt)'), unlock.gurb]].filter(d => d[0] !== here);
    menu(T_('🚌 Parada de bus. On vols anar?'), dest.map(([id, n, ok]) => ({
      t: ok() ? n : '🔒 ' + n, fn: () => {
        if (!ok()) return say([['', T_('Encara no tens cap motiu per anar-hi. Avança en la campanya.')]]);
        const spawn = { vic: [26, 34, 'up'], tona: [3, 8, 'down'], gurb: [2, 9, 'down'] }[id];
        go(id, spawn[0], spawn[1], spawn[2]);
      }
    })).concat([{ t: T_('Quedar-me aquí'), fn: () => { } }]));
  }

  /* --- Accions de màrqueting reals --- */
  const ACTIONS = () => [
    { id: 'fitxa', who: 'carme', label: T_('📍 Corregir la fitxa de Google del forn'), avail: () => done('1.2'), run: googleListing },
    { id: 'ressenyes', who: 'jordi', label: T_('⭐ Demanar ressenyes als comensals'), avail: () => done('2.1'), run: reviewsAction },
    { id: 'cartell', who: 'nuria', label: T_('🪧 Dissenyar el cartell de l\'aparador'), avail: () => done('2.3'), run: posterAction }
  ];
  function finishAction(id, score, max, fx, msg) {
    st().actions[id] = { score, max, at: S.week };
    API.applyFx(Object.assign({ log: msg }, fx), true); API.save(); API.hudRefresh();
    API.toast(`${score}/${max} · +${fx.xp || 0} EXP${fx.money ? ' · ' + (fx.money > 0 ? '+' : '') + API.eur(fx.money) : ''}`, score >= max * .7 ? 'good' : 'bad');
    if (API.bankrupt()) close();
  }
  function quiz(title, qs, onEnd) {
    let i = 0, score = 0;
    const next = () => {
      if (i >= qs.length) return onEnd(score);
      const q = qs[i];
      const ord = [...q.o.keys()].sort(() => Math.random() - 0.5);
      menu(`${title} (${i + 1}/${qs.length})\n${q.q}`, ord.map(k => ({ t: q.o[k], fn: () => {
        const ok = k === q.c; if (ok) score++;
        const cost = ok ? 0 : API.payStudy(title.replace(/^\S+\s/, ''));
        say([['', ok ? '✔ ' + q.why : '✘ −' + API.eur(cost) + ' · ' + q.why]], () => { API.hudRefresh(); if (!ok && API.bankrupt()) return close(); i++; next(); });
      } })), true);
    };
    next();
  }
  function googleListing() {
    quiz(T_('📍 Fitxa de Google del forn'), [
      { q: T_('Quin horari hi poses?'), o: [T_('De 7 a 14 h, com ara, i ja ho canviarem'), T_('De 7 a 14 h i de 16 a 20 h, i els festius a part'), T_('De 7 a 20 h seguit, per simplificar'), T_('De 16 a 20 h, que és la franja que volem promocionar')], c: 1, why: T_('El forn obre tarda i vespre: l\'horari ha de ser exacte, també els festius.') },
      { q: T_('Quina categoria principal tries?'), o: [T_('Pastisseria'), T_('Forn de pa'), T_('Cafeteria'), T_('Botiga d\'alimentació')], c: 1, why: T_('La categoria principal decideix en quines cerques apareix. «Forn de pa» és la correcta.') },
      { q: T_('Quina foto de portada poses?'), o: [T_('Una foto de la façana amb el rètol, perquè la gent trobi el forn'), T_('La coca de vidre i el pa a prop de la finestra, amb llum natural'), T_('Una foto de la Carme somrient darrere el taulell'), T_('Un collage amb tots els productes del forn')], c: 1, why: T_('Fotos reals, ben il·luminades i del producte estrella: són el que fa entrar la gent.') },
      { q: T_('Què publiques com a novetat?'), o: [T_('L\'oferta «Berenar de tarda»: coca + suc de 16 a 19 h'), T_('«Ara també obrim a la tarda!»'), T_('Una foto del pa del dia amb el preu'), T_('La història del forn des de 1980')], c: 0, why: T_('Una novetat amb oferta concreta i franja horària dona un motiu per venir a la tarda.') }
    ], (sc) => {
      S.f.f_google = true; S.f.fitxaFeta = sc;
      say([['carme.' + (sc >= 3 ? 'h' : 'n'), sc >= 3 ? T_('Mira! Ja surt que obrim a la tarda. Avui han vingut tres clientes que ho han vist al mòbil!') : T_('Bé... algunes coses no les tinc gaire clares. Ho revisarem.')]], () =>
        finishAction('fitxa', sc, 4, { xp: 15 * sc, rep: sc >= 3 ? 2 : 0, trust: sc >= 3 ? { carme: 1 } : null }, T_('Va corregir la fitxa de Google del forn ({0}/4).', [sc])));
    });
  }
  function photoAction() {
    if (st().actions.fotos) return say([['', T_('La safata buida. Les fotos ja són a la fitxa de Google.')]]);
    menu(T_('📸 Vols fer fotos dels productes per a la fitxa de Google. On les fas?'), [
      { t: T_('Al costat de la finestra, amb llum natural i fons de fusta'), fn: () => photoEnd(3) },
      { t: T_('Sota el fluorescent del taulell'), fn: () => photoEnd(1) },
      { t: T_('Amb el flaix del mòbil, ben a prop'), fn: () => photoEnd(0) }
    ]);
  }
  function photoEnd(q) {
    say([['', q === 3 ? T_('Clic! La coca brilla, el pa sembla acabat de sortir del forn. Fotos de catàleg.') : q === 1 ? T_('Les fotos surten verdoses i planes. Serveixen, però no fan venir gana.') : T_('El flaix crema la coca i fa ombres dures. Millor no penjar-les.')]], () =>
      finishAction('fotos', q, 3, { xp: 10 * q + 5, rep: q === 3 ? 1 : 0 }, T_('Va fer fotos de producte per al forn ({0}/3).', [q])));
  }
  function reviewsAction() {
    const tables = [
      { q: T_('Una parella acaba de dinar i somriu. Com els demanes una ressenya?'), o: [T_('«Si us ha agradat, ens ajudaria molt una ressenya: aquí teniu el QR.»'), T_('«Si ens poseu cinc estrelles, el cafè us el convidem.»'), T_('«Us enviarem un correu demà per demanar-vos l\'opinió.»'), T_('«Busqueu-nos a Google i poseu-nos una ressenya, si us plau.»')], c: 0, why: T_('Demanar-ho en el moment, amb el QR a mà, és honest i efectiu. Oferir regals a canvi de ressenyes va contra les normes de Google.') },
      { q: T_('Un client es queixa que el segon plat ha trigat molt.'), o: [T_('Disculpar-se i oferir-li un descompte per a la propera vegada'), T_('Disculpar-se, explicar-ho i convidar-lo a les postres'), T_('Explicar-li que la cuina va plena i que és normal'), T_('Demanar-li que ho escrigui a la ressenya perquè ho millorin')], c: 1, why: T_('Resoldre la queixa al moment evita una ressenya negativa i guanya un client.') },
      { q: T_('Tres treballadors del polígon dinen el menú per primera vegada.'), o: [T_('Donar-los una targeta amb el menú setmanal i el WhatsApp per reservar'), T_('Demanar-los el correu per enviar-los ofertes'), T_('Convidar-los al cafè perquè tornin'), T_('Demanar-los que segueixin el restaurant a Instagram')], c: 0, why: T_('Facilitar la repetició (menú i reserva fàcil) és el que omple els dilluns.') }
    ];
    quiz(T_('⭐ Ressenyes a Can Jordi'), tables, (sc) => {
      say([['jordi.' + (sc >= 2 ? 'h' : 'n'), sc >= 2 ? T_('Cinc ressenyes noves en un dia i dues reserves pel WhatsApp! Això funciona.') : T_('No sé si ha anat gaire bé...')]], () =>
        finishAction('ressenyes', sc, 3, { xp: 20 * sc, rep: sc >= 2 ? 2 : -1, money: sc >= 2 ? 120 : -60, fee: sc >= 2 }, T_('Va demanar ressenyes als comensals de Can Jordi ({0}/3).', [sc])));
    });
  }
  function posterAction() {
    quiz(T_('🪧 Cartell de l\'aparador'), [
      { q: T_('Titular principal del cartell:'), o: [T_('«Cansaladeria Núria, des de 1962 · Ara també en línia»'), T_('«Fuet de Vic a casa teva en 48 h · Compra a fuetnuria.cat»'), T_('«Descobreix la nostra nova botiga en línia»'), T_('«El millor fuet de Vic, ara a internet»')], c: 1, why: T_('Un benefici concret i on fer l\'acció: és el que llegeix qui passa per davant.') },
      { q: T_('Quants elements hi poses?'), o: [T_('Titular, foto del fuet, QR i preu d\'enviament'), T_('Titular, foto, QR, horari, telèfon i xarxes socials'), T_('Titular i els cinc productes més venuts amb preus'), T_('Logo, titular i adreça de la web')], c: 0, why: T_('Pocs elements i jerarquia clara: es llegeix en tres segons.') },
      { q: T_('Colors:'), o: [T_('Vermell sobre negre, per cridar l\'atenció'), T_('Blanc sobre el verd de la marca, amb contrast alt'), T_('Verd clar sobre blanc, colors suaus de la marca'), T_('Els colors de la bandera catalana, per al producte local')], c: 1, why: T_('El contrast alt fa que es llegeixi des del carrer i reforça la marca.') }
    ], (sc) => {
      say([['nuria.' + (sc >= 2 ? 'h' : 'n'), sc >= 2 ? T_('L\'he penjat i ja m\'han preguntat tres persones per l\'enviament!') : T_('Hmm... la gent no s\'hi fixa gaire.')]], () =>
        finishAction('cartell', sc, 3, { xp: 20 * sc, rep: sc >= 2 ? 1 : 0 }, T_('Va dissenyar el cartell de l\'aparador de la Cansaladeria Núria ({0}/3).', [sc])));
    });
  }

  // Minijoc: repartir cupons a la sortida de l'escola (40 segons)
  function schoolGate() {
    if (!done('1.3') || done('1.5')) return say(findClue('escola', [['', T_('L\'escola. Un cartell a la porta: «Horari de sortida: 16:30 h».')]]));
    if (st().actions.cupons) return say([['', T_('Ja has repartit els cupons «Berenar de tarda». Ara toca esperar els resultats.')]]);
    menu(T_('🎟️ Són les 16:30 i surten les famílies. Vols repartir cupons «Berenar de tarda»? Tens 40 segons: parla amb tantes persones com puguis i tria bé què els dius.'), [
      { t: T_('Som-hi!'), fn: startCoupons }, { t: T_('Ara no'), fn: () => { } }
    ]);
  }
  const PITCH = () => [
    { icon: '👨‍👧', pal: TOWNS.pare, ok: 0 }, { icon: '👵', pal: TOWNS.avia, ok: 1 }, { icon: '🏃', pal: TOWNS.veina, ok: 2 }
  ];
  function startCoupons() {
    const kinds = PITCH();
    const spots = [[4, 27], [6, 28], [8, 27], [10, 28], [12, 28], [14, 27], [5, 29], [16, 28], [3, 28], [11, 27]];
    minigame = { kind: 'cupons', left: 40, score: 0, talked: 0, list: [] };
    npcs = npcs.filter(n => !n.mini);
    spots.forEach(([x, y], i) => { const k = kinds[i % 3]; npcs.push({ id: 'fam' + i, mini: true, pal: k.pal, icon: k.icon, x, y, dir: 'down', frame: 0, mv: 0, wander: 2, home: [x, y], bubble: k.icon, act: function () { couponTalk(this, k); } }); });
    API.toast(T_('⏱️ 40 segons!'), 'good');
  }
  function couponTalk(n, k) {
    if (n.doneMini) return say([['', T_('Ja li has donat un cupó.')]]);
    menu(T_('{0} Què li dius?', [k.icon]), [
      { t: T_('«Berenar per als nens: coca i suc per 2,50 € a la sortida de l\'escola»'), fn: () => res(0) },
      { t: T_('«Pa tou acabat de fer cada tarda, a dues passes de casa»'), fn: () => res(1) },
      { t: T_('«Amb aquest cupó, un 10 % si passes abans de les 19 h: és un minut»'), fn: () => res(2) }
    ], true);
    function res(i) {
      n.doneMini = true; n.bubble = i === k.ok ? '✅' : '❌';
      if (i === k.ok) minigame.score++;
      API.toast(i === k.ok ? T_('🎟️ Cupó acceptat!') : T_('No li interessa...'), i === k.ok ? 'good' : 'bad');
    }
  }
  function endCoupons() {
    const sc = minigame.score; minigame = null;
    npcs = npcs.filter(n => !n.mini);
    S.f.cuponsRepartits = sc;
    say([['', T_('Temps! Has repartit {0} cupons a famílies interessades.', [sc])]], () =>
      finishAction('cupons', sc, 10, { xp: 12 * sc, rep: sc >= 6 ? 2 : 0, trust: sc >= 6 ? { carme: 1 } : null }, T_('Va repartir {0} cupons «Berenar de tarda» a la sortida de l\'escola.', [sc])));
  }

  /* =================================================================
     Interfície: diàlegs, menús, llibreta i controls
     ================================================================= */
  function portrait(id) { const c = ART.CHARS[id]; return c && id !== 'client' ? ART.portrait(id, 'n', id === 'pau' ? { rank: API.rank() } : {}) : ''; }
  function speakerName(id) { return (GD.names[id] && API.txt(GD.names[id])) || (TOWNS[id] ? NAMES()[id] : '') || ''; }
  const NAMES = () => ({ becari: T_('Becari'), comercialAg: T_('Comercial'), montse: T_('Montse'), baltasar: T_('Baltasar'), roser: T_('Roser'), marisa: T_('Marisa'), avia: T_('Veïna gran'), veina: T_('Veïna'), pare: T_('Pare'), turista: T_('Turista'), obrer: T_('Treballador'), caixera: T_('Caixera'), jaume: T_('Jaume'), clienta: T_('Clienta'), nen: T_('Nen') });
  function dialog(lines, then) {
    lines = (lines || []).filter(Boolean);
    if (!lines.length) { if (then) then(); return; }
    busy = true; held = null; path = [];
    const box = root.querySelector('.w-dlg');
    let i = 0, typing = null, full = '';
    const show = () => {
      if (i >= lines.length) { box.hidden = true; box.onclick = null; busy = false; dlgAdvance = null; if (then) then(); return; }
      const [w, t] = lines[i];
      const id = String(w || '').split('.')[0];
      box.hidden = false;
      box.querySelector('.w-ava').innerHTML = id ? portrait(id) : '';
      box.querySelector('.w-ava').hidden = !id || !ART.CHARS[id];
      box.querySelector('.w-name').textContent = id ? speakerName(id) : '';
      box.querySelector('.w-name').hidden = !id;
      full = API.txt(t);
      const tx = box.querySelector('.w-text'); let k = 0; clearInterval(typing);
      const sp = API.speed();
      if (sp <= 0) { tx.innerHTML = full; typing = null; return; }
      typing = setInterval(() => { k += 2; tx.innerHTML = full.slice(0, k).replace(/<[^>]*$/, ''); if (k >= full.length) { clearInterval(typing); typing = null; tx.innerHTML = full; } }, sp);
    };
    const adv = () => { if (typing) { clearInterval(typing); typing = null; box.querySelector('.w-text').innerHTML = full; return; } i++; show(); };
    box.onclick = adv; dlgAdvance = adv;
    show();
  }
  let dlgAdvance = null, menuState = null;
  function menu(title, opts, noCancel) {
    busy = true; held = null; path = [];
    const el = root.querySelector('.w-menu');
    el.hidden = false;
    el.innerHTML = `<div class="w-menu-t">${API.esc(title).replace(/\n/g, '<br>')}</div>${opts.map((o, i) => `<button class="w-opt ${i === 0 ? 'on' : ''}" data-i="${i}">${API.esc(o.t)}</button>`).join('')}`;
    const pick = (i) => { el.hidden = true; menuState = null; busy = false; opts[i].fn(); };
    el.querySelectorAll('.w-opt').forEach(b => b.onclick = (e) => { e.stopPropagation(); pick(+b.dataset.i); });
    menuState = { sel: 0, n: opts.length, pick, el, noCancel };
  }
  function menuMove(d) {
    if (!menuState) return;
    menuState.sel = (menuState.sel + d + menuState.n) % menuState.n;
    menuState.el.querySelectorAll('.w-opt').forEach((b, i) => b.classList.toggle('on', i === menuState.sel));
    menuState.el.querySelectorAll('.w-opt')[menuState.sel].scrollIntoView({ block: 'nearest' });
  }
  function notebook() {
    busy = true;
    const C = CLUES(), P = PROBLEMS(), obj = objective();
    const found = Object.entries(C).filter(([id]) => st().clues[id]);
    const el = root.querySelector('.w-note');
    el.hidden = false;
    el.innerHTML = `<div class="w-note-box">
      <h3>${T_('📒 Llibreta')}</h3>
      <h4>${T_('🎯 Objectiu')}</h4><p>${obj ? API.esc(obj.text) + (obj.map ? `<br><small>📍 ${API.esc(placeName(obj.map))}</small>` : '') : T_('Explora Vic, ajuda els botiguers i fes encàrrecs.')}</p>
      <h4>${T_('🔍 Pistes trobades ({0}/{1})', [found.length, Object.keys(C).length])}</h4>
      ${found.length ? `<ul>${found.map(([, c]) => `<li><b>${API.esc(GD.names[c.who] || '')}:</b> ${API.esc(c.t)}</li>`).join('')}</ul>` : `<p class="muted">${T_('Encara cap. Mira les coses dels negocis i parla amb la gent: les pistes t\'ajudaran a les missions.')}</p>`}
      <h4>${T_('🏪 Botiguers que has ajudat')}</h4>
      <ul>${Object.entries(P).map(([id, p]) => `<li>${st().problems[id] ? (st().problems[id] === 'ko' ? '❌' : st().problems[id] === 'mig' ? '🟡' : '✅') : '⬜'} ${API.esc(p.place)}</li>`).join('')}</ul>
      <h4>${T_('📣 Accions de màrqueting')}</h4>
      <ul>${[['fitxa', T_('Fitxa de Google del forn')], ['fotos', T_('Fotos de producte del forn')], ['cupons', T_('Cupons a la sortida de l\'escola')], ['ressenyes', T_('Ressenyes a Can Jordi')], ['cartell', T_('Cartell de la Cansaladeria Núria')]].map(([id, n]) => { const a = st().actions[id]; return `<li>${a ? '✅' : '⬜'} ${n}${a ? ` <small>(${a.score}/${a.max})</small>` : ''}</li>`; }).join('')}</ul>
      <div class="row-btns"><button class="btn primary" id="wnClose">${T_('Tancar')}</button></div></div>`;
    el.querySelector('#wnClose').onclick = () => { el.hidden = true; busy = false; };
  }
  function placeName(m) { return MAPS[m] ? MAPS[m].name() : m; }
  function openHub(tab) { close(); API.hubScreen(tab); }

  /* =================================================================
     Motor: moviment, càmera i dibuix
     ================================================================= */
  function walkable(x, y, ignore) {
    if (!map || x < 0 || y < 0 || x >= map.w || y >= map.h) return false;
    if (map.solid[y][x]) return false;
    if (npcs.some(n => n !== ignore && !n.marker && n.x === x && n.y === y)) return false;
    if (ignore !== player && player.x === x && player.y === y) return false;
    return true;
  }
  function warpAt(x, y) { return map.warps.find(w => w.x === x && w.y === y); }
  function tryMove(dir) {
    const [dx, dy] = DIRS[dir];
    player.dir = dir;
    const nx = player.x + dx, ny = player.y + dy;
    const w = warpAt(nx, ny);
    if (w && (w.closed || (w.to === 'fira' && !unlock.fira()))) { warpBlocked(w); return false; }
    if (!walkable(nx, ny, player)) {
      // sortir per la vora del mapa
      return false;
    }
    player.fx = player.x; player.fy = player.y; player.x = nx; player.y = ny; player.mv = 1; player.frame = (player.frame % 2) + 1;
    return true;
  }
  function afterStep() {
    const w = warpAt(player.x, player.y);
    if (w && w.to) { go(w.to, w.tx, w.ty, w.dir || (MAPS[w.to].outdoor ? 'down' : 'up')); return; }
    const mk2 = npcs.find(n => n.marker && n.x === player.x && n.y === player.y);
    if (mk2) { held = null; keysDown.clear(); mk2.act(); return; }
    // ocells que s'espanten
    birds.forEach(b => { if (!b.fly && Math.abs(b.x - player.x * TS) < 28 && Math.abs(b.y - player.y * TS) < 28) { b.fly = 1; b.vx = (b.x > player.x * TS ? 1 : -1) * (1 + Math.random()); b.vy = -1.4; } });
  }
  function facing() { const [dx, dy] = DIRS[player.dir]; return [player.x + dx, player.y + dy]; }
  function interact() {
    if (busy) return;
    let [fx, fy] = facing();
    let n = npcs.find(q => q.x === fx && q.y === fy);
    let o = !n && map.objs.find(q => q.t !== 'building' && !q.floor && fx >= q.x && fx < q.x + q.w && fy >= q.y && fy < q.y + q.h && (q.id || q.say || q.through));
    if (o && o.through && !o.id && !o.say) { const [dx, dy] = DIRS[player.dir]; n = npcs.find(q => q.x === fx + dx && q.y === fy + dy); o = null; }
    if (!n && !o) { const b = map.objs.find(q => q.t === 'building' && fx >= q.x && fx < q.x + q.w && fy >= q.y && fy < q.y + q.h); if (b && b.say) o = b; }
    if (!n && !o) { const w = warpAt(fx, fy); if (w && w.closed) return warpBlocked(w); }
    if (n) {
      n.dir = { up: 'down', down: 'up', left: 'right', right: 'left' }[player.dir];
      return n.act ? n.act.call(n) : null;
    }
    if (o) return objectAct(o);
  }

  function go(id, x, y, dir) {
    busy = true;
    const f = root.querySelector('.w-fade'); f.classList.add('on');
    setTimeout(() => {
      loadMap(id);
      player.x = x; player.y = y; player.mv = 0; player.dir = dir || 'down'; path = [];
      Object.assign(st(), { map: id, x, y, dir: player.dir }); API.save();
      npcs = buildNpcs(); birds = map.id === 'vic' ? makeBirds() : [];
      bannerT = 2.2; root.querySelector('.w-loc').textContent = map.def.name();
      f.classList.remove('on'); busy = false;
      hudDraw();
    }, 220);
  }
  function makeBirds() { return [[17, 13], [23, 17], [27, 14], [20, 13], [15, 15]].map(([x, y]) => ({ x: x * TS + 4, y: y * TS + 8, home: [x * TS + 4, y * TS + 8], fly: 0, t: Math.random() * 3 })); }

  function update(dt) {
    clock += dt;
    if (bannerT > 0) bannerT -= dt;
    if (minigame && minigame.kind === 'cupons' && !busy) { minigame.left -= dt; if (minigame.left <= 0) endCoupons(); }
    // jugador
    if (player.mv > 0) {
      player.mv -= dt / 0.16;
      if (player.mv <= 0) { player.mv = 0; afterStep(); }
    }
    if (player.mv === 0 && !busy) {
      const d = held || (path.length ? path.shift() : null);
      if (d) { if (!tryMove(d)) path = []; }
      else player.frame = 0;
    }
    // NPCs que passegen
    npcs.forEach(n => {
      if (n.mv > 0) { n.mv -= dt / 0.3; if (n.mv <= 0) { n.mv = 0; n.frame = 0; } return; }
      if (!n.wander || busy) return;
      n.wt = (n.wt || Math.random() * 3) - dt;
      if (n.wt > 0) return;
      n.wt = 1.5 + Math.random() * 2.5;
      const ds = Object.keys(DIRS), d = ds[Math.floor(Math.random() * 4)], [dx, dy] = DIRS[d];
      const nx = n.x + dx, ny = n.y + dy;
      n.dir = d;
      if (Math.abs(nx - n.home[0]) <= n.wander && Math.abs(ny - n.home[1]) <= n.wander && walkable(nx, ny, n) && !warpAt(nx, ny)) { n.fx = n.x; n.fy = n.y; n.x = nx; n.y = ny; n.mv = 1; n.frame = (n.frame % 2) + 1; }
    });
    birds.forEach(b => {
      b.t += dt;
      if (b.fly) { b.x += b.vx; b.y += b.vy; b.vy -= .02; if (b.y < -40 || b.x < -20 || b.x > map.w * TS + 20) { b.fly = 0; b.x = b.home[0]; b.y = b.home[1]; b.hide = 6; } }
      if (b.hide) b.hide = Math.max(0, b.hide - dt);
    });
  }
  const lerp = (a, b, t) => a + (b - a) * t;
  function pos(e) { const t = e.mv > 0 ? 1 - e.mv : 1; return [lerp(e.fx != null && e.mv > 0 ? e.fx : e.x, e.x, t) * TS, lerp(e.fy != null && e.mv > 0 ? e.fy : e.y, e.y, t) * TS]; }

  function draw() {
    const W = cv.width, H = cv.height, z = zoom;
    ctx.imageSmoothingEnabled = false;
    ctx.fillStyle = map.outdoor ? '#2f6a3a' : '#1b1640'; ctx.fillRect(0, 0, W, H);
    const [ppx, ppy] = pos(player);
    const mw = map.w * TS * z, mh = map.h * TS * z;
    let cx = Math.round(ppx * z + TS * z / 2 - W / 2), cy = Math.round(ppy * z + TS * z / 2 - H / 2);
    cx = mw <= W ? -Math.round((W - mw) / 2) : Math.max(0, Math.min(mw - W, cx));
    cy = mh <= H ? -Math.round((H - mh) / 2) : Math.max(0, Math.min(mh - H, cy));
    const ph = Math.floor(clock * 2) % 2;
    ctx.drawImage(map.ground[ph], -cx, -cy, mw, mh);
    // llista ordenada per profunditat
    const L = [];
    map.objs.forEach(o => { if (o.floor || (o.wall && o.deco)) return; const s = objSprite(o, ph); if (s) L.push({ y: (o.y + o.h) * TS, s, x: o.x * TS + (o.w * TS - s.width) / 2, top: (o.y + o.h) * TS - s.height + (o.t === 'tree' || o.t === 'pine' ? 2 : 0) }); });
    const ent = (e, key, P) => { const [x, y] = pos(e); const s = charSprite(key, P, e.dir, e.mv > 0 ? e.frame : 0); L.push({ y: y + TS, s, x, top: y + TS - 24, e }); };
    npcs.forEach(n => { if (n.marker) return; ent(n, n.pal ? 'town:' + n.id.replace(/\d+$/, '') + (n.icon || '') : n.id, palette(n.id, n.pal)); });
    ent(player, 'pau' + API.rank(), palette('pau'));
    L.sort((a, b) => a.y - b.y);
    // ombres
    L.forEach(d => { if (d.e) { ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.fillRect(Math.round(d.x * z + 3 * z - cx), Math.round((d.y - 2) * z - cy), 10 * z, 2 * z); } });
    L.forEach(d => ctx.drawImage(d.s, Math.round(d.x * z - cx), Math.round(d.top * z - cy), d.s.width * z, d.s.height * z));
    birds.forEach(b => { if (b.hide) return; const s = birdSprite(b.fly ? Math.floor(clock * 10) % 2 : (Math.sin(b.t * 3) > .6 ? 1 : 0)); ctx.drawImage(s, Math.round(b.x * z - cx), Math.round(b.y * z - cy), 8 * z, 7 * z); });
    // marcadors i bombolles (en coordenades de pantalla, text nítid)
    const fs = Math.max(11, Math.round(5.5 * z / dpr)) * dpr;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    npcs.forEach(n => {
      const [x, y] = pos(n);
      if (n.marker) {
        const bob = Math.sin(clock * 5) * 2;
        ctx.fillStyle = 'rgba(255,210,74,.35)'; ctx.beginPath(); ctx.arc(x * z + 8 * z - cx, y * z + 10 * z - cy, 7 * z, 0, 6.3); ctx.fill();
        ctx.font = `${fs * 1.3}px sans-serif`; ctx.fillText('✦', x * z + 8 * z - cx, y * z + 6 * z - cy + bob * z);
      }
      if (n.bubble) {
        const bx = x * z + 8 * z - cx, by = y * z - 6 * z - cy + Math.sin(clock * 4) * z;
        ctx.fillStyle = '#ffffff'; ctx.strokeStyle = INK; ctx.lineWidth = dpr * 1.5;
        roundRect(bx - fs * .75, by - fs * .7, fs * 1.5, fs * 1.4, fs * .35); ctx.fill(); ctx.stroke();
        ctx.font = `${fs}px sans-serif`; ctx.fillStyle = INK; ctx.fillText(n.bubble, bx, by + dpr);
      }
    });
    // rètols dels edificis
    ctx.font = `800 ${Math.round(fs * .82)}px 'M PLUS Rounded 1c', sans-serif`;
    map.objs.forEach(o => {
      if (o.t !== 'building' || !o.label) return;
      const lab = typeof o.label === 'function' ? o.label() : o.label;
      const lx = (o.x + o.w / 2) * TS * z - cx, ly = (o.y + (o.kind === 'church' ? 1 : Math.max(1, o.h * .3))) * TS * z - cy;
      if (lx < -200 || lx > W + 200 || ly < -40 || ly > H + 40) return;
      const tw = ctx.measureText(lab).width + 12 * dpr;
      ctx.fillStyle = 'rgba(43,29,34,.78)'; roundRect(lx - tw / 2, ly - fs * .6, tw, fs * 1.2, fs * .6); ctx.fill();
      ctx.fillStyle = '#fff'; ctx.fillText(lab, lx, ly + dpr);
    });
    // fletxa cap a l'objectiu si és fora de la pantalla
    const ob = objective();
    if (ob && ob.map === map.id) {
      const tx = (ob.x * TS + 8) * z - cx, ty = (ob.y * TS + 8) * z - cy;
      if (tx < 0 || ty < 0 || tx > W || ty > H) {
        const ax = Math.max(30 * dpr, Math.min(W - 30 * dpr, tx)), ay = Math.max(90 * dpr, Math.min(H - 150 * dpr, ty));
        const ang = Math.atan2(ty - ay, tx - ax);
        ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang);
        ctx.fillStyle = '#ffd24a'; ctx.strokeStyle = INK; ctx.lineWidth = 2 * dpr;
        ctx.beginPath(); ctx.moveTo(14 * dpr, 0); ctx.lineTo(-8 * dpr, -10 * dpr); ctx.lineTo(-8 * dpr, 10 * dpr); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.restore();
      }
    }
    // temporitzador del minijoc
    if (minigame) {
      ctx.font = `800 ${fs * 1.2}px sans-serif`; ctx.fillStyle = 'rgba(43,29,34,.85)';
      roundRect(W / 2 - 90 * dpr, 64 * dpr, 180 * dpr, 34 * dpr, 17 * dpr); ctx.fill();
      ctx.fillStyle = '#ffd24a'; ctx.fillText(`⏱️ ${Math.ceil(minigame.left)} s · 🎟️ ${minigame.score}`, W / 2, 81 * dpr);
    }
    root.querySelector('.w-loc').classList.toggle('show', bannerT > 0);
  }
  function roundRect(x, y, w, h, r) { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); }

  function loop(t) {
    raf = requestAnimationFrame(loop);
    const dt = Math.min(0.05, (t - (last || t)) / 1000); last = t;
    if (!map) return;
    update(dt); draw(); checkPendingTalk(); savePosThrottled();
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    cssW = root.clientWidth; cssH = root.clientHeight;
    cv.width = Math.round(cssW * dpr); cv.height = Math.round(cssH * dpr);
    cv.style.width = cssW + 'px'; cv.style.height = cssH + 'px';
    const across = Math.max(11, Math.min(22, cssW / 34));
    let tileCss = Math.min(cssW / across, cssH / 9);
    zoom = Math.max(1, Math.round(tileCss * dpr / TS));
  }

  function hudDraw() {
    const h = root.querySelector('.w-hud');
    if (!h) return;
    const ob = objective();
    h.innerHTML = `<button class="w-btn" data-w="menu" aria-label="${T_('Menú')}">☰</button>
      <div class="w-stats"><span class="chip ${S.money < 0 ? 'neg' : ''}">💶 ${API.eur(S.money)}</span><span class="chip">⭐ ${S.rep}</span><span class="chip">${T_('Nv')} ${S.level}</span></div>
      <button class="w-btn" data-w="note" aria-label="${T_('Llibreta')}">📒</button>
      ${ob ? `<div class="w-obj">🎯 ${API.esc(ob.text)}${ob.map && ob.map !== map.id ? ` · 📍 ${API.esc(placeName(ob.map))}` : ''}</div>` : ''}`;
  }

  /* --- Controls --- */
  const KEYMAP = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right', W: 'up', S: 'down', A: 'left', D: 'right' };
  function onKey(e) {
    if (!root || !root.isConnected) return;
    if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
    const d = KEYMAP[e.key];
    const note = root.querySelector('.w-note');
    if (!note.hidden) { if (['Escape', 'Enter', ' ', 'x', 'X'].includes(e.key)) { note.hidden = true; busy = false; e.preventDefault(); } return; }
    if (menuState) {
      if (d === 'up' || d === 'down') { menuMove(d === 'up' ? -1 : 1); e.preventDefault(); }
      else if (['Enter', ' ', 'z', 'Z'].includes(e.key)) { menuState.pick(menuState.sel); e.preventDefault(); }
      else if (['Escape', 'x', 'X'].includes(e.key)) { const m = menuState; if (!m.noCancel) m.pick(m.n - 1); e.preventDefault(); }
      return;
    }
    if (dlgAdvance && ['Enter', ' ', 'z', 'Z', 'x', 'X'].includes(e.key)) { dlgAdvance(); e.preventDefault(); return; }
    if (d) { keysDown.add(d); held = d; path = []; e.preventDefault(); return; }
    if (['Enter', ' ', 'z', 'Z'].includes(e.key)) { interact(); e.preventDefault(); }
    if (['Escape', 'x', 'X', 'm', 'M'].includes(e.key)) { openHub(); e.preventDefault(); }
  }
  function onKeyUp(e) { const d = KEYMAP[e.key]; if (d) { keysDown.delete(d); held = keysDown.size ? [...keysDown].pop() : null; } }
  function bindPad() {
    root.querySelectorAll('[data-pad]').forEach(b => {
      const d = b.dataset.pad;
      const on = (e) => { e.preventDefault(); if (busy) return; held = d; path = []; b.classList.add('on'); };
      const off = (e) => { e.preventDefault(); if (held === d) held = null; b.classList.remove('on'); };
      b.addEventListener('pointerdown', on); b.addEventListener('pointerup', off); b.addEventListener('pointerleave', off); b.addEventListener('pointercancel', off);
    });
    root.querySelector('[data-btn=a]').addEventListener('pointerdown', (e) => { e.preventDefault(); if (menuState) return menuState.pick(menuState.sel); if (dlgAdvance) return dlgAdvance(); interact(); });
    root.querySelector('[data-btn=b]').addEventListener('pointerdown', (e) => { e.preventDefault(); if (menuState) return menuState.noCancel ? null : menuState.pick(menuState.n - 1); if (dlgAdvance) return dlgAdvance(); notebook(); });
    // tocar el mapa: caminar fins allà (i parlar si hi ha algú)
    cv.addEventListener('pointerdown', (e) => {
      if (busy) return;
      const r = cv.getBoundingClientRect();
      const W = cv.width, H = cv.height, z = zoom;
      const [ppx, ppy] = pos(player);
      const mw = map.w * TS * z, mh = map.h * TS * z;
      let cx = Math.round(ppx * z + TS * z / 2 - W / 2), cy = Math.round(ppy * z + TS * z / 2 - H / 2);
      cx = mw <= W ? -Math.round((W - mw) / 2) : Math.max(0, Math.min(mw - W, cx));
      cy = mh <= H ? -Math.round((H - mh) / 2) : Math.max(0, Math.min(mh - H, cy));
      const tx = Math.floor(((e.clientX - r.left) * dpr + cx) / (TS * z)), ty = Math.floor(((e.clientY - r.top) * dpr + cy) / (TS * z));
      const target = npcs.find(n => n.x === tx && n.y === ty) || map.objs.find(o => o.t !== 'building' && !o.floor && (o.id || o.say) && tx >= o.x && tx < o.x + o.w && ty >= o.y && ty < o.y + o.h);
      const p = findPath(tx, ty, !!target || (map.solid[ty] && map.solid[ty][tx]));
      if (p) { path = p.dirs; if (target || p.adj) pendingTalk = { x: tx, y: ty, n: p.dirs.length }; }
    });
  }
  let pendingTalk = null;
  function findPath(tx, ty, adjacent) {
    if (tx < 0 || ty < 0 || tx >= map.w || ty >= map.h) return null;
    const goal = (x, y) => adjacent ? Math.abs(x - tx) + Math.abs(y - ty) === 1 : x === tx && y === ty;
    const seen = new Set([player.x + ',' + player.y]); const q = [[player.x, player.y, []]];
    while (q.length) {
      const [x, y, dirs] = q.shift();
      if (goal(x, y)) {
        if (adjacent) { const d = tx > x ? 'right' : tx < x ? 'left' : ty > y ? 'down' : 'up'; return { dirs, face: d, adj: true }; }
        return { dirs };
      }
      if (dirs.length > 60) continue;
      for (const [d, [dx, dy]] of Object.entries(DIRS)) {
        const nx = x + dx, ny = y + dy, k = nx + ',' + ny;
        if (seen.has(k)) continue; seen.add(k);
        const w = warpAt(nx, ny);
        if ((walkable(nx, ny, player) && !(w && w.closed)) || (!adjacent && nx === tx && ny === ty && w && w.to)) q.push([nx, ny, dirs.concat(d)]);
      }
    }
    return null;
  }
  // en arribar al costat del destí tocat, parlar-hi
  function checkPendingTalk() {
    if (!pendingTalk || path.length || player.mv > 0 || busy) return;
    const { x, y } = pendingTalk; pendingTalk = null;
    if (Math.abs(player.x - x) + Math.abs(player.y - y) !== 1) return;
    player.dir = x > player.x ? 'right' : x < player.x ? 'left' : y > player.y ? 'down' : 'up';
    interact();
  }

  function close() {
    cancelAnimationFrame(raf); raf = 0;
    window.removeEventListener('keydown', onKey); window.removeEventListener('keyup', onKeyUp); window.removeEventListener('resize', resize);
    minigame = null; busy = false; menuState = null; dlgAdvance = null; held = null; keysDown.clear();
  }

  /* =================================================================
     API pública
     ================================================================= */
  window.WORLD = {
    open(api) {
      API = api; S = api.S();
      if (!S.world) S.world = {};
      S.world = Object.assign({ map: 'oficina', x: 6, y: 7, dir: 'up', clues: {}, actions: {}, problems: {} }, S.world);
      const app = document.getElementById('app');
      app.innerHTML = `<section class="world">
        <canvas class="w-cv"></canvas>
        <div class="w-hud"></div>
        <div class="w-loc"></div>
        <div class="w-pad" aria-hidden="true"><button data-pad="up">▲</button><button data-pad="left">◀</button><button data-pad="right">▶</button><button data-pad="down">▼</button></div>
        <div class="w-ab"><button data-btn="b" aria-label="${T_('Llibreta')}">B</button><button data-btn="a" aria-label="${T_('Parlar o mirar')}">A</button></div>
        <div class="w-help">${T_('Mou-te amb les fletxes (o tocant el mapa) · A / Espai: parlar i mirar · B: llibreta · Esc: menú')}</div>
        <div class="w-dlg" hidden><div class="w-ava"></div><div class="w-body"><div class="w-name"></div><div class="w-text"></div></div><div class="w-next">▼</div></div>
        <div class="w-menu" hidden></div>
        <div class="w-note" hidden></div>
        <div class="w-fade"></div>
      </section>`;
      root = app.querySelector('.world'); cv = root.querySelector('.w-cv'); ctx = cv.getContext('2d');
      resize();
      window.addEventListener('resize', resize); window.addEventListener('keydown', onKey); window.addEventListener('keyup', onKeyUp);
      bindPad();
      root.querySelector('.w-hud').addEventListener('click', (e) => { const b = e.target.closest('[data-w]'); if (!b || busy) return; if (b.dataset.w === 'menu') openHub(); else notebook(); });
      player = { x: S.world.x, y: S.world.y, dir: S.world.dir || 'down', frame: 0, mv: 0 };
      if (!MAPS[S.world.map]) S.world.map = 'oficina';
      loadMap(S.world.map);
      if (!walkable(player.x, player.y, player)) { const w = map.warps.find(q => q.to); player.x = w ? w.x : 1; player.y = w ? w.y - 1 : 1; }
      npcs = buildNpcs(); birds = map.id === 'vic' ? makeBirds() : [];
      root.querySelector('.w-loc').textContent = map.def.name(); bannerT = 2.2;
      hudDraw();
      busy = false; last = 0;
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
      if (!S.world.seenHelp) { S.world.seenHelp = true; API.save(); dialog([['', T_('Pots moure\'t per Vic, entrar als negocis i parlar amb la gent. Les pistes que trobis t\'ajudaran a les missions, i els botiguers amb ❗ necessiten ajuda.')], ['', T_('La missió següent està marcada amb ❗ o ✦. A l\'ordinador del despatx tens els projectes, el taller i les finances.')]]); }
    },
    close,
    refresh() { if (map) { npcs = buildNpcs(); hudDraw(); } },
    maps: MAPS
  };
  let saveT = 0;
  function savePosThrottled() {
    if (!player || player.mv > 0) return;
    const now = Date.now(); if (now - saveT < 1500) return; saveT = now;
    const w = S.world; if (w.x !== player.x || w.y !== player.y || w.map !== map.id) { w.x = player.x; w.y = player.y; w.dir = player.dir; w.map = map.id; API.save(); }
  }
})();
