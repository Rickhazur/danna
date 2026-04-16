import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.error("VITE_GEMINI_API_KEY is not defined in the environment.");
}

export const genAI = new GoogleGenerativeAI(apiKey || "");

export const getGeminiModel = (modelName: string = "gemini-1.5-flash", systemInstruction?: string) => {
  return genAI.getGenerativeModel({ 
    model: modelName,
    ...(systemInstruction ? { systemInstruction } : {})
  });
};

// DeepSeek Key from environment
const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY || "";

// Helper for simple text generation with fallback
export async function generateText(prompt: string): Promise<string> {
  // 1. Try Gemini
  try {
    const model = getGeminiModel();
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    if (text) return text;
  } catch (error) {
    console.warn("Gemini falló, intentando con DeepSeek...", error);
  }

  // 2. Fallback to DeepSeek
  try {
    const res = await fetch("https://api.deepseek.com/chat/completions", {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}` 
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });
    const data = await res.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("DeepSeek Error:", error);
    return "Lo siento, hubo un problema crítico con todos los sistemas de IA. Por favor, revisa tu conexión.";
  }
}

// Helper to convert base64 to generative part
export function fileToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data.split(',')[1],
      mimeType
    },
  };
}

// Function to handle chat history properly, including optional images
export async function generateChatResponse(messages: {role: "tutor" | "student" | "system", content: string, image?: string}[]) {
  const systemMsg = messages.find(m => m.role === 'system');
  const chatMessages = messages.filter(m => m.role !== 'system');

  const geminiMessages = chatMessages.map(msg => {
    const parts: any[] = [{ text: msg.content }];
    // If the message has an image, append the generative part object
    if (msg.image) {
      parts.push(fileToGenerativePart(msg.image, "image/jpeg")); // default to jpeg for simplicity or extract from dataURL
    }
    return {
      role: msg.role === 'tutor' ? 'model' : 'user',
      parts
    };
  });

  try {
    const model = getGeminiModel("gemini-1.5-flash", systemMsg?.content); 
    
    // Si el último mensaje tiene imagen, el API de chat a veces molesta con el historial si hay imágenes intercaladas.
    // Para simplificar y asegurar compatibilidad multimodal: 
    // Usaremos generateContent pasándole todo el historial como parts en un solo array si es que hay una imagen en la última consulta.
    const lastMessage = geminiMessages[geminiMessages.length - 1];
    let rawHistory = geminiMessages.slice(0, -1);
    
    // Gemini strict history requires:
    // 1. Starts with user
    // 2. strictly alternates user/model without repeats
    // 3. no images in history
    let validHistory: any[] = [];
    
    // Remove images from previous messages
    rawHistory = rawHistory.map(msg => ({
      role: msg.role,
      parts: msg.parts.filter((p: any) => !p.inlineData)
    }));

    // Consolidate consecutive roles to enforce strict alternation
    for (const msg of rawHistory) {
      if (validHistory.length === 0) {
        if (msg.role === 'model') {
          validHistory.push({ role: 'user', parts: [{ text: 'Hola, empecemos.' }] });
        }
        if (msg.parts.length > 0 && msg.parts[0].text) {
           validHistory.push(msg);
        }
      } else {
        const last = validHistory[validHistory.length - 1];
        if (last.role === msg.role) {
           // Merge text parts of sequential identically-roled messages
           if (msg.parts.length > 0 && msg.parts[0].text) {
             last.parts[0].text += '\n\n' + msg.parts[0].text;
           }
        } else {
           if (msg.parts.length > 0 && msg.parts[0].text) {
             validHistory.push(msg);
           }
        }
      }
    }
    
    // Double check last message doesn't break alternation with the actual new message
    if (validHistory.length > 0 && validHistory[validHistory.length - 1].role === lastMessage.role) {
       validHistory.push({ role: lastMessage.role === 'user' ? 'model' : 'user', parts: [{ text: 'Continuemos.' }] });
    }

    const chat = model.startChat({
      history: validHistory,
    });
    
    const result = await chat.sendMessage(lastMessage.parts);
    return result.response.text();
  } catch (error) {
    console.error("Gemini API Crash Detailed Error:", error);
    
    // Deepseek fallback uses standard OpenAI chat format
    try {
      const deepseekMsgs = messages.map(msg => ({
        role: msg.role === 'tutor' ? 'assistant' : msg.role === 'student' ? 'user' : 'system',
        content: msg.content
      }));

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${DEEPSEEK_API_KEY}` 
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: deepseekMsgs,
          temperature: 0.7
        })
      });
      const data = await res.json();
      return data.choices[0].message.content;
    } catch (dsError) {
      console.error("DeepSeek Error:", dsError);
      return "Lo siento, tuve un pequeño problema de conexión al recordar de qué hablábamos. ¿Qué decíamos?";
    }
  }
}
