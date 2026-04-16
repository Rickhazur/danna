import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, Bot, User } from "lucide-react";
import { generateText } from "@/lib/gemini";
import LatexRenderer from "./LatexRenderer";

import { Camera, X, PenTool } from "lucide-react";
import SmartWhiteboard from "./SmartWhiteboard";

interface Message {
  role: "tutor" | "student";
  content: string;
  image?: string;
}

interface TutorChatProps {
  subjectName: string;
  onBack: () => void;
}

const CHAT_STORAGE_KEY = (subject: string) => `tutor-chat-${subject}`;

const TutorChat = ({ subjectName, onBack }: TutorChatProps) => {
  const defaultMsg: Message = {
    role: "tutor",
    content: `¡Hola! 😊 Soy tu tutor de ${subjectName}. Estoy aquí para ayudarte a prepararte para el ICFES. Puedes preguntarme cualquier cosa, o subir una foto de un problema que no entiendas. ¡Vamos a aprender juntas! 💪`,
  };

  const loadMessages = (): Message[] => {
    try {
      const saved = localStorage.getItem(CHAT_STORAGE_KEY(subjectName));
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return [defaultMsg];
  };

  const [messages, setMessages] = useState<Message[]>(loadMessages);
  const [input, setInput] = useState("");
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showWhiteboard, setShowWhiteboard] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        alert("La imagen es muy grande. Intenta con una de menos de 4MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 1) {
      localStorage.setItem(CHAT_STORAGE_KEY(subjectName), JSON.stringify(messages.slice(-30)));
    }
  }, [messages, subjectName]);

  const handleSend = async () => {
    if (!input.trim() && !attachedImage) return;
    const userMsg = input.trim();
    const imageToSend = attachedImage;
    
    setInput("");
    setAttachedImage(null);
    
    // Create new messages array with the user's input
    const updatedMessages = [...messages, { role: "student" as const, content: userMsg, image: imageToSend || undefined }];
    setMessages(updatedMessages);
    setIsTyping(true);

    try {
      const systemPrompt = `Actúa como Lina, una profesora experta en el examen ICFES (Saber 11). 
      El tema de esta conversación es: ${subjectName}.
      INSTRUCCIONES CRÍTICAS:
      1. Explica de forma MUY SENCILLA y amigable, como a alguien que dejó el colegio hace años.
      2. Usa siempre el método Socrático: NO des la respuesta final directamente, guía al estudiante paso a paso con preguntas pequeñas para que él mismo descubra la solución.
      3. Si te preguntan sobre una ecuación matemática, envuelve TODA fórmula matemática en símbolos de dólar simples $x + 2 = 5$ o dobles $$y = mx + b$$ para que se rendericen correctamente.
      4. Si el estudiante te envía una imagen, analízala detalladamente y explícale cómo resolver el problema mostrado sin darle la respuesta de inmediato.
      5. NUNCA cambies de tema si el estudiante dice "no sé" a tu pregunta. Mantenlo en el tema que estaban discutiendo y explícaselo más suave.
      6. Sé breve. No más de 2 párrafos cortos.`;

      // Pass the complete history to the AI
      const fullHistory = [
        { role: "system" as const, content: systemPrompt },
        ...updatedMessages
      ];

      // Using the new helper that maintains conversation history
      const { generateChatResponse } = await import("@/lib/gemini");
      const response = await generateChatResponse(fullHistory);
      
      setMessages((prev) => [...prev, { role: "tutor", content: response }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "tutor", content: "Lo siento, tuve un pequeño problema de conexión. ¿Podrías repetirme la pregunta?" }]);
    } finally {
      setIsTyping(false);
    }
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
      <div className="flex-1 overflow-y-auto px-4 py-4 relative">
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
                  ? "bg-card border border-border text-foreground rounded-tl-sm shadow-sm"
                  : "bg-primary text-primary-foreground rounded-tr-sm shadow-md"
              }`}>
                {msg.image && (
                  <img src={msg.image} alt="Usuario adjunto" className="max-w-full rounded-lg mb-2 shadow-sm border border-black/10" />
                )}
                {msg.role === "tutor" ? (
                  <LatexRenderer text={msg.content.replace(/\[DIAGRAMA:.*?\]/g, '')} />
                ) : (
                  msg.content
                )}
                
                {/* Visual Aids for specific topics */}
                {msg.role === "tutor" && msg.content.includes("[DIAGRAMA: CELULA]") && (
                  <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-primary/10 animate-in zoom-in duration-500">
                    <p className="text-[10px] uppercase font-bold text-primary mb-2">Diagrama de la Célula</p>
                    <svg viewBox="0 0 100 100" className="w-full max-w-[200px] mx-auto drop-shadow-sm">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="4" className="text-primary/40" />
                      <circle cx="50" cy="50" r="15" className="fill-primary/20 stroke-primary" strokeWidth="2" />
                      <circle cx="50" cy="50" r="5" className="fill-primary" />
                      <path d="M 65 35 Q 80 40 75 60" fill="none" stroke="currentColor" strokeWidth="1" className="text-accent" />
                      <text x="50" y="62" fontSize="6" className="fill-foreground font-bold" textAnchor="middle">Núcleo</text>
                      <text x="80" y="25" fontSize="6" className="fill-muted-foreground" textAnchor="middle">Membrana</text>
                    </svg>
                  </div>
                )}

                {msg.role === "tutor" && msg.content.includes("[DIAGRAMA: ATOMO]") && (
                   <div className="mt-3 p-3 bg-muted/30 rounded-lg border border-primary/10 animate-in zoom-in duration-500">
                     <p className="text-[10px] uppercase font-bold text-accent mb-2">Estructura Atómica</p>
                     <svg viewBox="0 0 100 100" className="w-full max-w-[150px] mx-auto">
                        <circle cx="50" cy="50" r="10" className="fill-red-500" />
                        <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/30" />
                        <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/30" transform="rotate(60 50 50)" />
                        <ellipse cx="50" cy="50" rx="40" ry="15" fill="none" stroke="currentColor" strokeWidth="1" className="text-primary/30" transform="rotate(-60 50 50)" />
                        <circle cx="90" cy="50" r="2" className="fill-primary" />
                     </svg>
                   </div>
                )}
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
      <div className="border-t border-border bg-card px-4 py-3 shrink-0 relative">
        <div className="max-w-2xl mx-auto flex flex-col gap-2">
          {/* Image Preview */}
          {attachedImage && (
            <div className="relative self-start mb-1 group">
              <img src={attachedImage} alt="Preview" className="h-20 w-auto rounded-lg border border-border shadow-sm object-cover" />
              <button 
                onClick={() => setAttachedImage(null)}
                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:scale-110 active:scale-95 transition-transform"
              >
                <X size={14} />
              </button>
            </div>
          )}
          
          <div className="flex gap-2 items-center">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleImageUpload}
            />
            <Button 
              onClick={() => setShowWhiteboard(true)} 
              variant="outline" 
              size="icon" 
              className="rounded-full w-10 h-10 shrink-0 text-muted-foreground hover:text-primary"
              title="Dibujar en el pizarrón"
            >
              <PenTool size={20} />
            </Button>
            <Button 
              onClick={() => fileInputRef.current?.click()} 
              variant="outline" 
              size="icon" 
              className="rounded-full w-10 h-10 shrink-0 text-muted-foreground hover:text-primary"
              title="Adjuntar imagen de un problema"
            >
              <Camera size={20} />
            </Button>
            
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Escribe tu pregunta o sube un problema matemático..."
              className="flex-1 px-4 py-2.5 rounded-2xl bg-muted border-0 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
            />
            <Button onClick={handleSend} size="icon" className="rounded-full w-10 h-10 shrink-0 bg-primary" disabled={(!input.trim() && !attachedImage) || isTyping}>
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
      
      {showWhiteboard && (
        <SmartWhiteboard 
          onClose={() => setShowWhiteboard(false)}
          onSave={(dataUrl) => {
            setAttachedImage(dataUrl);
            setShowWhiteboard(false);
            if (!input) {
              setInput("¿Me puedes ayudar a resolver o entender esto?");
            }
          }}
        />
      )}
    </div>
  );
};

export default TutorChat;
