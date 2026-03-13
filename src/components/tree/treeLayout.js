// ─── Shared tree layout — single source of truth ─────────────
// Both TreeBackground (SVG) and LearningTree (React nodes) use these.
// Given a node count and total canvas height, returns:
//   - trunkPoints: spine of the trunk
//   - leafSlots: { x, y, side, branchAngle, branchLen, swayOriginX, swayOriginY }[]
//     one per lesson node — the tip of each branch / centre of each leaf

const NODE_GAP = 160; // vertical px between lessons
const W        = 400;
const cx       = W / 2;

// Seeded pseudo-random so layout is stable (no Math.random on re-render)
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

  // Trunk spine — each point is where a branch forks off
  // Lesson 0 is at the bottom, last lesson near the top
  const trunkPoints = Array.from({ length: nodeCount }, (_, i) => ({
    x: cx + Math.sin(i * 0.9 + 0.5) * 14,
    y: H - 80 - i * NODE_GAP,
  }));

  // Branch / leaf slots — one per lesson
  const leafSlots = trunkPoints.map((pt, i) => {
    // Alternate sides but add organic variation
    const baseSide   = i % 2 === 0 ? -1 : 1;
    const side       = (rnd() > 0.85 && i > 0) ? -baseSide : baseSide;
    const baseAngle  = 38 + rnd() * 22; // 38–60° off horizontal
    const angle      = side * baseAngle;
    const branchLen  = 90 + rnd() * 50; // 90–140px
    const rad        = (angle * Math.PI) / 180;

    // Branch endpoint = leaf centre
    const lx = pt.x + Math.cos(rad) * branchLen;
    const ly = pt.y + Math.sin(rad) * branchLen;

    // Control point for the curved branch
    const cpx = pt.x + Math.cos(rad) * branchLen * 0.45 + side * 18;
    const cpy = pt.y + Math.sin(rad) * branchLen * 0.45 - 22;

    // Leaf ellipse size — slightly varied
    const leafRx = 46 + rnd() * 16; // 46–62 half-width
    const leafRy = 28 + rnd() * 10; // 28–38 half-height

    // Branch thickness tapers toward top
    const thick = Math.max(2.5, 11 - i * 0.7);

    // Sway timing
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
