import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: number | 'sm' | 'md' | 'lg' | 'responsive';
  showText?: boolean;
  textColor?: string;
  subtitle?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'responsive',
  showText = true,
  textColor = '#1C1C1E',
  subtitle,
}) => {
  // Apple squircle dimensions
  let iconClass = 'w-9 h-9 sm:w-10 sm:h-10';
  let textClass = 'text-xl sm:text-2xl';

  if (typeof size === 'number') {
    iconClass = `w-[${size}px] h-[${size}px]`;
  } else if (size === 'sm') {
    iconClass = 'w-7 h-7';
    textClass = 'text-lg';
  } else if (size === 'lg') {
    iconClass = 'w-12 h-12';
    textClass = 'text-3xl';
  }

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ios-press ${className}`}>
      {/* Apple App Icon Squircle */}
      <div
        className={`${iconClass} flex-shrink-0 relative aspect-square transition-transform`}
        style={{
          filter: 'drop-shadow(0 4px 10px rgba(14, 124, 134, 0.28))',
        }}
      >
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full block"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient id="appleCreaG" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#17A2AD" />
              <stop offset="100%" stopColor="#0A5F67" />
            </linearGradient>
            {/* Subtle inner top-light for Apple-like depth */}
            <linearGradient id="appleSheen" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.25" />
              <stop offset="50%" stopColor="#ffffff" stopOpacity="0" />
            </linearGradient>
          </defs>

          {/* Squircle background with Apple corner radius rx="15" on 64px */}
          <rect width="64" height="64" rx="15" fill="url(#appleCreaG)" />
          <rect width="64" height="64" rx="15" fill="url(#appleSheen)" />

          {/* The open "C" shape (comme une enveloppe qui s'entrouvre) */}
          <path
            d="M42.7 23A14 14 0 1 0 42.7 41"
            fill="none"
            stroke="#ffffff"
            strokeWidth="5.5"
            strokeLinecap="round"
          />

          {/* The golden spark (#FFB020) - l'idée qui prend forme */}
          <circle cx="47.5" cy="32" r="3.3" fill="#FFB020" />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col justify-center leading-none">
          <span
            className={`font-bold ${textClass} tracking-[-0.04em] transition-colors`}
            style={{ color: textColor }}
          >
            Créa
          </span>
          {subtitle && (
            <span className="text-[10px] font-medium tracking-tight text-[#6C6C70] mt-0.5">
              {subtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
