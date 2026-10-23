import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Share2,
  Heart,
  Volume2,
  VolumeX,
  Send,
  Navigation,
  CheckCircle2,
  ArrowDown,
  X,
} from 'lucide-react';
import { Order } from '../types';
import { getPaletteById, DEUIL_TOKENS, PaletteTokens } from '../config/palettes';

interface VIPInvitationViewProps {
  order: Order;
  onClose?: () => void;
  isStandalone?: boolean;
}

export const VIPInvitationView: React.FC<VIPInvitationViewProps> = ({
  order,
  onClose,
  isStandalone = false,
}) => {
  const [envelopeOpened, setEnvelopeOpened] = useState(false);
  const [guestCount, setGuestCount] = useState(1);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      setPrefersReducedMotion(mediaQuery.matches);
      const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
      mediaQuery.addEventListener('change', handler);
      return () => mediaQuery.removeEventListener('change', handler);
    }
  }, []);

  const [audio] = useState(() => {
    // Gentle instrumental audio placeholder
    if (typeof Audio !== 'undefined') {
      const a = new Audio('https://actions.google.com/sounds/v1/water/rain_heavy.ogg');
      a.loop = true;
      return a;
    }
    return null;
  });

  const isDeuil = order.typeId === 'deuil';
  const tokens: PaletteTokens = isDeuil
    ? DEUIL_TOKENS
    : (order.paletteSnapshot?.tokens ||
       (order.paletteId ? getPaletteById(order.paletteId)?.tokens : null) || {
         bg: '#FAF7F2',
         card: '#FFFFFF',
         text: '#1C1C1E',
         muted: '#6C6C70',
         border: '#E5E5EA',
         accent1: '#0E7C86',
         accent2: '#0A5F67',
         textOnAccent: '#FFFFFF',
       });

  const fields = order.fields;
  const eventDateObj = fields.eventDate ? new Date(`${fields.eventDate}T${fields.eventTime || '12:00'}`) : new Date(Date.now() + 30 * 86400000);

  // Time remaining to event
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (isDeuil) return;
    const calculateTime = () => {
      const diff = eventDateObj.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / 1000 / 60) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };
    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [eventDateObj, isDeuil]);

  const toggleAudio = () => {
    if (!audio) return;
    if (isAudioPlaying) {
      audio.pause();
      setIsAudioPlaying(false);
    } else {
      audio.play().catch(() => {});
      setIsAudioPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audio) audio.pause();
    };
  }, [audio]);

  // WhatsApp RSVP link generator (Section 3 & Annexe B)
  const handleRSVP = () => {
    const rawNumber = order.whatsapp.replace(/\D/g, '');
    const eventName = fields.specifics?.brideGroomNames || fields.customerName || order.typeName;
    const msg = `Bonjour, je confirme ma présence à ${eventName}. Je serai ${guestCount} personne(s).`;
    const waUrl = `https://wa.me/${rawNumber}?text=${encodeURIComponent(msg)}`;
    window.open(waUrl, '_blank', 'noopener,noreferrer');
  };

  const coupleNames = fields.specifics?.brideGroomNames || fields.customerName || 'Aïcha & Koffi';
  const deceasedName = fields.specifics?.deceasedName || fields.customerName;

  return (
    <div
      className="min-h-screen w-full select-none relative transition-colors duration-300"
      style={
        {
          '--bg-app': tokens.bg,
          '--bg-card': tokens.card,
          '--text-main': tokens.text,
          '--text-muted': tokens.muted,
          '--border-color': tokens.border,
          '--grad-start': tokens.accent1,
          '--grad-end': tokens.accent2,
          '--text-on-accent': tokens.textOnAccent,
          backgroundColor: tokens.bg,
          color: tokens.text,
        } as React.CSSProperties
      }
    >
      {/* Top action bar */}
      <div className="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center pointer-events-none">
        <div className="pointer-events-auto">
          {onClose && (
            <button
              onClick={onClose}
              className="px-3.5 py-1.5 rounded-full text-xs font-semibold backdrop-blur-md bg-black/40 text-white flex items-center gap-1 shadow-sm hover:bg-black/60 active:scale-95 transition"
            >
              <X className="w-4 h-4" /> Fermer
            </button>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-2">
          {fields.ambientMusic && !isDeuil && (
            <button
              onClick={toggleAudio}
              className="p-2.5 rounded-full backdrop-blur-md bg-white/70 text-[#1C1C1E] shadow-sm hover:bg-white active:scale-95 transition"
              title="Musique d’ambiance"
            >
              {isAudioPlaying ? <Volume2 className="w-4 h-4 text-[#0E7C86]" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
            </button>
          )}

          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: `Invitation VIP — ${coupleNames}`,
                  text: fields.mainMessage,
                  url: window.location.href,
                }).catch(() => {});
              } else {
                navigator.clipboard.writeText(window.location.href);
                alert('Lien de l’invitation VIP copié !');
              }
            }}
            className="p-2.5 rounded-full backdrop-blur-md bg-white/70 text-[#1C1C1E] shadow-sm hover:bg-white active:scale-95 transition"
            title="Partager l’invitation"
          >
            <Share2 className="w-4 h-4 text-[#0E7C86]" />
          </button>
        </div>
      </div>

      {/* ENVELOPE OPENING STAGE (Section 3 & 4.9) */}
      <AnimatePresence>
        {!envelopeOpened && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 1.05 }}
            transition={{ duration: prefersReducedMotion ? 0.05 : 0.6 }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center p-6 text-white"
            style={{
              background: isDeuil
                ? 'linear-gradient(to bottom, #15151B, #1F1F27)'
                : `linear-gradient(135deg, ${tokens.accent1}, ${tokens.accent2})`,
            }}
          >
            {isDeuil ? (
              // Sober fade-in for mourning
              <div className="max-w-md w-full bg-[#1C1C24] p-8 rounded-3xl text-center border border-gray-800 shadow-2xl">
                <p className="text-xs font-serif uppercase tracking-widest text-[#9A9AA6] mb-3">
                  Hommage &amp; Faire-part
                </p>
                <h1 className="text-2xl font-serif-title font-bold text-white mb-4">
                  {deceasedName}
                </h1>
                <p className="text-sm text-gray-400 mb-8 italic">
                  « Le Seigneur a donné, le Seigneur a repris, que Son saint nom soit béni. »
                </p>
                <button
                  onClick={() => setEnvelopeOpened(true)}
                  className="w-full h-13 rounded-2xl bg-[#D5D5DC] text-[#15151B] font-semibold text-sm active:scale-97 transition shadow-lg cursor-pointer"
                >
                  Accéder à la commémoration
                </button>
              </div>
            ) : (
              // Festive Virtual Sealed Envelope
              <div className="flex flex-col items-center text-center max-w-sm">
                <p className="text-xs uppercase tracking-widest text-white/80 font-semibold mb-2">
                  Vous avez reçu une invitation VIP
                </p>
                <h2 className="font-script text-5xl mb-6 text-white drop-shadow-md">
                  {coupleNames}
                </h2>

                <div
                  onClick={() => setEnvelopeOpened(true)}
                  className="w-72 h-48 rounded-2xl bg-white shadow-2xl relative flex items-center justify-center cursor-pointer transform hover:scale-105 active:scale-95 transition-all duration-300 border-2 group"
                  style={{ borderColor: `${tokens.accent1}55` }}
                >
                  {/* Flap lines */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className="w-0 h-0 border-l-[140px] border-l-transparent border-r-[140px] border-r-transparent border-t-[90px] absolute top-0"
                      style={{ borderTopColor: `${tokens.accent2}33` }}
                    />
                  </div>

                  {/* Wax Seal with contrast text */}
                  <div
                    className="w-14 h-14 rounded-full flex flex-col items-center justify-center shadow-lg border-2 border-white/60 z-10 group-hover:scale-110 transition-transform"
                    style={{
                      background: `linear-gradient(135deg, ${tokens.accent1}, ${tokens.accent2})`,
                      color: tokens.textOnAccent,
                    }}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span className="text-[9px] font-bold tracking-tight">OUVRIR</span>
                  </div>
                </div>

                <p className={`text-xs text-white/90 mt-6 flex items-center gap-1.5 ${prefersReducedMotion ? '' : 'animate-bounce'}`}>
                  <span>Touchez l’enveloppe pour l’ouvrir</span>
                  <ArrowDown className="w-3.5 h-3.5" />
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN INVITATION VERTICAL FEED (Section 3: défilement vertical) */}
      <main className="max-w-lg mx-auto pb-24 pt-16 px-4 space-y-12 animate-in fade-in duration-500">
        {/* Section 1: Hero Cover */}
        <section className="text-center pt-8">
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#E3F3F4] text-[#0A5F67] mb-4">
            <Sparkles className="w-3.5 h-3.5 text-[#FFB020]" />
            <span>Invitation Officielle</span>
          </div>

          <h1
            className={`font-script text-6xl leading-tight mb-3 ${
              isDeuil ? 'font-serif-title text-3xl font-bold text-white' : 'text-[#0A5F67]'
            }`}
          >
            {isDeuil ? deceasedName : coupleNames}
          </h1>

          {fields.hashtag && (
            <div className="font-mono text-xs text-[#0E7C86] font-semibold tracking-wider mb-4">
              {fields.hashtag}
            </div>
          )}

          <p className="text-base text-gray-700 italic max-w-sm mx-auto leading-relaxed">
            « {fields.mainMessage || 'Nous serions honorés de votre présence pour célébrer ce moment inoubliable.'} »
          </p>

          {/* Date & Location summary card */}
          <div className="mt-8 p-5 rounded-2xl bg-white shadow-sm border border-[#E5E5EA] space-y-3">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#E3F3F4] text-[#0E7C86] flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Date de l’événement</div>
                <div className="text-sm font-bold text-[#1C1C1E]">
                  {fields.eventDate
                    ? new Date(fields.eventDate).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    : '12 décembre 2026'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#FFF3DC] text-[#8A5A00] flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Heure</div>
                <div className="text-sm font-bold text-[#1C1C1E]">
                  {fields.eventTime || '14h30'} {fields.timezone ? `(${fields.timezone})` : ''}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-[#E8F7EE] text-[#1E6B45] flex items-center justify-center flex-shrink-0">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-medium">Lieu &amp; Ville</div>
                <div className="text-sm font-bold text-[#1C1C1E]">
                  {fields.venueName || 'Palais des Congrès'}, {fields.venueCity || fields.eventCity || 'Cotonou'}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Compte à Rebours (sauf Deuil) */}
        {!isDeuil && (
          <section className="text-center">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#6C6C70] mb-3">
              Le compte à rebours
            </h3>
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: 'Jours', val: timeLeft.days },
                { label: 'Heures', val: timeLeft.hours },
                { label: 'Minutes', val: timeLeft.minutes },
                { label: 'Secondes', val: timeLeft.seconds },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="bg-white rounded-2xl p-3 shadow-xs border border-[#E5E5EA] flex flex-col items-center"
                >
                  <span className="font-mono text-2xl font-bold text-[#0A5F67]">
                    {String(item.val).padStart(2, '0')}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-[#8E8E93] mt-0.5">
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 3: Notre Histoire / Jalons (jusqu'à 3) */}
        {fields.storyMilestones && fields.storyMilestones.length > 0 && (
          <section>
            <div className="text-center mb-6">
              <h2 className="font-serif-title text-2xl font-bold text-[#1C1C1E]">
                Notre Histoire
              </h2>
              <p className="text-xs text-[#6C6C70]">Les étapes qui nous ont menés jusqu’ici</p>
            </div>

            <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E5E5EA]">
              {fields.storyMilestones.map((m, idx) => (
                <div key={idx} className="relative pl-10">
                  <div className="absolute left-2.5 top-1.5 w-3.5 h-3.5 rounded-full bg-[#0E7C86] border-2 border-white ring-2 ring-[#0E7C86]/20" />
                  <div className="bg-white p-4 rounded-2xl shadow-xs border border-[#E5E5EA]">
                    <div className="flex justify-between items-baseline mb-1">
                      <h4 className="font-bold text-sm text-[#1C1C1E]">{m.title}</h4>
                      <span className="text-[11px] font-mono text-[#0E7C86] font-semibold">{m.date}</span>
                    </div>
                    <p className="text-xs text-[#6C6C70] leading-relaxed">{m.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 4: Galerie Photos (4 à 8 photos) */}
        <section>
          <div className="text-center mb-4">
            <h2 className="font-serif-title text-2xl font-bold text-[#1C1C1E]">
              Galerie Photos
            </h2>
            <p className="text-xs text-[#6C6C70]">Des instants précieux à partager</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="aspect-square rounded-2xl overflow-hidden bg-gray-200 shadow-xs border border-gray-100"
              >
                <img
                  src={`https://picsum.photos/seed/vip-gallery-${n}-${order.id}/600/600`}
                  alt={`Moment ${n}`}
                  className="w-full h-full object-cover transform hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </section>

        {/* Section 5: Programme de la Journée */}
        {fields.schedule && fields.schedule.length > 0 && (
          <section>
            <div className="text-center mb-6">
              <h2 className="font-serif-title text-2xl font-bold text-[#1C1C1E]">
                Le Programme
              </h2>
              <p className="text-xs text-[#6C6C70]">Déroulement des festivités</p>
            </div>

            <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5E5EA] divide-y divide-[#E5E5EA]">
              {fields.schedule.map((item, idx) => (
                <div key={idx} className="py-3 flex items-start gap-4 first:pt-0 last:pb-0">
                  <span className="font-mono text-sm font-bold text-[#0E7C86] w-12 flex-shrink-0 pt-0.5">
                    {item.time}
                  </span>
                  <div>
                    <h5 className="font-semibold text-sm text-[#1C1C1E]">{item.label}</h5>
                    {item.detail && <p className="text-xs text-[#6C6C70] mt-0.5">{item.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Section 6: Lieu & Itinéraire Google Maps */}
        <section>
          <div className="text-center mb-4">
            <h2 className="font-serif-title text-2xl font-bold text-[#1C1C1E]">
              Comment s’y rendre
            </h2>
            <p className="text-xs text-[#6C6C70]">Rejoignez-nous facilement</p>
          </div>

          <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5E5EA] space-y-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 rounded-2xl bg-[#E3F3F4] text-[#0E7C86] flex items-center justify-center mb-2">
                <Navigation className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-base text-[#1C1C1E]">{fields.venueName || 'Lieu de réception'}</h4>
              <p className="text-xs text-[#6C6C70] mt-1">{fields.venueAddress || 'Cotonou, Bénin'}</p>
            </div>

            <a
              href={
                fields.googleMapsUrl ||
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${fields.venueName} ${fields.venueCity || fields.eventCity || ''}`
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 w-full h-12 rounded-xl bg-[#0E7C86] text-white font-semibold text-sm active:scale-97 transition shadow-md shadow-[#0E7C86]/20"
            >
              <Navigation className="w-4 h-4" />
              Ouvrir l’itinéraire dans Maps
            </a>
          </div>
        </section>

        {/* Section 7: Dress Code & Couleurs */}
        {fields.dressCodeColors && fields.dressCodeColors.length > 0 && (
          <section className="text-center">
            <div className="bg-white rounded-3xl p-5 shadow-xs border border-[#E5E5EA]">
              <h3 className="font-serif-title text-lg font-bold text-[#1C1C1E] mb-1">
                {fields.dressCodeTitle || 'Dress Code'}
              </h3>
              <p className="text-xs text-[#6C6C70] mb-4">Harmonie des tenues pour de belles photos</p>

              <div className="flex items-center justify-center gap-4">
                {fields.dressCodeColors.map((hex, idx) => (
                  <div key={idx} className="flex flex-col items-center gap-1.5">
                    <span
                      className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                      style={{ backgroundColor: hex }}
                    />
                    <span className="font-mono text-[10px] text-gray-500">{hex}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Section 8: RSVP WhatsApp Button (Section 3: ouvre WhatsApp sans base de données) */}
        {!isDeuil && (
          <section className="bg-gradient-to-br from-[#E3F3F4] to-[#C7E9EC] p-6 rounded-3xl text-center shadow-xs border border-[#BCE1E5]">
            <Heart className="w-8 h-8 text-[#0E7C86] mx-auto mb-2 fill-current" />
            <h3 className="font-serif-title text-xl font-bold text-[#0A5F67] mb-1">
              Confirmation de Présence
            </h3>
            <p className="text-xs text-gray-700 mb-4">
              {fields.rsvpDeadline
                ? `Merci de confirmer avant le ${fields.rsvpDeadline}.`
                : 'Merci de nous faire part de votre venue.'}
            </p>

            <div className="bg-white/90 p-4 rounded-2xl mb-4 space-y-3">
              <label className="text-xs font-semibold text-gray-700 block">
                Nombre de personnes participantes :
              </label>
              <div className="flex items-center justify-center gap-3">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() => setGuestCount(num)}
                    className={`w-10 h-10 rounded-xl font-bold text-sm transition-all ${
                      guestCount === num
                        ? 'bg-[#0E7C86] text-white shadow-sm'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleRSVP}
              className="w-full h-13 rounded-2xl bg-[#2FB36D] hover:bg-[#279c5f] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-97 transition shadow-lg shadow-[#2FB36D]/30"
            >
              <Send className="w-4 h-4" />
              Confirmer ma présence sur WhatsApp
            </button>
            <p className="text-[11px] text-gray-500 mt-2">
              Un message prérempli sera envoyé directement aux organisateurs.
            </p>
          </section>
        )}

        {/* Section 9: Pied de page */}
        <footer className="text-center pt-8 border-t border-[#E5E5EA]">
          <p className="font-script text-3xl text-[#0E7C86] mb-1">
            {coupleNames}
          </p>
          <p className="text-xs text-[#6C6C70]">
            {fields.footerMessage || 'Nous avons hâte de vivre ce moment avec vous.'}
          </p>
          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-[#8E8E93]">
            <span>Invitation propulsée avec soin par</span>
            <strong className="text-[#0E7C86]">Créa</strong>
          </div>
        </footer>
      </main>
    </div>
  );
};
