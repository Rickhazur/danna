import fs from 'fs';
const DEEPSEEK_API_KEY = "sk-5ed389e5dfe84caaa1e49063b66e85d0";

async function main() {
  const prompt = "Genera 1 pregunta de matemáticas nivel ICFES en JSON {id, subject, topic, text, options: [{label, text}], correctAnswer, explanation, difficulty, tip}. Solo JSON.";
  const res = await fetch("https://api.deepseek.com/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${DEEPSEEK_API_KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "user", content: prompt }] })
  });
  const data = await res.json();
  console.log(data.choices[0].message.content);
}
main();
