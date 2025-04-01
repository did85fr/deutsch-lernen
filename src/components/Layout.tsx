import React from 'react';
import { Outlet } from 'react-router-dom';
import { VersionInfo } from './VersionInfo';
import { Header } from './Header';

export function Layout() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <VersionInfo />
    </div>
  );
}


