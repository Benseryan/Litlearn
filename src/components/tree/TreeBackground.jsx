import React from 'react';
import { buildTreeLayout } from './treeLayout';

export default function TreeBackground({ totalHeight = 1800, nodeCount = 10 }) {
  const { trunkPoints, leafSlots, W, H, cx } = buildTreeLayout(nodeCount, totalHeight);

  // ── Trunk outline path ────────────────────────────────────
  const buildTrunkPath = () => {
    const pts = trunkPoints;
    if (pts.length === 0) return '';
    const bot = pts[0];
    const top = pts[pts.length - 1];
    let d = `M ${bot.x - 22} ${bot.y + 50}`;
    for (let i = 0; i < pts.length; i++) {
      const t  = 22 - i * 1.3;
      const cy = i === 0 ? bot.y : (pts[i-1].y + pts[i].y) / 2;
      d += ` Q ${pts[i].x - t - 8} ${cy} ${pts[i].x - Math.max(t, 3)} ${pts[i].y}`;
    }
    const topT = Math.max(22 - (pts.length - 1) * 1.3, 3);
    d += ` Q ${top.x} ${top.y - 28} ${top.x + topT} ${top.y}`;
    for (let i = pts.length - 1; i >= 0; i--) {
      const t  = 22 - i * 1.3;
      const cy = i < pts.length - 1 ? (pts[i].y + pts[i+1].y) / 2 : pts[i].y - 40;
      d += ` Q ${pts[i].x + Math.max(t, 3) + 8} ${cy} ${pts[i].x + Math.max(t, 3)} ${pts[i].y}`;
    }
    return d + ' Z';
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

        <linearGradient id="trunkGrad2" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#3A3C20" />
          <stop offset="50%"  stopColor="#52553A" />
          <stop offset="100%" stopColor="#3A3C20" />
        </linearGradient>

        <filter id="bark" x="-5%" y="-2%" width="110%" height="104%">
          <feTurbulence type="fractalNoise" baseFrequency="0.035 0.1" numOctaves="3" seed="7" result="noise"/>
          <feDisplacementMap in="SourceGraphic" in2="noise" scale="3.5" xChannelSelector="R" yChannelSelector="G"/>
        </filter>

        <filter id="leafSoft" x="-15%" y="-15%" width="130%" height="130%">
          <feGaussianBlur stdDeviation="1.2"/>
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
            0%   { transform: rotate(-3.5deg); }
            100% { transform: rotate(3.5deg);  }
          }
          @keyframes leafPulse {
            0%   { transform: rotate(-2deg) scale(0.97); }
            100% { transform: rotate(2deg)  scale(1.03); }
          }
          @keyframes leafWiggle {
            0%   { transform: rotate(-5deg) scale(1);    }
            100% { transform: rotate(4deg)  scale(1.05); }
          }
        `}</style>
      </defs>

      {/* ── Ground / roots ── */}
      <ellipse cx={cx} cy={H - 28} rx={68} ry={16} fill="#2E2F18" opacity={0.22}/>
      <ellipse cx={cx - 52} cy={H - 18} rx={32} ry={9} fill="#2E2F18" opacity={0.15}
        transform={`rotate(-18,${cx-52},${H-18})`}/>
      <ellipse cx={cx + 58} cy={H - 20} rx={28} ry={8} fill="#2E2F18" opacity={0.15}
        transform={`rotate(14,${cx+58},${H-20})`}/>

      {/* ── Branches behind trunk ── */}
      {leafSlots.map((s, i) => (
        <g key={`branch-${i}`}
          style={{
            animation: `branchSway ${s.swayDur}s ease-in-out ${s.swayDelay}s infinite alternate`,
            transformOrigin: `${s.trunkX}px ${s.trunkY}px`,
          }}>
          {/* Main branch */}
          <path
            d={`M ${s.trunkX} ${s.trunkY} Q ${s.cpx} ${s.cpy} ${s.x} ${s.y}`}
            fill="none" stroke="url(#trunkGrad)" strokeWidth={s.thick}
            strokeLinecap="round" filter="url(#bark)"/>

          {/* ── Leaf group — three overlapping ellipses for depth ── */}
          <g style={{
            animation: `leafPulse ${s.swayDur * 0.9}s ease-in-out ${s.swayDelay + 0.3}s infinite alternate`,
            transformOrigin: `${s.x}px ${s.y}px`,
          }}>
            {/* Shadow/depth blob behind */}
            <ellipse
              cx={s.x + s.side * 6} cy={s.y + 5}
              rx={s.leafRx * 0.88} ry={s.leafRy * 0.82}
              fill={i % 3 === 0 ? '#6A8040' : i % 3 === 1 ? '#587030' : '#506828'}
              opacity={0.45}
              transform={`rotate(${s.angle * 0.4}, ${s.x + s.side * 6}, ${s.y + 5})`}/>

            {/* Main leaf body */}
            <ellipse
              cx={s.x} cy={s.y}
              rx={s.leafRx} ry={s.leafRy}
              fill={`url(#lg${(i % 3) + 1})`}
              transform={`rotate(${s.angle * 0.35}, ${s.x}, ${s.y})`}/>

            {/* Highlight specular */}
            <ellipse
              cx={s.x - s.side * 8} cy={s.y - 7}
              rx={s.leafRx * 0.42} ry={s.leafRy * 0.38}
              fill="#E2EEB8" opacity={0.5}
              transform={`rotate(${s.angle * 0.35}, ${s.x - s.side * 8}, ${s.y - 7})`}/>

            {/* Leaf vein line */}
            <line
              x1={s.x - Math.cos((s.angle * Math.PI)/180) * s.leafRx * 0.7}
              y1={s.y - Math.sin((s.angle * Math.PI)/180) * s.leafRy * 0.7}
              x2={s.x + Math.cos((s.angle * Math.PI)/180) * s.leafRx * 0.7}
              y2={s.y + Math.sin((s.angle * Math.PI)/180) * s.leafRy * 0.7}
              stroke="#7A9040" strokeWidth={0.8} opacity={0.4} strokeLinecap="round"/>
          </g>

          {/* Small secondary leaflets near the branch tip */}
          {[0, 1].map((li) => {
            const offsetAng = (s.angle + (li === 0 ? 35 : -30)) * Math.PI / 180;
            const dist      = s.swayDur * 4 + li * 14; // deterministic offset
            const lx2 = s.x + Math.cos(offsetAng) * (18 + li * 10);
            const ly2 = s.y + Math.sin(offsetAng) * (12 + li * 6) - 8;
            return (
              <ellipse key={li}
                cx={lx2} cy={ly2} rx={11 - li * 2} ry={7 - li}
                fill={li === 0 ? '#ADB684' : '#96A96C'} opacity={0.6}
                transform={`rotate(${s.angle + (li === 0 ? 20 : -25)}, ${lx2}, ${ly2})`}
                style={{
                  animation: `leafWiggle ${2.2 + li * 0.5}s ease-in-out ${s.swayDelay + li * 0.4}s infinite alternate`,
                  transformOrigin: `${lx2}px ${ly2}px`,
                }}/>
            );
          })}
        </g>
      ))}

      {/* ── Trunk (drawn over branches so it looks solid) ── */}
      <path d={buildTrunkPath()} fill="url(#trunkGrad)" filter="url(#bark)"/>

      {/* Trunk highlight */}
      <path
        d={`M ${cx - 7} ${H - 45} Q ${cx - 9} ${H * 0.55} ${cx - 4} ${trunkPoints[trunkPoints.length-1]?.y ?? H * 0.2}`}
        fill="none" stroke="url(#trunkGrad2)" strokeWidth={5}
        strokeLinecap="round" opacity={0.35}/>

      {/* ── Tiny drifting background leaves (ambient) ── */}
      {[...Array(6)].map((_, i) => {
        const lx = 30 + i * 62 + (i % 2 === 0 ? 20 : -10);
        const ly = H * 0.15 + i * H * 0.1;
        return (
          <ellipse key={`ambient-${i}`}
            cx={lx} cy={ly} rx={7} ry={4}
            fill="#ADB684" opacity={0.18}
            transform={`rotate(${i * 37}, ${lx}, ${ly})`}
            style={{
              animation: `leafWiggle ${4 + i * 0.6}s ease-in-out ${i * 0.5}s infinite alternate`,
              transformOrigin: `${lx}px ${ly}px`,
            }}/>
        );
      })}
    </svg>
  );
}
