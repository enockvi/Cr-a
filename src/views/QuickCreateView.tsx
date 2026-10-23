import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Search,
  Sparkles,
  ChevronRight,
  MessageCircle,
  HelpCircle,
  Clock,
  Heart,
  GraduationCap,
  Baby,
  Cross,
  Gift,
  Cake,
  ArrowRight,
} from 'lucide-react';
import { CardCategory, CardVariant, OrderTier, AppSettings } from '../types';
import { StorageService } from '../services/storageService';
import { CardVisualPreview } from '../components/CardVisualPreview';
import { PaletteSelector } from '../components/PaletteSelector';
import { ModelPreview } from '../components/ModelPreview';
import { getPalettesForCategory, getPaletteById } from '../config/palettes';

interface QuickCreateViewProps {
  categories: CardCategory[];
  settings: AppSettings;
  onProceedToOrder: (category: CardCategory, variant: CardVariant, tier: OrderTier, templateId: string) => void;
  onBackToHome: () => void;
}

// 6 primary types as highlighted in the spec
const SIX_BUTTONS_META = [
  { id: 'mariage', label: 'Mariage', icon: Heart, color: 'linear-gradient(160deg, #FCEFE6, #F6D5D9)' },
  { id: 'naissance', label: 'Baptême', icon: Baby, color: 'linear-gradient(160deg, #E8F4F8, #CFE6F3)' },
  { id: 'religion', label: 'Communion', icon: Sparkles, color: 'linear-gradient(160deg, #FFFBEF, #F4E7BE)' },
  { id: 'deuil', label: 'Faire-part de décès', icon: Cross, color: 'linear-gradient(170deg, #15151B, #23232C)' },
  { id: 'diplome', label: 'Remise de diplôme', icon: GraduationCap, color: 'linear-gradient(160deg, #EEF3FB, #D3E0F5)' },
  { id: 'anniv', label: 'Anniversaire', icon: Cake, color: 'linear-gradient(160deg, #FFF4D6, #FFE0A3)' },
];

export const QuickCreateView: React.FC<QuickCreateViewProps> = ({
  categories,
  settings,
  onProceedToOrder,
  onBackToHome,
}) => {
  // Screen state: 'select_type' | 'select_model'
  const [screen, setScreen] = useState<'select_type' | 'select_model'>('select_type');
  const [selectedCatId, setSelectedCatId] = useState<string>('mariage');
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [tier, setTier] = useState<OrderTier>('simple');
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSubmitted, setSearchSubmitted] = useState(false);

  const availablePalettes = useMemo(() => {
    return getPalettesForCategory(selectedCatId);
  }, [selectedCatId]);

  const [selectedPaletteId, setSelectedPaletteId] = useState<string>('champagne-rose');

  const currentPalette = useMemo(() => {
    if (selectedCatId === 'deuil') return null;
    return getPaletteById(selectedPaletteId) || availablePalettes[0] || null;
  }, [selectedCatId, selectedPaletteId, availablePalettes]);

  // Time-based dynamic greeting (Section 5.3 & 6)
  const greetingHour = useMemo(() => {
    const h = new Date().getHours();
    if (h < 12) return 'Bonjour';
    if (h < 18) return 'Bon après-midi';
    return 'Bonsoir';
  }, []);

  const currentCategory = useMemo(() => {
    return categories.find((c) => c.id === selectedCatId) || categories[0];
  }, [categories, selectedCatId]);

  // Variant resolution
  const currentVariant = useMemo(() => {
    if (!currentCategory) return null;
    return (
      currentCategory.variants.find((v) => v.id === selectedVariantId) ||
      currentCategory.variants[0]
    );
  }, [currentCategory, selectedVariantId]);

  // Normalized search recognition (V1, without AI - Section 5.3 & 6)
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const norm = searchQuery
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const words = norm.split(/[^a-z0-9-]+/).filter((w) => w.length > 2);
    if (words.length === 0) return [];

    return categories.filter((cat) => {
      return words.some((word) => {
        return cat.keywords.some((k) => {
          const normK = k.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return (
            normK.startsWith(word) ||
            (word.startsWith(normK) && normK.length > 3)
          );
        });
      });
    });
  }, [categories, searchQuery]);

  const handlePerformSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearchSubmitted(true);
    const hasResults = searchResults.length > 0;
    StorageService.logSearch(searchQuery, hasResults);
  };

  const handlePickCategory = (catId: string, variantId?: string) => {
    setSelectedCatId(catId);
    const targetCat = categories.find((c) => c.id === catId);
    if (targetCat) {
      setSelectedVariantId(variantId || targetCat.variants[0]?.id || '');
      // pick first template of current tier
      const t = targetCat.templates.find((tpl) => tpl.tier === tier) || targetCat.templates[0];
      setSelectedTemplateId(t ? t.id : '');
      const pals = getPalettesForCategory(catId);
      if (catId === 'deuil') {
        setSelectedPaletteId('');
      } else if (pals.length > 0) {
        setSelectedPaletteId(pals[0].id);
      }
    }
    setScreen('select_model');
  };

  // Filter templates by selected tier
  const filteredTemplates = useMemo(() => {
    if (!currentCategory) return [];
    return currentCategory.templates.filter((tpl) => tpl.tier === tier);
  }, [currentCategory, tier]);

  const price = tier === 'vip' ? settings.vipPriceXOF : settings.simplePriceXOF;

  return (
    <div className="pb-tabbar max-w-md mx-auto min-h-screen flex flex-col justify-between">
      {/* SCREEN 1: CHOOSE CARD TYPE OR ENTER TEXT */}
      {screen === 'select_type' && (
        <div className="animate-in fade-in duration-300">
          {/* Header Title & Salutation */}
          <div className="px-5 pt-4 pb-2">
            <button
              onClick={onBackToHome}
              className="text-xs font-semibold text-[#0E7C86] flex items-center gap-1 mb-2 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à l’accueil
            </button>
            <span className="text-xs font-medium text-[#6C6C70] tracking-wide">
              {greetingHour}
            </span>
            <h1 className="font-serif-title font-bold text-2xl text-[#1C1C1E] mt-0.5">
              Quelle carte souhaitez-vous créer ?
            </h1>
          </div>

          {/* 6 Quick Buttons (Section 5.3) */}
          <div className="grid grid-cols-2 gap-2.5 px-5 pt-2 pb-4">
            {SIX_BUTTONS_META.map((b) => {
              const IconComp = b.icon;
              return (
                <button
                  key={b.id}
                  onClick={() => handlePickCategory(b.id)}
                  className="bg-white rounded-2xl p-3.5 border border-[#E5E5EA] flex flex-col items-start gap-2.5 text-left active:scale-97 transition shadow-2xs group hover:border-[#0E7C86]"
                >
                  <span
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-xs"
                    style={{ background: b.color }}
                  >
                    <IconComp
                      className={`w-4 h-4 ${
                        b.id === 'deuil' ? 'text-white' : 'text-[#1C1C1E]'
                      }`}
                    />
                  </span>
                  <span className="font-semibold text-sm text-[#1C1C1E] group-hover:text-[#0E7C86] transition">
                    {b.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Free Text Intent Search Box (Section 5.3 & 6) */}
          <div className="px-5 pt-2">
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-2xs">
              <p className="text-xs text-[#6C6C70] mb-3 leading-relaxed">
                Votre événement n’est pas dans la liste ? Dites-nous pour quel événement, concrètement.
              </p>

              <form onSubmit={handlePerformSearch} className="flex gap-2">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    if (searchSubmitted) setSearchSubmitted(false);
                  }}
                  placeholder="Ex. : inauguration de ma boutique"
                  aria-label="Votre événement"
                  className="flex-1 h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86] focus:ring-3 focus:ring-[#0E7C86]/15 bg-white"
                />
                <button
                  type="submit"
                  aria-label="Rechercher"
                  className="w-12 h-12 rounded-xl bg-[#0E7C86] text-white flex items-center justify-center active:scale-95 transition shadow-xs hover:bg-[#0A5F67]"
                >
                  <Search className="w-5 h-5" />
                </button>
              </form>
            </div>

            {/* Results or Custom Card Fallback */}
            {searchQuery.trim().length > 2 && (
              <div className="mt-4 space-y-2 animate-in fade-in">
                {searchResults.length > 0 ? (
                  <div>
                    <p className="text-xs font-semibold text-[#6C6C70] px-1 mb-2">
                      Voici les cartes qui correspondent :
                    </p>
                    <div className="space-y-2">
                      {searchResults.map((cat) => (
                        <button
                          key={cat.id}
                          onClick={() => handlePickCategory(cat.id)}
                          className="w-full bg-white p-3.5 rounded-2xl border border-[#E5E5EA] flex items-center justify-between text-left active:scale-98 transition shadow-2xs hover:border-[#0E7C86]"
                        >
                          <div className="flex items-center gap-3">
                            <span
                              className="w-8 h-8 rounded-lg flex-shrink-0"
                              style={{
                                background: cat.templates[0]?.backgroundGradient || '#E3F3F4',
                              }}
                            />
                            <div>
                              <div className="font-bold text-sm text-[#1C1C1E]">{cat.name}</div>
                              <div className="text-[11px] text-[#6C6C70]">{cat.greetingTitle}</div>
                            </div>
                          </div>
                          <ChevronRight className="w-4 h-4 text-gray-400" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : searchSubmitted ? (
                  /* Custom Card Fallback with WhatsApp CTA (Section 5.3 & 6) */
                  <div className="bg-[#FFF8ED] border border-[#FFE0A3] rounded-2xl p-4 text-left shadow-2xs">
                    <p className="text-xs text-[#8A5A00] leading-relaxed mb-3">
                      Pas encore de modèle pour « <strong>{searchQuery}</strong> ». Dites-nous ce qu’il vous faut, nous créons une carte sur mesure.
                    </p>
                    <a
                      href={`https://wa.me/${settings.adminWhatsApp.replace(/\D/g, '')}?text=${encodeURIComponent(
                        `Bonjour Créa, je voudrais une carte sur mesure pour mon événement : ${searchQuery}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-[#2FB36D] text-white font-semibold text-xs active:scale-97 transition shadow-xs hover:bg-[#279c5f]"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Demander une carte sur mesure sur WhatsApp
                    </a>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      )}

      {/* SCREEN 2: CHOOSE MODEL & TIER (Écran des modèles) */}
      {screen === 'select_model' && (
        <div className="animate-in fade-in duration-300">
          {/* Top Bar with Back Button */}
          <div className="px-5 pt-3 pb-2 flex items-center justify-between">
            <button
              onClick={() => setScreen('select_type')}
              className="text-xs font-semibold text-[#0E7C86] flex items-center gap-1 hover:underline"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Choisir une autre carte
            </button>
            <span className="text-xs font-mono font-semibold text-[#6C6C70]">
              {price.toLocaleString('fr-FR')} FCFA
            </span>
          </div>

          {/* Banner with Warm Custom Greeting (Section 5.3 & 6) */}
          <div className="px-5 pt-1">
            <div
              className={`rounded-2xl p-4 shadow-2xs border ${
                currentCategory.isDarkThemeOnly
                  ? 'bg-[#1C1C24] text-white border-gray-800'
                  : 'bg-[#E3F3F4] text-[#0A5F67] border-[#CFEDF0]'
              }`}
            >
              <h3 className="font-serif-title font-bold text-lg mb-1">
                {currentCategory.greetingTitle}
              </h3>
              <p className="text-xs opacity-90 leading-relaxed">
                {currentCategory.greetingMessage}
              </p>
            </div>
          </div>

          {/* Sub-variants Pills if category has multiple variants */}
          {currentCategory.variants.length > 1 && (
            <div className="px-5 pt-3">
              <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
                {currentCategory.variants.map((v) => {
                  const active = v.id === currentVariant?.id;
                  return (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                        active
                          ? 'bg-[#0E7C86] text-white shadow-xs'
                          : 'bg-white text-[#6C6C70] border border-[#E5E5EA] hover:bg-gray-50'
                      }`}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Segmented Control: Simples / VIP */}
          <div className="px-5 pt-4">
            <div className="bg-[#E3E3E8] p-1 rounded-xl flex">
              <button
                onClick={() => {
                  setTier('simple');
                  const t = currentCategory.templates.find((x) => x.tier === 'simple');
                  if (t) setSelectedTemplateId(t.id);
                }}
                className={`flex-1 h-8 rounded-lg text-xs font-semibold transition-all ${
                  tier === 'simple'
                    ? 'bg-white text-[#1C1C1E] shadow-xs'
                    : 'text-[#6C6C70] hover:text-[#1C1C1E]'
                }`}
              >
                Simples · {settings.simplePriceXOF.toLocaleString('fr-FR')} FCFA
              </button>
              <button
                onClick={() => {
                  setTier('vip');
                  const t = currentCategory.templates.find((x) => x.tier === 'vip');
                  if (t) setSelectedTemplateId(t.id);
                }}
                className={`flex-1 h-8 rounded-lg text-xs font-semibold flex items-center justify-center gap-1 transition-all ${
                  tier === 'vip'
                    ? 'bg-white text-[#8A5A00] shadow-xs'
                    : 'text-[#6C6C70] hover:text-[#1C1C1E]'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#FFB020]" />
                VIP · {settings.vipPriceXOF.toLocaleString('fr-FR')} FCFA
              </button>
            </div>
          </div>

          {/* Color Palette Selector (v2) */}
          <div className="px-5 pt-3">
            <div className="bg-white rounded-2xl p-3.5 border border-[#E5E5EA] shadow-2xs">
              <PaletteSelector
                categoryId={currentCategory.id}
                selectedPaletteId={selectedPaletteId}
                onSelectPalette={(palette) => setSelectedPaletteId(palette.id)}
              />
            </div>
          </div>

          {/* Models Display: Horizontal rail for Simple, Vertical for VIP (Section 5.3) */}
          <div className="pt-4 pb-20">
            {tier === 'simple' ? (
              // Simple: Rail horizontal
              <div className="flex gap-4 overflow-x-auto px-5 pb-4 no-scrollbar snap-x snap-mandatory">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className="snap-center flex-shrink-0 cursor-pointer"
                    >
                      <ModelPreview
                        title={tpl.sampleNames[0]}
                        categoryName={currentVariant?.name || currentCategory.name}
                        subtitle={tpl.subtitle}
                        dateText={tpl.sampleDate}
                        tier="simple"
                        palette={currentPalette}
                        isDeuil={currentCategory.id === 'deuil'}
                        selected={isSelected}
                        size="md"
                        priceXOF={settings.simplePriceXOF}
                      />
                    </div>
                  );
                })}
              </div>
            ) : (
              // VIP: Vertical column
              <div className="px-5 space-y-4">
                {filteredTemplates.map((tpl) => {
                  const isSelected = selectedTemplateId === tpl.id;
                  return (
                    <div
                      key={tpl.id}
                      onClick={() => setSelectedTemplateId(tpl.id)}
                      className="cursor-pointer"
                    >
                      <ModelPreview
                        title={tpl.sampleNames[0]}
                        categoryName={currentVariant?.name || currentCategory.name}
                        subtitle={tpl.subtitle}
                        dateText={tpl.sampleDate}
                        tier="vip"
                        palette={currentPalette}
                        isDeuil={currentCategory.id === 'deuil'}
                        selected={isSelected}
                        size="full"
                        priceXOF={settings.vipPriceXOF}
                      />
                      <div className="mt-2 text-xs text-[#6C6C70] px-1 flex items-center justify-between">
                        <span>Page web animée · RSVP WhatsApp inclus</span>
                        <span className="font-semibold text-[#8A5A00]">Livré en 24h</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sticky CTA to Proceed cleanly above the bottom tab bar */}
          <div
            className="fixed left-0 right-0 z-30 max-w-md mx-auto px-4 pb-2 pt-4 bg-gradient-to-t from-[#F2F2F7] via-[#F2F2F7]/95 to-transparent pointer-events-none"
            style={{
              bottom: 'calc(68px + env(safe-area-inset-bottom, 16px))',
            }}
          >
            <button
              disabled={!selectedTemplateId}
              onClick={() => {
                if (currentVariant && selectedTemplateId) {
                  if (currentCategory.id !== 'deuil' && selectedPaletteId) {
                    StorageService.saveDraft({ paletteId: selectedPaletteId });
                  }
                  onProceedToOrder(currentCategory, currentVariant, tier, selectedTemplateId);
                }
              }}
              className="pointer-events-auto w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-base flex items-center justify-center gap-2 ios-press shadow-lg shadow-[#0E7C86]/30 disabled:opacity-40"
            >
              <span>
                {selectedTemplateId
                  ? `Choisir cette carte · ${price.toLocaleString('fr-FR')} FCFA`
                  : 'Sélectionnez un modèle'}
              </span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
