"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const QUICK_QUESTIONS_EN = [
  "What is Orunto?",
  "Tell me about Owu history",
  "What is Abeokuta known for?",
  "Who founded Abeokuta?",
];

const QUICK_QUESTIONS_YO = [
  "Kí ni Orunto?",
  "Sọ̀rọ̀ nípa ìtàn Owu",
  "Kí ni Abeokuta ń jẹ́ mọ̀?",
  "Tá ni ó dá Abeokuta?",
];

type Language = "en" | "yo";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [language, setLanguage] = useState<Language>("en");
  const [isListening, setIsListening] = useState(false);
  const [speakingIdx, setSpeakingIdx] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  const WELCOME_EN =
    "Hello! I'm the Orunto Owu Abeokuta guide. I can tell you about the Orunto tradition, Owu heritage, and the historic city of Abeokuta. What would you like to know?";
  const WELCOME_YO =
    "Báwo ni! Mo jẹ́ olùgbọ̀n Orunto Owu Abeokuta. Mo lè sọ̀rọ̀ nípa ìrànṣẹ́ orunto, ìdílé owu, àti ìlú tó ní ìtàn Abeokuta. Kí ni o fẹ́ mọ̀?";

  const PLACEHOLDER_EN = "Ask about Orunto, Owu, or Abeokuta...";
  const PLACEHOLDER_YO = "Bèrè nípa Orunto, Owu, tàbí Abeokuta...";
  const LISTENING_LABEL = "Listening...";
  const THINKING_EN = "Thinking...";
  const THINKING_YO = "Ó ní ìròyìn...";

  // Initialize welcome message when language changes or chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        { role: "assistant", content: language === "yo" ? WELCOME_YO : WELCOME_EN },
      ]);
    }
  }, [isOpen, messages.length, language]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Initialize speech synthesis + preload voices
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      // Voices load async on some browsers
      const loadVoices = () => window.speechSynthesis.getVoices();
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, []);

  const speak = useCallback(
    (text: string, idx: number) => {
      if (!synthRef.current) return;
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      // Yoruba voices rarely exist — pick best available, fallback to en-NG
      const voices = synthRef.current.getVoices();
      const yoVoice = voices.find((v) => v.lang.toLowerCase().startsWith("yo")) || voices.find((v) => v.lang.toLowerCase().startsWith("en-ng")) || voices.find((v) => v.lang.toLowerCase().startsWith("en")) || null;
      if (yoVoice) utterance.voice = yoVoice;
      utterance.lang = yoVoice ? yoVoice.lang : language === "yo" ? "yo-NG" : "en-NG";
      utterance.rate = 0.9;
      utterance.onstart = () => setSpeakingIdx(idx);
      utterance.onend = () => setSpeakingIdx(null);
      utterance.onerror = () => setSpeakingIdx(null);
      synthRef.current.speak(utterance);
    },
    [language]
  );

  const stopSpeaking = useCallback(() => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setSpeakingIdx(null);
    }
  }, []);

  const startListening = useCallback(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === "yo"
          ? "Ìròyìn ọ̀rọ̀ kò sí nínú ìṣàpèjúwe browser yìí. Jọ̀wọ́ lo Chrome."
          : "Speech recognition is not supported in your browser. Please use Chrome."
      );
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.abort();
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === "yo" ? "yo-NG" : "en-NG";
    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => (prev ? prev + " " + transcript : transcript));
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [language]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.abort();
      setIsListening(false);
    }
  }, []);

  async function sendMessage(text?: string) {
    const msg = (text || input).trim();
    if (!msg || loading) return;

    stopSpeaking();
    if (isListening) stopListening();

    const userMsg: Message = { role: "user", content: msg };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    const history = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, history, language }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: data.error || (language === "yo" ? "Ó bínú, ìṣòro kan wáyé. Jọ̀wọ́ gbìyànjú sí i." : "Sorry, something went wrong. Please try again."),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: language === "yo" ? "Ìṣòro ìbáṣepọ̀. Jọ̀wọ́ wo íntánẹ̀ àti gbìyànjú sí i." : "Connection error. Please check your internet and try again.",
        },
      ]);
    }

    setLoading(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  const quickQuestions = language === "yo" ? QUICK_QUESTIONS_YO : QUICK_QUESTIONS_EN;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chat-fab"
        aria-label={isOpen ? "Close chat" : "Open chat assistant"}
      >
        {isOpen ? "✕" : "Chat"}
      </button>

      {/* Chat panel */}
      {isOpen && (
        <div className="chat-panel">
          <div className="chat-header">
            <div>
              <strong>Orunto Owu Guide</strong>
              <span className="chat-status">
                {language === "yo" ? "Ìrànṣẹ́ ìmọ̀ àṣà AI" : "AI-powered heritage assistant"}
              </span>
            </div>
            <div className="chat-header-actions">
              <div className="chat-lang-switch" title="Select language">
                <button onClick={() => setLanguage("en")} className={`chat-lang-btn ${language === "en" ? "active" : ""}`} aria-label="English">EN</button>
                <button onClick={() => setLanguage("yo")} className={`chat-lang-btn ${language === "yo" ? "active" : ""}`} aria-label="Yorùbá">YORÙBÁ</button>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="chat-close"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`chat-bubble chat-${msg.role}`}>
                <span className="chat-bubble-text">{msg.content}</span>
                {msg.role === "assistant" && (
                  <button
                    className="chat-speak-btn"
                    onClick={() =>
                      speakingIdx === i ? stopSpeaking() : speak(msg.content, i)
                    }
                    title={language === "yo" ? "Gbọ́ ìròyìn" : "Listen to response"}
                  >
                    {speakingIdx === i ? "⏹" : "🔊"}
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="chat-bubble chat-assistant chat-typing">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="chat-quick">
              <p>{language === "yo" ? "Ìbéèrè kíákíá:" : "Quick questions:"}</p>
              {quickQuestions.map((q) => (
                <button key={q} onClick={() => sendMessage(q)} className="chat-quick-btn">
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="chat-input-area">
            <button
              onClick={isListening ? stopListening : startListening}
              className={`chat-mic-btn ${isListening ? "chat-mic-active" : ""}`}
              title={language === "yo" ? "Sọ̀rọ̀" : "Speak"}
              aria-label={language === "yo" ? "Sọ̀rọ̀" : "Speak"}
            >
              {isListening ? "⏹" : "🎤"}
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                isListening
                  ? LISTENING_LABEL
                  : language === "yo"
                  ? PLACEHOLDER_YO
                  : PLACEHOLDER_EN
              }
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="chat-send"
              aria-label="Send message"
            >
              →
            </button>
          </div>
        </div>
      )}
    </>
  );
}
