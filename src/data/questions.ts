export interface Question {
  id: string;
  subject: string;
  topic: string;
  text: string;
  options: { label: string; text: string }[];
  correctAnswer: string;
  explanation: string;
  difficulty: "facil" | "medio" | "dificil";
}

export const subjects = [
  {
    id: "lectura-critica",
    name: "Lectura Crítica",
    icon: "📖",
    color: "hsl(168, 60%, 40%)",
    description: "Comprensión e interpretación de textos",
    topics: ["Comprensión literal", "Comprensión inferencial", "Comprensión crítica"],
  },
  {
    id: "matematicas",
    name: "Matemáticas",
    icon: "🔢",
    color: "hsl(210, 70%, 55%)",
    description: "Razonamiento cuantitativo y resolución de problemas",
    topics: ["Álgebra", "Geometría", "Estadística", "Aritmética"],
  },
  {
    id: "sociales",
    name: "Sociales y Ciudadanas",
    icon: "🌎",
    color: "hsl(35, 90%, 55%)",
    description: "Competencias ciudadanas y ciencias sociales",
    topics: ["Historia de Colombia", "Geografía", "Constitución política", "Economía básica"],
  },
  {
    id: "ciencias",
    name: "Ciencias Naturales",
    icon: "🔬",
    color: "hsl(145, 60%, 42%)",
    description: "Biología, química y física básica",
    topics: ["Biología", "Química", "Física", "Medio ambiente"],
  },
  {
    id: "ingles",
    name: "Inglés",
    icon: "🇬🇧",
    color: "hsl(280, 55%, 55%)",
    description: "Comprensión de lectura en inglés",
    topics: ["Vocabulario", "Gramática", "Reading comprehension"],
  },
];

export const sampleQuestions: Question[] = [
  // Lectura Crítica
  {
    id: "lc-1",
    subject: "lectura-critica",
    topic: "Comprensión literal",
    text: "Lee el siguiente texto:\n\n\"La biodiversidad en Colombia es una de las más ricas del mundo. El país alberga cerca del 10% de las especies del planeta, a pesar de ocupar menos del 1% de la superficie terrestre. Esta riqueza se debe a su variedad de ecosistemas, que incluyen selvas tropicales, páramos, manglares y arrecifes de coral.\"\n\n¿Cuál es la idea principal del texto?",
    options: [
      { label: "A", text: "Colombia ocupa el 1% de la superficie terrestre" },
      { label: "B", text: "Colombia tiene una biodiversidad excepcionalmente rica gracias a sus diversos ecosistemas" },
      { label: "C", text: "Los páramos son el ecosistema más importante de Colombia" },
      { label: "D", text: "El 10% de las especies viven en las selvas tropicales colombianas" },
    ],
    correctAnswer: "B",
    explanation: "La idea principal resume el mensaje central del texto: Colombia posee una gran biodiversidad gracias a la variedad de ecosistemas. Las otras opciones son detalles secundarios o interpretaciones incorrectas del texto.",
    difficulty: "facil",
  },
  {
    id: "lc-2",
    subject: "lectura-critica",
    topic: "Comprensión inferencial",
    text: "\"Marta llegó a casa empapada, dejó el paraguas roto en la entrada y suspiró mientras miraba por la ventana el cielo gris que no parecía querer aclararse.\"\n\n¿Qué se puede inferir de esta situación?",
    options: [
      { label: "A", text: "Marta olvidó comprar un paraguas nuevo" },
      { label: "B", text: "Fue sorprendida por una fuerte lluvia que dañó su paraguas" },
      { label: "C", text: "Marta disfruta caminar bajo la lluvia" },
      { label: "D", text: "El cielo gris indica que es de noche" },
    ],
    correctAnswer: "B",
    explanation: "Podemos inferir que llovió fuerte porque: 1) Marta está empapada, 2) su paraguas está roto (por el viento/lluvia), y 3) el cielo sigue gris. Inferir es deducir información que no está dicha explícitamente pero se puede concluir de las pistas del texto.",
    difficulty: "medio",
  },
  // Matemáticas
  {
    id: "mat-1",
    subject: "matematicas",
    topic: "Aritmética",
    text: "María tiene un presupuesto de $150.000 para comprar útiles escolares. Gasta $45.000 en cuadernos, $32.500 en lápices y colores, y $28.000 en un morral. ¿Cuánto dinero le queda?",
    options: [
      { label: "A", text: "$44.500" },
      { label: "B", text: "$54.500" },
      { label: "C", text: "$45.500" },
      { label: "D", text: "$34.500" },
    ],
    correctAnswer: "A",
    explanation: "Sumamos los gastos: $45.000 + $32.500 + $28.000 = $105.500. Luego restamos del presupuesto: $150.000 - $105.500 = $44.500. Tip: En el ICFES, lee bien los números y haz las operaciones paso a paso.",
    difficulty: "facil",
  },
  {
    id: "mat-2",
    subject: "matematicas",
    topic: "Álgebra",
    text: "Si el doble de un número aumentado en 5 es igual a 21, ¿cuál es el número?",
    options: [
      { label: "A", text: "13" },
      { label: "B", text: "8" },
      { label: "C", text: "10" },
      { label: "D", text: "6" },
    ],
    correctAnswer: "B",
    explanation: "Traducimos a ecuación: 2x + 5 = 21. Restamos 5: 2x = 16. Dividimos entre 2: x = 8. Tip: Convierte los problemas de palabras a ecuaciones identificando la operación clave.",
    difficulty: "medio",
  },
  // Sociales
  {
    id: "soc-1",
    subject: "sociales",
    topic: "Constitución política",
    text: "Según la Constitución Política de Colombia de 1991, ¿cuál es el mecanismo por el cual los ciudadanos pueden revocar el mandato de un alcalde o gobernador?",
    options: [
      { label: "A", text: "Tutela" },
      { label: "B", text: "Referendo" },
      { label: "C", text: "Revocatoria del mandato" },
      { label: "D", text: "Plebiscito" },
    ],
    correctAnswer: "C",
    explanation: "La revocatoria del mandato es el mecanismo de participación ciudadana que permite a los votantes destituir a un funcionario elegido (alcalde o gobernador) antes de que termine su periodo, si consideran que no cumplió su programa de gobierno.",
    difficulty: "medio",
  },
  // Ciencias Naturales
  {
    id: "cin-1",
    subject: "ciencias",
    topic: "Biología",
    text: "¿Cuál es la función principal de las mitocondrias en la célula?",
    options: [
      { label: "A", text: "Almacenar información genética" },
      { label: "B", text: "Producir energía (ATP) para la célula" },
      { label: "C", text: "Realizar la fotosíntesis" },
      { label: "D", text: "Sintetizar proteínas" },
    ],
    correctAnswer: "B",
    explanation: "Las mitocondrias son las 'centrales energéticas' de la célula. Producen ATP (adenosín trifosfato) mediante la respiración celular, que es la energía que usa la célula para funcionar. El ADN se almacena en el núcleo, la fotosíntesis ocurre en cloroplastos, y las proteínas se sintetizan en los ribosomas.",
    difficulty: "facil",
  },
  // Inglés
  {
    id: "ing-1",
    subject: "ingles",
    topic: "Reading comprehension",
    text: "Read the following text:\n\n\"Maria wakes up at 6:00 AM every day. She takes a shower, has breakfast with her baby, and then studies for two hours. In the afternoon, she goes to the park with her son.\"\n\nWhat does Maria do after breakfast?",
    options: [
      { label: "A", text: "She goes to the park" },
      { label: "B", text: "She takes a shower" },
      { label: "C", text: "She studies for two hours" },
      { label: "D", text: "She sleeps" },
    ],
    correctAnswer: "C",
    explanation: "El texto dice que después del desayuno (breakfast), ella estudia por dos horas. Tip para inglés: busca las palabras clave de tiempo como 'after', 'before', 'then' para entender el orden de los eventos.",
    difficulty: "facil",
  },
  {
    id: "mat-3",
    subject: "matematicas",
    topic: "Estadística",
    text: "En una encuesta, se preguntó a 40 estudiantes cuál es su fruta favorita. Los resultados fueron: Manzana (12), Banano (8), Naranja (10), Fresa (10). ¿Qué porcentaje de estudiantes prefiere la naranja?",
    options: [
      { label: "A", text: "20%" },
      { label: "B", text: "25%" },
      { label: "C", text: "30%" },
      { label: "D", text: "10%" },
    ],
    correctAnswer: "B",
    explanation: "Para calcular el porcentaje: (cantidad que prefiere naranja / total) × 100 = (10/40) × 100 = 25%. Tip: Los porcentajes son muy comunes en el ICFES, practica dividir y multiplicar por 100.",
    difficulty: "facil",
  },
];
