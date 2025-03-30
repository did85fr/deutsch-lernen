import React, { useState } from 'react';
import { checkGermanWord } from '../services/dictionaryService';

export function PonsTest() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleTest = async () => {
    if (!word.trim()) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await checkGermanWord(word);
      console.log('API Response:', {
        exists: response.exists,
        suggestions: response.suggestions.map(s => ({
          word: s.word,
          type: s.type,
          gender: s.gender,
          translation: s.translation
        }))
      });
      setResult(response);
    } catch (err) {
      console.error('API Error:', err);
      setError(err instanceof Error ? err.message : 'Une erreur est survenue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-lg font-bold mb-4">Test API PONS</h2>
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={word}
          onChange={(e) => setWord(e.target.value)}
          placeholder="Entrez un mot allemand"
          className="px-3 py-2 border rounded-md"
        />
        <button
          onClick={handleTest}
          disabled={isLoading || !word.trim()}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-gray-300"
        >
          {isLoading ? 'Chargement...' : 'Tester'}
        </button>
      </div>

      {error && (
        <div className="text-red-500 mb-4">
          Erreur: {error}
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h3 className="font-bold mb-2">Résultat:</h3>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-auto">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

