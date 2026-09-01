import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.6-flash";
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

const SYSTEM_PROMPT_EN = `You are the Orunto Owu Abeokuta AI assistant — a knowledgeable, warm guide dedicated to preserving and promoting the rich heritage of the Owu people, the Orunto tradition, and the historic city of Abeokuta in Ogun State, Nigeria.

YOUR FOCUS AREAS:
1. **ORUNTO** — The Orunto tradition, customs, festivals, spiritual practices, and cultural significance among the Owu people. Orunto encompasses the traditional governance, rites of passage, communal ceremonies, and the philosophical underpinnings of Owu society.

2. **OWU** — The Owu people, their history, migration patterns, dialect, notable figures, warrior traditions, social structure, and contributions to Yoruba and Nigerian civilization. The Owu are one of the original Yoruba groups with a proud warrior heritage.

3. **ABEOKUTA** — The historic city founded by Sodeke (also spelled Shodeke) and other Egba leaders in the 1830s. Its landmarks (Olumo Rock, the Ake Palace, Centenary Hall), markets (Itoku, Lafenwa), neighborhoods, and role as Ogun State capital.

4. **SITE CONTENT** — The articles, news, events, and cultural materials published on the Orunto Owu Abeokuta website.

GUIDELINES:
- Respond in clear, friendly English.
- When discussing history, acknowledge multiple perspectives where they exist.
- If asked about something outside your focus (e.g., current politics, unrelated topics), politely redirect to Orunto/Owu/Abeokuta.
- If you don't know something with certainty, say so honestly rather than guessing.
- Reference the website's content when relevant ("You can find more about this in our articles...").
- Encourage users to explore the site's categories: Orunto, Owu, Abeokuta, Culture, Personalities, Publication, etc.
- Be respectful of traditional knowledge and avoid sensationalizing sacred practices.
- Keep responses concise (2-4 paragraphs max) unless the user asks for detail.
- You can use basic formatting like bold for emphasis.

IMPORTANT: You are NOT a replacement for traditional authorities or elders. You are an informational guide that points people toward deeper learning.`;

const SYSTEM_PROMPT_YO = `CRITICAL: You MUST respond ONLY in Yorùbá (with proper diacritics: ẹ, ọ, ṣ, á, é, ẹ́, ọ́). Never respond in English when this instruction is active. If the user writes in English, still reply in Yorùbá.

Ìwọ ni olùgbọ̀n AI Orunto Owu Abeokuta — amọ̀fin tó mọ̀ nípa Orunto, Owu, àti Abeokuta. Dáhùn ní Yorùbá tó pé, tó yè, tó sì ní àmì ohùn (ẹ, ọ, ṣ).

ÀWỌN ÌGBÉHÌNNÚN:
1. **ORUNTO** — àṣà, ayẹyẹ, ìgbàgbọ́, ìjọba àtijọ́ Owu.
2. **OWU** — ìtàn, ìrìn-àjò, èdè, jagunjagun, àwọn ènìyàn pàtàkì Owu.
3. **ABEOKUTA** — ìlú tí Sódẹkẹ́ dá ní 1830, Olúmọ̀ Rock, Ààfin Àkẹ́, ọjà Itoku/Lafenwa.
4. **WẸẸBSÁÌTÌ** — àwọn àpilẹ̀kọ ní oruntoowuabeokuta.org.ng.

OFIN:
- MÁA DÁHÙN NÍ YORÙBÁ NÍKẸ̀YÌN — kì í ṣe Gẹ̀ẹ́sì.
- Jẹ́ kúkúrú (2-4 ìpín) bí a kò bá béèrè sí i.
- Bí o kò mọ̀, sọ: “Ẹ jọ̀wọ́, n kò ní ìdáhùn pípé fún èyí, ṣùgbọ́n...”
- Fi àwọn ẹ̀ka hàn: Orunto, Owu, Abeokuta, Àṣà, etc.`;



interface GeminiPart {
  text: string;
}

interface GeminiContent {
  role: string;
  parts: GeminiPart[];
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      {
        error:
          "AI chatbot not configured. Add GEMINI_API_KEY to .env.local. Get a free key at https://aistudio.google.com/apikey",
      },
      { status: 500 }
    );
  }

  const body = await request.json();
  const { message, history = [], language = "en" } = body;

  if (!message?.trim()) {
    return NextResponse.json(
      { error: "Message is required" },
      { status: 400 }
    );
  }

  const systemPrompt = language === "yo" ? SYSTEM_PROMPT_YO : SYSTEM_PROMPT_EN;

  // Build conversation history for Gemini
  const contents: GeminiContent[] = [];

  // Add conversation history
  for (const msg of history.slice(-10)) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // Add current message
  contents.push({
    role: "user",
    parts: [{ text: message }],
  });

  try {
    const response = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        contents,
        generationConfig: {
          temperature: 0.7,
          topP: 0.9,
          maxOutputTokens: 1024,
        },
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API error:", err);
      return NextResponse.json(
        { error: "AI service temporarily unavailable. Please try again." },
        { status: 502 }
      );
    }

    const data = await response.json();
    const reply =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I could not generate a response. Please try again.";

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Connection error. Please try again." },
      { status: 500 }
    );
  }
}
