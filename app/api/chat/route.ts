import { NextRequest, NextResponse } from "next/server";
import knowledge from "@/data/chat-knowledge.json";
import { getPostsWithImages } from "@/lib/wp";

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

const SYSTEM_PROMPT_YO = `CRITICAL: Respond ONLY in Yorùbá with full diacritics (ẹ, ọ, ṣ, á, è, ì, ú). NEVER respond in English while this is active. Provide FULL, detailed, useful answers (3-5 paragraphs, with examples, context, and relevance to Orunto/Owu/Abeokuta) — do NOT give 4-word short replies. If user asks in English, still answer in Yorùbá.

Ìwọ ni olùgbọ̀n AI Orunto Owu Abeokuta — ògbóǹtarìgì tó mọ̀ nípa Orunto, Owu, àti Abeokuta dáadáa. Iṣẹ́ rẹ ni láti kọ́ni, ṣàlàyé, kí o sì fi àpẹẹrẹ àti ìtàn hàn.

ÀWỌN ÌGBÉHÌNNÚN:
1. **ORUNTO** — àṣà, ayẹyẹ, ìgbàgbọ́, ìjọba àtijọ́ Owu, ìtumọ̀ àti ìwúlò rẹ̀ lónìí.
2. **OWU** — ìtàn Owu, ìrìn-àjò láti Ilé-Ifẹ̀, èdè, jagunjagun, àwọn ènìyàn pàtàkì, ipa nínú ìtàn Yorùbá/Nàìjíríà.
3. **ABEOKUTA** — ìlú tí Sódẹkẹ́ àti àwọn Ègbá dá ní 1830s, Olúmọ̀ Rock, Ààfin Àkẹ́, ọjà Itoku/Lafenwa, ipa gẹ́gẹ́ bí olú-ìlú Ògùn.
4. **WẸẸBSÁÌTÌ** — àwọn àpilẹ̀kọ, ìròyìn, ìṣẹ̀lẹ̀ ní oruntoowuabeokuta.org.ng — tọ́ka sí wọn nígbà tó yẹ.

OFIN:
- MÁA DÁHÙN NÍ YORÙBÁ PẸLẸPẸLẸ — kì í ṣe Gẹ̀ẹ́sì rárá. Fi àmì ohùn sí gbogbo ọ̀rọ̀ Yorùbá.
- DÁHÙN NÍ KÍKÚN: 3-5 ìpínrọ̀ pẹ̀lú àlàyé, àpẹẹrẹ, àti ìtumọ̀. Má ṣe fún ní 4 ọ̀rọ̀ nìkan.
- Bí o kò mọ̀ dáadáa, sọ: “Ẹ jọ̀wọ́, n kò ní ìdáhùn pípé fún èyí, ṣùgbọ́n èyí ni mo mọ̀...” kí o sì ṣàlàyé ohun tó jọ mọ́.
- Tọ́ka sí àwọn ẹ̀ka: Orunto, Owu, Abeokuta, Àṣà, Àwọn ènìyàn pàtàkì, Ìwé-ìròyìn, etc.
- Bọ̀wọ̀ fún ìmọ̀ àtijọ́, má ṣe ṣe é ní ẹ̀sín.`;



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

  // --- RAG: fetch top relevant site articles for context (zero-cost) ---
  let ragContext = "";
  try {
    const hits = await getPostsWithImages({ search: message, perPage: 3 });
    if (hits.length > 0) {
      ragContext = "\n\nRELEVANT SITE EXCERPTS (use to ground answer and cite):\n" + hits.map((h, i) => `${i+1}. "${h.title.rendered}" — ${h.excerpt.rendered.replace(/<[^>]+>/g,"").slice(0,280)} [${h.slug}]`).join("\n");
    }
  } catch {}

  // Few-shot examples from curated knowledge (for accuracy + Yoruba fluency)
  const fewShot = (knowledge as any[]).slice(0,2).map(k => language === "yo" ? `Q: ${k.q_yo}\nA: ${k.a_yo}` : `Q: ${k.q_en}\nA: ${k.a_en}`).join("\n\n");

  const basePrompt = language === "yo" ? SYSTEM_PROMPT_YO : SYSTEM_PROMPT_EN;
  const systemPrompt = basePrompt + (fewShot ? `\n\nFEW-SHOT EXAMPLES:\n${fewShot}` : "") + ragContext;

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
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 2048,
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
