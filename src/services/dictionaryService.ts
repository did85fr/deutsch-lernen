import axios from 'axios';
import rateLimit from 'axios-rate-limit';
import { VocabularyEntry } from '../types/vocabulary';

// Ajout des logs de débogage en haut du fichier
console.log("=== Environment Variables Debug ===");
console.log("VITE_SUPABASE_URL:", import.meta.env.VITE_SUPABASE_URL);
console.log("VITE_SUPABASE_ANON_KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY);
console.log("VITE_PONS_API_KEY:", import.meta.env.VITE_PONS_API_KEY);
console.log("VITE_API_URL:", import.meta.env.VITE_API_URL);
console.log("NODE_ENV:", import.meta.env.NODE_ENV);
console.log("DEV:", import.meta.env.DEV);
console.log("PROD:", import.meta.env.PROD);
console.log("================================");

// Configuration
const PONS_API_KEY = import.meta.env.VITE_PONS_API_KEY;
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 heures en millisecondes

// Cache pour stocker les résultats
const wordCache = new Map<string, { result: any; timestamp: number }>();

// Configuration de l'API
const api = rateLimit(axios.create({
  baseURL: 'https://deutsch-lernen-omega.vercel.app/api/dictionary',  // URL mise à jour
  headers: {
    'X-Secret': import.meta.env.VITE_PONS_API_KEY
  }
}), {
  maxRequests: 10,
  perMilliseconds: 1000,
});

interface PonsResponse {
  exists: boolean;
  matches: Array<{
    headword: string;
    headword_full: string;
    wordclass: string;
    arabs: Array<{
      header: string;
      translations: Array<{
        source: string;
        target: string;
      }>;
    }>;
  }>;
}

async function checkWithPonsAPI(word: string) {
  console.log('Attempting PONS API call with key:', import.meta.env.VITE_PONS_API_KEY);
  try {
    const response = await api.get('', {
      params: { 
        q: word,
        language: 'deen'
      }
    });

    console.log('PONS API Raw Response:', response);
    console.log('PONS API Response Data:', response.data);

    if (!response.data.exists || !response.data.matches) {
      console.log('No matches found, falling back to local check');
      return checkWithLocalFallback(word);
    }

    return {
      exists: true,
      suggestions: parsePonsResponse(response.data.matches)
    };
  } catch (error) {
    console.error('PONS API Detailed Error:', error);
    return checkWithLocalFallback(word);
  }
}

function parsePonsResponse(matches: PonsResponse['matches']) {
  return matches.map(match => ({
    word: match.headword,
    type: determineWordType(match.wordclass),
    gender: determineGender(match.wordclass),
    translation: match.arabs?.[0]?.translations
      ?.map(t => t.target)
      .join(', ') || ''
  }));
}

// Ensemble de mots allemands communs (à remplir selon vos besoins)
const commonGermanWords = new Set([
  'haus',
  'mann',
  'frau',
  // Ajoutez d'autres mots selon vos besoins
]);

// Règles grammaticales allemandes basiques
const germanRules = {
  nounPatterns: /^[A-Z]/,
  verbPatterns: /(en|ern|eln)$/,
  adjectivePatterns: /(ig|lich|isch|bar)$/,
  compoundWordPattern: /[A-Z][a-z]+[A-Z][a-z]+/
};

function checkWithLocalFallback(word: string) {
  const normalizedWord = word.trim().toLowerCase();
  
  // Vérifier dans la base de données locale
  if (commonGermanWords.has(normalizedWord)) {
    return {
      exists: true,
      suggestions: [{
        word: normalizedWord,
        type: determineWordTypeFromRules(normalizedWord),
        translation: ''
      }]
    };
  }

  // Analyse basée sur les règles
  const wordType = determineWordTypeFromRules(normalizedWord);
  if (wordType) {
    return {
      exists: true,
      suggestions: [{
        word: normalizedWord,
        type: wordType,
        translation: ''
      }]
    };
  }

  return {
    exists: false,
    suggestions: [],
    error: 'Mot non trouvé'
  };
}

function determineWordTypeFromRules(word: string): string {
  if (germanRules.nounPatterns.test(word)) return 'noun';
  if (germanRules.verbPatterns.test(word)) return 'verb';
  if (germanRules.adjectivePatterns.test(word)) return 'adjective';
  if (germanRules.compoundWordPattern.test(word)) return 'compound';
  return 'unknown';
}

function determineWordType(wordClass: string): string {
  if (wordClass.includes('noun')) return 'noun';
  if (wordClass.includes('verb')) return 'verb';
  if (wordClass.includes('adjective')) return 'adjective';
  if (wordClass.includes('adverb')) return 'adverb';
  return 'unknown';
}

function determineGender(wordClass: string): 'M' | 'F' | 'N' | undefined {
  if (wordClass.includes('masculine')) return 'M';
  if (wordClass.includes('feminine')) return 'F';
  if (wordClass.includes('neuter')) return 'N';
  return undefined;
}

export async function checkGermanWord(word: string) {
  if (!word.trim()) {
    return { exists: false, suggestions: [] };
  }

  try {
    // Essayer PONS d'abord
    const result = await checkWithPonsAPI(word);
    
    // Si PONS échoue, utiliser le fallback local
    if (!result.exists) {
      return checkWithLocalFallback(word);
    }

    return result;
  } catch (error) {
    console.error('Error checking German word:', error);
    return checkWithLocalFallback(word);
  }
}

// Fonction utilitaire pour nettoyer le cache périodiquement
export function cleanCache() {
  const now = Date.now();
  for (const [word, entry] of wordCache.entries()) {
    if (now - entry.timestamp > CACHE_DURATION) {
      wordCache.delete(word);
    }
  }
}

// Nettoyer le cache toutes les 24 heures
setInterval(cleanCache, CACHE_DURATION);

// Fonction pour normaliser un mot
export function normalizeWord(word: string): string {
  return word
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

// Fonction pour vérifier les doublons
export function findSimilarWords(word: string, entries: VocabularyEntry[]) {
  if (!word) return [];
  
  const normalizedWord = word.toLowerCase().trim();
  return entries.filter(entry => 
    entry.german.toLowerCase().trim() === normalizedWord
  );
} 































