import { useState } from "react";
import { Button } from "@/components/ui/button";
import SubjectCard from "@/components/SubjectCard";
import QuizView from "@/components/QuizView";
import TutorChat from "@/components/TutorChat";
import { subjects, sampleQuestions } from "@/data/questions";
import { GraduationCap, MessageCircle, BookOpen } from "lucide-react";

type View = "home" | "quiz" | "chat";

const Index = () => {
  const [view, setView] = useState<View>("home");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  const subject = subjects.find((s) => s.id === selectedSubject);

  const handleSubjectClick = (subjectId: string) => {
    setSelectedSubject(subjectId);
  };

  const handleStartQuiz = () => {
    if (selectedSubject) setView("quiz");
  };

  const handleStartChat = () => {
    if (selectedSubject) setView("chat");
  };

  const handleBack = () => {
    setView("home");
    setSelectedSubject(null);
  };

  if (view === "quiz" && subject) {
    const questions = sampleQuestions.filter((q) => q.subject === selectedSubject);
    return <QuizView questions={questions} subjectName={subject.name} onBack={handleBack} />;
  }

  if (view === "chat" && subject) {
    return <TutorChat subjectName={subject.name} onBack={handleBack} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-primary text-primary-foreground px-4 py-6 pb-10">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <GraduationCap size={32} />
            <div>
              <h1 className="text-xl font-extrabold">Valida tu Bachillerato</h1>
              <p className="text-primary-foreground/80 text-sm">Tu preparación para el ICFES 🇨🇴</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 -mt-6 pb-8 space-y-6">
        {/* Motivation card */}
        <div className="bg-card rounded-2xl p-5 shadow-md border border-border">
          <p className="text-foreground font-bold text-base">¡Hola! 👋</p>
          <p className="text-muted-foreground text-sm mt-1">
            Cada día que estudias te acerca más a tu diploma. ¡Tú puedes lograrlo! 💪
          </p>
          <div className="flex gap-2 mt-3">
            <div className="bg-primary/10 rounded-xl px-3 py-2 text-center flex-1">
              <p className="text-lg font-bold text-primary">5</p>
              <p className="text-xs text-muted-foreground">Materias</p>
            </div>
            <div className="bg-secondary/30 rounded-xl px-3 py-2 text-center flex-1">
              <p className="text-lg font-bold text-secondary-foreground">
                {sampleQuestions.length}
              </p>
              <p className="text-xs text-muted-foreground">Preguntas</p>
            </div>
            <div className="bg-accent/10 rounded-xl px-3 py-2 text-center flex-1">
              <p className="text-lg font-bold text-accent">∞</p>
              <p className="text-xs text-muted-foreground">Apoyo</p>
            </div>
          </div>
        </div>

        {/* Subject selection modal */}
        {selectedSubject && subject && (
          <div className="bg-card rounded-2xl p-5 shadow-lg border-2 border-primary/30 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{subject.icon}</span>
              <div>
                <h2 className="font-bold text-foreground text-lg">{subject.name}</h2>
                <p className="text-muted-foreground text-sm">{subject.description}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleStartQuiz} className="flex-1 gap-2 h-11 font-bold">
                <BookOpen size={18} /> Practicar
              </Button>
              <Button onClick={handleStartChat} variant="outline" className="flex-1 gap-2 h-11 font-bold">
                <MessageCircle size={18} /> Tutor Chat
              </Button>
            </div>
            <button
              onClick={() => setSelectedSubject(null)}
              className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Subjects */}
        <div>
          <h2 className="font-bold text-foreground text-lg mb-3">📚 Materias</h2>
          <div className="space-y-3">
            {subjects.map((s) => (
              <SubjectCard
                key={s.id}
                name={s.name}
                icon={s.icon}
                description={s.description}
                color={s.color}
                progress={Math.floor(Math.random() * 30)}
                onClick={() => handleSubjectClick(s.id)}
              />
            ))}
          </div>
        </div>

        {/* Info section */}
        <div className="bg-muted rounded-2xl p-5">
          <h3 className="font-bold text-foreground mb-2">📋 ¿Qué es la validación del bachillerato?</h3>
          <p className="text-muted-foreground text-sm leading-relaxed">
            Es un examen del ICFES que permite obtener el título de bachiller a personas que no terminaron
            sus estudios de secundaria. Se presenta el examen <strong>Saber 11 Validantes</strong> y
            al aprobarlo recibes tu diploma oficial. ¡No necesitas volver al colegio!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
