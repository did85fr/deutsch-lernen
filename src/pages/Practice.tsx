import React from 'react';
import { useNavigate } from 'react-router-dom';

interface GameCard {
  title: string;
  description: string;
  path: string;
  icon: string;
}

const games: GameCard[] = [
  {
    title: 'Jeu de Mémoire',
    description: 'Testez votre mémoire avec le système SM2. Révisez votre vocabulaire de manière intelligente.',
    path: '/memory',
    icon: '🧠',
  },
  // Autres jeux à venir...
];

export function Practice() {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Exercices</h1>
        <p className="text-lg text-gray-600">
          Choisissez un jeu pour pratiquer votre vocabulaire allemand
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game) => (
          <div
            key={game.path}
            onClick={() => navigate(game.path)}
            className="bg-white rounded-xl overflow-hidden shadow-lg p-4 sm:p-5 py-8 sm:py-12 text-left 
                     transform duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer"
          >
            <div className="text-center p-3 sm:p-5">
              <span className="text-6xl sm:text-8xl">{game.icon}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-5 h-12 sm:h-16 text-indigo-600">
              {game.title}
            </h1>

            <div className="flex flex-col items-center sm:items-start sm:flex-row gap-2 sm:gap-0 sm:space-x-1 mb-5">
              <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm w-fit">
                Vocabulaire
              </div>
              <div className="px-3 py-1 bg-indigo-100 text-indigo-600 rounded-full text-sm w-fit">
                Mémoire
              </div>
            </div>

            <p className="mb-8 text-gray-600 leading-relaxed text-sm sm:text-base">
              {game.description}
            </p>

            <button 
              className="w-full p-3 sm:p-4 bg-indigo-600 text-white rounded-xl text-base sm:text-lg font-semibold
                         transform transition-all duration-300 hover:scale-105 hover:bg-indigo-700
                         focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Commencer
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}






