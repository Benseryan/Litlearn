import React from 'react';

// 12 preset avatars — nature/character themed, each a self-contained SVG
export const PRESET_AVATARS = [
  { id: 'owl',      label: 'Owl' },
  { id: 'fox',      label: 'Fox' },
  { id: 'bear',     label: 'Bear' },
  { id: 'deer',     label: 'Deer' },
  { id: 'rabbit',   label: 'Rabbit' },
  { id: 'cat',      label: 'Cat' },
  { id: 'plant',    label: 'Plant' },
  { id: 'moon',     label: 'Moon' },
  { id: 'sun',      label: 'Sun' },
  { id: 'book',     label: 'Book' },
  { id: 'leaf',     label: 'Leaf' },
  { id: 'mushroom', label: 'Mushroom' },
];

function AvatarOwl({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#414323"/>
      {/* Body */}
      <ellipse cx="32" cy="40" rx="14" ry="16" fill="#ADB684"/>
      {/* Head */}
      <circle cx="32" cy="24" r="13" fill="#ADB684"/>
      {/* Ears */}
      <polygon points="22,14 18,6 26,12" fill="#5A6E35"/>
      <polygon points="42,14 46,6 38,12" fill="#5A6E35"/>
      {/* Eyes */}
      <circle cx="26" cy="23" r="5" fill="#F3F2EA"/>
      <circle cx="38" cy="23" r="5" fill="#F3F2EA"/>
      <circle cx="26" cy="23" r="3" fill="#1A1A0A"/>
      <circle cx="38" cy="23" r="3" fill="#1A1A0A"/>
      <circle cx="27" cy="22" r="1" fill="#fff"/>
      <circle cx="39" cy="22" r="1" fill="#fff"/>
      {/* Beak */}
      <polygon points="32,27 29,30 35,30" fill="#B45309"/>
      {/* Wing marks */}
      <ellipse cx="22" cy="40" rx="5" ry="8" fill="#7A9148" opacity="0.5"/>
      <ellipse cx="42" cy="40" rx="5" ry="8" fill="#7A9148" opacity="0.5"/>
    </svg>
  );
}

function AvatarFox({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#5A3A1A"/>
      {/* Body */}
      <ellipse cx="32" cy="42" rx="13" ry="14" fill="#B45309"/>
      {/* Head */}
      <circle cx="32" cy="26" r="14" fill="#B45309"/>
      {/* Ears */}
      <polygon points="20,16 14,4 26,14" fill="#B45309"/>
      <polygon points="44,16 50,4 38,14" fill="#B45309"/>
      <polygon points="20,16 16,7 24,14" fill="#F3A060"/>
      <polygon points="44,16 48,7 40,14" fill="#F3A060"/>
      {/* Muzzle */}
      <ellipse cx="32" cy="30" rx="7" ry="5" fill="#F3D0A0"/>
      {/* Eyes */}
      <circle cx="26" cy="23" r="3.5" fill="#1A1A0A"/>
      <circle cx="38" cy="23" r="3.5" fill="#1A1A0A"/>
      <circle cx="27" cy="22" r="1" fill="#fff"/>
      <circle cx="39" cy="22" r="1" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="32" cy="28" rx="2" ry="1.5" fill="#1A1A0A"/>
    </svg>
  );
}

function AvatarBear({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#5A3D20"/>
      {/* Ears */}
      <circle cx="18" cy="16" r="8" fill="#7A5530"/>
      <circle cx="46" cy="16" r="8" fill="#7A5530"/>
      <circle cx="18" cy="16" r="4" fill="#B47848"/>
      <circle cx="46" cy="16" r="4" fill="#B47848"/>
      {/* Head */}
      <circle cx="32" cy="28" r="16" fill="#7A5530"/>
      {/* Muzzle */}
      <ellipse cx="32" cy="33" rx="8" ry="6" fill="#B47848"/>
      {/* Eyes */}
      <circle cx="25" cy="25" r="3.5" fill="#1A1A0A"/>
      <circle cx="39" cy="25" r="3.5" fill="#1A1A0A"/>
      <circle cx="26" cy="24" r="1" fill="#fff"/>
      <circle cx="40" cy="24" r="1" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="32" cy="31" rx="2.5" ry="2" fill="#1A1A0A"/>
    </svg>
  );
}

function AvatarDeer({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#414323"/>
      {/* Antlers */}
      <path d="M22 18 L16 6 M16 6 L12 10 M16 6 L20 9" stroke="#7A5530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M42 18 L48 6 M48 6 L52 10 M48 6 L44 9" stroke="#7A5530" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      {/* Head */}
      <circle cx="32" cy="28" r="15" fill="#C8A06A"/>
      {/* Muzzle */}
      <ellipse cx="32" cy="34" rx="7" ry="5" fill="#E8C89A"/>
      {/* Eyes */}
      <circle cx="25" cy="25" r="4" fill="#3A2010"/>
      <circle cx="39" cy="25" r="4" fill="#3A2010"/>
      <circle cx="26" cy="24" r="1.2" fill="#fff"/>
      <circle cx="40" cy="24" r="1.2" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="32" cy="32" rx="2" ry="1.5" fill="#7A3A20"/>
      {/* Ears */}
      <ellipse cx="17" cy="22" rx="4" ry="7" fill="#C8A06A" transform="rotate(-20 17 22)"/>
      <ellipse cx="47" cy="22" rx="4" ry="7" fill="#C8A06A" transform="rotate(20 47 22)"/>
      <ellipse cx="17" cy="22" rx="2" ry="4" fill="#E8B8A0" transform="rotate(-20 17 22)"/>
      <ellipse cx="47" cy="22" rx="2" ry="4" fill="#E8B8A0" transform="rotate(20 47 22)"/>
    </svg>
  );
}

function AvatarRabbit({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#C0BCAF"/>
      {/* Ears */}
      <ellipse cx="22" cy="12" rx="5" ry="12" fill="#D8D4C6"/>
      <ellipse cx="42" cy="12" rx="5" ry="12" fill="#D8D4C6"/>
      <ellipse cx="22" cy="12" rx="2.5" ry="8" fill="#F0A0A0"/>
      <ellipse cx="42" cy="12" rx="2.5" ry="8" fill="#F0A0A0"/>
      {/* Head */}
      <circle cx="32" cy="30" r="16" fill="#E8E4D8"/>
      {/* Cheeks */}
      <circle cx="22" cy="32" r="5" fill="#F0C0C0" opacity="0.5"/>
      <circle cx="42" cy="32" r="5" fill="#F0C0C0" opacity="0.5"/>
      {/* Eyes */}
      <circle cx="25" cy="26" r="4" fill="#5A3A60"/>
      <circle cx="39" cy="26" r="4" fill="#5A3A60"/>
      <circle cx="26" cy="25" r="1.2" fill="#fff"/>
      <circle cx="40" cy="25" r="1.2" fill="#fff"/>
      {/* Nose */}
      <ellipse cx="32" cy="33" rx="2" ry="1.5" fill="#F08080"/>
      {/* Mouth */}
      <path d="M29 35 Q32 38 35 35" stroke="#C06060" strokeWidth="1" fill="none"/>
    </svg>
  );
}

function AvatarCat({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#5A5C41"/>
      {/* Ears */}
      <polygon points="18,20 12,6 26,16" fill="#7A7C55"/>
      <polygon points="46,20 52,6 38,16" fill="#7A7C55"/>
      <polygon points="19,19 14,9 25,16" fill="#F0A0C0"/>
      <polygon points="45,19 50,9 39,16" fill="#F0A0C0"/>
      {/* Head */}
      <circle cx="32" cy="28" r="15" fill="#7A7C55"/>
      {/* Muzzle */}
      <ellipse cx="32" cy="33" rx="6" ry="4" fill="#9A9C75"/>
      {/* Eyes */}
      <ellipse cx="25" cy="25" rx="4" ry="4.5" fill="#7ABA60"/>
      <ellipse cx="39" cy="25" rx="4" ry="4.5" fill="#7ABA60"/>
      <ellipse cx="25" cy="25" rx="1.5" ry="4" fill="#1A1A0A"/>
      <ellipse cx="39" cy="25" rx="1.5" ry="4" fill="#1A1A0A"/>
      <circle cx="25.5" cy="23" r="1" fill="#fff"/>
      <circle cx="39.5" cy="23" r="1" fill="#fff"/>
      {/* Nose */}
      <polygon points="32,31 30,33 34,33" fill="#F080A0"/>
      {/* Whiskers */}
      <line x1="20" y1="32" x2="28" y2="33" stroke="#D8D8C0" strokeWidth="0.8"/>
      <line x1="20" y1="34" x2="28" y2="34" stroke="#D8D8C0" strokeWidth="0.8"/>
      <line x1="36" y1="33" x2="44" y2="32" stroke="#D8D8C0" strokeWidth="0.8"/>
      <line x1="36" y1="34" x2="44" y2="34" stroke="#D8D8C0" strokeWidth="0.8"/>
    </svg>
  );
}

function AvatarPlant({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#3A5A20"/>
      {/* Pot */}
      <path d="M22 50 L20 58 L44 58 L42 50 Z" fill="#7A5530"/>
      <ellipse cx="32" cy="50" rx="11" ry="3" fill="#9A6840"/>
      {/* Stem */}
      <path d="M32 50 C32 40 30 30 32 18" stroke="#5A8030" strokeWidth="3" fill="none" strokeLinecap="round"/>
      {/* Leaves */}
      <ellipse cx="24" cy="36" rx="10" ry="6" fill="#7ABF40" transform="rotate(-30 24 36)"/>
      <ellipse cx="40" cy="30" rx="10" ry="6" fill="#ADB684" transform="rotate(30 40 30)"/>
      <ellipse cx="26" cy="22" rx="9" ry="5" fill="#7ABF40" transform="rotate(-20 26 22)"/>
      {/* Flower */}
      <circle cx="32" cy="16" r="7" fill="#F0D040"/>
      <circle cx="32" cy="16" r="4" fill="#B45309"/>
    </svg>
  );
}

function AvatarMoon({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#0F1A2E"/>
      {/* Stars */}
      {[[12,12],[50,10],[8,40],[55,45],[45,20],[15,52]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r={1.5} fill="#E8EFF8" opacity={0.7}/>
      ))}
      {/* Moon */}
      <circle cx="36" cy="30" r="16" fill="#E8EFF8"/>
      <circle cx="42" cy="26" r="14" fill="#0F1A2E"/>
      {/* Moon face */}
      <circle cx="28" cy="32" r="2.5" fill="#B8C8E0" opacity="0.6"/>
      <circle cx="22" cy="26" r="1.5" fill="#B8C8E0" opacity="0.4"/>
    </svg>
  );
}

function AvatarSun({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#7A5C20"/>
      {/* Rays */}
      {[0,30,60,90,120,150,180,210,240,270,300,330].map((angle, i) => {
        const rad = angle * Math.PI / 180;
        return <line key={i} x1={32 + Math.cos(rad)*15} y1={32 + Math.sin(rad)*15}
          x2={32 + Math.cos(rad)*24} y2={32 + Math.sin(rad)*24}
          stroke="#F0D060" strokeWidth="2.5" strokeLinecap="round"/>;
      })}
      {/* Sun body */}
      <circle cx="32" cy="32" r="13" fill="#F0C030"/>
      <circle cx="32" cy="32" r="10" fill="#FFE060"/>
      {/* Face */}
      <circle cx="27" cy="30" r="2.5" fill="#7A5C20"/>
      <circle cx="37" cy="30" r="2.5" fill="#7A5C20"/>
      <path d="M26 36 Q32 40 38 36" stroke="#7A5C20" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  );
}

function AvatarBook({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#414323"/>
      {/* Book left page */}
      <rect x="12" y="16" width="18" height="32" rx="2" fill="#F3F2EA"/>
      {/* Book right page */}
      <rect x="34" y="16" width="18" height="32" rx="2" fill="#E8E4D4"/>
      {/* Spine */}
      <rect x="29" y="14" width="6" height="36" rx="1" fill="#7A5530"/>
      {/* Lines on pages */}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="16" y1={24+i*5} x2="26" y2={24+i*5} stroke="#ADB684" strokeWidth="1" opacity="0.6"/>
      ))}
      {[0,1,2,3,4].map(i => (
        <line key={i} x1="38" y1={24+i*5} x2="48" y2={24+i*5} stroke="#ADB684" strokeWidth="1" opacity="0.6"/>
      ))}
      {/* Bookmark */}
      <polygon points="46,16 50,16 50,28 48,26 46,28" fill="#B45309"/>
    </svg>
  );
}

function AvatarLeaf({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#3A5A20"/>
      {/* Main leaf */}
      <path d="M32 8 C50 10 58 28 48 48 C38 56 20 52 16 38 C10 20 18 8 32 8 Z" fill="#7ABF40"/>
      {/* Vein */}
      <path d="M32 8 C30 20 28 32 24 48" stroke="#5A8A30" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      {/* Side veins */}
      <path d="M32 20 C38 22 44 26 46 32" stroke="#5A8A30" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M30 28 C36 30 42 34 44 40" stroke="#5A8A30" strokeWidth="1" fill="none" strokeLinecap="round"/>
      <path d="M30 16 C24 18 20 22 18 28" stroke="#5A8A30" strokeWidth="1" fill="none" strokeLinecap="round"/>
      {/* Highlight */}
      <path d="M32 8 C40 12 48 22 46 36" stroke="#ADB684" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.5"/>
    </svg>
  );
}

function AvatarMushroom({ size = 64 }) {
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#5A3A20"/>
      {/* Stem */}
      <rect x="24" y="36" width="16" height="18" rx="3" fill="#F3F2EA"/>
      {/* Gills */}
      <path d="M24 36 Q32 40 40 36" stroke="#D8D4C6" strokeWidth="1" fill="none"/>
      {/* Cap */}
      <ellipse cx="32" cy="34" rx="20" ry="8" fill="#B42020"/>
      <path d="M12 34 Q32 12 52 34" fill="#C83030"/>
      {/* Spots */}
      <circle cx="24" cy="24" r="4" fill="#F3F2EA" opacity="0.9"/>
      <circle cx="38" cy="20" r="3" fill="#F3F2EA" opacity="0.9"/>
      <circle cx="32" cy="30" r="2.5" fill="#F3F2EA" opacity="0.9"/>
      <circle cx="44" cy="28" r="2" fill="#F3F2EA" opacity="0.9"/>
    </svg>
  );
}

const AVATAR_COMPONENTS = {
  owl: AvatarOwl, fox: AvatarFox, bear: AvatarBear, deer: AvatarDeer,
  rabbit: AvatarRabbit, cat: AvatarCat, plant: AvatarPlant, moon: AvatarMoon,
  sun: AvatarSun, book: AvatarBook, leaf: AvatarLeaf, mushroom: AvatarMushroom,
};

export function AvatarDisplay({ avatarId, avatarUrl, size = 64, initials = '?' }) {
  if (avatarUrl) {
    return (
      <img src={avatarUrl} alt="Avatar"
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }} />
    );
  }
  const Component = AVATAR_COMPONENTS[avatarId];
  if (Component) return <Component size={size} />;
  // Fallback initials
  return (
    <svg viewBox="0 0 64 64" width={size} height={size}>
      <circle cx="32" cy="32" r="32" fill="#414323"/>
      <text x="32" y="38" textAnchor="middle" fill="#F3F2EA"
        fontSize="22" fontWeight="700" fontFamily="system-ui">{initials}</text>
    </svg>
  );
}

export default AVATAR_COMPONENTS;
