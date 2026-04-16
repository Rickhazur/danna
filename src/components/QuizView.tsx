import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Question } from "@/data/questions";
import { generateText } from "@/lib/gemini";
import { ArrowLeft, ArrowRight, CheckCircle2, XCircle, Lightbulb, BrainCircuit, Bot, Send, User, X } from "lucide-react";
import LatexRenderer from "./LatexRenderer";
import { useSpacedRepetition } from "@/hooks/useSpacedRepetition";

interface QuizViewProps {
  questions: Question[];
  subjectName: string;
  onBack: () => void;
  onFinish?: (correct: number, total: number) => void;
}

const difficultyLevels = ["facil", "medio", "dificil"];

const QuizView = ({ questions, subjectName, onBack, onFinish }: QuizViewProps) => {
  const [availableQuestions, setAvailableQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  
  const [currentLevelIndex, setCurrentLevelIndex] = useState(0);
  const [currentTopic, setCurrentTopic] = useState<string>("");
  
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Chatbot State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{role: 'student' | 'tutor', text: string}[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (questions.length > 0 && availableQuestions.length === 0 && !isFinished && answered === 0) {
      setAvailableQuestions(questions);
      const topics = Array.from(new Set(questions.map(q => q.topic)));
      const firstTopic = topics[0];
      setCurrentTopic(firstTopic);
      pickNextQuestion(firstTopic, 0, questions);
    }
  }, [questions]);

  // Scroll to bottom of chat
  useEffect(() => {
    if (isChatOpen) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatMessages, isChatOpen, isTyping]);

  const pickNextQuestion = (topic: string, levelIndex: number, pool: Question[]) => {
    let topicPool = pool.filter(q => q.topic === topic);
    let nextTopic = topic;
    let nextLevel = levelIndex;

    if (topicPool.length === 0) {
      const remainingTopics = Array.from(new Set(pool.map(q => q.topic)));
      if (remainingTopics.length === 0) {
        setCurrentQuestion(null);
        setIsFinished(true);
        return;
      }
      nextTopic = remainingTopics[0];
      setCurrentTopic(nextTopic);
      topicPool = pool.filter(q => q.topic === nextTopic);
      nextLevel = 0; 
    }

    const targetDifficulty = difficultyLevels[nextLevel];
    let matchingQs = topicPool.filter(q => q.difficulty === targetDifficulty);
    
    let nextQ;
    if (matchingQs.length > 0) {
      // Pick random from matching difficulty
      nextQ = matchingQs[Math.floor(Math.random() * matchingQs.length)];
    } else {
      // Fallback: pick the closest difficulty available in this topic
      nextQ = topicPool.reduce((closest, q) => {
        const qLevel = difficultyLevels.indexOf(q.difficulty);
        const closestLevel = difficultyLevels.indexOf(closest.difficulty);
        return Math.abs(qLevel - nextLevel) < Math.abs(closestLevel - nextLevel) ? q : closest;
      });
    }

    setCurrentQuestion(nextQ);
    setCurrentLevelIndex(difficultyLevels.indexOf(nextQ.difficulty));
    
    // Reset Chat for new question
    setChatMessages([
      { role: 'tutor', text: `¡Hola! Soy tu tutor para esta pregunta de ${nextTopic}. Si hay algo que no entiendes sobre el enunciado o las opciones, pregúntame y te guiaré sin darte la respuesta directamente 🤓.` }
    ]);
    setIsChatOpen(false);
  };

  const { recordMiss, recordHit } = useSpacedRepetition();

  const handleSelect = (label: string) => {
    if (selectedAnswer || !currentQuestion) return;
    setSelectedAnswer(label);
    setShowExplanation(true);
    setAnswered((a) => a + 1);
    setIsChatOpen(false);
    if (label === currentQuestion.correctAnswer) {
      setScore((s) => s + 1);
      recordHit(currentQuestion.id);
    } else {
      recordMiss(currentQuestion.id, currentQuestion.subject);
    }
  };

  const handleNext = () => {
    if (!currentQuestion) return;
    
    const newPool = availableQuestions.filter(q => q.id !== currentQuestion.id);
    setAvailableQuestions(newPool);

    // Adaptive difficulty logic:
    // If correct, go up in depth. If wrong, go down. 
    let nextLevelIndex = currentLevelIndex;
    if (selectedAnswer === currentQuestion.correctAnswer) {
      nextLevelIndex = Math.min(difficultyLevels.length - 1, currentLevelIndex + 1);
    } else {
      nextLevelIndex = Math.max(0, currentLevelIndex - 1);
    }

    setSelectedAnswer(null);
    setShowExplanation(false);
    
    pickNextQuestion(currentTopic, nextLevelIndex, newPool);
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || !currentQuestion) return;
    
    const userText = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'student', text: userText }]);
    setChatInput("");
    setIsTyping(true);

    const prompt = `Eres un tutor experto preparador para el examen ICFES. El estudiante te hizo la siguiente consulta: "${userText}". 
La pregunta que está tratando de resolver es: "${currentQuestion.text}". 
Las opciones son: ${currentQuestion.options.map((o) => `${o.label}) ${o.text}`).join(", ")}. 
El tema es ${currentTopic} de nivel ${currentQuestion.difficulty}.
REGLAS:
1. No le des la respuesta correcta directamente.
2. Si pide una pista, dale ayuda conceptual corta.
3. Sé muy amigable y alentador. Trátalo como si estuviera en grado noveno, intentando entender este tema desde cero.
4. Si usas matemáticas, envuelve las fórmulas en símbolos de dólar simples $x^2$ o dobles $$y=mx+b$$.`;

    const botResponse = await generateText(prompt);
    
    setIsTyping(false);
    setChatMessages(prev => [...prev, { role: 'tutor', text: botResponse }]);
  };

  const handleKeyPressChat = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendChat();
    }
  };

  if (isFinished) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="border-2 border-primary bg-primary/5 max-w-sm w-full animate-in zoom-in-95">
          <CardContent className="p-6 text-center">
            <p className="text-2xl font-bold text-primary mb-2">🏆 ¡Práctica completada!</p>
            <p className="text-foreground text-lg">
              Obtuviste <span className="font-bold text-primary">{score}</span> de <span className="font-bold">{questions.length}</span> correctas
            </p>
            <p className="text-muted-foreground mt-1 text-sm mb-4">
              {score === questions.length ? "¡Perfecto! Dominas todo 🌟" :
               score >= questions.length * 0.7 ? "¡Muy bien! Nivel avanzado 💪" :
               "Repasa los temas y vuelve a intentarlo 📚"}
            </p>
            <Button onClick={() => { if (onFinish) onFinish(score, questions.length); onBack(); }} className="w-full">
              Volver a materias
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!currentQuestion) return null;

  const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

  const difficultyBadge = {
    facil: { text: "Fácil", class: "bg-green-100 text-green-700" },
    medio: { text: "Medio", class: "bg-yellow-100 text-yellow-700" },
    dificil: { text: "Difícil", class: "bg-red-100 text-red-700" },
  };

  const badge = difficultyBadge[currentQuestion.difficulty as keyof typeof difficultyBadge];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="bg-card border-b border-border px-4 py-3 sticky top-0 z-30 shadow-sm">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft size={20} />
            <span className="font-semibold hidden sm:inline">Volver</span>
          </button>
          <div className="text-center flex-1 mx-4">
            <p className="text-sm font-bold text-foreground truncate">{subjectName}</p>
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-1">
              <BrainCircuit size={12} className="text-primary"/> 
              Modo Adaptativo • Pregunta {answered + 1}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-primary">{score}/{answered}</p>
            <p className="text-xs text-muted-foreground">aciertos</p>
          </div>
        </div>
      </div>

      <div className="w-full h-1.5 bg-muted z-30 relative">
        <div className="h-full bg-primary transition-all duration-300 rounded-r-full" style={{ width: `${(answered / questions.length) * 100}%` }} />
      </div>

      <div className={`max-w-2xl mx-auto px-4 py-6 space-y-4 animate-in fade-in duration-500 relative transition-all duration-300 ${isChatOpen ? 'pr-4 xl:mr-[400px]' : ''}`}>
        
        {/* Animated difficulty transition message */}
        {selectedAnswer && (
          <div className={`absolute -top-2 left-1/2 -translate-x-1/2 z-20 text-xs font-bold px-3 py-1 rounded-full shadow-lg ${isCorrect ? 'bg-green-500 text-white animate-bounce' : 'bg-amber-500 text-white animate-pulse'}`}>
            {isCorrect ? (currentLevelIndex === 2 ? '¡Nivel Máximo!' : '¡Subiendo nivel! 🚀') : (currentLevelIndex === 0 ? 'Repasando bases 📚' : 'Bajando nivel 📉')}
          </div>
        )}

        <div className="flex items-center gap-2 mb-2 w-full flex-wrap justify-between">
          <div className="flex gap-2 items-center">
            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-colors duration-300 ${badge.class}`}>{badge.text}</span>
            <span className="text-xs font-semibold text-primary/80 bg-primary/10 px-2.5 py-1 rounded-full truncate">Tema: {currentTopic}</span>
          </div>
          {!selectedAnswer && (
            <Button variant="outline" size="sm" onClick={() => setIsChatOpen(!isChatOpen)} className="rounded-full gap-2 text-primary border-primary hover:bg-primary/10">
              <Bot size={16} /> {isChatOpen ? "Cerrar tutor" : "Tutor AI"}
            </Button>
          )}
        </div>

        <Card className="border-0 shadow-sm bg-card transition-shadow">
          <CardContent className="p-5 space-y-4">
            {currentQuestion.imageUrl && (
              <img src={currentQuestion.imageUrl} alt="Contexto visual" className="w-full h-auto rounded-lg border border-border mb-2 shadow-sm max-h-[300px] object-contain bg-white p-2" />
            )}
            <LatexRenderer text={currentQuestion.text} className="text-foreground leading-relaxed whitespace-pre-line text-lg font-medium" />
          </CardContent>
        </Card>

        <div className="space-y-2.5">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedAnswer === option.label;
            const isCorrectOption = option.label === currentQuestion.correctAnswer;
            let borderClass = "border-border hover:border-primary/50";
            let bgClass = "bg-card";

            if (selectedAnswer) {
              if (isCorrectOption) { borderClass = "border-green-400"; bgClass = "bg-green-50"; }
              else if (isSelected) { borderClass = "border-red-400"; bgClass = "bg-red-50"; }
              else { borderClass = "border-border opacity-30 grayscale"; }
            }

            return (
              <button key={option.label} onClick={() => handleSelect(option.label)} disabled={!!selectedAnswer}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-300 ${borderClass} ${bgClass} ${!selectedAnswer ? "cursor-pointer hover:-translate-y-0.5 active:scale-[0.98]" : "transform-none"}`}>
                <div className="flex items-start gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors duration-300 ${
                    selectedAnswer && isCorrectOption ? "bg-green-500 text-white" :
                    selectedAnswer && isSelected ? "bg-red-500 text-white" : "bg-muted text-muted-foreground"
                  }`}>
                    {selectedAnswer && isCorrectOption ? <CheckCircle2 size={18} /> :
                     selectedAnswer && isSelected ? <XCircle size={18} /> : option.label}
                  </span>
                  <LatexRenderer text={option.text} className={`text-foreground pt-1 ${selectedAnswer && !isCorrectOption && !isSelected ? "text-muted-foreground" : ""}`} />
                </div>
              </button>
            );
          })}
        </div>

        {showExplanation && (
          <Card className={`border-2 ${isCorrect ? "border-green-300 bg-green-50" : "border-amber-300 bg-amber-50"} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
            <CardContent className="p-5">
              <div className="flex items-start gap-3">
                <Lightbulb className={`shrink-0 mt-0.5 ${isCorrect ? "text-green-600" : "text-amber-600"}`} size={22} />
                <div>
                  <p className={`font-bold mb-1 ${isCorrect ? "text-green-700" : "text-amber-700"}`}>
                    {isCorrect ? "¡Muy bien! 🎉" : "No te preocupes, el sistema adaptará el nivel 💪"}
                  </p>
                  <LatexRenderer text={currentQuestion.explanation} className="text-foreground text-sm leading-relaxed mb-3" />
                  {currentQuestion.tip && (
                    <div className="bg-primary/10 border border-primary/20 rounded-lg p-3">
                      <p className="text-sm text-primary font-semibold flex items-center gap-1.5">
                        <BrainCircuit size={16}/> Tip Exclusivo
                      </p>
                      <LatexRenderer text={currentQuestion.tip} className="text-xs text-foreground mt-1" />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {selectedAnswer && (
          <Button onClick={handleNext} className="w-full h-12 text-base font-bold gap-2 shadow-lg hover:shadow-xl transition-all animate-in fade-in slide-in-from-bottom-2" size="lg">
            Siguiente pregunta <ArrowRight size={18} />
          </Button>
        )}
      </div>

      {/* Floating Chatbot Overlay / Side Panel */}
      {isChatOpen && (
        <div className="fixed bottom-0 right-0 w-full sm:w-[380px] h-[60vh] sm:h-[500px] bg-card border-t sm:border-l sm:border-t-0 border-border z-40 sm:bottom-4 sm:right-4 sm:rounded-2xl shadow-2xl flex flex-col animate-in slide-in-from-bottom-5 sm:slide-in-from-right-5">
          {/* Chat Header */}
          <div className="bg-primary px-4 py-3 sm:rounded-t-2xl flex items-center justify-between shadow-sm shrink-0">
            <div className="flex items-center gap-2 text-primary-foreground">
              <Bot size={20} />
              <span className="font-bold text-sm">Tutor AI</span>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="text-primary-foreground/80 hover:text-white">
              <X size={20} />
            </button>
          </div>
          
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex gap-2 ${msg.role === 'student' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.role === 'tutor' ? 'bg-primary/10 text-primary' : 'bg-secondary text-secondary-foreground'
                }`}>
                  {msg.role === 'tutor' ? <Bot size={16} /> : <User size={16} />}
                </div>
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm ${
                  msg.role === 'tutor' ? 'bg-card border border-border text-foreground rounded-tl-sm' : 'bg-primary text-primary-foreground rounded-tr-sm'
                }`}>
                  <LatexRenderer text={msg.text} />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Bot size={16} />
                </div>
                <div className="bg-card border border-border px-3 py-3 rounded-2xl rounded-tl-sm flex gap-1">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms'}}/>
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms'}}/>
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms'}}/>
                </div>
              </div>
            )}
            <div ref={chatBottomRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-card border-t border-border sm:rounded-b-2xl shrink-0 flex gap-2">
            <input 
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={handleKeyPressChat}
              placeholder="Pregúntale al tutor pidiendo un tip..."
              className="flex-1 px-3 py-2 text-sm rounded-full bg-muted focus:outline-none focus:ring-1 focus:ring-primary/50"
            />
            <Button size="icon" className="rounded-full shrink-0" onClick={handleSendChat} disabled={!chatInput.trim() || isTyping}>
              <Send size={16} />
            </Button>
          </div>
        </div>
      )}

    </div>
  );
};

export default QuizView;
