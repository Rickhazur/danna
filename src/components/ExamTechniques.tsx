import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Clock, Brain, Target, AlertTriangle, CheckCircle2, Lightbulb, BookOpen, ChevronDown, ChevronUp } from "lucide-react";

interface ExamTechniquesProps {
  onBack: () => void;
}

const techniques = [
  {
    category: "⏱️ Gestión del Tiempo",
    color: "from-blue-500/20 to-blue-500/5",
    border: "border-blue-500/30",
    icon: <Clock className="text-blue-500" size={24} />,
    tips: [
      {
        title: "La regla del minuto por pregunta",
        content: "Tienes ~270 minutos para ~278 preguntas. Eso es casi 1 minuto por pregunta. Si una pregunta te toma más de 2 minutos, MÁRCALA y sigue. Vuelve a ella al final.",
      },
      {
        title: "Divide el examen en bloques",
        content: "Sesión mañana: Lectura Crítica + Matemáticas + Sociales. Sesión tarde: Ciencias + Inglés. No gastes toda tu energía en la primera sesión.",
      },
      {
        title: "Los últimos 15 minutos son sagrados",
        content: "Deja los últimos 15 minutos para revisar las preguntas que dejaste en blanco. Una respuesta al azar tiene 25% de probabilidad de acertar. ¡Es mejor que dejarla vacía!",
      },
    ],
  },
  {
    category: "🧠 Técnicas de Respuesta",
    color: "from-purple-500/20 to-purple-500/5",
    border: "border-purple-500/30",
    icon: <Brain className="text-purple-500" size={24} />,
    tips: [
      {
        title: "Eliminación: Tu mejor arma",
        content: "Si no sabes la respuesta, elimina las opciones que SEGURO están mal. Si eliminas 2 de 4, tu probabilidad sube de 25% a 50%. En el ICFES esto es ORO.",
      },
      {
        title: "Lee la pregunta ANTES del texto",
        content: "En Lectura Crítica, lee primero la pregunta y luego el texto. Así sabes QUÉ buscar y no pierdes tiempo leyendo detalles irrelevantes.",
      },
      {
        title: "La respuesta más completa suele ser correcta",
        content: "Cuando tengas duda entre dos opciones, elige la más COMPLETA y matizada. El ICFES rara vez tiene respuestas extremas como 'siempre' o 'nunca'.",
      },
      {
        title: "Cuidado con las trampas de números",
        content: "En Matemáticas, el ICFES pone como opciones los resultados de operaciones parciales. Ejemplo: si debes sumar y luego dividir, ponen el resultado de solo sumar como opción trampa.",
      },
    ],
  },
  {
    category: "🎯 Estrategias por Materia",
    color: "from-green-500/20 to-green-500/5",
    border: "border-green-500/30",
    icon: <Target className="text-green-500" size={24} />,
    tips: [
      {
        title: "Lectura Crítica (~41 preguntas)",
        content: "• Identifica el tipo de texto (argumentativo, narrativo, informativo)\n• Busca la TESIS (lo que el autor quiere que creas)\n• Los conectores te revelan la estructura: 'sin embargo' = contraste, 'por lo tanto' = conclusión\n• Diferencia HECHO (se puede comprobar) de OPINIÓN (lo que alguien cree)",
      },
      {
        title: "Matemáticas (~50 preguntas)",
        content: "• Memoriza: perímetro = rodear, área = cubrir, volumen = llenar\n• Triángulo: (base × altura) / 2 — el ICFES SIEMPRE pone el resultado sin dividir como trampa\n• Porcentaje = (parte / total) × 100\n• Si no puedes plantear la ecuación, PRUEBA cada opción",
      },
      {
        title: "Sociales (~50 preguntas)",
        content: "• Constitución de 1991: tutela, derechos fundamentales, mecanismos de participación\n• 3 ramas del poder: Ejecutiva (Presidente), Legislativa (Congreso), Judicial (Jueces)\n• 5 regiones naturales: Caribe, Pacífica, Andina, Orinoquía, Amazonía\n• Inflación = precios suben, Devaluación = peso baja",
      },
      {
        title: "Ciencias Naturales (~58 preguntas)",
        content: "• Célula: membrana (protege), núcleo (ADN), mitocondria (energía)\n• Leyes de Newton: 1) Inercia, 2) F=m×a, 3) Acción-Reacción\n• Tabla periódica: Grupo = columna (propiedades similares), Periodo = fila\n• Ecosistema: productor → consumidor 1° → consumidor 2° → descomponedor",
      },
      {
        title: "Inglés (~29 preguntas)",
        content: "• Lee las opciones primero, luego el texto\n• Busca cognados (palabras parecidas al español): 'important', 'natural', 'culture'\n• En gramática: 's' al final del verbo = tercera persona (he/she/it)\n• Si no entiendes todo, busca las palabras clave que respondan la pregunta",
      },
    ],
  },
  {
    category: "⚠️ Errores Comunes a Evitar",
    color: "from-red-500/20 to-red-500/5",
    border: "border-red-500/30",
    icon: <AlertTriangle className="text-red-500" size={24} />,
    tips: [
      {
        title: "No cambies la respuesta sin razón",
        content: "Estudios muestran que el primer instinto suele ser correcto. Solo cambia tu respuesta si encuentras una razón CONCRETA para hacerlo, no por nervios.",
      },
      {
        title: "No dejes preguntas en blanco",
        content: "En el ICFES NO descuentan por respuesta incorrecta. Si no sabes, marca ALGO. Tienes 25% de probabilidad al azar vs 0% si dejas en blanco.",
      },
      {
        title: "No te quedes atascada en una pregunta",
        content: "Si no sabes después de 2 minutos, marca una opción, señala la pregunta para revisión y SIGUE. Las preguntas fáciles valen lo mismo que las difíciles.",
      },
      {
        title: "Cuida el óvalo de la hoja de respuestas",
        content: "Rellena completamente el óvalo con lápiz #2. No hagas marcas fuera del óvalo. Si borras, hazlo COMPLETAMENTE. La máquina puede leer mal si quedan residuos.",
      },
    ],
  },
  {
    category: "💪 El Día del Examen",
    color: "from-orange-500/20 to-orange-500/5",
    border: "border-orange-500/30",
    icon: <Lightbulb className="text-orange-500" size={24} />,
    tips: [
      {
        title: "La noche antes",
        content: "NO estudies. Tu cerebro necesita descansar para rendir. Duerme mínimo 7 horas. Prepara tu documento de identidad, lápices #2 y borrador.",
      },
      {
        title: "Desayuna bien",
        content: "Come proteínas (huevo) y carbohidratos (arepa, pan). Evita mucho café — los nervios ya te tendrán despierta. Lleva agua y un snack para el descanso.",
      },
      {
        title: "Llega 30 minutos antes",
        content: "Llegarás más tranquila, encontrarás tu salón sin estrés y podrás relajarte antes de empezar. Los nervios de último minuto bajan tu rendimiento un 15%.",
      },
      {
        title: "Respira antes de empezar",
        content: "Cuando tengas el cuadernillo, cierra los ojos y haz 3 respiraciones profundas (4 seg inhalar, 4 seg sostener, 4 seg exhalar). Esto activa tu corteza prefrontal y mejora la concentración.",
      },
    ],
  },
];

const ExamTechniques = ({ onBack }: ExamTechniquesProps) => {
  const [expandedCategory, setExpandedCategory] = useState<number | null>(0);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-purple-600 text-white px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={onBack} className="flex items-center gap-2 text-white/80 hover:text-white transition-colors mb-4">
            <ArrowLeft size={18} /> Volver
          </button>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <BookOpen size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black">Machete ICFES 🧠</h1>
              <p className="text-white/80 text-sm">Técnicas probadas para sacar el máximo puntaje</p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-blue-500/10 rounded-2xl p-3 text-center border border-blue-500/20">
            <p className="text-2xl font-black text-blue-600">278</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">Preguntas</p>
          </div>
          <div className="bg-purple-500/10 rounded-2xl p-3 text-center border border-purple-500/20">
            <p className="text-2xl font-black text-purple-600">4:30h</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">Duración</p>
          </div>
          <div className="bg-green-500/10 rounded-2xl p-3 text-center border border-green-500/20">
            <p className="text-2xl font-black text-green-600">5</p>
            <p className="text-[9px] uppercase font-bold text-muted-foreground">Materias</p>
          </div>
        </div>

        {/* Accordion Categories */}
        {techniques.map((cat, catIdx) => (
          <Card key={catIdx} className={`overflow-hidden border-2 ${expandedCategory === catIdx ? cat.border : 'border-border/50'} transition-all shadow-sm`}>
            <button
              onClick={() => setExpandedCategory(expandedCategory === catIdx ? null : catIdx)}
              className={`w-full p-4 flex items-center justify-between bg-gradient-to-r ${cat.color} hover:brightness-95 transition-all`}
            >
              <div className="flex items-center gap-3">
                {cat.icon}
                <span className="font-black text-foreground text-sm">{cat.category}</span>
              </div>
              {expandedCategory === catIdx ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
            </button>

            {expandedCategory === catIdx && (
              <CardContent className="p-0 animate-in slide-in-from-top-2 duration-300">
                {cat.tips.map((tip, tipIdx) => (
                  <div key={tipIdx} className="p-4 border-t border-border/30 hover:bg-muted/30 transition-colors">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 size={16} className="text-primary shrink-0 mt-0.5" />
                      <div>
                        <p className="font-bold text-foreground text-sm mb-1">{tip.title}</p>
                        <p className="text-muted-foreground text-xs leading-relaxed whitespace-pre-line">{tip.content}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            )}
          </Card>
        ))}

        {/* Motivational footer */}
        <div className="bg-gradient-to-r from-primary/10 to-accent/10 rounded-2xl p-6 text-center border-2 border-primary/20 mt-8">
          <p className="text-4xl mb-2">🎓</p>
          <p className="font-black text-foreground text-lg">¡Tú puedes lograrlo!</p>
          <p className="text-muted-foreground text-xs mt-1">Cada pregunta que practicas te acerca más a tu título de bachiller.</p>
        </div>
      </div>
    </div>
  );
};

export default ExamTechniques;
