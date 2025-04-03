import { create } from 'zustand';
import { supabase } from './supabase';
import { WordEntry, Translation } from '../types/vocabulary';

interface VocabularyStore {
  entries: WordEntry[];
  loading: boolean;
  error: string | null;
  tags: string[];
  lists: string[];
  setTags: (tags: string[]) => void;
  setLists: (lists: string[]) => void;
  fetchTagsAndLists: () => Promise<void>;
  addEntry: (entry: Omit<WordEntry, 'id'>) => Promise<void>;
  updateEntry: (id: string, entry: Partial<WordEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  loadEntries: () => Promise<void>;
}

export const useVocabularyStore = create<VocabularyStore>((set, get) => ({
  entries: [],
  loading: false,
  error: null,
  tags: [],
  lists: [],

  setTags: (tags) => set({ tags }),
  setLists: (lists) => set({ lists }),

  fetchTagsAndLists: async () => {
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('translations, lists');

      if (error) throw error;

      const uniqueTags = new Set<string>();
      const uniqueLists = new Set<string>();

      data?.forEach(entry => {
        // Extract lists from translations
        const translations = entry.translations as Translation[];
        translations?.forEach(translation => {
          // Extract tags
          translation.tags?.forEach(tag => uniqueTags.add(tag));
          // Extract lists from translation
          translation.lists?.forEach(list => uniqueLists.add(list));
        });
      });

      // Convert Sets to sorted arrays
      const sortedTags = Array.from(uniqueTags).sort();
      const sortedLists = Array.from(uniqueLists).sort();

      console.log('Tags avant setState:', sortedTags);
      console.log('Listes avant setState:', sortedLists);

      set({ 
        tags: sortedTags,
        lists: sortedLists
      });

    } catch (error) {
      console.error('Error fetching tags and lists:', error);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    }
  },

  loadEntries: async () => {
    set({ loading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('vocabulary')
        .select('*')
        .order('created_at', { ascending: false });  // Déjà trié par date

      if (error) throw error;

      const entries = (data || []).map(entry => ({
        ...entry,
        isFavorite: entry.is_favorite,
        lastReviewed: entry.last_reviewed,
        nextReview: entry.next_review,
        createdAt: entry.created_at
      }));
      
      // Modification ici pour trier les tags et listes par date d'utilisation
      const tagsWithDates = entries.flatMap(entry => 
        (entry.tags || []).map(tag => ({
          tag,
          date: entry.created_at
        }))
      );

      const listsWithDates = entries.flatMap(entry => 
        (entry.lists || []).map(list => ({
          list,
          date: entry.created_at
        }))
      );

      // Obtenir les tags uniques les plus récents
      const uniqueTags = [...new Set(
        tagsWithDates
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(t => t.tag)
      )];

      // Obtenir les listes uniques les plus récentes
      const uniqueLists = [...new Set(
        listsWithDates
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
          .map(l => l.list)
      )];

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
    set({ loading: true, error: null });
    try {
      const supabaseEntry = {
        german: entry.german,
        translations: entry.translations,
        type: entry.type,
        gender: entry.gender,
        plural: entry.plural,
        proficiency: entry.proficiency,
        tags: entry.tags,
        is_favorite: entry.isFavorite,
        last_reviewed: entry.lastReviewed,
        next_review: entry.nextReview,
        created_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('vocabulary')
        .insert([supabaseEntry])
        .select();

      if (error) throw error;

      await get().loadEntries();
      await get().fetchTagsAndLists();  // Ajout de fetchTagsAndLists ici
    } catch (error) {
      console.error('Error in addEntry:', error);
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
    }
  },

  updateEntry: async (id, entry) => {
    set({ loading: true, error: null });
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({
          ...entry,
          is_favorite: entry.isFavorite,
          last_reviewed: entry.lastReviewed,
          next_review: entry.nextReview,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) throw error;

      // Mettre à jour les entries et rafraîchir les tags/lists
      await get().loadEntries();
      await get().fetchTagsAndLists();

    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'An error occurred' });
    } finally {
      set({ loading: false });
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

      // Ajouter après la suppression :
      await get().fetchTagsAndLists();
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
























