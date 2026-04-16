import { useState } from "react";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/SubjectCard";
import QuizView from "@/components/QuizView";
import TutorChat from "@/components/TutorChat";
import ExamSimulation from "@/components/ExamSimulation";
import Dashboard from "@/components/Dashboard";
import PodcastPlayer from "@/components/PodcastPlayer";
import StudyNotebook from "@/components/StudyNotebook";
import { subjects, allQuestions, getQuestionsBySubject } from "@/data/questions";
import { useProgress } from "@/hooks/useProgress";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";
import Onboarding, { useOnboarding } from "@/components/Onboarding";
import ExamTechniques from "@/components/ExamTechniques";
import { GraduationCap, MessageCircle, BookOpen, Timer, Moon, Sun, Zap, RotateCcw, Lightbulb } from "lucide-react";

type View = "home" | "quiz" | "chat" | "exam" | "podcast" | "notebook" | "full-exam" | "techniques";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [notebookTopic, setNotebookTopic] = useState("");
  const { getSubjectProgress, recordQuizResult, recordExamResult } = useProgress();
  const { getPendingCount, getDueReviews } = useSpacedRepetition();
  const { showOnboarding, completeOnboarding } = useOnboarding();

  const subject = subjects.find((s) => s.id === selectedSubject);
  const pendingReviews = getPendingCount();

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
    const questions = getQuestionsBySubject(selectedSubject!).sort(() => Math.random() - 0.5).slice(0, 20);
    return (
      <ExamSimulation
        questions={questions}
        subjectName={subject.name}
        timeMinutes={30}
        onBack={handleBack}
        onFinish={(c, t) => recordExamResult(selectedSubject!, c, t)}
      />
    );
  }

  if (view === "chat" && subject) {
    return <TutorChat subjectName={subject.name} onBack={handleBack} />;
  }

  // Simulacro General ICFES (estructura real: 278 preguntas, 2 sesiones)
  if (view === "full-exam") {
    // Distribución real del ICFES Saber 11
    const examStructure = [
      { subject: "lectura-critica", count: 41 },
      { subject: "matematicas", count: 50 },
      { subject: "sociales", count: 50 },
      { subject: "ciencias", count: 58 },
      { subject: "ingles", count: 29 },
    ];

    const mixedQuestions: typeof allQuestions = [];
    examStructure.forEach(({ subject: subId, count }) => {
      const subjectPool = allQuestions.filter(q => q.subject === subId);
      const shuffled = [...subjectPool].sort(() => Math.random() - 0.5);
      // Take up to the real count, or all available if fewer
      mixedQuestions.push(...shuffled.slice(0, Math.min(count, shuffled.length)));
    });

    // Shuffle the final mix
    mixedQuestions.sort(() => Math.random() - 0.5);

    return (
      <ExamSimulation
        questions={mixedQuestions}
        subjectName={`Simulacro General ICFES (${mixedQuestions.length} preguntas)`}
        timeMinutes={270} // 4 horas 30 minutos = duración real
        onBack={handleBack}
        onFinish={(c, t) => {
          recordExamResult("lectura-critica", c, t);
        }}
      />
    );
  }

  if (view === "podcast" && subject) {
    return (
      <div className="min-h-screen bg-background p-4 flex flex-col justify-center relative">
        <button onClick={handleBack} className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors z-20 bg-background/80 p-2 rounded-full shadow-sm">
          <span className="font-semibold px-2">Volver</span>
        </button>
        <PodcastPlayer 
          subjectId={subject.id} 
          onOpenNotebook={(topic) => {
            setNotebookTopic(topic || subject.name);
            setView("notebook");
          }} 
        />
      </div>
    );
  }

  if (view === "notebook" && subject) {
    return <StudyNotebook topic={notebookTopic || subject.name} onBack={() => setView("podcast")} />;
  }

  if (view === "techniques") {
    return <ExamTechniques onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Onboarding */}
      {showOnboarding && <Onboarding onComplete={completeOnboarding} />}

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
        {/* Técnicas de Examen Banner */}
        <button
          onClick={() => setView("techniques")}
          className="w-full bg-red-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Lightbulb size={24} className="animate-pulse" />
            </div>
            <div className="text-left">
              <h3 className="font-black text-sm uppercase tracking-wider">Machete ICFES 🧠</h3>
              <p className="text-white/80 text-[10px]">Técnicas probadas para sacar el máximo puntaje</p>
            </div>
          </div>
          <span className="text-xl opacity-80">→</span>
        </button>

        {/* Simulacro General Banner */}
        <button
          onClick={() => setView("full-exam")}
          className="w-full bg-gradient-to-r from-orange-500 via-red-500 to-purple-600 text-white rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Zap size={28} />
              </div>
              <div className="text-left">
                <h3 className="font-black text-lg">🎯 Simulacro General ICFES</h3>
                <p className="text-white/80 text-xs font-medium">278 preguntas • 5 materias • 4h 30min • ¡Igual que el real!</p>
              </div>
            </div>
            <span className="text-2xl">→</span>
          </div>
        </button>

        {/* Dashboard */}
        <Dashboard />

        {/* Spaced Repetition Alert */}
        {pendingReviews > 0 && (
          <button
            onClick={() => {
              // Find the subject with most pending reviews and start quiz there
              const dueItems = getDueReviews();
              if (dueItems.length > 0) {
                const topSubject = dueItems[0].subject;
                setSelectedSubject(topSubject);
                setView("quiz");
              }
            }}
            className="w-full bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-4 shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex items-center gap-3"
          >
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <RotateCcw size={22} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-sm">🔁 {pendingReviews} pregunta{pendingReviews > 1 ? 's' : ''} para repasar</h3>
              <p className="text-white/80 text-[10px]">Preguntas que fallaste y necesitan refuerzo hoy</p>
            </div>
          </button>
        )}

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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <Button onClick={() => setView("quiz")} className="gap-1.5 h-11 font-bold text-sm">
                <BookOpen size={16} /> Practicar
              </Button>
              <Button onClick={() => setView("exam")} variant="secondary" className="gap-1.5 h-11 font-bold text-sm">
                <Timer size={16} /> Simulacro
              </Button>
              <Button onClick={() => setView("chat")} variant="outline" className="gap-1.5 h-11 font-bold text-sm">
                <MessageCircle size={16} /> Tutor
              </Button>
              <Button onClick={() => setView("podcast")} variant="default" className="gap-1.5 h-11 font-bold text-sm bg-purple-600 hover:bg-purple-700 text-white">
                 Podcast
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
