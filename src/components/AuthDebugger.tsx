// Toujours importer React explicitement
import * as React from 'react';
import { useState } from 'react'; // Remplacer useEffect par useState
import { authLogger } from '../lib/authLogger';

export function AuthDebugger() {
  const [showLogs, setShowLogs] = useState(false);

  const downloadLogs = () => {
    const blob = new Blob([authLogger.exportLogs()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `auth-logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!import.meta.env.DEV) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => setShowLogs(!showLogs)}
        className="bg-gray-800 text-white px-4 py-2 rounded-lg"
      >
        {showLogs ? 'Hide Logs' : 'Show Logs'}
      </button>
      {showLogs && (
        <div className="fixed bottom-16 right-4 w-96 max-h-96 overflow-auto bg-gray-900 text-white p-4 rounded-lg">
          <button
            onClick={downloadLogs}
            className="mb-2 bg-blue-500 text-white px-2 py-1 rounded"
          >
            Download Logs
          </button>
          <pre className="text-xs">
            {authLogger.exportLogs()}
          </pre>
        </div>
      )}
    </div>
  );
}
