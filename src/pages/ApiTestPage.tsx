import React, { useState } from 'react';
import { checkGermanWord } from '../services/dictionaryService';

export function ApiTestPage() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      const response = await checkGermanWord(word);
      setResult(response);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: 'Test failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">API Test</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex gap-4 mb-4">
          <input 
            type="text" 
            value={word} 
            onChange={(e) => setWord(e.target.value)}
            placeholder="Enter German word"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button 
            onClick={handleTest}
            disabled={isLoading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Testing...' : 'Test API'}
          </button>
        </div>
        {result && (
          <div className="mt-4">
            <h2 className="text-lg font-semibold mb-2">Result:</h2>
            <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}