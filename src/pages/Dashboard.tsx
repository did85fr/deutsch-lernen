import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, List, Brain } from 'lucide-react';
import { useVocabularyStore } from '../lib/store';
import { LearningStats } from '../components/LearningStats';
import { supabase } from '../lib/supabase';

export function Dashboard() {
  const navigate = useNavigate();
  const { entries, loading, loadEntries } = useVocabularyStore();

  useEffect(() => {
    const checkAndLoadData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session && (!entries || entries.length === 0)) {
        console.log('Chargement initial des données du dashboard');
        await loadEntries();
      }
    };

    checkAndLoadData();
  }, [loadEntries, entries]);

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to Deutsch Lernen
        </h2>
        <p className="text-gray-600">
          Your personal German vocabulary learning assistant. Start adding words,
          practice regularly, and track your progress.
        </p>
      </div>

      {/* Statistiques d'apprentissage */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          Learning Progress
        </h3>
        <LearningStats entries={entries} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <button
          onClick={() => navigate('/add')}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <Plus className="w-8 h-8 text-indigo-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Add New Word</h3>
          <p className="mt-2 text-sm text-gray-500">
            Add a new word, phrase, or quote to your vocabulary list
          </p>
        </button>

        <button
          onClick={() => navigate('/list')}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <List className="w-8 h-8 text-indigo-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">View Word List</h3>
          <p className="mt-2 text-sm text-gray-500">
            Browse and manage your vocabulary collection
          </p>
        </button>

        <button
          onClick={() => navigate('/practice')}
          className="bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow"
        >
          <Brain className="w-8 h-8 text-indigo-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">Practice</h3>
          <p className="mt-2 text-sm text-gray-500">
            Test your knowledge with interactive exercises
          </p>
        </button>
      </div>
    </div>
  );
}



