import React, { useEffect, useState } from 'react';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const [isOnline, setIsOnline] = useState<boolean>(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  );
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setJustReconnected(true);
      setTimeout(() => setJustReconnected(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setJustReconnected(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline && !justReconnected) return null;

  if (justReconnected) {
    return (
      <div className="bg-[#2FB36D] text-white px-4 py-2 text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-all animate-in slide-in-from-top">
        <Wifi className="w-3.5 h-3.5" />
        <span>Connexion rétablie — Créa est synchronisé</span>
      </div>
    );
  }

  return (
    <div className="bg-[#1C1C1E] text-white px-4 py-2 text-xs font-medium flex items-center justify-center gap-2 shadow-sm transition-all border-b border-gray-700">
      <WifiOff className="w-3.5 h-3.5 text-[#FFB020]" />
      <span>Vous êtes hors connexion · Vos formulaires restent enregistrés sur l’appareil</span>
    </div>
  );
};
