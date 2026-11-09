// A slow walk across the stage, as an empty "effect" whose act is the walk cycle: renderAct poses the body for us.
const STEP = 0.22, STRIDE = 5, N = 16;
const A = { crouch: 1, ffx: 5, ffy: -4, fbx: -5, fby: -4, fx: -7, fy: -15, bx: 9, by: -16 };     // near foot forward
const P1 = { crouch: 0, ffx: 0, ffy: -4, fbx: 1, fby: -7, fx: -3, fy: -15, bx: 5, by: -15 };     // passing, far foot lifted
const B = { crouch: 1, ffx: -5, ffy: -4, fbx: 5, fby: -4, fx: 2, fy: -16, bx: 1, by: -15 };      // far foot forward
const P2 = { crouch: 0, ffx: 1, ffy: -7, fbx: 0, fby: -4, fx: -3, fy: -15, bx: 5, by: -15 };     // passing, near foot lifted
const cycle = [A, P1, B, P2];
const X0 = -STRIDE * N / 2;
export const meta = { name: "walk", size: [140, 70], origin: [70, 60], duration: N * STEP, loop: false, fps: 30, bg: "dark", options: {} };
export const act = {
  target: false,
  poses: Array.from({ length: N + 1 }, (_, i) => [i * STEP, { ...cycle[i % 4], x: X0 + i * STRIDE }, "line"]),
};
export function draw() {}
