import * as React from 'react';
import { useState, useMemo, useEffect, useCallback } from 'react';
import { X, Plus, Tag, List } from 'lucide-react';

// Tags suggérés par défaut avec leurs couleurs
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

  // Récupérer les 5 derniers thèmes les plus utilisés
  const recentlyUsedLists = useMemo(() => {
    if (!availableLists?.length) return [];
    
    const listFrequency = availableLists.reduce((acc, list) => {
      acc[list] = (acc[list] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(listFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([list]) => list);
  }, [availableLists]);

  // Récupérer les tags les plus utilisés
  const recentlyUsedTags = useMemo(() => {
    if (!availableTags?.length) return [];
    
    const customTags = availableTags.filter(
      tag => !DEFAULT_TAG_SUGGESTIONS.some(defaultTag => defaultTag.name === tag)
    );
    
    const tagFrequency = customTags.reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(tagFrequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [availableTags]);

  // Récupérer les thèmes disponibles (non sélectionnés)
  const availableRecentLists = useMemo(() => {
    return recentlyUsedLists.filter(list => !selectedLists.includes(list));
  }, [recentlyUsedLists, selectedLists]);

  const filteredTagSuggestions = useMemo(() => {
    if (!newTag.trim()) {
      // Afficher les tags par défaut si aucune recherche n'est en cours
      return DEFAULT_TAG_SUGGESTIONS.map(tag => tag.name)
        .filter(tagName => !selectedTags.includes(tagName));
    }

    // Filtrer les tags disponibles basés sur la recherche
    const searchResults = availableTags
      .filter(tag => 
        tag.toLowerCase().includes(newTag.toLowerCase()) && 
        !selectedTags.includes(tag)
      )
      .slice(0, 5);
    
    // Combiner avec les tags par défaut si pertinent
    const defaultMatches = DEFAULT_TAG_SUGGESTIONS
      .map(tag => tag.name)
      .filter(tagName => 
        tagName.toLowerCase().includes(newTag.toLowerCase()) && 
        !selectedTags.includes(tagName)
      );

    return [...defaultMatches, ...searchResults]
      .filter((tag, index, self) => self.indexOf(tag) === index)
      .slice(0, 5);
  }, [newTag, availableTags, selectedTags]);

  const filteredListSuggestions = useMemo(() => {
    if (!newList.trim()) {
      // Afficher les thèmes récents si aucune recherche n'est en cours
      return recentlyUsedLists.filter(list => !selectedLists.includes(list));
    }
    
    // Sinon, filtrer les thèmes disponibles basés sur la recherche
    const searchResults = availableLists
      .filter(list => 
        list.toLowerCase().includes(newList.toLowerCase()) && 
        !selectedLists.includes(list)
      )
      .slice(0, 5);
    
    // Combiner avec les thèmes récents si pertinent
    const recentMatches = recentlyUsedLists
      .filter(list => 
        list.toLowerCase().includes(newList.toLowerCase()) && 
        !selectedLists.includes(list)
      );
    
    return [...recentMatches, ...searchResults]
      .filter((list, index, self) => self.indexOf(list) === index)
      .slice(0, 5);
  }, [newList, availableLists, selectedLists, recentlyUsedLists]);

  const handleClickOutside = useCallback((event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (!target.closest('.tag-input-container')) {
      setShowTagSuggestions(false);
      setShowListSuggestions(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const handleAddTag = (tagName: string) => {
    if (!tagName.trim()) return;
    
    const existingTag = availableTags.find(
      tag => tag.toLowerCase() === tagName.toLowerCase()
    );
    const finalTag = existingTag || tagName;
    
    if (!selectedTags.includes(finalTag)) {
      onTagsChange([...selectedTags, finalTag]);
    }
    
    setNewTag('');
    setShowTagSuggestions(false);
  };

  const handleAddList = (listName: string) => {
    if (!listName.trim()) return;
    
    const existingList = availableLists.find(
      list => list.toLowerCase() === listName.toLowerCase()
    );
    const finalList = existingList || listName;
    
    if (!selectedLists.includes(finalList)) {
      onListsChange([...selectedLists, finalList]);
    }
    
    setNewList('');
    setShowListSuggestions(false);
  };

  const handleRemoveTag = (tag: string) => {
    onTagsChange(selectedTags.filter(t => t !== tag));
  };

  const handleRemoveList = (list: string) => {
    onListsChange(selectedLists.filter(l => l !== list));
  };

  // Modifions d'abord la logique pour déterminer la couleur du tag
  const getTagStyle = (tagName: string) => {
    const defaultTag = DEFAULT_TAG_SUGGESTIONS.find(t => t.name === tagName);
    return defaultTag?.color || 'bg-pink-100 text-pink-800 hover:bg-pink-200 border border-pink-200';
  };

  return (
    <div className="space-y-4">
      {/* Tags Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Tag className="w-4 h-4" />
          <h3 className="text-sm font-medium">Tags</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className={`inline-flex items-center text-sm h-6 px-2 rounded-md ${getTagStyle(tag)}`}
            >
              {tag}
              <button
                onClick={() => handleRemoveTag(tag)}
                className={`ml-1 ${
                  DEFAULT_TAG_SUGGESTIONS.find(t => t.name === tag) 
                    ? 'text-gray-500 hover:text-gray-700'
                    : 'text-pink-500 hover:text-pink-700'
                }`}
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="relative tag-input-container">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTag}
              onChange={(e) => {
                setNewTag(e.target.value);
                setShowTagSuggestions(true);
              }}
              onFocus={() => setShowTagSuggestions(true)}
              placeholder="Ajouter un tag..."
              className="flex-1 px-3 py-1 text-sm border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag(newTag)}
            />
            <button
              type="button"
              onClick={() => handleAddTag(newTag)}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showTagSuggestions && filteredTagSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {filteredTagSuggestions.map((tagName) => {
                const defaultTag = DEFAULT_TAG_SUGGESTIONS.find(t => t.name === tagName);
                return (
                  <button
                    key={tagName}
                    className={`w-full px-3 py-2 text-left text-sm ${
                      defaultTag ? defaultTag.color : 'bg-pink-100 text-pink-800 hover:bg-pink-200 border border-pink-200'
                    }`}
                    onClick={() => handleAddTag(tagName)}
                  >
                    {tagName}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Affichage des tags récents si présents */}
        {recentlyUsedTags.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Tags récents :</p>
            <div className="flex flex-wrap gap-1">
              {recentlyUsedTags
                .filter(tag => !selectedTags.includes(tag))
                .map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleAddTag(tag)}
                    className={`inline-flex items-center text-sm h-6 px-2 rounded-md ${getTagStyle(tag)}`}
                  >
                    {tag}
                  </button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Lists Section */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <List className="w-4 h-4" />
          <h3 className="text-sm font-medium">Thèmes</h3>
        </div>

        <div className="flex flex-wrap gap-2 mb-2">
          {selectedLists.map((list) => (
            <span
              key={list}
              className="inline-flex items-center text-sm h-6 px-2 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
            >
              {list}
              <button
                onClick={() => handleRemoveList(list)}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="relative list-input-container">
          <div className="flex gap-2">
            <input
              type="text"
              value={newList}
              onChange={(e) => {
                setNewList(e.target.value);
                setShowListSuggestions(true);
              }}
              onFocus={() => setShowListSuggestions(true)}
              placeholder="Ajouter un thème..."
              className="flex-1 px-3 py-1 text-sm border rounded-md"
              onKeyPress={(e) => e.key === 'Enter' && handleAddList(newList)}
            />
            <button
              type="button"
              onClick={() => handleAddList(newList)}
              className="px-3 py-1 text-sm bg-gray-100 rounded-md hover:bg-gray-200"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {showListSuggestions && filteredListSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg">
              {filteredListSuggestions.map((list) => (
                <button
                  key={list}
                  className="w-full px-3 py-2 text-left text-sm bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                  onClick={() => handleAddList(list)}
                >
                  {list}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Affichage des thèmes récents */}
        {availableRecentLists.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-gray-500 mb-1">Thèmes récents :</p>
            <div className="flex flex-wrap gap-1">
              {availableRecentLists.map((list) => (
                <button
                  key={list}
                  onClick={() => handleAddList(list)}
                  className="inline-flex items-center text-sm h-6 px-2 rounded-md bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200"
                >
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




















