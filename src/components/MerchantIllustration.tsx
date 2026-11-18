import React from 'react';
import { MerchantCategory } from '../types/commerce';

interface MerchantIllustrationProps {
  category: MerchantCategory;
  name: string;
}

export const MerchantIllustration: React.FC<MerchantIllustrationProps> = ({
  category,
  name,
}) => {
  const paletteByCategory: Record<
    MerchantCategory,
    { bg: string; accent: string; secondary: string; detail: string }
  > = {
    Gastronomía: {
      bg: '#F2F5FA',
      accent: '#0A3663',
      secondary: '#E06D53',
      detail: '#0EA5E9',
    },
    'Moda y Hogar': {
      bg: '#F4F6FB',
      accent: '#0A3663',
      secondary: '#F59E0B',
      detail: '#E06D53',
    },
    'Salud y Óptica': {
      bg: '#F0F7FC',
      accent: '#003954',
      secondary: '#0EA5E9',
      detail: '#0A3663',
    },
    'Náutica y Ocio': {
      bg: '#EEF6FB',
      accent: '#0A3663',
      secondary: '#0EA5E9',
      detail: '#F59E0B',
    },
    'Mercado Central': {
      bg: '#F8F4F2',
      accent: '#0A3663',
      secondary: '#E06D53',
      detail: '#F59E0B',
    },
  };

  const p = paletteByCategory[category];

  return (
    <div
      className="relative h-36 w-full overflow-hidden border-b border-slate-900/8"
      style={{ backgroundColor: p.bg }}
      aria-label={`Ilustración arquitectónica de ${name}`}
    >
      <svg
        viewBox="0 0 360 144"
        className="h-full w-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        {/* Subtle Mediterranean horizon grid */}
        <line x1="0" y1="114" x2="360" y2="114" stroke={p.accent} strokeOpacity="0.14" strokeWidth="1" />
        <path
          d="M0 124 Q 45 118, 90 124 T 180 124 T 270 124 T 360 124"
          fill="none"
          stroke={p.detail}
          strokeOpacity="0.22"
          strokeWidth="1.5"
        />

        {/* Sun / Coastal Horizon Circle */}
        <circle cx="298" cy="38" r="18" fill={p.secondary} fillOpacity="0.16" />
        <circle cx="298" cy="38" r="10" fill={p.secondary} fillOpacity="0.32" />

        {category === 'Gastronomía' && (
          <g>
            {/* Awning & Terrace Storefront */}
            <rect x="64" y="42" width="144" height="72" rx="4" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.2" />
            <path d="M56 44 L216 44 L208 62 L64 62 Z" fill={p.secondary} />
            <rect x="82" y="44" width="18" height="18" fill="#FFFFFF" fillOpacity="0.3" />
            <rect x="118" y="44" width="18" height="18" fill="#FFFFFF" fillOpacity="0.3" />
            <rect x="154" y="44" width="18" height="18" fill="#FFFFFF" fillOpacity="0.3" />
            <rect x="84" y="72" width="44" height="28" rx="3" fill={p.bg} stroke={p.accent} strokeOpacity="0.22" />
            <rect x="144" y="72" width="44" height="42" rx="3" fill={p.accent} fillOpacity="0.08" stroke={p.accent} strokeOpacity="0.22" />
            {/* Coffee cup / plate glyph */}
            <circle cx="256" cy="96" r="14" fill="#FFFFFF" stroke={p.accent} strokeWidth="1.5" />
            <circle cx="256" cy="96" r="7" fill={p.secondary} fillOpacity="0.7" />
          </g>
        )}

        {category === 'Moda y Hogar' && (
          <g>
            {/* Boutique Arch Windows */}
            <rect x="72" y="34" width="148" height="80" rx="4" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.2" />
            <path d="M90 114 V68 A 20 20 0 0 1 130 68 V114 Z" fill={p.bg} stroke={p.accent} strokeOpacity="0.25" />
            <path d="M150 114 V68 A 20 20 0 0 1 190 68 V114 Z" fill={p.accent} fillOpacity="0.08" stroke={p.accent} strokeOpacity="0.25" />
            <rect x="102" y="74" width="16" height="28" rx="2" fill={p.secondary} fillOpacity="0.55" />
            <rect x="242" y="64" width="42" height="50" rx="4" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.2" />
            <line x1="252" y1="80" x2="274" y2="80" stroke={p.secondary} strokeWidth="3" strokeLinecap="round" />
            <line x1="252" y1="92" x2="268" y2="92" stroke={p.accent} strokeOpacity="0.4" strokeWidth="3" strokeLinecap="round" />
          </g>
        )}

        {category === 'Salud y Óptica' && (
          <g>
            {/* Clinical Pavilion & Optical Circles */}
            <rect x="64" y="38" width="156" height="76" rx="6" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.2" />
            <rect x="82" y="56" width="54" height="42" rx="4" fill={p.bg} stroke={p.secondary} strokeOpacity="0.45" />
            <circle cx="176" cy="77" r="14" fill="none" stroke={p.accent} strokeWidth="2.5" />
            <circle cx="204" cy="77" r="14" fill="none" stroke={p.accent} strokeWidth="2.5" />
            <line x1="190" y1="77" x2="190" y2="77" stroke={p.accent} strokeWidth="3" />
            <path d="M188 75 H192" stroke={p.secondary} strokeWidth="2.5" />
            <rect x="98" y="69" width="22" height="6" rx="1.5" fill={p.secondary} />
            <rect x="106" y="61" width="6" height="22" rx="1.5" fill={p.secondary} />
          </g>
        )}

        {category === 'Náutica y Ocio' && (
          <g>
            {/* Harbour Sail & Mooring Bollard */}
            <path d="M94 94 L132 32 L144 94 Z" fill={p.accent} fillOpacity="0.88" />
            <path d="M148 94 L148 44 L182 94 Z" fill={p.secondary} fillOpacity="0.85" />
            <path d="M78 96 H198 L184 112 H92 Z" fill="#FFFFFF" stroke={p.accent} strokeWidth="1.8" />
            {/* Lighthouse / Pier Silhouette */}
            <rect x="236" y="54" width="18" height="60" rx="2" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.3" />
            <rect x="233" y="48" width="24" height="8" rx="2" fill={p.detail} />
          </g>
        )}

        {category === 'Mercado Central' && (
          <g>
            {/* Central Market Iron Arches & Canopy */}
            <path d="M58 58 L226 58 L212 36 L72 36 Z" fill={p.accent} fillOpacity="0.9" />
            <rect x="68" y="58" width="148" height="56" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.2" />
            <path d="M84 114 V74 A 16 16 0 0 1 116 74 V114 Z" fill={p.secondary} fillOpacity="0.18" stroke={p.secondary} strokeOpacity="0.5" />
            <path d="M126 114 V74 A 16 16 0 0 1 158 74 V114 Z" fill={p.detail} fillOpacity="0.18" stroke={p.detail} strokeOpacity="0.5" />
            <path d="M168 114 V74 A 16 16 0 0 1 200 74 V114 Z" fill={p.secondary} fillOpacity="0.18" stroke={p.secondary} strokeOpacity="0.5" />
            {/* Basket / Salt Sack icon */}
            <rect x="242" y="76" width="38" height="38" rx="6" fill="#FFFFFF" stroke={p.accent} strokeOpacity="0.22" />
            <circle cx="261" cy="95" r="9" fill={p.secondary} fillOpacity="0.65" />
          </g>
        )}
      </svg>
    </div>
  );
};
