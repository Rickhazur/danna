import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/hooks/useProgress";
import { subjects, allQuestions } from "@/data/questions";
import { Trophy, Target, Flame, Star, BookOpen, Brain } from "lucide-react";

const Dashboard = () => {
  const { getSubjectProgress, getOverallProgress } = useProgress();
  const overall = getOverallProgress();

  return (
    <div className="space-y-4">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="p-3 text-center">
            <Flame className="mx-auto text-primary mb-1" size={20} />
            <p className="text-2xl font-extrabold text-primary">{overall.streak}</p>
            <p className="text-xs text-muted-foreground">Racha</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
          <CardContent className="p-3 text-center">
            <Star className="mx-auto text-accent mb-1" size={20} />
            <p className="text-2xl font-extrabold text-accent">Nv.{overall.level}</p>
            <p className="text-xs text-muted-foreground">{overall.xp} XP</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
          <CardContent className="p-3 text-center">
            <Target className="mx-auto text-green-600 mb-1" size={20} />
            <p className="text-2xl font-extrabold text-green-600">{overall.accuracy}%</p>
            <p className="text-xs text-muted-foreground">Precisión</p>
          </CardContent>
        </Card>
      </div>

      {/* XP Progress */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="text-primary" size={18} />
              <span className="font-bold text-foreground text-sm">Progreso General</span>
            </div>
            <span className="text-xs text-muted-foreground">{overall.totalAnswered} preguntas</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
              style={{ width: `${Math.min((overall.xp % 100), 100)}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">{overall.xp % 100}/100 XP para el siguiente nivel</p>
        </CardContent>
      </Card>

      {/* Subject Progress */}
      <div>
        <h3 className="font-bold text-foreground text-sm mb-2 flex items-center gap-2">
          <BookOpen size={16} /> Progreso por Materia
        </h3>
        <div className="space-y-2">
          {subjects.map((sub) => {
            const sp = getSubjectProgress(sub.id);
            const totalQ = allQuestions.filter((q) => q.subject === sub.id).length;
            const pct = totalQ > 0 ? Math.min(Math.round((sp.questionsAnswered / totalQ) * 100), 100) : 0;
            const acc = sp.questionsAnswered > 0 ? Math.round((sp.questionsCorrect / sp.questionsAnswered) * 100) : 0;

            return (
              <Card key={sub.id} className="overflow-hidden">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{sub.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground text-sm">{sub.name}</span>
                        <span className="text-xs text-muted-foreground">{acc}% aciertos</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full mt-1 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: sub.color }} />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Recommendations */}
      {overall.totalAnswered > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Brain className="text-primary shrink-0 mt-0.5" size={20} />
              <div>
                <p className="font-bold text-foreground text-sm mb-1">💡 Recomendación</p>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {overall.accuracy < 50
                    ? "Enfócate en practicar las preguntas fáciles primero. Usa el tutor chat para entender los conceptos básicos antes de avanzar."
                    : overall.accuracy < 75
                    ? "¡Vas bien! Intenta los simulacros de examen para acostumbrarte al formato del ICFES y mejorar tu velocidad."
                    : "¡Excelente progreso! Practica las preguntas difíciles y haz simulacros completos para perfeccionar tu técnica."}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Dashboard;
