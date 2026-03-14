import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame } from 'lucide-react';
import DuoButton from '@/components/ui/DuoButton';

// ─── Floating particle ───────────────────────────────────────
function Particle({ x, y, color, delay, size }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ left: x, top: y, width: size, height: size, backgroundColor: color }}
      initial={{ opacity: 1, scale: 1, y: 0, x: 0 }}
      animate={{ opacity: 0, scale: 0.2, y: -320, x: (Math.random() - 0.5) * 180 }}
      transition={{ duration: 2.2 + Math.random(), delay, ease: 'easeOut' }}
    />
  );
}

// ─── SVG growing plant — 5 stages based on streak length ─────
function GrowingPlant({ streak }) {
  const stage =
    streak >= 15 ? 5 :
    streak >= 8  ? 4 :
    streak >= 4  ? 3 :
    streak >= 2  ? 2 : 1;

  return (
    <svg viewBox="0 0 140 220" className="w-40 h-52 drop-shadow-lg">
      {/* ── Pot ── */}
      <motion.path d="M 44 188 L 36 216 L 104 216 L 96 188 Z"
        fill="#5A5C41"
        initial={{ opacity: 0, scaleY: 0 }} animate={{ opacity: 1, scaleY: 1 }}
        style={{ transformOrigin: '70px 188px' }}
        transition={{ duration: 0.4, delay: 0.1 }} />
      <motion.ellipse cx="70" cy="188" rx="27" ry="7" fill="#ADB684"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        style={{ transformOrigin: '70px 188px' }}
        transition={{ duration: 0.35, delay: 0.15 }} />
      <motion.ellipse cx="70" cy="184" rx="22" ry="5" fill="#414323"
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        style={{ transformOrigin: '70px 184px' }}
        transition={{ duration: 0.3, delay: 0.2 }} />

      {/* ── Main stem ── */}
      <motion.path
        d={
          stage >= 4 ? 'M 70 182 C 69 160 71 135 70 105' :
          stage >= 3 ? 'M 70 182 C 69 162 71 142 70 122' :
          stage >= 2 ? 'M 70 182 C 70 166 70 150 70 138' :
                       'M 70 182 C 70 172 70 164 70 158'
        }
        stroke="#5A5C41" strokeWidth="4" fill="none" strokeLinecap="round"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }}
        transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }} />

      {/* ── Stage 1: tiny bud ── */}
      <motion.circle cx="70" cy={stage >= 2 ? 135 : 154} r={stage >= 3 ? 7 : 10}
        fill="#ADB684"
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        style={{ transformOrigin: '70px 154px' }}
        transition={{ delay: 1.0, type: 'spring', stiffness: 320, damping: 12 }} />

      {/* ── Stage 2+: first leaf pair ── */}
      {stage >= 2 && (<>
        <motion.path d="M 69 162 Q 50 152 44 140"
          stroke="#ADB684" strokeWidth="7" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.1, duration: 0.55 }} />
        <motion.path d="M 71 160 Q 90 150 96 138"
          stroke="#ADB684" strokeWidth="7" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.3, duration: 0.55 }} />
        <motion.circle cx="44" cy="140" r="6" fill="#ADB684"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 1.65, type: 'spring' }} />
        <motion.circle cx="96" cy="138" r="6" fill="#ADB684"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          transition={{ delay: 1.85, type: 'spring' }} />
      </>)}

      {/* ── Stage 3+: bigger lower leaves ── */}
      {stage >= 3 && (<>
        <motion.path d="M 69 172 Q 44 162 36 148"
          stroke="#5A5C41" strokeWidth="6" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.4, duration: 0.5 }} />
        <motion.path d="M 71 170 Q 96 160 104 146"
          stroke="#5A5C41" strokeWidth="6" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.55, duration: 0.5 }} />
        <motion.ellipse cx="35" cy="146" rx="10" ry="6" fill="#5A5C41" opacity="0.7"
          transform="rotate(-30 35 146)"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ transformOrigin: '35px 146px' }}
          transition={{ delay: 1.9, type: 'spring' }} />
        <motion.ellipse cx="105" cy="144" rx="10" ry="6" fill="#5A5C41" opacity="0.7"
          transform="rotate(30 105 144)"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ transformOrigin: '105px 144px' }}
          transition={{ delay: 2.05, type: 'spring' }} />
      </>)}

      {/* ── Stage 4+: upper stem + flower bud ── */}
      {stage >= 4 && (<>
        <motion.circle cx="70" cy="100" r="13" fill="#B45309" opacity="0.9"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ transformOrigin: '70px 100px' }}
          transition={{ delay: 2.0, type: 'spring', stiffness: 280 }} />
        <motion.circle cx="70" cy="100" r="7" fill="#EAE7DA"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ transformOrigin: '70px 100px' }}
          transition={{ delay: 2.2, type: 'spring' }} />
        <motion.path d="M 69 128 Q 52 118 48 107"
          stroke="#ADB684" strokeWidth="6" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.45 }} />
        <motion.path d="M 71 126 Q 88 116 92 105"
          stroke="#ADB684" strokeWidth="6" fill="none" strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: 1.85, duration: 0.45 }} />
      </>)}

      {/* ── Stage 5: full bloom ── */}
      {stage >= 5 && (<>
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const pcx = 70 + Math.cos(rad) * 19;
          const pcy = 100 + Math.sin(rad) * 19;
          return (
            <motion.ellipse key={angle}
              cx={pcx} cy={pcy} rx="9" ry="6"
              fill="#B45309" opacity="0.85"
              transform={`rotate(${angle} ${pcx} ${pcy})`}
              initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 0.85 }}
              style={{ transformOrigin: `${pcx}px ${pcy}px` }}
              transition={{ delay: 2.0 + i * 0.07, type: 'spring', stiffness: 300, damping: 14 }} />
          );
        })}
        <motion.circle cx="70" cy="100" r="10" fill="#EAE7DA"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ transformOrigin: '70px 100px' }}
          transition={{ delay: 2.65, type: 'spring' }} />
        <motion.circle cx="70" cy="100" r="5" fill="#B45309"
          initial={{ scale: 0 }} animate={{ scale: 1 }}
          style={{ transformOrigin: '70px 100px' }}
          transition={{ delay: 2.8, type: 'spring' }} />
      </>)}
    </svg>
  );
}

const STAGE_MESSAGES = [
  'A seed is planted!',
  'Your bud is sprouting!',
  'Watch it grow!',
  'Flourishing!',
  'In full bloom! 🌸',
];

// ─── Main component ───────────────────────────────────────────
export default function StreakCelebration({ streak, onClose, friendName }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    const colors = ['#ADB684', '#5A5C41', '#B45309', '#EAE7DA', '#C0BCAF'];
    setParticles(
      Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: `${5 + Math.random() * 90}%`,
        y: `${60 + Math.random() * 30}%`,
        color: colors[i % colors.length],
        size: 6 + Math.random() * 10,
        delay: Math.random() * 0.9,
      }))
    );
  }, []);

  const stage   = streak >= 15 ? 5 : streak >= 8 ? 4 : streak >= 4 ? 3 : streak >= 2 ? 2 : 1;
  const message = STAGE_MESSAGES[stage - 1];
  // Button delay — wait for plant animation to finish
  const btnDelay = stage >= 5 ? 3.2 : stage >= 4 ? 2.8 : 2.0;

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{ backgroundColor: '#2E3018' }}>

      {/* Radial glow */}
      <motion.div className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 1 }}
        style={{ background: 'radial-gradient(circle at 50% 62%, rgba(173,182,132,0.22) 0%, transparent 68%)' }} />

      {/* Particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {particles.map((p) => (
          <Particle key={p.id} x={p.x} y={p.y} color={p.color} delay={p.delay} size={p.size} />
        ))}
      </div>

      <div className="relative z-10 flex flex-col items-center gap-4 px-8 w-full max-w-sm">
        {/* Streak number */}
        <motion.div className="flex items-center gap-3"
          initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 280, damping: 11, delay: 0.1 }}>
          <Flame style={{ width: 36, height: 36, color: '#ADB684' }} />
          <span className="font-bold" style={{ fontSize: 80, lineHeight: 1, color: '#F3F2EA' }}>
            {streak}
          </span>
          <Flame style={{ width: 36, height: 36, color: '#ADB684' }} />
        </motion.div>

        <motion.p className="text-xs font-semibold uppercase tracking-[0.25em]"
          style={{ color: '#ADB684' }}
          initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}>
          Day Streak
        </motion.p>

        {/* Growing plant */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}>
          <GrowingPlant streak={streak} />
        </motion.div>

        {/* Message */}
        <motion.div className="text-center space-y-1"
          initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}>
          <p className="text-xl font-semibold" style={{ color: '#F3F2EA' }}>{message}</p>
          {friendName && (
            <p className="text-sm" style={{ color: '#ADB684' }}>
              🔥 On a streak with {friendName}
            </p>
          )}
        </motion.div>

        {/* CTA button — delayed until plant finishes */}
        <motion.div className="w-full mt-2"
          initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: btnDelay }}>
          <DuoButton
            onClick={onClose}
            color="#ADB684"
            shadowColor="#7d8a5c"
            textColor="#414323">
            Keep growing 🌱
          </DuoButton>
        </motion.div>
      </div>
    </motion.div>
  );
}
