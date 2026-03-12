import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const VARIANTS = {
  primary: { bg: '#414323', shadow: '#252611', text: '#F3F2EA' },
  sage:    { bg: '#ADB684', shadow: '#7d8a5c', text: '#414323' },
  red:     { bg: '#DC2626', shadow: '#991B1B', text: '#FFFFFF' },
  outline: { bg: 'transparent', shadow: 'transparent', text: '#5A5C41', border: '2px solid #C0BCAF' },
};

export default function DuoButton({
  children, variant = 'primary', pulse = false, className, onClick, disabled,
  style: extStyle, color, shadowColor, textColor, type = 'button', ...props
}) {
  const [pressed, setPressed] = useState(false);
  const config = VARIANTS[variant] || VARIANTS.primary;
  const bgColor  = color       || config.bg;
  const shdColor = shadowColor || config.shadow;
  const txtColor = textColor   || config.text;

  return (
    <div className={cn('relative w-full', className)}>
      {pulse && !disabled && (
        <motion.div className="absolute -inset-1 rounded-[20px] pointer-events-none"
          animate={{ opacity: [0.45, 0, 0.45], scale: [0.97, 1.03, 0.97] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          style={{ backgroundColor: bgColor }} />
      )}
      <button type={type}
        onPointerDown={() => !disabled && setPressed(true)}
        onPointerUp={() => setPressed(false)}
        onPointerLeave={() => setPressed(false)}
        onClick={onClick} disabled={disabled} {...props}
        className={cn(
          'relative h-12 w-full flex items-center justify-center gap-2 px-6 rounded-2xl font-semibold text-sm select-none',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        )}
        style={{
          backgroundColor: bgColor, color: txtColor,
          border: config.border || 'none',
          transform: pressed && !disabled ? 'translateY(4px)' : 'translateY(0px)',
          boxShadow: pressed || disabled ? 'none' : `0 4px 0 ${shdColor}`,
          transition: 'transform 0.08s ease, box-shadow 0.08s ease',
          ...extStyle,
        }}>
        {children}
      </button>
    </div>
  );
}
