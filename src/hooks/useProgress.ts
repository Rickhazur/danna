import { useState, useEffect } from "react";

export interface SubjectProgress {
  subjectId: string;
  questionsAnswered: number;
  questionsCorrect: number;
  topicsCompleted: string[];
  lastScore: number;
  examsTaken: number;
  bestExamScore: number;
  history: number[];
}

export interface UserProgress {
  subjects: Record<string, SubjectProgress>;
  totalStudyTime: number;
  streak: number;
  lastStudyDate: string;
  level: number;
  xp: number;
  achievements: string[];
}

const STORAGE_KEY = "icfes-prep-progress";

const defaultProgress: UserProgress = {
  subjects: {},
  totalStudyTime: 0,
  streak: 0,
  lastStudyDate: "",
  level: 1,
  xp: 0,
  achievements: [],
};

const getInitialProgress = (): UserProgress => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return defaultProgress;
};

export const useProgress = () => {
  const [progress, setProgress] = useState<UserProgress>(getInitialProgress);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  }, [progress]);

  const getSubjectProgress = (subjectId: string): SubjectProgress => {
    return progress.subjects[subjectId] || {
      subjectId,
      questionsAnswered: 0,
      questionsCorrect: 0,
      topicsCompleted: [],
      lastScore: 0,
      examsTaken: 0,
      bestExamScore: 0,
      history: [],
    };
  };

  const checkAchievements = (current: UserProgress): string[] => {
    const newAchievements = [...(current.achievements || [])];
    const subs = Object.values(current.subjects);
    const totalAnswered = subs.reduce((s, p) => s + p.questionsAnswered, 0);
    
    if (!newAchievements.includes('primer-paso') && totalAnswered > 0) {
      newAchievements.push('primer-paso');
    }
    
    if (!newAchievements.includes('perfecto')) {
      const hadPerfect = subs.some(s => s.lastScore === 100);
      if (hadPerfect) newAchievements.push('perfecto');
    }

    if (!newAchievements.includes('explorador')) {
      const subjectsPracticed = subs.filter(s => s.questionsAnswered > 0).length;
      if (subjectsPracticed >= 5) newAchievements.push('explorador');
    }

    if (!newAchievements.includes('racha-3') && current.streak >= 3) {
      newAchievements.push('racha-3');
    }

    return newAchievements;
  };

  const recordQuizResult = (subjectId: string, correct: number, total: number) => {
    setProgress((prev) => {
      const sub = prev.subjects[subjectId] || {
        subjectId,
        questionsAnswered: 0,
        questionsCorrect: 0,
        topicsCompleted: [],
        lastScore: 0,
        examsTaken: 0,
        bestExamScore: 0,
      };
      const scorePercent = Math.round((correct / total) * 100);
      const xpGained = correct * 10 + (scorePercent >= 80 ? 20 : 0);
      const newXp = prev.xp + xpGained;
      const newLevel = Math.floor(newXp / 100) + 1;

      const today = new Date().toISOString().split("T")[0];
      const isNewDay = prev.lastStudyDate !== today;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newStreak = prev.lastStudyDate === yesterday || prev.lastStudyDate === today
        ? (isNewDay ? prev.streak + 1 : prev.streak)
        : 1;

      const updatedSubjects = {
        ...prev.subjects,
        [subjectId]: {
          ...sub,
          questionsAnswered: sub.questionsAnswered + total,
          questionsCorrect: sub.questionsCorrect + correct,
          lastScore: scorePercent,
          history: [...(sub.history || []), scorePercent].slice(-10),
        },
      };

      const newState = {
        ...prev,
        subjects: updatedSubjects,
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        lastStudyDate: today,
      };

      return {
        ...newState,
        achievements: checkAchievements(newState),
      };
    });
  };

  const recordExamResult = (subjectId: string, correct: number, total: number) => {
    setProgress((prev) => {
      const sub = prev.subjects[subjectId] || {
        subjectId,
        questionsAnswered: 0,
        questionsCorrect: 0,
        topicsCompleted: [],
        lastScore: 0,
        examsTaken: 0,
        bestExamScore: 0,
      };
      const scorePercent = Math.round((correct / total) * 100);
      const updatedSubjects = {
        ...prev.subjects,
        [subjectId]: {
          ...sub,
          examsTaken: sub.examsTaken + 1,
          bestExamScore: Math.max(sub.bestExamScore, scorePercent),
          questionsAnswered: sub.questionsAnswered + total,
          questionsCorrect: sub.questionsCorrect + correct,
          lastScore: scorePercent,
          history: [...(sub.history || []), scorePercent].slice(-10),
        },
      };

      const newState = {
        ...prev,
        subjects: updatedSubjects,
      };

      return {
        ...newState,
        achievements: checkAchievements(newState),
      };
    });
  };

  const getOverallProgress = () => {
    const subs = Object.values(progress.subjects);
    const totalAnswered = subs.reduce((s, p) => s + p.questionsAnswered, 0);
    const totalCorrect = subs.reduce((s, p) => s + p.questionsCorrect, 0);
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return { 
      totalAnswered, 
      totalCorrect, 
      accuracy, 
      level: progress.level, 
      xp: progress.xp, 
      streak: progress.streak, 
      achievements: progress.achievements || [] 
    };
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { progress, getSubjectProgress, recordQuizResult, recordExamResult, getOverallProgress, resetProgress };
};
