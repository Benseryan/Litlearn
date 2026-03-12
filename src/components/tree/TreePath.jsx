import React from 'react';

export default function TreePath({ isActive }) {
  return (
    <div className="flex justify-center my-1">
      <div className={`w-0.5 h-6 rounded-full transition-colors ${isActive ? 'bg-olive-dark/30' : 'bg-neutral_tone/30'}`} />
    </div>
  );
}
