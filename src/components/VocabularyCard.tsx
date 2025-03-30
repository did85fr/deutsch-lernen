import React from 'react';
import { VocabularyEntry, Gender } from '../types/vocabulary';

interface VocabularyCardProps {
  entry: VocabularyEntry;
  onEdit: (entry: VocabularyEntry) => void;
  onDelete: (id: string) => void;
}

export function VocabularyCard({ entry, onEdit, onDelete }: VocabularyCardProps) {
  // Couleurs pour les genres grammaticaux
  const genderColors = {
    M: 'bg-blue-100 text-blue-800 border-blue-200',
    F: 'bg-pink-100 text-pink-800 border-pink-200',
    N: 'bg-green-100 text-green-800 border-green-200',
  };

  // Calcul du pourcentage de maîtrise
  const proficiencyLevels = {
    unknown: 0,
    learning: 33,
    almost: 66,
    mastered: 100,
  };

  const proficiencyPercentage = proficiencyLevels[entry.proficiency];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {/* Type de mot */}
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-md">
                {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
              </span>
              
              {/* Genre (pour les noms) */}
              {entry.type === 'noun' && entry.gender && (
                <span className={`px-2 py-1 text-xs font-medium border rounded-md ${genderColors[entry.gender as Gender]}`}>
                  {entry.gender === 'M' ? 'der' : entry.gender === 'F' ? 'die' : 'das'}
                </span>
              )}
            </div>

            {/* Mot allemand et sa traduction */}
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {entry.german}
              {entry.type === 'noun' && entry.plural && (
                <span className="text-sm text-gray-500 ml-2">
                  (pl: {entry.plural})
                </span>
              )}
            </h3>
            {/* Affichage des traductions avec leurs tags et thèmes spécifiques */}
            {entry.translations.map((t, index) => (
              <div key={index} className="mb-2">
                <div className="text-gray-600">
                  {t.text}
                  {t.context && (
                    <span className="text-sm text-gray-500">
                      {' '}({t.context})
                    </span>
                  )}
                </div>
                {(t.tags.length > 0 || t.lists.length > 0) && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {t.tags.map(tag => (
                      <span key={tag} className={`text-xs px-2 py-1 rounded ${getTagStyle(tag)}`}>
                        {tag}
                      </span>
                    ))}
                    {t.lists.map(list => (
                      <span key={list} className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-800">
                        {list}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Barre de progression */}
            <div className="mt-4">
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${proficiencyPercentage}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Maîtrise : {proficiencyPercentage}%
              </p>
            </div>
          </div>

          {/* Boutons d'action */}
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => onEdit(entry)}
              className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
              title="Modifier"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mot ?')) {
                  onDelete(entry.id);
                }
              }}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Supprimer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
