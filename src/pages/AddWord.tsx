import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../lib/store';
import { WordType, Gender, ProficiencyLevel, Translation } from '../types/vocabulary';
import { Toast } from '../components/Toast';
import { GermanCharacters } from '../components/GermanCharacters';
import TranslationManager from '../components/TranslationManager';
import { findSimilarWords } from '../services/dictionaryService';
import { ChevronDown, AlertCircle, InfoIcon } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { TagsManager } from '../components/TagsManager';
import { Star } from 'lucide-react';
import { checkGermanWord } from '../services/dictionaryService';
import { toast } from 'react-hot-toast';
import DOMPurify from 'dompurify';
import { PonsTest } from '../components/PonsTest';

export function AddWord() {
  const navigate = useNavigate();
  const { addEntry, entries, tags = [], lists = [] } = useVocabularyStore();
  const { toast: useToastToast } = useToast();
  const [toastState, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const germanInputRef = React.useRef<HTMLTextAreaElement>(null);
  const [formData, setFormData] = useState({
    german: '',
    translations: [{ text: '', context: '' }] as Translation[], // Au lieu de french
    type: 'noun' as WordType,
    gender: 'M' as Gender,
    plural: '',
    proficiency: 'unknown' as ProficiencyLevel,
    tags: [] as string[],
    lists: [] as string[],
    isFavorite: false
  });
  const [dictionaryInfo, setDictionaryInfo] = useState<{
    exists: boolean;
    type?: string;
    gender?: string;
    definition?: string;
    translation?: string;
    loading: boolean;
  }>({
    exists: true,
    loading: false,
  });

  const [displayMode, setDisplayMode] = useState<'input' | 'textarea' | 'contentEditable'>('input');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isTranslationDropdownOpen, setIsTranslationDropdownOpen] = useState(false);

  // Vérification des doublons
  const similarWords = formData.german ? findSimilarWords(formData.german, entries) : [];

  const checkWord = async () => {
    console.log('Starting word check for:', formData.german.trim()); // Debug log 1

    if (!formData.german.trim()) {
      setDictionaryInfo(prev => ({ ...prev, exists: true, loading: false }));
      return;
    }

    setDictionaryInfo(prev => ({ ...prev, loading: true }));

    try {
      const result = await checkGermanWord(formData.german.trim());
      console.log('Dictionary check result:', result); // Debug log 2
      
      setDictionaryInfo({
        exists: result.exists,
        type: result.suggestions?.[0]?.type,
        gender: result.suggestions?.[0]?.gender,
        loading: false
      });
    } catch (error) {
      console.error('Error in checkWord:', error); // Debug log 3
      setDictionaryInfo({
        exists: false,
        loading: false
      });
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.german.trim().length >= 2) {
        checkWord();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.german]);

  const handleCharacterClick = (char: string) => {
    if (germanInputRef.current) {
      const input = germanInputRef.current;
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const newValue = formData.german.slice(0, start) + char + formData.german.slice(end);
      setFormData(prev => ({ ...prev, german: newValue }));
      
      // Mettre à jour la position du curseur après l'insertion
      setTimeout(() => {
        input.setSelectionRange(start + 1, start + 1);
        input.focus();
      }, 0);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Vérifier si au moins une traduction non vide existe
    if (!formData.german || !formData.translations.some(t => t.text.trim())) {
      toast.error('Les champs allemand et au moins une traduction sont obligatoires');
      return;
    }

    // Vérification des doublons
    if (similarWords.length > 0) {
      toast.error('Ce mot existe déjà dans votre vocabulaire');
      return;
    }

    // Avertissement si le mot n'existe pas dans le dictionnaire
    if (!dictionaryInfo.exists && formData.type !== 'phrase' && formData.type !== 'quote') {
      const confirm = window.confirm(
        "Ce mot n'a pas été trouvé dans le dictionnaire. Voulez-vous quand même l'ajouter ?"
      );
      if (!confirm) return;
    }

    try {
      const now = new Date().toISOString();
      await addEntry({
        ...formData,
        lastReviewed: now,
        nextReview: now,
      });
      toast.success('Mot ajouté ! Le mot a été ajouté avec succès à votre vocabulaire.');
      navigate('/list');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Une erreur est survenue');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const sanitizedValue = DOMPurify.sanitize(value, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : sanitizedValue,
    }));
  };

  const handleTagsChange = (tags: string[]) => {
    setFormData(prev => ({ ...prev, tags }));
  };

  const handleListsChange = (lists: string[]) => {
    setFormData(prev => ({ ...prev, lists }));
  };

  const handleTranslationSelect = (translation: string) => {
    const cleanTranslation = DOMPurify.sanitize(translation, {
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: [],
    });
    setFormData(prev => ({ ...prev, french: cleanTranslation }));
  };

  const handleClickOutside = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.translation-dropdown') && !target.closest('.info-icon')) {
      setIsDropdownOpen(false);
    }
    if (!target.closest('.translation-suggestions') && !target.closest('.translation-icon')) {
      setIsTranslationDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const toggleTranslationDropdown = () => {
    setIsTranslationDropdownOpen(!isTranslationDropdownOpen);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Ajouter un mot</h1>
      
      {/* Ajoutez le composant de test ici */}
      <PonsTest />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
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
              <div>
                <label htmlFor="gender" className="block text-sm font-medium mb-1">
                  Genre
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="M">Masculin (der)</option>
                  <option value="F">Féminin (die)</option>
                  <option value="N">Neutre (das)</option>
                  <option value="-">Pluriel uniquement (-)</option>
                </select>
              </div>
            )}

            <div>
              <label htmlFor="german" className="block text-sm font-medium mb-1">
                Mot (Allemand)
                {formData.type === 'noun' && (
                  <div className="inline-flex items-center gap-1 ml-2 bg-red-50 text-red-600 px-2 py-1 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>nom sans article</span>
                  </div>
                )}
              </label>
              <div className="relative">
                <textarea
                  id="german"
                  name="german"
                  value={formData.german}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px] ${
                    dictionaryInfo.loading ? 'border-gray-300' :
                    dictionaryInfo.exists ? 'border-green-300' : 'border-yellow-300'
                  }`}
                  placeholder={formData.type === 'noun' ? "Exemple: Frau (sans article)" : ""}
                  required
                  ref={germanInputRef}
                />
                <div className="absolute right-3 top-3 flex gap-2">
                  {formData.german && (
                    <button
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, german: '' }))}
                      className="text-gray-400 hover:text-gray-600"
                      title="Effacer le contenu"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </button>
                  )}
                  {!dictionaryInfo.loading && !dictionaryInfo.exists && (
                    <div className="text-yellow-500" title="Mot non trouvé dans le dictionnaire">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                  {!dictionaryInfo.loading && dictionaryInfo.exists && (
                    <div 
                      className="text-blue-500 cursor-help"
                      title={`${dictionaryInfo.type === 'noun' ? 
                        `Nom ${dictionaryInfo.gender === 'M' ? 'masculin' : 
                        dictionaryInfo.gender === 'F' ? 'féminin' : 'neutre'}` : 
                        dictionaryInfo.type}${dictionaryInfo.definition ? 
                        `\n\nDéfinition:\n${dictionaryInfo.definition}` : ''}`}
                    >
                      <AlertCircle className="w-5 h-5" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Traductions (Français)
                <div className="inline-flex items-center gap-1 ml-2 bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs">
                  <AlertCircle className="w-4 h-4" />
                  <span>Ajoutez autant de traductions que nécessaire</span>
                </div>
              </label>
              <TranslationManager
                translations={formData.translations}
                onChange={(translations) => setFormData(prev => ({ ...prev, translations }))}
                availableTags={tags || []}
                availableLists={lists || []}
                dictionaryTranslations={dictionaryInfo.translation ? dictionaryInfo.translation.split(',').map(t => t.trim()) : []}
                onTranslationSelect={(translation) => {
                  // Optionnel : gérer la sélection d'une traduction si nécessaire
                }}
              />
            </div>

            {formData.type === 'noun' && (
              <div>
                <label htmlFor="plural" className="block text-sm font-medium mb-1">
                  Pluriel
                  <div className="inline-flex items-center gap-1 ml-2 bg-red-50 text-red-600 px-2 py-1 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4" />
                    <span>pluriel sans article</span>
                  </div>
                </label>
                <div className="relative">
                  <textarea
                    id="plural"
                    name="plural"
                    value={formData.plural}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                    placeholder="Exemple: Männer (sans article)"
                  />
                  <div className="absolute right-3 top-3 flex gap-2">
                    {formData.plural && (
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, plural: '' }))}
                        className="text-gray-400 hover:text-gray-600"
                        title="Effacer le contenu"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
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
                availableTags={tags || []}
                availableLists={lists || []}
              />
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium mb-1">
                <input
                  type="checkbox"
                  checked={formData.isFavorite}
                  onChange={(e) => setFormData(prev => ({ ...prev, isFavorite: e.target.checked }))}
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
            onClick={() => navigate('/list')}
            className="px-4 py-2 border rounded-md hover:bg-gray-50"
          >
            Annuler
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Ajouter
          </button>
        </div>
      </form>
    </div>
  );
}












