import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ProductReport, SearchParams, AspectRatio } from "./types";

// Helper for raw audio decoding
async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export const generateProductReport = async (params: SearchParams): Promise<ProductReport & { sources?: any[] }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const { budgetRange = "Not specified", region = "Global", experienceLevel = "Beginner", productName } = params;

  const prompt = `Act as a world-class senior AI product architect and Meta Ads analyst.
  
  TASK: Generate a simple, high-fidelity market strategy and financial report for: "${productName || "trending high-margin products"}".
  
  CONTEXT:
  - Startup Budget: ${budgetRange}
  - Target Region: ${region}

  STRICT DATA REQUIREMENTS:
  1. META ADS FOCUS: Categorize audience interests and provide a specific Lookalike (LAL) strategy.
  2. PRICE PREDICTION: 3 tiers: MVP, Competitive, Premium. Use numbers ONLY. 
  3. ROI %: Estimate profit percentage.
  4. NO REPETITION: Do not repeat sentences or loop text. Keep all text fields under 150 characters.

  You MUST return ONLY a valid JSON object.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overview: {
            type: Type.OBJECT,
            properties: {
              explanation: { type: Type.STRING, description: "Max 150 chars" },
              useCases: { type: Type.ARRAY, items: { type: Type.STRING } },
              buyerTypes: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ["explanation", "useCases", "buyerTypes"]
          },
          trends: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING },
              chartData: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { month: { type: Type.STRING }, interest: { type: Type.NUMBER } }
                }
              }
            },
            required: ["status", "chartData"]
          },
          pricing: {
            type: Type.OBJECT,
            properties: {
              mvp: { type: Type.NUMBER },
              mvpROI: { type: Type.STRING },
              mvpValueNote: { type: Type.STRING },
              competitive: { type: Type.NUMBER },
              competitiveROI: { type: Type.STRING },
              competitiveValueNote: { type: Type.STRING },
              premium: { type: Type.NUMBER },
              premiumROI: { type: Type.STRING },
              premiumValueNote: { type: Type.STRING },
              notes: { type: Type.STRING }
            },
            required: ["mvp", "competitive", "premium", "mvpValueNote", "competitiveValueNote", "premiumValueNote"]
          },
          metaAds: {
            type: Type.OBJECT,
            properties: {
              bestTime: {
                type: Type.OBJECT,
                properties: {
                  peakTime: { type: Type.STRING },
                  days: { type: Type.ARRAY, items: { type: Type.STRING } },
                  reasoning: { type: Type.STRING }
                },
                required: ["peakTime", "days", "reasoning"]
              },
              targeting: {
                type: Type.OBJECT,
                properties: {
                  specificAudienceInterests: { type: Type.ARRAY, items: { type: Type.STRING } },
                  lookalikeStrategy: { type: Type.STRING }
                },
                required: ["specificAudienceInterests", "lookalikeStrategy"]
              },
              budgetTips: { type: Type.STRING }
            },
            required: ["bestTime", "targeting"]
          },
          seoListing: {
            type: Type.OBJECT,
            properties: {
              titles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { type: { type: Type.STRING }, content: { type: Type.STRING } },
                  required: ["type", "content"]
                }
              },
              metaDescriptions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: { type: { type: Type.STRING }, content: { type: Type.STRING } },
                  required: ["type", "content"]
                }
              }
            },
            required: ["titles", "metaDescriptions"]
          },
          scalingStrategy: {
            type: Type.OBJECT,
            properties: {
              reinvestmentTriggers: { type: Type.STRING },
              lineExpansionIdeas: { type: Type.ARRAY, items: { type: Type.STRING } },
              brandBuildingStrategy: { type: Type.STRING },
              actionableAdvice: { type: Type.STRING }
            },
            required: ["reinvestmentTriggers", "lineExpansionIdeas", "brandBuildingStrategy", "actionableAdvice"]
          },
          verdict: {
            type: Type.OBJECT,
            properties: {
              decision: { type: Type.STRING },
              launchTime: { type: Type.STRING },
              todayAction: { type: Type.STRING },
              successFactors: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["decision", "launchTime", "todayAction", "successFactors"]
          }
        },
        required: ["overview", "trends", "pricing", "metaAds", "seoListing", "scalingStrategy", "verdict"]
      }
    }
  });

  try {
    const rawText = response.text;
    if (!rawText) throw new Error("Empty response from AI engine.");
    const cleanJson = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    const data = JSON.parse(cleanJson);
    return { 
      ...data, 
      sources: response.candidates?.[0]?.groundingMetadata?.groundingChunks || [] 
    };
  } catch (err) {
    console.error("Critical Analysis Error:", err);
    throw new Error("Analysis failed. The AI generated malformed data. Try a different search.");
  }
};

export const chatWithPro = async (message: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: "You are a senior Meta Ads strategist. Provide simple, actionable advertising advice."
    }
  });
  const response = await chat.sendMessage({ message });
  return response.text;
};

export const enhancePrompt = async (userInput: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-flash-lite-latest',
    contents: `Rewrite this image prompt to be professional for a Meta Ad: "${userInput}". Only return the enhanced prompt.`
  });
  return response.text;
};

export const generateImage = async (prompt: string, ratio: AspectRatio) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: prompt }] },
    config: { imageConfig: { aspectRatio: ratio } }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const generateProductAd = async (base64Product: string, userInstruction: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const enhanced = await enhancePrompt(userInstruction);
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { inlineData: { data: base64Product, mimeType: 'image/png' } },
        { text: `Based on this product image, generate a high-quality Meta advertisement image: ${enhanced}` }
      ]
    }
  });
  for (const part of response.candidates[0].content.parts) {
    if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  }
  return null;
};

export const analyzeMedia = async (base64Data: string, mimeType: string, prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts: [{ inlineData: { data: base64Data, mimeType } }, { text: prompt }] }
  });
  return response.text;
};

export const generateTTS = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
    },
  });
  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) return null;
  const ctx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
  const audioBuffer = await decodeAudioData(decodeBase64(base64Audio), ctx, 24000, 1);
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
  return true;
};