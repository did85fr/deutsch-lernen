import React from 'react';
import packageJson from '../../package.json';

export function VersionInfo() {
  return (
    <div className="fixed bottom-2 right-2 text-xs text-gray-400">
      v{packageJson.version}
    </div>
  );
}

