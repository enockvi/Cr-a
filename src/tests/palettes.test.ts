import { CREA_PALETTES, validateWCAGContrast, getPalettesForCategory, getPaletteById } from '../config/palettes';
import { StorageService } from '../services/storageService';

/**
 * Suite de tests unitaires pour le système de palettes V2 :
 * 1. Vérification des seuils de contraste WCAG AA (4.5:1 texte sur fond, 3.0:1 grands titres)
 * 2. Rejet des palette_id hors catégorie ou interdites (ex: deuil avec palette)
 * 3. Copie intégrale du snapshot côté serveur (sans intervention directe du client)
 */
export function runPaletteUnitTests(): { passed: boolean; results: string[] } {
  const results: string[] = [];
  let allPassed = true;

  // Test 1: Chaque palette de la V2 passe les seuils de contraste
  CREA_PALETTES.forEach((palette) => {
    const contrastCheck = validateWCAGContrast(palette.tokens);
    if (contrastCheck.valid) {
      results.push(`[PASS] Contraste WCAG ${palette.id} (${palette.nom}): texte=${contrastCheck.textContrast.toFixed(2)}:1, titre=${contrastCheck.headingContrast.toFixed(2)}:1`);
    } else {
      allPassed = false;
      results.push(`[FAIL] Contraste WCAG ${palette.id}: ${contrastCheck.reason}`);
    }
  });

  // Test 2: Validation des catégories
  const mariagePalettes = getPalettesForCategory('mariage');
  if (mariagePalettes.length === 2 && mariagePalettes.every((p) => p.categorie === 'mariage et couple')) {
    results.push(`[PASS] getPalettesForCategory('mariage') renvoie bien les 2 palettes de Mariage et couple.`);
  } else {
    allPassed = false;
    results.push(`[FAIL] getPalettesForCategory('mariage') anomalie: ${mariagePalettes.length} palettes trouvées.`);
  }

  // Deuil ne doit avoir aucune palette autorisée
  const deuilPalettes = getPalettesForCategory('deuil');
  if (deuilPalettes.length === 0) {
    results.push(`[PASS] getPalettesForCategory('deuil') renvoie 0 palette (fond Nuit #15151B strict).`);
  } else {
    allPassed = false;
    results.push(`[FAIL] getPalettesForCategory('deuil') a renvoyé des palettes !`);
  }

  // Test 3: Rejet de palette_id hors catégorie lors de la création de commande
  try {
    StorageService.createNewOrder({
      tier: 'simple',
      typeId: 'mariage',
      typeName: 'Mariage',
      templateId: 'tpl-1',
      templateName: 'Modèle Test',
      amountXOF: 10000,
      customerName: 'Test Client',
      whatsapp: '+229 97 00 00 00',
      fields: {
        customerName: 'Test',
        whatsapp: '+229 97 00 00 00',
        eventCountry: 'Bénin',
        eventCity: 'Cotonou',
        eventDate: '2026-12-12',
        eventTime: '15:00',
        timezone: 'GMT+1',
        venueName: 'Palais',
        venueAddress: 'Cotonou',
        venueCity: 'Cotonou',
        googleMapsUrl: '',
        mainMessage: 'Invitation de test',
        notes: '',
        specifics: {},
      },
      assets: [],
      paletteId: 'ardoise-sobre', // 'ardoise-sobre' est de la catégorie 'entreprise et études', pas 'mariage et couple'
    });
    allPassed = false;
    results.push(`[FAIL] Le serveur aurait dû rejeter une palette hors catégorie (ardoise-sobre pour mariage) !`);
  } catch (err: any) {
    results.push(`[PASS] Rejet serveur confirmé pour palette_id hors catégorie: ${err.message}`);
  }

  // Test 4: Rejet si une palette est transmise pour une commande Deuil
  try {
    StorageService.createNewOrder({
      tier: 'simple',
      typeId: 'deuil',
      typeName: 'Faire-part de décès',
      templateId: 'tpl-deuil',
      templateName: 'Modèle Deuil',
      amountXOF: 10000,
      customerName: 'Famille Test',
      whatsapp: '+229 97 00 00 00',
      fields: {
        customerName: 'Famille Test',
        whatsapp: '+229 97 00 00 00',
        eventCountry: 'Bénin',
        eventCity: 'Cotonou',
        eventDate: '2026-12-12',
        eventTime: '10:00',
        timezone: 'GMT+1',
        venueName: 'Église',
        venueAddress: 'Cotonou',
        venueCity: 'Cotonou',
        googleMapsUrl: '',
        mainMessage: 'Avis de décès',
        notes: '',
        specifics: {},
      },
      assets: [],
      paletteId: 'champagne-rose', // Invalide pour le deuil
    });
    allPassed = false;
    results.push(`[FAIL] Le serveur aurait dû rejeter la palette pour le deuil !`);
  } catch (err: any) {
    results.push(`[PASS] Rejet confirmé pour commande deuil avec palette: ${err.message}`);
  }

  // Test 5: Copie conforme du snapshot côté serveur
  try {
    const validOrder = StorageService.createNewOrder({
      tier: 'vip',
      typeId: 'mariage',
      typeName: 'Mariage VIP',
      templateId: 'tpl-mariage-vip',
      templateName: 'Modèle Royal',
      amountXOF: 25000,
      customerName: 'Aïcha & Koffi',
      whatsapp: '+229 97 00 00 00',
      fields: {
        customerName: 'Aïcha & Koffi',
        whatsapp: '+229 97 00 00 00',
        eventCountry: 'Bénin',
        eventCity: 'Cotonou',
        eventDate: '2026-12-12',
        eventTime: '15:00',
        timezone: 'GMT+1',
        venueName: 'Palais des Congrès',
        venueAddress: 'Boulevard de la Marina',
        venueCity: 'Cotonou',
        googleMapsUrl: 'https://maps.app.goo.gl/example',
        mainMessage: 'Nous nous marions !',
        notes: '',
        specifics: {},
      },
      assets: [],
      paletteId: 'champagne-rose',
    });

    const champagneRose = getPaletteById('champagne-rose');
    if (
      validOrder.paletteId === 'champagne-rose' &&
      validOrder.paletteSnapshot &&
      validOrder.paletteSnapshot.tokens.bg === champagneRose?.tokens.bg &&
      validOrder.paletteSnapshot.tokens.accent1 === champagneRose?.tokens.accent1 &&
      validOrder.paletteSnapshot.tokens.textOnAccent === champagneRose?.tokens.textOnAccent
    ) {
      results.push(`[PASS] palette_snapshot correctement copié côté serveur depuis config/palettes.ts (${validOrder.paletteSnapshot.name}).`);
    } else {
      allPassed = false;
      results.push(`[FAIL] Snapshot serveur incomplet ou erroné.`);
    }
  } catch (err: any) {
    allPassed = false;
    results.push(`[FAIL] Erreur création commande valide: ${err.message}`);
  }

  return { passed: allPassed, results };
}
