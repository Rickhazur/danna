import { useState, useEffect } from "react";

export interface ReviewItem {
  questionId: string;
  subject: string;
  nextReview: number; // timestamp
  interval: number;   // days until next review
  easeFactor: number; // how easy (2.5 default)
  repetitions: number;
}

const REVIEW_KEY = "icfes-spaced-review";

const getStoredReviews = (): ReviewItem[] => {
  try {
    const saved = localStorage.getItem(REVIEW_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch { return []; }
};

export const useSpacedRepetition = () => {
  const [reviews, setReviews] = useState<ReviewItem[]>(getStoredReviews);

  useEffect(() => {
    localStorage.setItem(REVIEW_KEY, JSON.stringify(reviews));
  }, [reviews]);

  // Record a wrong answer — schedule for review
  const recordMiss = (questionId: string, subject: string) => {
    setReviews(prev => {
      const existing = prev.find(r => r.questionId === questionId);
      if (existing) {
        // Reset interval
        return prev.map(r => r.questionId === questionId ? {
          ...r,
          interval: 1,
          nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000, // tomorrow
          easeFactor: Math.max(1.3, r.easeFactor - 0.2),
          repetitions: 0,
        } : r);
      }
      return [...prev, {
        questionId,
        subject,
        nextReview: Date.now() + 1 * 24 * 60 * 60 * 1000,
        interval: 1,
        easeFactor: 2.5,
        repetitions: 0,
      }];
    });
  };

  // Record a correct answer — push review further
  const recordHit = (questionId: string) => {
    setReviews(prev => prev.map(r => {
      if (r.questionId !== questionId) return r;
      const newReps = r.repetitions + 1;
      let newInterval: number;
      if (newReps === 1) newInterval = 1;
      else if (newReps === 2) newInterval = 3;
      else newInterval = Math.round(r.interval * r.easeFactor);
      
      return {
        ...r,
        repetitions: newReps,
        interval: newInterval,
        nextReview: Date.now() + newInterval * 24 * 60 * 60 * 1000,
        easeFactor: r.easeFactor + 0.1,
      };
    }));
  };

  // Get questions due for review right now
  const getDueReviews = (subjectId?: string): ReviewItem[] => {
    const now = Date.now();
    return reviews
      .filter(r => r.nextReview <= now)
      .filter(r => subjectId ? r.subject === subjectId : true);
  };

  // Get count of pending reviews
  const getPendingCount = (subjectId?: string): number => {
    return getDueReviews(subjectId).length;
  };

  // Remove a review item (question mastered)
  const removeReview = (questionId: string) => {
    setReviews(prev => prev.filter(r => r.questionId !== questionId));
  };

  return { reviews, recordMiss, recordHit, getDueReviews, getPendingCount, removeReview };
};
