import { GoogleGenAI } from "@google/genai";
import { FishingConditions } from "../types";
import { formatTime, getWeatherLabel, getClarityLabel, getTideLabel, isSaltwater, getWindLabel, getWaterFlowLabel, getWindDirectionLabel, getSurfaceLabel } from "../constants";

// Default Key Management (Encoded in Base64 to avoid clear text scrapping)
// Decodes to: AIzaSyAlEHTpl_7KbrP-Dmk-GyFtUjhZoDbh_Yc
const DEFAULT_KEY_ENC = "QUl6YVN5QWxFSFRwbF83S2JyUC1EbWstR3lGdFVqaFpvRGJoX1lj";

const getDecodedDefaultKey = (): string => {
  try {
    return atob(DEFAULT_KEY_ENC);
  } catch (e) {
    console.error("Failed to decode default key");
    return "";
  }
};

export const getActiveApiKey = (): string => {
  const localKey = localStorage.getItem('user_gemini_key');
  if (localKey && localKey.trim().length > 0) {
    return localKey.trim();
  }
  return getDecodedDefaultKey();
};

export const isUsingPersonalKey = (): boolean => {
  const localKey = localStorage.getItem('user_gemini_key');
  return !!(localKey && localKey.trim().length > 0);
};

// Helper for delay
const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- SYSTEM INSTRUCTION & KNOWLEDGE BASE ---
const SYSTEM_INSTRUCTION = `
STRICTE DISCIPLINE DE RÉDACTION (ZÉRO TOLÉRANCE) :

FORMATAGE : TEXTE BRUT (PLAIN TEXT) UNIQUEMENT.
INTERDICTION DU MARKDOWN : N'utilise JAMAIS de caractères de formatage Markdown (pas de gras, pas d'italique, pas de puces, pas de #).
INTERDICTION DES TITRES : Ne jamais écrire de titres de sections (ex: ne pas écrire "RÉSUMÉ", "ANALYSE", "CONCLUSION", "DISCLAIMER"). Fais des sauts de ligne simples entre les idées pour aérer le texte, c'est tout.

TON :
- Sec, technique, froid, purement factuel.
- AUCUN ENTHOUSIASME (bannis les points d'exclamation, les "bonnes sessions", les adjectifs mélioratifs, les encouragements).
- AUCUNE SALUTATION.
- Aller au plus simple et au plus direct.

STRUCTURE DE RÉPONSE OBLIGATOIRE :

1. Première ligne : Résumé des conditions (Format : Lieu : [Val] | Cible : [Val] | Vent : [Val] | Eau : [Val]).
2. Deuxième ligne : Verdict de faisabilité (EFFICACE / DIFFICILE / À ÉVITER).
3. Paragraphes suivants : Analyse technique directe. Explique le choix du leurre/appât et l'animation en fonction des variables (pression, luminosité, vent). Pas de blabla.
4. Paragraphe suivant : Conformité légale (mailles, dates, restrictions) si pertinent.
5. Dernier paragraphe : Le texte d'avertissement obligatoire ci-dessous (inséré tel quel, sans titre).

CONTRAINTES OPÉRATIONNELLES :
- Ne pose jamais de questions.
- Si illégal, refuse la stratégie.
- Tes documents font foi.

TEXTE D'AVERTISSEMENT OBLIGATOIRE (à placer en toute fin, sans titre) :
Avertissement : La pêche n'est pas une science exacte mais un art qui repose sur l'intuition. Les conseils et données fournis ici sont issus d'études et d'expériences partagées, mais ne constituent pas une vérité absolue. En mer, votre propre expérience, votre sens de l'observation et votre instinct de pêcheur restent vos meilleurs guides. Écoutez-vous avant tout.

BASE DE DONNÉES DE RÉFÉRENCE (CORPUS IMMUABLE) :

Réglementation Eau Douce
Pourquoi une carte de pêche ?
La carte de pêche est obligatoire pour accéder aux zones de pêche, surveiller, entretenir, protéger les milieux et les espèces, et informer les publics.
Le montant total d'une carte de pêche comprend la CPMA, les Cotisations statutaires, et la RMA.
Les deux grandes ouvertures de pêche en 2025 : Samedi 8 mars 2025 (Truite), Samedi 26 avril 2025 (Brochet).

Règles 1ère catégorie : 1 ligne, 2 hameçons max.
Règles 2ème catégorie : 4 lignes, 2 hameçons max.
Quotas : 3 carnassiers/jour dont 2 brochets max. 10 salmonidés/jour.
Tailles légales (minima) : Brochet 0.50m, Sandre 0.40m, Black-bass 0.30m, Truite 0.23m (variable), Mulet 0.20m.
Horaires : 1/2h avant lever à 1/2h après coucher du soleil (sauf carpe de nuit secteurs balisés).

Réglementation Mer
Marquage caudale obligatoire (couper partie inférieure nageoire caudale) pour : Bar, Daurade, Maigre, Pagre, Sar, Sole, Corb, etc.
Tailles minimales Mer (Manche/Atlantique) : Bar 42cm, Daurade Royale 23cm, Maigre 45cm, Lieu Jaune 30cm, Cabillaud 42cm, Merlan 27cm, Sole 24cm, Maquereau 20cm.
Tailles minimales Mer (Méditerranée) : Loup/Bar 30cm, Daurade 23cm, Maigre 45cm, Sar 23cm.

Conseils Techniques Mer & Stratégies :

La Pêche du Bar de Nuit du Bord :
Vents d'Ouest/Sud privilégiés. Marée descendante, coef > 70.
Leurres souples type "shad", coloris noirs/pailletés. Canne résonnante.

La Pêche du Bar au Leurre de Surface :
Efficace même sur zones profondes si le poisson est décollé.
Asturie, Super Spook. Zones encombrées, parcs ostréicoles.

La Pêche en Traction (Bateau) :
Fonds 8-20m. Courants forts.
Phase de traction (montée) et phase de descente (touche).
Leurres : Black Minnow, Nitro Shad, Crazy Sand Eel.
Canne longue (2.28m-2.43m) et résonnante.

L'Influence du Vent :
Vent du large (Onshore) : ramène nourriture au bord, eau troublée => Pêche de bordure.
Vent de terre (Offshore) : eau claire, calme => Pêche au large ou zones profondes.

Choix des Spots :
Estuaires et parcs : garde-manger.
Veines de courant : tapis roulant à nourriture.
Zones d'écume (Blanc) : oxygène et cachette pour prédateurs.

Comportement du Bar :
Activité liée à la température et luminosité.
Automne = période phare (réserves avant hiver).

Espèces Spécifiques :
Thon Rouge : Pêche au leurre ou vif. No-kill sauf bague. Saison été/automne.
Lieu Jaune : Épaves, roches profondes. Pêche verticale ou ascenseur.
Ver Américain : Appât polyvalent, sanglant, attractif pour sparidés et bars.

FIN DE LA BASE DE DONNÉES.
`;

export const generateFishingStrategy = async (conditions: FishingConditions): Promise<string> => {
  if (!conditions.waterType || !conditions.bottomType || !conditions.targetFish) {
    throw new Error("Veuillez remplir tous les champs obligatoires.");
  }

  // --- 1. Prompt Construction (User Session Data Only) ---

  // Determine tide info string only if saltwater
  let tideInfo = "";
  if (isSaltwater(conditions.waterType)) {
      tideInfo = `- Marée : ${getTideLabel(conditions.tideLevel)} (Niveau courbe: ${conditions.tideLevel}%)`;
  }

  // Determine label for flow based on context (Current vs Discharge)
  const flowLabel = isSaltwater(conditions.waterType) ? "Courant" : "Débit/Courant";
  
  // Wind Direction
  const windDirInfo = conditions.windDirection 
    ? `- Direction du vent par rapport au pêcheur : ${getWindDirectionLabel(conditions.windDirection)}`
    : "";

  // The prompt now only contains the variables. The Rules and Knowledge are in System Instruction.
  const prompt = `
    CONDITIONS DE LA SESSION UTILISATEUR :
    
    - Niveau d'expertise demandé : ${conditions.expertiseLevel === 'expert' ? "EXPERT (Technique, précis, vocabulaire spécialisé)" : "DÉBUTANT (Pédagogique, simple)"}
    - Poisson ciblé : ${conditions.targetFish}
    - Région Géographique : ${conditions.region || "Non précisée"}
    - Période : ${conditions.month}
    - Technique préférée : ${conditions.technique}
    - Type de plan d'eau : ${conditions.waterType}
    - Type de fond (substrat) : ${conditions.bottomType}
    - Profondeur de la zone : Entre ${conditions.depth.min}m et ${conditions.depth.max}m
    - Heure : ${formatTime(conditions.time)}
    - Météo : ${getWeatherLabel(conditions.weather)}
    - Clarté de l'eau : ${getClarityLabel(conditions.waterClarity)} (${conditions.waterClarity}%)
    - Vent : ${getWindLabel(conditions.wind)} (${conditions.wind}%)
    ${windDirInfo}
    - Pression atmosphérique : ${conditions.pressure} hPa
    - État de la surface : ${getSurfaceLabel(conditions.waterSurface)} (${conditions.waterSurface}%)
    - ${flowLabel} : ${getWaterFlowLabel(conditions.waterFlow)} (${conditions.waterFlow}%)
    ${tideInfo}

    Génère la stratégie en appliquant STRICTEMENT les règles du System Instruction.
  `;

  // --- 2. API Setup & Call with Retry Logic ---

  const apiKey = getActiveApiKey();
  if (!apiKey) {
      throw new Error("Clé API manquante. Veuillez en configurer une dans les paramètres.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const modelId = 'gemini-2.5-flash-preview-09-2025';

  let attempts = 0;
  const maxAttempts = 5;

  while (attempts < maxAttempts) {
    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          // Limit output tokens if necessary, though flash models handle large outputs well.
          // thinkingConfig is not used here as we want a direct formulated response based on rules.
        }
      });

      return response.text || "Aucune stratégie générée.";

    } catch (error: any) {
      attempts++;
      console.error(`Tentative ${attempts}/${maxAttempts} échouée:`, error);
      
      const isLastAttempt = attempts === maxAttempts;
      
      // Handle specific errors
      const status = error.status || error.response?.status;
      const message = error.message || "";

      // 401/403: Invalid Key
      if (status === 401 || status === 403 || message.includes('API key')) {
        throw new Error("Clé API invalide ou expirée. Veuillez vérifier votre clé dans les paramètres ⚙️.");
      }

      // 429: Quota Exceeded
      if (status === 429) {
        if (isLastAttempt) {
            throw new Error("Quota API épuisé (429). Le service est saturé. Veuillez utiliser votre propre clé API dans les paramètres.");
        }
        // Exponential backoff with jitter (1s, 2s, 4s, 8s + random)
        const delay = Math.pow(2, attempts) * 1000 + Math.random() * 500;
        await wait(delay);
        continue;
      }

      if (isLastAttempt) {
        throw new Error("Impossible de contacter Tacklor Guide. Vérifiez votre connexion réseau.");
      }
      
      // Standard wait for other network errors
      await wait(1000 * attempts);
    }
  }

  throw new Error("Erreur inattendue lors de la génération de la stratégie.");
};