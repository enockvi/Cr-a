export type PaletteCategory =
  | 'Mariage et couple'
  | 'Naissance et famille'
  | 'Religion'
  | 'Fêtes et anniversaires'
  | 'Entreprise et études';

export interface PaletteTokens {
  bg: string;      // Fond général de l'invitation
  card: string;    // Fond de la carte ou panneau
  text: string;    // Couleur du texte principal
  muted: string;   // Texte atténué / secondaire
  border: string;  // Bordures et séparateurs
  accent1: string; // Accent primaire / gradient start
  accent2: string; // Accent secondaire / gradient end
  textOnAccent: '#FFFFFF' | '#141413'; // Calculé automatiquement pour respecter le contraste WCAG
}

export interface ColorPalette {
  id: string; // Slug stable unique (ex: "champagne-rose")
  nom: string;
  ambiance: string;
  categorie: PaletteCategory;
  tokens: PaletteTokens;
}

// Relative luminance & contrast ratio according to WCAG standards
const parseHex = (hex: string): number[] => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

const getRelativeLuminance = (hex: string): number => {
  const [r, g, b] = parseHex(hex).map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

export const calculateContrastRatio = (colorA: string, colorB: string): number => {
  const l1 = getRelativeLuminance(colorA);
  const l2 = getRelativeLuminance(colorB);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
};

export const calculateButtonTextColor = (accent1: string, accent2: string): '#FFFFFF' | '#141413' => {
  const minRatio = (target: string) =>
    Math.min(calculateContrastRatio(target, accent1), calculateContrastRatio(target, accent2));
  const whiteRatio = minRatio('#FFFFFF');
  const darkRatio = minRatio('#141413');
  return whiteRatio >= darkRatio ? '#FFFFFF' : '#141413';
};

// Les 10 palettes officielles Créa v2 (fichier crea-palettes-v2.html)
export const PALETTES: ColorPalette[] = [
  // 1. Mariage et couple
  {
    id: 'champagne-rose',
    nom: 'Champagne Rosé',
    ambiance: 'Doux, romantique, sobre',
    categorie: 'Mariage et couple',
    tokens: {
      bg: '#FBF6F3',
      card: '#FFFFFF',
      text: '#3D2B2B',
      muted: '#7A6260',
      border: '#EFE3DE',
      accent1: '#B76E79',
      accent2: '#D8A7A0',
      textOnAccent: calculateButtonTextColor('#B76E79', '#D8A7A0'),
    },
  },
  {
    id: 'or-ivoire',
    nom: 'Or et Ivoire',
    ambiance: 'Élégant, traditionnel',
    categorie: 'Mariage et couple',
    tokens: {
      bg: '#FBF8F1',
      card: '#FFFFFF',
      text: '#2E2A22',
      muted: '#6E6553',
      border: '#EDE6D6',
      accent1: '#B8912F',
      accent2: '#D9B65A',
      textOnAccent: calculateButtonTextColor('#B8912F', '#D9B65A'),
    },
  },

  // 2. Naissance et famille
  {
    id: 'aube-douce',
    nom: 'Aube Douce',
    ambiance: 'Tendre, apaisant',
    categorie: 'Naissance et famille',
    tokens: {
      bg: '#F5F9FC',
      card: '#FFFFFF',
      text: '#1F3A4D',
      muted: '#5B7283',
      border: '#E1EBF2',
      accent1: '#7FB3D5',
      accent2: '#A9D6E5',
      textOnAccent: calculateButtonTextColor('#7FB3D5', '#A9D6E5'),
    },
  },
  {
    id: 'peche-sauge',
    nom: 'Pêche et Sauge',
    ambiance: 'Chaleureux, naturel',
    categorie: 'Naissance et famille',
    tokens: {
      bg: '#FBF7F2',
      card: '#FFFFFF',
      text: '#3A3026',
      muted: '#6E6253',
      border: '#EFE7DC',
      accent1: '#E8A87C',
      accent2: '#9CAF88',
      textOnAccent: calculateButtonTextColor('#E8A87C', '#9CAF88'),
    },
  },

  // 3. Religion
  {
    id: 'olive-sacree',
    nom: 'Olive Sacrée',
    ambiance: 'Recueilli, paisible',
    categorie: 'Religion',
    tokens: {
      bg: '#F7F8F3',
      card: '#FFFFFF',
      text: '#2C3322',
      muted: '#5D6650',
      border: '#E5E9DA',
      accent1: '#6B7F3A',
      accent2: '#A3B36B',
      textOnAccent: calculateButtonTextColor('#6B7F3A', '#A3B36B'),
    },
  },
  {
    id: 'bleu-ciel-sacre',
    nom: 'Bleu Ciel Sacré',
    ambiance: 'Clair, solennel',
    categorie: 'Religion',
    tokens: {
      bg: '#F4F8FC',
      card: '#FFFFFF',
      text: '#1B2F4B',
      muted: '#566B85',
      border: '#DFE8F2',
      accent1: '#3A6EA5',
      accent2: '#8DB8E0',
      textOnAccent: calculateButtonTextColor('#3A6EA5', '#8DB8E0'),
    },
  },

  // 4. Fêtes et anniversaires
  {
    id: 'corail-festif',
    nom: 'Corail Festif',
    ambiance: 'Joyeux, vivant',
    categorie: 'Fêtes et anniversaires',
    tokens: {
      bg: '#FFF7F2',
      card: '#FFFFFF',
      text: '#3B2118',
      muted: '#7A5646',
      border: '#F6E4DA',
      accent1: '#F26B5B',
      accent2: '#FFB347',
      textOnAccent: calculateButtonTextColor('#F26B5B', '#FFB347'),
    },
  },
  {
    id: 'pourpre-fete',
    nom: 'Pourpre Fête',
    ambiance: 'Festif, sophistiqué',
    categorie: 'Fêtes et anniversaires',
    tokens: {
      bg: '#FAF6FD',
      card: '#FFFFFF',
      text: '#2D1B45',
      muted: '#63507A',
      border: '#EEE6F7',
      accent1: '#7B2CBF',
      accent2: '#C77DFF',
      textOnAccent: calculateButtonTextColor('#7B2CBF', '#C77DFF'),
    },
  },

  // 5. Entreprise et études
  {
    id: 'ardoise-sobre',
    nom: 'Ardoise Sobre',
    ambiance: 'Net, professionnel',
    categorie: 'Entreprise et études',
    tokens: {
      bg: '#F3F5F8',
      card: '#FFFFFF',
      text: '#1C2A3A',
      muted: '#51606F',
      border: '#DDE3EA',
      accent1: '#1F4E79',
      accent2: '#3C7DBA',
      textOnAccent: calculateButtonTextColor('#1F4E79', '#3C7DBA'),
    },
  },
  {
    id: 'vert-croissance',
    nom: 'Vert Croissance',
    ambiance: 'Frais, dynamique',
    categorie: 'Entreprise et études',
    tokens: {
      bg: '#F4F8F5',
      card: '#FFFFFF',
      text: '#173A2A',
      muted: '#4F6B5C',
      border: '#DCE9E0',
      accent1: '#1E7B4F',
      accent2: '#4CAF7A',
      textOnAccent: calculateButtonTextColor('#1E7B4F', '#4CAF7A'),
    },
  },
];

// Deuil n'a pas de palette : fond sombre Nuit réservé
export const DEUIL_TOKENS: PaletteTokens = {
  bg: '#15151B',
  card: '#1F1F27',
  text: '#D5D5DC',
  muted: '#8E8E9A',
  border: '#2E2E38',
  accent1: '#3A3A46',
  accent2: '#525260',
  textOnAccent: '#FFFFFF',
};

// Map each event category ID to the associated palette category
export const CATEGORY_PALETTE_MAP: Record<string, PaletteCategory | null> = {
  mariage: 'Mariage et couple',
  naissance: 'Naissance et famille',
  religion: 'Religion',
  anniv: 'Fêtes et anniversaires',
  diplome: 'Entreprise et études',
  pro: 'Entreprise et études',
  deuil: null, // Deuil n'a AUCUNE palette
};

// Retrieve palette by ID
export function getPaletteById(id: string): ColorPalette | undefined {
  return PALETTES.find((p) => p.id === id);
}

// Retrieve all palettes authorized for a given category id
export function getPalettesForCategory(categoryId: string): ColorPalette[] {
  const paletteCategory = CATEGORY_PALETTE_MAP[categoryId];
  if (!paletteCategory) return [];
  return PALETTES.filter((p) => p.categorie === paletteCategory);
}

// Validation function verifying WCAG contrast compliance
export function validateWCAGContrast(palette: ColorPalette): {
  textOnBg: { ratio: number; pass: boolean };
  textOnCard: { ratio: number; pass: boolean };
  largeTextOnBg: { ratio: number; pass: boolean };
} {
  const rBg = calculateContrastRatio(palette.tokens.text, palette.tokens.bg);
  const rCard = calculateContrastRatio(palette.tokens.text, palette.tokens.card);

  return {
    textOnBg: { ratio: rBg, pass: rBg >= 4.5 },
    textOnCard: { ratio: rCard, pass: rCard >= 4.5 },
    largeTextOnBg: { ratio: rBg, pass: rBg >= 3.0 },
  };
}
