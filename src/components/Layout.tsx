import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { VersionInfo } from './VersionInfo';

export function Layout() {  // Suppression du props children qui n'est plus nécessaire
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6">
        <Outlet />
      </main>
      <VersionInfo />
    </div>
  );
}





