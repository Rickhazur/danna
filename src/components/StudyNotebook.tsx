import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { generateText } from "@/lib/gemini";
import { Book, Save, Plus, Trash2, CheckCircle2, Wand2, Lightbulb, Sparkles, Timer, Headphones, ArrowLeft } from "lucide-react";

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
  const [gameItems, setGameItems] = useState<{id: string, text: string, category: string, currentCategory?: string}[]>([]);
  const [gameFeedback, setGameFeedback] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [userNote, setUserNote] = useState("");
  const [mastery, setMastery] = useState(0);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [isChallengeMode, setIsChallengeMode] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
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

  useEffect(() => {
    const totalElements = notes.length + gameItems.length;
    if (totalElements > 0) {
      const completedNotes = notes.filter(n => n.isCompleted).length;
      const completedGames = gameItems.filter(i => i.currentCategory === i.category).length;
      setMastery(Math.round(((completedNotes + completedGames) / totalElements) * 100));
    }
  }, [notes, gameItems]);

  const saveNotebook = () => {
    const data = { notes, game: gameItems, mastery };
    localStorage.setItem(`notebook_${topic}`, JSON.stringify(data));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const generateNotebookContent = async () => {
    setIsLoading(true);
    try {
      const prompt = `Actúa como un experto en Neurociencia. Crea 3 flashcards y un minijuego de clasificación (4 términos y sus categorías) para el tema: "${topic}".
      Devuelve ÚNICAMENTE un JSON así:
      {
        "notes": [{"type": "concept", "title": "...", "content": "..."}, ...],
        "game": [{"id": "g1", "text": "...", "category": "Categoría A"}, ...]
      }`;

      const response = await generateText(prompt);
      const match = response.match(/\{[\s\S]*\}/);
      const data = match ? JSON.parse(match[0]) : JSON.parse(response);

      setNotes(data.notes.map((item: any, idx: number) => ({
        id: `auto-${idx}-${Date.now()}`,
        ...item,
        isCompleted: false
      })));
      setGameItems(data.game.map((item: any) => ({ ...item, currentCategory: undefined })));
    } catch (error) {
      console.error(error);
      setNotes([{ id: 'fb', type: 'tip', title: 'Nota de ayuda', content: 'Repasa los conceptos básicos de ' + topic, isCompleted: false }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategorySelect = (id: string, category: string) => {
    const newItems = gameItems.map(item => item.id === id ? { ...item, currentCategory: category } : item);
    setGameItems(newItems);
    const item = newItems.find(i => i.id === id);
    if (item && item.category === category) {
      setGameFeedback("¡Excelente! Es correcto.");
    } else {
      setGameFeedback("Ups, intenta otra categoría.");
    }
  };

  const toggleNote = (id: string) => {
    setNotes(notes.map(n => n.id === id ? { ...n, isCompleted: !n.isCompleted } : n));
  };

  const toggleReveal = (id: string) => {
    const next = new Set(revealedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setRevealedIds(next);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-100 p-4 md:p-8 font-sans pb-20 overflow-y-auto">
      <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-700">
        
        {isSaved && (
          <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl font-black animate-in slide-in-from-top-10">
            ¡GUARDADO!
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 bg-slate-800/50 p-6 rounded-[2rem] border border-slate-700 shadow-2xl">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onBack} className="text-white hover:bg-white/10 shrink-0">
                <ArrowLeft size={24} />
             </Button>
             <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-lg rotate-3">
                <Sparkles className="text-white" size={24} />
             </div>
             <div>
               <h1 className="text-2xl font-black">{topic}</h1>
               <div className="flex items-center gap-2 mt-1">
                 <div className="h-1.5 w-24 bg-slate-700 rounded-full overflow-hidden">
                   <div className="h-full bg-primary" style={{ width: `${mastery}%` }} />
                 </div>
                 <span className="text-[10px] font-bold text-primary">{mastery}% MAESTRÍA</span>
               </div>
             </div>
          </div>
          <div className="flex gap-2">
             <Button variant="secondary" className="rounded-xl font-bold" onClick={() => setIsChallengeMode(!isChallengeMode)}>
                <Timer size={18} /> {isChallengeMode ? "Laboratorio" : "Modo Reto"}
             </Button>
             <Button className="rounded-xl font-bold bg-green-600 hover:bg-green-700" onClick={saveNotebook}>
                <Save size={18} /> Guardar
             </Button>
          </div>
        </div>

        {/* Minijuego */}
        {!isLoading && gameItems.length > 0 && (
          <div className="bg-slate-800/80 rounded-[2.5rem] p-6 border border-white/5">
             <h2 className="text-xl font-black mb-4 px-2">Laboratorio de Clasificación 🧪</h2>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                   {gameItems.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-700 flex justify-between items-center">
                         <span className="text-sm font-bold pr-2">{item.text}</span>
                         <div className="flex gap-1 flex-wrap justify-end">
                            {Array.from(new Set(gameItems.map(i => i.category))).map(cat => (
                               <button 
                                  key={cat}
                                  onClick={() => handleCategorySelect(item.id, cat)}
                                  className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${
                                    item.currentCategory === cat 
                                    ? (item.category === cat ? 'bg-green-600' : 'bg-red-600')
                                    : 'bg-slate-700 text-slate-400'
                                  }`}
                               >
                                  {cat}
                                </button>
                            ))}
                         </div>
                      </div>
                   ))}
                </div>
                <div className="flex items-center justify-center p-4 bg-slate-950/30 rounded-2xl border border-dashed border-slate-700">
                    <p className="text-xs font-mono text-center text-primary/80">{gameFeedback || "Clasifica los términos..."}</p>
                </div>
             </div>
          </div>
        )}

        {/* Notes Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {isLoading ? (
            Array(3).fill(0).map((_, i) => <div key={i} className="h-40 bg-slate-800 animate-pulse rounded-[2rem]" />)
          ) : (
            notes.map((note) => (
              <div 
                key={note.id}
                onClick={() => isChallengeMode && toggleReveal(note.id)}
                className={`group p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex flex-col ${
                  note.isCompleted ? 'border-green-500/30 bg-green-950/10' : 
                  isChallengeMode ? 'border-primary/50 bg-slate-800' : 'border-slate-700 bg-slate-800/40'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-white/10">{note.type}</span>
                  {note.isCompleted && <CheckCircle2 className="text-green-500" size={16} />}
                </div>
                <h3 className="text-lg font-bold mb-2">{note.title}</h3>
                <div className="flex-1">
                  {isChallengeMode && !revealedIds.has(note.id) ? (
                    <div className="h-20 bg-slate-900/50 rounded-xl flex items-center justify-center text-[10px] border border-dashed border-slate-700">Toca para revelar</div>
                  ) : (
                    <p className="text-sm text-slate-400 leading-relaxed">{note.content}</p>
                  )}
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={(e) => { e.stopPropagation(); toggleNote(note.id); }}
                  className={`mt-4 w-full rounded-xl text-[10px] font-black ${note.isCompleted ? 'text-green-400' : 'text-slate-400'}`}
                >
                  {note.isCompleted ? "DOMINADO" : "MARCAR APRENDIDO"}
                </Button>
              </div>
            ))
          )}

          {/* User Note */}
          <div className="md:col-span-2 lg:col-span-1 bg-slate-800/40 rounded-[2rem] p-6 border border-slate-700/50 flex flex-col gap-3">
            <h3 className="font-bold flex items-center gap-2 px-1"><Plus size={16} /> Nota Personal</h3>
            <textarea 
              value={userNote}
              onChange={(e) => setUserNote(e.target.value)}
              placeholder="Escribe algo..."
              className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl p-3 text-xs outline-none focus:ring-1 focus:ring-primary min-h-[80px]"
            />
            <Button size="sm" onClick={() => {
              if(!userNote.trim()) return;
              setNotes([{ id: Date.now().toString(), type: 'user', title: 'Mi Nota', content: userNote, isCompleted: false }, ...notes]);
              setUserNote("");
            }} className="rounded-xl font-bold">Añadir</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyNotebook;
