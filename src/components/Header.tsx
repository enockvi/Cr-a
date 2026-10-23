import React from 'react';
import { BrandLogo } from './BrandLogo';
import { PWAInstallButton } from './PWAInstallButton';
import { OfflineBanner } from './OfflineBanner';

interface HeaderProps {
  onLogoClick?: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onLogoClick,
  title,
  showBack = false,
  onBack,
}) => {
  return (
    <div className="sticky top-0 z-40 w-full select-none">
      <OfflineBanner />

      {/* iOS Translucent Navigation Bar */}
      <header className="w-full ios-glass-header border-b border-[#E5E5EA] transition-all">
        {/* Content area: safe-area aware */}
        <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
          {/* Left: Brand Logo or Back Button */}
          <div className="flex items-center gap-2">
            {showBack && onBack ? (
              <button
                onClick={onBack}
                className="h-10 px-2 -ml-2 rounded-xl text-[#0E7C86] font-semibold text-sm flex items-center gap-1 active:opacity-60 transition"
              >
                <svg
                  className="w-5 h-5 stroke-current stroke-[2.2]"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                <span>Retour</span>
              </button>
            ) : (
              <button
                onClick={onLogoClick}
                className="focus:outline-hidden text-left flex items-center"
                aria-label="Accueil Créa"
              >
                <BrandLogo size="responsive" subtitle="Invitations 24h" />
              </button>
            )}
          </div>

          {/* Center Title (optional in iOS) */}
          {title && (
            <div className="font-semibold text-sm text-[#1C1C1E] truncate max-w-[150px] text-center">
              {title}
            </div>
          )}

          {/* Right: iOS-style Actions (PWA install pill) */}
          <div className="flex items-center gap-2">
            <PWAInstallButton />
          </div>
        </div>
      </header>
    </div>
  );
};
