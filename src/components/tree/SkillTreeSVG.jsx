import React from 'react';

const NODE_POSITIONS = [
  { x: 180, y: 315 }, { x: 180, y: 248 }, { x: 125, y: 168 }, { x: 42,  y: 218 },
  { x: 78,  y: 208 }, { x: 235, y: 168 }, { x: 112, y: 208 }, { x: 260, y: 208 },
  { x: 318, y: 205 }, { x: 334, y: 226 },
];

const LEAF_OFFSETS = [
  { dx: 14, dy: -8, r: 3.5 }, { dx: -12, dy: -10, r: 3 },
  { dx: 6,  dy: -17, r: 4  }, { dx: -3,  dy: -14, r: 2.5 },
];

function getStatusStyle(status) {
  switch (status) {
    case 'completed':   return { fill: '#414323', stroke: '#414323', innerDot: '#ADB684', r: 12 };
    case 'in_progress': return { fill: '#ADB684', stroke: '#414323', innerDot: '#414323', r: 12 };
    case 'available':   return { fill: '#EAE7DA', stroke: '#5A5C41', innerDot: null, r: 11 };
    default:            return { fill: '#C0BCAF', stroke: '#C0BCAF', innerDot: null, r: 9, opacity: 0.45 };
  }
}

export default function SkillTreeSVG({ nodes, progress, onNodeClick }) {
  const getStatus = (node, index) => {
    const prog = progress.find((p) => p.node_id === node.id);
    if (prog) return prog.status;
    if (index === 0) return 'available';
    const prevNode = nodes[index - 1];
    const prevProg = progress.find((p) => p.node_id === prevNode?.id);
    if (prevProg?.status === 'completed') return 'available';
    return 'locked';
  };

  return (
    <div className="w-full flex justify-center px-2">
      <svg viewBox="0 0 375 490" className="w-full max-w-sm" style={{ touchAction: 'none' }}>
        <defs>
          <radialGradient id="groundShadow" cx="50%" cy="100%" r="45%">
            <stop offset="0%" stopColor="#C0BCAF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#EAE7DA" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="1.5" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        <ellipse cx="185" cy="484" rx="110" ry="14" fill="url(#groundShadow)" />

        {/* Roots */}
        <path d="M 174 466 Q 148 462 110 472" stroke="#414323" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.55"/>
        <path d="M 190 466 Q 216 462 254 472" stroke="#414323" strokeWidth="7" fill="none" strokeLinecap="round" opacity="0.55"/>
        <path d="M 178 472 Q 162 468 144 476" stroke="#414323" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.38"/>
        <path d="M 186 472 Q 202 468 220 476" stroke="#414323" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.38"/>

        {/* Trunk */}
        <path d="M 182 480 C 179 456 185 430 182 402 C 180 378 184 354 182 315" stroke="#414323" strokeWidth="22" fill="none" strokeLinecap="round"/>
        <path d="M 178 438 C 176 424 177 412 178 398" stroke="#5A5C41" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.28"/>
        <path d="M 186 448 C 188 432 187 420 186 406" stroke="#5A5C41" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.28"/>
        <path d="M 180 368 C 178 358 179 350 180 340" stroke="#5A5C41" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.22"/>

        {/* Left branch system */}
        <path d="M 177 340 C 150 326 118 308 88 280" stroke="#414323" strokeWidth="15" fill="none" strokeLinecap="round"/>
        <path d="M 88 280 C 68 263 52 244 42 218"   stroke="#414323" strokeWidth="9"  fill="none" strokeLinecap="round"/>
        <path d="M 88 280 C 83 263 80 243 78 208"   stroke="#414323" strokeWidth="8"  fill="none" strokeLinecap="round"/>
        <path d="M 88 280 C 96 263 106 243 112 208"  stroke="#414323" strokeWidth="8"  fill="none" strokeLinecap="round"/>
        <path d="M 42 218 C 36 205 33 190 36 174"   stroke="#414323" strokeWidth="5"  fill="none" strokeLinecap="round"/>
        <path d="M 42 218 C 30 208 22 196 20 180"   stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>
        <path d="M 78 208 C 70 196 68 182 72 166"   stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>

        {/* Center fork */}
        <path d="M 182 248 C 164 229 148 206 125 168" stroke="#414323" strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d="M 182 248 C 200 229 214 206 235 168" stroke="#414323" strokeWidth="10" fill="none" strokeLinecap="round"/>
        <path d="M 125 168 C 118 152 115 134 120 116" stroke="#414323" strokeWidth="5"  fill="none" strokeLinecap="round"/>
        <path d="M 125 168 C 112 154 106 136 102 118" stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>
        <path d="M 125 168 C 132 152 136 134 130 114" stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>
        <path d="M 235 168 C 242 152 244 134 240 116" stroke="#414323" strokeWidth="5"  fill="none" strokeLinecap="round"/>
        <path d="M 235 168 C 248 155 254 138 252 120" stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>
        <path d="M 235 168 C 228 152 224 134 228 116" stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>

        {/* Right branch system */}
        <path d="M 187 340 C 212 326 242 308 270 280"  stroke="#414323" strokeWidth="15" fill="none" strokeLinecap="round"/>
        <path d="M 270 280 C 267 263 264 243 260 208"  stroke="#414323" strokeWidth="9"  fill="none" strokeLinecap="round"/>
        <path d="M 270 280 C 288 264 304 244 318 205"  stroke="#414323" strokeWidth="8"  fill="none" strokeLinecap="round"/>
        <path d="M 270 280 C 294 267 318 252 334 226"  stroke="#414323" strokeWidth="8"  fill="none" strokeLinecap="round"/>
        <path d="M 318 205 C 324 192 326 176 320 162"  stroke="#414323" strokeWidth="5"  fill="none" strokeLinecap="round"/>
        <path d="M 318 205 C 330 195 338 182 336 166"  stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>
        <path d="M 334 226 C 344 214 350 200 346 184"  stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>
        <path d="M 260 208 C 254 195 252 180 256 164"  stroke="#414323" strokeWidth="4"  fill="none" strokeLinecap="round"/>

        {/* Nodes */}
        {nodes.slice(0, 10).map((node, index) => {
          const pos = NODE_POSITIONS[index];
          if (!pos) return null;
          const status  = getStatus(node, index);
          const style   = getStatusStyle(status);
          const isLocked = status === 'locked';
          return (
            <g key={node.id} onClick={() => !isLocked && onNodeClick?.(node)}
               style={{ cursor: isLocked ? 'default' : 'pointer' }} opacity={style.opacity || 1}>
              {status === 'completed' && LEAF_OFFSETS.map((leaf, i) => (
                <circle key={i} cx={pos.x + leaf.dx} cy={pos.y + leaf.dy} r={leaf.r} fill="#ADB684" opacity="0.65"/>
              ))}
              {status === 'available' && (
                <circle cx={pos.x} cy={pos.y} r={style.r + 5} fill="none" stroke="#5A5C41"
                  strokeWidth="1.5" strokeDasharray="3 3" opacity="0.55"/>
              )}
              <circle cx={pos.x} cy={pos.y} r={style.r} fill={style.fill}
                stroke={style.stroke} strokeWidth={isLocked ? 1.5 : 2.5}/>
              {style.innerDot && <circle cx={pos.x} cy={pos.y} r={4} fill={style.innerDot}/>}
              {(isLocked || status === 'available') && (
                <text x={pos.x} y={pos.y + 4} textAnchor="middle" fontSize="8"
                  fill={isLocked ? '#C0BCAF' : '#5A5C41'} fontFamily="Inter, sans-serif" fontWeight="600">
                  {node.order}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
