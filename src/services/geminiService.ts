import { GoogleGenAI, Type } from "@google/genai";
import { AIResponse, Vehicle } from "../types";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

// Using Flash for speed as this is an interactive search feature
const MODEL_NAME = "gemini-3-flash-preview";

export const analyzeSearchQuery = async (
  userQuery: string,
  userVehicle: Vehicle | null
): Promise<AIResponse> => {
  try {
    // Check if AI is available
    if (!ai) {
      throw new Error("Gemini API key not configured");
    }

    const vehicleContext = userVehicle
      ? `O veículo do usuário é um ${userVehicle.make} ${userVehicle.model} ano ${userVehicle.year}.`
      : "O usuário não especificou um veículo no perfil.";

    const prompt = `
      Você é um especialista em peças automotivas.
      ${vehicleContext}
      
      O usuário buscou: "${userQuery}".

      Sua tarefa:
      1. Identificar qual tipo de peça o usuário provavelmente precisa com base na descrição do problema ou nome da peça.
      2. Explicar brevemente o motivo (ex: se ele disse "barulho ao frear", sugira "Pastilha de Freio").
      3. Gerar palavras-chave para filtrar um banco de dados de produtos.
      
      Retorne APENAS um JSON.
    `;

    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            suggestedPartType: { type: Type.STRING },
            reasoning: { type: Type.STRING },
            keywords: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("Sem resposta da IA");

    return JSON.parse(text) as AIResponse;

  } catch (error) {
    console.error("Gemini Search Error:", error);
    // Fallback if AI fails or key is missing
    return {
      suggestedPartType: "Busca Genérica",
      reasoning: "Não foi possível conectar à IA. Mostrando resultados por termo.",
      keywords: userQuery.split(" ")
    };
  }
};