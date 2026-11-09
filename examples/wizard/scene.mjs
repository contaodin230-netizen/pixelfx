// The detailed wizard's showreel, at twice the pixel density: he stands breathing, walks across, raises his staff and
// powers up inside the storm aura over a turning rune circle, then slams the staff down in a burst of mana.
// The library's rune circle and mana burst are drawn at their own scale on a half-size layer, doubled and added as light.
// usage (from the repo root): node examples/wizard/scene.mjs [out.mp4]
const out = process.argv[2] ?? "records/wizard.mp4";
const dir = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const core = await import(`${dir}/src/core/index.js`);
const { writeVideo, upscale } = await import(`${dir}/tools/lib/fxlib.mjs`);
const { makeWizard } = await import("./wizard.mjs");
const { createFrame, clearFrame, painterFor, composite, backdrop, createFx, hex, PAL, mix, clamp } = core;
const storm = await import(`${dir}/src/fx/status/storm-aura.js`);
const rune = await import(`${dir}/src/fx/arcane/rune-circle.js`);
const burst = await import(`${dir}/src/fx/arcane/mana-burst.js`);
const W = makeWizard(core), FPS = 30, w = 400, h = 236, FLOOR = 200, hw = w / 2, hh = h / 2, END = 10;
const bg = backdrop("dark", w, h, FLOOR), ARC = PAL.arcane;
const ease = (u) => (u <= 0 ? 0 : u >= 1 ? 1 : u * u * (3 - 2 * u));
const X0 = 84, X1 = 224, WALK0 = 1.6, WALK1 = 4.6, RAISE0 = 4.9, RAISE1 = 5.5, POWER = 5.3, SLAM = 8.4;
function state(t) {
  const u = clamp((t - WALK0) / (WALK1 - WALK0), 0, 1);
  const walk = t > WALK0 - 0.15 && t < WALK1 + 0.2 ? Math.min(1, (t - WALK0 + 0.15) / 0.3, (WALK1 + 0.2 - t) / 0.3) : 0;
  let raise = ease((t - RAISE0) / (RAISE1 - RAISE0));
  if (t > SLAM - 0.25 && t < SLAM) raise = 1 - (t - (SLAM - 0.25)) / 0.25;
  else if (t >= SLAM) raise = 0;
  return { x: X0 + (X1 - X0) * u, walk, phase: (t - WALK0) * ((Math.PI * 2) / 0.9), raise };
}
let runeFx = null, burstFx = null;
const frames = [];
for (let n = 0; n < END * FPS; n++) {
  const t = n / FPS, dt = 1 / FPS, s = state(t), cx = Math.round(s.x);
  const powered = t >= POWER && t < SLAM + 0.6, glowUp = clamp((t - RAISE0) / 0.8, 0, 1) * (t < SLAM + 0.3 ? 1 : Math.max(0, 1 - (t - SLAM - 0.3)));
  // the wizard, inked, in a frame of his own
  const cf = createFrame(w, h);
  clearFrame(cf);
  const orb = mix(hex("#58b4ec"), hex("#9a48ec"), glowUp), orbLit = mix(hex("#c8f0ff"), hex("#ecc8ff"), glowUp);
  const [ox, oy] = W.drawWizard(painterFor(cf).place(cx, FLOOR), { t, walk: s.walk, phase: s.phase, raise: s.raise, orb, orbLit });
  W.inkOutline(cf.color, w, h);
  // his silhouette for the aura
  let x0 = w, x1 = -1, y0 = h;
  for (let y = 0; y < FLOOR; y++) for (let x = 0; x < w; x++) if (cf.color[y * w + x]) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); }
  const mw = x1 - x0 + 1, mh = FLOOR - y0, data = new Uint8Array(mw * mh);
  for (let y = y0; y < FLOOR; y++) for (let x = x0; x <= x1; x++) if (cf.color[y * w + x]) data[(y - y0) * mw + x - x0] = 1;
  const actor = { mask: { w: mw, h: mh, data }, x: x0 - cx, y: y0 - FLOOR, w: mw, h: mh, k: 2, head: [0, y0 - FLOOR], chest: [0, -52] };
  const so = { ...storm.meta.options, palette: ARC, actor, orbs: 4 };
  // the big library effects on cue, on the half-size layer
  const hx = Math.round(cx / 2), HF = FLOOR / 2;
  if (t >= POWER - 0.2 && !runeFx) runeFx = createFx(rune, { x: hx, y: HF, palette: ARC });
  if (t >= SLAM && !burstFx) burstFx = createFx(burst, { x: hx + 4, y: HF, palette: ARC });
  if (runeFx && t >= SLAM + 0.4 && !runeFx.stopping) { runeFx.stop(); runeFx.stopping = true; }
  const ef = createFrame(hw, hh);
  clearFrame(ef);
  if (runeFx) { runeFx.draw(ef, "back"); runeFx.draw(ef, "front"); }
  if (burstFx) { burstFx.draw(ef, "back"); burstFx.draw(ef, "front"); }
  // the scene: aura behind him, him, aura in front, the crystal's light
  const f = createFrame(w, h), p = painterFor(f).place(cx, FLOOR), st = (t - POWER + 10 * storm.meta.duration) % storm.meta.duration;
  clearFrame(f);
  if (powered) storm.drawBack(p, st, so);
  for (let i = 0; i < w * h; i++) if (cf.color[i]) f.color[i] = cf.color[i];
  if (powered) storm.draw(p, st, so);
  p.glow(ox, oy, 12 + 14 * glowUp, mix(hex("#7cc8ff"), hex("#c684ff"), glowUp), 0.45 + 0.4 * glowUp);
  p.glow(ox, oy, 5, hex("#ffffff"), 0.35 + 0.4 * glowUp);
  const rgba = composite(f, new Uint8ClampedArray(w * h * 4), bg);
  const eh = upscale(composite(ef, new Uint8ClampedArray(hw * hh * 4), null), hw, hh, 2);
  for (let i = 0; i < w * h; i++) {
    const a = eh[i * 4 + 3] / 255;
    if (!a) continue;
    for (let c = 0; c < 3; c++) rgba[i * 4 + c] = Math.min(255, rgba[i * 4 + c] + eh[i * 4 + c] * a);
  }
  frames.push({ t, color: rgba });
  if (runeFx) runeFx.update(dt);
  if (burstFx) burstFx.update(dt);
}
writeVideo(out, { w, h, fps: FPS, n: frames.length, frames }, 3);
console.log(out, frames.length);
