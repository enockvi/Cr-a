import React, { useState } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle2,
  AlertTriangle,
  MessageCircle,
  Eye,
  Check,
  X,
  Upload,
  Send,
  Sliders,
  DollarSign,
  Search,
  Lock,
  LogOut,
  Sparkles,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Palette,
} from 'lucide-react';
import { Order, Review, AppSettings, FailedSearch } from '../types';
import { StorageService } from '../services/storageService';
import { CountdownTimer } from '../components/CountdownTimer';
import { CREA_PALETTES, getPaletteById, DEUIL_TOKENS, PaletteTokens } from '../config/palettes';

interface AdminViewProps {
  orders: Order[];
  reviews: Review[];
  settings: AppSettings;
  failedSearches: FailedSearch[];
  onOrderUpdated: () => void;
  onSettingsUpdated: (newSettings: AppSettings) => void;
  onOpenVIPPage: (order: Order) => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  orders,
  reviews,
  settings,
  failedSearches,
  onOrderUpdated,
  onSettingsUpdated,
  onOpenVIPPage,
}) => {
  // Simple admin auth state
  const [isAuthenticated, setIsAuthenticated] = useState(true); // default true for developer preview convenience
  const [emailInput, setEmailInput] = useState('admin@crea.africa');
  const [passwordInput, setPasswordInput] = useState('crea2026');

  // Sub-tabs: 'dashboard' | 'orders' | 'reviews' | 'searches' | 'settings'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'orders' | 'reviews' | 'searches' | 'settings'>('dashboard');

  // Order detail drawer
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterTier, setFilterTier] = useState<string>('all');
  const [filterPalette, setFilterPalette] = useState<string>('all');
  const [copiedPaletteId, setCopiedPaletteId] = useState<string | null>(null);

  // Settings form
  const [localSettings, setLocalSettings] = useState<AppSettings>(settings);
  const [settingsSavedMessage, setSettingsSavedMessage] = useState(false);

  // Delivery attachment simulated file
  const [deliveryFileName, setDeliveryFileName] = useState('');

  // Login handler
  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (emailInput.trim() && passwordInput.trim()) {
      setIsAuthenticated(true);
    }
  };

  // Metrics computation
  const paidOrdersToProcess = orders.filter((o) => o.status === 'payee');
  const inCreationOrders = orders.filter((o) => o.status === 'en_creation');
  const deliveredOrders = orders.filter((o) => o.status === 'livree' || o.status === 'notee');
  const lateOrders = orders.filter(
    (o) => o.dueAt && new Date(o.dueAt).getTime() < Date.now() && o.status !== 'livree' && o.status !== 'notee'
  );

  const pendingReviews = reviews.filter((r) => r.status === 'pending');
  const unnotifiedDelivered = orders.filter((o) => (o.status === 'livree' || o.status === 'notee') && !o.isNotifiedOnWhatsApp);

  // Revenue today in FCFA
  const todayRevenue = orders
    .filter((o) => {
      if (!o.paidAt) return false;
      const orderDate = new Date(o.paidAt).toDateString();
      return orderDate === new Date().toDateString();
    })
    .reduce((sum, o) => sum + o.amountXOF, 0);

  // WhatsApp prefilled links (Annexe B)
  const openWhatsAppMissingInfo = (order: Order) => {
    const rawNumber = order.whatsapp.replace(/\D/g, '');
    const clientFirstName = order.customerName.split(' ')[0] || 'Cher client';
    const msg = settings.whatsappTemplates.missingInfo
      .replace('[Prénom]', clientFirstName)
      .replace('[CODE]', order.trackingCode)
      .replace('[INFO]', 'vos photos ou précisions sur le lieu');

    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openWhatsAppReadyNotification = (order: Order) => {
    const rawNumber = order.whatsapp.replace(/\D/g, '');
    const clientFirstName = order.customerName.split(' ')[0] || 'Cher client';
    const appUrl = window.location.origin;
    const msg = settings.whatsappTemplates.invitationReady
      .replace('[Prénom]', clientFirstName)
      .replace('[CODE]', order.trackingCode)
      .replace('[LIEN]', appUrl);

    StorageService.markWhatsAppNotified(order.id);
    onOrderUpdated();
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...order, isNotifiedOnWhatsApp: true });
    }

    window.open(`https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  // Actions
  const handleMarkInCreation = (order: Order) => {
    StorageService.updateOrderStatus(order.id, 'en_creation');
    onOrderUpdated();
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({ ...order, status: 'en_creation' });
    }
  };

  const handleDeliverOrder = (order: Order) => {
    const newDeliveries = [
      {
        id: 'del-' + Date.now(),
        kind: (order.tier === 'vip' ? 'vip_link' : 'pdf') as any,
        title: order.tier === 'vip' ? 'Page VIP Interactive' : 'Visuel HD Final',
        url: order.tier === 'vip' ? `#/vip/${order.trackingCode}` : 'https://picsum.photos/seed/delivery/1200/1600.jpg',
        createdAt: new Date().toISOString(),
      },
    ];

    StorageService.deliverOrder(order.id, newDeliveries);
    onOrderUpdated();
    if (selectedOrder?.id === order.id) {
      setSelectedOrder({
        ...order,
        status: 'livree',
        deliveredAt: new Date().toISOString(),
        deliveries: [...order.deliveries, ...newDeliveries],
      });
    }
  };

  const handleReviewAction = (reviewId: string, status: 'published' | 'hidden' | 'pending') => {
    StorageService.updateReviewStatus(reviewId, status);
    onOrderUpdated();
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    StorageService.saveSettings(localSettings);
    onSettingsUpdated(localSettings);
    setSettingsSavedMessage(true);
    setTimeout(() => setSettingsSavedMessage(false), 3000);
  };

  // If not authenticated
  if (!isAuthenticated) {
    return (
      <div className="px-5 pt-8 pb-32 max-w-sm mx-auto text-left animate-in fade-in">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-[#0E7C86] text-white flex items-center justify-center mx-auto mb-2 shadow-md">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
            Espace Administrateur
          </h2>
          <p className="text-xs text-[#6C6C70]">Accès réservé à l’équipe Créa</p>
        </div>

        <form onSubmit={handleAdminLogin} className="bg-white rounded-3xl p-6 border border-[#E5E5EA] shadow-2xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#1C1C1E] mb-1">E-mail</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#1C1C1E] mb-1">Mot de passe</label>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E]"
            />
          </div>

          <button
            type="submit"
            className="w-full h-12 rounded-xl bg-[#0E7C86] text-white font-bold text-sm shadow-md"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  // Filtered orders list
  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== 'all' && o.status !== filterStatus) return false;
    if (filterTier !== 'all' && o.tier !== filterTier) return false;
    if (filterPalette !== 'all') {
      if (filterPalette === 'none') {
        if (o.paletteId) return false;
      } else if (o.paletteId !== filterPalette) {
        return false;
      }
    }
    return true;
  });

  return (
    <div className="px-5 pt-4 pb-tabbar max-w-md mx-auto text-left space-y-4 animate-in fade-in">
      {/* Admin Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7C86] flex items-center gap-1">
            <Lock className="w-3 h-3" /> Espace Administrateur
          </span>
          <h1 className="font-serif-title font-bold text-xl text-[#1C1C1E]">
            Tableau de Bord Créa
          </h1>
        </div>

        <button
          onClick={() => setIsAuthenticated(false)}
          className="text-xs text-[#8E8E93] hover:text-[#1C1C1E] p-2"
          title="Verrouiller"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </div>

      {/* Admin Navigation Pills */}
      <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
        {[
          { id: 'dashboard', label: 'Vue générale' },
          { id: 'orders', label: `Commandes (${orders.length})` },
          { id: 'reviews', label: `Avis (${pendingReviews.length} en attente)` },
          { id: 'searches', label: `Recherches (${failedSearches.length})` },
          { id: 'settings', label: 'Paramètres' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as any);
              setSelectedOrder(null);
            }}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-[#0E7C86] text-white shadow-xs'
                : 'bg-white text-[#6C6C70] border border-[#E5E5EA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 1. DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Unnotified alert (Section 12: Rappel rouge client non notifié) */}
          {unnotifiedDelivered.length > 0 && (
            <div className="p-3.5 rounded-2xl bg-[#FEECEE] border border-[#FCA5A5] text-[#991B1B] text-xs flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#E5484D] flex-shrink-0" />
                <span>
                  <strong>{unnotifiedDelivered.length} commande(s) livrée(s)</strong> sans notification WhatsApp envoyée !
                </span>
              </div>
              <button
                onClick={() => {
                  setSelectedOrder(unnotifiedDelivered[0]);
                  setActiveTab('orders');
                }}
                className="px-2.5 py-1 rounded-lg bg-[#E5484D] text-white text-[11px] font-bold"
              >
                Traiter
              </button>
            </div>
          )}

          {/* Metric Cards Grid (Section 5.2 & 6.2) */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#6C6C70]">À traiter (Payées)</span>
              <div className="text-2xl font-bold font-mono text-[#0E7C86] mt-0.5">
                {paidOrdersToProcess.length}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#6C6C70]">En création</span>
              <div className="text-2xl font-bold font-mono text-amber-600 mt-0.5">
                {inCreationOrders.length}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#6C6C70]">Commandes en retard</span>
              <div
                className={`text-2xl font-bold font-mono mt-0.5 ${
                  lateOrders.length > 0 ? 'text-[#E5484D] animate-pulse' : 'text-gray-400'
                }`}
              >
                {lateOrders.length}
              </div>
            </div>

            <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] shadow-2xs">
              <span className="text-[10px] font-bold uppercase text-[#6C6C70]">CA du jour</span>
              <div className="text-xl font-bold font-mono text-[#2FB36D] mt-0.5">
                {todayRevenue.toLocaleString('fr-FR')} <span className="text-xs">FCFA</span>
              </div>
            </div>
          </div>

          {/* Urgent Orders Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#6C6C70]">
                Commandes urgentes &amp; délais 24h
              </h3>
              <button
                onClick={() => setActiveTab('orders')}
                className="text-xs text-[#0E7C86] font-semibold"
              >
                Voir toutes ({orders.length})
              </button>
            </div>

            <div className="space-y-2">
              {orders.slice(0, 4).map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => {
                    setSelectedOrder(ord);
                    setActiveTab('orders');
                  }}
                  className="bg-white p-3.5 rounded-2xl border border-[#E5E5EA] flex items-center justify-between cursor-pointer hover:border-[#0E7C86] active:scale-98 transition shadow-2xs"
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-[#0E7C86]">
                        {ord.trackingCode}
                      </span>
                      <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase">
                        {ord.tier}
                      </span>
                    </div>
                    <div className="font-bold text-xs text-[#1C1C1E] truncate mt-0.5">
                      {ord.customerName} · {ord.typeName}
                    </div>
                  </div>

                  <CountdownTimer order={ord} mode="badge" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. ORDERS LIST & DETAIL DRAWER */}
      {activeTab === 'orders' && (
        <div className="space-y-4 animate-in fade-in">
          {/* Order Detail View if selected */}
          {selectedOrder ? (
            <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-xs space-y-4">
              <div className="flex justify-between items-start border-b border-[#E5E5EA] pb-3">
                <div>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="text-xs text-[#0E7C86] font-semibold mb-1"
                  >
                    ‹ Retour à la liste
                  </button>
                  <h3 className="font-bold text-base text-[#1C1C1E]">
                    {selectedOrder.customerName}
                  </h3>
                  <div className="font-mono text-xs text-[#0E7C86] font-bold">
                    {selectedOrder.trackingCode} · {selectedOrder.amountXOF.toLocaleString('fr-FR')} FCFA
                  </div>
                </div>

                <CountdownTimer order={selectedOrder} mode="badge" />
              </div>

              {/* Countdown Banner in detail */}
              <CountdownTimer order={selectedOrder} mode="admin" />

              {/* Order Info Details */}
              <div className="bg-[#F2F2F7] rounded-2xl p-4 text-xs space-y-2">
                <div>
                  <span className="text-gray-500">WhatsApp client :</span>{' '}
                  <strong className="font-mono">{selectedOrder.whatsapp}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Événement :</span>{' '}
                  <strong>
                    {selectedOrder.fields.eventDate} à {selectedOrder.fields.eventTime} ({selectedOrder.fields.eventCity})
                  </strong>
                </div>
                <div>
                  <span className="text-gray-500">Lieu :</span>{' '}
                  <strong>{selectedOrder.fields.venueName || 'Non précisé'}</strong>
                </div>
                <div>
                  <span className="text-gray-500">Message principal :</span>
                  <p className="mt-1 italic text-gray-700 bg-white p-2 rounded-lg border border-gray-200">
                    « {selectedOrder.fields.mainMessage} »
                  </p>
                </div>
              </div>

              {/* Palette Details Block with Hex Codes & Swatches */}
              {(() => {
                const isDeuil = selectedOrder.typeId === 'deuil';
                const tokens: PaletteTokens = isDeuil
                  ? DEUIL_TOKENS
                  : (selectedOrder.paletteSnapshot?.tokens ||
                     (selectedOrder.paletteId ? getPaletteById(selectedOrder.paletteId)?.tokens : null) || {
                       bg: '#FAF7F2',
                       card: '#FFFFFF',
                       text: '#1C1C1E',
                       muted: '#6C6C70',
                       border: '#E5E5EA',
                       accent1: '#0E7C86',
                       accent2: '#0A5F67',
                       textOnAccent: '#FFFFFF',
                     });

                const paletteName = isDeuil
                  ? 'Deuil / In Memoriam (Teinte Nuit)'
                  : (selectedOrder.paletteSnapshot?.name ||
                     (selectedOrder.paletteId ? getPaletteById(selectedOrder.paletteId)?.nom : 'Palette Standard'));

                const paletteCat = isDeuil
                  ? 'Deuil'
                  : (selectedOrder.paletteSnapshot?.category ||
                     (selectedOrder.paletteId ? getPaletteById(selectedOrder.paletteId)?.categorie : 'Non spécifiée'));

                const copyCodes = () => {
                  const codesText = [
                    `Palette: ${paletteName} (${paletteCat})`,
                    `Fond (bg): ${tokens.bg}`,
                    `Carte (card): ${tokens.card}`,
                    `Texte (text): ${tokens.text}`,
                    `Secondaire (muted): ${tokens.muted}`,
                    `Bordure (border): ${tokens.border}`,
                    `Accent 1: ${tokens.accent1}`,
                    `Accent 2: ${tokens.accent2}`,
                    `Texte sur accent: ${tokens.textOnAccent}`,
                  ].join('\n');

                  navigator.clipboard.writeText(codesText);
                  setCopiedPaletteId(selectedOrder.id);
                  setTimeout(() => setCopiedPaletteId(null), 2500);
                };

                return (
                  <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-[#E5E5EA] space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#0E7C86] flex items-center gap-1">
                          <Palette className="w-3.5 h-3.5" /> Palette de couleurs
                        </span>
                        <h4 className="font-bold text-sm text-[#1C1C1E] mt-0.5">
                          {paletteName}
                        </h4>
                        <span className="text-[11px] text-[#6C6C70]">Catégorie : {paletteCat}</span>
                      </div>

                      <button
                        onClick={copyCodes}
                        className="px-2.5 py-1.5 rounded-lg border border-[#0E7C86] text-[#0E7C86] hover:bg-[#0E7C86]/10 text-xs font-semibold flex items-center gap-1 active:scale-95 transition cursor-pointer"
                        title="Copier les codes hexadécimaux"
                      >
                        {copiedPaletteId === selectedOrder.id ? (
                          <>
                            <CheckCheck className="w-3.5 h-3.5 text-[#2FB36D]" />
                            <span className="text-[#2FB36D]">Codes copiés !</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copier les codes</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Tokens Swatches and Hex Codes Grid */}
                    <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
                      {[
                        { label: 'Fond (bg)', hex: tokens.bg },
                        { label: 'Carte (card)', hex: tokens.card },
                        { label: 'Texte principal (text)', hex: tokens.text },
                        { label: 'Texte secondaire (muted)', hex: tokens.muted },
                        { label: 'Bordure (border)', hex: tokens.border },
                        { label: 'Accent 1', hex: tokens.accent1 },
                        { label: 'Accent 2', hex: tokens.accent2 },
                        { label: 'Texte sur bouton', hex: tokens.textOnAccent },
                      ].map((item) => (
                        <div
                          key={item.label}
                          className="flex items-center gap-2 p-1.5 rounded-lg bg-white border border-[#E5E5EA]"
                        >
                          <span
                            className="w-5 h-5 rounded-md border border-gray-300 shadow-2xs flex-shrink-0"
                            style={{ backgroundColor: item.hex }}
                          />
                          <div className="min-w-0">
                            <span className="text-[10px] text-gray-500 block truncate">{item.label}</span>
                            <span className="font-mono font-bold text-[11px] text-[#1C1C1E]">{item.hex}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}

              {/* Photos transmitted by client (Section 5.2: photos téléchargeables) */}
              {selectedOrder.assets && selectedOrder.assets.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-[#1C1C1E] mb-2">
                    Photos envoyées par le client ({selectedOrder.assets.length}) :
                  </h4>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedOrder.assets.map((asset, idx) => (
                      <a
                        key={asset.id}
                        href={asset.dataUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="relative aspect-square rounded-xl overflow-hidden border border-gray-200 group block"
                      >
                        <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
                        <span className="absolute inset-0 bg-black/40 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition text-[10px] font-bold">
                          Voir HD
                        </span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons: WhatsApp Contact, Status Update, Delivery */}
              <div className="space-y-2.5 pt-2 border-t border-[#E5E5EA]">
                {/* 1. Write to client on WhatsApp (missing info) */}
                <button
                  onClick={() => openWhatsAppMissingInfo(selectedOrder)}
                  className="w-full h-11 rounded-xl bg-[#2FB36D] hover:bg-[#279c5f] text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-97 transition"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Écrire au client sur WhatsApp</span>
                </button>

                {/* 2. Change to "En création" */}
                {selectedOrder.status === 'payee' && (
                  <button
                    onClick={() => handleMarkInCreation(selectedOrder)}
                    className="w-full h-11 rounded-xl bg-[#0E7C86] text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-97 transition"
                  >
                    <Clock className="w-4 h-4" />
                    <span>Commencer la création de l’invitation</span>
                  </button>
                )}

                {/* 3. Delivery button (Section 5.2: upload ou lien VIP, bouton Livrer) */}
                {selectedOrder.status !== 'livree' && selectedOrder.status !== 'notee' && (
                  <button
                    onClick={() => handleDeliverOrder(selectedOrder)}
                    className="w-full h-12 rounded-xl bg-[#0A5F67] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md active:scale-97 transition"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Livrer les fichiers et arrêter le décompteur</span>
                  </button>
                )}

                {/* 4. WhatsApp Ready Notification (Section 5.2 & Annexe B) */}
                {(selectedOrder.status === 'livree' || selectedOrder.status === 'notee') && (
                  <div>
                    <button
                      onClick={() => openWhatsAppReadyNotification(selectedOrder)}
                      className={`w-full h-12 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 active:scale-97 transition shadow-md ${
                        selectedOrder.isNotifiedOnWhatsApp
                          ? 'bg-gray-600'
                          : 'bg-[#E5484D] animate-pulse hover:bg-[#c93b40]'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      <span>
                        {selectedOrder.isNotifiedOnWhatsApp
                          ? 'Client déjà notifié (Renvoyer WhatsApp)'
                          : 'Envoyer notification WhatsApp (Invitation prête)'}
                      </span>
                    </button>
                    {!selectedOrder.isNotifiedOnWhatsApp && (
                      <p className="text-[10px] text-[#E5484D] text-center mt-1 font-semibold">
                        ⚠️ N’oubliez pas de notifier le client !
                      </p>
                    )}
                  </div>
                )}

                {/* Preview VIP Page if VIP */}
                {selectedOrder.tier === 'vip' && (
                  <button
                    onClick={() => onOpenVIPPage(selectedOrder)}
                    className="w-full h-11 rounded-xl bg-purple-50 text-purple-900 border border-purple-200 text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                    <span>Visualiser la page web VIP hébergée</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            /* Orders Table/List */
            <div className="space-y-3">
              {/* Filters */}
              <div className="space-y-2">
                <div className="flex gap-2">
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="flex-1 h-9 rounded-xl border border-[#E5E5EA] bg-white px-2.5 text-xs font-semibold text-[#1C1C1E]"
                  >
                    <option value="all">Tous les statuts</option>
                    <option value="payee">Payée (à traiter)</option>
                    <option value="en_creation">En création</option>
                    <option value="livree">Livrée</option>
                    <option value="notee">Notée</option>
                  </select>

                  <select
                    value={filterTier}
                    onChange={(e) => setFilterTier(e.target.value)}
                    className="flex-1 h-9 rounded-xl border border-[#E5E5EA] bg-white px-2.5 text-xs font-semibold text-[#1C1C1E]"
                  >
                    <option value="all">Toutes formules</option>
                    <option value="simple">Simple</option>
                    <option value="vip">VIP</option>
                  </select>
                </div>

                <select
                  value={filterPalette}
                  onChange={(e) => setFilterPalette(e.target.value)}
                  className="w-full h-9 rounded-xl border border-[#E5E5EA] bg-white px-2.5 text-xs font-semibold text-[#1C1C1E]"
                >
                  <option value="all">Toutes les palettes de couleurs ({orders.length})</option>
                  <option value="none">Sans palette (Deuil / Nuit exclusive)</option>
                  {CREA_PALETTES.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.nom} — {p.categorie}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                {filteredOrders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => setSelectedOrder(ord)}
                    className="bg-white p-3.5 rounded-2xl border border-[#E5E5EA] flex items-center justify-between cursor-pointer hover:border-[#0E7C86] active:scale-98 transition shadow-2xs"
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[#0E7C86]">
                          {ord.trackingCode}
                        </span>
                        <span className="px-2 py-0.2 rounded-full text-[10px] font-semibold bg-gray-100 text-gray-700 uppercase">
                          {ord.tier}
                        </span>
                      </div>
                      <div className="font-bold text-xs text-[#1C1C1E] truncate mt-0.5">
                        {ord.customerName}
                      </div>
                      <div className="text-[11px] text-[#6C6C70] truncate">{ord.typeName}</div>
                    </div>

                    <CountdownTimer order={ord} mode="badge" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 3. REVIEWS MODERATION (Section 5.2 & Annexe A) */}
      {activeTab === 'reviews' && (
        <div className="space-y-3 animate-in fade-in">
          <h3 className="font-bold text-xs uppercase tracking-wider text-[#6C6C70]">
            Modération des avis clients
          </h3>

          <div className="space-y-3">
            {reviews.map((rev) => {
              const isBadReview = rev.rating <= 2;
              return (
                <div
                  key={rev.id}
                  className={`bg-white p-4 rounded-2xl border shadow-2xs space-y-2 ${
                    isBadReview ? 'border-red-300 bg-red-50/30' : 'border-[#E5E5EA]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-1 text-[#FFB020]">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                        <span className="text-xs font-bold text-[#1C1C1E] ml-1">
                          {rev.customerName}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 font-mono">
                        {rev.trackingCode} · {rev.cardName}
                      </div>
                    </div>

                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        rev.status === 'published'
                          ? 'bg-[#E8F7EE] text-[#1E6B45]'
                          : rev.status === 'hidden'
                          ? 'bg-gray-100 text-gray-600'
                          : 'bg-[#FFF3DC] text-[#8A5A00]'
                      }`}
                    >
                      {rev.status === 'published' ? 'Publié' : rev.status === 'hidden' ? 'Masqué' : 'En attente'}
                    </span>
                  </div>

                  <p className="text-xs text-[#3A3A3C] italic leading-relaxed">
                    « {rev.comment} »
                  </p>

                  {/* Red alert for 1-2 stars (Section 6.6) */}
                  {isBadReview && (
                    <div className="p-2 rounded-lg bg-red-100 text-red-800 text-[11px] font-semibold flex items-center justify-between">
                      <span>Alerte satisfaction client (note basse)</span>
                    </div>
                  )}

                  {/* 3 Actions: Publier, Masquer, Remettre en attente */}
                  <div className="flex gap-2 pt-1 border-t border-gray-100">
                    <button
                      onClick={() => handleReviewAction(rev.id, 'published')}
                      className="flex-1 py-1.5 rounded-lg bg-[#E3F3F4] text-[#0A5F67] text-[11px] font-bold hover:bg-[#d0ecee] transition"
                    >
                      Publier
                    </button>
                    <button
                      onClick={() => handleReviewAction(rev.id, 'hidden')}
                      className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-[11px] font-bold hover:bg-gray-200 transition"
                    >
                      Masquer
                    </button>
                    <button
                      onClick={() => handleReviewAction(rev.id, 'pending')}
                      className="flex-1 py-1.5 rounded-lg bg-amber-50 text-amber-800 text-[11px] font-bold hover:bg-amber-100 transition"
                    >
                      En attente
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SEARCHES WITHOUT RESULTS (Section 5.3 & 6.2) */}
      {activeTab === 'searches' && (
        <div className="space-y-3 animate-in fade-in">
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-[#6C6C70]">
              Recherches sans résultat (Demande marché)
            </h3>
            <p className="text-xs text-[#6C6C70]">
              Mots-clés tapés par les visiteurs qui n’avaient pas de modèle direct.
            </p>
          </div>

          {failedSearches.length === 0 ? (
            <div className="bg-white p-6 rounded-2xl text-center text-xs text-gray-400 border border-[#E5E5EA]">
              Aucune recherche sans résultat enregistrée pour l’instant.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-[#E5E5EA] divide-y divide-[#E5E5EA]">
              {failedSearches.map((s, idx) => (
                <div key={idx} className="p-3.5 flex justify-between items-center text-xs">
                  <div>
                    <strong className="text-[#1C1C1E]">« {s.query} »</strong>
                    <div className="text-[10px] text-gray-400">
                      Dernière tentative : {new Date(s.lastSearchedAt).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-[#E3F3F4] text-[#0A5F67] font-mono font-bold text-xs">
                    {s.count} fois
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 5. APP SETTINGS (Section 6.2 & 8) */}
      {activeTab === 'settings' && (
        <form onSubmit={handleSaveSettings} className="space-y-4 animate-in fade-in">
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-2xs space-y-4">
            <h3 className="font-bold text-sm text-[#1C1C1E]">Tarifs &amp; Limites du Service</h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                  Prix Formule Simple (FCFA)
                </label>
                <input
                  type="number"
                  value={localSettings.simplePriceXOF}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, simplePriceXOF: Number(e.target.value) })
                  }
                  className="w-full h-11 rounded-xl border border-[#E5E5EA] px-3 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                  Prix Formule VIP (FCFA)
                </label>
                <input
                  type="number"
                  value={localSettings.vipPriceXOF}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, vipPriceXOF: Number(e.target.value) })
                  }
                  className="w-full h-11 rounded-xl border border-[#E5E5EA] px-3 font-mono text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                WhatsApp officiel de Créa (support &amp; contact)
              </label>
              <input
                type="text"
                value={localSettings.adminWhatsApp}
                onChange={(e) =>
                  setLocalSettings({ ...localSettings, adminWhatsApp: e.target.value })
                }
                className="w-full h-11 rounded-xl border border-[#E5E5EA] px-3 font-mono text-sm"
              />
            </div>

            {/* Mode Pause toggle (Section 6.2) */}
            <div className="pt-3 border-t border-[#E5E5EA]">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <label className="font-bold text-xs text-[#1C1C1E] block">
                    Mode Pause commandes
                  </label>
                  <span className="text-[11px] text-[#6C6C70]">
                    Désactive temporairement les nouvelles commandes
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={localSettings.pauseMode}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, pauseMode: e.target.checked })
                  }
                  className="w-5 h-5 accent-[#0E7C86] rounded-md cursor-pointer"
                />
              </div>

              {localSettings.pauseMode && (
                <textarea
                  value={localSettings.pauseMessage}
                  onChange={(e) =>
                    setLocalSettings({ ...localSettings, pauseMessage: e.target.value })
                  }
                  rows={2}
                  className="w-full p-2.5 rounded-xl border border-[#FFE0A3] bg-[#FFFBF0] text-xs"
                />
              )}
            </div>

            {/* WhatsApp template customization (Annexe B) */}
            <div className="pt-3 border-t border-[#E5E5EA] space-y-2">
              <label className="font-bold text-xs text-[#1C1C1E] block">
                Modèle message WhatsApp « Invitation prête » (Annexe B)
              </label>
              <textarea
                value={localSettings.whatsappTemplates.invitationReady}
                onChange={(e) =>
                  setLocalSettings({
                    ...localSettings,
                    whatsappTemplates: {
                      ...localSettings.whatsappTemplates,
                      invitationReady: e.target.value,
                    },
                  })
                }
                rows={3}
                className="w-full p-2.5 rounded-xl border border-[#E5E5EA] text-xs"
              />
            </div>

            {/* Palettes de Couleurs Versionnées (V1) */}
            <div className="pt-3 border-t border-[#E5E5EA] space-y-2 text-left">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C1C1E]">
                <Palette className="w-4 h-4 text-[#0E7C86]" />
                <span>Palettes de couleurs V2 (10 palettes versionnées)</span>
              </div>
              <p className="text-[11px] text-[#6C6C70] leading-relaxed">
                Les 10 palettes de couleurs sont strictement définies et versionnées dans <code className="font-mono text-[10px] bg-gray-100 px-1 py-0.5 rounded">config/palettes.ts</code>. En version V1, aucune palette n'est modifiable via l'interface afin de garantir le respect absolu de la charte Créa et les critères d’accessibilité WCAG AA (4,5:1 texte sur fond, 3:1 grands titres).
              </p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {CREA_PALETTES.map((p) => (
                  <div key={p.id} className="p-2 rounded-xl bg-[#F2F2F7] text-[10px] flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-[#1C1C1E]">{p.nom}</span>
                      <span className="text-[#8E8E93] text-[9px]">{p.categorie}</span>
                    </div>
                    <div className="w-full h-2 rounded overflow-hidden flex border border-gray-200">
                      <span className="flex-1 h-full" style={{ backgroundColor: p.tokens.bg }} />
                      <span className="flex-1 h-full" style={{ backgroundColor: p.tokens.text }} />
                      <span className="flex-1 h-full" style={{ backgroundColor: p.tokens.accent1 }} />
                      <span className="flex-1 h-full" style={{ backgroundColor: p.tokens.accent2 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {settingsSavedMessage && (
              <div className="p-3 rounded-xl bg-[#E8F7EE] text-[#1E6B45] text-xs font-bold flex items-center gap-1.5">
                <Check className="w-4 h-4" /> Paramètres enregistrés avec succès !
              </div>
            )}

            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0E7C86] text-white font-bold text-sm shadow-md"
            >
              Enregistrer les paramètres
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
