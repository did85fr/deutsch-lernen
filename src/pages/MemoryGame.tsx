import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { useVocabularyStore } from '../lib/store';
import { useToast } from '../components/ui/use-toast';
import type { VocabularyEntry } from '../types/vocabulary';

export function MemoryGame() {
  const navigate = useNavigate();
  const { mode } = useParams<{ mode: string }>();
  const { entries, loading, updateEntry } = useVocabularyStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [shuffledWords, setShuffledWords] = useState<VocabularyEntry[]>([]);
  const { toast } = useToast();
  const [userAnswer, setUserAnswer] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  // Détermine si on montre le mot allemand ou français en premier
  const isGermanFirst = mode === 'de-fr' || (mode === 'mixed' && Math.random() > 0.5);

  useEffect(() => {
    if (!loading && entries.length > 0) {
      const dueWords = entries.filter(entry => {
        if (!entry.sm2State?.nextReview) return true;
        const nextReview = new Date(entry.sm2State.nextReview);
        return nextReview <= new Date();
      });
      
      setShuffledWords(dueWords.sort(() => Math.random() - 0.5));
    }
  }, [entries, loading]);

  const currentWord = shuffledWords[currentIndex];

  const handleSubmitAnswer = () => {
    setHasSubmitted(true);
    setShowAnswer(true);
  };

  useEffect(() => {
    if (showAnswer) {
      // Présélectionner le niveau en fonction de la proficiency actuelle
      const proficiencyToLevel = {
        'unknown': 0,
        'learning': 2,
        'almost': 3,
        'mastered': 5
      };
      setSelectedLevel(proficiencyToLevel[currentWord.proficiency]);
    }
  }, [showAnswer, currentWord]);

  const handleNextWord = async (quality: 0 | 1 | 2 | 3 | 4 | 5) => {
    if (!currentWord) return;

    try {
      const now = new Date();
      const updatedEntry = {
        ...currentWord,
        sm2State: {
          ...currentWord.sm2State,
          lastReview: now.toISOString(),
          quality,
        },
      };

      await updateEntry(updatedEntry);
      
      if (currentIndex < shuffledWords.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setShowAnswer(false);
        setHasSubmitted(false);
        setUserAnswer('');
      } else {
        toast({
          title: "Révision terminée !",
          description: "Vous avez révisé tous les mots disponibles.",
        });
        navigate('/memory');
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le mot.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des mots...</p>
        </div>
      </div>
    );
  }

  if (shuffledWords.length === 0) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold mb-4">Aucun mot à réviser</h2>
          <p className="text-gray-600 mb-6">
            Tous vos mots sont à jour ! Revenez plus tard pour de nouvelles révisions.
          </p>
          <Button onClick={() => navigate('/memory')}>
            Retour à la sélection
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Barre de progression */}
      <div className="mb-8 text-center">
        <div className="text-2xl font-bold text-gray-700 mb-2">
          {currentIndex + 1} / {shuffledWords.length}
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4">
          <div
            className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / shuffledWords.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Carte principale */}
      <div className="bg-white shadow-lg rounded-xl p-8">
        <div className="text-center space-y-8">
          {/* Mot à traduire */}
          <div className="py-2">
            <div className="flex items-center justify-center">
              {currentWord.type === 'noun' && isGermanFirst && (
                <span className="text-4xl md:text-4xl font-bold text-gray-500 mr-3">
                  {currentWord.gender === 'M' ? 'der' : 
                   currentWord.gender === 'F' ? 'die' : 'das'}
                </span>
              )}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                {isGermanFirst ? currentWord.german : currentWord.french}
              </h2>
            </div>

            {/* Niveau de maîtrise */}
            <div className="mt-2 flex items-center justify-center gap-2">
              <span className="text-sm text-gray-500">Niveau actuel :</span>
              <span className={`px-2 py-1 rounded-full text-sm ${
                currentWord.proficiency === 'mastered' ? 'bg-green-100 text-green-800' :
                currentWord.proficiency === 'almost' ? 'bg-yellow-100 text-yellow-800' :
                currentWord.proficiency === 'learning' ? 'bg-blue-100 text-blue-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {currentWord.proficiency === 'mastered' ? 'Maîtrisé' :
                 currentWord.proficiency === 'almost' ? 'Presque maîtrisé' :
                 currentWord.proficiency === 'learning' ? 'En apprentissage' :
                 'Nouveau'}
              </span>
            </div>
          </div>

          {/* Zone de saisie de la réponse */}
          {!hasSubmitted && (
            <div className="space-y-2">
              <input
                type="text"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && userAnswer.trim()) {
                    setHasSubmitted(true);
                    setShowAnswer(true);
                  }
                }}
                placeholder="Tapez votre réponse..."
                className="w-full px-4 py-3 text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                autoFocus
              />
              <button
                onClick={() => {
                  if (userAnswer.trim()) {
                    setHasSubmitted(true);
                    setShowAnswer(true);
                  }
                }}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
              >
                Vérifier
              </button>
            </div>
          )}

          {/* Zone de réponse et évaluation */}
          {hasSubmitted && (
            <div className="space-y-2">
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-gray-50">
                  <p className="text-sm text-gray-600 mb-1">Votre réponse :</p>
                  <p className="text-xl md:text-2xl font-medium">
                    {userAnswer}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  userAnswer.toLowerCase().trim() === (isGermanFirst ? currentWord.french : currentWord.german).toLowerCase().trim()
                    ? 'bg-green-50'
                    : 'bg-red-50'
                }`}>
                  <p className="text-sm text-gray-600 mb-1">Réponse correcte :</p>
                  <p className="text-xl md:text-2xl font-medium">
                    {isGermanFirst ? currentWord.french : currentWord.german}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-base md:text-lg font-medium text-gray-700">Comment évaluez-vous votre connaissance de ce mot ?</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {[
                    { 
                      value: 0, 
                      label: "Je ne sais pas", 
                      gradient: "from-red-400 via-red-500 to-red-600",
                      ring: "ring-red-300"
                    },
                    { 
                      value: 2, 
                      label: "En cours", 
                      gradient: "from-yellow-400 via-yellow-500 to-yellow-600",
                      ring: "ring-yellow-300"
                    },
                    { 
                      value: 3, 
                      label: "Presque", 
                      gradient: "from-blue-400 via-blue-500 to-blue-600",
                      ring: "ring-blue-300"
                    },
                    { 
                      value: 5, 
                      label: "Je sais", 
                      gradient: "from-green-400 via-green-500 to-green-600",
                      ring: "ring-green-300"
                    }
                  ].map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setSelectedLevel(level.value)}
                      className={`
                        relative py-3 px-4 
                        text-white font-medium rounded-lg
                        transition-all duration-200
                        bg-gradient-to-r ${level.gradient}
                        hover:bg-gradient-to-br
                        focus:outline-none focus:ring-4 ${level.ring}
                        ${selectedLevel === level.value 
                          ? 'ring-4 transform scale-95 shadow-inner' 
                          : 'shadow-md hover:shadow-lg'
                        }
                      `}
                    >
                      <span className="py-1">{level.label}</span>
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => selectedLevel !== null && handleNextWord(selectedLevel)}
                  disabled={selectedLevel === null}
                  className={`
                    w-full mt-4 py-3 px-4 
                    rounded-lg text-white font-medium
                    transition-all duration-200
                    ${selectedLevel !== null
                      ? 'bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 hover:bg-gradient-to-br focus:ring-4 focus:outline-none focus:ring-indigo-300 shadow-md hover:shadow-lg'
                      : 'bg-gray-300 cursor-not-allowed'
                    }
                  `}
                >
                  Mot suivant
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
