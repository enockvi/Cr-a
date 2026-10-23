import React, { useState, useEffect } from 'react';
import { TabKey, Navbar } from './components/Navbar';
import { Header } from './components/Header';
import { HomeView } from './views/HomeView';
import { QuickCreateView } from './views/QuickCreateView';
import { CatalogView } from './views/CatalogView';
import { OrderWizardView } from './views/OrderWizardView';
import { TrackingView } from './views/TrackingView';
import { AdminView } from './views/AdminView';
import { VIPInvitationView } from './views/VIPInvitationView';
import { CATALOG } from './data/catalog';
import { StorageService } from './services/storageService';
import {
  CardCategory,
  CardVariant,
  OrderTier,
  Order,
  Review,
  AppSettings,
  FailedSearch,
} from './types';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabKey>('home');

  // Active data states
  const [orders, setOrders] = useState<Order[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [settings, setSettings] = useState<AppSettings>(() => StorageService.getSettings());
  const [failedSearches, setFailedSearches] = useState<FailedSearch[]>([]);

  // Wizard active selection state
  const [activeWizard, setActiveWizard] = useState<{
    category: CardCategory;
    variant: CardVariant;
    tier: OrderTier;
    templateId: string;
  } | null>(null);

  // VIP invitation modal preview
  const [vipModalOrder, setVipModalOrder] = useState<Order | null>(null);

  // Tracking view target order
  const [trackingTargetOrder, setTrackingTargetOrder] = useState<Order | null>(null);

  // Reload data from local storage
  const reloadData = () => {
    setOrders(StorageService.getOrders());
    setReviews(StorageService.getReviews(false));
    setSettings(StorageService.getSettings());
    setFailedSearches(StorageService.getFailedSearches());
  };

  useEffect(() => {
    reloadData();
  }, []);

  // Listen to hash change for direct VIP link navigation like #/vip/CR-82KM-49
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#/vip/')) {
        const code = hash.replace('#/vip/', '').trim();
        const found = StorageService.getOrder(code);
        if (found) {
          setVipModalOrder(found);
        }
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const handleStartOrder = (
    category: CardCategory,
    variant: CardVariant,
    tier: OrderTier,
    templateId: string
  ) => {
    setActiveWizard({ category, variant, tier, templateId });
  };

  const handleOrderCompleted = (completedOrder: Order) => {
    reloadData();
    setActiveWizard(null);
    setTrackingTargetOrder(completedOrder);
    setCurrentTab('tracking');
  };

  const handleCancelWizard = () => {
    setActiveWizard(null);
  };

  // Count unnotified delivered orders for navbar badge
  const unnotifiedCount = orders.filter(
    (o) => (o.status === 'livree' || o.status === 'notee') && !o.isNotifiedOnWhatsApp
  ).length;

  return (
    <div className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] flex flex-col font-sans">
      {/* If VIP Invitation view is active, render fullscreen page */}
      {vipModalOrder && (
        <VIPInvitationView
          order={vipModalOrder}
          onClose={() => {
            setVipModalOrder(null);
            if (window.location.hash.startsWith('#/vip/')) {
              window.history.pushState(null, '', window.location.pathname);
            }
          }}
          isStandalone={true}
        />
      )}

      {/* Main App Container */}
      {!vipModalOrder && (
        <div className="flex-1 flex flex-col max-w-md mx-auto w-full relative bg-[#F2F2F7] min-h-screen shadow-2xl border-x border-[#E5E5EA]/40">
          {/* Header */}
          <Header
            onLogoClick={() => {
              if (activeWizard) setActiveWizard(null);
              setCurrentTab('home');
            }}
            showBack={Boolean(activeWizard)}
            onBack={handleCancelWizard}
            title={activeWizard ? 'Commander' : undefined}
          />

          {/* Main content body */}
          <main className="flex-1">
            {/* If Order Wizard is active */}
            {activeWizard ? (
              <OrderWizardView
                category={activeWizard.category}
                variant={activeWizard.variant}
                tier={activeWizard.tier}
                templateId={activeWizard.templateId}
                settings={settings}
                onOrderCompleted={handleOrderCompleted}
                onCancel={handleCancelWizard}
              />
            ) : (
              <>
                {/* 1. Accueil */}
                {currentTab === 'home' && (
                  <HomeView
                    categories={CATALOG}
                    reviews={reviews}
                    settings={settings}
                    onSelectCategory={(cat) => {
                      setCurrentTab('create');
                    }}
                    onGoToCreate={() => setCurrentTab('create')}
                    onGoToTracking={() => setCurrentTab('tracking')}
                  />
                )}

                {/* 2. Modèles (Catalog) */}
                {currentTab === 'catalog' && (
                  <CatalogView
                    categories={CATALOG}
                    settings={settings}
                    onSelectModel={handleStartOrder}
                  />
                )}

                {/* 3. Créer (Interactive Fast Track) */}
                {currentTab === 'create' && (
                  <QuickCreateView
                    categories={CATALOG}
                    settings={settings}
                    onProceedToOrder={handleStartOrder}
                    onBackToHome={() => setCurrentTab('home')}
                  />
                )}

                {/* 4. Commandes (Suivi Client) */}
                {currentTab === 'tracking' && (
                  <TrackingView
                    initialOrder={trackingTargetOrder}
                    onOpenVIPPage={(ord) => setVipModalOrder(ord)}
                  />
                )}

                {/* 5. Compte / Admin */}
                {currentTab === 'account' && (
                  <AdminView
                    orders={orders}
                    reviews={reviews}
                    settings={settings}
                    failedSearches={failedSearches}
                    onOrderUpdated={reloadData}
                    onSettingsUpdated={(newSettings) => {
                      setSettings(newSettings);
                      reloadData();
                    }}
                    onOpenVIPPage={(ord) => setVipModalOrder(ord)}
                  />
                )}
              </>
            )}
          </main>

          {/* Fixed Bottom Navigation (hidden while inside wizard for focus) */}
          {!activeWizard && (
            <Navbar
              currentTab={currentTab}
              onTabChange={(tab) => {
                setActiveWizard(null);
                setCurrentTab(tab);
              }}
              pendingDeliveriesCount={unnotifiedCount}
            />
          )}
        </div>
      )}
    </div>
  );
}
