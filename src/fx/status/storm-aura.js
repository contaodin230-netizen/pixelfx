import { fit, rand, Rng, bolt, sparkle, cycle, TAU } from "../../core/index.js";
import { shape } from "./_lib.js";

export const meta = {
  name: "Storm aura",
  desc: "A live current traces the body's outline, pulses race round it, small arcs jump off, glowing orbs circle the body and stars twinkle round it.",
  tags: ["status", "aura", "lightning", "electric", "buff", "orbs", "stars", "loop"],
  size: [96, 96],
  origin: [48, 84],
  duration: 2.4,
  loop: true,
  fps: 30,
  bg: "dark",
  actor: 2,
  options: {
    palette: ["#0a0f2e", "#172a78", "#2550d0", "#3f8cff", "#7cc8ff", "#a8dcff", "#c8f0ff", "#ffffff"],
    orbs: 3,
    seed: 5,
  },
};

// it reads the body's outline, so in a game pass the current sprite frame's mask as o.actor and it follows any pose
export const act = { onBody: true, target: false, poses: [[0, { crouch: 1 }], [1.2, { hy: -1 }, "in"], [2.4, { crouch: 1 }, "in"]] };

const D = meta.duration, HZ = 15, SLOTS = Math.round(D * HZ);

/** The middle of the body, for the angle each outline cell sits at and the orbs' path. */
function centre(a, S) {
  return [a.x + S.w / 2, a.y + S.h * 0.45];
}

/** Orbs circling the body on a tilted ring, bobbing; front true draws the near half, false the far half. */
function orbs(p, t, o, C, a, S, front) {
  const ph = t / D, [cx, cy] = centre(a, S), rx = S.w / 2 + 9, n = o.orbs ?? 3;
  for (let i = 0; i < n; i++) {
    const g = ph * TAU + (i * TAU) / n;
    if ((Math.sin(g) >= 0) !== front) continue;
    const at = (gg) => [cx + Math.cos(gg) * rx, cy + Math.sin(gg) * 3 + Math.cos(gg) * 5 + Math.sin(ph * TAU * 2 + i * 2.1) * 4];
    const [x, y] = at(g), k = front ? 1 : 0.55;
    for (let j = 6; j >= 1; j--) {
      const [tx, ty] = at(g - j * 0.07);
      p.dot(tx, ty, C[j < 3 ? 6 : 4], k * (1 - j / 7));
    }
    p.circle(x, y, 1.7, C[5], k);
    p.px(x, y, C[7]);
    p.glow(x, y, 7, C[4], 0.45 * k);
    p.glow(x, y, 3, C[6], 0.5 * k);
  }
}

export function drawBack(p, t, o) {
  const C = fit(o.palette, 8), a = o.actor, S = shape(a);
  // a faint cold pool on the floor
  p.shade(-26, -3, 26, 5, (x, y, out) => {
    const d = Math.hypot(x / 24, (y - 0.5) / 4);
    if (d < 1) (out.l = C[3]), (out.k = 0.22 * (1 - d) * (1 - d));
  });
  orbs(p, t, o, C, a, S, false);
}

export function draw(p, t, o) {
  const C = fit(o.palette, 8), a = o.actor, S = shape(a), ph = t / D, q = Math.floor(ph * SLOTS) % SLOTS;
  const [cx, cy] = centre(a, S);
  // the current: every outline cell crackles a pixel in or out each tick; two pulses race round it in opposite directions
  for (const [x, y, nx, ny] of S.outline) {
    if (y >= S.h - 1) continue;
    const X = a.x + x, Y = a.y + y, th = Math.atan2(Y - cy, X - cx);
    const w1 = Math.pow(Math.max(0, Math.cos(th - ph * TAU * 2)), 10), w2 = Math.pow(Math.max(0, Math.cos(th + ph * TAU + 1.3)), 10);
    const wave = Math.max(w1, w2), jit = rand(x, y, q + o.seed * 97);
    const off = jit > 0.75 ? 1 : 0, px = X + Math.round(nx * off), py = Y + Math.round(ny * off);
    if (jit < 0.12 && wave < 0.3) continue; // little gaps that open and close, so it reads as current, not a stroke
    if (wave > 0.5) {
      p.px(px, py, C[7]);
      p.light(px, py, C[6], 0.5 * wave);
    } else p.blend(px, py, jit > 0.5 ? C[5] : C[4], 0.6 + 0.3 * wave);
    if (wave > 0.25 && !((x + y) & 1)) p.glow(px, py, 4, C[4], 0.12 * wave);
  }
  // arcs jumping off the outline: new ones each tick, a few px long
  const R = new Rng(q * 131 + o.seed);
  for (let i = 0; i < 3; i++) {
    if (!R.chance(0.55)) continue;
    const [x, y, nx, ny] = S.outline[R.int(0, S.outline.length - 1)];
    if (y >= S.h - 2) continue;
    const X = a.x + x, Y = a.y + y, L = R.range(4, 9), ang = Math.atan2(ny, nx) + R.range(-0.6, 0.6);
    const pts = bolt(R, X, Y, X + Math.cos(ang) * L, Y + Math.sin(ang) * L - 1, { jag: 0.35, depth: 3 });
    p.polyline(pts, (u) => (u < 0.5 ? C[7] : C[5]), 1);
    p.glowLine(pts[0][0], pts[0][1], pts[pts.length - 1][0], pts[pts.length - 1][1], 3, C[4], 0.35);
  }
  // stars blinking in and out round the body
  cycle(t, D, 9, o.seed + 30, (r) => r.range(0.45, 0.8), (age, life, r) => {
    const u = age / life, g = r.range(0, TAU), rr = r.range(0.8, 1.25);
    const x = cx + Math.cos(g) * (S.w / 2 + 6) * rr, y = cy + Math.sin(g) * (S.h / 2 + 2) * rr;
    const s = Math.sin(Math.PI * u);
    if (s > 0.6) sparkle(p, x, y, 1 + Math.round(2 * s), C[6], C[4], 0.45 * s);
    else p.dot(x, y, C[6], s * 1.4);
  });
  orbs(p, t, o, C, a, S, true);
  // the body lit cold from inside the current
  p.glow(cx, cy, 18, C[4], 0.1);
}
