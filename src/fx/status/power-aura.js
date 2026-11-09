import { fit, mix, band, rand, tileFbm, TAU } from "../../core/index.js";
import { shape, tnoise } from "./_lib.js";

export const meta = {
  name: "Power aura",
  desc: "A calm, steady aura: a soft cocoon of energy wraps the whole body, a bright rim hugs it, motes circle round it on tilted rings and a ring of light turns on the floor.",
  tags: ["status", "aura", "power", "buff", "charge", "energy", "loop"],
  size: [96, 96],
  origin: [48, 84],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  actor: 2,
  options: {
    palette: ["#1e1206", "#4a2c08", "#86520c", "#c48412", "#f0b424", "#ffe066", "#fff6c4", "#ffffff"],
    height: 1,
    seed: 3,
  },
};

// standing easy inside the aura, breathing slowly with the surge: the shell is drawn round this stance
const STANCE = { crouch: 1 };
const INHALE = { hy: -1 };
export const act = {
  onBody: true,
  target: false,
  poses: [[0, INHALE], [1.2, STANCE, "in"], [2.4, INHALE, "in"]],
};

const D = meta.duration;
// two surges a loop: the aura swells, the body flares, the ring brightens
const surge = (t) => 0.5 + 0.5 * Math.cos((t / D) * TAU);

// how far each cell round the body is from it, stretched so the field reaches up much further than down
const PAD = 16, FIELDS = new WeakMap();
function field(a) {
  let f = FIELDS.get(a.mask);
  if (f) return f;
  const S = shape(a), W = S.w + PAD * 2, H = S.h + PAD * 2, d = new Float32Array(W * H);
  for (let gy = 0; gy < H; gy++)
    for (let gx = 0; gx < W; gx++) {
      const x = gx - PAD, y = gy - PAD;
      let m = 1e9;
      for (const [bx, by] of S.body) {
        const dy = y - by, e = Math.hypot(x - bx, dy < 0 ? dy * 0.85 : dy * 1.5);
        if (e < m) m = e;
      }
      d[gy * W + gx] = m;
    }
  f = { W, H, d, at: (x, y) => (x < -PAD || y < -PAD || x >= S.w + PAD || y >= S.h + PAD ? 1e9 : d[(y + PAD) * W + x + PAD]) };
  FIELDS.set(a.mask, f);
  return f;
}

// outline cells that face up or out, where the outer glow sits, every other one, worked out once per mask
const ROOTS = new WeakMap();
function roots(a) {
  let r = ROOTS.get(a.mask);
  if (r) return r;
  const S = shape(a);
  r = S.outline.filter(([x, y, nx, ny], i) => ny < 0.35 && y < S.h - 2 && (x + y) % 2 === 0);
  ROOTS.set(a.mask, r);
  return r;
}

// motes wrapping round the body on tilted rings, drifting slowly up as they go: the far side behind, the near side in front
function orbit(p, t, o, C, a, front) {
  const ph = t / D;
  for (let i = 0; i < 14; i++) {
    const turns = 1 + (i % 2), g = (ph * turns + rand(i, o.seed, 1)) * TAU * (i % 3 ? 1 : -1);
    if ((Math.sin(g) >= 0) !== front) continue;
    const rise = ((ph + rand(i, o.seed, 2)) % 1), y0 = -4 - rise * (-a.y + 8), rx = 17 + 4 * rand(i, o.seed, 3) - rise * 4;
    const x = Math.cos(g) * rx, y = y0 + Math.sin(g) * 3;
    const k = Math.sin(Math.PI * rise) * (front ? 1 : 0.6);
    // a short trail behind each mote
    for (let j = 1; j <= 5; j++) {
      const gj = g - j * 0.09 * (i % 3 ? 1 : -1);
      p.dot(Math.cos(gj) * rx, y0 + Math.sin(gj) * 3, C[j < 3 ? 6 : 4], k * (1 - j / 6));
    }
    p.px(x, y, k > 0.6 ? C[7] : C[6]);
    p.glow(x, y, 3, C[5], 0.3 * k);
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), F = fit([...o.palette].reverse(), 9), a = o.actor, S = shape(a), s = surge(t), hk = o.height ?? 1;
  // a pool of light on the floor and the far half of the turning ring
  p.shade(-34, -5, 34, 7, (x, y, out) => {
    const d = Math.hypot(x / 30, (y - 0.5) / 5);
    if (d < 1) (out.l = C[4]), (out.k = (0.18 + 0.18 * s) * (1 - d) * (1 - d));
  });
  band(p, 0, 0, 20 + s, 0.22, 1, 0.4 + 0.25 * s, [C[2], C[3], C[5], C[6]], (g) => Math.sin(g + t * (TAU / D)) < 0);
  // the envelope: a translucent shell of energy round the whole body, its edge licking upward on looping noise
  const Fd = field(a), ph = t / D, PY = 2;
  for (let my = -PAD; my < S.h; my++)
    for (let mx = -PAD; mx < S.w + PAD; mx++) {
      const d = Fd.at(mx, my);
      if (d < 0.5 || d > 15) continue;
      const n = tileFbm(mx * 0.13, my * 0.09 + ph * PY, 0, PY, o.seed, 2);
      const edge = hk * (6.5 + 1.5 * s + 3 * n);
      if (d > edge) continue;
      const u = d / edge, X = a.x + mx, Y = a.y + my;
      if (u > 0.86) p.px(X, Y, u > 0.95 ? C[3] : C[5]);
      else if (u > 0.74) p.blend(X, Y, C[4], 0.55);
      else p.blend(X, Y, C[u < 0.4 ? 6 : 5], 0.14 + 0.3 * u * u);
      p.light(X, Y, C[5], 0.1 * (1 - u * 0.6));
    }
  // a dim second rank further out, so the aura has depth
  const R = roots(a);
  R.forEach(([x, y, nx, ny], i) => {
    if (i % 3) return;
    const lift = 1 - y / S.h, n = tnoise(t, D, 2, o.seed + 91 + i);
    p.glow(a.x + x + nx * 3, a.y + y - 3 - lift * 4, 5, C[4], (0.1 + 0.08 * s) * (0.7 + 0.3 * n));
  });
  orbit(p, t, o, C, a, false);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), a = o.actor, S = shape(a), s = surge(t);
  // a bright rim hugging the body, flickering cell by cell
  for (const [x, y, nx, ny] of S.outline) {
    if (y >= S.h - 1) continue;
    const f = 0.5 + 0.5 * Math.sin(t * (TAU / D) * 2 + rand(x, y, o.seed) * TAU);
    const k = (0.35 + 0.4 * s) * (0.5 + 0.5 * f) * (ny < 0.35 ? 1 : 0.5);
    p.blend(a.x + x, a.y + y, f > 0.8 ? C[7] : C[6], k * 0.8);
  }
  // the body itself glows with the surge
  p.glow(0, a.y + a.h * 0.45, 22, C[4], 0.12 + 0.2 * s);
  p.glow(0, a.y + 6, 10, C[6], 0.06 + 0.12 * s);
  orbit(p, t, o, C, a, true);
  // the near half of the ring, in front of the feet
  band(p, 0, 0, 20 + s, 0.22, 1, 0.4 + 0.25 * s, [C[2], C[3], C[4], C[5]], (g) => Math.sin(g + t * (TAU / D)) >= 0);
  // sparks dancing along the ring
  for (let i = 0; i < 4; i++) {
    const g = t * (TAU / D) + (i * TAU) / 4 + rand(i, o.seed) * 0.6, r = 20 + s;
    const x = Math.cos(g) * r, y = Math.sin(g) * r * 0.22;
    p.px(x, y, mix(C[6], C[7], s));
    p.glow(x, y, 4, C[5], 0.35);
  }
}
