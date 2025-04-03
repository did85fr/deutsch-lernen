import * as React from 'react';
import { useState, useMemo, useEffect } from 'react';
import { X, Plus, Tag, List } from 'lucide-react';

// Tags par défaut avec leurs couleurs
const DEFAULT_TAG_SUGGESTIONS = [
  { name: 'Difficile', color: 'bg-red-100 text-red-800 hover:bg-red-200 border border-red-200' },
  { name: 'Moyen', color: 'bg-orange-100 text-orange-800 hover:bg-orange-200 border border-orange-200' },
  { name: 'Facile', color: 'bg-green-100 text-green-800 hover:bg-green-200 border border-green-200' },
  { name: 'À réviser', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200 border border-yellow-200' },
  { name: 'Important', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200' },
];

interface TagsManagerProps {
  selectedTags: string[];
  selectedLists: string[];
  onTagsChange: (tags: string[]) => void;
  onListsChange: (lists: string[]) => void;
  availableTags: string[];
  availableLists: string[];
}

export const TagsManager: React.FC<TagsManagerProps> = ({
  selectedTags = [],
  selectedLists = [],
  onTagsChange,
  onListsChange,
  availableTags = [],
  availableLists = []
}) => {
  const [newTag, setNewTag] = useState('');
  const [newList, setNewList] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showListSuggestions, setShowListSuggestions] = useState(false);

  // Gestionnaire de clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.tag-input-container')) {
        setShowTagSuggestions(false);
      }
      if (!target.closest('.list-input-container')) {
        setShowListSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fonction pour ajouter un nouveau tag personnalisé
  const handleAddCustomTag = () => {
    if (newTag.trim()) {
      onTagsChange([...selectedTags, newTag.trim()]);
      setNewTag('');
      setShowTagSuggestions(false);
    }
  };

  // Fonction pour ajouter un nouveau thème personnalisé
  const handleAddCustomList = () => {
    if (newList.trim()) {
      onListsChange([...selectedLists, newList.trim()]);
      setNewList('');
      setShowListSuggestions(false);
    }
  };

  // Récupération des tags récents (hors tags par défaut)
  const recentCustomTags = useMemo(() => {
    console.log('Available tags:', availableTags);
    console.log('Selected tags:', selectedTags);
    console.log('DEFAULT_TAG_SUGGESTIONS:', DEFAULT_TAG_SUGGESTIONS);
    
    const filteredTags = availableTags
      .filter(tag => !DEFAULT_TAG_SUGGESTIONS.some(defaultTag => defaultTag.name === tag))
      .filter(tag => !selectedTags.includes(tag))
      .slice(0, 5);  // Prendre les 5 premiers (les plus récents)
      
    console.log('Filtered recent tags:', filteredTags);
    return filteredTags;
  }, [availableTags, selectedTags]);

  // Récupération des thèmes récents
  const recentLists = useMemo(() => {
    console.log('Available lists:', availableLists);
    console.log('Selected lists:', selectedLists);
    
    const filteredLists = availableLists
      .filter(list => !selectedLists.includes(list))
      .slice(0, 5);  // Prendre les 5 premiers (les plus récents)
      
    console.log('Filtered recent lists:', filteredLists);
    return filteredLists;
  }, [availableLists, selectedLists]);

  // Suggestions de tags incluant les tags par défaut et l'autocomplétion
  const tagSuggestions = useMemo(() => {
    const defaultTags = DEFAULT_TAG_SUGGESTIONS
      .filter(tag => !selectedTags.includes(tag.name))
      .map(tag => ({
        ...tag,
        isDefault: true
      }));

    if (!newTag.trim()) return defaultTags;

    const searchTerm = newTag.toLowerCase();
    const customTags = availableTags
      .filter(tag => 
        tag.toLowerCase().includes(searchTerm) && 
        !selectedTags.includes(tag) &&
        !DEFAULT_TAG_SUGGESTIONS.some(dt => dt.name === tag)
      )
      .map(tag => ({
        name: tag,
        color: 'bg-pink-100 text-pink-800 hover:bg-pink-200 border border-pink-200',
        isDefault: false
      }));

    return [...defaultTags, ...customTags].slice(0, 10);
  }, [newTag, availableTags, selectedTags]);

  // Suggestions de thèmes
  const listSuggestions = useMemo(() => {
    if (!newList.trim()) return [];
    
    const searchTerm = newList.toLowerCase();
    return availableLists
      .filter(list => 
        list.toLowerCase().includes(searchTerm) && 
        !selectedLists.includes(list)
      )
      .slice(0, 5);
  }, [newList, availableLists, selectedLists]);

  const getTagStyle = (tagName: string) => {
    const defaultTag = DEFAULT_TAG_SUGGESTIONS.find(t => t.name === tagName);
    return defaultTag?.color || 'bg-pink-100 text-pink-800 hover:bg-pink-200 border border-pink-200';
  };

  return (
    <div className="space-y-4">
      {/* Section Tags */}
      <div className="space-y-2">
        {/* Tags sélectionnés */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center text-xs px-1.5 py-0.5 rounded-md ${getTagStyle(tag)}`}
            >
              {tag}
              <button
                onClick={() => onTagsChange(selectedTags.filter(t => t !== tag))}
                className="ml-1 text-gray-500 hover:text-gray-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Input de tag avec suggestions */}
        <div className="relative tag-input-container">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onFocus={() => setShowTagSuggestions(true)}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-1 text-sm border rounded-md"
            />
            <button
              onClick={() => {
                if (newTag.trim()) {
                  onTagsChange([...selectedTags, newTag.trim()]);
                  setNewTag('');
                }
              }}
              className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Liste des suggestions */}
          {showTagSuggestions && (
            <div 
              className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
              onMouseLeave={() => setShowTagSuggestions(false)}
            >
              {tagSuggestions.map((tag) => (
                <button
                  key={tag.name}
                  className={`w-full px-3 py-1.5 text-left text-xs ${tag.color}`}
                  onClick={() => {
                    onTagsChange([...selectedTags, tag.name]);
                    setNewTag('');
                    setShowTagSuggestions(false);
                  }}
                >
                  {tag.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Tags récents */}
        {recentCustomTags.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Tags récents :</p>
            <div className="flex flex-wrap gap-1">
              {recentCustomTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => {
                    onTagsChange([...selectedTags, tag]);
                    setNewTag('');
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-pink-100 text-pink-800 hover:bg-pink-200"
                >
                  <Tag className="w-3 h-3" />
                  {tag}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Section Thèmes */}
      <div className="space-y-2">
        {/* Thèmes sélectionnés */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {selectedLists.map((list) => (
            <span
              key={list}
              className="inline-flex items-center text-xs px-1.5 py-0.5 rounded-md bg-blue-50 text-blue-800"
            >
              {list}
              <button
                onClick={() => onListsChange(selectedLists.filter(l => l !== list))}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        {/* Input de thème avec autocomplétion */}
        <div className="relative list-input-container">
          <div className="flex gap-2">
            <input
              type="text"
              value={newList}
              onChange={(e) => setNewList(e.target.value)}
              onFocus={() => setShowListSuggestions(true)}
              placeholder="Ajouter un thème..."
              className="flex-1 px-3 py-1 text-sm border rounded-md"
            />
            <button
              onClick={() => {
                if (newList.trim()) {
                  onListsChange([...selectedLists, newList.trim()]);
                  setNewList('');
                }
              }}
              className="px-2 py-1 text-sm bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Liste d'autocomplétion des thèmes */}
          {showListSuggestions && listSuggestions.length > 0 && (
            <div 
              className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg"
              onMouseLeave={() => setShowListSuggestions(false)}
            >
              {listSuggestions.map((list) => (
                <button
                  key={list}
                  className="w-full px-3 py-1.5 text-left text-xs bg-blue-50 text-blue-800 hover:bg-blue-100"
                  onClick={() => {
                    onListsChange([...selectedLists, list]);
                    setNewList('');
                    setShowListSuggestions(false);
                  }}
                >
                  {list}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Thèmes récents */}
        {recentLists.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Thèmes récents :</p>
            <div className="flex flex-wrap gap-1">
              {recentLists.map((list) => (
                <button
                  key={list}
                  onClick={() => {
                    onListsChange([...selectedLists, list]);
                    setNewList('');
                  }}
                  className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-100"
                >
                  <List className="w-3 h-3" />
                  {list}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 






























