import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env in the project root
dotenv.config({ path: path.resolve(__dirname, '../.env') });

export interface ChatMessage {
  sender: 'stranger' | 'me';
  text: string;
}

export interface GeneratedStoryScript {
  hookText: string;
  chatMessages: ChatMessage[];
  ctaText: string;
  caption: string;
}

export async function generateHook(): Promise<GeneratedStoryScript> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not defined in the environment variables. Please add it to your .env file.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  const prompt = `
You are a viral Gen-Z social media strategist and comedy writer creating short-form Reels & TikToks for "Whispr" (@whispr.bot) — a Telegram-based anonymous blind chat bot popular among college students (specifically college campuses like KIIT University in Bhubaneswar).

Generate a complete, high-retention viral video script containing:
1. hookText: A 8-12 word high-dopamine, relatable, or unhinged meme hook about anonymous chatting at 3 AM. (e.g., "When you match with an anonymous stranger at 3 AM and the tea is WAY too specific...", "That moment you realize you're blind chatting with someone in the same lecture hall...")
2. chatMessages: Exactly 3 or 4 fast-paced, realistic, hilarious text messages exchanged between "stranger" and "me" on Telegram.
   - Message 1 (stranger): Short relatable conversation opener (e.g., "are you in campus 6 hostel too? 😭")
   - Message 2 (me): Quick reaction (e.g., "yeah lmao how did you guess")
   - Message 3 (stranger): The hilarious plot twist / shocker (e.g., "bro your room lights are literally on right across my window 💀")
   - Message 4 (me): Shocked punchline reaction (e.g., "WAIT NO WAY turn around rn 😭")
3. ctaText: A punchy 4-7 word CTA (e.g., "Find your anonymous match on @whispr.bot 🤫")
4. caption: An Instagram Reel caption containing the hook, a relatable question to boost comments, and hashtags (#bhubaneswar #kiit #whisprbot #blindchat #college #collegelife #relatable #shitpost).

Return ONLY valid JSON matching this schema:
{
  "hookText": "string",
  "chatMessages": [
    { "sender": "stranger", "text": "string" },
    { "sender": "me", "text": "string" },
    { "sender": "stranger", "text": "string" },
    { "sender": "me", "text": "string" }
  ],
  "ctaText": "string",
  "caption": "string"
}
`;

  const payload = {
    contents: [
      {
        parts: [
          {
            text: prompt,
          },
        ],
      },
    ],
    generationConfig: {
      response_mime_type: 'application/json',
      response_schema: {
        type: 'object',
        properties: {
          hookText: { type: 'string' },
          chatMessages: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                sender: { type: 'string', enum: ['stranger', 'me'] },
                text: { type: 'string' },
              },
              required: ['sender', 'text'],
            },
          },
          ctaText: { type: 'string' },
          caption: { type: 'string' },
        },
        required: ['hookText', 'chatMessages', 'ctaText', 'caption'],
      },
    },
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini API call failed with status ${response.status}: ${errorText}`);
  }

  const result = (await response.json()) as any;
  const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error('Invalid response structure from Gemini API: ' + JSON.stringify(result));
  }

  return JSON.parse(text) as GeneratedStoryScript;
}

// Fallback generator when API is down or testing locally
export function getFallbackStoryScript(): GeneratedStoryScript {
  return {
    hookText: "When you match anonymously on @whispr.bot at 3 AM and the tea gets WAY too real...",
    chatMessages: [
      { sender: 'stranger', text: 'wait are you in campus 6 hostel right now? 😭' },
      { sender: 'me', text: 'yeah lmao how did you know' },
      { sender: 'stranger', text: 'bro your room lights are on right across from my window 💀' },
      { sender: 'me', text: 'WAIT NO WAY wave right now 😭💀' },
    ],
    ctaText: "Find your anonymous match on @whispr.bot 🤫",
    caption: "Bro was literally right across the courtyard 😭💀 Tag a friend who needs to try this! Link in bio to find your anonymous match on @whispr.bot on Telegram 🚀\n\n#kiit #bhubaneswar #whisprbot #blindchat #college #collegelife #relatable #viral #explore",
  };
}

// Support running directly from command line
if (require.main === module) {
  console.log('Generating viral story script from Gemini API...');
  generateHook()
    .then((data) => {
      console.log('\n--- Generation Success ---');
      console.log(JSON.stringify(data, null, 2));
    })
    .catch((err) => {
      console.error('\n--- Generation Error ---');
      console.error(err.message || err);
      console.log('\nUsing fallback script instead:');
      console.log(JSON.stringify(getFallbackStoryScript(), null, 2));
    });
}
