import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../lib/store';
import { VocabularyCard } from '../components/VocabularyCard';
import { VocabularyEntry, WordType } from '../types/vocabulary';
import { Toast } from '../components/Toast';

export function VocabularyList() {
  const navigate = useNavigate();
  const { entries, loadEntries, deleteEntry } = useVocabularyStore();
  const [selectedType, setSelectedType] = useState<WordType | 'all'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    loadEntries();
  }, [loadEntries]);

  // Filtrer les entrées par type et terme de recherche
  const filteredEntries = entries.filter(entry => {
    const matchesType = selectedType === 'all' || entry.type === selectedType;
    const matchesSearch = searchTerm === '' || 
      entry.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.french.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Grouper les entrées par type
  const groupedEntries = filteredEntries.reduce((acc, entry) => {
    if (!acc[entry.type]) {
      acc[entry.type] = [];
    }
    acc[entry.type].push(entry);
    return acc;
  }, {} as Record<WordType, VocabularyEntry[]>);

  const handleDelete = async (id: string) => {
    try {
      await deleteEntry(id);
      setToast({
        message: 'Mot supprimé avec succès',
        type: 'success'
      });
    } catch (error) {
      setToast({
        message: 'Erreur lors de la suppression',
        type: 'error'
      });
    }
  };

  const handleEdit = (entry: VocabularyEntry) => {
    navigate(`/edit/${entry.id}`);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* En-tête avec filtres */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Mon Vocabulaire</h1>
          <button
            onClick={() => navigate('/add')}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Ajouter un mot
          </button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtre par type */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value as WordType | 'all')}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          >
            <option value="all">Tous les types</option>
            <option value="noun">Noms</option>
            <option value="verb">Verbes</option>
            <option value="adjective">Adjectifs</option>
            <option value="adverb">Adverbes</option>
            <option value="phrase">Expressions</option>
            <option value="quote">Citations</option>
          </select>

          {/* Barre de recherche */}
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Rechercher un mot..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <svg
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Liste des mots */}
      <div className="space-y-8">
        {Object.entries(groupedEntries).map(([type, entries]) => (
          <div key={type}>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              {type.charAt(0).toUpperCase() + type.slice(1)}s
              <span className="ml-2 text-sm text-gray-500">({entries.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {entries.map((entry) => (
                <VocabularyCard
                  key={entry.id}
                  entry={entry}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun mot trouvé</p>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      {toast && (
        <div className="fixed bottom-4 right-4 w-72">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </div>
  );
} 