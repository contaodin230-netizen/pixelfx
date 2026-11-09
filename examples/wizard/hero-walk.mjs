// The storm aura on a hero walking across the stage. The rig poses the body; we lift its silhouette from each frame and
// hand it to the aura as the actor, so the outline follows every step.
// usage (from the repo root): node examples/wizard/hero-walk.mjs [palette] [out.mp4], palette one of src/core/color.js PAL (electric, gold, arcane...)
const palName = process.argv[2] ?? "electric", out = process.argv[3] ?? `records/hero-walk-${palName}.mp4`;
const dir = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const actorMod = await import(`${dir}/src/core/actor.js`);
Object.assign(actorMod.DUMMY_PAL, {
  A: "#8fb4e6", B: "#5a82bc", C: "#3a5690", D: "#273a66", E: "#4a3a5e", F: "#352a46", G: "#241c32", J: "#18121f", k: "#0c0912", m: "#ffd84a",
});
const { renderAct, writeVideo } = await import(`${dir}/tools/lib/fxlib.mjs`);
const core = await import(`${dir}/src/core/index.js`);
const { createFrame, clearFrame, painterFor, composite, backdrop, PAL } = core;
const walk = await import("./walk.mjs");
const aura = await import(`${dir}/src/fx/status/storm-aura.js`);
const FPS = 30;
const r = renderAct({ meta: walk.meta, mod: walk }, { fps: FPS, bg: "none", target: false, seconds: walk.meta.duration + 0.3 });
const { w, h } = r, [, oy] = r.pivot, bg = backdrop("dark", w, h, oy), D = aura.meta.duration;
const frames = [];
r.frames.forEach((f, n) => {
  const src = f.clear;
  // the silhouette: solid pixels above the floor line
  let x0 = w, x1 = -1, y0 = h, y1 = -1;
  for (let y = 0; y < oy; y++) for (let x = 0; x < w; x++) if (src[(y * w + x) * 4 + 3] === 255) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
  const mw = x1 - x0 + 1, mh = oy - y0, data = new Uint8Array(mw * mh), pixels = new Uint32Array(mw * mh);
  for (let y = y0; y < oy; y++) for (let x = x0; x <= x1; x++) {
    const i = (y * w + x) * 4;
    if (src[i + 3] === 255) { data[(y - y0) * mw + x - x0] = 1; pixels[(y - y0) * mw + x - x0] = ((255 << 24) | (src[i + 2] << 16) | (src[i + 1] << 8) | src[i]) >>> 0; }
  }
  const ox = Math.round((x0 + x1 + 1) / 2);
  const actor = { mask: { w: mw, h: mh, data }, pixels, x: x0 - ox, y: y0 - oy, w: mw, h: mh, k: 2, head: [0, y0 - oy], chest: [0, -26] };
  const o = { ...aura.meta.options, palette: PAL[palName], actor };
  const frame = createFrame(w, h), p = painterFor(frame).place(ox, oy), t = (n / FPS) % D;
  clearFrame(frame);
  aura.drawBack(p, t, o);
  // the body over the back layer, then the front layer over the body (the floor shadow too)
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (src[i + 3] === 255) frame.color[y * w + x] = ((255 << 24) | (src[i + 2] << 16) | (src[i + 1] << 8) | src[i]) >>> 0;
  }
  aura.draw(p, t, o);
  frames.push({ t: n / FPS, color: composite(frame, new Uint8ClampedArray(w * h * 4), bg) });
});
writeVideo(out, { w, h, fps: FPS, n: frames.length, frames }, 5);
console.log(out, frames.length, "frames", w, h);
