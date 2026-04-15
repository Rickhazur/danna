import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Question } from "@/data/questions";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Lightbulb } from "lucide-react";

interface QuizViewProps {
  questions: Question[];
  subjectName: string;
  onBack: () => void;
}

const QuizView = ({ questions, subjectName, onBack }: QuizViewProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);

  const question = questions[currentIndex];
  if (!question) return null;

  const handleSelect = (label: string) => {
    if (selectedAnswer) return;
    setSelectedAnswer(label);
    setShowExplanation(true);
    setAnswered((a) => a + 1);
    if (label === question.correctAnswer) {
      setScore((s) => s + 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((i) => i + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    }
  };

  const isCorrect = selectedAnswer === question.correctAnswer;

  const difficultyBadge = {
    facil: { text: "Fácil", class: "bg-green-100 text-green-700" },
    medio: { text: "Medio", class: "bg-yellow-100 text-yellow-700" },
    dificil: { text: "Difícil", class: "bg-red-100 text-red-700" },
  };

  const badge = difficultyBadge[question.difficulty];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold">Volver</span>
          </button>
          <div className="text-center">
            <p className="text-sm text-muted-foreground">{subjectName}</p>
            <p className="text-xs text-muted-foreground">
              Pregunta {currentIndex + 1} de {questions.length}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{score}/{answered}</p>
            <p className="text-xs text-muted-foreground">aciertos</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${badge.class}`}>
            {badge.text}
          </span>
          <span className="text-xs text-muted-foreground px-2.5 py-1 rounded-full bg-muted">
            {question.topic}
          </span>
        </div>

        <Card className="border-0 shadow-md">
          <CardContent className="p-5">
            <p className="text-foreground leading-relaxed whitespace-pre-line">{question.text}</p>
          </CardContent>
        </Card>

        {/* Options */}
        <div className="space-y-2.5">
          {question.options.map((option) => {
            const isSelected = selectedAnswer === option.label;
            const isCorrectOption = option.label === question.correctAnswer;
            let borderClass = "border-border hover:border-primary/50";
            let bgClass = "bg-card";

            if (selectedAnswer) {
              if (isCorrectOption) {
                borderClass = "border-green-400";
                bgClass = "bg-green-50";
              } else if (isSelected && !isCorrectOption) {
                borderClass = "border-red-400";
                bgClass = "bg-red-50";
              } else {
                borderClass = "border-border opacity-50";
              }
            }

            return (
              <button
                key={option.label}
                onClick={() => handleSelect(option.label)}
                disabled={!!selectedAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${borderClass} ${bgClass} ${!selectedAnswer ? "cursor-pointer active:scale-[0.98]" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                    selectedAnswer && isCorrectOption
                      ? "bg-green-500 text-white"
                      : selectedAnswer && isSelected
                      ? "bg-red-500 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}>
                    {selectedAnswer && isCorrectOption ? (
                      <CheckCircle2 size={18} />
                    ) : selectedAnswer && isSelected ? (
                      <XCircle size={18} />
                    ) : (
                      option.label
                    )}
                  </span>
                  <span className="text-foreground pt-1">{option.text}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <Card className={`border-2 ${isCorrect ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className={`shrink-0 mt-0.5 ${isCorrect ? "text-green-600" : "text-amber-600"}`} size={22} />
                <div>
                  <p className={`font-bold mb-1 ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
                    {isCorrect ? "¡Muy bien! 🎉" : "No te preocupes, así se aprende 💪"}
                  </p>
                  <p className="text-foreground text-sm leading-relaxed">{question.explanation}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Next button */}
        {selectedAnswer && currentIndex < questions.length - 1 && (
          <Button onClick={handleNext} className="w-full h-12 text-base font-bold gap-2" size="lg">
            Siguiente pregunta <ArrowRight size={18} />
          </Button>
        )}

        {selectedAnswer && currentIndex === questions.length - 1 && (
          <Card className="border-2 border-primary bg-primary/5">
            <CardContent className="p-6 text-center">
              <p className="text-2xl font-bold text-primary mb-2">
                🏆 ¡Práctica completada!
              </p>
              <p className="text-foreground text-lg">
                Obtuviste <span className="font-bold text-primary">{score}</span> de{" "}
                <span className="font-bold">{questions.length}</span> respuestas correctas
              </p>
              <p className="text-muted-foreground mt-1 text-sm">
                {score === questions.length
                  ? "¡Perfecto! Estás lista para el ICFES 🌟"
                  : score >= questions.length * 0.7
                  ? "¡Muy bien! Sigue practicando 💪"
                  : "Repasa los temas y vuelve a intentarlo 📚"}
              </p>
              <Button onClick={onBack} className="mt-4" variant="outline">
                Volver a materias
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuizView;
