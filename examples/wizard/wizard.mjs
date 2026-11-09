// The wizard at twice the size (about 100 px tall), with room for detail: a face with brows and a big nose, a beard in
// strands, a hat that creases and bends, an embroidered robe, a belt with buckle and pouch, a cape with folds and a
// crimson lining, and a carved staff with a cut crystal. Feet at (0, 0), facing right, light from the top left.

export function makeWizard(core) {
  const { hex } = core;
  const R = (...hs) => hs.map((h) => hex(h));
  // ramps, dark to light
  const ROBE = R("#21143f", "#2f1f5e", "#433082", "#5a45a8", "#7a66cc");
  const GOLD = R("#7a541a", "#b88428", "#e8bc50", "#fff0b0");
  const CAPE = R("#0e1326", "#18213e", "#26345c", "#3a4d80");
  const LINE = R("#4a1420", "#7a2232", "#a83a4a");
  const SKIN = R("#9c5e46", "#cc8a66", "#eeb994", "#ffdcc0");
  const BEARD = R("#7e7a96", "#a8a4c0", "#d2d0e2", "#f6f6ff");
  const HAT = R("#1c1240", "#2a1c64", "#3e2c8c", "#5844b4", "#7460d0");
  const WOOD = R("#2e1a0c", "#553418", "#7e5228", "#a8743c");
  const LEATHER = R("#2c160c", "#4a2a18", "#6e4228");
  const BOOT = R("#1e120c", "#34201a", "#4e3426");
  const INK = hex("#110c1c"), WHITE = hex("#ffffff");

  function drawWizard(p, s) {
    const w = s.walk, ph = s.phase, t = s.t, breathe = Math.sin(t * 2.4) * (1 - w);
    const bob = Math.round(w * -Math.abs(Math.sin(ph)) * 2.4 + breathe);
    const sway = Math.sin(ph) * w, B = (y) => y + bob;
    const swish = (x, y, k = 1) => [x + sway * k, y];

    // ---- the cape, behind everything: hangs from the shoulders, trails and ripples along its hem
    const trail = 2 + w * 8 + Math.sin(t * 3.1) * (1 + w * 1.5);
    const top = [[6, B(-54)], [-10, B(-54)]], hem = [];
    for (let i = 0; i <= 6; i++) {
      const u = i / 6, x = -4 - (trail + 10) * u - 4 * u * u, y = -5 + Math.sin(t * 6 + u * 5) * (1 + w * 1.5) * u - u * 2;
      hem.push([x, y]);
    }
    const back = [-14 - trail * 0.55, B(-34) + Math.sin(t * 4) * w];
    const capePts = [...top, back, ...hem.slice().reverse(), [2, -6]];
    p.poly(capePts.map(([x, y]) => [x - 2, y + 1]), LINE[1]);
    p.poly(capePts, CAPE[1]);
    p.poly([[-10, B(-54)], [-4, B(-54)], [-10 - trail * 0.4, B(-20)], [hem[5][0] + 2, hem[5][1] - 2], [hem[6][0], hem[6][1]], back], CAPE[2]);
    p.poly([[-10, B(-54)], [-8, B(-54)], [back[0] + 2, back[1]], [back[0], back[1] + 4]], CAPE[3]);
    // folds running down it
    for (const [k, c] of [[0.35, CAPE[0]], [0.65, CAPE[0]], [0.5, CAPE[2]]]) {
      const x0 = -8 + 6 * k, x1 = hem[Math.round(k * 6)][0] + 1;
      p.line(x0, B(-50), (x0 + x1) / 2 - 2, B(-28), c);
      p.line((x0 + x1) / 2 - 2, B(-28), x1, hem[Math.round(k * 6)][1] - 2, c);
    }
    // the crimson lining showing where the hem curls
    for (let i = 1; i <= 6; i++) p.line(hem[i - 1][0], hem[i - 1][1] - 1, hem[i][0], hem[i][1] - 1, i % 2 ? LINE[2] : LINE[1]);

    // ---- far sleeve, swinging behind the body
    const fh = [-6 - sway * 6, B(-34)];
    p.beam(-4, B(-50), fh[0], fh[1], 3, ROBE[1]);
    p.circle(fh[0], fh[1] + 1, 2, SKIN[1]);

    // ---- boots, stepping: far one first
    const nearX = 3 + Math.sin(ph) * 8 * w, farX = -2 - Math.sin(ph) * 8 * w;
    const nl = Math.max(0, Math.cos(ph)) * 3 * w, fl = Math.max(0, -Math.cos(ph)) * 3 * w;
    const boot = (x, lift, R3) => {
      p.ellipse(x + 1, -3 - lift, 5.5, 3, R3[1]);
      p.rect(x - 4, -5 - lift, 7, 3, R3[1]);
      p.line(x - 3, -4 - lift, x + 4, -4 - lift, R3[2]);
      p.line(x - 4, -0.5 - lift, x + 6, -0.5 - lift, R3[0]);
    };
    boot(farX, fl, [BOOT[0], BOOT[0], BOOT[1]]);

    // ---- the robe: a bell that swings with the stride
    const hemL = -14 + sway * 2, hemR = 15 + sway * 3, HEM = -7;
    p.poly([[-8, B(-36)], [9, B(-36)], [hemR, HEM], [hemL, HEM]], ROBE[2]);
    p.poly([[-8, B(-36)], [-3, B(-36)], [hemL + 6, HEM], [hemL, HEM]], ROBE[3]);
    p.poly([[-8, B(-36)], [-6, B(-36)], [hemL + 2, HEM], [hemL, HEM]], ROBE[4]);
    p.poly([[5, B(-36)], [9, B(-36)], [hemR, HEM], [hemR - 6, HEM]], ROBE[1]);
    // folds
    for (const [x0, x1, c] of [[-4, hemL + 9, ROBE[1]], [4, hemR - 9, ROBE[1]], [-1, -1 + sway * 3, ROBE[3]]]) p.line(x0, B(-30), x1, HEM - 2, c);
    // the hem: a gold band with a diamond pattern
    p.line(hemL, HEM, hemR, HEM, GOLD[1]);
    p.line(hemL, HEM - 1, hemR, HEM - 1, GOLD[2]);
    p.line(hemL + 1, HEM - 2, hemR - 1, HEM - 2, GOLD[1]);
    for (let x = Math.ceil(hemL + 2); x < hemR - 1; x += 4) p.px(x, HEM - 1, GOLD[0]);
    // the front panel down the middle, embroidered with little stars and a moon
    const fx0 = 2, fx1 = 2 + sway * 2.5;
    p.line(fx0, B(-36), fx1, HEM - 2, GOLD[1]);
    p.line(fx0 + 1, B(-36), fx1 + 1, HEM - 2, GOLD[0]);
    for (const [u, kind] of [[0.25, 0], [0.55, 1], [0.82, 0]]) {
      const x = fx0 - 5 + (fx1 - fx0) * u + sway * u, y = B(-36) + (HEM - B(-36)) * u;
      if (kind === 0) { p.px(x, y, GOLD[3]); p.px(x - 1, y, GOLD[1]); p.px(x + 1, y, GOLD[1]); p.px(x, y - 1, GOLD[1]); p.px(x, y + 1, GOLD[1]); }
      else { p.px(x, y - 1, GOLD[2]); p.px(x - 1, y, GOLD[2]); p.px(x - 1, y + 1, GOLD[2]); p.px(x, y + 2, GOLD[2]); }
    }
    boot(nearX, nl, BOOT);
    p.px(nearX + 5, -3 - nl, BOOT[2]);

    // ---- chest, collar, belt with buckle and pouch
    p.poly([[-10, B(-52)], [10, B(-52)], [9, B(-36)], [-8, B(-36)]], ROBE[2]);
    p.poly([[-10, B(-52)], [-4, B(-52)], [-4, B(-36)], [-8, B(-36)]], ROBE[3]);
    p.poly([[6, B(-52)], [10, B(-52)], [9, B(-36)], [6, B(-36)]], ROBE[1]);
    p.line(-3, B(-52), 2, B(-44), GOLD[2]);
    p.line(7, B(-52), 3, B(-44), GOLD[1]);
    p.rect(-8, B(-38), 17, 3, LEATHER[1]);
    p.line(-8, B(-38), 9, B(-38), LEATHER[2]);
    p.rect(0, B(-39), 4, 5, GOLD[2]);
    p.rect(1, B(-38), 2, 3, LEATHER[0]);
    p.px(0, B(-39), GOLD[3]);
    const pouch = [-7 + sway, B(-35)];
    p.rect(pouch[0] - 3, pouch[1], 6, 6, LEATHER[1]);
    p.rect(pouch[0] - 3, pouch[1], 6, 2, LEATHER[2]);
    p.px(pouch[0], pouch[1] + 2, GOLD[2]);

    // ---- head: ear, face, the shadow of the brim across the brow, a big nose, an eye under a bushy brow
    const hx = 3, hy = B(-61);
    p.circle(hx, hy, 6.5, SKIN[2]);
    p.circle(hx + 3, hy + 1, 4, SKIN[1]);
    p.circle(hx + 1, hy - 1, 4.5, SKIN[2]);
    p.ellipse(hx - 4, hy + 1, 1.6, 2.4, SKIN[1]);
    p.px(hx - 4, hy + 1, SKIN[0]);
    p.rect(hx - 5, hy - 5, 12, 2, SKIN[0]);
    p.circle(hx + 7, hy + 2, 2.2, SKIN[2]);
    p.px(hx + 7, hy + 1, SKIN[3]);
    p.px(hx + 8, hy + 3, SKIN[1]);
    p.rect(hx + 3, hy - 1, 2, 2, WHITE);
    p.px(hx + 4, hy - 1, INK);
    p.px(hx + 4, hy, INK);
    p.line(hx + 1, hy - 3, hx + 6, hy - 3, BEARD[2]);
    p.line(hx + 2, hy - 2, hx + 6, hy - 2, BEARD[1]);
    p.px(hx + 4, hy + 3, SKIN[3]);

    // ---- the beard: a long fall of strands that swings a little behind his stride
    const tip = [hx + 2 + sway * 1.5 - w, B(-34) + Math.abs(sway)];
    p.poly([[hx - 3, hy + 2], [hx + 9, hy + 3], [hx + 8, hy + 10], tip, [hx - 1, hy + 11]], BEARD[2]);
    p.poly([[hx + 5, hy + 4], [hx + 9, hy + 3], [hx + 8, hy + 10], tip], BEARD[1]);
    for (let i = 0; i < 5; i++) {
      const sx = hx - 1 + i * 2, c = i === 1 ? BEARD[3] : i > 2 ? BEARD[0] : BEARD[1];
      p.line(sx, hy + 5, sx + (tip[0] - sx) * 0.7, hy + 5 + (tip[1] - hy - 5) * 0.8, c);
    }
    // moustache over the mouth
    p.line(hx + 4, hy + 4, hx + 10, hy + 5, BEARD[3]);
    p.line(hx + 4, hy + 5, hx + 9, hy + 6, BEARD[2]);

    // ---- the hat: a wide brim, a cone that creases twice and bends back, a band with a buckle, stars sewn on
    const lag = -w * (3 + Math.abs(Math.sin(ph)) * 2.5) + Math.sin(t * 1.7) * 1.2 - s.raise * 2;
    const by = B(-67);
    p.ellipse(hx - 0.5, by + 1, 17, 3.6, HAT[0]);
    p.ellipse(hx - 1, by, 16, 3, HAT[2]);
    p.ellipse(hx - 4, by - 0.5, 10, 2, HAT[3]);
    const k1 = [hx + 1 + lag * 0.3, by - 14], k2 = [hx - 3 + lag * 0.8, by - 25], tipH = [hx - 12 + lag * 1.6, by - 33];
    p.poly([[hx - 9, by - 1], [hx + 9, by - 1], [k1[0] + 5, k1[1]], [k2[0] + 3, k2[1]], tipH, [k2[0] - 2, k2[1] + 1], [k1[0] - 5, k1[1] + 1]], HAT[2]);
    p.poly([[hx - 9, by - 1], [hx - 4, by - 1], [k1[0] - 1, k1[1]], [k2[0], k2[1]], tipH, [k2[0] - 2, k2[1] + 1], [k1[0] - 5, k1[1] + 1]], HAT[3]);
    p.poly([[hx - 9, by - 1], [hx - 7, by - 1], [k1[0] - 4, k1[1] + 1], [k1[0] - 5, k1[1] + 1]], HAT[4]);
    p.poly([[hx + 5, by - 1], [hx + 9, by - 1], [k1[0] + 5, k1[1]], [k1[0] + 2, k1[1]]], HAT[1]);
    // the creases
    p.line(k1[0] - 5, k1[1] + 1, k1[0] + 5, k1[1], HAT[1]);
    p.line(k2[0] - 2, k2[1] + 1, k2[0] + 3, k2[1], HAT[1]);
    // band and buckle
    p.line(hx - 9, by - 2, hx + 9, by - 2, LEATHER[1]);
    p.line(hx - 9, by - 3, hx + 9, by - 3, LEATHER[2]);
    p.rect(hx - 1, by - 4, 4, 4, GOLD[2]);
    p.rect(hx, by - 3, 2, 2, LEATHER[0]);
    // stars and a moon on the cone
    for (const [x, y] of [[hx - 4, by - 9], [k1[0] + 1, k1[1] - 4], [k2[0] - 2, k2[1] - 2]]) {
      p.px(x, y, GOLD[3]); p.px(x - 1, y, GOLD[1]); p.px(x + 1, y, GOLD[1]); p.px(x, y - 1, GOLD[1]); p.px(x, y + 1, GOLD[1]);
    }
    p.px(hx + 4, by - 8, GOLD[2]); p.px(hx + 3, by - 7, GOLD[2]); p.px(hx + 3, by - 6, GOLD[2]); p.px(hx + 4, by - 5, GOLD[2]);

    // ---- the staff, in the near hand: upright as he walks, thrust forward when raised
    const hdx = 14 + sway * 3 + s.raise * 6, hdy = B(-34) - s.raise * 18;
    const ang = -Math.PI / 2 + s.raise * 0.42 + sway * 0.05, L0 = 30, L1 = 52;
    const ca = Math.cos(ang), sa = Math.sin(ang), nx = -sa, ny = ca;
    const bx = hdx - ca * L0, by2 = hdy - sa * L0, tx = hdx + ca * L1, ty = hdy + sa * L1;
    p.beam(bx, by2, tx, ty, 1.6, WOOD[1]);
    p.line(bx - nx, by2 - ny, tx - nx, ty - ny, WOOD[2]);
    // grain knots
    for (const u of [0.15, 0.42, 0.78]) { const gx = bx + (tx - bx) * u, gy = by2 + (ty - by2) * u; p.px(gx, gy, WOOD[0]); p.px(gx + nx, gy + ny + 1, WOOD[0]); }
    // leather wrap under the hand
    for (let i = -4; i <= 6; i += 2) { const gx = hdx + ca * i, gy = hdy + sa * i; p.line(gx - nx * 2, gy - ny * 2, gx + nx * 2, gy + ny * 2, i % 4 ? LEATHER[2] : LEATHER[1]); }
    // the head: two carved prongs curling up round a cut crystal
    const cx = tx + ca * 6, cy = ty + sa * 6;
    for (const side of [-1, 1]) {
      const pts = [[tx, ty]];
      for (let i = 1; i <= 6; i++) { const u = i / 6, r = 4.5 * Math.sin(Math.PI * u * 0.9); pts.push([tx + ca * 8 * u + nx * side * r, ty + sa * 8 * u + ny * side * r]); }
      p.polyline(pts, side < 0 ? WOOD[3] : WOOD[1]);
    }
    // the crystal: a diamond with a lit face, a dark face and a glint
    const cr = s.orb, cl = s.orbLit;
    p.poly([[cx, cy - 5], [cx + 3, cy], [cx, cy + 4], [cx - 3, cy]], cr);
    p.poly([[cx, cy - 5], [cx, cy + 4], [cx - 3, cy]], cl);
    p.line(cx, cy - 4, cx, cy + 3, WHITE, 0.5);
    p.px(cx - 1, cy - 2, WHITE);

    // ---- the near sleeve: a wide bell with a gold cuff, and the hand closed round the staff
    const sh = [7, B(-50)];
    p.beam(sh[0], sh[1], hdx - 3, hdy - 1, 3.2, ROBE[2]);
    p.beam(sh[0] - 1, sh[1], hdx - 4, hdy - 2, 1.2, ROBE[3]);
    p.poly([[hdx - 7, hdy - 4], [hdx - 2, hdy - 3], [hdx - 1, hdy + 4], [hdx - 8, hdy + 3]], ROBE[2]);
    p.line(hdx - 2, hdy - 3, hdx - 1, hdy + 4, GOLD[2]);
    p.line(hdx - 3, hdy - 3, hdx - 2, hdy + 4, GOLD[1]);
    p.ellipse(hdx, hdy, 2.6, 3, SKIN[2]);
    p.line(hdx + 1, hdy - 2, hdx + 1, hdy + 2, SKIN[1]);
    p.px(hdx - 1, hdy - 2, SKIN[3]);
    return [cx, cy];
  }

  /** One dark line round everything drawn in color (a Uint32Array, w x h, 0 empty), in place. */
  function inkOutline(color, w, h) {
    const add = [];
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (color[y * w + x]) continue;
        if ((x > 0 && color[y * w + x - 1]) || (x < w - 1 && color[y * w + x + 1]) || (y > 0 && color[(y - 1) * w + x]) || (y < h - 1 && color[(y + 1) * w + x])) add.push(y * w + x);
      }
    for (const i of add) color[i] = INK;
  }

  return { drawWizard, inkOutline };
}
