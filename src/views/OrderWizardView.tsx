import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Upload,
  Trash2,
  Check,
  ShieldCheck,
  CreditCard,
  Clock,
  Sparkles,
  Copy,
  CheckCheck,
  Plus,
  AlertCircle,
  Smartphone,
} from 'lucide-react';
import {
  CardCategory,
  CardVariant,
  OrderTier,
  Order,
  OrderFields,
  OrderAsset,
  PaymentMethod,
  AppSettings,
  Milestone,
  ScheduleItem,
} from '../types';
import { StorageService, compressImageFile } from '../services/storageService';
import { getPalettesForCategory, getPaletteById, ColorPalette, DEUIL_TOKENS } from '../config/palettes';
import { PaletteSelector } from '../components/PaletteSelector';
import { ModelPreview } from '../components/ModelPreview';

interface OrderWizardViewProps {
  category: CardCategory;
  variant: CardVariant;
  tier: OrderTier;
  templateId: string;
  settings: AppSettings;
  onOrderCompleted: (order: Order) => void;
  onCancel: () => void;
}

export const OrderWizardView: React.FC<OrderWizardViewProps> = ({
  category,
  variant,
  tier,
  templateId,
  settings,
  onOrderCompleted,
  onCancel,
}) => {
  // Wizard steps: 1: Info, 2: Photos, 3: Recap & CGV, 4: FedaPay Payment, 5: Success
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  const selectedTemplate =
    category.templates.find((t) => t.id === templateId) || category.templates[0];
  const price = tier === 'vip' ? settings.vipPriceXOF : settings.simplePriceXOF;
  const maxPhotos = tier === 'vip' ? 8 : 3;

  // Form state
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('+229 ');
  const [eventCountry, setEventCountry] = useState('Bénin');
  const [eventCity, setEventCity] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('15:00');
  const [timezone] = useState('GMT+1 (Afrique de l’Ouest)');
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [googleMapsUrl, setGoogleMapsUrl] = useState('');
  const [mainMessage, setMainMessage] = useState('');
  const isDeuil = category.id === 'deuil';
  const availablePalettes = getPalettesForCategory(category.id);
  const [selectedPaletteId, setSelectedPaletteId] = useState<string>(
    isDeuil ? '' : (availablePalettes[0]?.id || '')
  );
  const selectedPalette = isDeuil ? null : (getPaletteById(selectedPaletteId) || availablePalettes[0] || null);

  const [paletteChoice, setPaletteChoice] = useState(category.palettes[0]?.name || '');
  const [notes, setNotes] = useState('');

  // Specific fields map
  const [specifics, setSpecifics] = useState<Record<string, string>>({});

  // VIP Specifics (Section 4.9)
  const [hashtag, setHashtag] = useState('');
  const [storyMilestones, setStoryMilestones] = useState<Milestone[]>([
    { title: 'Notre rencontre', date: '2023', description: 'Le premier regard qui a tout changé.' },
  ]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>([
    { time: '11:00', label: 'Cérémonie Civile' },
    { time: '14:30', label: 'Célébration Religieuse' },
    { time: '18:00', label: 'Réception & Dîner' },
  ]);
  const [dressCodeTitle, setDressCodeTitle] = useState('Tenue de fête');
  const [dressCodeColors, setDressCodeColors] = useState<string[]>(['#8A3B57', '#F6D5D9', '#FFB020']);
  const [rsvpDeadline, setRsvpDeadline] = useState('');
  const [footerMessage, setFooterMessage] = useState('Votre présence sera notre plus beau cadeau.');
  const [ambientMusic, setAmbientMusic] = useState(false);

  // Photos
  const [assets, setAssets] = useState<OrderAsset[]>([]);
  const [uploading, setUploading] = useState(false);
  const [hasConfirmedImageRights, setHasConfirmedImageRights] = useState(false);

  // Conditions de vente (CGV)
  const [cgvAccepted, setCgvAccepted] = useState(false);

  // FedaPay Gateway state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('mtn');
  const [payerPhoneNumber, setPayerPhoneNumber] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Auto-save draft on device (Section 6.3 & 7.6)
  useEffect(() => {
    const draft = {
      customerName,
      whatsapp,
      eventCountry,
      eventCity,
      eventDate,
      eventTime,
      venueName,
      venueAddress,
      venueCity,
      googleMapsUrl,
      mainMessage,
      specifics,
      notes,
      hashtag,
      paletteId: selectedPaletteId,
    };
    StorageService.saveDraft(draft);
  }, [
    customerName,
    whatsapp,
    eventCountry,
    eventCity,
    eventDate,
    eventTime,
    venueName,
    venueAddress,
    venueCity,
    googleMapsUrl,
    mainMessage,
    specifics,
    notes,
    hashtag,
    selectedPaletteId,
  ]);

  // Load draft on mount if available
  useEffect(() => {
    const saved = StorageService.getDraft();
    if (saved) {
      if (saved.customerName) setCustomerName(saved.customerName);
      if (saved.whatsapp) setWhatsapp(saved.whatsapp);
      if (saved.eventCity) setEventCity(saved.eventCity);
      if (saved.venueName) setVenueName(saved.venueName);
      if (saved.mainMessage) setMainMessage(saved.mainMessage);
      if (saved.specifics) setSpecifics(saved.specifics);
      if (saved.paletteId && !isDeuil) {
        const valid = availablePalettes.some((p) => p.id === saved.paletteId);
        if (valid) {
          setSelectedPaletteId(saved.paletteId);
        }
      }
    }
  }, [category.id, isDeuil]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (assets.length >= maxPhotos) {
      alert(`Limite maximale de ${maxPhotos} photos atteinte pour cette formule.`);
      return;
    }

    setUploading(true);
    const newAssets: OrderAsset[] = [];

    for (let i = 0; i < files.length && assets.length + newAssets.length < maxPhotos; i++) {
      const file = files[i];
      try {
        const compressed = await compressImageFile(file);
        newAssets.push({
          id: 'asset-' + Date.now() + '-' + i,
          name: file.name,
          dataUrl: compressed.dataUrl,
          size: compressed.size,
          type: file.type,
          kind: 'photo',
        });
      } catch (err) {
        console.error('Erreur compression image:', err);
      }
    }

    setAssets((prev) => [...prev, ...newAssets]);
    setUploading(false);
  };

  const removeAsset = (id: string) => {
    setAssets((prev) => prev.filter((a) => a.id !== id));
  };

  const handleCreateOrderAndGoToPay = () => {
    const orderFields: OrderFields = {
      customerName,
      whatsapp,
      eventCountry,
      eventCity,
      eventDate,
      eventTime,
      timezone,
      venueName,
      venueAddress,
      venueCity,
      googleMapsUrl,
      mainMessage,
      paletteChoice,
      notes,
      specifics,
      ...(tier === 'vip'
        ? {
            hashtag,
            storyMilestones,
            schedule,
            dressCodeTitle,
            dressCodeColors,
            rsvpDeadline,
            footerMessage,
            ambientMusic,
          }
        : {}),
    };

    const newOrder = StorageService.createNewOrder({
      tier,
      typeId: category.id,
      typeName: `${variant.name} (${category.name})`,
      templateId,
      templateName: selectedTemplate.name,
      amountXOF: price,
      customerName,
      whatsapp,
      fields: orderFields,
      assets,
      paletteId: isDeuil ? undefined : (selectedPaletteId || undefined),
    });

    setCreatedOrder(newOrder);
    setStep(4);
  };

  const handleExecutePayment = () => {
    if (!createdOrder) return;
    setIsProcessingPayment(true);

    setTimeout(() => {
      const finalized = StorageService.processPayment(createdOrder.id, paymentMethod);
      setIsProcessingPayment(false);
      StorageService.clearDraft();
      if (finalized) {
        setCreatedOrder(finalized);
        setStep(5);
      }
    }, 1800);
  };

  const copyTrackingCode = () => {
    if (createdOrder) {
      navigator.clipboard.writeText(createdOrder.trackingCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2500);
    }
  };

  // Step 1 Validation
  const isStep1Valid =
    customerName.trim().length > 1 &&
    whatsapp.trim().length > 6 &&
    eventCity.trim().length > 0 &&
    mainMessage.trim().length > 0;

  return (
    <div className="pb-tabbar max-w-md mx-auto">
      {/* Top Header Progress */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => {
              if (step > 1 && step < 5) {
                setStep((s) => (s - 1) as any);
              } else {
                onCancel();
              }
            }}
            className="text-xs font-semibold text-[#0E7C86] flex items-center gap-1 hover:underline"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            {step === 1 ? 'Annuler' : 'Étape précédente'}
          </button>
          <span className="text-xs font-mono font-semibold text-[#6C6C70]">
            Étape {step} sur 4
          </span>
        </div>

        {/* Step Indicator Bar */}
        <div className="w-full bg-[#E5E5EA] h-1.5 rounded-full overflow-hidden mb-2">
          <div
            className="bg-[#0E7C86] h-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* STEP 1: INFORMATIONS (Section 4.8 & 4.9) */}
      {step === 1 && (
        <div className="px-5 space-y-4 animate-in fade-in duration-300 text-left">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7C86]">
              {category.name} · {tier === 'vip' ? 'Formule VIP' : 'Formule Simple'}
            </span>
            <h1 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
              {category.greetingTitle}
            </h1>
            <p className="text-xs text-[#6C6C70] mt-0.5">
              Renseignez les détails de votre événement. Votre saisie est sauvegardée automatiquement.
            </p>
          </div>

          {/* Live Interactive Model Preview */}
          <div className="flex flex-col items-center py-2">
            <ModelPreview
              title={selectedTemplate.sampleNames[0]}
              categoryName={variant.name}
              subtitle={selectedTemplate.subtitle}
              dateText={eventDate ? new Date(eventDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : selectedTemplate.sampleDate}
              tier={tier}
              palette={selectedPalette}
              isDeuil={isDeuil}
              size="md"
            />
          </div>

          {/* Color Palette Selector (v2) */}
          <div className="bg-white rounded-3xl p-4 border border-[#E5E5EA] shadow-2xs">
            <PaletteSelector
              categoryId={category.id}
              selectedPaletteId={selectedPaletteId}
              onSelectPalette={(p) => setSelectedPaletteId(p.id)}
            />
          </div>

          {/* Form Fields Card */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-2xs space-y-3.5">
            {/* Customer Contact */}
            <div>
              <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                Prénom et nom du client *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Ex. Aïcha KPADONOU"
                required
                className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86] focus:ring-3 focus:ring-[#0E7C86]/15"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                Numéro WhatsApp (avec indicatif pays) *
              </label>
              <input
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+229 97 00 00 00"
                required
                className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm font-mono text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86] focus:ring-3 focus:ring-[#0E7C86]/15"
              />
              <p className="text-[11px] text-[#6C6C70] mt-1">
                Nous vous enverrons la notification de livraison et le suivi sur ce numéro.
              </p>
            </div>

            {/* Event Location */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">Pays</label>
                <input
                  type="text"
                  value={eventCountry}
                  onChange={(e) => setEventCountry(e.target.value)}
                  placeholder="Bénin, Togo, CI..."
                  className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">Ville *</label>
                <input
                  type="text"
                  value={eventCity}
                  onChange={(e) => setEventCity(e.target.value)}
                  placeholder="Cotonou, Lomé, Abidjan..."
                  required
                  className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                />
              </div>
            </div>

            {/* Event Date & Time */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">Date</label>
                <input
                  type="date"
                  value={eventDate}
                  onChange={(e) => setEventDate(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">Heure</label>
                <input
                  type="time"
                  value={eventTime}
                  onChange={(e) => setEventTime(e.target.value)}
                  className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                />
              </div>
            </div>

            {/* Venue info */}
            <div>
              <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                Lieu de réception ou célébration
              </label>
              <input
                type="text"
                value={venueName}
                onChange={(e) => setVenueName(e.target.value)}
                placeholder="Ex. Palais des Congrès / Paroisse St-Michel"
                className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
              />
            </div>

            {tier === 'vip' && (
              <div>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                  Lien Google Maps (pour bouton itinéraire VIP)
                </label>
                <input
                  type="url"
                  value={googleMapsUrl}
                  onChange={(e) => setGoogleMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                  className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                />
              </div>
            )}

            {/* Specific fields from variant */}
            {variant.specificFieldLabels.map((f) => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                  {f.label} {f.required ? '*' : ''}
                </label>
                <input
                  type="text"
                  value={specifics[f.key] || ''}
                  onChange={(e) =>
                    setSpecifics((prev) => ({ ...prev, [f.key]: e.target.value }))
                  }
                  placeholder={f.placeholder || ''}
                  className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                />
              </div>
            ))}

            {/* Main message (max 300 chars, Section 4.8) */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-xs font-bold text-[#1C1C1E]">
                  Message principal / Phrase d’accueil *
                </label>
                <span className="text-[10px] font-mono text-[#8E8E93]">
                  {mainMessage.length}/300
                </span>
              </div>
              <textarea
                value={mainMessage}
                maxLength={300}
                onChange={(e) => setMainMessage(e.target.value)}
                placeholder="Ex. C’est avec une immense joie que nous vous convions à célébrer..."
                rows={3}
                className="w-full rounded-xl border border-[#E5E5EA] p-3 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
              />
            </div>

            {/* VIP Additional Section (Section 4.9) */}
            {tier === 'vip' && (
              <div className="pt-3 border-t border-[#E5E5EA] space-y-3.5">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#8A5A00]">
                  <Sparkles className="w-4 h-4 text-[#FFB020]" />
                  <span>Options de la formule VIP</span>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                    Hashtag officiel ou Initiales
                  </label>
                  <input
                    type="text"
                    value={hashtag}
                    onChange={(e) => setHashtag(e.target.value)}
                    placeholder="#AichaEtKoffi2026"
                    className="w-full h-11 rounded-xl border border-[#E5E5EA] px-3.5 text-sm font-mono text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                    Date limite de réponse (RSVP)
                  </label>
                  <input
                    type="text"
                    value={rsvpDeadline}
                    onChange={(e) => setRsvpDeadline(e.target.value)}
                    placeholder="Ex. 25 novembre 2026"
                    className="w-full h-11 rounded-xl border border-[#E5E5EA] px-3.5 text-sm text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-[#E3F3F4]/50 border border-[#0E7C86]/20">
                  <div className="text-xs">
                    <span className="font-bold text-[#0A5F67] block">Musique d’ambiance</span>
                    <span className="text-[11px] text-[#6C6C70]">Ajouter une douce mélodie de fond</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={ambientMusic}
                    onChange={(e) => setAmbientMusic(e.target.checked)}
                    className="w-5 h-5 accent-[#0E7C86] rounded-md cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Notes libres */}
            <div>
              <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                Remarques libres pour notre équipe (optionnel)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Précisions particulières, couleurs favorites..."
                className="w-full h-11 rounded-xl border border-[#E5E5EA] px-3.5 text-xs text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
              />
            </div>
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={!isStep1Valid}
            className="w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#0E7C86]/30 disabled:opacity-40"
          >
            <span>Continuer vers l’envoi des photos</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}

      {/* STEP 2: PHOTOS & COMPRESSION (Section 6.3) */}
      {step === 2 && (
        <div className="px-5 space-y-4 animate-in fade-in duration-300 text-left">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7C86]">
              Étape 2 · Vos médias
            </span>
            <h2 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
              Ajouter vos photos
            </h2>
            <p className="text-xs text-[#6C6C70] mt-0.5">
              {tier === 'vip' ? '4 à 8 photos pour votre galerie VIP' : '1 à 3 photos pour votre modèle'}
              . Les images sont compressées automatiquement sur votre appareil avant l’envoi.
            </p>
          </div>

          {/* Upload Dropzone */}
          <div className="bg-white rounded-3xl p-6 border-2 border-dashed border-[#B8C9CB] text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-[#E3F3F4] text-[#0E7C86] flex items-center justify-center mx-auto">
              <Upload className="w-6 h-6" />
            </div>
            <div>
              <label
                htmlFor="photoUpload"
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-xl bg-[#0E7C86] text-white text-xs font-bold cursor-pointer hover:bg-[#0A5F67] active:scale-95 transition"
              >
                {uploading ? 'Compression en cours...' : 'Choisir mes photos'}
                <input
                  id="photoUpload"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/heic"
                  multiple
                  disabled={uploading || assets.length >= maxPhotos}
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
              <p className="text-[11px] text-[#6C6C70] mt-2">
                Formats JPG, PNG, WebP · Max {maxPhotos} photos ({assets.length}/{maxPhotos} ajoutées)
              </p>
            </div>
          </div>

          {/* Thumbnails List */}
          {assets.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-[#1C1C1E]">Photos sélectionnées :</h4>
              <div className="grid grid-cols-3 gap-2.5">
                {assets.map((asset, idx) => (
                  <div
                    key={asset.id}
                    className="relative aspect-square rounded-xl overflow-hidden border border-[#E5E5EA] bg-gray-100 group shadow-2xs"
                  >
                    <img
                      src={asset.dataUrl}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                    <button
                      onClick={() => removeAsset(asset.id)}
                      className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-[#E5484D] transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded-md bg-black/50 text-white text-[9px] font-mono">
                      Photo {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rights Confirmation Checkbox (Section 6.3) */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] flex items-start gap-3 shadow-2xs">
            <input
              id="rightsCheck"
              type="checkbox"
              checked={hasConfirmedImageRights}
              onChange={(e) => setHasConfirmedImageRights(e.target.checked)}
              className="w-5 h-5 accent-[#0E7C86] rounded-md mt-0.5 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="rightsCheck" className="text-xs text-[#3A3A3C] leading-snug cursor-pointer">
              Je confirme détenir l’ensemble des droits de diffusion sur les images transmises et autorise Créa à les utiliser pour confectionner mon invitation.
            </label>
          </div>

          <button
            onClick={() => setStep(3)}
            disabled={assets.length === 0 || !hasConfirmedImageRights}
            className="w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#0E7C86]/30 disabled:opacity-40"
          >
            <span>Vérifier le récapitulatif</span>
            <ArrowLeft className="w-5 h-5 rotate-180" />
          </button>
        </div>
      )}

      {/* STEP 3: RÉCAPITULATIF & CGV (Section 6.4) */}
      {step === 3 && (
        <div className="px-5 space-y-4 animate-in fade-in duration-300 text-left">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#0E7C86]">
              Étape 3 · Récapitulatif
            </span>
            <h2 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
              Vérifiez votre commande
            </h2>
            <p className="text-xs text-[#6C6C70] mt-0.5">
              Assurez-vous de l’exactitude de vos coordonnées avant le règlement.
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-2xs divide-y divide-[#E5E5EA] text-xs">
            <div className="pb-3 flex justify-between items-center">
              <span className="text-gray-500">Modèle sélectionné</span>
              <span className="font-bold text-[#1C1C1E]">{selectedTemplate.name}</span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500">Formule</span>
              <span className="font-bold text-[#0E7C86] uppercase">
                {tier === 'vip' ? 'VIP (Page Web Animée)' : 'Simple (Visuel HD 24h)'}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500">Palette de couleurs</span>
              {isDeuil ? (
                <span className="font-semibold text-gray-700">Teinte Nuit (#15151B)</span>
              ) : selectedPalette ? (
                <div className="flex items-center gap-2">
                  <span className="font-bold text-[#1C1C1E]">{selectedPalette.nom}</span>
                  <div className="w-10 h-3.5 rounded overflow-hidden flex border border-[#E5E5EA] shadow-2xs">
                    <span className="flex-1 h-full" style={{ backgroundColor: selectedPalette.tokens.bg }} />
                    <span className="flex-1 h-full" style={{ backgroundColor: selectedPalette.tokens.text }} />
                    <span
                      className="flex-2 h-full"
                      style={{
                        background: `linear-gradient(135deg, ${selectedPalette.tokens.accent1}, ${selectedPalette.tokens.accent2})`,
                      }}
                    />
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">Par défaut</span>
              )}
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500">Client &amp; Contact</span>
              <span className="font-semibold text-right">
                {customerName}
                <br />
                <span className="font-mono text-gray-500">{whatsapp}</span>
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500">Lieu de l’événement</span>
              <span className="font-semibold text-right">
                {venueName || 'Lieu'}, {eventCity}
              </span>
            </div>

            <div className="py-3 flex justify-between items-center">
              <span className="text-gray-500">Délai de livraison</span>
              <span className="font-bold text-[#2FB36D] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> 24 heures après paiement
              </span>
            </div>

            <div className="pt-3 flex justify-between items-baseline text-sm font-bold text-[#1C1C1E]">
              <span>Total à régler</span>
              <span className="font-mono text-xl text-[#0E7C86]">
                {price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          {/* CGV Checkbox (Section 6.4: Le bouton Payer reste inactif tant que les conditions ne sont pas acceptées) */}
          <div className="bg-white rounded-2xl p-4 border border-[#E5E5EA] flex items-start gap-3 shadow-2xs">
            <input
              id="cgvCheck"
              type="checkbox"
              checked={cgvAccepted}
              onChange={(e) => setCgvAccepted(e.target.checked)}
              className="w-5 h-5 accent-[#0E7C86] rounded-md mt-0.5 cursor-pointer flex-shrink-0"
            />
            <label htmlFor="cgvCheck" className="text-xs text-[#3A3A3C] leading-snug cursor-pointer">
              J’accepte sans réserve les <strong>Conditions Générales de Vente</strong> (garantie de livraison sous 24h ouvrées, révisions de texte incluses, conservation des photos 90 jours).
            </label>
          </div>

          <button
            onClick={handleCreateOrderAndGoToPay}
            disabled={!cgvAccepted}
            className="w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#0E7C86]/30 disabled:opacity-40"
          >
            <span>Procéder au paiement FedaPay</span>
            <CreditCard className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* STEP 4: FEDAPAY PAYMENT (Section 6.4) */}
      {step === 4 && (
        <div className="px-5 space-y-4 animate-in fade-in duration-300 text-left">
          <div>
            <div className="inline-flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-[#2FB36D]">
              <ShieldCheck className="w-3.5 h-3.5" /> FedaPay Paiement Sécurisé
            </div>
            <h2 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
              Choisissez votre moyen de paiement
            </h2>
            <p className="text-xs text-[#6C6C70] mt-0.5">
              Règlement instantané par Mobile Money ou Carte bancaire.
            </p>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white rounded-3xl p-5 border border-[#E5E5EA] shadow-2xs space-y-3">
            {[
              { id: 'mtn', name: 'MTN Mobile Money', sub: 'Bénin, CI, Cameroun...', color: '#FFCC00' },
              { id: 'moov', name: 'Moov Africa Money', sub: 'Bénin, Togo, CI...', color: '#006699' },
              { id: 'orange', name: 'Orange Money', sub: 'Sénégal, CI, Mali...', color: '#FF6600' },
              { id: 'wave', name: 'Wave', sub: 'Sénégal, Côte d’Ivoire', color: '#1DC3EC' },
              { id: 'card', name: 'Carte Bancaire (Visa / Mastercard)', sub: 'International', color: '#1C1C1E' },
            ].map((m) => {
              const active = paymentMethod === m.id;
              return (
                <div
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                  className={`p-3.5 rounded-2xl border cursor-pointer flex items-center justify-between transition-all ${
                    active
                      ? 'border-[#0E7C86] bg-[#E3F3F4]/40 shadow-xs'
                      : 'border-[#E5E5EA] hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center"
                      style={{ borderColor: active ? '#0E7C86' : '#C7C7CC' }}
                    >
                      {active && <span className="w-2 h-2 rounded-full bg-[#0E7C86]" />}
                    </span>
                    <div>
                      <h4 className="font-bold text-xs text-[#1C1C1E]">{m.name}</h4>
                      <p className="text-[10px] text-[#6C6C70]">{m.sub}</p>
                    </div>
                  </div>
                  <Smartphone className="w-4 h-4 text-gray-400" />
                </div>
              );
            })}

            {/* Mobile number for authorization */}
            <div className="pt-2">
              <label className="block text-xs font-bold text-[#1C1C1E] mb-1">
                Numéro de compte pour le prélèvement :
              </label>
              <input
                type="tel"
                value={payerPhoneNumber || whatsapp}
                onChange={(e) => setPayerPhoneNumber(e.target.value)}
                placeholder="+229 97 ..."
                className="w-full h-12 rounded-xl border border-[#E5E5EA] px-3.5 text-sm font-mono text-[#1C1C1E] focus:outline-hidden focus:border-[#0E7C86]"
              />
            </div>

            <div className="pt-2 border-t border-[#E5E5EA] flex justify-between items-center text-xs">
              <span className="text-gray-500">Montant net :</span>
              <span className="font-mono text-base font-bold text-[#0E7C86]">
                {price.toLocaleString('fr-FR')} FCFA
              </span>
            </div>
          </div>

          <button
            onClick={handleExecutePayment}
            disabled={isProcessingPayment}
            className="w-full h-13 rounded-2xl bg-[#2FB36D] hover:bg-[#279c5f] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#2FB36D]/30 disabled:opacity-50"
          >
            {isProcessingPayment ? (
              <span className="flex items-center gap-2 text-sm">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Validation FedaPay en cours...
              </span>
            ) : (
              <span>Confirmer et Payer {price.toLocaleString('fr-FR')} FCFA</span>
            )}
          </button>
        </div>
      )}

      {/* STEP 5: CONFIRMATION SUCCESS & TRACKING CODE (Section 6.4 & 7.5) */}
      {step === 5 && createdOrder && (
        <div className="px-5 space-y-5 animate-in fade-in duration-300 text-center">
          <div className="w-16 h-16 rounded-full bg-[#E8F7EE] text-[#2FB36D] flex items-center justify-center mx-auto shadow-md">
            <Check className="w-8 h-8 stroke-[3]" />
          </div>

          <div>
            <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-[#E8F7EE] text-[#1E6B45] mb-2">
              Paiement confirmé avec succès !
            </span>
            <h2 className="font-serif-title font-bold text-2xl text-[#1C1C1E]">
              Votre commande est enregistrée
            </h2>
            <p className="text-xs text-[#6C6C70] mt-1 max-w-xs mx-auto">
              Notre équipe commence la préparation. Votre invitation sera prête et livrée dans moins de 24 heures.
            </p>
          </div>

          {/* Tracking Code Highlight Box */}
          <div className="bg-white rounded-3xl p-6 border-2 border-[#0E7C86]/30 shadow-md max-w-xs mx-auto space-y-3">
            <div className="text-[11px] font-bold uppercase tracking-wider text-[#6C6C70]">
              Votre code de suivi unique
            </div>
            <div className="font-mono text-3xl font-extrabold text-[#0E7C86] tracking-wider select-all">
              {createdOrder.trackingCode}
            </div>

            <button
              onClick={copyTrackingCode}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E3F3F4] text-[#0A5F67] font-semibold text-xs active:scale-95 transition hover:bg-[#d4ecee]"
            >
              {copiedCode ? <CheckCheck className="w-4 h-4 text-[#2FB36D]" /> : <Copy className="w-4 h-4" />}
              <span>{copiedCode ? 'Code copié !' : 'Copier le code'}</span>
            </button>
          </div>

          <div className="bg-[#FFF8ED] rounded-2xl p-4 border border-[#FFE0A3] text-left text-xs text-[#8A5A00] space-y-1">
            <p className="font-bold flex items-center gap-1">
              <AlertCircle className="w-4 h-4" /> Conservez précieusement ce code :
            </p>
            <p>
              Pour suivre l’avancement ou télécharger vos fichiers finaux, connectez-vous avec votre numéro WhatsApp (<strong>{createdOrder.whatsapp}</strong>) et ce code.
            </p>
          </div>

          <button
            onClick={() => onOrderCompleted(createdOrder)}
            className="w-full h-13 rounded-2xl bg-[#0E7C86] hover:bg-[#0A5F67] text-white font-bold text-base flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#0E7C86]/30"
          >
            <span>Accéder au suivi de ma commande</span>
            <Clock className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
};
