import React from 'react';
import { buildTreeLayout } from './treeLayout';

// ── Night version: dark sky, moon, stars, silhouette branches, owl ──
export default function TreeBackgroundNight({ totalHeight = 1800, nodeCount = 10 }) {
  const { trunkPoints, leafSlots, W, H, cx } = buildTreeLayout(nodeCount, totalHeight);

  const buildTrunkPath = () => {
    const pts = trunkPoints;
    if (pts.length === 0) return '';
    let d = `M ${cx - 24} ${H}`;
    for (let i = 0; i < pts.length; i++) {
      const taper = Math.max(4, 24 - i * 1.4);
      const midy  = i === 0 ? (H + pts[0].y) / 2 : (pts[i-1].y + pts[i].y) / 2;
      d += ` Q ${pts[i].x - taper - 6} ${midy} ${pts[i].x - taper} ${pts[i].y}`;
    }
    const lastPt   = pts[pts.length - 1];
    const topTaper = Math.max(4, 24 - (pts.length - 1) * 1.4);
    d += ` Q ${lastPt.x} ${lastPt.y - 30} ${lastPt.x + topTaper} ${lastPt.y}`;
    for (let i = pts.length - 1; i >= 0; i--) {
      const taper = Math.max(4, 24 - i * 1.4);
      const midy  = i < pts.length - 1 ? (pts[i].y + pts[i+1].y) / 2 : (pts[i].y + H) / 2;
      d += ` Q ${pts[i].x + taper + 6} ${midy} ${pts[i].x + taper} ${pts[i].y}`;
    }
    return d + ` L ${cx + 24} ${H} Z`;
  };

  // Moon position — upper area of canvas
  const moonY = H * 0.08;
  const moonX = W * 0.72;

  // Stars — seeded positions
  const stars = Array.from({ length: 55 }, (_, i) => ({
    x: ((i * 137.5) % W),
    y: ((i * 89.3 + 20) % (H * 0.55)),
    r: i % 5 === 0 ? 2.2 : i % 3 === 0 ? 1.6 : 1,
    op: 0.4 + (i % 4) * 0.15,
  }));

  // Owl sits on the first right-side branch
  const owlSlot = leafSlots.find((s) => s.side === 1) || leafSlots[1];

  return (
    <svg
      width="100%" viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMax meet"
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
      xmlns="http://www.w3.org/2000/svg">

      <defs>
        {/* Sky gradient */}
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor="#060D1A"/>
          <stop offset="60%"  stopColor="#0F1A2E"/>
          <stop offset="100%" stopColor="#162038"/>
        </linearGradient>

        {/* Moon glow */}
        <radialGradient id="moonGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%"   stopColor="#E8F0FF" stopOpacity="1"/>
          <stop offset="40%"  stopColor="#C8D8F8" stopOpacity="0.9"/>
          <stop offset="100%" stopColor="#8AA8E0" stopOpacity="0"/>
        </radialGradient>

        {/* Trunk — very dark silhouette */}
        <linearGradient id="nightTrunk" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"   stopColor="#050810"/>
          <stop offset="40%"  stopColor="#0A1020"/>
          <stop offset="100%" stopColor="#050810"/>
        </linearGradient>

        <style>{`
          @keyframes starTwinkle {
            0%,100% { opacity: 0.3; }
            50%      { opacity: 1;   }
          }
          @keyframes nightBranchSway {
            0%   { transform: rotate(-2deg); }
            100% { transform: rotate(2deg);  }
          }
          @keyframes leafNightSway {
            0%   { transform: rotate(-3deg) scale(0.97); }
            100% { transform: rotate(3deg)  scale(1.03); }
          }
          @keyframes owlBlink {
            0%,90%,100% { transform: scaleY(1); }
            95%          { transform: scaleY(0.1); }
          }
        `}</style>
      </defs>

      {/* ── Sky fill ── */}
      <rect x="0" y="0" width={W} height={H} fill="url(#nightSky)"/>

      {/* ── Moon halo glow ── */}
      <circle cx={moonX} cy={moonY} r={80} fill="url(#moonGlow)" opacity={0.25}/>

      {/* ── Moon ── */}
      <circle cx={moonX} cy={moonY} r={32} fill="#E8F0FF"/>
      {/* Moon craters */}
      <circle cx={moonX - 10} cy={moonY + 8}  r={5} fill="#C8D8F0" opacity={0.5}/>
      <circle cx={moonX + 12} cy={moonY - 10} r={3} fill="#C8D8F0" opacity={0.4}/>
      <circle cx={moonX + 6}  cy={moonY + 14} r={2} fill="#C8D8F0" opacity={0.35}/>
      {/* Moon shadow — makes it a crescent */}
      <circle cx={moonX + 14} cy={moonY - 6} r={26} fill="#0A1428"/>

      {/* ── Stars ── */}
      {stars.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#E8F0FF" opacity={s.op}
          style={{ animation: `starTwinkle ${2.5 + (i % 5) * 0.8}s ease-in-out ${(i * 0.3) % 3}s infinite` }}/>
      ))}

      {/* ── Clouds (dark, barely visible) ── */}
      {[{ cx: W*0.2, cy: H*0.12, rx: 35 }, { cx: W*0.6, cy: H*0.18, rx: 28 }].map((c, i) => (
        <ellipse key={i} cx={c.cx} cy={c.cy} rx={c.rx} ry={c.rx * 0.4}
          fill="#1A2A44" opacity={0.6}/>
      ))}

      {/* ── Branches — dark silhouettes ── */}
      {leafSlots.map((s, i) => (
        <g key={`nbranch-${i}`}
          style={{
            animation: `nightBranchSway ${3.5 + (i % 3) * 0.8}s ease-in-out ${i * 0.25}s infinite alternate`,
            transformOrigin: `${s.trunkX}px ${s.trunkY}px`,
          }}>
          {/* Main branch */}
          <path d={`M ${s.trunkX} ${s.trunkY} Q ${s.cpx} ${s.cpy} ${s.x} ${s.y}`}
            fill="none" stroke="#060D18" strokeWidth={s.thick + 1} strokeLinecap="round"/>

          {/* Leaf silhouette cluster — sharp dark shapes against sky */}
          <g style={{
            animation: `leafNightSway ${s.swayDur}s ease-in-out ${s.swayDelay}s infinite alternate`,
            transformOrigin: `${s.x}px ${s.y}px`,
          }}>
            {/* Main leaf blob — solid dark */}
            <ellipse cx={s.x} cy={s.y} rx={s.leafRx} ry={s.leafRy}
              fill="#060D18" transform={`rotate(${s.angle}, ${s.x}, ${s.y})`}/>
            {/* Slightly lighter secondary blobs for depth */}
            <ellipse cx={s.x + s.side * 10} cy={s.y - 8} rx={s.leafRx * 0.6} ry={s.leafRy * 0.55}
              fill="#0A1428" transform={`rotate(${s.angle * 0.5}, ${s.x + s.side*10}, ${s.y - 8})`}/>
            {/* Individual leaf tips */}
            {[0, 1, 2].map((li) => {
              const lx = s.x + s.side * (8 + li * 14);
              const ly = s.y - 6 - li * 6;
              return <ellipse key={li} cx={lx} cy={ly} rx={9 - li * 2} ry={5 - li}
                fill="#080F1C" transform={`rotate(${s.angle * 0.4 + li * 12}, ${lx}, ${ly})`}/>;
            })}
          </g>
        </g>
      ))}

      {/* ── Trunk silhouette ── */}
      <path d={buildTrunkPath()} fill="url(#nightTrunk)"/>
      {/* Trunk edge highlight from moon */}
      <path d={`M ${cx + 18} ${H - 20} Q ${cx + 14} ${H * 0.5} ${cx + 10} ${trunkPoints[trunkPoints.length-1]?.y ?? H * 0.2}`}
        fill="none" stroke="#1A2840" strokeWidth={3} strokeLinecap="round" opacity={0.6}/>

      {/* ── Ground / roots ── */}
      <ellipse cx={cx}      cy={H}     rx={80}  ry={18}  fill="#060D18" opacity={0.8}/>
      <ellipse cx={cx - 52} cy={H - 5} rx={38}  ry={10}  fill="#060D18" opacity={0.6}
        transform={`rotate(-15,${cx-52},${H-5})`}/>
      <ellipse cx={cx + 58} cy={H - 6} rx={34}  ry={9}   fill="#060D18" opacity={0.6}
        transform={`rotate(14,${cx+58},${H-6})`}/>

      {/* ── Ground grass silhouette ── */}
      <path d={`M 0 ${H} Q ${W*0.1} ${H-14} ${W*0.2} ${H} Q ${W*0.3} ${H-10} ${W*0.4} ${H}
        Q ${W*0.5} ${H-16} ${W*0.6} ${H} Q ${W*0.7} ${H-8} ${W*0.8} ${H}
        Q ${W*0.9} ${H-12} ${W} ${H} Z`}
        fill="#060D18"/>

      {/* ── Owl on branch ── */}
      {owlSlot && (() => {
        const ox = owlSlot.x;
        const oy = owlSlot.y - 2;
        return (
          <g transform={`translate(${ox}, ${oy})`}>
            {/* Owl body */}
            <ellipse cx="0" cy="4" rx="8" ry="10" fill="#060D18"/>
            {/* Owl head */}
            <circle cx="0" cy="-8" r="8" fill="#060D18"/>
            {/* Ear tufts */}
            <polygon points="-5,-15 -8,-22 -2,-14" fill="#060D18"/>
            <polygon points="5,-15 8,-22 2,-14" fill="#060D18"/>
            {/* Eyes — glow in moonlight */}
            <circle cx="-3" cy="-9" r="3.5" fill="#D4A820" opacity="0.9"
              style={{ animation: 'owlBlink 5s ease-in-out infinite' }}/>
            <circle cx="3" cy="-9" r="3.5" fill="#D4A820" opacity="0.9"
              style={{ animation: 'owlBlink 5s ease-in-out 0.5s infinite' }}/>
            <circle cx="-3" cy="-9" r="2" fill="#0A0808"/>
            <circle cx="3"  cy="-9" r="2" fill="#0A0808"/>
            <circle cx="-2.5" cy="-9.5" r="0.6" fill="#fff"/>
            <circle cx="3.5"  cy="-9.5" r="0.6" fill="#fff"/>
            {/* Beak */}
            <polygon points="0,-6 -1.5,-4 1.5,-4" fill="#8A6010"/>
            {/* Feet on branch */}
            <line x1="-4" y1="13" x2="-6" y2="18" stroke="#060D18" strokeWidth="1.5"/>
            <line x1="4"  y1="13" x2="6"  y2="18" stroke="#060D18" strokeWidth="1.5"/>
          </g>
        );
      })()}

      {/* ── Fireflies ── */}
      {[...Array(8)].map((_, i) => {
        const fx = 20 + (i * 53) % (W - 40);
        const fy = H * 0.3 + (i * 71) % (H * 0.5);
        return (
          <circle key={`ff-${i}`} cx={fx} cy={fy} r={2} fill="#AEFF80"
            style={{ animation: `starTwinkle ${1.5 + (i % 4) * 0.6}s ease-in-out ${i * 0.4}s infinite` }}/>
        );
      })}
    </svg>
  );
}
