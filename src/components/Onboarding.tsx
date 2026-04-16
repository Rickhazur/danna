import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen, Headphones, MessageCircle, Zap, ArrowRight, X } from "lucide-react";

const ONBOARDING_KEY = "icfes-onboarding-done";

const steps = [
  {
    icon: <GraduationCap size={48} className="text-primary" />,
    title: "¡Bienvenida a Nova ICFES! 🎓",
    description: "Tu plataforma para validar el bachillerato. Aquí tienes todo lo que necesitas para prepararte y aprobar el ICFES.",
    bg: "from-primary/20 to-primary/5",
  },
  {
    icon: <BookOpen size={48} className="text-blue-500" />,
    title: "Practica por Materia 📚",
    description: "Elige cualquier materia y responde preguntas tipo ICFES. El sistema se adapta a tu nivel: si aciertas, sube la dificultad. Si fallas, te explica por qué.",
    bg: "from-blue-500/20 to-blue-500/5",
  },
  {
    icon: <Headphones size={48} className="text-purple-500" />,
    title: "Escucha los Podcasts 🎧",
    description: "Lina y Sofía te explican los temas difíciles con ejemplos de la vida diaria. Después, abre el Cuaderno para jugar y fijar lo aprendido.",
    bg: "from-purple-500/20 to-purple-500/5",
  },
  {
    icon: <MessageCircle size={48} className="text-green-500" />,
    title: "Tu Tutor Personal 🤖",
    description: "Si no entiendes algo, pregúntale al Tutor IA. Te guía paso a paso sin darte la respuesta directa. ¡Aprende de verdad!",
    bg: "from-green-500/20 to-green-500/5",
  },
  {
    icon: <Zap size={48} className="text-orange-500" />,
    title: "¡Simulacro General! ⚡",
    description: "Cuando te sientas lista, haz el Simulacro General: 50 preguntas de todas las materias en 60 minutos. ¡Igual que el ICFES real!",
    bg: "from-orange-500/20 to-orange-500/5",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding = ({ onComplete }: OnboardingProps) => {
  const [step, setStep] = useState(0);
  const current = steps[step];
  const isLast = step === steps.length - 1;

  const handleNext = () => {
    if (isLast) {
      localStorage.setItem(ONBOARDING_KEY, "true");
      onComplete();
    } else {
      setStep(s => s + 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    onComplete();
  };

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500" key={step}>
        {/* Skip */}
        <button onClick={handleSkip} className="absolute top-6 right-6 text-muted-foreground hover:text-foreground text-sm font-bold flex items-center gap-1">
          Saltar <X size={14} />
        </button>

        {/* Icon */}
        <div className={`w-28 h-28 mx-auto rounded-[2rem] bg-gradient-to-br ${current.bg} flex items-center justify-center shadow-xl`}>
          {current.icon}
        </div>

        {/* Content */}
        <div className="space-y-3">
          <h2 className="text-2xl font-black text-foreground">{current.title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">{current.description}</p>
        </div>

        {/* Progress dots */}
        <div className="flex items-center justify-center gap-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === step ? 'w-8 bg-primary' : 'w-2 bg-muted'}`} />
          ))}
        </div>

        {/* Button */}
        <Button 
          onClick={handleNext} 
          className="w-full h-14 text-lg font-black rounded-2xl gap-2 shadow-lg active:scale-95 transition-transform"
          size="lg"
        >
          {isLast ? "¡Empezar a Estudiar!" : "Siguiente"} <ArrowRight size={20} />
        </Button>
      </div>
    </div>
  );
};

export const useOnboarding = () => {
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(ONBOARDING_KEY);
    if (!done) setShowOnboarding(true);
  }, []);

  return { showOnboarding, completeOnboarding: () => setShowOnboarding(false) };
};

export default Onboarding;
