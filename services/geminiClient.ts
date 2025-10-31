import { GoogleGenAI } from "@google/genai";

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable is not set");
}

export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
