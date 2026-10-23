import React from 'react';
import { Sparkles } from 'lucide-react';
import { ColorPalette, DEUIL_TOKENS } from '../config/palettes';
import { OrderTier } from '../types';

interface ModelPreviewProps {
  title: string;
  categoryName?: string;
  subtitle?: string;
  dateText?: string;
  tier?: OrderTier;
  palette?: ColorPalette | null;
  isDeuil?: boolean;
  selected?: boolean;
  priceXOF?: number;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'full';
}

export const ModelPreview: React.FC<ModelPreviewProps> = ({
  title,
  categoryName,
  subtitle,
  dateText = '12 décembre 2026',
  tier = 'simple',
  palette,
  isDeuil = false,
  selected = false,
  priceXOF,
  onClick,
  className = '',
  size = 'md',
}) => {
  const isVip = tier === 'vip';
  const deuilMode = isDeuil || categoryName?.toLowerCase().includes('décès') || categoryName?.toLowerCase().includes('deuil');

  // Extract tokens either from palette or deuil tokens
  const tokens = deuilMode ? DEUIL_TOKENS : palette?.tokens;

  const bg = tokens?.bg || (deuilMode ? '#15151B' : '#FBF6F3');
  const card = tokens?.card || (deuilMode ? '#1F1F27' : '#FFFFFF');
  const text = tokens?.text || (deuilMode ? '#D5D5DC' : '#3D2B2B');
  const muted = tokens?.muted || (deuilMode ? '#8E8E9A' : '#7A6260');
  const border = tokens?.border || (deuilMode ? '#2E2E38' : '#EFE3DE');
  const g1 = tokens?.accent1 || (deuilMode ? '#3A3A46' : '#B76E79');
  const g2 = tokens?.accent2 || (deuilMode ? '#525260' : '#D8A7A0');
  const onAccent = tokens?.textOnAccent || (deuilMode ? '#FFFFFF' : '#141413');

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
      style={
        {
          '--bg-app': bg,
          '--bg-card': card,
          '--text-main': text,
          '--text-muted': muted,
          '--border-color': border,
          '--grad-start': g1,
          '--grad-end': g2,
          '--text-on-accent': onAccent,
        } as React.CSSProperties
      }
    >
      {/* Container card styling matching palette tokens */}
      <div
        className={`relative aspect-[3/4] rounded-2xl p-5 flex flex-col items-center justify-between text-center shadow-md transition-all duration-300 overflow-hidden ${
          selected ? 'ring-3 ring-[#0E7C86] ring-offset-2 shadow-xl' : 'hover:shadow-lg'
        }`}
        style={{
          backgroundColor: card,
          color: text,
          borderColor: border,
          borderWidth: '1px',
        }}
      >
        {/* Decorative header gradient band */}
        <div
          className="absolute top-0 left-0 right-0 h-28 opacity-90 transition-all duration-300 flex items-center justify-center p-2"
          style={{
            background: `linear-gradient(135deg, ${g1}, ${g2})`,
            color: onAccent,
          }}
        >
          <div
            className="w-full h-full rounded-xl border border-white/20 flex items-center justify-center pointer-events-none"
          >
            <span
              className={
                deuilMode
                  ? 'font-serif-title font-semibold text-lg text-white'
                  : 'font-script text-3xl select-none drop-shadow-xs'
              }
            >
              {title}
            </span>
          </div>
        </div>

        {/* Top pill/label */}
        <div className="z-10 w-full flex items-center justify-between pt-1">
          <span
            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs backdrop-blur-md"
            style={{
              backgroundColor: `${card}CC`,
              color: text,
              borderColor: border,
            }}
          >
            {deuilMode ? 'In Memoriam' : categoryName || 'Invitation'}
          </span>

          {isVip && (
            <span
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold shadow-2xs"
              style={{
                backgroundColor: g1,
                color: onAccent,
              }}
            >
              <Sparkles className="w-2.5 h-2.5" /> VIP
            </span>
          )}
        </div>

        {/* Body content */}
        <div className="mt-20 z-10 my-auto px-2 space-y-1.5">
          <p
            className="font-serif-title text-sm font-semibold tracking-tight leading-snug"
            style={{ color: text }}
          >
            {deuilMode ? 'À la mémoire de' : 'Vous êtes conviés'}
          </p>

          <p
            className="text-xs leading-relaxed line-clamp-2 font-sans transition-colors duration-300"
            style={{ color: muted }}
          >
            {subtitle || 'Une célébration unique entourée de nos proches les plus chers.'}
          </p>
        </div>

        {/* Action Button & Date using contrast-calculated onAccent text */}
        <div className="z-10 w-full pt-2 border-t" style={{ borderColor: border }}>
          <div
            className="w-full py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 shadow-xs transition-colors duration-300"
            style={{
              background: `linear-gradient(135deg, ${g1}, ${g2})`,
              color: onAccent,
            }}
          >
            <span>{deuilMode ? 'Recueillement' : isVip ? 'Ouvrir l’enveloppe' : 'Détails de l’événement'}</span>
          </div>
          <div className="text-[10px] font-mono mt-1.5 opacity-75" style={{ color: muted }}>
            {deuilMode ? '1948 – 2026' : dateText}
          </div>
        </div>
      </div>

      {/* Caption & Price Below Card */}
      {priceXOF !== undefined && (
        <div className="flex justify-between items-center px-1 pt-2">
          <span className="font-semibold text-xs text-[#1C1C1E] truncate max-w-[65%]">
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
