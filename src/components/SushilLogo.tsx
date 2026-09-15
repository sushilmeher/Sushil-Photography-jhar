import React from 'react';

interface SushilLogoProps {
  className?: string;
  variant?: 'full' | 'badge' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
}

/**
 * Official Sushil Photography Logo
 * Faithfully recreating the 3D artistic emblem with Om motif, Hindi calligraphy,
 * photographer silhouette, vibrant turquoise PHOTOGRAPHY, and studio contact subtitle.
 */
export const SushilLogo: React.FC<SushilLogoProps> = ({
  className = '',
  variant = 'badge',
  size = 'md',
  showSubtitle = true,
}) => {
  // Dimensions map
  const dimensions = {
    sm: { width: 120, height: 40, iconSize: 32 },
    md: { width: 180, height: 60, iconSize: 44 },
    lg: { width: 260, height: 86, iconSize: 56 },
    xl: { width: 340, height: 110, iconSize: 72 },
  }[size];

  if (variant === 'icon') {
    return (
      <svg
        viewBox="0 0 100 100"
        className={`inline-block ${className}`}
        style={{ width: dimensions.iconSize, height: dimensions.iconSize }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="sushil-icon-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA033" />
            <stop offset="50%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#D85600" />
          </linearGradient>
          <linearGradient id="sushil-icon-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38E0C4" />
            <stop offset="50%" stopColor="#00C49F" />
            <stop offset="100%" stopColor="#008E73" />
          </linearGradient>
          <linearGradient id="sushil-icon-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFE27A" />
            <stop offset="50%" stopColor="#E2A62C" />
            <stop offset="100%" stopColor="#9C6B08" />
          </linearGradient>
          <filter id="glow-icon" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* Background rounded badge */}
        <rect width="100" height="100" rx="16" fill="#0C0C10" />
        <rect width="98" height="98" x="1" y="1" rx="15" stroke="url(#sushil-icon-gold)" strokeWidth="1" strokeOpacity="0.4" />

        {/* Om / Artistic Motif */}
        <g filter="url(#glow-icon)">
          {/* Stylized Outer Om Curve */}
          <path
            d="M 28 20 C 14 26 12 44 26 56 C 36 64 34 76 22 82 C 16 85 14 82 18 78 C 26 70 26 62 18 54 C 8 44 12 28 26 22 Z"
            fill="url(#sushil-icon-orange)"
          />
          {/* Inner Teal Wave */}
          <path
            d="M 32 28 C 22 34 22 48 30 56 C 36 62 34 74 24 78 C 28 72 32 64 26 58 C 20 52 20 38 28 32 Z"
            fill="url(#sushil-icon-teal)"
          />
          {/* Tilak / Bindu */}
          <ellipse cx="38" cy="24" rx="4" ry="7" fill="url(#sushil-icon-orange)" />
          <circle cx="44" cy="36" r="5" fill="url(#sushil-icon-gold)" />

          {/* Silhouette Photographer */}
          <circle cx="72" cy="38" r="4.5" fill="url(#sushil-icon-orange)" />
          {/* Cap & Head */}
          <path d="M 68 36 C 68 34 74 33 78 35 L 75 39 Z" fill="url(#sushil-icon-orange)" />
          {/* Body Kneeling with Camera */}
          <path
            d="M 66 43 L 60 41 L 60 44 L 65 46 L 65 58 L 58 72 L 64 74 L 70 62 L 78 62 L 80 72 L 85 72 L 82 58 C 84 54 84 48 78 46 L 72 44 Z"
            fill="url(#sushil-icon-orange)"
          />
          {/* Tripod Stand */}
          <line x1="60" y1="44" x2="59" y2="74" stroke="url(#sushil-icon-orange)" strokeWidth="1.5" />
          <line x1="56" y1="74" x2="86" y2="74" stroke="url(#sushil-icon-orange)" strokeWidth="1.5" />
        </g>
      </svg>
    );
  }

  return (
    <div className={`inline-flex items-center select-none ${className}`}>
      <svg
        viewBox="0 0 380 135"
        className="w-full h-auto max-w-full"
        style={{ maxHeight: dimensions.height }}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Vibrant Gradients matching exact logo */}
          <linearGradient id="logo-grad-orange" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFA033" />
            <stop offset="35%" stopColor="#FF7A00" />
            <stop offset="100%" stopColor="#D85600" />
          </linearGradient>

          <linearGradient id="logo-grad-teal" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38E0C4" />
            <stop offset="45%" stopColor="#00C49F" />
            <stop offset="100%" stopColor="#008E73" />
          </linearGradient>

          <linearGradient id="logo-grad-gold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFF1B0" />
            <stop offset="30%" stopColor="#F5B335" />
            <stop offset="70%" stopColor="#D49419" />
            <stop offset="100%" stopColor="#8A5A00" />
          </linearGradient>

          <linearGradient id="logo-grad-tilak" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C49F" />
            <stop offset="50%" stopColor="#43FFD7" />
            <stop offset="100%" stopColor="#00C49F" />
          </linearGradient>

          {/* 3D Drop Shadow filter */}
          <filter id="logo-3d-shadow" x="-10%" y="-10%" width="130%" height="130%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000000" floodOpacity="0.9" />
            <feDropShadow dx="-0.5" dy="-0.5" stdDeviation="1" floodColor="#ffffff" floodOpacity="0.15" />
          </filter>

          <filter id="logo-soft-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g filter="url(#logo-3d-shadow)">
          {/* ========================================================= */}
          {/* 1. LEFT EMBLEM: ARTISTIC CALLIGRAPHIC OM & FLAME MOTIF    */}
          {/* ========================================================= */}
          <g transform="translate(10, 8)">
            {/* Main Outer Orange Swirl */}
            <path
              d="M 52 14 C 32 6 12 24 16 52 C 20 74 38 82 44 94 C 48 102 44 112 36 114 C 28 116 22 108 26 98 C 30 88 20 76 10 68 C 2 60 -2 42 4 28 C 10 14 26 4 52 14 Z"
              fill="url(#logo-grad-orange)"
            />
            {/* Main Inner Teal Ribbon */}
            <path
              d="M 58 24 C 42 18 24 32 26 56 C 28 74 44 82 48 94 C 50 98 48 104 42 106 C 36 108 30 102 34 94 C 38 84 26 72 18 64 C 12 56 12 40 18 30 C 26 18 42 14 58 24 Z"
              fill="url(#logo-grad-teal)"
            />

            {/* Inner Swirl Flame Curves (Om 3-like curves) */}
            <path
              d="M 44 38 C 38 34 32 40 34 48 C 36 54 44 58 50 64 C 54 70 52 78 46 82 C 40 84 36 80 38 76 C 40 70 32 64 26 56 C 22 50 24 40 30 34 C 36 28 48 30 44 38 Z"
              fill="url(#logo-grad-teal)"
            />

            {/* Top Right Om Tail & Crescent */}
            <path
              d="M 54 28 C 50 24 52 18 58 16 C 66 14 74 20 72 30 C 70 40 60 48 48 46 C 54 44 62 40 62 32 C 62 26 58 22 54 28 Z"
              fill="url(#logo-grad-orange)"
            />

            {/* Om Dot / Bindu (Golden 3D Sphere) */}
            <circle cx="68" cy="42" r="7" fill="url(#logo-grad-gold)" />
            <circle cx="66" cy="40" r="2.5" fill="#FFFFFF" opacity="0.6" />
          </g>

          {/* ========================================================= */}
          {/* 2. CENTER-TOP: TILAK MARK (Green + Center White Dot)       */}
          {/* ========================================================= */}
          <g transform="translate(145, 24)">
            {/* Top Horizontal Rounded Bar */}
            <rect x="0" y="0" width="46" height="5.5" rx="2.75" fill="url(#logo-grad-tilak)" />
            {/* Bottom Horizontal Rounded Bar */}
            <rect x="0" y="8" width="46" height="5.5" rx="2.75" fill="url(#logo-grad-tilak)" />
            {/* Center Red/White Sacred Dot */}
            <circle cx="23" cy="6.75" r="3" fill="#FFFFFF" />
            <circle cx="23" cy="6.75" r="1.5" fill="#FF4400" />
          </g>

          {/* ========================================================= */}
          {/* 3. CENTER: 3D GOLDEN HINDI CALLIGRAPHY "इवा"              */}
          {/* ========================================================= */}
          <g transform="translate(136, 42)">
            {/* Shirorekha (Top Golden Bar) */}
            <rect x="0" y="0" width="82" height="6.5" rx="1.5" fill="url(#logo-grad-gold)" />
            <polygon points="76,0 86,-10 90,-7 82,3" fill="url(#logo-grad-gold)" />

            {/* Letter 'इ' Calligraphic 3D Geometry */}
            {/* Vertical stem */}
            <rect x="18" y="6.5" width="5.5" height="7" fill="url(#logo-grad-gold)" />
            {/* Upper curve */}
            <path
              d="M 10 13.5 H 32 C 34 13.5 35 18 33 21 C 31 24 24 25 18 25 C 13 25 10 28 10 32 C 10 38 18 41 28 39 C 32 38 34 40 33 43 C 31 46 22 47 14 45 C 8 43 5 36 5 30 C 5 22 12 18 20 18 C 24 18 27 16 26 14.5 H 10 Z"
              fill="url(#logo-grad-gold)"
            />
            {/* Tail of 'इ' */}
            <path
              d="M 12 44 C 18 45 22 49 18 55 C 15 58 10 57 8 53 C 6 48 8 44 12 44 Z"
              fill="url(#logo-grad-gold)"
            />

            {/* Letter 'वा' Calligraphic 3D Geometry */}
            {/* Loop of 'व' */}
            <path
              d="M 46 22 C 37 22 36 38 46 41 C 52 42 56 38 56 33 C 56 26 52 22 46 22 Z M 46 27 C 49 27 50 30 50 33 C 50 36 49 37 46 37 C 42 37 41 34 41 31 C 41 28 43 27 46 27 Z"
              fill="url(#logo-grad-gold)"
            />
            {/* Vertical Stem of 'व' */}
            <rect x="54" y="6.5" width="5.5" height="42" rx="1" fill="url(#logo-grad-gold)" />
            {/* Aa ki matra 'ा' */}
            <rect x="68" y="6.5" width="5.5" height="42" rx="1" fill="url(#logo-grad-gold)" />
          </g>

          {/* ========================================================= */}
          {/* 4. RIGHT: KNEELING PHOTOGRAPHER SILHOUETTE ON TRIPOD       */}
          {/* ========================================================= */}
          <g transform="translate(230, 26)">
            {/* Baseline Stand Platform */}
            <path d="M -8 68 L 78 68 L 74 65 L -4 65 Z" fill="url(#logo-grad-orange)" />

            {/* Telephoto Lens & Camera */}
            <rect x="2" y="8" width="14" height="6.5" rx="1" fill="url(#logo-grad-orange)" />
            <polygon points="16,6 24,9 24,14 16,16" fill="url(#logo-grad-orange)" />
            <rect x="24" y="9" width="6" height="7" rx="1" fill="url(#logo-grad-orange)" />

            {/* Tripod Center Column & Legs */}
            <line x1="16" y1="15" x2="16" y2="66" stroke="url(#logo-grad-orange)" strokeWidth="2.5" />

            {/* Photographer Head & Backward Cap */}
            <circle cx="36" cy="14" r="7" fill="url(#logo-grad-orange)" />
            <path d="M 29 12 C 29 9 37 8 44 11 L 39 16 Z" fill="url(#logo-grad-orange)" />

            {/* Photographer Arms aiming camera */}
            <path
              d="M 28 15 L 20 16 L 24 23 L 34 22 L 32 18 Z"
              fill="url(#logo-grad-orange)"
            />

            {/* Photographer Torso & Backpack */}
            <path
              d="M 33 22 L 44 24 C 47 26 48 34 46 44 L 38 46 L 30 38 L 32 24 Z"
              fill="url(#logo-grad-orange)"
            />
            {/* Backpack */}
            <path
              d="M 44 26 C 52 28 54 36 51 46 C 49 50 45 50 44 46 Z"
              fill="url(#logo-grad-orange)"
            />

            {/* Kneeling Legs & Boots */}
            {/* Left Knee Bent on ground */}
            <path
              d="M 38 46 L 46 54 L 46 64 L 38 66 L 34 58 L 32 46 Z"
              fill="url(#logo-grad-orange)"
            />
            {/* Right Leg / Foot tucked */}
            <path
              d="M 30 46 L 24 56 L 24 66 L 36 66 L 36 62 L 28 62 L 32 52 Z"
              fill="url(#logo-grad-orange)"
            />
          </g>

          {/* ========================================================= */}
          {/* 5. VIBRANT TURQUOISE "PHOTOGRAPHY" 3D BLOCK TEXT           */}
          {/* ========================================================= */}
          <g transform="translate(136, 102)">
            <text
              x="0"
              y="0"
              fontFamily="'Montserrat', 'Arial Black', sans-serif"
              fontSize="23"
              fontWeight="900"
              letterSpacing="3.5"
              fill="url(#logo-grad-teal)"
              style={{ textTransform: 'uppercase' }}
            >
              PHOTOGRAPHY
            </text>
          </g>

          {/* ========================================================= */}
          {/* 6. SUBTITLE: SUSHIL PHOTOGRAPHY JHAR 7608814804           */}
          {/* ========================================================= */}
          {showSubtitle && (
            <g transform="translate(136, 120)">
              <text
                x="0"
                y="0"
                fontFamily="'Montserrat', sans-serif"
                fontSize="8.5"
                fontWeight="700"
                letterSpacing="1.2"
                fill="url(#logo-grad-gold)"
              >
                SUSHIL PHOTOGRAPHY JHAR 7608814804
              </text>
            </g>
          )}
        </g>
      </svg>
    </div>
  );
};
