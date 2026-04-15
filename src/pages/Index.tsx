import { useState } from "react";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/SubjectCard";
import QuizView from "@/components/QuizView";
import TutorChat from "@/components/TutorChat";
import ExamSimulation from "@/components/ExamSimulation";
import Dashboard from "@/components/Dashboard";
import { subjects, allQuestions, getQuestionsBySubject } from "@/data/questions";
import { useProgress } from "@/hooks/useProgress";
import { GraduationCap, MessageCircle, BookOpen, Timer, Moon, Sun } from "lucide-react";

type View = "home" | "quiz" | "chat" | "exam";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const { getSubjectProgress, recordQuizResult, recordExamResult } = useProgress();

  const subject = subjects.find((s) => s.id === selectedSubject);

  const toggleDark = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle("dark");
  };

  const handleBack = () => {
    setView("home");
    setSelectedSubject(null);
  };

  if (view === "quiz" && subject) {
    const questions = getQuestionsBySubject(selectedSubject!);
    return (
      <QuizView
        questions={questions}
        subjectName={subject.name}
        onBack={() => {
          handleBack();
        }}
        onFinish={(c, t) => recordQuizResult(selectedSubject!, c, t)}
      />
    );
  }

  if (view === "exam" && subject) {
    const questions = getQuestionsBySubject(selectedSubject!).sort(() => Math.random() - 0.5).slice(0, 10);
    return (
      <ExamSimulation
        questions={questions}
        subjectName={subject.name}
        timeMinutes={15}
        onBack={handleBack}
        onFinish={(c, t) => recordExamResult(selectedSubject!, c, t)}
      />
    );
  }

  if (view === "chat" && subject) {
    return <TutorChat subjectName={subject.name} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-6 pb-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GraduationCap size={32} />
            <div>
              <h1 className="text-xl font-extrabold">Valida tu Bachillerato</h1>
              <p className="text-primary-foreground/80 text-sm">Tu preparación ICFES 🇨🇴</p>
            </div>
          </div>
          <button onClick={toggleDark} className="p-2 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 transition-colors">
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-8 space-y-6">
        {/* Dashboard */}
        <Dashboard />

        {/* Subject selection modal */}
        {selectedSubject && subject && (
          <div className="bg-card rounded-2xl p-5 shadow-lg border-2 border-primary/30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{subject.icon}</span>
              <div>
                <h2 className="font-bold text-foreground text-lg">{subject.name}</h2>
                <p className="text-muted-foreground text-sm">{getQuestionsBySubject(subject.id).length} preguntas disponibles</p>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <Button onClick={() => setView("quiz")} className="gap-1.5 h-11 font-bold text-sm">
                <BookOpen size={16} /> Practicar
              </Button>
              <Button onClick={() => setView("exam")} variant="secondary" className="gap-1.5 h-11 font-bold text-sm">
                <Timer size={16} /> Simulacro
              </Button>
              <Button onClick={() => setView("chat")} variant="outline" className="gap-1.5 h-11 font-bold text-sm">
                <MessageCircle size={16} /> Tutor
              </Button>
            </div>
            <button onClick={() => setSelectedSubject(null)} className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground">
              Cancelar
            </button>
          </div>
        )}

        {/* Subjects */}
        <div>
          <h2 className="font-bold text-foreground text-lg mb-3">📚 Materias</h2>
          <div className="space-y-3">
            {subjects.map((s) => {
              const sp = getSubjectProgress(s.id);
              const totalQ = allQuestions.filter((q) => q.subject === s.id).length;
              const pct = totalQ > 0 ? Math.min(Math.round((sp.questionsAnswered / totalQ) * 100), 100) : 0;
              return (
                <SubjectCard
                  key={s.id}
                  name={s.name}
                  icon={s.icon}
                  description={s.description}
                  color={s.color}
                  progress={pct}
                  onClick={() => setSelectedSubject(s.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Total questions info */}
        <div className="bg-muted rounded-2xl p-5 text-center">
          <p className="text-2xl font-extrabold text-foreground">{allQuestions.length}</p>
          <p className="text-sm text-muted-foreground">preguntas tipo ICFES con explicaciones y trucos</p>
        </div>
      </div>
    </div>
  );
};

export default Index;
