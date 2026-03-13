// ─── Shared tree layout — single source of truth ─────────────
const NODE_GAP = 160;
const W        = 400;
const cx       = W / 2;

function seededRand(seed) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function buildTreeLayout(nodeCount, totalHeight) {
  const H   = totalHeight;
  const rnd = seededRand(42);

  const trunkPoints = Array.from({ length: nodeCount }, (_, i) => ({
    x: cx + Math.sin(i * 0.9 + 0.5) * 14,
    y: H - 80 - i * NODE_GAP,
  }));

  const leafSlots = trunkPoints.map((pt, i) => {
    // Strict left/right alternation — no randomness on side
    const side      = i % 2 === 0 ? -1 : 1;
    const baseAngle = 40 + rnd() * 18; // 40–58° — random angle but side is fixed
    const angle     = side * baseAngle;
    const branchLen = 92 + rnd() * 44;
    const rad       = (angle * Math.PI) / 180;

    const lx  = pt.x + Math.cos(rad) * branchLen;
    const ly  = pt.y + Math.sin(rad) * branchLen;
    const cpx = pt.x + Math.cos(rad) * branchLen * 0.45 + side * 18;
    const cpy = pt.y + Math.sin(rad) * branchLen * 0.45 - 22;

    const leafRx = 46 + rnd() * 16;
    const leafRy = 28 + rnd() * 10;
    const thick  = Math.max(2.5, 11 - i * 0.7);

    const swayDur   = 3.2 + rnd() * 2.4;
    const swayDelay = rnd() * 1.8;

    return {
      trunkX: pt.x, trunkY: pt.y,
      cpx, cpy,
      x: lx, y: ly,
      side, angle,
      leafRx, leafRy,
      thick,
      swayDur, swayDelay,
    };
  });

  return { trunkPoints, leafSlots, W, H, cx };
}

export { NODE_GAP, W, cx };
