import { Routes, Route } from 'react-router-dom';
import { Layout } from './Layout';
import { Dashboard } from '../pages/Dashboard';
import { AddWord } from '../pages/AddWord';
import { WordList } from '../pages/WordList';
import { EditWord } from '../pages/EditWord';
import { Practice } from '../pages/Practice';
import { MemoryGame } from '../pages/MemoryGame';
import { MemoryGameMode } from '../pages/MemoryGameMode';
import { Auth } from './Auth';
import { Session } from '@supabase/supabase-js';

interface AppRoutesProps {
  session: Session | null;
}

export function AppRoutes({ session }: AppRoutesProps) {
  if (!session) {
    return <Auth />;
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="add" element={<AddWord />} />
        <Route path="list" element={<WordList />} />
        <Route path="edit/:id" element={<EditWord />} />
        <Route path="practice" element={<Practice />} />
        <Route path="memory" element={<MemoryGameMode />} />
        <Route path="memory/:mode" element={<MemoryGame />} />
      </Route>
    </Routes>
  );
}



