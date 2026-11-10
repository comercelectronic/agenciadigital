/* Agència Digital — il·lustracions dels Comerçmons (SVG generat).
   Totes les criatures comparteixen la mateixa línia artística: contorn fosc gruixut, colors plans amb llum suau,
   ulls grans i proporcions «chibi». Cada forma es descriu a data-comercmons.js amb un objecte look
   (cos, cap, orelles, cua, ales, banyes, ulls, boca, estampat, corona, objecte i aura) i aquí es dibuixa. */
(function () {
  'use strict';
  const INK = '#2b1d22';
  const SW = 3.6; // gruix del contorn
  let uidN = 0;

  function shade(hex, amt) {
    const n = parseInt(hex.slice(1), 16);
    const f = (v) => Math.max(0, Math.min(255, v + amt));
    return '#' + ((1 << 24) + (f(n >> 16) << 16) + (f((n >> 8) & 255) << 8) + f(n & 255)).toString(16).slice(1);
  }
  function mix(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const c = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return '#' + ((1 << 24) + (c(16) << 16) + (c(8) << 8) + c(0)).toString(16).slice(1);
  }
  const st = (fill, extra) => `fill="${fill}" stroke="${INK}" stroke-width="${SW}" stroke-linejoin="round" stroke-linecap="round"${extra ? ' ' + extra : ''}`;
  const ln = (w) => `fill="none" stroke="${INK}" stroke-width="${w || SW}" stroke-linecap="round" stroke-linejoin="round"`;

  /* ---------- Cossos: retornen el dibuix i on va el cap ---------- */
  function body(k, C) {
    const { P, L, D, B } = C;
    switch (k) {
      case 'blob': return { svg: `<ellipse cx="82" cy="170" rx="12" ry="7" ${st(D)}/><ellipse cx="118" cy="170" rx="12" ry="7" ${st(D)}/><ellipse cx="100" cy="140" rx="40" ry="33" ${st(P)}/>`, head: [100, 88, 40], belly: [100, 146, 24, 20] };
      case 'fox': case 'beast': {
        const w = k === 'beast' ? 46 : 34;
        return { svg: `<rect x="${100 - w + 6}" y="150" width="13" height="24" rx="6" ${st(D)}/><rect x="${100 + w - 19}" y="150" width="13" height="24" rx="6" ${st(D)}/><ellipse cx="100" cy="145" rx="${w}" ry="${k === 'beast' ? 32 : 27}" ${st(P)}/><rect x="80" y="156" width="13" height="20" rx="6" ${st(P)}/><rect x="107" y="156" width="13" height="20" rx="6" ${st(P)}/>`, head: [100, 90, k === 'beast' ? 40 : 37], belly: [100, 150, 18, 15] };
      }
      case 'bird': return { svg: `<path d="M88 168 v10 M84 178 h9 M112 168 v10 M107 178 h9" ${ln(3)}/><ellipse cx="100" cy="135" rx="36" ry="40" ${st(P)}/>`, head: [100, 82, 36], belly: [100, 145, 22, 25] };
      case 'bug': case 'beetle': return { svg: `<path d="M74 150 l-12 14 M126 150 l12 14 M80 165 l-6 12 M120 165 l6 12" ${ln(3.2)}/><ellipse cx="100" cy="143" rx="${k === 'beetle' ? 38 : 30}" ry="${k === 'beetle' ? 32 : 33}" ${st(P)}/>${k === 'beetle' ? `<path d="M100 113 V175" ${ln(3)}/>` : ''}`, head: [100, 88, 36], belly: [100, 148, 16, 18] };
      case 'octo': return { svg: [0, 1, 2, 3, 4, 5].map(i => { const x = 62 + i * 15; const d = i % 2 ? 1 : -1; return `<path d="M${x} 118 C ${x + d * 8} 150, ${x - d * 14} 160, ${x + d * 6} 178" fill="none" stroke="${INK}" stroke-width="13" stroke-linecap="round"/><path d="M${x} 118 C ${x + d * 8} 150, ${x - d * 14} 160, ${x + d * 6} 178" fill="none" stroke="${P}" stroke-width="7" stroke-linecap="round"/>`; }).join(''), head: [100, 95, 50], belly: null };
      case 'crab': return { svg: `<path d="M58 150 l-16 18 M66 160 l-10 16 M142 150 l16 18 M134 160 l10 16" ${ln(3.4)}/><path d="M60 128 C 30 118, 22 96, 40 86 C 30 104, 46 112, 60 118" ${st(D)}/><path d="M140 128 C 170 118, 178 96, 160 86 C 170 104, 154 112, 140 118" ${st(D)}/><ellipse cx="100" cy="138" rx="50" ry="32" ${st(P)}/>`, head: [100, 122, 0], face: [100, 134], belly: null };
      case 'turtle': return { svg: `<ellipse cx="66" cy="166" rx="12" ry="8" ${st(D)}/><ellipse cx="134" cy="166" rx="12" ry="8" ${st(D)}/><path d="M48 158 C 48 108, 152 108, 152 158 Z" ${st(P)}/><path d="M44 158 H156" ${ln(4)}/>`, head: [100, 92, 32], belly: null, shell: [100, 140] };
      case 'dragon': return { svg: `<ellipse cx="84" cy="172" rx="13" ry="7" ${st(D)}/><ellipse cx="116" cy="172" rx="13" ry="7" ${st(D)}/><ellipse cx="100" cy="145" rx="35" ry="31" ${st(P)}/><path d="M70 136 c-12 4,-16 14,-10 20 M130 136 c12 4,16 14,10 20" ${ln(3.4)}/>`, head: [100, 88, 40], belly: [100, 150, 20, 20] };
      case 'horse': return { svg: `<rect x="72" y="150" width="11" height="28" rx="5" ${st(D)}/><rect x="117" y="150" width="11" height="28" rx="5" ${st(D)}/><ellipse cx="100" cy="146" rx="38" ry="25" ${st(P)}/><rect x="86" y="158" width="11" height="22" rx="5" ${st(P)}/><rect x="104" y="158" width="11" height="22" rx="5" ${st(P)}/>`, head: [100, 86, 34], belly: [100, 152, 20, 11] };
      case 'crystal': return { svg: `<path d="M84 168 v10 M116 168 v10" ${ln(4)}/><path d="M100 46 L146 104 L122 172 H78 L54 104 Z" ${st(P)}/>`, head: [100, 110, 0], face: [100, 112], belly: null };
      case 'lizard': return { svg: `<path d="M70 162 l-6 12 M90 166 l-2 12 M114 166 l2 12 M132 162 l6 12" ${ln(4)}/><ellipse cx="102" cy="148" rx="42" ry="22" ${st(P)}/>`, head: [86, 100, 34], belly: [104, 154, 24, 10] };
      case 'snail': return { svg: `<path d="M44 172 C 44 150, 70 146, 90 150 L 160 158 C 172 162, 168 176, 150 176 Z" ${st(L)}/><circle cx="118" cy="122" r="40" ${st(P)}/><path d="M118 122 m-28 0 a28 28 0 1 1 28 28 a18 18 0 1 1 -18 -18 a8 8 0 1 1 8 8" ${ln(3.4)}/>`, head: [64, 116, 26], belly: null };
      case 'jelly': return { svg: [0, 1, 2, 3, 4].map(i => { const x = 70 + i * 15; return `<path d="M${x} 124 q 8 14 0 26 q -8 12 0 26" fill="none" stroke="${INK}" stroke-width="9" stroke-linecap="round"/><path d="M${x} 124 q 8 14 0 26 q -8 12 0 26" fill="none" stroke="${L}" stroke-width="4" stroke-linecap="round"/>`; }).join('') + `<path d="M50 126 C 50 60, 150 60, 150 126 Q 125 136 100 126 Q 75 136 50 126 Z" ${st(P, 'fill-opacity=".92"')}/>`, head: [100, 100, 0], face: [100, 104], belly: null };
      case 'cart': return { svg: `<circle cx="74" cy="172" r="9" ${st(D)}/><circle cx="130" cy="172" r="9" ${st(D)}/><path d="M38 84 H58 L66 156 H140 L152 98 H62" ${st('none')}/><path d="M62 98 H152 L142 154 H68 Z" ${st(P)}/><path d="M80 98 V154 M100 98 V154 M120 98 V154 M64 126 H148" ${ln(2.6)}/>`, head: [104, 72, 30], belly: null };
      case 'robot': return { svg: `<rect x="80" y="160" width="14" height="18" rx="4" ${st(D)}/><rect x="106" y="160" width="14" height="18" rx="4" ${st(D)}/><rect x="66" y="118" width="68" height="48" rx="12" ${st(P)}/><path d="M66 130 H48 M134 130 H152" ${ln(6)}/><circle cx="46" cy="130" r="6" ${st(D)}/><circle cx="154" cy="130" r="6" ${st(D)}/>`, head: [100, 82, 34], belly: null };
      case 'bulb': return { svg: `<rect x="84" y="140" width="32" height="26" rx="6" ${st('#b9c3d0')}/><path d="M84 150 H116 M84 158 H116" ${ln(2.6)}/><path d="M92 168 h16" ${ln(5)}/>`, head: [100, 92, 46], belly: null };
      case 'whale': return { svg: `<path d="M168 120 C 186 100, 192 92, 186 80 C 178 96, 170 100, 160 108 C 170 96, 172 84, 164 74 C 162 92, 156 104, 148 112 Z" ${st(D)}/><ellipse cx="96" cy="124" rx="74" ry="50" ${st(P)}/><path d="M34 140 C 70 168, 126 170, 160 142" ${ln(3)}/>`, head: [72, 116, 0], face: [62, 112], belly: null };
      default: return body('blob', C);
    }
  }

  /* ---------- Parts ---------- */
  function ears(k, hx, hy, r, C) {
    const { P, L, D } = C, top = hy - r;
    switch (k) {
      case 'pointy': return `<path d="M${hx - r * .85} ${hy - r * .35} L${hx - r * .7} ${top - 22} L${hx - r * .15} ${top + 6} Z" ${st(P)}/><path d="M${hx + r * .85} ${hy - r * .35} L${hx + r * .7} ${top - 22} L${hx + r * .15} ${top + 6} Z" ${st(P)}/><path d="M${hx - r * .62} ${top - 6} L${hx - r * .4} ${top + 8} M${hx + r * .62} ${top - 6} L${hx + r * .4} ${top + 8}" ${ln(2.4)}/>`;
      case 'round': return `<circle cx="${hx - r * .72}" cy="${top + 6}" r="${r * .32}" ${st(P)}/><circle cx="${hx + r * .72}" cy="${top + 6}" r="${r * .32}" ${st(P)}/><circle cx="${hx - r * .72}" cy="${top + 6}" r="${r * .15}" fill="${L}"/><circle cx="${hx + r * .72}" cy="${top + 6}" r="${r * .15}" fill="${L}"/>`;
      case 'floppy': return `<path d="M${hx - r * .7} ${top + 8} C ${hx - r * 1.4} ${hy - 10}, ${hx - r * 1.3} ${hy + 20}, ${hx - r * .95} ${hy + 14} C ${hx - r * .9} ${hy}, ${hx - r * .6} ${top + 20}, ${hx - r * .4} ${top + 6} Z" ${st(D)}/><path d="M${hx + r * .7} ${top + 8} C ${hx + r * 1.4} ${hy - 10}, ${hx + r * 1.3} ${hy + 20}, ${hx + r * .95} ${hy + 14} C ${hx + r * .9} ${hy}, ${hx + r * .6} ${top + 20}, ${hx + r * .4} ${top + 6} Z" ${st(D)}/>`;
      case 'tuft': return `<path d="M${hx - r * .8} ${top + 14} L${hx - r * .95} ${top - 14} L${hx - r * .35} ${top + 4} Z" ${st(D)}/><path d="M${hx + r * .8} ${top + 14} L${hx + r * .95} ${top - 14} L${hx + r * .35} ${top + 4} Z" ${st(D)}/>`;
      case 'flame': return [-1, 1].map(s => `<path d="M${hx + s * r * .3} ${top + 8} C ${hx + s * r * .9} ${top - 6}, ${hx + s * r * .5} ${top - 26}, ${hx + s * r * .95} ${top - 34} C ${hx + s * r * 1.2} ${top - 10}, ${hx + s * r * 1.15} ${top + 4}, ${hx + s * r * .85} ${top + 20} Z" ${st('#ff8a3a')}/><path d="M${hx + s * r * .62} ${top + 6} C ${hx + s * r * .9} ${top - 6}, ${hx + s * r * .8} ${top - 12}, ${hx + s * r * .95} ${top - 16}" fill="none" stroke="#ffe08a" stroke-width="5" stroke-linecap="round"/>`).join('');
      case 'leaf': return [-1, 1].map(s => `<path d="M${hx + s * r * .4} ${top + 8} C ${hx + s * r * .6} ${top - 24}, ${hx + s * r * 1.3} ${top - 20}, ${hx + s * r * 1.2} ${top - 32} C ${hx + s * r * 1.5} ${top - 4}, ${hx + s * r * 1.1} ${top + 12}, ${hx + s * r * .75} ${top + 16} Z" ${st('#5fcf74')}/><path d="M${hx + s * r * .55} ${top + 8} Q ${hx + s * r * .95} ${top - 8} ${hx + s * r * 1.15} ${top - 26}" ${ln(2)}/>`).join('');
      case 'antenna': return [-1, 1].map(s => `<path d="M${hx + s * r * .3} ${top + 6} Q ${hx + s * r * .5} ${top - 20} ${hx + s * r * .78} ${top - 26}" ${ln(3.4)}/><circle cx="${hx + s * r * .8}" cy="${top - 28}" r="6" ${st(C.L)}/>`).join('');
      case 'crest': return `<path d="M${hx - 10} ${top + 6} C ${hx - 18} ${top - 18}, ${hx - 2} ${top - 30}, ${hx} ${top - 18} C ${hx + 4} ${top - 34}, ${hx + 22} ${top - 26}, ${hx + 12} ${top - 4} C ${hx + 26} ${top - 14}, ${hx + 30} ${top}, ${hx + 14} ${top + 10} Z" ${st(D)}/>`;
      case 'spikes': return Array.from({ length: 9 }, (_, i) => { const a = Math.PI * (1.05 + i * 0.112); const x1 = hx + Math.cos(a) * r * .92, y1 = hy + Math.sin(a) * r * .92, x2 = hx + Math.cos(a) * (r + 22), y2 = hy + Math.sin(a) * (r + 22), a2 = a + 0.13, x3 = hx + Math.cos(a2) * r * .92, y3 = hy + Math.sin(a2) * r * .92; return `<path d="M${x1} ${y1} L${x2} ${y2} L${x3} ${y3} Z" ${st(D)}/>`; }).join('');
      case 'brush': return [-1, 1].map(s => `<path d="M${hx + s * r * .3} ${top + 6} Q ${hx + s * r * .45} ${top - 18} ${hx + s * r * .72} ${top - 24}" ${ln(3.4)}/><path d="M${hx + s * r * .72} ${top - 24} q ${s * 6} -14 ${s * 14} -14 q -2 12 ${-s * 8} 18 z" ${st(s < 0 ? '#e2577a' : '#3fb5e8')}/>`).join('');
      default: return '';
    }
  }

  function tail(k, C, anchor, n) {
    const { P, L, D } = C, [x, y] = anchor;
    const one = (rot) => {
      let d;
      switch (k) {
        case 'flame': d = `<path d="M${x} ${y} C ${x + 30} ${y - 4}, ${x + 30} ${y - 40}, ${x + 44} ${y - 54} C ${x + 52} ${y - 26}, ${x + 46} ${y + 4}, ${x + 6} ${y + 14} Z" ${st('#ff8a3a')}/><path d="M${x + 14} ${y + 2} C ${x + 30} ${y - 6}, ${x + 32} ${y - 22}, ${x + 40} ${y - 36}" fill="none" stroke="#ffe08a" stroke-width="6" stroke-linecap="round"/>`; break;
        case 'leaf': d = `<path d="M${x} ${y} C ${x + 20} ${y - 6}, ${x + 50} ${y - 30}, ${x + 56} ${y - 46} C ${x + 58} ${y - 14}, ${x + 30} ${y + 12}, ${x + 2} ${y + 10} Z" ${st('#5fcf74')}/><path d="M${x + 4} ${y + 4} Q ${x + 34} ${y - 8} ${x + 52} ${y - 40}" ${ln(2)}/>`; break;
        case 'bushy': case 'wag': case 'brush': d = `<path d="M${x} ${y} C ${x + 26} ${y - 2}, ${x + 46} ${y - 30}, ${x + 40} ${y - 56} C ${x + 58} ${y - 40}, ${x + 62} ${y - 6}, ${x + 30} ${y + 14} C ${x + 18} ${y + 18}, ${x + 6} ${y + 14}, ${x} ${y + 8} Z" ${st(P)}/><path d="M${x + 34} ${y - 44} C ${x + 52} ${y - 34}, ${x + 52} ${y - 18}, ${x + 46} ${y - 8} C ${x + 44} ${y - 24}, ${x + 40} ${y - 34}, ${x + 34} ${y - 44} Z" fill="${k === 'brush' ? '#e2577a' : L}"/>`; break;
        case 'lizard': d = `<path d="M${x} ${y} C ${x + 30} ${y + 4}, ${x + 50} ${y - 6}, ${x + 56} ${y - 28} C ${x + 58} ${y - 6}, ${x + 40} ${y + 18}, ${x} ${y + 12} Z" ${st(P)}/>`; break;
        case 'otter': case 'beaver': d = k === 'beaver' ? `<ellipse cx="${x + 26}" cy="${y + 6}" rx="26" ry="11" transform="rotate(-20 ${x + 26} ${y + 6})" ${st(D)}/><path d="M${x + 12} ${y + 2} l26 -6 M${x + 14} ${y + 10} l26 -8" ${ln(1.8)}/>` : `<path d="M${x} ${y} C ${x + 30} ${y}, ${x + 46} ${y - 10}, ${x + 50} ${y - 22} C ${x + 54} ${y - 4}, ${x + 30} ${y + 14}, ${x} ${y + 10} Z" ${st(D)}/>`; break;
        case 'quill': d = `<path d="M${x} ${y} C ${x + 22} ${y - 10}, ${x + 40} ${y - 36}, ${x + 42} ${y - 60} C ${x + 54} ${y - 30}, ${x + 40} ${y - 4}, ${x + 4} ${y + 10} Z" ${st('#f4f1ea')}/><path d="M${x + 4} ${y + 6} Q ${x + 34} ${y - 16} ${x + 42} ${y - 58}" ${ln(2.4)}/>`; break;
        case 'bolt': d = `<path d="M${x} ${y} L${x + 24} ${y - 10} L${x + 18} ${y - 22} L${x + 44} ${y - 34} L${x + 34} ${y - 12} L${x + 42} ${y - 8} L${x + 6} ${y + 12} Z" ${st('#ffd23a')}/>`; break;
        case 'glow': d = `<path d="M${x} ${y} C ${x + 20} ${y}, ${x + 30} ${y - 16}, ${x + 30} ${y - 28}" ${ln(5)}/><circle cx="${x + 32}" cy="${y - 36}" r="10" ${st('#fff4a8')}/>`; break;
        case 'mane': d = `<path d="M${x} ${y - 6} C ${x + 30} ${y - 10}, ${x + 40} ${y + 10}, ${x + 30} ${y + 34} C ${x + 22} ${y + 14}, ${x + 12} ${y + 8}, ${x} ${y + 8} Z" ${st(D)}/>`; break;
        case 'tuft': d = `<path d="M${x} ${y} C ${x + 24} ${y}, ${x + 30} ${y - 18}, ${x + 32} ${y - 30}" ${ln(4)}/><path d="M${x + 32} ${y - 30} l-8 -10 l14 2 l2 -12 l6 14 z" ${st(D)}/>`; break;
        default: d = '';
      }
      return rot ? `<g transform="rotate(${rot} ${x} ${y})">${d}</g>` : d;
    };
    if (n && n > 1) { const span = Math.min(80, 14 * n); return Array.from({ length: n }, (_, i) => one(-span / 2 + i * span / (n - 1))).join(''); }
    return one(0);
  }

  function wings(k, C, hx, hy) {
    const { L, P } = C, y = hy + 40;
    const side = (s) => {
      switch (k) {
        case 'feather': return `<path d="M${100 + s * 26} ${y} C ${100 + s * 70} ${y - 50}, ${100 + s * 92} ${y - 30}, ${100 + s * 96} ${y - 6} C ${100 + s * 80} ${y - 8}, ${100 + s * 86} ${y + 8}, ${100 + s * 74} ${y + 12} C ${100 + s * 62} ${y + 6}, ${100 + s * 66} ${y + 22}, ${100 + s * 50} ${y + 22} Z" ${st(L)}/><path d="M${100 + s * 44} ${y - 4} Q ${100 + s * 66} ${y - 10} ${100 + s * 82} ${y - 14}" ${ln(2)}/>`;
        case 'insect': return `<ellipse cx="${100 + s * 42}" cy="${y - 18}" rx="30" ry="16" transform="rotate(${s * -30} ${100 + s * 42} ${y - 18})" ${st('#e9f6ff', 'fill-opacity=".85"')}/><ellipse cx="${100 + s * 38}" cy="${y + 4}" rx="20" ry="11" transform="rotate(${s * 20} ${100 + s * 38} ${y + 4})" ${st('#e9f6ff', 'fill-opacity=".85"')}/>`;
        case 'butterfly': return `<path d="M${100 + s * 18} ${y} C ${100 + s * 50} ${y - 64}, ${100 + s * 96} ${y - 40}, ${100 + s * 78} ${y - 6} C ${100 + s * 96} ${y + 20}, ${100 + s * 60} ${y + 44}, ${100 + s * 20} ${y + 12} Z" ${st(C.P2)}/><circle cx="${100 + s * 62}" cy="${y - 22}" r="9" ${st(L)}/><circle cx="${100 + s * 56}" cy="${y + 16}" r="6" ${st('#fff')}/>`;
        case 'bat': return `<path d="M${100 + s * 24} ${y - 6} L${100 + s * 84} ${y - 40} L${100 + s * 80} ${y - 10} L${100 + s * 66} ${y - 14} L${100 + s * 62} ${y + 4} L${100 + s * 48} ${y} L${100 + s * 40} ${y + 14} Z" ${st(shade(P, -40))}/>`;
        case 'leaf': return `<path d="M${100 + s * 24} ${y} C ${100 + s * 40} ${y - 50}, ${100 + s * 90} ${y - 50}, ${100 + s * 94} ${y - 20} C ${100 + s * 80} ${y + 10}, ${100 + s * 50} ${y + 20}, ${100 + s * 24} ${y + 12} Z" ${st('#5fcf74')}/><path d="M${100 + s * 28} ${y + 6} Q ${100 + s * 60} ${y - 14} ${100 + s * 88} ${y - 20}" ${ln(2)}/>`;
        default: return '';
      }
    };
    return side(-1) + side(1);
  }

  function horns(k, hx, hy, r, C) {
    const top = hy - r;
    switch (k) {
      case 'small': return `<path d="M${hx - 16} ${top + 6} l-6 -18 l14 10 z M${hx + 16} ${top + 6} l6 -18 l-14 10 z" ${st('#f4ead6')}/>`;
      case 'big': return `<path d="M${hx - 20} ${top + 8} C ${hx - 40} ${top - 10}, ${hx - 34} ${top - 34}, ${hx - 20} ${top - 40} C ${hx - 26} ${top - 20}, ${hx - 12} ${top - 8}, ${hx - 8} ${top + 4} Z M${hx + 20} ${top + 8} C ${hx + 40} ${top - 10}, ${hx + 34} ${top - 34}, ${hx + 20} ${top - 40} C ${hx + 26} ${top - 20}, ${hx + 12} ${top - 8}, ${hx + 8} ${top + 4} Z" ${st('#f4ead6')}/>`;
      case 'leaf': return `<path d="M${hx - 12} ${top + 4} C ${hx - 30} ${top - 20}, ${hx - 14} ${top - 36}, ${hx - 6} ${top - 30} C ${hx - 8} ${top - 16}, ${hx - 2} ${top - 6}, ${hx - 2} ${top + 4} Z M${hx + 12} ${top + 4} C ${hx + 30} ${top - 20}, ${hx + 14} ${top - 36}, ${hx + 6} ${top - 30} C ${hx + 8} ${top - 16}, ${hx + 2} ${top - 6}, ${hx + 2} ${top + 4} Z" ${st('#5fcf74')}/>`;
      case 'unicorn': return `<path d="M${hx - 7} ${top + 6} L${hx} ${top - 34} L${hx + 7} ${top + 6} Z" ${st('#ffe9a8')}/><path d="M${hx - 4} ${top - 4} l8 -4 M${hx - 3} ${top - 16} l6 -3" ${ln(2)}/>`;
      case 'bull': return `<path d="M${hx - r * .7} ${hy - r * .55} C ${hx - r * 1.4} ${hy - r * .6}, ${hx - r * 1.5} ${top - 10}, ${hx - r * 1.2} ${top - 18} C ${hx - r * 1.2} ${top}, ${hx - r * .9} ${hy - r * .8}, ${hx - r * .5} ${hy - r * .75} Z M${hx + r * .7} ${hy - r * .55} C ${hx + r * 1.4} ${hy - r * .6}, ${hx + r * 1.5} ${top - 10}, ${hx + r * 1.2} ${top - 18} C ${hx + r * 1.2} ${top}, ${hx + r * .9} ${hy - r * .8}, ${hx + r * .5} ${hy - r * .75} Z" ${st('#f4ead6')}/>`;
      default: return '';
    }
  }

  // Forma del cap segons l'animal (sempre amb la mateixa línia)
  function head(k, hx, hy, r, C) {
    const { P, L, D, B } = C;
    let s = '';
    if (k === 'lion' || k === 'wolf-mane') s += Array.from({ length: 12 }, (_, i) => { const a = i / 12 * Math.PI * 2; return `<circle cx="${hx + Math.cos(a) * r * .95}" cy="${hy + Math.sin(a) * r * .95}" r="${r * .38}" ${st(D)}/>`; }).join('');
    if (k === 'robot') return s + `<rect x="${hx - r}" y="${hy - r * .9}" width="${r * 2}" height="${r * 1.8}" rx="12" ${st(P)}/>`;
    if (k === 'bulb') return s + `<circle cx="${hx}" cy="${hy}" r="${r}" ${st('#fff6c8', 'fill-opacity=".95"')}/><path d="M${hx - 12} ${hy + r * .4} q 12 -20 24 0" ${ln(2.6)}/>`;
    if (k === 'horse') return s + `<ellipse cx="${hx}" cy="${hy}" rx="${r * .9}" ry="${r}" ${st(P)}/><ellipse cx="${hx}" cy="${hy + r * .62}" rx="${r * .62}" ry="${r * .42}" ${st(B)}/>`;
    if (k === 'whale' || k === 'jelly' || k === 'crystal' || r === 0) return s;
    const rx = k === 'bull' || k === 'otter' || k === 'beaver' ? r * 1.08 : r;
    s += `<ellipse cx="${hx}" cy="${hy}" rx="${rx}" ry="${r * .94}" ${st(P)}/>`;
    if (k === 'owl') s += `<path d="M${hx} ${hy - r * .55} C ${hx - r * .9} ${hy - r * .9}, ${hx - r * .95} ${hy + r * .5}, ${hx} ${hy + r * .62} C ${hx + r * .95} ${hy + r * .5}, ${hx + r * .9} ${hy - r * .9}, ${hx} ${hy - r * .55} Z" fill="${B}" stroke="${INK}" stroke-width="2.4"/>`;
    if (['fox', 'wolf', 'dog', 'ferret', 'squirrel'].includes(k)) s += `<path d="M${hx - r * .95} ${hy + r * .1} L${hx - r * 1.15} ${hy + r * .5} L${hx - r * .7} ${hy + r * .45} Z M${hx + r * .95} ${hy + r * .1} L${hx + r * 1.15} ${hy + r * .5} L${hx + r * .7} ${hy + r * .45} Z" ${st(B)}/><ellipse cx="${hx}" cy="${hy + r * .45}" rx="${r * .45}" ry="${r * .32}" ${st(B)}/>`;
    if (['otter', 'beaver', 'bull', 'lion', 'armadillo'].includes(k)) s += `<ellipse cx="${hx}" cy="${hy + r * .48}" rx="${r * .5}" ry="${r * .32}" ${st(B)}/>`;
    if (k === 'eagle') s += `<path d="M${hx - r * .8} ${hy - r * .1} Q ${hx} ${hy - r * .55} ${hx + r * .8} ${hy - r * .1}" ${ln(3)}/>`;
    if (k === 'armadillo') s += `<path d="M${hx - r * .8} ${hy - r * .55} Q ${hx} ${hy - r * 1.2} ${hx + r * .8} ${hy - r * .55}" fill="${D}" stroke="${INK}" stroke-width="3"/>`;
    return s;
  }

  function eyes(k, fx, fy, C, sz) {
    const g = (sz || 1), dx = 15 * g;
    switch (k) {
      case 'sharp': return [-1, 1].map(s => `<path d="M${fx + s * dx - 9 * g} ${fy - 2} Q ${fx + s * dx} ${fy - 12 * g} ${fx + s * dx + 9 * g} ${fy - 6 * g} Q ${fx + s * dx + 4} ${fy + 8 * g} ${fx + s * dx - 9 * g} ${fy - 2} Z" fill="${INK}"/><circle cx="${fx + s * dx + 2}" cy="${fy - 4 * g}" r="${2.4 * g}" fill="#fff"/><path d="M${fx + s * dx - 10 * g} ${fy - 14 * g} L${fx + s * dx + 8 * g} ${fy - 10 * g + s * 2}" ${ln(3)}/>`).join('');
      case 'small': return [-1, 1].map(s => `<circle cx="${fx + s * dx}" cy="${fy}" r="${4.6 * g}" fill="${INK}"/><circle cx="${fx + s * dx + 1.5}" cy="${fy - 1.6}" r="${1.6 * g}" fill="#fff"/>`).join('');
      case 'glasses': return [-1, 1].map(s => `<circle cx="${fx + s * dx}" cy="${fy}" r="${6 * g}" fill="${INK}"/><circle cx="${fx + s * dx + 2}" cy="${fy - 2}" r="${2.2 * g}" fill="#fff"/><circle cx="${fx + s * dx}" cy="${fy}" r="${11 * g}" fill="#fff" fill-opacity=".25" stroke="${INK}" stroke-width="3"/>`).join('') + `<path d="M${fx - dx + 11 * g} ${fy} H${fx + dx - 11 * g}" ${ln(3)}/>`;
      case 'robot': return [-1, 1].map(s => `<rect x="${fx + s * dx - 7 * g}" y="${fy - 6 * g}" width="${14 * g}" height="${12 * g}" rx="3" fill="#7af0ff" stroke="${INK}" stroke-width="3"/><rect x="${fx + s * dx - 2}" y="${fy - 3}" width="4" height="4" fill="${INK}"/>`).join('');
      case 'camera': return `<circle cx="${fx - dx}" cy="${fy}" r="${7 * g}" fill="${INK}"/><circle cx="${fx - dx + 2}" cy="${fy - 2}" r="2.4" fill="#fff"/><circle cx="${fx + dx}" cy="${fy}" r="${11 * g}" fill="#2a3442" stroke="${INK}" stroke-width="3"/><circle cx="${fx + dx}" cy="${fy}" r="${5 * g}" fill="#5fb6ff"/><circle cx="${fx + dx + 2}" cy="${fy - 2}" r="1.8" fill="#fff"/>`;
      default: return [-1, 1].map(s => `<ellipse cx="${fx + s * dx}" cy="${fy}" rx="${7.5 * g}" ry="${9 * g}" fill="${INK}"/><circle cx="${fx + s * dx + 2.5 * g}" cy="${fy - 3.5 * g}" r="${3 * g}" fill="#fff"/><circle cx="${fx + s * dx - 2.4 * g}" cy="${fy + 3.5 * g}" r="${1.4 * g}" fill="#fff"/>`).join('');
    }
  }
  function mouth(k, fx, fy) {
    switch (k) {
      case 'open': return `<path d="M${fx - 9} ${fy} Q ${fx} ${fy + 14} ${fx + 9} ${fy} Z" fill="#c2364a" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
      case 'fang': return `<path d="M${fx - 10} ${fy} Q ${fx} ${fy + 8} ${fx + 10} ${fy}" ${ln(3)}/><path d="M${fx - 6} ${fy + 2} l2 6 l3 -5 M${fx + 6} ${fy + 2} l-2 6 l-3 -5" fill="#fff" stroke="${INK}" stroke-width="1.8"/>`;
      case 'beak': return `<path d="M${fx - 8} ${fy - 4} L${fx + 8} ${fy - 4} L${fx} ${fy + 9} Z" fill="#f2a516" stroke="${INK}" stroke-width="3" stroke-linejoin="round"/>`;
      case 'teeth': return `<path d="M${fx - 9} ${fy} Q ${fx} ${fy + 6} ${fx + 9} ${fy}" ${ln(3)}/><rect x="${fx - 5}" y="${fy + 2}" width="10" height="8" rx="1.5" fill="#fff" stroke="${INK}" stroke-width="2"/><path d="M${fx} ${fy + 2} v8" ${ln(1.6)}/>`;
      case 'none': return '';
      default: return `<path d="M${fx - 8} ${fy} Q ${fx} ${fy + 8} ${fx + 8} ${fy}" ${ln(3)}/>`;
    }
  }

  function pattern(k, b, C, extra) {
    const { L, D, B } = C;
    if (!b && !['shell', 'glow', 'facets', 'map', 'panels', 'mask'].includes(k)) return '';
    switch (k) {
      case 'belly': return `<ellipse cx="${b[0]}" cy="${b[1]}" rx="${b[2]}" ry="${b[3]}" fill="${B}"/>`;
      case 'stripes': return b ? [-1, 0, 1].map(i => `<path d="M${b[0] - b[2]} ${b[1] + i * 11} Q ${b[0]} ${b[1] + i * 11 + 4} ${b[0] + b[2]} ${b[1] + i * 11}" ${ln(6)}/>`).join('') : '';
      case 'spots': return b ? [[-10, -6, 5], [8, 2, 6], [-4, 12, 4], [12, -10, 3.5]].map(([x, y, r]) => `<circle cx="${b[0] + x}" cy="${b[1] + y}" r="${r}" fill="${L}"/>`).join('') : '';
      case 'bands': return extra && extra.shell ? [-1, 0, 1].map(i => `<path d="M${100 + i * 24} 116 V156" ${ln(3)}/>`).join('') : '';
      case 'shell': return extra && extra.shell ? `<path d="M76 140 l12 -10 h24 l12 10 l-12 10 h-24 z M66 126 l10 4 M134 126 l-10 4" fill="${shade(C.P, 20)}" stroke="${INK}" stroke-width="2.4"/>` : extra && extra.crab ? `<path d="M74 126 Q 100 112 126 126" ${ln(2.4)}/>` : '';
      case 'glow': return `<circle cx="100" cy="112" r="64" fill="url(#cmglow${C.uid})" opacity=".55"/>`;
      case 'facets': return `<path d="M100 46 L100 172 M54 104 H146 M78 76 L122 140 M122 76 L78 140" fill="none" stroke="#fff" stroke-opacity=".45" stroke-width="2.4"/>`;
      case 'map': return `<path d="M40 112 c10 -10 22 -6 26 4 c4 10 -10 16 -6 24 M96 90 c10 4 20 -2 26 6 c4 8 -6 14 0 22 c8 6 18 0 22 8" fill="none" stroke="${L}" stroke-width="5" stroke-linecap="round"/>`;
      case 'panels': return `<path d="M82 128 h14 v14 h-14 z M104 128 h14 v14 h-14 z" fill="${L}" stroke="${INK}" stroke-width="2.4"/>`;
      case 'mask': return '';
      default: return '';
    }
  }

  function crown(k, hx, top, C) {
    switch (k) {
      case 'crown': return `<path d="M${hx - 22} ${top + 6} L${hx - 24} ${top - 18} L${hx - 10} ${top - 6} L${hx} ${top - 24} L${hx + 10} ${top - 6} L${hx + 24} ${top - 18} L${hx + 22} ${top + 6} Z" ${st('#ffd23a')}/><circle cx="${hx}" cy="${top - 6}" r="3.5" fill="#e2577a"/>`;
      case 'tiara': return `<path d="M${hx - 20} ${top + 6} Q ${hx} ${top - 22} ${hx + 20} ${top + 6}" ${st('#ffe9a8')}/><circle cx="${hx}" cy="${top - 7}" r="5" ${st('#7af0ff')}/>`;
      case 'flames': return [-16, 0, 16].map((d, i) => `<path d="M${hx + d - 8} ${top + 6} C ${hx + d - 10} ${top - 12}, ${hx + d} ${top - 18}, ${hx + d} ${top - 28 - (i === 1 ? 8 : 0)} C ${hx + d + 6} ${top - 14}, ${hx + d + 10} ${top - 6}, ${hx + d + 8} ${top + 6} Z" ${st('#ff8a3a')}/>`).join('');
      case 'orbit': return `<ellipse cx="${hx}" cy="${top - 10}" rx="34" ry="9" fill="none" stroke="${INK}" stroke-width="5"/><ellipse cx="${hx}" cy="${top - 10}" rx="34" ry="9" fill="none" stroke="#ffe08a" stroke-width="2.4"/><circle cx="${hx + 30}" cy="${top - 14}" r="4.5" ${st('#7af0ff')}/><circle cx="${hx - 26}" cy="${top - 4}" r="3.5" ${st('#ff9bb4')}/>`;
      case 'laurel': return [-1, 1].map(s => [0, 1, 2].map(i => `<ellipse cx="${hx + s * (14 + i * 9)}" cy="${top + 4 - i * 2 + i * i * 2}" rx="6" ry="3.4" transform="rotate(${s * (30 + i * 20)} ${hx + s * (14 + i * 9)} ${top + 4})" ${st('#e8c13a')}/>`).join('')).join('');
      case 'cap': return `<path d="M${hx - 26} ${top - 4} L${hx} ${top - 16} L${hx + 26} ${top - 4} L${hx} ${top + 8} Z" ${st('#2a2a35')}/><path d="M${hx + 18} ${top - 2} v14" ${ln(2.4)}/><circle cx="${hx + 18}" cy="${top + 14}" r="3" fill="#ffd23a"/>`;
      case 'star': return `<path d="M${hx} ${top - 30} l6 12 l13 2 l-10 9 l3 13 l-12 -7 l-12 7 l3 -13 l-10 -9 l13 -2 z" ${st('#ffd23a')}/>`;
      case 'bolt': return `<path d="M${hx - 4} ${top - 32} L${hx - 14} ${top - 8} H${hx - 2} L${hx - 8} ${top + 8} L${hx + 14} ${top - 16} H${hx + 2} L${hx + 8} ${top - 32} Z" ${st('#ffd23a')}/>`;
      case 'moon': return `<path d="M${hx + 4} ${top - 34} A 16 16 0 1 0 ${hx + 8} ${top + 2} A 12 12 0 1 1 ${hx + 4} ${top - 34} Z" ${st('#fff4c4')}/>`;
      case 'halo': return `<ellipse cx="${hx}" cy="${top - 12}" rx="24" ry="7" fill="none" stroke="#ffd23a" stroke-width="5"/>`;
      case 'gear': return `<g transform="translate(${hx} ${top - 14})"><circle r="12" ${st('#b9c3d0')}/>${[0, 1, 2, 3, 4, 5].map(i => `<rect x="-3.5" y="-17" width="7" height="8" rx="1.5" transform="rotate(${i * 60})" ${st('#b9c3d0')}/>`).join('')}<circle r="4.5" fill="${INK}"/></g>`;
      case 'coins': return [-14, 0, 14].map((d, i) => `<ellipse cx="${hx + d}" cy="${top - 6 - (i === 1 ? 10 : 0)}" rx="9" ry="9" ${st('#ffd23a')}/><path d="M${hx + d} ${top - 11 - (i === 1 ? 10 : 0)} v10" ${ln(2)}/>`).join('');
      default: return '';
    }
  }

  // Objecte característic de l'especialitat (a la mà o al pit)
  function acc(k, x, y) {
    const t = `transform="translate(${x} ${y})"`;
    const g = (s) => `<g ${t}>${s}</g>`;
    switch (k) {
      case 'megaphone': return g(`<path d="M-6 -6 L18 -16 V16 L-6 6 Z" ${st('#ff5a5a')}/><rect x="-14" y="-6" width="9" height="12" rx="2" ${st('#ffd23a')}/><path d="M24 -8 l6 -4 M24 8 l6 4 M26 0 h8" ${ln(2.4)}/>`);
      case 'chart': return g(`<rect x="-14" y="-14" width="30" height="26" rx="3" ${st('#fff')}/><path d="M-8 8 v-6 M0 8 v-12 M8 8 v-8" fill="none" stroke="#3a8fe0" stroke-width="4" stroke-linecap="round"/><path d="M-10 -6 L-2 -10 L6 -4 L12 -10" ${ln(2)}/>`);
      case 'badge': return g(`<circle r="12" ${st('#ffd23a')}/><path d="M-6 0 l4 4 l8 -9" ${ln(2.6)}/>`);
      case 'coin': return g(`<circle r="11" ${st('#ffd23a')}/><path d="M3 -6 a6 6 0 1 0 0 12 M-6 -2 h7 M-6 2 h7" ${ln(2.2)}/>`);
      case 'heart': return g(`<path d="M0 10 C -18 -2, -10 -16, 0 -6 C 10 -16, 18 -2, 0 10 Z" ${st('#ff5a7a')}/>`);
      case 'phone': return g(`<rect x="-9" y="-15" width="18" height="30" rx="4" ${st('#2a3442')}/><rect x="-6" y="-10" width="12" height="18" rx="1.5" fill="#7af0ff"/><path d="M-3 0 l2 2 l4 -5" ${ln(1.8)}/>`);
      case 'tie': return g(`<path d="M-5 -12 H5 L3 -6 L8 12 L0 18 L-8 12 L-3 -6 Z" ${st('#3a5fd6')}/><path d="M-4 2 l8 -4 M-5 8 l9 -4" fill="none" stroke="#ffd23a" stroke-width="2"/>`);
      case 'briefcase': return g(`<rect x="-16" y="-10" width="32" height="22" rx="3" ${st('#7a4a2a')}/><path d="M-6 -10 v-5 h12 v5 M-16 0 h32" ${ln(2.4)}/>`);
      case 'book': return g(`<path d="M-16 -10 Q -8 -14 0 -10 Q 8 -14 16 -10 V12 Q 8 8 0 12 Q -8 8 -16 12 Z" ${st('#c8424b')}/><path d="M0 -10 V12" ${ln(2)}/>`);
      case 'palette': return g(`<path d="M0 -14 C 18 -14, 20 4, 10 8 C 4 10, 6 16, 0 16 C -16 16, -18 -14, 0 -14 Z" ${st('#f4e3c4')}/><circle cx="-6" cy="-6" r="3" fill="#ff5a5a"/><circle cx="4" cy="-8" r="3" fill="#3a8fe0"/><circle cx="-8" cy="4" r="3" fill="#3fae6a"/>`);
      case 'magnifier': return g(`<circle cx="-4" cy="-4" r="10" fill="#d8f4ff" stroke="${INK}" stroke-width="3.4"/><path d="M4 4 l12 12" ${ln(5)}/>`);
      case 'box': return g(`<path d="M-14 -6 L0 -14 L14 -6 V10 L0 18 L-14 10 Z" ${st('#d9a865')}/><path d="M-14 -6 L0 2 L14 -6 M0 2 V18" ${ln(2.2)}/>`);
      case 'truck': return g(`<rect x="-20" y="-12" width="24" height="18" rx="2" ${st('#ffd23a')}/><path d="M4 -6 H14 L20 2 V6 H4 Z" ${st('#ff8a3a')}/><circle cx="-12" cy="8" r="5" ${st('#2a3442')}/><circle cx="12" cy="8" r="5" ${st('#2a3442')}/>`);
      case 'mic': return g(`<rect x="-6" y="-16" width="12" height="18" rx="6" ${st('#b9c3d0')}/><path d="M-10 -2 a10 10 0 0 0 20 0 M0 8 v8 M-6 16 h12" ${ln(2.6)}/>`);
      case 'chess': return g(`<path d="M-8 14 H8 L6 4 C 10 0, 8 -8, 2 -10 C 4 -14, 0 -18, -4 -14 C -10 -10, -10 -2, -6 4 Z" ${st('#fff4c4')}/><circle cx="0" cy="-5" r="1.8" fill="${INK}"/>`);
      case 'pie': return g(`<circle r="13" ${st('#fff')}/><path d="M0 0 V-13 A13 13 0 0 1 12 5 Z" ${st('#e2577a')}/><path d="M0 0 L12 5 A13 13 0 0 1 -6 11 Z" ${st('#3fb5e8')}/>`);
      case 'compass': return g(`<circle r="13" ${st('#f4ead6')}/><path d="M0 -10 L4 0 L0 10 L-4 0 Z" ${st('#e2577a')}/><circle r="2" fill="${INK}"/>`);
      case 'clipboard': return g(`<rect x="-12" y="-14" width="24" height="30" rx="3" ${st('#c99a5a')}/><rect x="-8" y="-9" width="16" height="22" fill="#fff"/><path d="M-5 -4 h10 M-5 1 h10 M-5 6 h7" ${ln(1.8)}/><rect x="-5" y="-17" width="10" height="5" rx="2" ${st('#b9c3d0')}/>`);
      case 'scale': return g(`<path d="M0 -14 V12 M-14 -8 H14 M-8 12 H8" ${ln(3)}/><path d="M-20 4 L-14 -8 L-8 4 Z M8 4 L14 -8 L20 4 Z" ${st('#ffd23a')}/>`);
      case 'magnet': return g(`<path d="M-12 -12 V2 A12 12 0 0 0 12 2 V-12 H5 V2 A5 5 0 0 1 -5 2 V-12 Z" ${st('#ff5a5a')}/><path d="M-12 -12 h7 v6 h-7 z M5 -12 h7 v6 h-7 z" fill="#e8eef5" stroke="${INK}" stroke-width="2"/>`);
      case 'contract': return g(`<path d="M-12 -14 H10 L14 -10 V14 H-12 Z" ${st('#fff')}/><path d="M-7 -6 h14 M-7 0 h14 M-7 7 q4 -6 8 0 t8 -2" ${ln(1.8)}/>`);
      case 'card': return g(`<rect x="-15" y="-10" width="30" height="20" rx="3" ${st('#ffd23a')}/><path d="M-10 -2 h8 M-10 4 h14" ${ln(2)}/><circle cx="9" cy="-3" r="3" fill="#e2577a"/>`);
      case 'headset': return g(`<path d="M-14 4 V-2 A14 14 0 0 1 14 -2 V4" ${ln(3.6)}/><rect x="-18" y="0" width="8" height="12" rx="3" ${st('#3a8fe0')}/><rect x="10" y="0" width="8" height="12" rx="3" ${st('#3a8fe0')}/><path d="M14 12 q-4 8 -14 8" ${ln(2.4)}/>`);
      case 'sign': return g(`<rect x="-18" y="-12" width="36" height="20" rx="3" ${st('#ff5a5a')}/><text x="0" y="3" text-anchor="middle" font-size="11" font-weight="900" font-family="sans-serif" fill="#fff">−50%</text><path d="M0 8 V18" ${ln(3)}/>`);
      case 'pen': return g(`<path d="M-12 12 L8 -8 L14 -2 L-6 18 Z" ${st('#2a2a35')}/><path d="M8 -8 l4 -4 l6 6 l-4 4" ${st('#ffd23a')}/>`);
      case 'camera': return g(`<rect x="-15" y="-9" width="30" height="20" rx="4" ${st('#2a3442')}/><circle cx="0" cy="1" r="7" ${st('#5fb6ff')}/><rect x="6" y="-13" width="7" height="5" rx="1.5" fill="${INK}"/>`);
      case 'letter': return g(`<rect x="-14" y="-9" width="28" height="18" rx="2" ${st('#fff')}/><path d="M-14 -9 L0 3 L14 -9" ${ln(2.2)}/>`);
      case 'stars': return g([[-10, 0], [0, -10], [10, 0]].map(([dx, dy]) => `<path d="M${dx} ${dy - 7} l2.2 4.6 l5 .7 l-3.6 3.4 l.9 5 l-4.5 -2.4 l-4.5 2.4 l.9 -5 l-3.6 -3.4 l5 -.7 z" ${st('#ffd23a')}/>`).join(''));
      case 'bag': return g(`<path d="M-12 -6 H12 L14 16 H-14 Z" ${st('#ff8a3a')}/><path d="M-6 -6 V-10 A6 6 0 0 1 6 -10 V-6" ${ln(2.6)}/>`);
      case 'barcode': return g(`<rect x="-15" y="-10" width="30" height="20" rx="2" ${st('#fff')}/>${[-10, -7, -3, 0, 4, 7, 10].map((x, i) => `<path d="M${x} -6 V6" stroke="${INK}" stroke-width="${i % 3 ? 1.6 : 2.6}"/>`).join('')}`);
      case 'rocket': return g(`<path d="M0 -18 C 10 -8, 10 6, 6 12 H-6 C -10 6, -10 -8, 0 -18 Z" ${st('#e8eef5')}/><circle cx="0" cy="-4" r="4" ${st('#3a8fe0')}/><path d="M-6 12 L-12 18 L-8 6 M6 12 L12 18 L8 6" ${st('#ff5a5a')}/><path d="M-3 14 L0 24 L3 14" fill="#ffd23a"/>`);
      case 'calculator': return g(`<rect x="-11" y="-15" width="22" height="30" rx="3" ${st('#3a4250')}/><rect x="-7" y="-11" width="14" height="7" fill="#a8f0a0"/>${[0, 1, 2].map(r => [0, 1, 2].map(c => `<rect x="${-7 + c * 5.4}" y="${-1 + r * 5}" width="3.6" height="3.4" rx=".8" fill="#e8eef5"/>`).join('')).join('')}`);
      case 'passport': return g(`<rect x="-11" y="-14" width="22" height="28" rx="3" ${st('#2c4a8a')}/><circle cx="0" cy="-2" r="6" fill="none" stroke="#ffd23a" stroke-width="2"/><path d="M-6 8 h12" stroke="#ffd23a" stroke-width="2"/>`);
      case 'globe': return g(`<circle r="14" ${st('#5fb6ff')}/><path d="M-8 -6 c4 -2 8 2 6 6 c-2 4 4 6 8 2 M-12 4 c4 2 6 6 2 8" fill="none" stroke="#5fcf74" stroke-width="3.4" stroke-linecap="round"/><path d="M-14 0 H14 M0 -14 C 8 -6, 8 6, 0 14 C -8 6, -8 -6, 0 -14" fill="none" stroke="${INK}" stroke-width="1.6"/>`);
      case 'gear': return g(`<circle r="10" ${st('#b9c3d0')}/>${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `<rect x="-3" y="-15" width="6" height="7" rx="1" transform="rotate(${i * 45})" ${st('#b9c3d0')}/>`).join('')}<circle r="4" fill="${INK}"/>`);
      case 'puzzle': return g(`<path d="M-12 -12 H-3 a4 4 0 1 1 6 0 H12 V-3 a4 4 0 1 1 0 6 V12 H-12 Z" ${st('#ff8a3a')}/>`);
      case 'board': return g(`<rect x="-16" y="-12" width="32" height="24" rx="2" ${st('#f4ead6')}/><rect x="-16" y="-12" width="8" height="8" fill="#e2577a"/><rect x="8" y="4" width="8" height="8" fill="#3fae6a"/><path d="M-6 2 l3 -6 l3 6 z M4 -8 h6 v5 h-6 z" fill="#c8424b" stroke="${INK}" stroke-width="1.6"/>`);
      case 'trophy': return g(`<path d="M-10 -14 H10 V-4 A10 10 0 0 1 -10 -4 Z" ${st('#ffd23a')}/><path d="M-10 -10 h-6 a6 6 0 0 0 8 8 M10 -10 h6 a6 6 0 0 1 -8 8 M0 6 V12 M-7 14 H7" ${ln(2.6)}/>`);
      default: return '';
    }
  }

  /* ---------- Composició ---------- */
  // opts: { size (px), silhouette (bool: Comerçmon no descobert), cls }
  function render(sp, formIdx, opts) {
    opts = opts || {};
    const f = sp.forms[Math.min(formIdx || 0, sp.forms.length - 1)], lk = f.look || {};
    const ty = GD.cmTypes[sp.type] || GD.cmTypes.foc;
    const uid = 'cm' + (++uidN);
    const P = lk.color || ty.c, P2 = mix(ty.c, ty.c2, .35);
    const C = { P, P2, L: ty.c2, D: shade(P, -38), B: mix(ty.c2, '#ffffff', .55), uid };
    const bd = body(lk.body, C);
    const [hx, hy, hr] = bd.head;
    const face = bd.face || [hx, hy + (hr ? hr * .12 : 0)];
    const tailAnchor = { bird: [124, 150], octo: [0, 0], crab: [0, 0], turtle: [146, 152], horse: [134, 140], lizard: [140, 152], snail: [0, 0], jelly: [0, 0], cart: [0, 0], robot: [0, 0], bulb: [0, 0], whale: [0, 0] }[lk.body] || [128, 150];
    const nF = sp.forms.length, fi = Math.min(formIdx || 0, nF - 1);
    const scale = nF === 1 ? 1.06 : 0.86 + 0.26 * fi / (nF - 1); // les formes avançades són més grans
    let s = '';
    // aura (formes avançades i llegendaris)
    if (lk.aura) s += `<circle cx="100" cy="112" r="${lk.aura > 1 ? 92 : 84}" fill="url(#aura${uid})"/>` + (lk.aura > 1 ? [[30, 50], [170, 60], [36, 160], [168, 158], [100, 18]].map(([x, y]) => `<path d="M${x} ${y - 7} l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" fill="#fff6c8"/>`).join('') : '');
    // aura màxima (darreres formes): anell d'energia i més espurnes
    if (lk.aura > 2) s += `<ellipse cx="100" cy="164" rx="70" ry="16" fill="none" stroke="${ty.c2}" stroke-width="5" opacity=".75"/><ellipse cx="100" cy="164" rx="58" ry="11" fill="none" stroke="#fff6c8" stroke-width="2.5" opacity=".9"/>` + [[16, 104], [184, 104], [58, 26], [142, 22], [100, 196]].map(([x, y]) => `<path d="M${x} ${y - 9} l2.5 6.5 l6.5 2.5 l-6.5 2.5 l-2.5 6.5 l-2.5 -6.5 l-6.5 -2.5 l6.5 -2.5 z" fill="${ty.c2}" stroke="${INK}" stroke-width="1.2"/>`).join('');
    // capa (formes noves): darrere del cos
    if (lk.cape && hr) s += `<path d="M${hx - hr * .7} ${hy + hr * .55} C ${hx - hr * 1.5} ${hy + hr * 1.6}, ${hx - hr * 1.3} ${hy + hr * 2.4}, ${hx - hr * 1.15} ${hy + hr * 2.55} L ${hx + hr * 1.15} ${hy + hr * 2.55} C ${hx + hr * 1.3} ${hy + hr * 2.4}, ${hx + hr * 1.5} ${hy + hr * 1.6}, ${hx + hr * .7} ${hy + hr * .55} Z" ${st(shade(ty.c, -55))}/><path d="M${hx - hr * .9} ${hy + hr * 2.4} L ${hx + hr * .9} ${hy + hr * 2.4}" stroke="${ty.c2}" stroke-width="4" stroke-linecap="round"/>`;
    else if (lk.cape) s += `<path d="M60 104 C 30 140, 34 176, 44 184 L 156 184 C 166 176, 170 140, 140 104 Z" ${st(shade(ty.c, -55))}/>`;
    if (lk.wings) s += wings(lk.wings, C, hx, hy);
    if (lk.tail && tailAnchor[0]) s += tail(lk.tail, C, tailAnchor, lk.tails);
    if (lk.mane && hr) s += head('wolf-mane', hx, hy, hr, C).split('<ellipse')[0];
    s += bd.svg;
    s += pattern(lk.pattern, bd.belly, C, { shell: bd.shell, crab: lk.body === 'crab' });
    if (hr && lk.ears && !['none', 'flame', 'leaf', 'antenna', 'crest', 'spikes', 'brush'].includes(lk.ears)) s += ears(lk.ears, hx, hy, hr, C);
    if (hr && lk.ears === 'spikes') s += ears('spikes', hx, hy, hr, C);
    if (lk.horns === 'bull' && hr) s += horns('bull', hx, hy, hr, C);
    s += head(lk.head, hx, hy, hr, C);
    if (hr && ['flame', 'leaf', 'antenna', 'crest', 'brush'].includes(lk.ears)) s += ears(lk.ears, hx, hy, hr, C);
    if (lk.horns && lk.horns !== 'bull' && hr) s += horns(lk.horns, hx, hy, hr, C);
    if (!hr && lk.ears === 'antenna') s += ears('antenna', face[0], face[1] - 4, 34, C);
    if (lk.pattern === 'mask' && hr) s += `<path d="M${hx - hr * .9} ${hy - 4} Q ${hx} ${hy - hr * .35} ${hx + hr * .9} ${hy - 4} Q ${hx} ${hy + hr * .25} ${hx - hr * .9} ${hy - 4} Z" fill="${C.D}" opacity=".85"/>`;
    // cara
    const eyeY = face[1] - (hr ? hr * .12 : 4), eyeSz = hr ? Math.max(.8, Math.min(1.15, hr / 38)) : 1;
    s += eyes(lk.eyes, face[0], eyeY, C, eyeSz);
    s += `<ellipse cx="${face[0] - 24 * eyeSz}" cy="${eyeY + 13}" rx="6" ry="3.5" fill="#ff7a8a" opacity=".55"/><ellipse cx="${face[0] + 24 * eyeSz}" cy="${eyeY + 13}" rx="6" ry="3.5" fill="#ff7a8a" opacity=".55"/>`;
    s += mouth(lk.mouth, face[0], eyeY + 17 * eyeSz);
    if (lk.crown) s += crown(lk.crown, hx, (hr ? hy - hr : face[1] - 50) - 2, C);
    // gemma al pit (darrera forma)
    if (lk.gem) { const g = bd.belly ? [bd.belly[0], bd.belly[1] - 4] : [100, 150]; s += `<path d="M${g[0]} ${g[1] - 11} L${g[0] + 9} ${g[1]} L${g[0]} ${g[1] + 11} L${g[0] - 9} ${g[1]} Z" ${st(ty.c2)}/><path d="M${g[0]} ${g[1] - 11} L${g[0]} ${g[1] + 11} M${g[0] - 9} ${g[1]} H${g[0] + 9}" stroke="#fff" stroke-opacity=".7" stroke-width="1.6"/>`; }
    if (lk.acc) {
      const ap = { octo: [150, 124], crab: [100, 160], crystal: [146, 150], whale: [118, 156], snail: [150, 168], jelly: [100, 82], cart: [104, 120], bulb: [146, 150] }[lk.body] || [140, 146];
      s += acc(lk.acc, ap[0], ap[1]);
    }
    const defs = `<defs><radialGradient id="aura${uid}"><stop offset="0" stop-color="${ty.c2}" stop-opacity=".9"/><stop offset=".6" stop-color="${ty.c}" stop-opacity=".25"/><stop offset="1" stop-color="${ty.c}" stop-opacity="0"/></radialGradient><radialGradient id="cmglow${uid}"><stop offset="0" stop-color="#fff6c8"/><stop offset="1" stop-color="#fff6c8" stop-opacity="0"/></radialGradient></defs>`;
    const inner = `<g transform="translate(100 112) scale(${scale}) translate(-100 -112)">${s}</g>`;
    const sil = opts.silhouette ? ` style="filter:brightness(0) opacity(.28)"` : '';
    return `<svg class="cm-art ${opts.cls || ''}" viewBox="0 0 200 200" width="${opts.size || 160}" height="${opts.size || 160}" role="img" aria-label="${opts.silhouette ? '???' : f.name}"${sil}>${defs}${inner}</svg>`;
  }

  window.CMART = { render };
})();
