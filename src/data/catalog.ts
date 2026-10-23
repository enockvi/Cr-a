import { CardCategory, AppSettings, Review } from '../types';
import { PALETTES, validateWCAGContrast } from '../config/palettes';

export const DEFAULT_SETTINGS: AppSettings = {
  simplePriceXOF: 2500,
  vipPriceXOF: 7500,
  maxDailyOrders: 30,
  pauseMode: false,
  pauseMessage: "Créa fait une courte pause technique pour peaufiner les commandes en cours. Nous rouvrons très rapidement !",
  adminWhatsApp: "+22990000000",
  wcagContrastRules: {
    minTextContrast: 4.5,    // 4.5:1 pour le texte normal (WCAG AA)
    minHeadingContrast: 3.0, // 3:1 pour les grands titres
  },
  whatsappTemplates: {
    invitationReady:
      "Bonjour [Prénom], votre invitation Créa est prête. Connectez-vous avec votre numéro et votre code de suivi [CODE] pour la télécharger : [LIEN]. Vous pourrez ensuite la noter. Merci de votre confiance !",
    missingInfo:
      "Bonjour [Prénom], pour finaliser votre invitation Créa ([CODE]), il nous manque : [INFO]. Pouvez-vous nous répondre ici ? Le délai de 24 h reste en cours.",
    reviewReminder:
      "Bonjour [Prénom], votre invitation vous a plu ? Votre avis nous aide beaucoup : notez-la dans votre espace Créa avec votre code [CODE].",
    rsvpGuest:
      "Bonjour, je confirme ma présence à [EVENEMENT]. Je serai [NOMBRE] personne(s).",
  },
  greetings: {
    mariage: {
      title: "Quelle belle nouvelle !",
      message: "Tous nos vœux de bonheur pour ce grand jour. Créons ensemble une invitation à la hauteur de votre histoire.",
    },
    naissance: {
      title: "Quelle joie pour votre famille !",
      message: "Nous sommes heureux pour vous et pour le nouveau-né. Choisissons la carte qui accompagnera ce beau jour.",
    },
    religion: {
      title: "Un beau moment de foi et de famille.",
      message: "Nous nous réjouissons avec vous pour ce moment sacré. Voici des modèles pleins de douceur et de sérénité.",
    },
    anniversaire: {
      title: "Joyeux anniversaire à vous, par anticipation !",
      message: "Que cette nouvelle année de vie soit belle. Préparons une invitation qui donne envie de faire la fête.",
    },
    deuil: {
      title: "Nous vous présentons nos sincères condoléances.",
      message: "Prenez votre temps. Nous vous aidons à préparer cette carte avec respect et délicatesse.",
    },
    etudes: {
      title: "Toutes nos félicitations !",
      message: "Nous vous souhaitons nos sincères félicitations pour ce parcours mémorable. Faisons de ce jour une fête à la mesure de vos efforts.",
    },
    pro: {
      title: "Un événement marquant pour votre activité.",
      message: "Donnez une dimension remarquable à votre projet avec une invitation distinguée et mémorable.",
    },
  },
};

export const CATALOG: CardCategory[] = [
  // 1. MARIAGE ET COUPLE (5 types)
  {
    id: 'mariage',
    name: 'Mariage et couple',
    slug: 'mariage',
    greetingTitle: 'Quelle belle nouvelle !',
    greetingMessage: 'Tous nos vœux de bonheur pour ce grand jour. Créons ensemble une invitation à la hauteur de votre histoire.',
    isDarkThemeOnly: false,
    allowedPaletteCategory: 'Mariage et couple',
    keywords: [
      'mariage', 'marier', 'dot', 'coutumier', 'fiancailles', 'fiancer',
      'noces', 'couple', 'epoux', 'maries', 'remerciements'
    ],
    palettes: [
      { name: 'Rose Poudré & Or', colors: ['#FCEFE6', '#F6D5D9', '#8A3B57'] },
      { name: 'Lagune & Ivoire', colors: ['#E3F3F4', '#B8E0E3', '#0A5F67'] },
      { name: 'Sable Doré', colors: ['#FFF8ED', '#F6E6C9', '#7A4B00'] },
      { name: 'Émeraude & Champagne', colors: ['#EBF8F2', '#CDEFD9', '#1A5A35'] },
    ],
    variants: [
      {
        id: 'faire_part_mariage',
        name: 'Faire-part de mariage',
        shortDesc: 'Cérémonie civile, religieuse et banquet',
        specificFieldLabels: [
          { key: 'brideGroomNames', label: 'Prénoms des mariés', placeholder: 'Ex. Sènami & Rodrigue', required: true },
          { key: 'families', label: 'Noms des familles des mariés', placeholder: 'Familles ADJOVI et KOFFI' },
          { key: 'religiousVenue', label: 'Lieu de la célébration religieuse (optionnel)', placeholder: 'Paroisse St-Michel de Cotonou' },
          { key: 'receptionVenue', label: 'Lieu du vin d’honneur / banquet', placeholder: 'Palais des Congrès' },
        ],
      },
      {
        id: 'mariage_civil',
        name: 'Invitation au mariage civil',
        shortDesc: 'Célébration à la mairie',
        specificFieldLabels: [
          { key: 'brideGroomNames', label: 'Prénoms des futurs époux', placeholder: 'Ex. Aïcha & Koffi', required: true },
          { key: 'townHall', label: 'Mairie et salle', placeholder: 'Mairie de Cocody, Abidjan' },
          { key: 'civilHour', label: 'Heure précise du passage', placeholder: '10h30' },
        ],
      },
      {
        id: 'mariage_religieux',
        name: 'Invitation au mariage religieux',
        shortDesc: 'Bénédiction nuptiale à l’église, mosquée ou temple',
        specificFieldLabels: [
          { key: 'brideGroomNames', label: 'Prénoms des époux', placeholder: 'Ex. Mireille & Hervé', required: true },
          { key: 'placeOfWorship', label: 'Lieu de culte', placeholder: 'Cathédrale Notre-Dame' },
          { key: 'officiant', label: 'Nom du célébrant / officiant (optionnel)' },
        ],
      },
      {
        id: 'dot_coutumier',
        name: 'Invitation à la dot / mariage coutumier',
        shortDesc: 'Cérémonie traditionnelle en famille',
        specificFieldLabels: [
          { key: 'brideGroomNames', label: 'Prénoms du couple', placeholder: 'Ex. Nadège & Fabrice', required: true },
          { key: 'families', label: 'Familles organisatrices', placeholder: 'Familles HOUESSOU et DOSSOU' },
          { key: 'villageCity', label: 'Village, concession ou ville', placeholder: 'Porto-Novo' },
          { key: 'customsSchedule', label: 'Programme coutumier', placeholder: 'Remise des présents, bénédiction des aïeux' },
        ],
      },
      {
        id: 'remerciements_mariage',
        name: 'Remerciements après mariage',
        shortDesc: 'Témoigner votre gratitude à vos proches',
        specificFieldLabels: [
          { key: 'coupleNames', label: 'Prénoms des mariés', placeholder: 'Ex. Sènami & Rodrigue', required: true },
          { key: 'gratitudeMessage', label: 'Votre mot de remerciement', placeholder: 'Merci d’avoir partagé notre joie...' },
        ],
      },
    ],
    templates: [
      {
        id: 'm-simple-1',
        name: 'Aïcha & Koffi',
        tier: 'simple',
        subtitle: 'Palette Rose Poudré & Or',
        backgroundGradient: 'linear-gradient(160deg, #FCEFE6, #F6D5D9)',
        textColor: '#8A3B57',
        accentColor: '#FFB020',
        sampleNames: ['Aïcha & Koffi', 'Sènami & Rodrigue', 'Nadège & Fabrice'],
        sampleDate: '12 décembre 2026',
      },
      {
        id: 'm-simple-2',
        name: 'Brise Côtière',
        tier: 'simple',
        subtitle: 'Nuances Lagune & Sable',
        backgroundGradient: 'linear-gradient(160deg, #E3F3F4, #CFEDF0)',
        textColor: '#0A5F67',
        accentColor: '#0E7C86',
        sampleNames: ['Mireille & Hervé', 'Esther & Brice'],
        sampleDate: '24 janvier 2027',
      },
      {
        id: 'm-vip-1',
        name: 'Sènami & Rodrigue VIP',
        tier: 'vip',
        subtitle: 'Page animée avec enveloppe & RSVP WhatsApp',
        backgroundGradient: 'linear-gradient(170deg, #F3EAFE, #D9C9F7)',
        textColor: '#4B2A8F',
        accentColor: '#FFB020',
        sampleNames: ['Sènami & Rodrigue', 'Aïcha & Koffi'],
        sampleDate: '18 avril 2027',
      },
    ],
  },

  // 2. NAISSANCE ET FAMILLE (2 types)
  {
    id: 'naissance',
    name: 'Naissance et famille',
    slug: 'naissance',
    greetingTitle: 'Quelle joie pour votre famille !',
    greetingMessage: 'Nous sommes heureux pour vous et pour le nouveau-né. Choisissons la carte qui accompagnera ce beau jour.',
    isDarkThemeOnly: false,
    allowedPaletteCategory: 'Naissance et famille',
    keywords: [
      'bapteme', 'baptiser', 'gender', 'reveal', 'sexe', 'bebe', 'nouveau-ne', 'nouveau', 'ne', 'enfant'
    ],
    palettes: [
      { name: 'Ciel Doux', colors: ['#E8F4F8', '#CFE6F3', '#1F5F86'] },
      { name: 'Abricot Tendre', colors: ['#FFF0E6', '#FDD8BF', '#8F4512'] },
      { name: 'Menthe d’Eau', colors: ['#EDF8F4', '#CEEFE2', '#1E644A'] },
    ],
    variants: [
      {
        id: 'bapteme',
        name: 'Baptême',
        shortDesc: 'Cérémonie religieuse et fête de baptême',
        specificFieldLabels: [
          { key: 'childName', label: 'Prénom de l’enfant', placeholder: 'Noé', required: true },
          { key: 'church', label: 'Église ou paroisse', placeholder: 'Paroisse St-Jean, Cotonou' },
          { key: 'godparents', label: 'Parrain et Marraine (optionnel)', placeholder: 'Parrain Rodrigue & Marraine Léa' },
          { key: 'reception', label: 'Lieu du repas de fête' },
        ],
      },
      {
        id: 'gender_reveal',
        name: 'Annonce du sexe de bébé (gender reveal)',
        shortDesc: 'Révélation festive du sexe de bébé',
        specificFieldLabels: [
          { key: 'parentsNames', label: 'Prénoms des parents', placeholder: 'Mireille & Fabrice', required: true },
          { key: 'colorTheme', label: 'Thème et couleurs (ex. Rose & Bleu pastel)' },
          { key: 'eventDetails', label: 'Heure et lieu de la révélation' },
        ],
      },
    ],
    templates: [
      {
        id: 'n-simple-1',
        name: 'Baptême de Noé',
        tier: 'simple',
        subtitle: 'Douceur Ciel & Nuage',
        backgroundGradient: 'linear-gradient(160deg, #E8F4F8, #CFE6F3)',
        textColor: '#1F5F86',
        accentColor: '#FFB020',
        sampleNames: ['Noé', 'Ézéchiel', 'Grâce'],
        sampleDate: '3 janvier 2027',
      },
      {
        id: 'n-vip-1',
        name: 'Éveil Radieux VIP',
        tier: 'vip',
        subtitle: 'Page interactive avec diaporama de naissance',
        backgroundGradient: 'linear-gradient(170deg, #E9F6FB, #C6E9F6)',
        textColor: '#165070',
        accentColor: '#2FB36D',
        sampleNames: ['Noé', 'Aurore'],
        sampleDate: '28 mars 2027',
      },
    ],
  },

  // 3. RELIGION (6 types)
  {
    id: 'religion',
    name: 'Religion',
    slug: 'religion',
    greetingTitle: 'Un beau moment de foi et de famille.',
    greetingMessage: 'Nous nous réjouissons avec vous pour ce moment sacré. Voici des modèles pleins de douceur et de sérénité.',
    isDarkThemeOnly: false,
    allowedPaletteCategory: 'Religion',
    keywords: [
      'communion', 'premiere', 'confirmation', 'veillee', 'retraite', 'priere',
      'culte', 'special', 'fete', 'religieuse', 'noel', 'paques', 'aid',
      'retour', 'pelerinage', 'hajj', 'mecque', 'eglise', 'mosquee', 'paroisse'
    ],
    palettes: [
      { name: 'Lumière Dorée', colors: ['#FFFBEF', '#F4E7BE', '#7A5A12'] },
      { name: 'Blanc Pur & Bleu Sacré', colors: ['#F2F6FC', '#DAE5F7', '#1D4585'] },
      { name: 'Ocre & Rameaux', colors: ['#F6F8EE', '#DFE8C5', '#3E5514'] },
    ],
    variants: [
      {
        id: 'premiere_communion',
        name: 'Première communion',
        shortDesc: 'Partage de l’Eucharistie en famille',
        specificFieldLabels: [
          { key: 'childName', label: 'Prénom du / de la communiant(e)', placeholder: 'Marie-Claire', required: true },
          { key: 'parish', label: 'Paroisse et Ville', placeholder: 'Paroisse St-Augustin' },
          { key: 'receptionVenue', label: 'Lieu de la réception de fête' },
        ],
      },
      {
        id: 'confirmation',
        name: 'Confirmation',
        shortDesc: 'Sacrement de la maturité dans la foi',
        specificFieldLabels: [
          { key: 'confirmandName', label: 'Prénom du confirmé', placeholder: 'Joël', required: true },
          { key: 'parish', label: 'Paroisse', placeholder: 'Notre-Dame des Victoires' },
        ],
      },
      {
        id: 'veillee_priere',
        name: 'Veillée de prière / retraite',
        shortDesc: 'Rassemblement spirituel, méditation et louange',
        specificFieldLabels: [
          { key: 'theme', label: 'Thème spirituel de la veillée', placeholder: 'Dieu fera une voie là où il n’y en a point', required: true },
          { key: 'speakers', label: 'Intervenants / Prédicateurs' },
          { key: 'hours', label: 'Horaires précis' },
        ],
      },
      {
        id: 'culte_special',
        name: 'Culte spécial',
        shortDesc: 'Action de grâce, concert spirituel ou conférence',
        specificFieldLabels: [
          { key: 'eventTitle', label: 'Titre du culte spécial', placeholder: 'Culte d’action de grâce annuel', required: true },
          { key: 'officiants', label: 'Pasteur / Célébrant / Chorale invitée' },
          { key: 'entryNotice', label: 'Modalités d’entrée (Entrée libre, etc.)' },
        ],
      },
      {
        id: 'fete_religieuse',
        name: 'Fête religieuse (Noël, Pâques, Aïd)',
        shortDesc: 'Partage fraternel des grandes fêtes',
        specificFieldLabels: [
          { key: 'feastName', label: 'Nom de la fête', placeholder: 'Aïd al-Fitr / Noël en famille', required: true },
          { key: 'gatheringPlace', label: 'Lieu du rassemblement' },
        ],
      },
      {
        id: 'retour_pelerinage',
        name: 'Retour de pèlerinage (Hajj)',
        shortDesc: 'Accueil chaleureux du pèlerin et prière de bénédiction',
        specificFieldLabels: [
          { key: 'pilgrimName', label: 'Nom du Hadj / El Hadja', placeholder: 'El Hadj Ousmane', required: true },
          { key: 'welcomingVenue', label: 'Lieu de la cérémonie d’accueil' },
        ],
      },
    ],
    templates: [
      {
        id: 'r-simple-1',
        name: 'Première Communion Marie-Claire',
        tier: 'simple',
        subtitle: 'Élégance Dorée & Clarté',
        backgroundGradient: 'linear-gradient(160deg, #FFFBEF, #F4E7BE)',
        textColor: '#7A5A12',
        accentColor: '#FFB020',
        sampleNames: ['Marie-Claire', 'Joël', 'Prisca', 'Samuel'],
        sampleDate: '10 mai 2027',
      },
      {
        id: 'r-vip-1',
        name: 'Grâce Divine VIP',
        tier: 'vip',
        subtitle: 'Page animée avec textes de méditation & itinéraire',
        backgroundGradient: 'linear-gradient(170deg, #FBF8EE, #EFE4BF)',
        textColor: '#694D0C',
        accentColor: '#2FB36D',
        sampleNames: ['El Hadj Ousmane', 'Pasteur David'],
        sampleDate: '21 juin 2027',
      },
    ],
  },

  // 4. ANNIVERSAIRES ET FÊTES (2 types)
  {
    id: 'anniv',
    name: 'Anniversaires et fêtes',
    slug: 'anniversaire',
    greetingTitle: 'Joyeux anniversaire à vous, par anticipation !',
    greetingMessage: 'Que cette nouvelle année de vie soit belle. Préparons une invitation qui donne envie de faire la fête.',
    isDarkThemeOnly: false,
    allowedPaletteCategory: 'Fêtes et anniversaires',
    keywords: [
      'anniversaire', 'anniv', 'fete', 'birthday', 'ans', 'mariage', 'noces'
    ],
    palettes: [
      { name: 'Soleil Ambré', colors: ['#FFF4D6', '#FFE0A3', '#8A5A00'] },
      { name: 'Fête Tropicale', colors: ['#FFE9EE', '#FFCCD7', '#9E1C38'] },
      { name: 'Bleu Royal Festif', colors: ['#EEF3FB', '#D3E0F5', '#1B3B6F'] },
    ],
    variants: [
      {
        id: 'invitation_anniv',
        name: 'Carte d’invitation de fête d’anniversaire',
        shortDesc: 'Votre bougie soufflée entouré(e) de vos proches',
        specificFieldLabels: [
          { key: 'celebrantName', label: 'Prénom ou nom de la personne fêtée', placeholder: 'Fatou', required: true },
          { key: 'age', label: 'Âge fêté (facultatif)', placeholder: '30 ans' },
          { key: 'dressCode', label: 'Dress code ou consigne de tenue', placeholder: 'Chic et décontracté · Touche de jaune' },
        ],
      },
      {
        id: 'anniv_mariage',
        name: 'Anniversaire de mariage',
        shortDesc: 'Célébrer vos années d’amour et d’alliance',
        specificFieldLabels: [
          { key: 'coupleNames', label: 'Prénoms du couple', placeholder: 'Aïcha & Koffi', required: true },
          { key: 'yearsMarried', label: 'Nombre d’années d’union (noces d’or, argent...)', placeholder: '10 ans d’amour (Noces d’Étain)' },
          { key: 'receptionDetails', label: 'Lieu du banquet ou de la réception' },
        ],
      },
    ],
    templates: [
      {
        id: 'a-simple-1',
        name: 'Fatou, 30 ans',
        tier: 'simple',
        subtitle: 'Doré festif & chaleureux',
        backgroundGradient: 'linear-gradient(160deg, #FFF4D6, #FFE0A3)',
        textColor: '#8A5A00',
        accentColor: '#0E7C86',
        sampleNames: ['Fatou, 30 ans', 'Papa a 60 ans', 'Anniversaire de Sidoine'],
        sampleDate: '20 février 2027',
      },
      {
        id: 'a-vip-1',
        name: 'Jubilé & Noces VIP',
        tier: 'vip',
        subtitle: 'Page d’exception avec rétrospective & confirmation WhatsApp',
        backgroundGradient: 'linear-gradient(170deg, #FFF1D6, #FFD79A)',
        textColor: '#7A4B00',
        accentColor: '#2FB36D',
        sampleNames: ['Aïcha & Koffi, 10 ans', 'Papa Antoine, 60 ans'],
        sampleDate: '12 avril 2027',
      },
    ],
  },

  // 5. DEUIL (2 types - Seul univers au fond sombre « Nuit » #15151B)
  {
    id: 'deuil',
    name: 'Deuil',
    slug: 'deuil',
    greetingTitle: 'Nous vous présentons nos sincères condoléances.',
    greetingMessage: 'Prenez votre temps. Nous vous aidons à préparer cette carte avec respect et délicatesse.',
    isDarkThemeOnly: true,
    allowedPaletteCategory: null, // Deuil n'a AUCUNE palette (fond Nuit réservé)
    keywords: [
      'deces', 'decede', 'decedee', 'mort', 'mourir', 'deuil', 'obseques',
      'funerailles', 'veillee', 'enterrement', 'inhumation', 'condoleances',
      'hommage', 'memoire', 'remerciements'
    ],
    palettes: [
      { name: 'Nuit Sobre & Argent', colors: ['#15151B', '#23232C', '#D5D5DC'] },
      { name: 'Anthracite & Ivoire Sombre', colors: ['#1A1A22', '#2A2A36', '#E2E2EA'] },
    ],
    variants: [
      {
        id: 'faire_part_deces',
        name: 'Faire-part de décès',
        shortDesc: 'Annonce solennelle avec mention des familles',
        specificFieldLabels: [
          { key: 'deceasedName', label: 'Nom complet du cher défunt', placeholder: 'Feu Papa Antoine Agbo', required: true },
          { key: 'lifeDates', label: 'Années ou dates de naissance et de rappel à Dieu', placeholder: '1945 – 2026', required: true },
          { key: 'bereavedFamilies', label: 'Noms des familles éplorées', placeholder: 'Les familles AGBO, DOSSA, HOUESSOU...' },
          { key: 'ceremonyVenue', label: 'Lieu de la messe ou culte' },
        ],
      },
      {
        id: 'remerciements_deces',
        name: 'Remerciements des familles',
        shortDesc: 'Gratitude pour le réconfort et les marques de sympathie reçus',
        specificFieldLabels: [
          { key: 'deceasedName', label: 'En souvenir de', placeholder: 'Feu Jean-Baptiste Hounkpatin', required: true },
          { key: 'familyGratitude', label: 'Message des familles', placeholder: 'Très touchées par vos marques de sympathie...', required: true },
        ],
      },
    ],
    templates: [
      {
        id: 'd-simple-1',
        name: 'Jean-Baptiste Hounkpatin',
        tier: 'simple',
        subtitle: 'Fond Nuit sobre, bordure argentée',
        backgroundGradient: 'linear-gradient(170deg, #15151B, #23232C)',
        textColor: '#D5D5DC',
        accentColor: '#9A9AA6',
        sampleNames: ['Jean-Baptiste Hounkpatin', 'Mme Rose Dossou', 'Papa Antoine Agbo'],
        sampleDate: '1948 – 2026',
      },
      {
        id: 'd-vip-1',
        name: 'Hommage Solennel VIP',
        tier: 'vip',
        subtitle: 'Page épurée, fondu doux, programme et itinéraire sans compte à rebours',
        backgroundGradient: 'linear-gradient(170deg, #131317, #1E1E24)',
        textColor: '#ECECF0',
        accentColor: '#C0C0CB',
        sampleNames: ['Mme Rose Dossou', 'Jean-Baptiste Hounkpatin'],
        sampleDate: 'Samedi 21 novembre 2026',
      },
    ],
  },

  // 6. ÉTUDES ET CARRIÈRE (3 types)
  {
    id: 'diplome',
    name: 'Études et carrière',
    slug: 'diplome',
    greetingTitle: 'Toutes nos félicitations !',
    greetingMessage: 'Nous vous souhaitons nos sincères félicitations pour ce parcours mémorable. Faisons de ce jour une fête à la mesure de vos efforts.',
    isDarkThemeOnly: false,
    allowedPaletteCategory: 'Entreprise et études',
    keywords: [
      'diplome', 'diplomes', 'graduation', 'licence', 'master', 'bac',
      'soutenance', 'doctorat', 'universite', 'ecole', 'gala', 'promo'
    ],
    palettes: [
      { name: 'Bleu Académique & Or', colors: ['#EEF3FB', '#D3E0F5', '#25467A'] },
      { name: 'Lagune d’Honneur', colors: ['#E7F7F8', '#C3ECEE', '#0A5F67'] },
      { name: 'Pourpre d’Excellence', colors: ['#F7EEFB', '#EAD0F6', '#591B74'] },
    ],
    variants: [
      {
        id: 'remise_diplomes',
        name: 'Remise de diplômes',
        shortDesc: 'Cérémonie de collation des grades et fête de graduation',
        specificFieldLabels: [
          { key: 'graduateName', label: 'Votre nom complet', placeholder: 'Dieudonné HOUESSOU', required: true },
          { key: 'degreeTitle', label: 'Intitulé du diplôme', placeholder: 'Master en Finance & Banque', required: true },
          { key: 'institution', label: 'Université ou Grande École', placeholder: 'Université d’Abomey-Calavi' },
        ],
      },
      {
        id: 'soutenance',
        name: 'Soutenance',
        shortDesc: 'Présentation publique devant le jury de mémoire ou thèse',
        specificFieldLabels: [
          { key: 'candidateName', label: 'Nom de l’impétrant(e)', placeholder: 'Armelle K.', required: true },
          { key: 'thesisTopic', label: 'Sujet du mémoire / thèse', placeholder: 'Impact des technologies mobiles...', required: true },
          { key: 'juryRoom', label: 'Amphithéâtre ou salle' },
        ],
      },
      {
        id: 'gala_fin_annee',
        name: 'Gala ou fête de fin d’année scolaire',
        shortDesc: 'Soirée de promo, remise des prix et bal',
        specificFieldLabels: [
          { key: 'institutionName', label: 'Nom de l’école ou promotion', placeholder: 'Promotion 2026 - ENEAM', required: true },
          { key: 'galaTheme', label: 'Thème et programme de la soirée' },
          { key: 'venueDetails', label: 'Salle ou complexe de réception' },
        ],
      },
    ],
    templates: [
      {
        id: 'di-simple-1',
        name: 'Remise de diplôme Armelle',
        tier: 'simple',
        subtitle: 'Bleu Royal d’Excellence',
        backgroundGradient: 'linear-gradient(160deg, #EEF3FB, #D3E0F5)',
        textColor: '#25467A',
        accentColor: '#FFB020',
        sampleNames: ['Armelle', 'Dieudonné', 'Fiacre', 'Pascaline'],
        sampleDate: 'Samedi 19 juin 2027',
      },
      {
        id: 'di-vip-1',
        name: 'Excellence & Triomphe VIP',
        tier: 'vip',
        subtitle: 'Page animée avec parcours de réussite & RSVP',
        backgroundGradient: 'linear-gradient(170deg, #E6F3FB, #BCE0F7)',
        textColor: '#15416B',
        accentColor: '#2FB36D',
        sampleNames: ['Dr. Dieudonné Houessou', 'Armelle K.'],
        sampleDate: 'Samedi 3 juillet 2027',
      },
    ],
  },

  // 7. ENTREPRISE ET ÉVÉNEMENTS PROFESSIONNELS (4 types)
  {
    id: 'pro',
    name: 'Entreprise et événements professionnels',
    slug: 'pro',
    greetingTitle: 'Un événement marquant pour votre activité.',
    greetingMessage: 'Donnez une dimension remarquable à votre projet avec une invitation distinguée et mémorable.',
    isDarkThemeOnly: false,
    allowedPaletteCategory: 'Entreprise et études',
    keywords: [
      'inauguration', 'boutique', 'restaurant', 'ouverture', 'cocktail',
      'diner', 'gala', 'seminaire', 'conference', 'atelier', 'colloque'
    ],
    palettes: [
      { name: 'Lagune Signature', colors: ['#E3F3F4', '#B8E0E3', '#0A5F67'] },
      { name: 'Graphite & Cuivre', colors: ['#F4F4F6', '#DFDFE5', '#24242A'] },
      { name: 'Bronze Impérial', colors: ['#FFF8ED', '#F6E6C9', '#6B4500'] },
    ],
    variants: [
      {
        id: 'inauguration',
        name: 'Inauguration',
        shortDesc: 'Ouverture officielle de siège ou nouvelle succursale',
        specificFieldLabels: [
          { key: 'companyName', label: 'Nom de l’entreprise / marque', placeholder: 'Koffi & Partners', required: true },
          { key: 'eventNature', label: 'Nature des locaux inaugurés', placeholder: 'Nouveau siège social' },
          { key: 'specialGuests', label: 'Personnalités ou invités d’honneur attendus' },
        ],
      },
      {
        id: 'ouverture_boutique',
        name: 'Ouverture de boutique / de restaurant',
        shortDesc: 'Accueil des premiers clients et dégustation',
        specificFieldLabels: [
          { key: 'venueName', label: 'Nom de l’enseigne', placeholder: 'Restaurant Le Lagon', required: true },
          { key: 'openingOffer', label: 'Offre spéciale d’ouverture', placeholder: '-20% pour les 50 premiers arrivés' },
        ],
      },
      {
        id: 'cocktail_gala',
        name: 'Cocktail ou dîner de gala',
        shortDesc: 'Soirée de prestige avec partenaires d’affaires',
        specificFieldLabels: [
          { key: 'galaHost', label: 'Organisateur ou Entreprise', placeholder: 'Chambre de Commerce', required: true },
          { key: 'theme', label: 'Thème et dress code d’affaires', placeholder: 'Tenue de soirée chic' },
        ],
      },
      {
        id: 'seminaire_conference',
        name: 'Séminaire / conférence / atelier',
        shortDesc: 'Rencontre d’experts, formation et échanges',
        specificFieldLabels: [
          { key: 'conferenceTopic', label: 'Titre de la conférence', placeholder: 'Forum des PME 2027', required: true },
          { key: 'keynoteSpeakers', label: 'Intervenants principaux' },
          { key: 'entryFee', label: 'Tarif d’entrée ou mention Entrée Libre' },
        ],
      },
    ],
    templates: [
      {
        id: 'p-simple-1',
        name: 'Inauguration Prestige',
        tier: 'simple',
        subtitle: 'Lagune professionnelle & épurée',
        backgroundGradient: 'linear-gradient(160deg, #E3F3F4, #B8E0E3)',
        textColor: '#0A5F67',
        accentColor: '#FFB020',
        sampleNames: ['Gala Adjovi', 'Inauguration Océan', 'Fintech Summit'],
        sampleDate: '2 mai 2027',
      },
      {
        id: 'p-vip-1',
        name: 'Gala d’Affaires VIP',
        tier: 'vip',
        subtitle: 'Page interactive avec programme détaillé et RSVP direct',
        backgroundGradient: 'linear-gradient(170deg, #F0F7F7, #CDE9EB)',
        textColor: '#07484F',
        accentColor: '#2FB36D',
        sampleNames: ['Banquet Annuel BIDC', 'Soirée Partenaires'],
        sampleDate: '20 mai 2027',
      },
    ],
  },
];

// Vérification de contraste WCAG au chargement du catalogue
export function verifyAllPalettesContrast(): boolean {
  let allPass = true;
  for (const pal of PALETTES) {
    const res = validateWCAGContrast(pal);
    if (!res.textOnBg.pass || !res.textOnCard.pass || !res.largeTextOnBg.pass) {
      console.warn(`[Créa WCAG Warning] La palette ${pal.id} ne respecte pas tous les seuils de contraste.`, res);
      allPass = false;
    }
  }
  return allPass;
}
verifyAllPalettesContrast();

// Published customer reviews shown on the Home Screen (Section 6.1)
export const INITIAL_REVIEWS: Review[] = [
  {
    id: 'rev-1',
    orderId: 'seed-ord-1',
    trackingCode: 'CR-82KM-49',
    customerName: 'Aïcha K.',
    tier: 'vip',
    cardName: 'Mariage VIP Sènami & Rodrigue',
    rating: 5,
    comment: 'L’invitation VIP avec l’enveloppe qui s’ouvre a émerveillé tous nos invités sur WhatsApp ! Livrée en moins de 18 heures.',
    status: 'published',
    createdAt: '2026-10-18T14:20:00Z',
    publishedAt: '2026-10-18T15:00:00Z',
  },
  {
    id: 'rev-2',
    orderId: 'seed-ord-2',
    trackingCode: 'CR-39LP-12',
    customerName: 'Koffi D.',
    tier: 'simple',
    cardName: 'Dot de Mireille',
    rating: 5,
    comment: 'Format image Story parfait pour mon statut WhatsApp. Les couleurs de la charte sont superbes.',
    status: 'published',
    createdAt: '2026-10-19T09:15:00Z',
    publishedAt: '2026-10-19T10:00:00Z',
  },
  {
    id: 'rev-3',
    orderId: 'seed-ord-3',
    trackingCode: 'CR-74TX-88',
    customerName: 'Mme Hounkpatin',
    tier: 'simple',
    cardName: 'Faire-part de décès',
    rating: 5,
    comment: 'Rendu très sobre et respectueux sur fond sombre. Merci pour votre délicatesse et votre rapidité.',
    status: 'published',
    createdAt: '2026-10-20T11:40:00Z',
    publishedAt: '2026-10-20T12:00:00Z',
  },
  {
    id: 'rev-4',
    orderId: 'seed-ord-4',
    trackingCode: 'CR-51WZ-63',
    customerName: 'Dieudonné H.',
    tier: 'simple',
    cardName: 'Remise de diplômes',
    rating: 5,
    comment: 'Paiement MTN MoMo rapide et fichier PDF haute résolution reçu le lendemain matin. Rien à redire !',
    status: 'published',
    createdAt: '2026-10-21T16:10:00Z',
    publishedAt: '2026-10-21T17:00:00Z',
  },
];
