import React, { useState, useEffect } from 'react';
import { Plus, Trash2, InfoIcon } from 'lucide-react';
import { Translation } from '../types/vocabulary';
import { TagsManager } from './TagsManager';

interface TranslationManagerProps {
  translations: Translation[];
  onChange: (translations: Translation[]) => void;
  availableTags: string[];
  availableLists: string[];
  dictionaryTranslations?: string[];
  onTranslationSelect?: (translation: string) => void;
}

const TranslationManager: React.FC<TranslationManagerProps> = ({ 
  translations, 
  onChange,
  availableTags,
  availableLists,
  dictionaryTranslations = [],
  onTranslationSelect
}) => {
  const [showTranslations, setShowTranslations] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Extraire uniquement la traduction sélectionnée
  const selectedTranslation = dictionaryTranslations.length > 0 
    ? dictionaryTranslations[0] 
    : '';

  const handleAddTranslation = () => {
    const lastTranslation = translations[translations.length - 1];
    if (!lastTranslation.text.trim()) return;
    
    onChange([...translations, { text: '', context: '', tags: [], lists: [] }]);
  };

  const handleRemoveTranslation = (index: number) => {
    if (translations.length > 1) {
      const newTranslations = translations.filter((_, i) => i !== index);
      const nonEmptyTranslations = newTranslations.filter(t => t.text.trim() !== '');
      onChange(nonEmptyTranslations.length > 0 
        ? nonEmptyTranslations 
        : [{ text: '', context: '', tags: [], lists: [] }]
      );
    }
  };

  const handleTranslationChange = (index: number, field: keyof Translation, value: any) => {
    const newTranslations = translations.map((t, i) => 
      i === index ? { ...t, [field]: value } : t
    );
    onChange(newTranslations);
  };

  const isAddButtonDisabled = !translations[translations.length - 1]?.text.trim();

  return (
    <div className="space-y-3">
      {translations.map((translation, index) => (
        <div key={index} className="space-y-4 border rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <div className="relative">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={translation.text}
                    onChange={(e) => handleTranslationChange(index, 'text', e.target.value)}
                    placeholder="Traduction"
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    style={{ minWidth: '300px' }}
                  />
                  {selectedTranslation && (
                    <div className="relative">
                      <button
                        type="button"
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        onMouseEnter={() => {
                          setShowTranslations(true);
                          setHoveredIndex(index);
                        }}
                        onMouseLeave={() => {
                          setTimeout(() => {
                            setShowTranslations(false);
                            setHoveredIndex(null);
                          }, 200);
                        }}
                      >
                        <InfoIcon className="w-5 h-5" />
                      </button>
                      {showTranslations && hoveredIndex === index && (
                        <div 
                          className="absolute z-50 right-0 mt-2 p-4 bg-white border rounded-lg shadow-lg"
                          style={{ minWidth: '200px' }}
                          onMouseEnter={() => setShowTranslations(true)}
                          onMouseLeave={() => {
                            setShowTranslations(false);
                            setHoveredIndex(null);
                          }}
                        >
                          <div className="text-sm whitespace-pre-wrap">
                            {selectedTranslation}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <textarea
                value={translation.context || ''}
                onChange={(e) => handleTranslationChange(index, 'context', e.target.value)}
                placeholder="Contexte (optionnel)"
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm text-gray-600"
                style={{ minHeight: '60px' }}
              />
            </div>
            {translations.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveTranslation(index)}
                className="self-start p-2 text-gray-400 hover:text-red-600 transition-colors"
                title="Supprimer cette traduction"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
          
          <div className="pt-2 border-t">
            <TagsManager
              selectedTags={translation.tags}
              selectedLists={translation.lists}
              onTagsChange={(tags) => handleTranslationChange(index, 'tags', tags)}
              onListsChange={(lists) => handleTranslationChange(index, 'lists', lists)}
              availableTags={availableTags}
              availableLists={availableLists}
            />
          </div>
        </div>
      ))}
      
      <button
        type="button"
        onClick={handleAddTranslation}
        disabled={isAddButtonDisabled}
        className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          isAddButtonDisabled 
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
            : 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100'
        }`}
      >
        <Plus className="w-4 h-4" />
        Ajouter une traduction
      </button>
    </div>
  );
};

export default TranslationManager;

