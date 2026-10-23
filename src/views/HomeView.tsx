import React, { useState } from 'react';
import {
  Sparkles,
  Clock,
  ShieldCheck,
  Smartphone,
  Star,
  ArrowRight,
  Heart,
  ChevronRight,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { CardCategory, Review, AppSettings } from '../types';
import { BrandLogo } from '../components/BrandLogo';
import { CardVisualPreview } from '../components/CardVisualPreview';

interface HomeViewProps {
  categories: CardCategory[];
  reviews: Review[];
  settings: AppSettings;
  onSelectCategory: (category: CardCategory) => void;
  onGoToCreate: () => void;
  onGoToTracking: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  categories,
  reviews,
  settings,
  onSelectCategory,
  onGoToCreate,
  onGoToTracking,
}) => {
  const publishedReviews = reviews.filter((r) => r.status === 'published');
  const averageRating =
    publishedReviews.length > 0
      ? (publishedReviews.reduce((acc, r) => acc + r.rating, 0) / publishedReviews.length).toFixed(1)
      : '5.0';

  return (
    <div className="pb-tabbar max-w-md mx-auto">
      {/* Pause Mode Alert if active (Section 8) */}
      {settings.pauseMode && (
        <div className="mx-4 mt-4 p-4 rounded-2xl bg-[#FFF3DC] border border-[#FFE0A3] text-[#8A5A00] text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-[#FFB020]" />
          <div>
            <strong>Commandes temporairement suspendues :</strong>
            <p className="mt-0.5">{settings.pauseMessage}</p>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="px-5 pt-6 pb-4">
        <div className="rounded-3xl p-6 bg-gradient-to-br from-[#17A2AD] via-[#0E7C86] to-[#0A5F67] text-white shadow-xl shadow-[#0E7C86]/25 relative overflow-hidden">
          {/* Subtle decorative circles */}
          <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-white/10 blur-xl pointer-events-none" />
          <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#FFB020]/20 blur-lg pointer-events-none" />

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md mb-4 text-[#FFB020]">
            <Sparkles className="w-3.5 h-3.5 fill-current" />
            <span>Faire-part &amp; Invitations d’exception</span>
          </div>

          <h1 className="font-serif-title font-bold text-3xl leading-[1.15] mb-2 text-white">
            Une belle invitation, livrée en 24 heures.
          </h1>

          <p className="text-white/90 text-sm leading-relaxed mb-6">
            Dites-nous votre événement, nous nous occupons de tout. Réception sur votre compte avec notification WhatsApp.
          </p>

          <button
            onClick={onGoToCreate}
            disabled={settings.pauseMode}
            className="w-full h-13 rounded-2xl bg-white text-[#0A5F67] font-bold text-base flex items-center justify-center gap-2 shadow-lg active:scale-97 transition hover:bg-[#E3F3F4] disabled:opacity-50"
          >
            <span>Créer ma carte</span>
            <ArrowRight className="w-5 h-5 stroke-[2.2]" />
          </button>
        </div>
      </section>

      {/* 3 Key Guarantees */}
      <section className="px-5 py-2">
        <div className="grid grid-cols-3 gap-2.5">
          <div className="bg-white rounded-2xl p-3 text-center border border-[#E5E5EA] shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#E3F3F4] text-[#0E7C86] flex items-center justify-center mx-auto mb-1.5">
              <Clock className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-[#1C1C1E]">24h Chrono</div>
            <div className="text-[10px] text-[#6C6C70]">Décompteur en direct</div>
          </div>

          <div className="bg-white rounded-2xl p-3 text-center border border-[#E5E5EA] shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#FFF3DC] text-[#8A5A00] flex items-center justify-center mx-auto mb-1.5">
              <Smartphone className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-[#1C1C1E]">Mobile Money</div>
            <div className="text-[10px] text-[#6C6C70]">MTN, Moov, Wave...</div>
          </div>

          <div className="bg-white rounded-2xl p-3 text-center border border-[#E5E5EA] shadow-2xs">
            <div className="w-8 h-8 rounded-xl bg-[#E8F7EE] text-[#1E6B45] flex items-center justify-center mx-auto mb-1.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-[11px] font-bold text-[#1C1C1E]">FedaPay Sécurisé</div>
            <div className="text-[10px] text-[#6C6C70]">100% garanti</div>
          </div>
        </div>
      </section>

      {/* Nos Formules : Simple (2 500 FCFA) vs VIP (7 500 FCFA) */}
      <section className="px-5 pt-6 pb-2">
        <div className="flex justify-between items-baseline mb-3">
          <h2 className="font-serif-title font-bold text-xl text-[#1C1C1E]">
            Deux formules adaptées
          </h2>
          <span className="text-xs font-semibold text-[#0E7C86]">Sans abonnement</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Simple */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] flex flex-col justify-between shadow-2xs">
            <div>
              <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#E3F3F4] text-[#0A5F67] mb-2">
                Simple
              </span>
              <h3 className="font-bold text-sm text-[#1C1C1E] mb-1">Visuel Fixe HD</h3>
              <p className="text-[11px] text-[#6C6C70] mb-3 leading-relaxed">
                PDF A4 imprimable, image portrait &amp; format Story WhatsApp. 1 à 3 photos.
              </p>
            </div>
            <div className="pt-2 border-t border-[#E5E5EA] flex items-baseline justify-between">
              <span className="font-mono text-sm font-bold text-[#0E7C86]">
                {settings.simplePriceXOF.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* VIP */}
          <div className="bg-gradient-to-br from-[#FFFDF9] to-[#FDF8EE] rounded-2xl p-4 border border-[#FFB020]/40 flex flex-col justify-between shadow-xs">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF1D6] text-[#8A5A00] mb-2">
                <Sparkles className="w-3 h-3 text-[#FFB020]" /> VIP
              </span>
              <h3 className="font-bold text-sm text-[#1C1C1E] mb-1">Page Web Animée</h3>
              <p className="text-[11px] text-[#6C6C70] mb-3 leading-relaxed">
                Enveloppe interactive, compte à rebours, itinéraire Maps et RSVP WhatsApp !
              </p>
            </div>
            <div className="pt-2 border-t border-[#FFE5B4] flex items-baseline justify-between">
              <span className="font-mono text-sm font-bold text-[#8A5A00]">
                {settings.vipPriceXOF.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories Carousel */}
      <section className="pt-6 pb-2">
        <div className="flex justify-between items-baseline px-5 mb-3">
          <h2 className="font-serif-title font-bold text-xl text-[#1C1C1E]">
            Catégories d’événements
          </h2>
          <button
            onClick={onGoToCreate}
            className="text-xs font-semibold text-[#0E7C86] flex items-center hover:underline"
          >
            Voir tout <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="flex gap-3 overflow-x-auto px-5 no-scrollbar snap-x snap-mandatory pb-2">
          {categories.map((cat) => {
            const sampleTemplate = cat.templates[0];
            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat)}
                className="flex-shrink-0 w-44 snap-center cursor-pointer group text-left"
              >
                <div
                  className="aspect-[3/4] rounded-2xl p-3 flex flex-col justify-between shadow-sm border border-black/5 relative overflow-hidden transition-transform group-hover:scale-102 group-active:scale-97"
                  style={{
                    background: sampleTemplate?.backgroundGradient || 'linear-gradient(160deg, #FCEFE6, #F6D5D9)',
                    color: sampleTemplate?.textColor || '#8A3B57',
                  }}
                >
                  <div className="absolute inset-2 border border-current opacity-20 rounded-xl pointer-events-none" />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-80">
                    {cat.name}
                  </span>
                  <div className="my-auto text-center px-1">
                    <span className={cat.isDarkThemeOnly ? 'font-serif-title font-semibold text-sm text-white' : 'font-script text-2xl'}>
                      {sampleTemplate?.sampleNames[0] || cat.name}
                    </span>
                  </div>
                  <div className="text-[10px] opacity-75 text-center">
                    {cat.isDarkThemeOnly ? 'Fond Nuit sobre' : 'Dès 2 500 FCFA'}
                  </div>
                </div>
                <div className="mt-2 px-1">
                  <h4 className="font-bold text-xs text-[#1C1C1E] group-hover:text-[#0E7C86] transition">
                    {cat.name}
                  </h4>
                  <p className="text-[11px] text-[#6C6C70] truncate">{cat.variants.length} modèles disponibles</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Section Avis Clients (Section 6.1: Si aucun avis publié, la section est masquée) */}
      {publishedReviews.length > 0 && (
        <section className="px-5 pt-6 pb-2">
          <div className="flex justify-between items-baseline mb-3">
            <div>
              <h2 className="font-serif-title font-bold text-xl text-[#1C1C1E]">
                Ce que disent nos clients
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center text-[#FFB020]">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
                <span className="font-bold text-xs text-[#1C1C1E]">{averageRating} / 5</span>
                <span className="text-xs text-[#6C6C70]">({publishedReviews.length} avis vérifiés)</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {publishedReviews.slice(0, 6).map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-2xs"
              >
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-7 h-7 rounded-full bg-[#E3F3F4] text-[#0A5F67] flex items-center justify-center font-bold text-xs">
                      {rev.customerName.charAt(0)}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#1C1C1E]">{rev.customerName}</h4>
                      <p className="text-[10px] text-[#8E8E93]">{rev.cardName}</p>
                    </div>
                  </div>
                  <div className="flex items-center text-[#FFB020]">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-[#3A3A3C] leading-relaxed italic">
                  « {rev.comment} »
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Bottom Track Banner */}
      <section className="px-5 pt-6">
        <div
          onClick={onGoToTracking}
          className="rounded-2xl p-4 bg-white border border-[#E5E5EA] flex items-center justify-between cursor-pointer hover:bg-gray-50 active:scale-98 transition shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E3F3F4] text-[#0E7C86] flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-xs text-[#1C1C1E]">Vous avez déjà commandé ?</h4>
              <p className="text-[11px] text-[#6C6C70]">Entrez votre code de suivi et numéro WhatsApp</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </section>
    </div>
  );
};
