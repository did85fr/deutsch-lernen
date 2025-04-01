import * as React from 'react';
import { useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { Book, Plus, List, Brain, LogOut } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useVocabularyStore } from '../lib/store';
import { VersionInfo } from './VersionInfo';

// Définition des éléments de navigation
const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: Book
  },
  {
    name: 'Ajouter',
    href: '/add',
    icon: Plus
  },
  {
    name: 'Liste',
    href: '/list',
    icon: List
  },
  {
    name: 'Pratique',
    href: '/practice',
    icon: Brain
  }
];

interface LayoutProps {
  children?: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const clearStore = useVocabularyStore(state => state.clearStore);

  const handleLogout = async () => {
    try {
      clearStore();
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erreur lors de la déconnexion:', error);
        throw error;
      }

      localStorage.removeItem('sb-yofexqdswetgoscpwmjz-auth-token');
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
      localStorage.removeItem('sb-yofexqdswetgoscpwmjz-auth-token');
      navigate('/', { replace: true });
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-indigo-600">Deutsch Lernen</span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      location.pathname === item.href
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    <item.icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleLogout}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <VersionInfo />
        <Outlet />
      </main>

      {import.meta.env.DEV && (
        <button 
          onClick={() => console.log(authLogger.exportLogs())} 
          className="fixed bottom-4 right-4 bg-red-500 text-white p-2 rounded-lg text-sm"
        >
          Debug Auth
        </button>
      )}
    </div>
  );
}





