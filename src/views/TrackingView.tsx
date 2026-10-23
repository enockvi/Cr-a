import React, { useState, useEffect } from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  Download,
  ExternalLink,
  Star,
  Sparkles,
  ShoppingBag,
  AlertCircle,
  FileText,
  Image as ImageIcon,
  Smartphone,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { Order, Review } from '../types';
import { StorageService } from '../services/storageService';
import { CountdownTimer } from '../components/CountdownTimer';

interface TrackingViewProps {
  initialOrder?: Order | null;
  onOpenVIPPage: (order: Order) => void;
}

export const TrackingView: React.FC<TrackingViewProps> = ({
  initialOrder,
  onOpenVIPPage,
}) => {
  // Login credentials state
  const [whatsappInput, setWhatsappInput] = useState(initialOrder?.whatsapp || '');
  const [codeInput, setCodeInput] = useState(initialOrder?.trackingCode || '');
  const [activeOrder, setActiveOrder] = useState<Order | null>(initialOrder || null);
  const [loginError, setLoginError] = useState('');
  const [rateLimitExceeded, setRateLimitExceeded] = useState(false);

  // Tab: 'current' | 'history'
  const [activeSubTab, setActiveSubTab] = useState<'current' | 'history'>('current');
  const [userOrders, setUserOrders] = useState<Order[]>([]);

  // Rating review state (Section 6.6)
  const [selectedStars, setSelectedStars] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasRated, setHasRated] = useState(false);

  // Sync if initialOrder passed
  useEffect(() => {
    if (initialOrder) {
      setActiveOrder(initialOrder);
      setWhatsappInput(initialOrder.whatsapp);
      setCodeInput(initialOrder.trackingCode);
      const orders = StorageService.getOrdersByWhatsApp(initialOrder.whatsapp);
      setUserOrders(orders);
      setHasRated(Boolean(initialOrder.hasReview));
    }
  }, [initialOrder]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    const cleanCode = codeInput.trim().toUpperCase();
    const cleanWa = whatsappInput.trim();

    if (!cleanCode || !cleanWa) {
      setLoginError('Veuillez renseigner votre numéro WhatsApp et votre code de suivi.');
      return;
    }

    const order = StorageService.getOrder(cleanCode, cleanWa);
    const rateCheck = StorageService.recordLoginAttempt(Boolean(order));

    if (!rateCheck.allowed) {
      setRateLimitExceeded(true);
      setLoginError('Trop de tentatives infructueuses (5 max / 15 min). Veuillez patienter.');
      return;
    }

    if (!order) {
      setLoginError(
        `Aucune commande trouvée pour le code ${cleanCode} et le numéro ${cleanWa}. Vérifiez vos identifiants (${rateCheck.remaining} essai(s) restant(s)).`
      );
      return;
    }

    setActiveOrder(order);
    setHasRated(Boolean(order.hasReview));
    const allForWa = StorageService.getOrdersByWhatsApp(cleanWa);
    setUserOrders(allForWa);
  };

  const handleLogout = () => {
    setActiveOrder(null);
    setCodeInput('');
    setLoginError('');
  };

  const handleSubmitReview = () => {
    if (!activeOrder || selectedStars === 0) return;
    setIsSubmittingReview(true);

    setTimeout(() => {
      StorageService.submitReview(activeOrder.id, selectedStars, reviewComment);
      setIsSubmittingReview(false);
      setHasRated(true);
      // update active order
      const refreshed = StorageService.getOrder(activeOrder.trackingCode);
      if (refreshed) setActiveOrder(refreshed);
    }, 600);
  };

  // If not logged in, show WhatsApp + Code login form
  if (!activeOrder) {
    return (
      <div className="px-5 pt-6 pb-tabbar max-w-md mx-auto text-left animate-in fade-in">
        <div className="mb-6">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7C86]">
            Espace Client &amp; Suivi
          </span>
          <h1 className="font-serif-title font-bold text-2xl text-[#1C1C1E] mt-0.5">
            Suivre ma commande
          </h1>
          <p className="text-xs text-[#6C6C70] mt-1">
            Connectez-vous avec votre numéro WhatsApp et votre code de suivi (ex. CR-XXXX-XX).
          </p>
        </div>

        <form onSubmit={handleLogin} className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
              Numéro WhatsApp *
            </label>
            <input
              type="tel"
              value={whatsappInput}
              onChange={(e) => setWhatsappInput(e.target.value)}
              placeholder="Ex. +229 97 00 11 22"
              required
              className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm font-mono text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86] focus:ring-3 focus:ring-[#0E7C86]/15"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
              Code de suivi (8 caractères) *
            </label>
            <input
              type="text"
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
              placeholder="CR-XXXX-XX"
              required
              maxLength={12}
              className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm font-mono uppercase text-[#0E7C86] font-bold tracking-wider focus:outline-hidden focus:border-[#0E7C86] focus:ring-3 focus:ring-[#0E7C86]/15"
            />
          </div>

          {loginError && (
            <div className="p-3 rounded-xl bg-[#FEECEE] text-[#B91C1C] text-xs flex items-start gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={rateLimitExceeded}
            className="w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-97 transition shadow-md shadow-[#0E7C86]/25 disabled:opacity-40"
          >
            <Search className="w-4 h-4" />
            <span>Accéder à ma commande</span>
          </button>
        </form>

        {/* Demo Fast Login Helper */}
        <div className="mt-6 bg-[#E3F3F4]/60 p-4 rounded-2xl border border-[#0E7C86]/20 text-xs">
          <p className="font-bold text-[#0A5F67] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Commandes de démonstration prêtes :
          </p>
          <div className="space-y-1.5 text-gray-700">
            <button
              onClick={() => {
                setWhatsappInput('+22997001122');
                setCodeInput('CR-82KM-49');
              }}
              className="block text-left w-full hover:underline text-[#0E7C86] font-semibold"
            >
              • CR-82KM-49 (Mariage VIP Sènami &amp; Rodrigue — Commande Livrée)
            </button>
            <button
              onClick={() => {
                setWhatsappInput('+22996112233');
                setCodeInput('CR-94PX-31');
              }}
              className="block text-left w-full hover:underline text-[#0E7C86] font-semibold"
            >
              • CR-94PX-31 (Dot Simple — Payée, Décompteur 20h actif)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Order Dashboard
  const isDelivered = activeOrder.status === 'livree' || activeOrder.status === 'notee';

  return (
    <div className="px-5 pt-4 pb-tabbar max-w-md mx-auto text-left space-y-4 animate-in fade-in">
      {/* Top Bar with Tracking Code and Logout */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#6C6C70]">
            Commande de {activeOrder.customerName}
          </span>
          <div className="font-mono text-xl font-extrabold text-[#0E7C86] tracking-wider">
            {activeOrder.trackingCode}
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="text-xs font-semibold text-[#8E8E93] hover:text-[#1C1C1E] flex items-center gap-1 px-3 py-1.5 rounded-full bg-white border border-[#E5E5EA]"
        >
          <LogOut className="w-3.5 h-3.5" /> Déconnexion
        </button>
      </div>

      {/* Tabs: Ma commande actuelle / Mes commandes */}
      <div className="bg-[#E3E3E8] p-1 rounded-xl flex text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab('current')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'current'
              ? 'bg-white text-[#1C1C1E] shadow-xs'
              : 'text-[#6C6C70] hover:text-[#1C1C1E]'
          }`}
        >
          Commande en cours
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`flex-1 py-1.5 rounded-lg transition-all ${
            activeSubTab === 'history'
              ? 'bg-white text-[#1C1C1E] shadow-xs'
              : 'text-[#6C6C70] hover:text-[#1C1C1E]'
          }`}
        >
          Historique ({userOrders.length})
        </button>
      </div>

      {activeSubTab === 'current' ? (
        <>
          {/* 24-HOUR COUNTDOWN TIMER COMPONENT (Section 6.5) */}
          <CountdownTimer order={activeOrder} mode="client" />

          {/* Stepper Timeline (Section 5.1 & 6.7) */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-2xs space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#6C6C70]">
              Progression de votre commande
            </h4>

            <div className="space-y-3">
              {/* Step 1: Paiement reçu */}
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-[#E8F7EE] text-[#2FB36D] flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#1C1C1E]">Paiement FedaPay confirmé</span>
                  <span className="text-[#8E8E93] font-mono text-[11px]">Validé</span>
                </div>
              </div>

              {/* Step 2: En création */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    activeOrder.status === 'en_creation' || isDelivered
                      ? 'bg-[#E3F3F4] text-[#0E7C86]'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                </div>
                <div className="flex-1 flex justify-between items-center text-xs">
                  <span
                    className={`font-semibold ${
                      activeOrder.status === 'en_creation' || isDelivered
                        ? 'text-[#1C1C1E]'
                        : 'text-gray-400'
                    }`}
                  >
                    Création par l’équipe Créa
                  </span>
                  <span className="text-[#8E8E93] text-[11px]">
                    {isDelivered ? 'Terminé' : 'En cours'}
                  </span>
                </div>
              </div>

              {/* Step 3: Livraison */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                    isDelivered ? 'bg-[#E8F7EE] text-[#2FB36D]' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 flex justify-between items-center text-xs">
                  <span className={`font-semibold ${isDelivered ? 'text-[#1C1C1E]' : 'text-gray-400'}`}>
                    Livraison des fichiers
                  </span>
                  <span className="text-[#8E8E93] text-[11px]">
                    {isDelivered ? 'Prête' : 'Sous 24h'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* DELIVERABLES SECTION (Section 5.1: Le fichier apparaît sur le compte) */}
          {isDelivered && (
            <div className="bg-white rounded-3xl p-5 border-2 border-[#2FB36D]/30 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#FFB020]" />
                <h3 className="font-bold text-sm text-[#1C1C1E]">Vos fichiers finaux livrés</h3>
              </div>

              <div className="space-y-2">
                {/* If VIP: Hosted Page Link */}
                {activeOrder.tier === 'vip' && (
                  <button
                    onClick={() => onOpenVIPPage(activeOrder)}
                    className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#17A2AD] to-[#0A5F67] text-white flex items-center justify-between shadow-md active:scale-98 transition group"
                  >
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-[#FFB020]" />
                      <div className="text-left">
                        <div className="font-bold text-sm">Ouvrir l’invitation VIP Interactive</div>
                        <div className="text-[11px] opacity-80">Page animée avec enveloppe &amp; RSVP</div>
                      </div>
                    </div>
                    <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}

                {/* Delivered Files (PDF, Story, Images) */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <a
                    href="https://picsum.photos/seed/crea-pdf-hd/1200/1600.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] transition flex items-center gap-2.5 text-xs text-[#1C1C1E] font-semibold"
                  >
                    <FileText className="w-4 h-4 text-[#0E7C86]" />
                    <span>PDF Haute Déf. A4</span>
                  </a>

                  <a
                    href="https://picsum.photos/seed/crea-story-hd/1080/1920.jpg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-[#F2F2F7] hover:bg-[#E5E5EA] transition flex items-center gap-2.5 text-xs text-[#1C1C1E] font-semibold"
                  >
                    <Smartphone className="w-4 h-4 text-[#0E7C86]" />
                    <span>Visuel Story WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* NOTATION / CLIENT REVIEW (Section 6.6: Disponible seulement après livraison, une fois par commande) */}
          {isDelivered && (
            <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-2xs text-center space-y-3">
              <h4 className="font-serif-title font-bold text-base text-[#1C1C1E]">
                Votre invitation vous a plu ? Notez le rendu
              </h4>
              <p className="text-xs text-[#6C6C70]">
                Votre avis aide notre atelier d’artisans à progresser.
              </p>

              {/* Stars 1 to 5 */}
              <div className="flex items-center justify-center gap-2 py-1">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    disabled={hasRated}
                    onClick={() => setSelectedStars(num)}
                    className="p-1 transition-transform hover:scale-110 active:scale-95 disabled:pointer-events-none"
                  >
                    <Star
                      className={`w-8 h-8 transition-colors ${
                        num <= selectedStars
                          ? 'fill-[#FFB020] text-[#FFB020]'
                          : 'text-[#C7C7CC] fill-none'
                      }`}
                    />
                  </button>
                ))}
              </div>

              {!hasRated && selectedStars > 0 && (
                <div className="space-y-3 pt-1 animate-in fade-in">
                  <textarea
                    value={reviewComment}
                    maxLength={200}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Laissez un mot pour l’équipe Créa (facultatif, max 200 car.)..."
                    rows={2}
                    className="w-full rounded-xl border border-[#E5E5EA] p-3 text-xs text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                  />
                  <button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview}
                    className="w-full h-12 rounded-xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-97 transition shadow-md shadow-[#0E7C86]/25"
                  >
                    <span>Valider ma note</span>
                  </button>
                </div>
              )}

              {/* Button becomes Palme Green "Merci pour votre avis" (Section 8) */}
              {hasRated && (
                <div className="p-3.5 rounded-xl bg-[#2FB36D] text-white font-bold text-xs shadow-xs animate-in fade-in">
                  Merci pour votre avis !
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* History of all orders for this WhatsApp */
        <div className="space-y-3">
          {userOrders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => {
                setActiveOrder(ord);
                setActiveSubTab('current');
              }}
              className="p-4 rounded-2xl bg-white border border-[#E5E5EA] flex items-center justify-between cursor-pointer hover:border-[#0E7C86] active:scale-98 transition shadow-2xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-[#0E7C86]">
                    {ord.trackingCode}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase">
                    {ord.tier}
                  </span>
                </div>
                <h4 className="font-bold text-xs text-[#1C1C1E] mt-1">{ord.typeName}</h4>
                <p className="text-[11px] text-[#6C6C70]">
                  {ord.fields.eventCity || 'Bénin'} · {ord.amountXOF.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
