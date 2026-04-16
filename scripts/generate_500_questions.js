import fs from 'fs';
const DEEPSEEK_API_KEY = "sk-5ed389e5dfe84caaa1e49063b66e85d0";
const SUBJECTS = ["lectura-critica", "matematicas", "sociales", "ciencias", "ingles"];
const DIFFICULTIES = ["facil", "medio", "dificil"];

async function generateOne(subject, difficulty, id) {
  let prompt = `Actúa como experto ICFES de Colombia (ICFES Saber 11). Genera 1 pregunta REAL de nivel académico de 10° o 11° grado para ${subject} (${difficulty}). 
  IMPORTANTE: No te quedes en lo básico. 
  - Si es MATEMÁTICAS: Incluye Trigonometría, Funciones, Estadística compleja o Cálculo básico.
  - Si es CIENCIAS: Incluye Física Dinámica, Química Orgánica o Estequiometría.
  - Si es LECTURA CRÍTICA: Usa textos filosóficos o literarios profundos.
  
  JSON: {id:"${id}", subject:"${subject}", topic, text, options:[{label,text}], correctAnswer, explanation, difficulty:"${difficulty}", tip}. SOLO JSON.`;
  
  if (subject === 'lectura-critica' && (difficulty === 'medio' || difficulty === 'dificil')) {
    prompt += " IMPORTANTE: Incluye un TEXTO LARGO (pasaje) de al menos 3 o 4 párrafos.";
  }
  
  if (subject === 'matematicas' || subject === 'ciencias') {
    prompt += " IMPORTANTE: Usa SIEMPRE formato LaTeX entre símbolos de $ para fórmulas, ecuaciones o elementos químicos (ej: $x^2 + 5 = 0$, $H_2O$, $\\frac{1}{2}$).";
  }

  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
      body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }] })
    });
    const data = await res.json();
    let text = data.choices[0].message.content.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(text);
  } catch (e) { return null; }
}

async function main() {
  const outputFile = 'src/data/massive_questions.json';
  let all = [];
  if (fs.existsSync(outputFile)) {
    try { all = JSON.parse(fs.readFileSync(outputFile)); } catch(e) {}
  }
  
  console.log("Generando preguntas con soporte LaTeX y lecturas largas...");
  for (let i = 0; i < 500; i++) {
    const s = SUBJECTS[i % SUBJECTS.length];
    const d = DIFFICULTIES[Math.floor(i / (500/3)) % DIFFICULTIES.length];
    const q = await generateOne(s, d, `gen-v2-${Date.now()}-${i}`);
    if (q) {
      all.push(q);
      fs.writeFileSync(outputFile, JSON.stringify(all, null, 2));
      console.log(`[${all.length}] Pregunta ${s} generada.`);
    }
    await new Promise(r => setTimeout(r, 1000));
  }
}
main();
