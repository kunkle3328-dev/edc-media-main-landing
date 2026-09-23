import { GoogleGenAI } from '@google/genai';
import { BusinessProfile, StrategyObject } from '@/types/landing-engine';

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

export async function generateStrategy(profile: BusinessProfile): Promise<StrategyObject> {
  const ai = getGeminiClient();
  if (!ai) {
    throw new Error('AI Intelligence unavailable');
  }

  const prompt = `
You are the Lead Conversion Rate Optimization (CRO) Strategist for EDC Media.
Create a comprehensive conversion strategy for the following business.

BUSINESS PROFILE:
Name: ${profile.name}
Offer: ${profile.offer}
Target Audience: ${profile.targetAudience}
Primary Goal: ${profile.primaryGoal}
Unique Hook: ${profile.uniqueHook || 'N/A'}

Return a valid JSON response (no markdown) mapping to this StrategyObject structure:
{
  "businessName": string,
  "businessType": string,
  "offer": string,
  "targetAudience": string,
  "customerProblem": string,
  "desiredOutcome": string,
  "primaryGoal": string,
  "primaryCTA": { "label": string, "subtext": string, "actionType": string, "phoneOrLink": string },
  "secondaryCTA": { "label": string, "actionType": string },
  "valueProposition": string,
  "positioning": string,
  "urgency": string,
  "trustRequirements": string[],
  "objectionHandling": [ { "objection": string, "counter": string } ],
  "recommendedSections": string[],
  "recommendedTone": string,
  "recommendedVisualDirection": string,
  "recommendedSEOKeywords": string[],
  "conversionRisks": string[],
  "missingInformation": string[]
}
`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      temperature: 0.3,
    },
  });

  const text = response.text?.trim();
  if (!text) throw new Error('Failed to generate strategy');
  return JSON.parse(text);
}
