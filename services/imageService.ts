import { ai } from './geminiClient';
import { Modality } from "@google/genai";
import type { GenerationEvent } from '../types';

export const imageService = {
  generateImage: async (prompt: string, params: GenerationEvent['parameters']): Promise<string[] | null> => {
    try {
      const { model, numberOfImages, aspectRatio, outputMimeType } = params;
      
      const config: any = {
          numberOfImages,
          aspectRatio,
          outputMimeType: outputMimeType || 'image/png',
      };

      const response = await ai.models.generateImages({
        model,
        prompt,
        config,
      });

      const mimeType = outputMimeType || 'image/png';
      if (response.generatedImages && response.generatedImages.length > 0) {
        return response.generatedImages.map(img => `data:${mimeType};base64,${img.image.imageBytes}`);
      }
      return null;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  },

  analyzeImage: async (base64Image: string, mimeType: string, prompt: string): Promise<string> => {
    try {
      const imagePart = {
        inlineData: {
          mimeType,
          data: base64Image,
        },
      };
      const textPart = {
        text: prompt,
      };
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, textPart] },
      });
      return response.text;
    } catch (error) {
      console.error("Error analyzing image:", error);
      return "Sorry, I couldn't analyze the image.";
    }
  },

  editImage: async (base64Image: string, mimeType: string, prompt: string): Promise<string | null> => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Image,
                mimeType,
              },
            },
            {
              text: prompt,
            },
          ],
        },
        config: {
          responseModalities: [Modality.IMAGE],
        },
      });

      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          const base64ImageBytes: string = part.inlineData.data;
          return `data:image/png;base64,${base64ImageBytes}`;
        }
      }
      return null;
    } catch (error) {
      console.error("Error editing image:", error);
      return null;
    }
  },
};
