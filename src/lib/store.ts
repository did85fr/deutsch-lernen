import { create } from 'zustand';
import { supabase } from './supabaseClient';

interface VocabularyState {
  entries: VocabularyEntry[];
  loading: boolean;
  error: string | null;
  tags: string[];
  lists: string[];
  loadEntries: () => Promise<void>;
  addEntry: (entry: Omit<VocabularyEntry, 'id'>) => Promise<void>;
  updateEntry: (entry: VocabularyEntry) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  addTag: (tag: string) => void;
  addList: (list: string) => void;
}

export const useVocabularyStore = create<VocabularyState>((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  tags: [],
  lists: [],

  loadEntries: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Convertir snake_case en camelCase pour le frontend
      const entries = (data || []).map(entry => ({
        ...entry,
        isFavorite: entry.is_favorite,
        lastReviewed: entry.last_reviewed,
        nextReview: entry.next_review,
        createdAt: entry.created_at
      }));
      
      const uniqueTags = [...new Set(
        entries.flatMap(entry => entry.tags || [])
      )].filter(Boolean);

      const uniqueLists = [...new Set(
        entries.flatMap(entry => entry.lists || [])
      )].filter(Boolean);

      set({ 
        entries, 
        tags: uniqueTags,
        lists: uniqueLists,
        loading: false 
      });
    } catch (error) {
      console.error('Error loading entries:', error);
      set({ error: String(error), loading: false });
    }
  },

  addEntry: async (entry) => {
    try {
      // Récupérer d'abord l'ID de l'utilisateur
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Convertir camelCase en snake_case pour la base de données
      const dbEntry = {
        ...entry,
        is_favorite: entry.isFavorite,
        last_reviewed: entry.lastReviewed,
        next_review: entry.nextReview,
        user_id: user.id // Utiliser directement l'ID de l'utilisateur
      };

      // Supprimer les propriétés en camelCase
      delete (dbEntry as any).isFavorite;
      delete (dbEntry as any).lastReviewed;
      delete (dbEntry as any).nextReview;

      const { data, error } = await supabase
        .from('vocabulary')
        .insert([dbEntry])
        .select();

      if (error) throw error;

      // Convertir snake_case en camelCase pour le frontend
      const newEntry = {
        ...data[0],
        isFavorite: data[0].is_favorite,
        lastReviewed: data[0].last_reviewed,
        nextReview: data[0].next_review,
      };

      const currentEntries = get().entries;
      const currentTags = get().tags;
      const currentLists = get().lists;

      const newTags = [...new Set([...currentTags, ...(newEntry.tags || [])])];
      const newLists = [...new Set([...currentLists, ...(newEntry.lists || [])])];

      set({
        entries: [newEntry, ...currentEntries],
        tags: newTags,
        lists: newLists
      });

      return newEntry;
    } catch (error) {
      console.error('Error adding entry:', error);
      throw error;
    }
  },

  updateEntry: async (entry: VocabularyEntry) => {
    try {
      // Vérification que chaque traduction a la bonne structure
      const validatedTranslations = entry.translations.map(t => ({
        text: t.text || '',
        context: t.context || '',
        tags: Array.isArray(t.tags) ? t.tags : [],
        lists: Array.isArray(t.lists) ? t.lists : []
      }));

      const { data, error } = await supabase
        .from('vocabulary')
        .update({
          german: entry.german,
          translations: validatedTranslations,
          type: entry.type,
          gender: entry.type === 'noun' ? entry.gender : null,
          plural: entry.type === 'noun' ? entry.plural : null,
          proficiency: entry.proficiency,
          sm2_state: entry.sm2State,
          updated_at: new Date().toISOString()
        })
        .eq('id', entry.id)
        .select();

      if (error) throw error;

      // Mise à jour du state
      set(state => {
        const updatedEntries = state.entries.map(e => 
          e.id === entry.id ? { ...entry, translations: validatedTranslations } : e
        );
        
        // Collecte de tous les tags et listes uniques de toutes les traductions
        const allTags = new Set(updatedEntries.flatMap(e => 
          e.translations.flatMap(t => t.tags)
        ));
        const allLists = new Set(updatedEntries.flatMap(e => 
          e.translations.flatMap(t => t.lists)
        ));

        return {
          entries: updatedEntries,
          tags: [...allTags],
          lists: [...allLists]
        };
      });

      return data[0];
    } catch (error) {
      console.error('Error updating entry:', error);
      throw error;
    }
  },

  deleteEntry: async (id) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .delete()
        .eq('id', id);

      if (error) throw error;

      set(state => ({
        entries: state.entries.filter(e => e.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting entry:', error);
      throw error;
    }
  },

  addTag: (tag: string) => {
    set(state => ({
      tags: [...state.tags, tag]
    }));
  },

  addList: (list: string) => {
    set(state => ({
      lists: [...state.lists, list]
    }));
  }
}));











