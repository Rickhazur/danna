import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Bot, User } from "lucide-react";

interface Message {
  role: "tutor" | "student";
  content: string;
}

interface TutorChatProps {
  subjectName: string;
  onBack: () => void;
}

const tutorResponses: Record<string, string[]> = {
  default: [
    "¡Buena pregunta! Déjame explicarte de forma sencilla...",
    "Para entender esto, piensa en un ejemplo de la vida diaria...",
    "Vamos paso a paso. Primero, necesitas saber que...",
    "¡Eso es muy importante para el ICFES! Te explico...",
  ],
  saludo: [
    "¡Hola! 😊 Soy tu tutor virtual. Estoy aquí para ayudarte a prepararte para el ICFES. ¿En qué tema te gustaría trabajar hoy?",
    "¡Bienvenida! 🎓 Vamos a estudiar juntos. Pregúntame lo que necesites y te lo explico paso a paso.",
  ],
  icfes: [
    "El examen ICFES de validación evalúa 5 áreas: Lectura Crítica, Matemáticas, Sociales y Ciudadanas, Ciencias Naturales e Inglés. Cada área tiene preguntas de selección múltiple con 4 opciones. No hay penalización por respuestas incorrectas, así que ¡siempre responde todas!",
    "Para el ICFES de validación del bachillerato, necesitas inscribirte en el ICFES y presentar el examen Saber 11 Validantes. Te preparo en cada materia con preguntas estilo ICFES. ¿Por cuál quieres empezar?",
  ],
  matematicas: [
    "En matemáticas del ICFES, lo más importante es: 1) Saber las operaciones básicas, 2) Entender fracciones y porcentajes, 3) Resolver ecuaciones simples, 4) Interpretar gráficas y tablas. ¿Cuál de estos temas quieres practicar?",
  ],
  lectura: [
    "En Lectura Crítica, te van a pedir: 1) Identificar la idea principal de un texto, 2) Inferir información que no está explícita, 3) Evaluar argumentos. El truco es leer TODO el texto antes de ver las preguntas, y siempre buscar la respuesta que el texto apoya, no tu opinión personal.",
  ],
};

const getResponse = (input: string): string => {
  const lower = input.toLowerCase();
  if (lower.match(/hola|buenos|hi|hey|saludos/)) {
    return tutorResponses.saludo[Math.floor(Math.random() * tutorResponses.saludo.length)];
  }
  if (lower.match(/icfes|examen|validar|validación|prueba/)) {
    return tutorResponses.icfes[Math.floor(Math.random() * tutorResponses.icfes.length)];
  }
  if (lower.match(/matem|número|ecuación|algebra|suma|resta/)) {
    return tutorResponses.matematicas[0];
  }
  if (lower.match(/lectura|leer|texto|comprensión/)) {
    return tutorResponses.lectura[0];
  }
  return tutorResponses.default[Math.floor(Math.random() * tutorResponses.default.length)];
};

const TutorChat = ({ subjectName, onBack }: TutorChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "tutor",
      content: `¡Hola! 😊 Soy tu tutor de ${subjectName}. Estoy aquí para ayudarte a prepararte para el ICFES. Puedes preguntarme cualquier cosa sobre esta materia, pedirme que te explique un tema, o simplemente decirme "no entiendo" y te lo explico de otra forma. ¡Vamos a aprender juntas! 💪`,
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput("");
    setMessages((prev) => [...prev, { role: "student", content: userMsg }]);
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(userMsg);
      setMessages((prev) => [...prev, { role: "tutor", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <button onClick={onBack} className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="text-primary" size={22} />
          </div>
          <div>
            <p className="font-bold text-foreground text-sm">Tutor de {subjectName}</p>
            <p className="text-xs text-green-500">En línea • Listo para ayudarte</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-2.5 ${msg.role === "student" ? "flex-row-reverse" : ""}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                msg.role === "tutor" ? "bg-primary/10" : "bg-secondary"
              }`}>
                {msg.role === "tutor" ? <Bot size={16} className="text-primary" /> : <User size={16} className="text-secondary-foreground" />}
              </div>
              <div className={`max-w-[80%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                msg.role === "tutor"
                  ? "bg-card border border-border text-foreground rounded-tl-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm"
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Bot size={16} className="text-primary" />
              </div>
              <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-tl-sm">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-border bg-card px-4 py-3 shrink-0">
        <div className="max-w-2xl mx-auto flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu pregunta..."
            className="flex-1 px-4 py-2.5 rounded-full bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
          />
          <Button onClick={handleSend} size="icon" className="rounded-full w-10 h-10 shrink-0" disabled={!input.trim()}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TutorChat;
