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
    y: H - 100 - i * NODE_GAP,
  }));

  const leafSlots = trunkPoints.map((pt, i) => {
    const side     = i % 2 === 0 ? -1 : 1;
    const spreadX  = 85 + rnd() * 40;
    const spreadY  = 30 + rnd() * 25;

    const lx  = pt.x + side * spreadX;
    const ly  = pt.y - spreadY;
    const cpx = pt.x + side * spreadX * 0.5;
    const cpy = pt.y - spreadY * 0.3;

    const leafRx    = 48 + rnd() * 14;
    const leafRy    = 30 + rnd() * 10;
    const thick     = Math.max(2.5, 11 - i * 0.7);
    const swayDur   = 3.2 + rnd() * 2.4;
    const swayDelay = rnd() * 1.8;
    const angle     = side * (15 + rnd() * 10);

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
