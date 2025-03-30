import { SM2State } from '../types/vocabulary';

export function isDueForReview(sm2State?: SM2State): boolean {
  if (!sm2State || !sm2State.nextReview) return true;
  
  const nextReview = new Date(sm2State.nextReview);
  return nextReview <= new Date();
}

export function getDifficulty(sm2State?: SM2State): string {
  if (!sm2State) return 'new';
  
  const easeFactor = sm2State.easeFactor || 2.5;
  if (easeFactor <= 1.5) return 'hard';
  if (easeFactor >= 2.5) return 'easy';
  return 'medium';
}

export function calculateNextReview(
  currentState: SM2State,
  quality: 0 | 1 | 2 | 3 | 4 | 5
): SM2State {
  const now = new Date();
  const newState = { ...currentState };
  
  // Mettre à jour l'historique des révisions
  newState.reviews = [...(currentState.reviews || []), { quality, timestamp: now.toISOString() }];
  newState.lastReview = now.toISOString();

  // Mettre à jour le compteur d'échecs si nécessaire
  if (quality < 3) {
    newState.failedAttempts = (currentState.failedAttempts || 0) + 1;
  }

  return newState;
}

