import * as React from 'react';
import { useMemo } from 'react';
import { VocabularyEntry } from '../types/vocabulary';
import { getDifficulty, isDueForReview } from '../lib/spaced-repetition';
import { Brain, Zap, Clock, BarChart2 } from 'lucide-react';

interface LearningStatsProps {
  entries: VocabularyEntry[];
}

export function LearningStats({ entries }: LearningStatsProps) {
  const stats = useMemo(() => {
    const now = new Date();
    
    // Statistiques générales
    const totalWords = entries.length;
    const wordsToReview = entries.filter(entry => isDueForReview(entry.sm2State)).length;
    
    // Statistiques de difficulté
    const difficultyStats = entries.reduce((acc, entry) => {
      const difficulty = getDifficulty(entry.sm2State);
      acc[difficulty] = (acc[difficulty] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Moyenne des intervalles
    const avgInterval = entries.reduce((sum, entry) => 
      sum + (entry.sm2State?.interval || 0), 0) / (totalWords || 1);

    return {
      totalWords,
      wordsToReview,
      difficultyStats,
      avgInterval: Math.round(avgInterval)
    };
  }, [entries]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-indigo-50 rounded-lg p-4">
        <div className="flex items-center gap-3">
          <Brain className="w-8 h-8 text-indigo-600" />
          <div>
            <h3 className="text-lg font-semibold text-indigo-900">
              À réviser
            </h3>
            <p className="text-2xl font-bold text-indigo-600">
              {stats.wordsToReview}
              <span className="text-sm text-indigo-400 ml-1">/ {stats.totalWords}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

