import React from 'react';
import { useNavigate } from 'react-router-dom';

const modes = [
  {
    id: 'de-fr',
    title: 'Allemand → Français',
    description: 'Traduisez les mots allemands en français',
    icon: '🇩🇪',
    color: 'bg-blue-500',
  },
  {
    id: 'fr-de',
    title: 'Français → Allemand',
    description: 'Traduisez les mots français en allemand',
    icon: '🇫🇷',
    color: 'bg-red-500',
  },
  {
    id: 'mixed',
    title: 'Mode Mixte',
    description: 'Alternance aléatoire entre les deux sens de traduction',
    icon: '🔄',
    color: 'bg-purple-500',
  },
];

export function MemoryGameMode() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Jeu de Mémoire</h1>
        <p className="text-lg text-gray-600">
          Choisissez votre mode d'entraînement
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-200"
          >
            <div className={`p-6 ${mode.color} text-white`}>
              <div className="text-4xl mb-4">{mode.icon}</div>
              <h2 className="text-2xl font-bold mb-2">{mode.title}</h2>
              <p className="text-white/90">{mode.description}</p>
            </div>
            <div className="p-6">
              <button
                onClick={() => navigate(`/memory/${mode.id}`)}
                className="w-full px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Commencer
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}