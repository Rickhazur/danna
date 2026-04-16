import { Card, CardContent } from "@/components/ui/card";
import { useProgress } from "@/hooks/useProgress";
import { subjects, allQuestions } from "@/data/questions";
import { Trophy, Target, Flame, Star, Brain, TrendingUp, Medal, Award, Zap, AlertTriangle } from "lucide-react";

const ACHIEVEMENTS_DATA: Record<string, { label: string; icon: JSX.Element; color: string }> = {
  'primer-paso': { label: 'Primer Paso', icon: <Zap size={14} />, color: 'bg-yellow-400' },
  'perfecto': { label: 'Perfeccionista', icon: <Star size={14} />, color: 'bg-purple-400' },
  'racha-3': { label: 'Racha x3', icon: <Flame size={14} />, color: 'bg-orange-400' },
  'explorador': { label: 'Explorador', icon: <Medal size={14} />, color: 'bg-blue-400' },
};

const Dashboard = () => {
  const { getSubjectProgress, getOverallProgress } = useProgress();
  const overall = getOverallProgress();

  // Smart analysis per subject
  const subjectStats = subjects.map(sub => {
    const sp = getSubjectProgress(sub.id);
    const totalQ = allQuestions.filter(q => q.subject === sub.id).length;
    const accuracy = sp.questionsAnswered > 0 ? Math.round((sp.questionsCorrect / sp.questionsAnswered) * 100) : 0;
    return { ...sub, ...sp, totalQ, accuracy };
  });

  const practiced = subjectStats.filter(s => s.questionsAnswered > 0);
  const weakest = [...practiced].sort((a, b) => a.accuracy - b.accuracy)[0];
  const strongest = [...practiced].sort((a, b) => b.accuracy - a.accuracy)[0];
  const untouched = subjectStats.filter(s => s.questionsAnswered === 0);

  // ICFES Score Estimator (scale 0-500)
  const estimatedScore = overall.totalAnswered > 0 
    ? Math.min(500, Math.round((overall.accuracy / 100) * 400 + (practiced.length / 5) * 100))
    : 0;

  // Smart Coach recommendation
  const getCoachMessage = () => {
    if (overall.totalAnswered === 0) {
      return { text: "¡Bienvenida! Empieza con Lectura Crítica, es la materia que más pesa en el ICFES. Haz al menos 5 preguntas hoy.", emoji: "👋", priority: "info" as const };
    }
    if (untouched.length > 0) {
      return { text: `¡Alerta! No has practicado ${untouched.map(u => u.name).join(", ")}. En el ICFES te preguntan de TODO. Empieza hoy.`, emoji: "⚠️", priority: "warning" as const };
    }
    if (weakest && weakest.accuracy < 50) {
      return { text: `Tu punto débil es ${weakest.name} (${weakest.accuracy}%). Dedica 15 min hoy al Podcast y luego haz 10 preguntas.`, emoji: "🎯", priority: "critical" as const };
    }
    if (overall.accuracy >= 80) {
      return { text: `¡Vas increíble! Tu precisión es del ${overall.accuracy}%. Haz un Simulacro General para medir tu resistencia real.`, emoji: "🔥", priority: "success" as const };
    }
    return { text: `Buen progreso. Tu materia más fuerte es ${strongest?.name || "—"}. Sigue practicando las demás para equilibrar.`, emoji: "💪", priority: "info" as const };
  };

  const coach = getCoachMessage();

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-sm">
          <CardContent className="p-3 text-center">
            <Flame className="mx-auto text-primary mb-1" size={20} />
            <p className="text-2xl font-extrabold text-primary">{overall.streak}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Días Racha</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-sm">
          <CardContent className="p-3 text-center">
            <Star className="mx-auto text-accent mb-1" size={20} />
            <p className="text-2xl font-extrabold text-accent">Nv.{overall.level}</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">{overall.xp} XP</p>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20 shadow-sm">
          <CardContent className="p-3 text-center">
            <Target className="mx-auto text-green-600 mb-1" size={20} />
            <p className="text-2xl font-extrabold text-green-600">{overall.accuracy}%</p>
            <p className="text-[10px] uppercase font-bold text-muted-foreground">Precisión</p>
          </CardContent>
        </Card>
      </div>

      {/* ICFES Score Estimator */}
      {overall.totalAnswered > 0 && (
        <Card className="bg-gradient-to-r from-slate-900 to-slate-800 border-none text-white shadow-xl overflow-hidden relative">
          <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary/20 rounded-full blur-3xl" />
          <CardContent className="p-5 relative z-10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase font-black tracking-widest text-white/50">Puntaje ICFES Estimado</p>
                <p className="text-4xl font-black mt-1">
                  {estimatedScore}<span className="text-lg text-white/40 font-bold">/500</span>
                </p>
                <p className="text-[10px] text-white/60 mt-1">
                  {estimatedScore >= 250 ? "✅ Vas por buen camino para aprobar" : "⚡ Necesitas más práctica para asegurar"}
                </p>
              </div>
              <div className="w-20 h-20 rounded-full border-4 border-white/10 flex items-center justify-center relative">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-white/10" />
                  <circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" strokeWidth="4" className="text-primary" 
                    strokeDasharray={213} strokeDashoffset={213 - (213 * estimatedScore) / 500} strokeLinecap="round" />
                </svg>
                <Trophy className="absolute text-primary" size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Smart Coach Recommendation */}
      <Card className={`border-2 shadow-sm ${
        coach.priority === 'critical' ? 'border-red-500/30 bg-red-500/5' :
        coach.priority === 'warning' ? 'border-orange-500/30 bg-orange-500/5' :
        coach.priority === 'success' ? 'border-green-500/30 bg-green-500/5' :
        'border-primary/10 bg-card'
      }`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${
              coach.priority === 'critical' ? 'bg-red-500/10' :
              coach.priority === 'warning' ? 'bg-orange-500/10' : 'bg-primary/10'
            }`}>
              {coach.priority === 'critical' ? <AlertTriangle className="text-red-500" size={20} /> :
               coach.priority === 'warning' ? <AlertTriangle className="text-orange-500" size={20} /> :
               <Brain className="text-primary" size={20} />}
            </div>
            <div>
              <p className="font-bold text-foreground text-xs mb-1">{coach.emoji} Recomendación del Coach</p>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{coach.text}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mis Logros */}
      <div className="bg-card rounded-2xl p-4 border-2 border-primary/10 shadow-sm">
        <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
          <Award size={18} className="text-primary" /> Mis Logros ICFES
        </h3>
        <div className="flex flex-wrap gap-3">
          {Object.entries(ACHIEVEMENTS_DATA).map(([id, data]) => {
            const isEarned = (overall.achievements || []).includes(id);
            return (
              <div key={id} className={`flex flex-col items-center gap-1 group transition-all duration-500 ${isEarned ? 'scale-100 opacity-100' : 'scale-90 opacity-40'}`}>
                <div className={`p-2.5 rounded-2xl text-white shadow-md transition-transform group-hover:scale-110 ${isEarned ? data.color : 'bg-muted/50'}`}>
                  {data.icon}
                </div>
                <span className="text-[9px] font-black uppercase tracking-tighter">{data.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Analysis Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Progress per Subject */}
        <div>
          <h3 className="font-bold text-foreground text-sm mb-3 flex items-center gap-2">
            <TrendingUp size={18} className="text-primary" /> Análisis por Materia
          </h3>
          <div className="space-y-3">
            {subjectStats.map((sub) => {
              const pct = sub.totalQ > 0 ? Math.min(Math.round((sub.questionsAnswered / sub.totalQ) * 100), 100) : 0;
              const isWeak = sub.questionsAnswered > 0 && sub.accuracy < 50;
              return (
                <Card key={sub.id} className={`shadow-sm ${isWeak ? 'border-red-500/20' : 'border-border/50'}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">{sub.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-foreground text-xs flex items-center gap-1">
                            {sub.name}
                            {isWeak && <AlertTriangle size={10} className="text-red-500" />}
                          </span>
                          <span className="text-[10px] font-bold text-primary">{sub.accuracy}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: sub.color }} />
                        </div>
                        <div className="flex items-end gap-0.5 h-3 mt-2 opacity-60">
                           {(sub.history || []).slice(-10).map((h: number, i: number) => (
                             <div key={i} className="flex-1 bg-primary rounded-t-[1px]" style={{ height: `${Math.max(5, h)}%`, opacity: 0.3 + (i * 0.05) }} />
                           ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* XP + Materias sin tocar */}
        <div className="space-y-4">
          <Card className="bg-primary border-none text-primary-foreground shadow-lg overflow-hidden relative">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-5 relative z-10">
               <div className="flex items-center justify-between mb-4">
                  <h4 className="font-bold text-sm">Energía de Estudio</h4>
                  <p className="text-xs opacity-80">{overall.xp % 100}/100 para Nivel {overall.level + 1}</p>
               </div>
               <div className="w-full h-3 bg-black/20 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" style={{ width: `${overall.xp % 100}%` }} />
               </div>
               <p className="text-[10px] opacity-70">¡Casi subes de nivel!</p>
            </CardContent>
          </Card>

          {untouched.length > 0 && (
            <Card className="bg-orange-500/5 border-2 border-orange-500/20 shadow-sm">
              <CardContent className="p-4">
                <p className="font-bold text-foreground text-xs mb-2 flex items-center gap-1">
                  <AlertTriangle size={14} className="text-orange-500" /> Materias sin practicar
                </p>
                <div className="flex flex-wrap gap-2">
                  {untouched.map(u => (
                    <span key={u.id} className="px-2 py-1 bg-orange-500/10 text-orange-600 rounded-lg text-[10px] font-bold">
                      {u.icon} {u.name}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
