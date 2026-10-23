import React from 'react';
import { ColorPalette, getPalettesForCategory } from '../config/palettes';
import { Check } from 'lucide-react';

interface PaletteSelectorProps {
  categoryId: string; // ex: 'mariage', 'naissance', 'religion', etc.
  selectedPaletteId: string;
  onSelectPalette: (palette: ColorPalette) => void;
  className?: string;
}

export const PaletteSelector: React.FC<PaletteSelectorProps> = ({
  categoryId,
  selectedPaletteId,
  onSelectPalette,
  className = '',
}) => {
  // If Deuil, no palette is displayed (fond sombre Nuit réservé)
  if (categoryId === 'deuil') {
    return (
      <div className={`p-3.5 rounded-2xl bg-[#1C1C24] border border-gray-800 text-xs text-gray-300 ${className}`}>
        <span className="font-semibold text-white block mb-0.5">Teinte sobre Nuit exclusive</span>
        <span className="text-[11px] text-gray-400">
          Comme prévu par le cahier des charges, les cartes de deuil utilisent exclusivement le fond sombre Nuit (#15151B) et texte argenté.
        </span>
      </div>
    );
  }

  const palettes = getPalettesForCategory(categoryId);
  if (palettes.length === 0) return null;

  const categoryTitle = palettes[0]?.categorie || 'Palettes recommandées';

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Category Group Title */}
      <div className="flex justify-between items-baseline">
        <label className="block text-xs font-bold text-[#1C1C1E]">
          Harmonie de couleurs ({categoryTitle})
        </label>
        <span className="text-[10px] text-[#6C6C70] font-mono font-medium">
          {palettes.length} palettes disponibles
        </span>
      </div>

      {/* Grid of Palette Options (min-height >= 44px touch targets) */}
      <div className="grid grid-cols-2 gap-2">
        {palettes.map((palette) => {
          const isSelected = selectedPaletteId === palette.id;
          const { bg, text, accent1, accent2 } = palette.tokens;

          return (
            <button
              key={palette.id}
              type="button"
              onClick={() => onSelectPalette(palette)}
              className={`p-2.5 rounded-2xl border text-left min-h-[50px] transition-all flex flex-col justify-between active:scale-97 cursor-pointer ${
                isSelected
                  ? 'border-[#0E7C86] bg-white ring-2 ring-[#0E7C86]/20 shadow-xs'
                  : 'border-[#E5E5EA] bg-white hover:border-gray-300'
              }`}
            >
              {/* Palette Name + Selection Check */}
              <div className="flex justify-between items-center mb-1.5">
                <span className="font-bold text-xs text-[#1C1C1E] truncate pr-1">
                  {palette.nom}
                </span>
                {isSelected && (
                  <span className="w-4 h-4 rounded-full bg-[#0E7C86] text-white flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                )}
              </div>

              {/* Three-Color Swatch Bar (bg, text, accent gradient) */}
              <div className="w-full h-4 rounded-md overflow-hidden flex border border-[#E5E5EA] shadow-2xs">
                {/* 1. Background color */}
                <span
                  className="flex-1 h-full"
                  style={{ backgroundColor: bg }}
                  title={`Fond: ${bg}`}
                />
                {/* 2. Text color */}
                <span
                  className="flex-1 h-full"
                  style={{ backgroundColor: text }}
                  title={`Texte: ${text}`}
                />
                {/* 3. Accent gradient */}
                <span
                  className="flex-2 h-full"
                  style={{
                    background: `linear-gradient(135deg, ${accent1}, ${accent2})`,
                  }}
                  title={`Accents: ${accent1} → ${accent2}`}
                />
              </div>

              {/* Mood subtitle */}
              <span className="text-[10px] text-[#6C6C70] truncate mt-1">
                {palette.ambiance}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
