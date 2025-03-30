export type WordType = 
  | 'noun'
  | 'verb'
  | 'adjective'
  | 'adverb'
  | 'preposition'
  | 'conjunction'
  | 'pronoun'
  | 'article'
  | 'interjection'
  | 'phrase'
  | 'quote'
  | 'other';
export type Gender = 'M' | 'F' | 'N' | '-';
export type ProficiencyLevel = 'unknown' | 'learning' | 'almost' | 'mastered';

export interface SM2State {
  repetitions: number;
  easeFactor: number;
  interval: number;
  lastReview: string | null;
  nextReview: string | null;
  reviews: Array<{
    quality: number;
    timestamp: string;
  }>;
  failedAttempts: number;
}

export interface Translation {
  text: string;
  context: string;
  tags: string[];    // Ajout des tags spécifiques
  lists: string[];   // Ajout des thèmes spécifiques
}

export interface VocabularyEntry {
  id: string;
  german: string;
  translations: Translation[];  // Remplace french
  type: WordType;
  gender?: Gender;
  plural?: string;
  proficiency: ProficiencyLevel;
  tags: string[];
  lists: string[];
  isFavorite: boolean;
  lastReviewed: string;
  nextReview: string;
  createdAt?: string;
  userId: string;
  sm2State: SM2State;
}

// Interface pour la base de données
export interface DBVocabularyEntry {
  id: string;
  german: string;
  french: string;
  type: WordType;
  gender?: Gender;
  plural?: string;
  proficiency: ProficiencyLevel;
  created_at: string;
  last_reviewed: string | null;
  next_review: string | null;
  tags: string[];
  lists: string[];
  is_favorite: boolean;  // Base de données utilise snake_case
  sm2_state: SM2State;
}

export interface VocabularyState {
  entries: VocabularyEntry[];
  loading: boolean;
  error: string | null;
  tags: string[];
  lists: string[];
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<VocabularyEntry, 'id' | 'createdAt'>) => Promise<VocabularyEntry>;
  updateEntry: (id: string, entry: Partial<VocabularyEntry>) => Promise<VocabularyEntry>;
  deleteEntry: (id: string) => Promise<void>;
  addTag: (tag: string) => void;
  removeTag: (tag: string) => void;
  addList: (list: string) => void;
  removeList: (list: string) => void;
}





