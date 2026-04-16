import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Pause, SkipForward, SkipBack, Headphones, UserCircle2, Mic, Sparkles, Loader2, PenTool, BookOpen } from "lucide-react";
import { generateText } from "@/lib/gemini";

export interface PodcastLine {
  id: string;
  speaker: "Lina" | "Sofía";
  text: string;
  board?: string;
}

const icfesTopics = {
  "lectura-critica": [
    "Textos Argumentativos (Tesis y Razones)", 
    "Textos Filosóficos (Ideas Complejas)", 
    "Textos Literarios (Novela y Cuento)", 
    "Noticias, Textos Periodísticos",
    "Infografías y Cómics (Texto Discontinuo)",
    "Identificación de Ideas Principales",
    "Coherencia y Cohesión",
    "Análisis de Argumentos Falaces"
  ],
  "matematicas": [
    "Regla de 3 y Porcentajes", 
    "Fracciones y Proporciones",
    "Álgebra Básica y Ecuaciones", 
    "Geometría (Áreas y Volúmenes)", 
    "Teorema de Pitágoras",
    "Trigonometría: Funciones Seno, Coseno y Tangente",
    "Trigonometría: Teoremas del Seno y Coseno",
    "Funciones: Lineal, Cuadrática y Exponencial",
    "Cálculo: Límites y Derivadas Básicas",
    "Estadística (Media, Moda, Mediana)",
    "Probabilidad y Combinatoria",
    "Interpretación de Gráficos Complejos"
  ],
  "sociales": [
    "Constitución Política de 1991 (Derechos)", 
    "Mecanismos de Participación Ciudadana",
    "Competencias Ciudadanas y Multiperspectivismo",
    "Historia de Colombia: Siglo XX y Conflicto", 
    "Economía y Globalización",
    "Geografía Humana y Política",
    "Historia Universal: Guerra Fría y Actualidad"
  ],
  "ciencias": [
    "Biología: Genética (Leyes de Mendel)",
    "Biología: Evolución y Selección Natural",
    "Biología: Homeostasis y Sistemas del Cuerpo",
    "Química: Estructura Atómica y Tabla Periódica",
    "Química: Estequiometría (Cálculo de Moles)",
    "Química: Química Orgánica (Hidrocarburos)",
    "Química: PH, Ácidos y Bases",
    "Física: Dinámica (Leyes de Newton)",
    "Física: Cinemática y Caída Libre",
    "Física: Trabajo, Energía y Potencia",
    "Física: Óptica, Ondas y Sonido",
    "Física: Electricidad y Magnetismo"
  ],
  "ingles": [
    "Interpretación de Avisos y Letreros", 
    "Conversaciones Cortas (Grado 11)",
    "Tiempos Verbales (Present Perfect, Passives)",
    "Comprensión Lectora: Textos Académicos",
    "Vocabulario Técnico para el ICFES"
  ]
};

export default function PodcastPlayer({ subjectId, onOpenNotebook }: { subjectId: string, onOpenNotebook?: (topic: string) => void }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [script, setScript] = useState<PodcastLine[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState<string>("");

  const availableTopics = icfesTopics[subjectId as keyof typeof icfesTopics] || ["Tema General"];

  const synth = window.speechSynthesis;

  useEffect(() => {
    const loadVoices = () => {
      const availableVoices = synth.getVoices();
      const spanishVoices = availableVoices.filter(v => v.lang.includes('es'));
      setVoices(spanishVoices.length > 0 ? spanishVoices : availableVoices);
    };
    
    loadVoices();
    if (synth.onvoiceschanged !== undefined) {
      synth.onvoiceschanged = loadVoices;
    }
    
    return () => {
      synth.cancel();
    };
  }, []);

  const generateDynamicPodcast = async () => {
    const topicToExplain = selectedTopic === "custom" ? customTopic : selectedTopic;
    if (!topicToExplain) return;
    
    setIsGenerating(true);
    setScript([]);
    synth.cancel();

    const prompt = `Actúa como un dúo dinámico: Lina (Profesora Colombiana) y Sofía (Profesora Americana invitada).
Van a explicar el tema "${topicToExplain}" para el examen del ICFES colombiano (${subjectId}).

MISIÓN: Hacer que temas complejos suenen MUY FÁCILES.
El oyente es una persona que dejó la escuela hace tiempo.

REGLAS DE IDIOMA Y ROLES:
1. LINA (ESPAÑOL): Siempre habla en español. Es la guía principal.
2. SOFÍA (AMERICANA): 
   - SI EL TEMA ES "INGLÉS" (${subjectId === 'ingles'}): Sofía usa inglés para dar ejemplos reales y frases nativas, y Lina explica en español.
   - SI EL TEMA NO ES "INGLÉS": Sofía debe hablar TOTALMENTE EN ESPAÑOL (con su tono amable de experta extranjera). NO uses inglés en temas como Lectura Crítica, Ciencias o Matemáticas.
3. USA ANALOGÍAS: Explica con ejemplos de la vida diaria (fútbol, cocina, casa).
4. El guion debe ser dinámico (6-10 intercambios) y el "board" debe resumir lo más fácil.

IMPORTANTE: Devuelve ÚNICAMENTE un arreglo JSON válido como este:
[
  { "id": "1", "speaker": "Lina", "text": "...", "board": "..." },
  { "id": "2", "speaker": "Sofía", "text": "...", "board": "..." }
]`;

    try {
      const response = await generateText(prompt);
      console.log('Gemini raw response:', response);
      
      if (response.startsWith("Lo siento")) {
        throw new Error(response);
      }

      // Intentar extraer el array JSON aunque Gemini haya devuelto texto antes o después
      let jsonStr = response;
      const match = response.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (match) {
        jsonStr = match[0];
      } else {
        jsonStr = response.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      
      const generatedScript = JSON.parse(jsonStr);
      setScript(generatedScript);
    } catch (e) {
      console.error('Error parsing JSON podcast:', e);
      setScript([{ id: "err", speaker: "Lina", text: "¡Oops! Hubo un error de conexión al generar tu podcast. Asegúrate de que la API key y tu conexión a internet estén bien." }]);
    }
    setIsGenerating(false);
  };

  const speakLine = (index: number) => {
    if (index >= script.length) {
      setIsPlaying(false);
      setCurrentIndex(0);
      return;
    }

    setCurrentIndex(index);
    const line = script[index];
    const utterance = new SpeechSynthesisUtterance(line.text);
    
    // Filtro para asegurar voces femeninas
    const esVoicesAvailable = voices.filter(v => v.lang.startsWith('es'));
    const femaleNames = /dalia|salome|elena|helena|sabina|hilda|lucia|marta|paola|silvia|zaira|juana/i;
    const latinVoices = esVoicesAvailable.filter(v => !v.lang.includes('ES') && !v.name.toLowerCase().includes('spain'));
    const finalSelection = latinVoices.length > 0 ? latinVoices : esVoicesAvailable; // Fallback solo si no hay NINGUNA latina
    
    // Ambas voces serán femeninas ya que son las disponibles en el sistema
    const femaleVoices = finalSelection.filter(v => femaleNames.test(v.name) || (/female|mujer/i.test(v.name)));
    
    // Lina (Voz Femenina 1)
    const linaVoice = femaleVoices[0] || finalSelection[0];
    // Sofía (Mujer)
    let sofiaVoice;
    if (subjectId === "ingles") {
       // Si es inglés, buscar una voz nativa de Estados Unidos para Sofía
       const usVoices = voices.filter(v => v.lang.includes('US') || v.lang.includes('GB'));
       sofiaVoice = usVoices.find(v => femaleNames.test(v.name) && /neural|online/i.test(v.name))
                 || usVoices.find(v => femaleNames.test(v.name))
                 || usVoices[0] || finalSelection[1] || voices[0];
       utterance.lang = "en-US"; // Cambiar el idioma de lectura a Inglés para Sofía
    } else {
       sofiaVoice = femaleVoices[1] || femaleVoices[0] || finalSelection[1] || finalSelection[0];
       utterance.lang = "es-MX";
    }

    utterance.rate = 1.3; // Mucho más rápido y con mayor energía
    utterance.pitch = line.speaker === "Lina" ? 1.0 : 1.2; // Ligera diferencia de tono
    utterance.voice = line.speaker === "Lina" ? linaVoice : sofiaVoice;

    utterance.onend = () => {
      if (isPlaying) {
        speakLine(index + 1);
      }
    };

    synth.speak(utterance);
  };

  useEffect(() => {
    if (script.length === 0) return;
    
    if (isPlaying) {
      synth.cancel();
      speakLine(currentIndex);
    } else {
      synth.pause();
    }
  }, [isPlaying]);

  const togglePlay = () => {
    if (!isPlaying && synth.paused) {
      synth.resume();
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const nextLine = () => {
    synth.cancel();
    const next = Math.min(currentIndex + 1, script.length - 1);
    setCurrentIndex(next);
    if (isPlaying) speakLine(next);
  };

  const prevLine = () => {
    synth.cancel();
    const prev = Math.max(currentIndex - 1, 0);
    setCurrentIndex(prev);
    if (isPlaying) speakLine(prev);
  };

  const isButtonDisabled = (selectedTopic === "custom" && !customTopic.trim()) || !selectedTopic || isGenerating;

  return (
    <Card className="max-w-2xl mx-auto w-full border-2 border-primary/20 bg-card overflow-hidden shadow-xl animate-in zoom-in-95">
      <div className="bg-primary/10 p-4 border-b border-primary/20 flex flex-col items-stretch gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center shadow-inner shrink-0">
              <Mic className="text-primary-foreground" size={24} />
            </div>
            <div>
              <h3 className="font-bold text-lg text-foreground">Podcast Generativo</h3>
              <p className="text-secondary-foreground text-sm flex items-center gap-2">
                <Headphones size={14} /> Selecciona o escribe un tema
              </p>
            </div>
          </div>

          <select 
            className="bg-background border border-input rounded-md px-3 py-2 text-sm w-full sm:w-auto outline-none focus:ring-2 focus:ring-primary shadow-sm"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
          >
            <option value="" disabled>Selecciona el Tema...</option>
            {availableTopics.map(t => (
               <option key={t} value={t}>{t}</option>
            ))}
            <option value="custom" className="font-bold text-primary">✏️ Escribir otro tema...</option>
          </select>
        </div>

        {selectedTopic === "custom" && (
          <div className="w-full flex mt-2 animate-in slide-in-from-top-2">
            <input 
              type="text" 
              placeholder="Ej: ¿Qué es la termodinámica? o Diferencia entre ADN y ARN..."
              className="w-full bg-background border border-input rounded-md px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary shadow-sm"
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
              autoFocus
            />
          </div>
        )}
      </div>

      <CardContent className="p-0">
        {script.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center p-6 text-center space-y-4 bg-muted/10">
            <Sparkles size={40} className="text-purple-400" />
            <p className="text-muted-foreground">Tu profesora IA creará un podcast desde cero sobre el tema que elijas.</p>
            <Button 
               onClick={generateDynamicPodcast} 
               disabled={isButtonDisabled}
               className="bg-purple-600 hover:bg-purple-700 text-white font-bold"
            >
              {isGenerating ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Escribiendo guion y grabando voces...</> : "Generar Podcast Mágico"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-[28rem] divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Panel Izquierdo: Pódcast y Controles */}
            <div className="w-full md:w-1/2 flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                {script.map((line, idx) => (
                  <div 
                    key={line.id} 
                    className={`flex gap-3 transition-opacity duration-300 ${idx === currentIndex ? 'opacity-100 scale-100' : 'opacity-40 scale-95'}`}
                  >
                    <div className={`mt-1 rounded-full p-1.5 h-8 w-8 flex items-center justify-center shrink-0 ${line.speaker === "Lina" ? "bg-pink-100 text-pink-600" : "bg-purple-100 text-purple-600"}`}>
                      <UserCircle2 size={20} />
                    </div>
                    <div className={`p-3 rounded-xl rounded-tl-sm text-sm border shadow-sm ${idx === currentIndex ? 'bg-primary text-primary-foreground border-primary' : 'bg-card border-border text-foreground'}`}>
                      <p className="font-bold text-xs mb-1 opacity-80">{line.speaker}</p>
                      <p className="leading-relaxed">{line.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 bg-card border-t border-border flex flex-col gap-3 shrink-0">
                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                  <div className="bg-primary h-full transition-all duration-300" style={{ width: `${((currentIndex + 1) / script.length) * 100}%` }} />
                </div>
                {/* Controls */}
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-4">
                <button 
                  onClick={prevLine} 
                  className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
                  disabled={currentIndex === 0}
                >
                  <SkipBack size={24} />
                </button>
                <button 
                  onClick={togglePlay} 
                  className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
                </button>
                <button 
                  onClick={nextLine} 
                  className="p-2 text-muted-foreground hover:text-primary transition-colors disabled:opacity-30"
                  disabled={currentIndex === script.length - 1}
                >
                  <SkipForward size={24} />
                </button>
              </div>

              {script.length > 0 && onOpenNotebook && (
                <Button 
                  onClick={() => onOpenNotebook(customTopic || selectedTopic)} 
                  variant="outline" 
                  className="gap-2 rounded-xl border-dashed border-primary/40 hover:bg-primary/5 font-bold"
                >
                  <BookOpen size={18} /> Ver Cuaderno
                </Button>
              )}
            </div>
              </div>
            </div>

            {/* Panel Derecho: Tablero Sincronizado IA */}
            <div className="w-full md:w-1/2 bg-[#1a1f2b] p-6 relative overflow-hidden flex items-center justify-center border-l-8 border-[#2d3748]">
              <div className="absolute top-4 left-4 flex gap-2 items-center text-slate-400 opacity-70">
                <PenTool size={16} />
                <span className="text-xs font-mono uppercase tracking-widest">Tablero Inteligente</span>
              </div>
              
              {/* Marco de gis decorativo */}
              <div className="w-full h-full border-2 border-dashed border-slate-600/30 rounded-lg flex flex-col items-center justify-center p-6 text-center shadow-inner mt-6 overflow-hidden">
                {/* Visual Aid Detection */}
                {(script[currentIndex]?.board?.toLowerCase().includes("pitágoras") || 
                  script[currentIndex]?.board?.toLowerCase().includes("triángulo") ||
                  script[currentIndex]?.board?.includes("a² + b²")) && (
                  <div className="mb-4 animate-in zoom-in duration-500">
                    <svg width="120" height="100" viewBox="0 0 120 100" className="drop-shadow-[0_0_8px_rgba(255,255,255,0.4)]">
                      <path d="M 20 80 L 100 80 L 20 20 Z" fill="none" stroke="white" strokeWidth="3" strokeLinejoin="round" />
                      <rect x="20" y="70" width="10" height="10" fill="none" stroke="white" strokeWidth="1" />
                      <text x="55" y="95" fill="white" fontSize="10" className="italic">b (cateto)</text>
                      <text x="5" y="55" fill="white" fontSize="10" transform="rotate(-90 5 55)" className="italic">a (cateto)</text>
                      <text x="65" y="45" fill="white" fontSize="10" transform="rotate(-37 65 45)" className="italic font-bold">c (hipotenusa)</text>
                    </svg>
                  </div>
                )}

                {script[currentIndex]?.board?.toLowerCase().includes("círculo") && (
                   <div className="mb-4 animate-in zoom-in duration-500">
                     <svg width="100" height="100" viewBox="0 0 100 100">
                       <circle cx="50" cy="50" r="40" fill="none" stroke="white" strokeWidth="3" />
                       <line x1="50" y1="50" x2="90" y2="50" stroke="white" strokeWidth="2" strokeDasharray="4" />
                       <text x="65" y="45" fill="white" fontSize="12">r</text>
                       <circle cx="50" cy="50" r="3" fill="white" />
                     </svg>
                   </div>
                )}

                <p 
                    className="font-mono text-xl md:text-2xl text-slate-100 whitespace-pre-wrap leading-relaxed blur-[0.2px]" 
                    style={{ textShadow: "0 0 5px rgba(255,255,255,0.3)" }}
                >
                  {script[currentIndex]?.board || "..."}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
