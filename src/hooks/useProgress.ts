import { useState, useEffect } from "react";

export interface SubjectProgress {
  subjectId: string;
  questionsAnswered: number;
  questionsCorrect: number;
  topicsCompleted: string[];
  lastScore: number;
  examsTaken: number;
  bestExamScore: number;
}

export interface UserProgress {
  subjects: Record<string, SubjectProgress>;
  totalStudyTime: number;
  streak: number;
  lastStudyDate: string;
  level: number;
  xp: number;
}

const STORAGE_KEY = "icfes-prep-progress";

const defaultProgress: UserProgress = {
  subjects: {},
  totalStudyTime: 0,
  streak: 0,
  lastStudyDate: "",
  level: 1,
  xp: 0,
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
    };
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

      return {
        ...prev,
        subjects: {
          ...prev.subjects,
          [subjectId]: {
            ...sub,
            questionsAnswered: sub.questionsAnswered + total,
            questionsCorrect: sub.questionsCorrect + correct,
            lastScore: scorePercent,
          },
        },
        xp: newXp,
        level: newLevel,
        streak: newStreak,
        lastStudyDate: today,
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
      return {
        ...prev,
        subjects: {
          ...prev.subjects,
          [subjectId]: {
            ...sub,
            examsTaken: sub.examsTaken + 1,
            bestExamScore: Math.max(sub.bestExamScore, scorePercent),
            questionsAnswered: sub.questionsAnswered + total,
            questionsCorrect: sub.questionsCorrect + correct,
            lastScore: scorePercent,
          },
        },
      };
    });
  };

  const getOverallProgress = () => {
    const subs = Object.values(progress.subjects);
    const totalAnswered = subs.reduce((s, p) => s + p.questionsAnswered, 0);
    const totalCorrect = subs.reduce((s, p) => s + p.questionsCorrect, 0);
    const accuracy = totalAnswered > 0 ? Math.round((totalCorrect / totalAnswered) * 100) : 0;
    return { totalAnswered, totalCorrect, accuracy, level: progress.level, xp: progress.xp, streak: progress.streak };
  };

  const resetProgress = () => {
    setProgress(defaultProgress);
    localStorage.removeItem(STORAGE_KEY);
  };

  return { progress, getSubjectProgress, recordQuizResult, recordExamResult, getOverallProgress, resetProgress };
};
