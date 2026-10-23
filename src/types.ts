import { PaletteCategory, PaletteTokens } from './config/palettes';

export type { PaletteCategory, PaletteTokens };

export type OrderTier = 'simple' | 'vip';

export type OrderStatus =
  | 'brouillon'
  | 'en_attente_paiement'
  | 'payee'
  | 'en_creation'
  | 'livree'
  | 'notee'
  | 'expiree'
  | 'annulee'
  | 'remboursee';

export type PaymentMethod = 'mtn' | 'moov' | 'orange' | 'wave' | 'card';

export interface Milestone {
  title: string;
  date: string;
  description: string;
}

export interface ScheduleItem {
  time: string;
  label: string;
  detail?: string;
}

export interface OrderAsset {
  id: string;
  name: string;
  dataUrl: string;
  size: number;
  type: string;
  kind: 'photo' | 'logo';
}

export interface DeliveryFile {
  id: string;
  kind: 'pdf' | 'png' | 'story' | 'vip_link';
  title: string;
  url: string;
  fileName?: string;
  createdAt: string;
}

export interface OrderFields {
  // Common fields (Section 4.8)
  customerName: string;
  whatsapp: string;
  eventCountry: string;
  eventCity: string;
  eventDate: string;
  eventTime: string;
  timezone: string;
  venueName: string;
  venueAddress: string;
  venueCity: string;
  googleMapsUrl?: string;
  mainMessage: string; // max 300 chars
  paletteChoice?: string;
  paletteId?: string; // Stable slug (ex: "champagne-rose")
  notes?: string;

  // Specific fields
  specifics: Record<string, string>;

  // VIP additional fields (Section 4.9)
  hashtag?: string;
  storyMilestones?: Milestone[];
  schedule?: ScheduleItem[];
  dressCodeTitle?: string;
  dressCodeColors?: string[]; // 3 colors
  rsvpDeadline?: string;
  footerMessage?: string;
  ambientMusic?: boolean;
}

export interface Order {
  id: string;
  trackingCode: string; // Format CR-XXXX-XX
  tier: OrderTier;
  typeId: string;
  typeName: string;
  templateId: string;
  templateName: string;
  paletteId?: string; // Slug stable
  paletteSnapshot?: PaletteTokens & { id: string; name: string; category: string }; // Copie figée à la commande
  amountXOF: number;
  status: OrderStatus;
  customerName: string;
  whatsapp: string;
  fields: OrderFields;
  assets: OrderAsset[];
  deliveries: DeliveryFile[];
  paymentMethod?: PaymentMethod;
  paymentTransactionId?: string;
  createdAt: string;
  paidAt?: string;
  dueAt?: string; // 24 hours after paidAt
  deliveredAt?: string;
  isNotifiedOnWhatsApp?: boolean;
  notifiedAt?: string;
  hasReview?: boolean;
}

export interface Review {
  id: string;
  orderId: string;
  trackingCode: string;
  customerName: string;
  tier: OrderTier;
  cardName: string;
  rating: number; // 1 to 5
  comment: string;
  status: 'pending' | 'published' | 'hidden';
  createdAt: string;
  publishedAt?: string;
}

export interface AppSettings {
  simplePriceXOF: number;
  vipPriceXOF: number;
  maxDailyOrders: number;
  pauseMode: boolean;
  pauseMessage: string;
  adminWhatsApp: string;
  wcagContrastRules: {
    minTextContrast: number;     // 4.5:1
    minHeadingContrast: number;  // 3.0:1
  };
  whatsappTemplates: {
    invitationReady: string;
    missingInfo: string;
    reviewReminder: string;
    rsvpGuest: string;
  };
  greetings: Record<string, { title: string; message: string }>;
}

export interface FailedSearch {
  query: string;
  count: number;
  lastSearchedAt: string;
}

export interface CardVariant {
  id: string;
  name: string;
  shortDesc: string;
  specificFieldLabels: { key: string; label: string; placeholder?: string; required?: boolean }[];
}

export interface CardCategory {
  id: string;
  name: string;
  slug: string;
  greetingTitle: string;
  greetingMessage: string;
  isDarkThemeOnly?: boolean; // Fond Nuit pour deuil
  allowedPaletteCategory?: PaletteCategory | null; // Catégorie autorisée pour les palettes
  keywords: string[];
  variants: CardVariant[];
  palettes: { name: string; colors: [string, string, string] }[];
  templates: {
    id: string;
    name: string;
    tier: OrderTier;
    subtitle: string;
    backgroundGradient: string;
    textColor: string;
    accentColor: string;
    sampleNames: string[];
    sampleDate: string;
  }[];
}
