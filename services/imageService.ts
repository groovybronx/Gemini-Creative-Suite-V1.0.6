import { ai } from './geminiClient';
import { Modality, type UsageMetadata } from "@google/genai";
import type { GenerationEvent } from '../types';

/**
 * @fileoverview This service handles all interactions with Google's image generation and analysis models.
 * It provides a clean interface for generating new images, analyzing existing ones, and performing edits based on prompts.
 */

/**
 * Service object for handling image-related AI operations.
 */
export const imageService = {
  /**
   * Generates images using the Imagen model based on a text prompt and specified parameters.
   * @param {string} prompt The text prompt to generate the image from.
   * @param {GenerationEvent['parameters']} params An object containing generation parameters like model, aspect ratio, etc.
   * @returns {Promise<{ images: string[] } | null>} A promise that resolves to an object containing an array of base64 encoded image data URLs, or null if an error occurs.
   */
  generateImage: async (prompt: string, params: GenerationEvent['parameters']): Promise<{ images: string[] } | null> => {
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
        // Fix: The `generateImages` response does not contain `usageMetadata`.
        return {
            images: response.generatedImages.map(img => `data:${mimeType};base64,${img.image.imageBytes}`),
        };
      }
      return null;
    } catch (error) {
      console.error("Error generating image:", error);
      return null;
    }
  },

  /**
   * Analyzes an image with a text prompt using the Gemini model.
   * @param {string} base64Image The base64 encoded string of the image to analyze.
   * @param {string} mimeType The MIME type of the image (e.g., 'image/jpeg').
   * @param {string} prompt The text prompt to guide the analysis (e.g., "Describe this image").
   * @returns {Promise<{ text: string, usageMetadata?: UsageMetadata } | null>} A promise that resolves to the text-based analysis and usage metadata from the model, or null on error.
   */
  analyzeImage: async (base64Image: string, mimeType: string, prompt: string): Promise<{ text: string, usageMetadata?: UsageMetadata } | null> => {
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
      return { text: response.text, usageMetadata: response.usageMetadata };
    } catch (error) {
      console.error("Error analyzing image:", error);
      return null;
    }
  },

  /**
   * Edits an image based on a text prompt using the Gemini image model.
   * @param {string} base64Image The base64 encoded string of the image to edit.
   * @param {string} mimeType The MIME type of the source image.
   * @param {string} prompt The text prompt describing the desired edit.
   * @returns {Promise<{ imageUrl: string, usageMetadata?: UsageMetadata } | null>} A promise that resolves to a base64 data URL of the edited image and usage metadata, or null on failure.
   */
  editImage: async (base64Image: string, mimeType: string, prompt: string): Promise<{ imageUrl: string, usageMetadata?: UsageMetadata } | null> => {
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
          return {
            imageUrl: `data:image/png;base64,${base64ImageBytes}`,
            usageMetadata: response.usageMetadata,
          };
        }
      }
      return null;
    } catch (error) {
      console.error("Error editing image:", error);
      return null;
    }
  },
};