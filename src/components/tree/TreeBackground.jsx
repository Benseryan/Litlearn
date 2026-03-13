import React, { useEffect, useRef } from 'react';

// Drifting leaf component
function Leaf({ x, y, size, delay, duration, color, rotate }) {
  return (
    <ellipse cx={x} cy={y} rx={size * 1.6} ry={size}
      fill={color} opacity={0.7} transform={`rotate(${rotate}, ${x}, ${y})`}
      style={{
        animation: `leafDrift ${duration}s ease-in-out ${delay}s infinite alternate`,
        transformOrigin: `${x}px ${y}px`,
      }} />
  );
}

export default function TreeBackground({ totalHeight = 2000, scrollY = 0 }) {
  // The tree is drawn in a fixed 400px-wide coordinate space
  // Trunk starts at bottom, grows upward
  const W = 400;
  const H = totalHeight;
  const cx = W / 2; // trunk center x

  // Branch node positions along the trunk — evenly spaced
  // These will align with lesson nodes
  const trunkPoints = Array.from({ length: 12 }, (_, i) => ({
    x: cx + Math.sin(i * 1.2) * 18, // slight trunk sway
    y: H - 60 - i * 160,
  }));

  // Leaf clusters at various points
  const leafClusters = [
    { x: cx - 80, y: H - 600, r: 60, color: '#8DA05A' },
    { x: cx + 100, y: H - 800, r: 50, color: '#ADB684' },
    { x: cx - 60, y: H - 980, r: 45, color: '#7A9148' },
    { x: cx + 70, y: H - 1100, r: 55, color: '#96A96C' },
    { x: cx - 90, y: H - 1280, r: 48, color: '#ADB684' },
    { x: cx + 40, y: H - 1450, r: 42, color: '#8DA05A' },
    { x: cx - 50, y: H - 1600, r: 38, color: '#7A9148' },
    { x: cx + 80, y: H - 1750, r: 44, color: '#96A96C' },
  ];

  // Build trunk path with organic sway
  const buildTrunkPath = () => {
    const pts = trunkPoints;
    let d = `M ${pts[0].x - 22} ${pts[0].y + 40}`;
    // left side going up
    for (let i = 0; i < pts.length; i++) {
      const taper = 22 - i * 1.4;
      const cp1x = pts[i].x - taper - 10;
      const cp1y = (i === 0 ? pts[0].y : pts[i-1].y + pts[i].y) / 2;
      d += ` Q ${cp1x} ${cp1y} ${pts[i].x - taper} ${pts[i].y}`;
    }
    // top cap
    const topT = pts[pts.length-1];
    const topTaper = 22 - (pts.length-1) * 1.4;
    d += ` Q ${topT.x} ${topT.y - 30} ${topT.x + topTaper} ${topT.y}`;
    // right side going down
    for (let i = pts.length - 1; i >= 0; i--) {
      const taper = 22 - i * 1.4;
      const cp1x = pts[i].x + taper + 10;
      const cp1y = i < pts.length - 1 ? (pts[i].y + pts[i+1].y) / 2 : pts[i].y - 40;
      d += ` Q ${cp1x} ${cp1y} ${pts[i].x + taper} ${pts[i].y}`;
    }
    d += ` Z`;
    return d;
  };

  // Branches — left and right alternating from trunk points
  const branches = trunkPoints.slice(1).map((pt, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    const length = 80 + Math.random() * 40;
    const angle  = side * (35 + i * 3);
    const rad    = (angle * Math.PI) / 180;
    const ex     = pt.x + Math.cos(rad) * length;
    const ey     = pt.y + Math.sin(rad) * length;
    const cpx    = pt.x + Math.cos(rad) * length * 0.5 + side * 20;
    const cpy    = pt.y + Math.sin(rad) * length * 0.5 - 20;
    const thick  = Math.max(2, 10 - i * 0.6);
    return { pt, ex, ey, cpx, cpy, thick, side };
  });

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax meet"
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg">

      <defs>
        {/* Trunk texture gradient */}
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3A3B20" />
          <stop offset="35%"  stopColor="#4D4F2A" />
          <stop offset="65%"  stopColor="#414323" />
          <stop offset="100%" stopColor="#2E2F18" />
        </linearGradient>

        {/* Bark texture via turbulence filter */}
        <filter id="bark" x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence type="fractalNoise" baseFrequency="0.04 0.08" numOctaves="4" seed="3" result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="4" xChannelSelector="R" yChannelSelector="G" />
        </filter>

        {/* Leaf cluster gradient */}
        <radialGradient id="leafGrad1" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#C8D89A" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#7A9148" stopOpacity="0.6" />
        </radialGradient>
        <radialGradient id="leafGrad2" cx="40%" cy="40%" r="60%">
          <stop offset="0%"   stopColor="#ADB684" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#5A6E35" stopOpacity="0.5" />
        </radialGradient>

        {/* Ground gradient */}
        <linearGradient id="groundGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#C0BCAF" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#A8A49A" stopOpacity="0" />
        </linearGradient>

        <style>{`
          @keyframes leafSway {
            0%   { transform: rotate(-4deg) scale(1); }
            100% { transform: rotate(4deg) scale(1.04); }
          }
          @keyframes leafDrift {
            0%   { transform: rotate(-3deg); }
            100% { transform: rotate(3deg); }
          }
          @keyframes clusterSway {
            0%   { transform: rotate(-2deg) translate(0px, 0px); }
            100% { transform: rotate(2deg) translate(2px, -3px); }
          }
          .branch-left  { transform-origin: left center; }
          .branch-right { transform-origin: right center; }
        `}</style>
      </defs>

      {/* ── Ground roots ── */}
      <ellipse cx={cx} cy={H - 30} rx={70} ry={18} fill="#3A3B20" opacity={0.25} />
      <ellipse cx={cx - 55} cy={H - 20} rx={30} ry={8} fill="#3A3B20" opacity={0.18} transform={`rotate(-15, ${cx-55}, ${H-20})`} />
      <ellipse cx={cx + 60} cy={H - 22} rx={28} ry={7} fill="#3A3B20" opacity={0.18} transform={`rotate(12, ${cx+60}, ${H-22})`} />

      {/* ── Branches (behind trunk) ── */}
      {branches.map((b, i) => (
        <path key={`branch-${i}`}
          d={`M ${b.pt.x} ${b.pt.y} Q ${b.cpx} ${b.cpy} ${b.ex} ${b.ey}`}
          fill="none" stroke="url(#trunkGrad)" strokeWidth={b.thick}
          strokeLinecap="round" filter="url(#bark)"
          style={{
            animation: `leafSway ${3.5 + i * 0.3}s ease-in-out ${i * 0.2}s infinite alternate`,
            transformOrigin: `${b.pt.x}px ${b.pt.y}px`,
          }} />
      ))}

      {/* ── Trunk ── */}
      <path d={buildTrunkPath()} fill="url(#trunkGrad)" filter="url(#bark)" />

      {/* Trunk highlight stripe */}
      <path
        d={`M ${cx - 6} ${H - 40} Q ${cx - 8} ${H - 500} ${cx - 4} ${H - 900}`}
        fill="none" stroke="#6B6E3A" strokeWidth={4} strokeLinecap="round" opacity={0.4} />

      {/* ── Leaf clusters ── */}
      {leafClusters.map((lc, i) => (
        <g key={`lc-${i}`}
          style={{
            animation: `clusterSway ${4 + i * 0.4}s ease-in-out ${i * 0.3}s infinite alternate`,
            transformOrigin: `${lc.x}px ${lc.y + lc.r}px`,
          }}>
          {/* Back blob */}
          <ellipse cx={lc.x + 12} cy={lc.y + 8} rx={lc.r * 0.85} ry={lc.r * 0.65}
            fill={i % 2 === 0 ? "url(#leafGrad1)" : "url(#leafGrad2)"} opacity={0.6} />
          {/* Main blob */}
          <ellipse cx={lc.x} cy={lc.y} rx={lc.r} ry={lc.r * 0.78}
            fill={i % 2 === 0 ? "url(#leafGrad2)" : "url(#leafGrad1)"} />
          {/* Front highlight blob */}
          <ellipse cx={lc.x - 10} cy={lc.y - 10} rx={lc.r * 0.55} ry={lc.r * 0.4}
            fill="#C8D89A" opacity={0.45} />
          {/* Small individual leaves */}
          {[...Array(5)].map((_, li) => {
            const lx = lc.x + Math.cos(li * 1.26) * (lc.r * 0.7);
            const ly = lc.y + Math.sin(li * 1.26) * (lc.r * 0.5);
            return (
              <ellipse key={li} cx={lx} cy={ly} rx={8} ry={5}
                fill="#ADB684" opacity={0.55}
                transform={`rotate(${li * 72}, ${lx}, ${ly})`}
                style={{
                  animation: `leafDrift ${2.5 + li * 0.4}s ease-in-out ${li * 0.15 + i * 0.1}s infinite alternate`,
                  transformOrigin: `${lx}px ${ly}px`,
                }} />
            );
          })}
        </g>
      ))}

      {/* ── Atmospheric depth overlay ── */}
      <rect x={0} y={0} width={W} height={H * 0.15}
        fill="url(#groundGrad)" opacity={0.12} transform={`translate(0, ${H * 0.85})`} />
    </svg>
  );
}
