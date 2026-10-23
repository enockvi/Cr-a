import React from 'react';
import { Sparkles } from 'lucide-react';
import { OrderTier } from '../types';

interface CardVisualPreviewProps {
  title: string;
  categoryName?: string;
  subtitle?: string;
  dateText?: string;
  tier?: OrderTier;
  backgroundGradient?: string;
  textColor?: string;
  isDarkTheme?: boolean;
  selected?: boolean;
  priceXOF?: number;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const CardVisualPreview: React.FC<CardVisualPreviewProps> = ({
  title,
  categoryName,
  subtitle,
  dateText = '12 décembre 2026',
  tier = 'simple',
  backgroundGradient,
  textColor,
  isDarkTheme = false,
  selected = false,
  priceXOF,
  onClick,
  className = '',
  size = 'md',
}) => {
  const isVip = tier === 'vip';
  const isDeuil = isDarkTheme || categoryName?.toLowerCase().includes('décès') || categoryName?.toLowerCase().includes('deuil');

  // Default color gradients
  const defaultBg = isDeuil
    ? 'linear-gradient(170deg, #15151B, #23232C)'
    : isVip
    ? 'linear-gradient(170deg, #F3EAFE, #D9C9F7)'
    : 'linear-gradient(160deg, #FCEFE6, #F6D5D9)';

  const defaultText = isDeuil ? '#D5D5DC' : isVip ? '#4B2A8F' : '#8A3B57';

  const sizeClasses = {
    sm: 'w-44 text-xs',
    md: 'w-64 text-sm',
    lg: 'w-72 text-base',
    full: 'w-full text-base',
  };

  return (
    <div
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={`group relative flex flex-col text-left transition-all ${
        onClick ? 'cursor-pointer active:scale-97' : ''
      } ${sizeClasses[size]} ${className}`}
    >
      {/* The Invitation Card Box */}
      <div
        className={`relative aspect-[3/4] rounded-2xl p-5 flex flex-col items-center justify-center text-center shadow-md transition-all overflow-hidden ${
          selected ? 'ring-3 ring-[#0E7C86] ring-offset-2 shadow-xl' : 'hover:shadow-lg'
        }`}
        style={{
          background: backgroundGradient || defaultBg,
          color: textColor || defaultText,
        }}
      >
        {/* Subtle decorative inner border */}
        <div
          className="absolute inset-3 border border-current opacity-25 rounded-xl pointer-events-none"
          style={{ borderWidth: '1px' }}
        />

        {/* Top pill/label */}
        <div className="flex items-center gap-1 text-[11px] font-semibold tracking-wider uppercase opacity-80 mb-2">
          {isVip && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-[#FFB020] text-[#1C1C1E] text-[10px] font-bold shadow-2xs">
              <Sparkles className="w-2.5 h-2.5" /> VIP
            </span>
          )}
          <span>{isDeuil ? 'In Memoriam' : categoryName || 'Invitation'}</span>
        </div>

        {/* Main Names / Subject */}
        <div className="my-auto px-2">
          {isDeuil ? (
            <div className="font-serif-title font-semibold text-xl leading-snug tracking-tight text-white">
              {title}
            </div>
          ) : (
            <div className="font-script text-4xl leading-tight font-normal transform -rotate-1 select-none">
              {title}
            </div>
          )}

          {subtitle && (
            <p className="text-xs opacity-75 mt-1.5 line-clamp-1 max-w-[180px] mx-auto font-sans">
              {subtitle}
            </p>
          )}
        </div>

        {/* Date / Sub info */}
        <div className="text-[11px] font-medium opacity-75 mt-2">
          {isDeuil ? 'À la mémoire de' : dateText}
        </div>
      </div>

      {/* Caption & Price Below Card */}
      {priceXOF !== undefined && (
        <div className="flex justify-between items-center px-1 pt-2">
          <span className="font-semibold text-sm text-[#1C1C1E] truncate max-w-[60%]">
            {title}
          </span>
          <span className="font-mono text-xs font-semibold text-[#6C6C70]">
            {priceXOF.toLocaleString('fr-FR')} FCFA
          </span>
        </div>
      )}
    </div>
  );
};
