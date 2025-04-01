import React, { useState } from 'react';
import { checkGermanWord } from '../services/dictionaryService';

export function PonsTest() {
  const [word, setWord] = useState('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTest = async () => {
    setIsLoading(true);
    try {
      console.log('Testing word:', word);
      const response = await checkGermanWord(word);
      console.log('Test response:', response);
      setResult(response);
    } catch (error) {
      console.error('Test error:', error);
      setResult({ error: 'Test failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <input 
        type="text" 
        value={word} 
        onChange={(e) => setWord(e.target.value)}
        placeholder="Enter German word"
      />
      <button 
        onClick={handleTest}
        disabled={isLoading}
      >
        Test API
      </button>
      {result && (
        <pre>{JSON.stringify(result, null, 2)}</pre>
      )}
    </div>
  );
}




