import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useVocabularyStore } from '../lib/store';
import { VocabularyEntry, WordType, Gender } from '../types/vocabulary';
import { useToast } from '../components/ui/use-toast';
import { GermanCharacters } from '../components/GermanCharacters';
import { TagsManager } from '../components/TagsManager';
import { Star } from 'lucide-react';

export function EditWord() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { entries, updateEntry, tags, lists, fetchTagsAndLists } = useVocabularyStore();
  const { toast } = useToast();
  const [formData, setFormData] = useState<VocabularyEntry | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const germanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchTagsAndLists();
  }, [fetchTagsAndLists]);

  useEffect(() => {
    const entry = entries.find(e => e.id === id);
    if (entry) {
      setFormData(entry);
    } else {
      toast({
        title: "Erreur",
        description: "Mot non trouvé",
        variant: "destructive"
      });
      navigate('/list');
    }
    setIsLoading(false);
  }, [id, entries, navigate, toast]);

  // Déplacer tous les handlers ici, avant le early return
  const handleCharacterClick = (char: string) => {
    if (germanInputRef.current && formData) {
      const input = germanInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = formData.german.slice(0, start) + char + formData.german.slice(end);
      setFormData(prev => prev ? { ...prev, german: newValue } : null);
      setIsDirty(true);
      
      setTimeout(() => {
        input.setSelectionRange(start + 1, start + 1);
        input.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData || !id) return;

    try {
      await updateEntry(id, formData);
      setIsDirty(false);
      toast({
        title: "Succès",
        description: "Mot modifié avec succès !",
      });
      navigate('/list');
    } catch (err) {
      toast({
        title: "Erreur",
        description: err instanceof Error ? err.message : 'Une erreur est survenue',
        variant: "destructive"
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    if (!formData) return;
    setFormData(prev => prev ? {
      ...prev,
      [e.target.name]: e.target.value
    } : null);
    setIsDirty(true);
  };

  const handleTagsChange = (tags: string[]) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, tags } : null);
    setIsDirty(true);
  };

  const handleListsChange = (lists: string[]) => {
    if (!formData) return;
    setFormData(prev => prev ? { ...prev, lists } : null);
    setIsDirty(true);
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirm = window.confirm('Voulez-vous vraiment annuler ? Les modifications non sauvegardées seront perdues.');
      if (!confirm) return;
    }
    navigate('/list');
  };

  // Ajouter l'effet pour l'avertissement de navigation ici
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  if (isLoading || !formData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse max-w-2xl">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Modifier un mot</h1>
      
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="german" className="block text-sm font-medium mb-1">
                Mot (Allemand)
              </label>
              <input
                type="text"
                id="german"
                name="german"
                value={formData.german}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="french" className="block text-sm font-medium mb-1">
                Traduction (Français)
              </label>
              <input
                type="text"
                id="french"
                name="french"
                value={formData.french}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label htmlFor="type" className="block text-sm font-medium mb-1">
                Type
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
              >
                <option value="noun">Nom</option>
                <option value="verb">Verbe</option>
                <option value="adjective">Adjectif</option>
                <option value="adverb">Adverbe</option>
                <option value="phrase">Expression</option>
                <option value="quote">Citation</option>
              </select>
            </div>

            {formData.type === 'noun' && (
              <>
                <div>
                  <label htmlFor="gender" className="block text-sm font-medium mb-1">
                    Genre
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                  >
                    <option value="M">Masculin (der)</option>
                    <option value="F">Féminin (die)</option>
                    <option value="N">Neutre (das)</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="plural" className="block text-sm font-medium mb-1">
                    Pluriel
                  </label>
                  <input
                    type="text"
                    id="plural"
                    name="plural"
                    value={formData.plural || ''}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </>
            )}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Organisation
              </label>
              <TagsManager
                selectedTags={formData.tags}
                selectedLists={formData.lists}
                onTagsChange={handleTagsChange}
                onListsChange={handleListsChange}
                availableTags={tags}
                availableLists={lists}
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium mb-1">
                <input
                  type="checkbox"
                  checked={formData.isFavorite || false}
                  onChange={(e) => {
                    setFormData(prev => prev ? { ...prev, isFavorite: e.target.checked } : null);
                    setIsDirty(true);
                  }}
                  className="rounded border-gray-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-offset-0 focus:ring-indigo-200 focus:ring-opacity-50"
                />
                <span className="flex items-center">
                  Favori
                  <Star className="w-4 h-4 ml-1 text-yellow-400" fill={formData.isFavorite ? "currentColor" : "none"} />
                </span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={handleCancel}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            disabled={!isDirty}
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
} 



