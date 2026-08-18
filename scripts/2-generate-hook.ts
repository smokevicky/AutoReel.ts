/**
 * Module 2: The LLM Brain & Vault Mapper (scripts/2-generate-hook.ts)
 * 
 * Culture-Jacking & Trojan Horse Logic:
 * Ingests the daily Reddit cultural pulse and maps it to the 2-part contrast meme
 * structure matching @whispr.bot's top-performing Instagram Reels:
 * 1. Top Setup Text (e.g. "Her: 'why is he taking so long to reply?'" or "POV: You're at KIIT...")
 * 2. Transition Text (e.g. "Meanwhile me on @whispr.bot:")
 * 3. Signature White Pill Text (e.g. "me after accidentally skipping my soulmate on whispr 😭")
 */

import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface VaultClip {
  id: string;
  vibe: string;
  description: string;
  topSetupText: string;
  transitionText: string;
  pillText: string;
  videoUrl?: string;
  durationInFrames?: number;
}

export interface GeneratedMemePayload {
  videoId: string;
  topSetupText: string;
  transitionText: string;
  pillText: string;
  hookText: string;
  caption: string;
  detectedVibe?: string;
}

/**
 * Loads the local meme vault
 */
export function loadMemeVault(): VaultClip[] {
  const vaultPath = path.resolve(__dirname, '../vault.json');
  if (!fs.existsSync(vaultPath)) {
    throw new Error('vault.json was not found in the root directory.');
  }
  return JSON.parse(fs.readFileSync(vaultPath, 'utf8')) as VaultClip[];
}

/**
 * Calls Gemini using @google/generative-ai SDK to match trend with meme vault
 */
export async function generateHookAndMapVault(pulseText: string): Promise<GeneratedMemePayload> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in .env');
  }

  const vault = loadMemeVault();
  const genAI = new GoogleGenerativeAI(apiKey);

  const model = genAI.getGenerativeModel({
    model: 'gemini-2.5-flash',
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: SchemaType.OBJECT,
        properties: {
          videoId: {
            type: SchemaType.STRING,
            description: 'The exact ID of the chosen clip from the provided meme vault.',
          },
          topSetupText: {
            type: SchemaType.STRING,
            description: 'The initial setup text (e.g. "Her: \'why is he taking so long to reply?\'" or "Her: You need a car and Patia cafe dates 💸").',
          },
          transitionText: {
            type: SchemaType.STRING,
            description: 'The transition punchline (e.g. "Meanwhile me on @whispr.bot at 3 AM:").',
          },
          pillText: {
            type: SchemaType.STRING,
            description: 'The text for the signature white pill badge overlaid on the video (e.g. "me after accidentally skipping my soulmate on whispr 😭").',
          },
          hookText: {
            type: SchemaType.STRING,
            description: 'Short summary hook for backup.',
          },
          caption: {
            type: SchemaType.STRING,
            description: 'Instagram Reel caption with call to action and relevant hashtags (#kiit #bhubaneswar #whisprbot #relatable #dating).',
          },
          detectedVibe: {
            type: SchemaType.STRING,
            description: 'The core emotional vibe identified in today trends.',
          },
        },
        required: ['videoId', 'topSetupText', 'transitionText', 'pillText', 'hookText', 'caption'],
      },
    },
  });

  const prompt = `
You are the lead meme architect and growth engineer for "Whispr" (@whispr.bot) — an anonymous, text-only Telegram chat bot for 3 AM deep talks, popular with college students in Bhubaneswar / KIIT University.

YOUR GOAL:
Generate a high-converting, viral 2-part contrast Reel in the exact signature style of @whispr.bot's top posts:
- Part 1: Top Setup (e.g. "Her: why is he taking so long to reply?" OR "POV: You matched with someone from your exact college at 3 AM" OR "Her: You need a Fortuner and expensive dates in Patia 💸")
- Part 2: Transition (e.g. "Meanwhile me on @whispr.bot at 3 AM:")
- Part 3: Video Pill Badge (e.g. "me after accidentally skipping my soulmate on whispr 😭" OR "The whispr effect 🐻" OR "matching with a 10/10 freak from campus 6 💀")

INPUT 1 - TODAY'S CULTURAL PULSE (TOP TRENDS):
${pulseText}

INPUT 2 - AVAILABLE MEME VAULT CLIPS:
${JSON.stringify(vault, null, 2)}

TASK:
1. Identify the core emotion of today's trends (e.g. overthinking, accidental mistakes, high dating standards vs raw chat).
2. Select the single best matching "videoId" from the vault.
3. Write punchy, unhinged, viral Gen-Z copy for "topSetupText", "transitionText", and "pillText".
4. Write a relatable Instagram caption with hashtags (#bhubaneswar #kiit #whisprbot #blindchat #dating).

Output valid JSON matching the schema.
`;

  console.log('[Module 2] Calling Gemini LLM Brain with @google/generative-ai SDK...');
  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  if (!responseText) {
    throw new Error('Empty response received from Gemini API');
  }

  const parsed = JSON.parse(responseText) as GeneratedMemePayload;

  const validClip = vault.find((c) => c.id === parsed.videoId);
  if (!validClip) {
    parsed.videoId = vault[0].id;
  }

  return parsed;
}

// Fallback script
export function getFallbackMemePayload(): GeneratedMemePayload {
  return {
    videoId: 'accidental-skip-soulmate',
    topSetupText: 'Her: "why is he taking so long to reply?"',
    transitionText: 'Meanwhile me:',
    pillText: 'me after accidentally skipping my soulmate on whispr 😭',
    hookText: 'me after accidentally skipping my soulmate on whispr 😭',
    caption: '10/10 vibe gone forever because my thumb slipped 😭 find your next one (link in bio) 👉 @whispr.bot\n\n#bhubaneswar #kiit #whisprbot #blindchat #dating #relatable #shitpost',
    detectedVibe: 'accidental mistake & existential regret',
  };
}

// Standalone test
if (require.main === module) {
  const dummyPulse = `1. [r/me_irl] "me at 3 AM contemplating every life decision"
2. [r/IndianTeenagers] "Accidentally saw my ex in Patia cafe and made eye contact"`;

  generateHookAndMapVault(dummyPulse)
    .then((output) => {
      console.log('\n=== GENERATED 2-PART MEME PAYLOAD ===');
      console.log(JSON.stringify(output, null, 2));
    })
    .catch((err) => {
      console.error('Error in Module 2:', err);
    });
}
