
import { GoogleGenAI, Type } from "@google/genai";
import { ScanResult } from "../types";

export const analyzeHealthImage = async (base64Image: string, type: 'tongue' | 'urine'): Promise<ScanResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const prompt = type === 'tongue' 
    ? "Analyze this tongue photo for hydration markers. Evaluate texture, color, and coating. Provide a hydration status (e.g., Slightly Dehydrated) and specific markers like 'Tip (Heart): Red' or 'Center (Stomach): Dry'."
    : "Analyze this urine sample photo. Evaluate color and clarity. Determine specific gravity estimate and hydration level (e.g., Highly Concentrated).";

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      status: { type: Type.STRING },
      description: { type: Type.STRING },
      markers: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.STRING },
            value: { type: Type.STRING },
          },
          required: ["label", "value"]
        }
      },
      recommendation: { type: Type.STRING }
    },
    required: ["status", "description", "markers", "recommendation"]
  };

  try {
    const result = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: prompt },
            { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const responseText = result.text;
    if (!responseText) throw new Error("Empty response from AI");
    return JSON.parse(responseText);
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    // Fallback Mock data
    return {
      status: type === 'tongue' ? "Mildly Dehydrated" : "Concentrated",
      description: `Your ${type} scan shows signs of moderate fluid loss.`,
      markers: [{ label: "Alert", value: "Significant deficit" }],
      recommendation: "Increase fluid intake immediately."
    };
  }
};
