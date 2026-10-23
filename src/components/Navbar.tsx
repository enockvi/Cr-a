import React from 'react';

export type TabKey = 'home' | 'catalog' | 'create' | 'tracking' | 'account';

interface NavbarProps {
  currentTab: TabKey;
  onTabChange: (tab: TabKey) => void;
  pendingDeliveriesCount?: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onTabChange,
  pendingDeliveriesCount = 0,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none">
      {/* Wrapper matching the mobile app shell width */}
      <div className="max-w-md mx-auto pointer-events-auto relative">
        <nav
          className="w-full ios-glass border-t border-[#E5E5EA] flex items-start justify-between px-2 pt-2 transition-all shadow-[0_-4px_20px_rgba(0,0,0,0.04)]"
          style={{
            paddingBottom: 'calc(8px + env(safe-area-inset-bottom, 16px))',
            minHeight: 'calc(64px + env(safe-area-inset-bottom, 16px))',
          }}
        >
          {/* 1. Accueil */}
          <button
            onClick={() => onTabChange('home')}
            className={`flex-1 flex flex-col items-center justify-center h-12 gap-1 rounded-xl transition-all ios-press ${
              currentTab === 'home' ? 'text-[#0E7C86]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
            aria-label="Accueil"
          >
            <svg
              className="w-6 h-6 stroke-current stroke-[1.8] fill-none"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 11l8-7 8 7v8a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />
            </svg>
            <span
              className={`text-[10px] leading-none ${
                currentTab === 'home' ? 'font-bold' : 'font-medium'
              }`}
            >
              Accueil
            </span>
          </button>

          {/* 2. Modèles */}
          <button
            onClick={() => onTabChange('catalog')}
            className={`flex-1 flex flex-col items-center justify-center h-12 gap-1 rounded-xl transition-all ios-press ${
              currentTab === 'catalog' ? 'text-[#0E7C86]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
            aria-label="Modèles"
          >
            <svg
              className="w-6 h-6 stroke-current stroke-[1.8] fill-none"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="4" y="4" width="7" height="7" rx="1.5" />
              <rect x="13" y="4" width="7" height="7" rx="1.5" />
              <rect x="4" y="13" width="7" height="7" rx="1.5" />
              <rect x="13" y="13" width="7" height="7" rx="1.5" />
            </svg>
            <span
              className={`text-[10px] leading-none ${
                currentTab === 'catalog' ? 'font-bold' : 'font-medium'
              }`}
            >
              Modèles
            </span>
          </button>

          {/* 3. Créer (Center elevated button following Charte .tb .mid) */}
          <div className="flex-1 flex flex-col items-center relative -top-4">
            <button
              onClick={() => onTabChange('create')}
              aria-label="Créer une invitation"
              className="w-13.5 h-13.5 rounded-[18px] bg-gradient-to-br from-[#17A2AD] to-[#0A5F67] flex items-center justify-center shadow-[0_8px_18px_rgba(14,124,134,0.38)] active:scale-95 transition-transform relative group border border-white/20"
            >
              <svg
                className="w-7 h-7 text-white stroke-current stroke-[2.4] fill-none"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {/* Apple-like golden spark pip */}
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-[#FFB020] rounded-full border-2 border-white shadow-xs" />
            </button>
            <span
              className={`text-[10px] mt-1.5 leading-none ${
                currentTab === 'create' ? 'font-bold text-[#0E7C86]' : 'font-medium text-[#0A5F67]'
              }`}
            >
              Créer
            </span>
          </div>

          {/* 4. Commandes / Suivi */}
          <button
            onClick={() => onTabChange('tracking')}
            className={`flex-1 flex flex-col items-center justify-center h-12 gap-1 rounded-xl transition-all ios-press relative ${
              currentTab === 'tracking' ? 'text-[#0E7C86]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
            aria-label="Suivi de commande"
          >
            <div className="relative">
              <svg
                className="w-6 h-6 stroke-current stroke-[1.8] fill-none"
                viewBox="0 0 24 24"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M5 8h14l-1 12H6z" />
                <path d="M9 8a3 3 0 0 1 6 0" />
              </svg>
              {pendingDeliveriesCount > 0 && (
                <span className="absolute -top-1 -right-2 min-w-4 h-4 px-1 bg-[#FFB020] text-[#1C1C1E] text-[10px] font-bold rounded-full flex items-center justify-center shadow-xs">
                  {pendingDeliveriesCount}
                </span>
              )}
            </div>
            <span
              className={`text-[10px] leading-none ${
                currentTab === 'tracking' ? 'font-bold' : 'font-medium'
              }`}
            >
              Suivi
            </span>
          </button>

          {/* 5. Compte / Admin */}
          <button
            onClick={() => onTabChange('account')}
            className={`flex-1 flex flex-col items-center justify-center h-12 gap-1 rounded-xl transition-all ios-press ${
              currentTab === 'account' ? 'text-[#0E7C86]' : 'text-[#8E8E93] hover:text-[#1C1C1E]'
            }`}
            aria-label="Compte et administration"
          >
            <svg
              className="w-6 h-6 stroke-current stroke-[1.8] fill-none"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
            </svg>
            <span
              className={`text-[10px] leading-none ${
                currentTab === 'account' ? 'font-bold' : 'font-medium'
              }`}
            >
              Compte
            </span>
          </button>
        </nav>
      </div>
    </div>
  );
};
