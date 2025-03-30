import * as React from 'react';

interface GermanCharactersProps {
  onCharacterClick: (char: string) => void;
}

const GERMAN_SPECIAL_CHARACTERS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'] as const;

export function GermanCharacters({ onCharacterClick }: GermanCharactersProps) {
  const handleClick = React.useCallback(
    (char: string) => () => onCharacterClick(char),
    [onCharacterClick]
  );

  return (
    <div className="flex gap-2 mb-2" role="toolbar" aria-label="Caractères spéciaux allemands">
      {GERMAN_SPECIAL_CHARACTERS.map((char) => (
        <button
          key={char}
          type="button"
          onClick={handleClick(char)}
          className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
          aria-label={`Insérer le caractère ${char}`}
        >
          {char}
        </button>
      ))}
    </div>
  );
} 
