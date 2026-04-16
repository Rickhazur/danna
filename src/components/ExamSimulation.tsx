import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Question } from "@/data/questions";
import { ArrowLeft, ArrowRight, Clock, CheckCircle2, XCircle, Trophy, BarChart3, Lightbulb } from "lucide-react";
import LatexRenderer from "./LatexRenderer";

interface ExamSimulationProps {
  questions: Question[];
  subjectName: string;
  timeMinutes: number;
  onBack: () => void;
  onFinish: (correct: number, total: number) => void;
}

const ExamSimulation = ({ questions, subjectName, timeMinutes, onBack, onFinish }: ExamSimulationProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeLeft, setTimeLeft] = useState(timeMinutes * 60);
  const [finished, setFinished] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (finished) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          setFinished(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [finished]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const handleSelect = (label: string) => {
    if (finished) return;
    setAnswers((prev) => ({ ...prev, [currentIndex]: label }));
  };

  const handleFinish = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setFinished(true);
  };

  const score = questions.reduce((acc, q, i) => acc + (answers[i] === q.correctAnswer ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).length;
  const question = questions[currentIndex];
  const timeWarning = timeLeft < 120;

  if (finished && !showReview) {
    const percent = Math.round((score / questions.length) * 100);
    onFinish(score, questions.length);

    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const topicScores: Record<string, { correct: number; total: number }> = {};

    questions.forEach((q, i) => {
      if (!topicScores[q.topic]) topicScores[q.topic] = { correct: 0, total: 0 };
      topicScores[q.topic].total++;
      if (answers[i] === q.correctAnswer) topicScores[q.topic].correct++;
    });

    Object.entries(topicScores).forEach(([topic, { correct, total }]) => {
      const pct = (correct / total) * 100;
      if (pct >= 70) strengths.push(topic);
      else weaknesses.push(topic);
    });

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-2xl mx-auto space-y-4 pt-6">
          <div className="text-center">
            <Trophy className="mx-auto text-primary mb-3" size={48} />
            <h1 className="text-2xl font-extrabold text-foreground">Simulacro Completado</h1>
            <p className="text-muted-foreground">{subjectName}</p>
          </div>

          <Card className="border-2 border-primary/30">
            <CardContent className="p-6 text-center">
              <p className="text-5xl font-extrabold text-primary">{percent}%</p>
              <p className="text-lg text-foreground mt-1">{score} de {questions.length} correctas</p>
              <p className="text-sm text-muted-foreground mt-1">
                {percent >= 80 ? "🌟 ¡Excelente! Estás lista para el ICFES" :
                 percent >= 60 ? "💪 ¡Bien! Sigue practicando para mejorar" :
                 "📚 Necesitas repasar más. ¡No te rindas!"}
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-3">
            <Card>
              <CardContent className="p-4">
                <BarChart3 className="text-primary mb-2" size={20} />
                <p className="text-xs text-muted-foreground">Respondidas</p>
                <p className="text-lg font-bold text-foreground">{answeredCount}/{questions.length}</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <Clock className="text-primary mb-2" size={20} />
                <p className="text-xs text-muted-foreground">Tiempo usado</p>
                <p className="text-lg font-bold text-foreground">{formatTime(timeMinutes * 60 - timeLeft)}</p>
              </CardContent>
            </Card>
          </div>

          {strengths.length > 0 && (
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <p className="font-bold text-green-700 mb-1">✅ Fortalezas</p>
                <p className="text-sm text-green-600">{strengths.join(", ")}</p>
              </CardContent>
            </Card>
          )}

          {weaknesses.length > 0 && (
            <Card className="bg-amber-50 border-amber-200">
              <CardContent className="p-4">
                <p className="font-bold text-amber-700 mb-1">⚠️ Temas para repasar</p>
                <p className="text-sm text-amber-600">{weaknesses.join(", ")}</p>
              </CardContent>
            </Card>
          )}

          <div className="flex gap-2">
            <Button onClick={() => setShowReview(true)} className="flex-1 h-12 font-bold">
              📝 Revisar respuestas
            </Button>
            <Button onClick={onBack} variant="outline" className="flex-1 h-12 font-bold">
              Volver
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (showReview) {
    const rq = questions[reviewIndex];
    const userAnswer = answers[reviewIndex];
    const isCorrect = userAnswer === rq.correctAnswer;

    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto flex items-center justify-between">
            <button onClick={() => setShowReview(false)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft size={20} />
              <span className="font-semibold">Resultados</span>
            </button>
            <p className="text-sm text-muted-foreground">Pregunta {reviewIndex + 1} de {questions.length}</p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-semibold ${isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
            {isCorrect ? "Correcta" : "Incorrecta"}
          </div>

          <Card className="border-0 shadow-md">
            <CardContent className="p-5">
              <LatexRenderer text={rq.text} className="text-foreground leading-relaxed whitespace-pre-line" />
            </CardContent>
          </Card>

          <div className="space-y-2">
            {rq.options.map((opt) => {
              const isUserChoice = userAnswer === opt.label;
              const isCorrectOpt = rq.correctAnswer === opt.label;
              let cls = "border-border";
              if (isCorrectOpt) cls = "border-green-400 bg-green-50";
              else if (isUserChoice) cls = "border-red-400 bg-red-50";
              return (
                <div key={opt.label} className={`p-4 rounded-xl border-2 ${cls}`}>
                  <div className="flex items-start gap-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${isCorrectOpt ? 'bg-green-500 text-white' : isUserChoice ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                      {isCorrectOpt ? <CheckCircle2 size={16} /> : isUserChoice ? <XCircle size={16} /> : opt.label}
                    </span>
                    <LatexRenderer text={opt.text} className="text-foreground pt-1" />
                  </div>
                </div>
              );
            })}
          </div>

          <Card className="border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className="text-primary shrink-0 mt-0.5" size={20} />
                <div>
                  <p className="font-bold text-foreground mb-1">Explicación</p>
                  <LatexRenderer text={rq.explanation} className="text-sm text-foreground leading-relaxed" />
                  {rq.tip && <LatexRenderer text={rq.tip} className="text-sm text-primary mt-2 font-semibold" />}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button onClick={() => setReviewIndex(Math.max(0, reviewIndex - 1))} variant="outline" disabled={reviewIndex === 0} className="flex-1">
              ← Anterior
            </Button>
            <Button onClick={() => setReviewIndex(Math.min(questions.length - 1, reviewIndex + 1))} disabled={reviewIndex === questions.length - 1} className="flex-1">
              Siguiente →
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft size={20} />
          </button>
          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">Simulacro - {subjectName}</p>
            <p className="text-xs text-muted-foreground">{answeredCount}/{questions.length} respondidas</p>
          </div>
          <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${timeWarning ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-muted text-muted-foreground'}`}>
            <Clock size={14} />
            <span className="text-sm font-bold">{formatTime(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Progress dots */}
      <div className="px-4 py-2 bg-card border-b border-border overflow-x-auto">
        <div className="max-w-2xl mx-auto flex gap-1.5 flex-wrap">
          {questions.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentIndex(i)}
              className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                i === currentIndex ? 'bg-primary text-primary-foreground scale-110' :
                answers[i] ? 'bg-primary/20 text-primary' :
                'bg-muted text-muted-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Question */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        <Card className="border-0 shadow-md">
          <CardContent className="p-5 space-y-4">
            {question.imageUrl && (
              <img src={question.imageUrl} alt="Gráfica o contexto" className="w-full h-auto rounded-lg border border-border mb-2 shadow-sm max-h-[250px] object-contain bg-white p-2" />
            )}
            <LatexRenderer text={question.text} className="text-foreground leading-relaxed whitespace-pre-line" />
          </CardContent>
        </Card>

        <div className="space-y-2.5">
          {question.options.map((opt) => (
            <button
              key={opt.label}
              onClick={() => handleSelect(opt.label)}
              className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                answers[currentIndex] === opt.label
                  ? 'border-primary bg-primary/10'
                  : 'border-border bg-card hover:border-primary/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                  answers[currentIndex] === opt.label ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>
                  {opt.label}
                </span>
                <LatexRenderer text={opt.text} className="text-foreground pt-1" />
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <Button onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))} variant="outline" disabled={currentIndex === 0} className="flex-1 h-11">
            ← Anterior
          </Button>
          {currentIndex < questions.length - 1 ? (
            <Button onClick={() => setCurrentIndex(currentIndex + 1)} className="flex-1 h-11">
              Siguiente →
            </Button>
          ) : (
            <Button onClick={handleFinish} className="flex-1 h-11 bg-green-600 hover:bg-green-700">
              ✅ Terminar examen
            </Button>
          )}
        </div>

        {answeredCount === questions.length && (
          <Button onClick={handleFinish} className="w-full h-12 font-bold text-base bg-green-600 hover:bg-green-700">
            🏆 Entregar simulacro ({answeredCount}/{questions.length} respondidas)
          </Button>
        )}
      </div>
    </div>
  );
};

export default ExamSimulation;
