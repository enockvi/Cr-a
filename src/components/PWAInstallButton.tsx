import React, { useEffect, useState } from 'react';
import { Download, Share, PlusSquare, X } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export const PWAInstallButton: React.FC<{ variant?: 'header' | 'banner' | 'pill' }> = ({
  variant = 'header',
}) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    // Detect standalone mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsInstalled(isStandalone);

    // Detect iOS
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua);
    setIsIOS(isIOSDevice);

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setIsInstalled(true);
        setDeferredPrompt(null);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  if (isInstalled) return null;

  // Render on Android, Desktop or iOS
  const canShow = Boolean(deferredPrompt || isIOS);
  if (!canShow) return null;

  return (
    <>
      <button
        onClick={handleInstallClick}
        aria-label="Installer l'application Créa"
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-[#E3F3F4] text-[#0A5F67] hover:bg-[#d0edef] active:scale-95 transition-all shadow-xs border border-[#0E7C86]/20"
      >
        <Download className="w-3.5 h-3.5 stroke-[#0E7C86]" />
        <span>Installer l’app</span>
      </button>

      {/* iOS Modal instructions (Section 7.2) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 text-left">
            <div className="flex justify-between items-start mb-3">
              <h3 className="text-lg font-bold text-[#1C1C1E] font-serif-title">
                Installer Créa sur iPhone
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-full text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-[#6C6C70] mb-4">
              Profitez d’un accès ultra rapide depuis votre écran d’accueil :
            </p>
            <div className="space-y-3 bg-[#F2F2F7] p-3.5 rounded-xl text-sm text-[#1C1C1E]">
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#0E7C86] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  1
                </span>
                <span>
                  Appuyez sur le bouton <strong>Partager</strong> <Share className="w-4 h-4 inline text-[#0E7C86] mx-0.5" /> dans Safari.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#0E7C86] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  2
                </span>
                <span>
                  Faites défiler et sélectionnez <strong>Sur l’écran d’accueil</strong> <PlusSquare className="w-4 h-4 inline text-[#0E7C86] mx-0.5" />.
                </span>
              </div>
              <div className="flex items-center gap-2.5">
                <span className="w-6 h-6 rounded-full bg-[#0E7C86] text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                  3
                </span>
                <span>
                  Touchez <strong>Ajouter</strong> en haut à droite.
                </span>
              </div>
            </div>
            <button
              onClick={() => setShowIOSModal(false)}
              className="mt-5 w-full h-[46px] rounded-xl bg-[#0E7C86] text-white font-semibold text-sm active:scale-97 transition"
            >
              J’ai compris
            </button>
          </div>
        </div>
      )}
    </>
  );
};
