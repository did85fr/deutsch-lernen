import React from 'react';
import { Outlet } from 'react-router-dom';
import { VersionInfo } from './VersionInfo';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Votre contenu de layout existant */}
      <Outlet />
      <VersionInfo />
    </div>
  );
}

