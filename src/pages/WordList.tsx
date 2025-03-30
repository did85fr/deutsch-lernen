import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useVocabularyStore } from '../lib/store';
import { VocabularyEntry, WordType } from '../types/vocabulary';
import { Edit2, Trash2, ChevronUp, ChevronDown, Star, BarChart2 } from 'lucide-react';

const getGenderColor = (gender: string | null): string => {
  switch (gender) {
    case 'M':
      return 'bg-blue-100 text-blue-800';
    case 'F':
      return 'bg-pink-100 text-pink-800';
    case 'N':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getGenderArticle = (gender: string | null): string => {
  switch (gender) {
    case 'M':
      return 'der';
    case 'F':
      return 'die';
    case 'N':
      return 'das';
    default:
      return '';
  }
};

const getProficiencyColor = (proficiency: string): string => {
  switch (proficiency) {
    case 'mastered':
      return 'bg-green-100 text-green-800';
    case 'almost':
      return 'bg-yellow-100 text-yellow-800';
    case 'learning':
      return 'bg-blue-100 text-blue-800';
    case 'unknown':
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const formatDate = (dateString: string | null): string => {
  if (!dateString) return '—';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '—';

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

export function WordList() {
  // Déclarer TOUS les hooks d'abord
  const { 
    entries, 
    loadEntries, 
    loading, 
    error, 
    deleteEntry, 
    updateEntry, 
    tags, 
    lists 
  } = useVocabularyStore();
  const navigate = useNavigate();
  const [showStats, setShowStats] = useState(false);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [proficiencyFilter, setProficiencyFilter] = useState<string>('all');
  const [tagFilter, setTagFilter] = useState<string>('all');
  const [listFilter, setListFilter] = useState<string>('all');
  const [favoriteFilter, setFavoriteFilter] = useState<boolean | null>(null);
  const [sortField, setSortField] = useState<keyof VocabularyEntry>('german');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const handleEdit = (id: string) => {
    navigate(`/edit/${id}`);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce mot ?')) {
      try {
        await deleteEntry(id);
        // Afficher une notification de succès si vous en avez une
      } catch (error) {
        // Gérer l'erreur
        console.error('Erreur lors de la suppression:', error);
      }
    }
  };

  useEffect(() => {
    console.log('Loading entries...');
    loadEntries();
  }, [loadEntries]);

  // Calcul des stats avec useMemo
  const calculateStats = useMemo(() => {
    const now = new Date();
    const oneDay = 24 * 60 * 60 * 1000;
    const oneWeek = 7 * oneDay;
    const oneMonth = 30 * oneDay;

    const stats = {
      total: {
        words: entries.length,
        favorites: entries.filter(e => e.isFavorite).length
      },
      review: {
        overdue: 0,
        due: 0,
        upcoming: 0
      },
      time: {
        today: 0,
        week: 0,
        month: 0
      },
      tags: new Map<string, number>(),
      lists: new Map<string, number>()
    };

    entries.forEach(entry => {
      // Calcul des stats temporelles
      if (entry.lastReviewed) {
        const reviewDate = new Date(entry.lastReviewed);
        const timeDiff = now.getTime() - reviewDate.getTime();
        
        if (timeDiff <= oneDay) {
          stats.time.today++;
        }
        if (timeDiff <= oneWeek) {
          stats.time.week++;
        }
        if (timeDiff <= oneMonth) {
          stats.time.month++;
        }
      }

      // Le reste du code existant pour tags, lists, etc.
      if (entry.tags) {
        entry.tags.forEach(tag => {
          stats.tags.set(tag, (stats.tags.get(tag) || 0) + 1);
        });
      }

      if (entry.lists) {
        entry.lists.forEach(list => {
          stats.lists.set(list, (stats.lists.get(list) || 0) + 1);
        });
      }

      if (entry.nextReview) {
        const nextReviewDate = new Date(entry.nextReview);
        const diff = nextReviewDate.getTime() - now.getTime();
        
        if (diff < 0) {
          stats.review.overdue++;
        } else if (diff <= oneDay) {
          stats.review.due++;
        } else if (diff <= oneWeek) {
          stats.review.upcoming++;
        }
      }
    });

    return {
      ...stats,
      tags: Array.from(stats.tags.entries()).sort((a, b) => b[1] - a[1]),
      lists: Array.from(stats.lists.entries()).sort((a, b) => b[1] - a[1])
    };
  }, [entries]);

  // Composant pour les icônes de tri
  const SortIcon = ({ field }: { field: keyof VocabularyEntry }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <ChevronUp className="w-4 h-4 inline" /> : <ChevronDown className="w-4 h-4 inline" />;
  };

  // Filtrage et tri des entrées
  const filteredAndSortedEntries = useMemo(() => {
    return entries
      .filter(entry => {
        if (typeFilter !== 'all' && entry.type !== typeFilter) return false;
        if (genderFilter !== 'all' && entry.gender !== genderFilter) return false;
        if (proficiencyFilter !== 'all' && entry.proficiency !== proficiencyFilter) return false;
        if (tagFilter !== 'all' && (!entry.tags || !entry.tags.includes(tagFilter))) return false;
        if (listFilter !== 'all' && (!entry.lists || !entry.lists.includes(listFilter))) return false;
        if (favoriteFilter !== null && entry.isFavorite !== favoriteFilter) return false;
        return true;
      })
      .sort((a, b) => {
        const aValue = a[sortField];
        const bValue = b[sortField];

        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;

        let comparison = 0;
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          comparison = aValue.localeCompare(bValue);
        } else if (aValue instanceof Date && bValue instanceof Date) {
          comparison = aValue.getTime() - bValue.getTime();
        } else {
          comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        return sortDirection === 'asc' ? comparison : -comparison;
      });
  }, [
    entries,
    typeFilter,
    genderFilter,
    proficiencyFilter,
    tagFilter,
    listFilter,
    favoriteFilter,
    sortField,
    sortDirection
  ]);

  // Rendu conditionnel APRÈS tous les hooks
  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="text-red-600">
          <h2 className="text-xl font-bold mb-2">Erreur</h2>
          <p>{error}</p>
          <button
            onClick={() => loadEntries()}
            className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  // Rendu principal
  return (
    <div className="bg-white shadow rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <h2 className="text-2xl font-bold text-gray-900">Liste des mots</h2>
          <button
            onClick={() => setShowStats(!showStats)}
            className={`px-4 py-2 text-sm rounded-lg flex items-center gap-2 transition-colors ${
              showStats 
                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            {showStats ? 'Masquer les statistiques' : 'Afficher les statistiques'}
          </button>
        </div>

        <button
          onClick={() => loadEntries()}
          className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 h-10"
        >
          Actualiser
        </button>
      </div>

      {showStats && (
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Statistiques</h2>
          
          {/* Vue d'ensemble */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-indigo-50 p-4 rounded-lg">
              <h3 className="text-indigo-700 font-medium">Total</h3>
              <p className="text-2xl font-bold">{calculateStats.total.words}</p>
              <p className="text-sm text-indigo-600">
                dont {calculateStats.total.favorites} favoris
              </p>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="text-green-700 font-medium">À réviser</h3>
              <p className="text-2xl font-bold">{calculateStats.review.due}</p>
              <p className="text-sm text-green-600">
                {calculateStats.review.overdue} en retard
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="text-blue-700 font-medium">Cette semaine</h3>
              <p className="text-2xl font-bold">{calculateStats.time.week}</p>
              <p className="text-sm text-blue-600">
                dont {calculateStats.time.today} aujourd'hui
              </p>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="text-purple-700 font-medium">Ce mois</h3>
              <p className="text-2xl font-bold">{calculateStats.time.month}</p>
              <p className="text-sm text-purple-600">
                {Math.round(calculateStats.time.month / 30)} mots/jour
              </p>
            </div>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tags */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Tags les plus utilisés</h3>
              <div className="space-y-2">
                {calculateStats.tags.slice(0, 5).map(([tag, count]) => (
                  <div key={tag} className="flex justify-between items-center">
                    <span className="text-gray-600">{tag}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Listes */}
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Listes</h3>
              <div className="space-y-2">
                {calculateStats.lists.slice(0, 5).map(([list, count]) => (
                  <div key={list} className="flex justify-between items-center">
                    <span className="text-gray-600">{list}</span>
                    <span className="text-gray-900 font-medium">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-6 mb-8">
        <div>
          <label htmlFor="typeFilter" className="block text-sm font-medium text-indigo-600 mb-2">
            Type de mot
          </label>
          <select
            id="typeFilter"
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              if (e.target.value !== 'noun') {
                setGenderFilter('all');
              }
            }}
            className="block w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          >
            <option value="all">Tous les types</option>
            <option value="noun">Noms</option>
            <option value="verb">Verbes</option>
            <option value="adjective">Adjectifs</option>
            <option value="adverb">Adverbes</option>
            <option value="phrase">Expressions</option>
          </select>
        </div>

        {typeFilter === 'noun' && (
          <div>
            <label htmlFor="genderFilter" className="block text-sm font-medium text-indigo-600 mb-2">
              Article
            </label>
            <select
              id="genderFilter"
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="block w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
            >
              <option value="all">Tous les articles</option>
              <option value="M">Masculin (der)</option>
              <option value="F">Féminin (die)</option>
              <option value="N">Neutre (das)</option>
            </select>
          </div>
        )}

        <div>
          <label htmlFor="proficiencyFilter" className="block text-sm font-medium text-indigo-600 mb-2">
            Niveau de maîtrise
          </label>
          <select
            id="proficiencyFilter"
            value={proficiencyFilter}
            onChange={(e) => setProficiencyFilter(e.target.value)}
            className="block w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          >
            <option value="all">Tous les niveaux</option>
            <option value="unknown">Non appris</option>
            <option value="learning">En apprentissage</option>
            <option value="almost">Presque maîtrisé</option>
            <option value="mastered">Maîtrisé</option>
          </select>
        </div>

        <div>
          <label htmlFor="tagFilter" className="block text-sm font-medium text-indigo-600 mb-2">
            Tag
          </label>
          <select
            id="tagFilter"
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="block w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          >
            <option value="all">Tous les tags</option>
            {tags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="listFilter" className="block text-sm font-medium text-indigo-600 mb-2">
            Liste thématique
          </label>
          <select
            id="listFilter"
            value={listFilter}
            onChange={(e) => setListFilter(e.target.value)}
            className="block w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          >
            <option value="all">Toutes les listes</option>
            {lists.map(list => (
              <option key={list} value={list}>{list}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="favoriteFilter" className="block text-sm font-medium text-indigo-600 mb-2">
            Favoris
          </label>
          <select
            id="favoriteFilter"
            value={favoriteFilter === null ? 'all' : favoriteFilter ? 'true' : 'false'}
            onChange={(e) => setFavoriteFilter(e.target.value === 'all' ? null : e.target.value === 'true')}
            className="block w-full px-4 py-2.5 text-gray-700 bg-gray-50 border border-gray-300 rounded-lg hover:border-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 shadow-sm"
          >
            <option value="all">Tous les mots</option>
            <option value="true">Favoris uniquement</option>
            <option value="false">Non favoris</option>
          </select>
        </div>
      </div>
      
      {filteredAndSortedEntries.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">Aucun mot ne correspond aux filtres sélectionnés.</p>
          <p className="text-sm text-gray-500">
            Essayez de modifier les filtres ou d'ajouter de nouveaux mots !
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortField === 'german' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSort('german')}
                >
                  Allemand <SortIcon field="german" />
                </th>
                <th 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortField === 'french' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSort('french')}
                >
                  Français <SortIcon field="french" />
                </th>
                <th 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortField === 'type' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSort('type')}
                >
                  Type <SortIcon field="type" />
                </th>
                <th 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortField === 'proficiency' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSort('proficiency')}
                >
                  Maîtrise <SortIcon field="proficiency" />
                </th>
                <th 
                  scope="col" 
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer ${sortField === 'lastReviewed' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-100'}`}
                  onClick={() => handleSort('lastReviewed')}
                >
                  Dernière révision <SortIcon field="lastReviewed" />
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredAndSortedEntries.map((entry: VocabularyEntry) => (
                <tr key={entry.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <button
                        onClick={() => handleToggleFavorite(entry)}
                        className={`mr-2 focus:outline-none ${entry.isFavorite ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                        title={entry.isFavorite ? "Retirer des favoris" : "Ajouter aux favoris"}
                      >
                        <Star 
                          className="w-5 h-5" 
                          fill={entry.isFavorite ? "currentColor" : "none"} 
                          stroke="currentColor"
                        />
                      </button>
                      <div className="text-sm font-medium text-gray-900">
                        {entry.type === 'noun' ? (
                          <span>
                            <span className={`${getGenderColor(entry.gender)} px-2 py-0.5 rounded-md mr-2`}>
                              {getGenderArticle(entry.gender)}
                            </span>
                        {entry.german}
                          </span>
                        ) : (
                          entry.german
                        )}
                        {entry.plural && (
                          <span className="text-gray-500 ml-2">
                            (die {entry.plural})
                          </span>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {entry.french}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      {entry.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getProficiencyColor(entry.proficiency)}`}>
                      {entry.proficiency}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {console.log('lastReviewed value:', entry.lastReviewed)}
                    {formatDate(entry.lastReviewed)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(entry.id)}
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(entry.id)}
                      className="text-red-600 hover:text-red-900"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}















