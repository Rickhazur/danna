import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateText } from "@/lib/gemini";
import { Book, Save, Plus, Trash2, CheckCircle2, Wand2, Lightbulb, Sparkles, Timer, Headphones } from "lucide-react";

interface Note {
  id: string;
  type: 'concept' | 'formula' | 'tip' | 'user';
  title: string;
  content: string;
  isCompleted: boolean;
}

interface StudyNotebookProps {
  topic: string;
  onBack: () => void;
}

const StudyNotebook = ({ topic, onBack }: StudyNotebookProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [userNote, setUserNote] = useState("");
  const [mastery, setMastery] = useState(0);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isChallengeMode, setIsChallengeMode] = useState(false);

  useEffect(() => {
    generateNotebookContent();
  }, [topic]);

  useEffect(() => {
    const totalElements = notes.length + gameItems.length;
    if (totalElements > 0) {
      const completedNotes = notes.filter(n => n.isCompleted).length;
      const completedGames = gameItems.filter(i => i.currentCategory === i.category).length;
      setMastery(Math.round(((completedNotes + completedGames) / totalElements) * 100));
    }
  }, [notes, gameItems]);

  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    // Load saved data if exists
    const savedData = localStorage.getItem(`notebook_${topic}`);
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setNotes(parsed.notes || []);
        setGameItems(parsed.game || []);
        setMastery(parsed.mastery || 0);
        setIsLoading(false);
      } catch (e) {
        generateNotebookContent();
      }
    } else {
      generateNotebookContent();
    }
  }, [topic]);

  const saveNotebook = () => {
    const data = {
      notes,
      game: gameItems,
      mastery
    };
    localStorage.setItem(`notebook_${topic}`, JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const generateNotebookContent = async () => {
    // ... rest of the logic remains same but I'll update it to be cleaner
    setIsLoading(true);
    try {
      const prompt = `Actúa como un experto en Neurociencia y Gamificación. Crea un Laboratorio de Aprendizaje para el tema ESPECÍFICO: "${topic}".
      
      PARTE 1: 3 Flashcards (conceptos clave).
      PARTE 2: Un MINIJUEGO de clasificación. Genera 4 términos y sus categorías correctas (ej: "Leyes de Newton" -> "Física").
      
      IMPORTANTE: Devuelve ÚNICAMENTE un arreglo JSON con este formato:
      {
        "notes": [
          {"type": "concept", "title": "...", "content": "..."},
          {"type": "tip", "title": "...", "content": "..."}
        ],
        "game": [
          {"id": "g1", "text": "Término 1", "category": "Categoría A"},
          {"id": "g2", "text": "Término 2", "category": "Categoría B"}
        ]
      }`;

      const response = await generateText(prompt);
      const match = response.match(/\{[\s\S]*\}/);
      const data = match ? JSON.parse(match[0]) : JSON.parse(response);

      setNotes(data.notes.map((item: any, idx: number) => ({
        id: `auto-${idx}`,
        ...item,
        isCompleted: false
      })));

      setGameItems(data.game.map((item: any) => ({ ...item, currentCategory: undefined })));
    } catch (error) {
      console.error(error);
      setNotes([{ id: 'fb', type: 'tip', title: 'Generando...', content: 'Estamos personalizando tu cuaderno sobre ' + topic, isCompleted: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (id: string, category: string) => {
    const newItems = gameItems.map(item => item.id === id ? { ...item, currentCategory: category } : item);
    setGameItems(newItems);
    
    const item = newItems.find(i => i.id === id);
    if (item && item.category === category) {
      setGameFeedback("¡Excelente! " + item.text + " pertenece a " + category);
    } else {
      setGameFeedback("Ups, revisa de nuevo este concepto.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 font-sans selection:bg-primary/30 pb-20">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {/* Toast Notif */}
        {isSaved && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-black flex items-center gap-2 animate-in slide-in-from-top-10">
            <CheckCircle2 size={20} /> ¡CUADERNO GUARDADO!
          </div>
        )}

        {/* Header content ... (keeping the same UI) */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 shadow-2xl backdrop-blur-md">
          <div className="flex items-center gap-4">
             <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 rotate-3 transition-transform hover:rotate-0">
                <Sparkles className="text-white" size={32} />
             </div>
             <div>
               <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">{topic}</h1>
               <div className="flex items-center gap-2 mt-1">
                 <div className="h-2 w-32 bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-primary transition-all duration-1000 shadow-[0_0_8px_rgba(59,130,246,0.6)]" style={{ width: `${mastery}%` }} />
                 </div>
                 <span className="text-[10px] font-bold text-primary tracking-widest">{mastery}% MAESTRÍA</span>
               </div>
             </div>
          </div>
          <div className="flex gap-2">
             <Button variant="secondary" className="rounded-xl font-bold gap-2 shadow-lg shadow-white/5 active:scale-95 transition-transform" onClick={() => setIsChallengeMode(!isChallengeMode)}>
                <Timer size={18} /> {isChallengeMode ? "Laboratorio" : "Modo Reto"}
             </Button>
             <Button variant="ghost" className="rounded-xl text-slate-400 hover:text-white hover:bg-white/5" onClick={onBack}>Cerrar</Button>
          </div>
        </div>

        {/* Minijuego section ... */}
        {!isLoading && gameItems.length > 0 && (
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-[2.5rem] p-8 border border-white/5 shadow-inner">
             <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-yellow-500/10 text-yellow-400 rounded-lg">
                   <Wand2 size={24} />
                </div>
                <div>
                   <h2 className="text-xl font-black">Laboratorio de Clasificación</h2>
                   <p className="text-xs text-slate-400">Selecciona dónde encaja cada concepto para ganar mastroia.</p>
                </div>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                   {gameItems.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-800 rounded-2xl border border-slate-700 hover:border-primary/50 transition-all flex justify-between items-center group">
                         <span className="text-sm font-bold">{item.text}</span>
                         <div className="flex gap-1">
                            {Array.from(new Set(gameItems.map(i => i.category))).map(cat => (
                               <button 
                                  key={cat}
                                  onClick={() => handleCategorySelect(item.id, cat)}
                                  className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                                    item.currentCategory === cat 
                                    ? (item.category === cat ? 'bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]' : 'bg-red-500 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]')
                                    : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                                  }`}
                               >
                                  {cat}
                               </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex flex-col items-center justify-center p-6 bg-slate-950/50 rounded-3xl border border-dashed border-slate-800">
                    <p className="text-sm font-mono text-center text-primary/80 animate-pulse">{gameFeedback || "Clasifica los términos para subir tu % de maestría..."}</p>
                    <Book className="mt-4 opacity-10" size={60} />
                </div>
             </div>
          </div>
        )}

        {/* Learning Lab Grid ... */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-48 bg-slate-800 animate-pulse rounded-[2rem]" />)
          ) : (
            notes.map((note) => (
              <div 
                key={note.id}
                onClick={() => isChallengeMode && toggleReveal(note.id)}
                className={`group relative overflow-hidden p-6 rounded-[2rem] border-2 transition-all duration-500 cursor-pointer flex flex-col ${
                  note.isCompleted ? 'border-green-500/30 bg-green-500/5' : 
                  isChallengeMode ? 'border-primary/50 bg-slate-800/80 hover:scale-[1.02]' : 'border-slate-700 bg-slate-800/40 hover:border-slate-600'
                }`}
              >
                <div className={`mb-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                  note.type === 'concept' ? 'bg-blue-500/20 text-blue-400' :
                  note.type === 'tip' ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {note.type === 'concept' ? <Book size={10} /> : <Lightbulb size={10} />}
                  {note.type}
                </div>

                <h3 className="text-lg font-bold mb-3 leading-snug">{note.title}</h3>
                <div className="flex-1 relative min-h-[60px]">
                  {isChallengeMode && !revealedIds.has(note.id) ? (
                    <div className="absolute inset-0 bg-slate-700/50 backdrop-blur-md rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-600 border-dashed">
                      Toca para revelar
                    </div>
                  ) : (
                    <p className="text-sm text-slate-400 leading-relaxed font-medium">
                      {note.content}
                    </p>
                  )}
                </div>

                <div className="mt-6 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                   <button 
                    onClick={(e) => { e.stopPropagation(); toggleNote(note.id); }}
                    className={`flex items-center gap-2 text-[10px] font-bold p-2 rounded-lg transition-colors ${note.isCompleted ? 'text-green-400' : 'text-slate-500 hover:text-white'}`}
                   >
                     <CheckCircle2 size={14} /> {note.isCompleted ? "Dominado" : "Lo aprendí"}
                   </button>
                   <button className="text-[10px] font-bold text-slate-500 hover:text-primary transition-colors flex items-center gap-1">
                     ¿Por qué? <Wand2 size={12} />
                   </button>
                </div>

                {note.isCompleted && <div className="absolute -bottom-1 left-0 right-0 h-1 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.5)]" />}
              </div>
            ))
          )}
        </div>

        {/* Quick Tools */}
        <div className="flex flex-wrap justify-center gap-4 py-8">
           <div className="bg-slate-800/50 p-1 rounded-2xl border border-slate-700 flex gap-1">
              <Button onClick={saveNotebook} className="bg-primary hover:bg-primary/80 text-white rounded-xl h-10 px-6 font-black text-xs shadow-lg shadow-primary/20 active:scale-95 transition-transform"><Save size={14} className="mr-2" /> Guardar Todo</Button>
              <Button onClick={onBack} variant="ghost" className="rounded-xl h-10 px-6 font-bold text-xs text-slate-400 hover:text-white active:scale-95 transition-all"><Headphones size={14} className="mr-2" /> Volver a Escuchar</Button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default StudyNotebook;
