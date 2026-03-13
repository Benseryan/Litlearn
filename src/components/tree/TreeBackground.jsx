import React from 'react';
import { buildTreeLayout } from './treeLayout';

export default function TreeBackground({ totalHeight = 1800, nodeCount = 10 }) {
  const { trunkPoints, leafSlots, W, H, cx } = buildTreeLayout(nodeCount, totalHeight);

  // Trunk path — starts at very bottom of SVG (y=H), goes up through all trunk points
  const buildTrunkPath = () => {
    const pts = trunkPoints;
    if (pts.length === 0) return '';

    // Left side going upward
    let d = `M ${cx - 24} ${H}`;
    for (let i = 0; i < pts.length; i++) {
      const taper = Math.max(4, 24 - i * 1.4);
      const midy  = i === 0 ? (H + pts[0].y) / 2 : (pts[i-1].y + pts[i].y) / 2;
      d += ` Q ${pts[i].x - taper - 6} ${midy} ${pts[i].x - taper} ${pts[i].y}`;
    }

    // Top cap
    const lastPt   = pts[pts.length - 1];
    const topTaper = Math.max(4, 24 - (pts.length - 1) * 1.4);
    d += ` Q ${lastPt.x} ${lastPt.y - 30} ${lastPt.x + topTaper} ${lastPt.y}`;

    // Right side going downward
    for (let i = pts.length - 1; i >= 0; i--) {
      const taper = Math.max(4, 24 - i * 1.4);
      const midy  = i < pts.length - 1 ? (pts[i].y + pts[i+1].y) / 2 : (pts[i].y + H) / 2;
      d += ` Q ${pts[i].x + taper + 6} ${midy} ${pts[i].x + taper} ${pts[i].y}`;
    }

    // Close back to bottom
    d += ` L ${cx + 24} ${H} Z`;
    return d;
  };

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax meet"
      style={{
        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        pointerEvents: 'none',
      }}
      xmlns="http://www.w3.org/2000/svg">

      <defs>
        <linearGradient id="trunkGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#2E2F18" />
          <stop offset="30%"  stopColor="#4A4C28" />
          <stop offset="60%"  stopColor="#414323" />
          <stop offset="100%" stopColor="#353620" />
        </linearGradient>

        <filter id="bark" x="-5%" y="-2%" width="110%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.1" numOctaves="3" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        <radialGradient id="lg1" cx="38%" cy="35%" r="60%">
          <stop offset="0%"   stopColor="#D4E4A0" stopOpacity="1"/>
          <stop offset="60%"  stopColor="#ADB684" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#6A8040" stopOpacity="0.7"/>
        </radialGradient>
        <radialGradient id="lg2" cx="55%" cy="40%" r="55%">
          <stop offset="0%"   stopColor="#C2D48A" stopOpacity="1"/>
          <stop offset="65%"  stopColor="#96A96C" stopOpacity="0.88"/>
          <stop offset="100%" stopColor="#587030" stopOpacity="0.65"/>
        </radialGradient>
        <radialGradient id="lg3" cx="42%" cy="30%" r="58%">
          <stop offset="0%"   stopColor="#BDD490" stopOpacity="1"/>
          <stop offset="70%"  stopColor="#8DA05A" stopOpacity="0.85"/>
          <stop offset="100%" stopColor="#506830" stopOpacity="0.6"/>
        </radialGradient>

        <style>{`
          @keyframes branchSway {
            0%   { transform: rotate(-3deg); }
            100% { transform: rotate(3deg);  }
          }
          @keyframes leafPulse {
            0%   { transform: rotate(-2deg) scale(0.97); }
            100% { transform: rotate(2deg)  scale(1.03); }
          }
          @keyframes leafWiggle {
            0%   { transform: rotate(-4deg) scale(1);    }
            100% { transform: rotate(4deg)  scale(1.04); }
          }
        `}</style>
      </defs>

      {/* ── Ground / roots ── */}
      <ellipse cx={cx}       cy={H}      rx={80}  ry={20}  fill="#2E2F18" opacity={0.3}/>
      <ellipse cx={cx - 55}  cy={H - 5}  rx={40}  ry={12}  fill="#2E2F18" opacity={0.2}
        transform={`rotate(-15,${cx-55},${H-5})`}/>
      <ellipse cx={cx + 60}  cy={H - 6}  rx={36}  ry={11}  fill="#2E2F18" opacity={0.2}
        transform={`rotate(14,${cx+60},${H-6})`}/>
      <ellipse cx={cx - 20}  cy={H}      rx={20}  ry={7}   fill="#252611" opacity={0.18}
        transform={`rotate(-25,${cx-20},${H})`}/>
      <ellipse cx={cx + 25}  cy={H}      rx={18}  ry={6}   fill="#252611" opacity={0.18}
        transform={`rotate(20,${cx+25},${H})`}/>

      {/* ── Branches (drawn behind trunk) ── */}
      {leafSlots.map((s, i) => (
        <g key={`branch-${i}`}
          style={{
            animation: `branchSway ${s.swayDur}s ease-in-out ${s.swayDelay}s infinite alternate`,
            transformOrigin: `${s.trunkX}px ${s.trunkY}px`,
          }}>

          {/* Branch line */}
          <path
            d={`M ${s.trunkX} ${s.trunkY} Q ${s.cpx} ${s.cpy} ${s.x} ${s.y}`}
            fill="none" stroke="#3A3C20" strokeWidth={s.thick}
            strokeLinecap="round" filter="url(#bark)"/>

          {/* Leaf group */}
          <g style={{
            animation: `leafPulse ${s.swayDur * 0.9}s ease-in-out ${s.swayDelay + 0.3}s infinite alternate`,
            transformOrigin: `${s.x}px ${s.y}px`,
          }}>
            {/* Shadow blob */}
            <ellipse
              cx={s.x + s.side * 5} cy={s.y + 6}
              rx={s.leafRx * 0.85} ry={s.leafRy * 0.8}
              fill={i % 3 === 0 ? '#5A7030' : i % 3 === 1 ? '#4E6228' : '#486025'}
              opacity={0.4}
              transform={`rotate(${s.angle}, ${s.x + s.side * 5}, ${s.y + 6})`}/>

            {/* Main leaf */}
            <ellipse
              cx={s.x} cy={s.y}
              rx={s.leafRx} ry={s.leafRy}
              fill={`url(#lg${(i % 3) + 1})`}
              transform={`rotate(${s.angle}, ${s.x}, ${s.y})`}/>

            {/* Highlight */}
            <ellipse
              cx={s.x - s.side * 9} cy={s.y - 7}
              rx={s.leafRx * 0.38} ry={s.leafRy * 0.35}
              fill="#E2EEB8" opacity={0.48}
              transform={`rotate(${s.angle}, ${s.x - s.side * 9}, ${s.y - 7})`}/>

            {/* Centre vein */}
            <line
              x1={s.x - s.side * s.leafRx * 0.65} y1={s.y}
              x2={s.x + s.side * s.leafRx * 0.65} y2={s.y}
              stroke="#7A9040" strokeWidth={0.8} opacity={0.35} strokeLinecap="round"/>
          </g>

          {/* Small secondary leaflets at branch tip */}
          {[0, 1].map((li) => {
            const lx2 = s.x + s.side * (10 + li * 14);
            const ly2 = s.y - 10 - li * 8;
            return (
              <ellipse key={li}
                cx={lx2} cy={ly2} rx={10 - li * 2} ry={6 - li}
                fill={li === 0 ? '#ADB684' : '#96A96C'} opacity={0.55}
                transform={`rotate(${s.angle * 0.6 + li * 15}, ${lx2}, ${ly2})`}
                style={{
                  animation: `leafWiggle ${2.4 + li * 0.5}s ease-in-out ${s.swayDelay + li * 0.35}s infinite alternate`,
                  transformOrigin: `${lx2}px ${ly2}px`,
                }}/>
            );
          })}
        </g>
      ))}

      {/* ── Trunk (over branches) ── */}
      <path d={buildTrunkPath()} fill="url(#trunkGrad)" filter="url(#bark)"/>

      {/* Trunk highlight stripe */}
      <path
        d={`M ${cx - 7} ${H - 20} Q ${cx - 9} ${H * 0.5} ${cx - 4} ${trunkPoints[trunkPoints.length-1]?.y ?? H * 0.2}`}
        fill="none" stroke="#52553A" strokeWidth={5}
        strokeLinecap="round" opacity={0.3}/>

      {/* Ambient drifting background leaves */}
      {[...Array(5)].map((_, i) => {
        const lx = 25 + i * 72;
        const ly = H * 0.12 + i * H * 0.1;
        return (
          <ellipse key={`ambient-${i}`}
            cx={lx} cy={ly} rx={7} ry={4}
            fill="#ADB684" opacity={0.15}
            transform={`rotate(${i * 40}, ${lx}, ${ly})`}
            style={{
              animation: `leafWiggle ${4.5 + i * 0.6}s ease-in-out ${i * 0.6}s infinite alternate`,
              transformOrigin: `${lx}px ${ly}px`,
            }}/>
        );
      })}
    </svg>
  );
}
