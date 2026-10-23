import React, { useState } from 'react';
import { Sparkles, Eye, ArrowRight, X, Check, ShieldCheck, Clock } from 'lucide-react';
import { CardCategory, CardVariant, OrderTier, AppSettings } from '../types';
import { CardVisualPreview } from '../components/CardVisualPreview';

interface CatalogViewProps {
  categories: CardCategory[];
  settings: AppSettings;
  onSelectModel: (category: CardCategory, variant: CardVariant, tier: OrderTier, templateId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  categories,
  settings,
  onSelectModel,
}) => {
  const [selectedCatId, setSelectedCatId] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<OrderTier>('simple');
  const [previewTemplate, setPreviewTemplate] = useState<{
    category: CardCategory;
    variant: CardVariant;
    template: CardCategory['templates'][0];
  } | null>(null);

  const filteredCategories = selectedCatId === 'all'
    ? categories
    : categories.filter((c) => c.id === selectedCatId);

  return (
    <div className="pb-tabbar max-w-md mx-auto">
      {/* Header */}
      <div className="px-5 pt-4 pb-2">
        <h1 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
          Catalogue des modèles
        </h1>
        <p className="text-xs text-[#6C6C70] mt-0.5">
          Des créations raffinées conçues pour tous vos moments précieux.
        </p>
      </div>

      {/* Segmented Control Simple / VIP */}
      <div className="px-5 pt-2">
        <div className="bg-[#E3E3E8] p-1 rounded-xl flex">
          <button
            onClick={() => setTierFilter('simple')}
            className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
              tierFilter === 'simple'
                ? 'bg-white text-[#1C1C1E] shadow-xs'
                : 'text-[#6C6C70] hover:text-[#1C1C1E]'
            }`}
          >
            Formule Simple ({settings.simplePriceXOF.toLocaleString('fr-FR')} FCFA)
          </button>
          <button
            onClick={() => setTierFilter('vip')}
            className={`flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
              tierFilter === 'vip'
                ? 'bg-white text-[#8A5A00] shadow-xs'
                : 'text-[#6C6C70] hover:text-[#1C1C1E]'
            }`}
          >
            <Sparkles className="w-3 h-3 text-[#FFB020]" />
            Formule VIP ({settings.vipPriceXOF.toLocaleString('fr-FR')} FCFA)
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="px-5 pt-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => setSelectedCatId('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCatId === 'all'
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
            }`}
          >
            Tous les univers
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelectedCatId(c.id)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCatId === c.id
                  ? 'bg-[#0E7C86] text-white shadow-xs'
                  : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Models Grid by Category */}
      <div className="px-5 pt-4 space-y-8">
        {filteredCategories.map((cat) => {
          const templates = cat.templates.filter((t) => t.tier === tierFilter);
          if (templates.length === 0) return null;

          return (
            <section key={cat.id} className="space-y-3">
              <div className="flex justify-between items-baseline border-b border-[#E5E5EA] pb-2">
                <div>
                  <h2 className="font-bold text-base text-[#1C1C1E]">{cat.name}</h2>
                  <p className="text-xs text-[#6C6C70]">{cat.greetingTitle}</p>
                </div>
                <span className="text-[11px] font-mono font-medium text-[#8E8E93]">
                  {templates.length} modèle(s)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    onClick={() =>
                      setPreviewTemplate({
                        category: cat,
                        variant: cat.variants[0],
                        template: tpl,
                      })
                    }
                    className="cursor-pointer group text-left"
                  >
                    <CardVisualPreview
                      title={tpl.sampleNames[0]}
                      categoryName={cat.name}
                      subtitle={tpl.subtitle}
                      dateText={tpl.sampleDate}
                      tier={tierFilter}
                      backgroundGradient={tpl.backgroundGradient}
                      textColor={tpl.textColor}
                      isDarkTheme={cat.isDarkThemeOnly}
                      size="full"
                      priceXOF={tierFilter === 'vip' ? settings.vipPriceXOF : settings.simplePriceXOF}
                    />
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Model Preview Modal */}
      {previewTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full shadow-2xl border border-gray-100 max-h-[90vh] overflow-y-auto no-scrollbar text-left relative">
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7C86]">
                {previewTemplate.category.name}
              </span>
              <h3 className="font-serif-title font-bold text-xl text-[#1C1C1E]">
                {previewTemplate.template.name}
              </h3>
            </div>

            {/* Visual card */}
            <div className="mb-4 flex justify-center">
              <CardVisualPreview
                title={previewTemplate.template.sampleNames[0]}
                categoryName={previewTemplate.category.name}
                subtitle={previewTemplate.template.subtitle}
                dateText={previewTemplate.template.sampleDate}
                tier={previewTemplate.template.tier}
                backgroundGradient={previewTemplate.template.backgroundGradient}
                textColor={previewTemplate.template.textColor}
                isDarkTheme={previewTemplate.category.isDarkThemeOnly}
                size="md"
              />
            </div>

            {/* Details & Inclusions Breakdown (Section 3) */}
            <div className="bg-[#F2F2F7] rounded-2xl p-4 text-xs space-y-2 mb-5">
              <div className="font-bold text-sm text-[#1C1C1E] mb-1">
                Ce qui est inclus dans cette formule :
              </div>
              {previewTemplate.template.tier === 'vip' ? (
                <>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Lien privé de la page web animée (hébergement 12 mois)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Enveloppe interactive, compte à rebours &amp; galerie 4-8 photos</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Bouton confirmation WhatsApp (sans base de données requise)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Fichier PDF d’impression haute résolution inclus</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-[#0E7C86] flex-shrink-0" />
                    <strong>Livraison garantie sous 24 heures (jusqu’à 3 révisions)</strong>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Fichier PDF A4 d’impression haute définition</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Image portrait haute résolution (1080×1350 px)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Check className="w-4 h-4 text-[#2FB36D] flex-shrink-0" />
                    <span>Image plein écran pour Story / Statut WhatsApp (1080×1920 px)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-700">
                    <Clock className="w-4 h-4 text-[#0E7C86] flex-shrink-0" />
                    <strong>Livraison garantie sous 24 heures (1 révision incluse)</strong>
                  </div>
                </>
              )}
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                onSelectModel(
                  previewTemplate.category,
                  previewTemplate.variant,
                  previewTemplate.template.tier,
                  previewTemplate.template.id
                );
                setPreviewTemplate(null);
              }}
              className="w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#0E7C86]/30"
            >
              <span>
                Choisir ce modèle ·{' '}
                {(previewTemplate.template.tier === 'vip'
                  ? settings.vipPriceXOF
                  : settings.simplePriceXOF
                ).toLocaleString('fr-FR')}{' '}
                FCFA
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
