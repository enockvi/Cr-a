import { Order, Review, AppSettings, FailedSearch, OrderTier, PaymentMethod, DeliveryFile } from '../types';
import { DEFAULT_SETTINGS, INITIAL_REVIEWS } from '../data/catalog';
import { getPaletteById, CATEGORY_PALETTE_MAP, PALETTES } from '../config/palettes';

const STORAGE_KEYS = {
  ORDERS: 'crea_orders_v1',
  REVIEWS: 'crea_reviews_v1',
  SETTINGS: 'crea_settings_v1',
  SEARCHES: 'crea_failed_searches_v1',
  DRAFT: 'crea_order_draft_v1',
  LOGIN_ATTEMPTS: 'crea_login_attempts_v1',
  ACTIVE_SESSION: 'crea_active_session_v1',
};

// Character set without ambiguous letters: no 0, O, 1, I (Section 7.5)
const UNAMBIGUOUS_CHARS = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateTrackingCode(): string {
  const getRandom = (len: number) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      const idx = Math.floor(Math.random() * UNAMBIGUOUS_CHARS.length);
      res += UNAMBIGUOUS_CHARS[idx];
    }
    return res;
  };
  return `CR-${getRandom(4)}-${getRandom(2)}`;
}

// Initial demo orders to showcase full lifecycle (Paid, En création, Livrée with files)
const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-demo-1',
    trackingCode: 'CR-82KM-49',
    tier: 'vip',
    typeId: 'mariage',
    typeName: 'Faire-part de mariage',
    templateId: 'm-vip-1',
    templateName: 'Sènami & Rodrigue VIP',
    amountXOF: 7500,
    status: 'livree',
    customerName: 'Aïcha & Koffi K.',
    whatsapp: '+22997001122',
    paletteId: 'champagne-rose',
    paletteSnapshot: {
      id: 'champagne-rose',
      name: 'Champagne Rosé',
      category: 'Mariage et couple',
      bg: '#FBF6F3',
      card: '#FFFFFF',
      text: '#3D2B2B',
      muted: '#7A6260',
      border: '#EFE3DE',
      accent1: '#B76E79',
      accent2: '#D8A7A0',
      textOnAccent: '#141413',
    },
    fields: {
      customerName: 'Aïcha & Koffi K.',
      whatsapp: '+22997001122',
      eventCountry: 'Bénin',
      eventCity: 'Cotonou',
      eventDate: '2026-12-12',
      eventTime: '15:00',
      timezone: 'GMT+1 (Afrique de l’Ouest)',
      venueName: 'Palais des Congrès de Cotonou',
      venueAddress: 'Boulevard de la Marina',
      venueCity: 'Cotonou',
      googleMapsUrl: 'https://maps.google.com/?q=Palais+des+Congres+Cotonou',
      mainMessage: 'Deux cœurs qui battent à l’unisson. Nous avons l’immense joie de vous convier à célébrer notre union sacrée.',
      paletteChoice: 'Champagne Rosé',
      paletteId: 'champagne-rose',
      hashtag: '#AichaEtKoffi2026',
      specifics: {
        brideGroomNames: 'Aïcha & Koffi',
        families: 'Familles KPADONOU et DOSSOU',
        receptionVenue: 'Salle Bleue du Palais des Congrès',
      },
      storyMilestones: [
        { title: 'Première rencontre', date: 'Juillet 2021', description: 'Un café partagé sous les manguiers de Calavi.' },
        { title: 'Les fiançailles', date: 'Novembre 2024', description: 'Une promesse entourée de nos familles.' },
        { title: 'Le Grand Jour', date: '12 Décembre 2026', description: 'Le début de notre pour toujours.' },
      ],
      schedule: [
        { time: '11:00', label: 'Cérémonie Civile', detail: 'Mairie de Cotonou' },
        { time: '14:30', label: 'Bénédiction Nuptiale', detail: 'Paroisse St-Michel' },
        { time: '18:00', label: 'Dîner de Gala & Soirée', detail: 'Palais des Congrès' },
      ],
      dressCodeTitle: 'Tenue de Prestige',
      dressCodeColors: ['#8A3B57', '#F6D5D9', '#FFB020'],
      rsvpDeadline: '25 novembre 2026',
      footerMessage: 'Votre présence est le plus beau des cadeaux.',
      ambientMusic: true,
    },
    assets: [],
    deliveries: [
      {
        id: 'del-1',
        kind: 'vip_link',
        title: 'Page d’invitation VIP Interactive en ligne',
        url: '#/vip/CR-82KM-49',
        createdAt: '2026-10-18T14:10:00Z',
      },
      {
        id: 'del-2',
        kind: 'pdf',
        title: 'Faire-part Haute Définition A4',
        url: 'https://picsum.photos/seed/aicha-inv/1200/1600.jpg',
        fileName: 'Aicha_Koffi_FairePart_A4.pdf',
        createdAt: '2026-10-18T14:10:00Z',
      },
    ],
    paymentMethod: 'mtn',
    paymentTransactionId: 'FEDAPAY_TX_993412',
    createdAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 35 * 3600 * 1000).toISOString(),
    dueAt: new Date(Date.now() - 11 * 3600 * 1000).toISOString(),
    deliveredAt: new Date(Date.now() - 17 * 3600 * 1000).toISOString(),
    isNotifiedOnWhatsApp: true,
    notifiedAt: new Date(Date.now() - 17 * 3600 * 1000).toISOString(),
    hasReview: true,
  },
  {
    id: 'ord-demo-2',
    trackingCode: 'CR-94PX-31',
    tier: 'simple',
    typeId: 'mariage',
    typeName: 'Dot & Mariage coutumier',
    templateId: 'm-simple-1',
    templateName: 'Aïcha & Koffi',
    amountXOF: 2500,
    status: 'payee',
    customerName: 'Rodrigue S.',
    whatsapp: '+22996112233',
    paletteId: 'or-ivoire',
    paletteSnapshot: {
      id: 'or-ivoire',
      name: 'Or et Ivoire',
      category: 'Mariage et couple',
      bg: '#FBF8F1',
      card: '#FFFFFF',
      text: '#2E2A22',
      muted: '#6E6553',
      border: '#EDE6D6',
      accent1: '#B8912F',
      accent2: '#D9B65A',
      textOnAccent: '#141413',
    },
    fields: {
      customerName: 'Rodrigue S.',
      whatsapp: '+22996112233',
      eventCountry: 'Bénin',
      eventCity: 'Porto-Novo',
      eventDate: '2027-01-16',
      eventTime: '13:00',
      timezone: 'GMT+1',
      venueName: 'Concession Familiale Dossou',
      venueAddress: 'Quartier Avakpa',
      venueCity: 'Porto-Novo',
      paletteId: 'or-ivoire',
      mainMessage: 'Nos familles vous invitent avec honneur à la cérémonie de remise des présents et à la bénédiction traditionnelle.',
      specifics: {
        brideGroomNames: 'Mireille & Rodrigue',
        families: 'Familles DOSSOU & HOUNSOU',
        customsSchedule: 'Accueil des délégations à 13h, cérémonie à 14h',
      },
    },
    assets: [],
    deliveries: [],
    paymentMethod: 'moov',
    paymentTransactionId: 'FEDAPAY_TX_104882',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 20 * 3600 * 1000).toISOString(), // 20 hours remaining!
    isNotifiedOnWhatsApp: false,
    hasReview: false,
  },
  {
    id: 'ord-demo-3',
    trackingCode: 'CR-74TX-88',
    tier: 'simple',
    typeId: 'deuil',
    typeName: 'Faire-part de décès',
    templateId: 'd-simple-1',
    templateName: 'Jean-Baptiste Hounkpatin',
    amountXOF: 2500,
    status: 'en_creation',
    customerName: 'Famille Hounkpatin',
    whatsapp: '+22995443322',
    fields: {
      customerName: 'M. Fabrice Hounkpatin',
      whatsapp: '+22995443322',
      eventCountry: 'Bénin',
      eventCity: 'Cotonou',
      eventDate: '2026-11-07',
      eventTime: '10:00',
      timezone: 'GMT+1',
      venueName: 'Église St-Michel',
      venueAddress: 'Boulevard St-Michel',
      venueCity: 'Cotonou',
      mainMessage: 'Il a plu au Seigneur de rappeler à Lui notre très cher époux, père, grand-père et oncle.',
      specifics: {
        deceasedName: 'Papa Jean-Baptiste Hounkpatin',
        lifeDates: '1948 – 2026',
        bereavedFamilies: 'Les familles HOUNKPATIN, DOSSOU, ADJOVI et parentes.',
        ceremonyVenue: 'Messe d’enterrement en l’église St-Michel suivie de l’inhumation au cimetière d’Akpakpa.',
      },
    },
    assets: [],
    deliveries: [],
    paymentMethod: 'card',
    paymentTransactionId: 'FEDAPAY_TX_774913',
    createdAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
    paidAt: new Date(Date.now() - 19 * 3600 * 1000).toISOString(),
    dueAt: new Date(Date.now() + 5 * 3600 * 1000).toISOString(), // 5 hours remaining (orange alert)
    isNotifiedOnWhatsApp: false,
    hasReview: false,
  },
];

export class StorageService {
  private static isBrowser = typeof window !== 'undefined';

  static getOrders(): Order[] {
    if (!this.isBrowser) return INITIAL_ORDERS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.ORDERS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(INITIAL_ORDERS));
        return INITIAL_ORDERS;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_ORDERS;
    }
  }

  static saveOrders(orders: Order[]): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.ORDERS, JSON.stringify(orders));
  }

  static getOrder(trackingCode: string, whatsapp?: string): Order | undefined {
    const orders = this.getOrders();
    const cleanCode = trackingCode.trim().toUpperCase();
    return orders.find((o) => {
      const codeMatch = o.trackingCode.toUpperCase() === cleanCode;
      if (!codeMatch) return false;
      if (!whatsapp) return true;
      const cleanWa = whatsapp.replace(/\D/g, '');
      const orderWa = o.whatsapp.replace(/\D/g, '');
      return cleanWa.length >= 6 && (orderWa.endsWith(cleanWa) || cleanWa.endsWith(orderWa));
    });
  }

  static getOrdersByWhatsApp(whatsapp: string): Order[] {
    const orders = this.getOrders();
    const cleanWa = whatsapp.replace(/\D/g, '');
    if (!cleanWa) return [];
    return orders.filter((o) => {
      const orderWa = o.whatsapp.replace(/\D/g, '');
      return orderWa.endsWith(cleanWa) || cleanWa.endsWith(orderWa);
    });
  }

  static saveOrder(order: Order): Order {
    const orders = this.getOrders();
    const index = orders.findIndex((o) => o.id === order.id);
    if (index >= 0) {
      orders[index] = order;
    } else {
      orders.unshift(order);
    }
    this.saveOrders(orders);
    return order;
  }

  static createNewOrder(orderData: Partial<Order>): Order {
    const now = new Date();
    const trackingCode = generateTrackingCode();
    const categoryId = orderData.typeId || 'mariage';
    let paletteId = orderData.paletteId || orderData.fields?.paletteId;
    let paletteSnapshot = undefined;

    if (categoryId === 'deuil') {
      // Le deuil n'a pas de palette : ses cartes utilisent toujours le fond Nuit #15151B
      if (paletteId && paletteId !== 'deuil') {
        throw new Error("Validation rejetée : les cartes de deuil n'autorisent aucune palette festive.");
      }
      paletteId = undefined;
    } else {
      const allowedCategory = CATEGORY_PALETTE_MAP[categoryId];
      if (!paletteId) {
        // Par défaut, sélectionner la première palette de la catégorie
        const defaultPalette = PALETTES.find((p) => p.categorie === allowedCategory);
        paletteId = defaultPalette?.id || 'champagne-rose';
      }

      const palette = getPaletteById(paletteId);
      if (!palette) {
        throw new Error(`Validation rejetée : palette inconnue "${paletteId}".`);
      }

      if (palette.categorie !== allowedCategory) {
        throw new Error(
          `Validation rejetée : la palette "${palette.nom}" (${palette.categorie}) n'appartient pas à la catégorie autorisée "${allowedCategory}" pour ce type d'événement.`
        );
      }

      // Le serveur recopie les codes couleur depuis config/palettes.ts
      paletteSnapshot = {
        id: palette.id,
        name: palette.nom,
        category: palette.categorie,
        ...palette.tokens,
      };
    }

    const newOrder: Order = {
      id: 'ord-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      trackingCode,
      tier: orderData.tier || 'simple',
      typeId: categoryId,
      typeName: orderData.typeName || 'Invitation',
      templateId: orderData.templateId || 'm-simple-1',
      templateName: orderData.templateName || 'Modèle Créa',
      paletteId,
      paletteSnapshot,
      amountXOF: orderData.amountXOF || (orderData.tier === 'vip' ? 7500 : 2500),
      status: 'en_attente_paiement',
      customerName: orderData.customerName || '',
      whatsapp: orderData.whatsapp || '',
      fields: {
        customerName: '',
        whatsapp: '',
        eventCountry: 'Bénin',
        eventCity: '',
        eventDate: '',
        eventTime: '',
        timezone: 'GMT+1',
        venueName: '',
        venueAddress: '',
        venueCity: '',
        mainMessage: '',
        specifics: {},
        paletteId,
        ...(orderData.fields || {}),
      },
      assets: orderData.assets || [],
      deliveries: [],
      createdAt: now.toISOString(),
      isNotifiedOnWhatsApp: false,
      hasReview: false,
    };
    return this.saveOrder(newOrder);
  }

  static processPayment(orderId: string, paymentMethod: PaymentMethod): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    const paidAtDate = new Date();
    const dueAtDate = new Date(paidAtDate.getTime() + 24 * 3600 * 1000); // exactly 24 calendar hours!

    order.status = 'payee';
    order.paymentMethod = paymentMethod;
    order.paymentTransactionId = `FEDAPAY_${paymentMethod.toUpperCase()}_${Date.now()}`;
    order.paidAt = paidAtDate.toISOString();
    order.dueAt = dueAtDate.toISOString();

    this.saveOrder(order);
    return order;
  }

  static updateOrderStatus(orderId: string, newStatus: Order['status']): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = newStatus;
    if (newStatus === 'livree' && !order.deliveredAt) {
      order.deliveredAt = new Date().toISOString();
    }
    this.saveOrder(order);
    return order;
  }

  static deliverOrder(orderId: string, deliveries: DeliveryFile[]): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.status = 'livree';
    order.deliveredAt = new Date().toISOString();
    order.deliveries = [...order.deliveries, ...deliveries];
    this.saveOrder(order);
    return order;
  }

  static markWhatsAppNotified(orderId: string): Order | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order) return null;

    order.isNotifiedOnWhatsApp = true;
    order.notifiedAt = new Date().toISOString();
    this.saveOrder(order);
    return order;
  }

  // REVIEWS
  static getReviews(onlyPublished = false): Review[] {
    if (!this.isBrowser) return INITIAL_REVIEWS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.REVIEWS);
      let list: Review[] = data ? JSON.parse(data) : INITIAL_REVIEWS;
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(INITIAL_REVIEWS));
      }
      if (onlyPublished) {
        return list.filter((r) => r.status === 'published');
      }
      return list;
    } catch {
      return INITIAL_REVIEWS;
    }
  }

  static submitReview(orderId: string, rating: number, comment: string): Review | null {
    const orders = this.getOrders();
    const order = orders.find((o) => o.id === orderId);
    if (!order || order.hasReview) return null;

    const review: Review = {
      id: 'rev-' + Date.now(),
      orderId: order.id,
      trackingCode: order.trackingCode,
      customerName: order.customerName || 'Client Créa',
      tier: order.tier,
      cardName: `${order.typeName} (${order.templateName})`,
      rating: Math.min(5, Math.max(1, rating)),
      comment: comment.slice(0, 200),
      status: 'pending', // Arrive d'abord en attente chez l'admin (Section 5.2)
      createdAt: new Date().toISOString(),
    };

    const reviews = this.getReviews(false);
    reviews.unshift(review);
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));

    order.hasReview = true;
    order.status = 'notee';
    this.saveOrder(order);

    return review;
  }

  static updateReviewStatus(reviewId: string, status: 'published' | 'hidden' | 'pending'): void {
    const reviews = this.getReviews(false);
    const rev = reviews.find((r) => r.id === reviewId);
    if (rev) {
      rev.status = status;
      if (status === 'published') rev.publishedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews));
    }
  }

  // SETTINGS
  static getSettings(): AppSettings {
    if (!this.isBrowser) return DEFAULT_SETTINGS;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) {
        localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
        return DEFAULT_SETTINGS;
      }
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: AppSettings): void {
    if (!this.isBrowser) return;
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }

  // FAILED SEARCHES LOGGING (Section 5.3 & 6.2)
  static logSearch(query: string, hadResults: boolean): void {
    if (!this.isBrowser || hadResults || !query || query.trim().length < 2) return;
    try {
      const norm = query.trim().toLowerCase();
      const data = localStorage.getItem(STORAGE_KEYS.SEARCHES);
      const list: FailedSearch[] = data ? JSON.parse(data) : [];
      const existing = list.find((item) => item.query === norm);
      if (existing) {
        existing.count += 1;
        existing.lastSearchedAt = new Date().toISOString();
      } else {
        list.unshift({
          query: norm,
          count: 1,
          lastSearchedAt: new Date().toISOString(),
        });
      }
      localStorage.setItem(STORAGE_KEYS.SEARCHES, JSON.stringify(list));
    } catch {
      // ignore
    }
  }

  static getFailedSearches(): FailedSearch[] {
    if (!this.isBrowser) return [];
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SEARCHES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // DRAFT FOR AUTO-SAVE (Section 6.3 & 7.6)
  static saveDraft(draft: any): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(STORAGE_KEYS.DRAFT, JSON.stringify(draft));
    } catch {
      // ignore
    }
  }

  static getDraft(): any | null {
    if (!this.isBrowser) return null;
    try {
      const data = localStorage.getItem(STORAGE_KEYS.DRAFT);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  static clearDraft(): void {
    if (!this.isBrowser) return;
    localStorage.removeItem(STORAGE_KEYS.DRAFT);
  }

  // LOGIN ATTEMPTS RATE LIMIT (Section 7.5: max 5 tries per 15 min)
  static recordLoginAttempt(success: boolean): { allowed: boolean; remaining: number } {
    if (!this.isBrowser) return { allowed: true, remaining: 5 };
    const now = Date.now();
    const WINDOW_MS = 15 * 60 * 1000;
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
      let attempts: number[] = raw ? JSON.parse(raw) : [];
      // Clean older than 15 minutes
      attempts = attempts.filter((t) => now - t < WINDOW_MS);

      if (success) {
        localStorage.removeItem(STORAGE_KEYS.LOGIN_ATTEMPTS);
        return { allowed: true, remaining: 5 };
      }

      if (attempts.length >= 5) {
        return { allowed: false, remaining: 0 };
      }

      attempts.push(now);
      localStorage.setItem(STORAGE_KEYS.LOGIN_ATTEMPTS, JSON.stringify(attempts));
      return { allowed: true, remaining: Math.max(0, 5 - attempts.length) };
    } catch {
      return { allowed: true, remaining: 5 };
    }
  }
}

// Client image compressor: scale long edge to 1600px, quality 80%, target < 500 KB (Section 6.3)
export async function compressImageFile(file: File): Promise<{ dataUrl: string; size: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const MAX_DIM = 1600;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_DIM) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          }
        } else {
          if (height > MAX_DIM) {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve({ dataUrl: e.target?.result as string, size: file.size });
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const approximateSize = Math.round((dataUrl.length * 3) / 4);
        resolve({ dataUrl, size: approximateSize });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
