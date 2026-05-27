import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import API from "../api/axios";

const suggestions = [
  "How can I improve my attendance?",
  "What study techniques work best?",
  "How should I prepare for internal tests?",
  "How many hours should I study daily?",
];

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-4">
      <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs flex-shrink-0">
        🤖
      </div>
      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
        <div className="flex gap-1 items-center h-4">
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
          <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
        </div>
      </div>
    </div>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex items-end gap-2 mb-4 ${isUser ? "flex-row-reverse" : ""}`}>

      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs flex-shrink-0 ${
        isUser ? "bg-indigo-600 text-white" : "bg-indigo-100"
      }`}>
        {isUser ? "👤" : "🤖"}
      </div>

      {/* Bubble */}
      <div className={`max-w-xs sm:max-w-md px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? "bg-indigo-600 text-white rounded-2xl rounded-br-sm"
          : "bg-white border border-gray-200 text-gray-800 rounded-2xl rounded-bl-sm"
      }`}>
        {msg.text}
      </div>

    </div>
  );
}

function Chatbot() {
  const { state }                     = useLocation();
  const [messages, setMessages]       = useState([]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const bottomRef                     = useRef(null);
  const inputRef                      = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Greet on mount — use prediction context if coming from PredictionForm
  useEffect(() => {
    const prediction  = state?.prediction;
    const confidence  = state?.confidence;

    let greeting;

    if (prediction === "FAIL") {
      greeting = `Hello! I can see your recent prediction came back as FAIL with ${confidence}% confidence. Don't worry — this is exactly why I'm here. Let's work out a plan to turn things around. What would you like help with first?`;
    } else if (prediction === "PASS") {
      greeting = `Hello! Great news — your recent prediction came back as PASS with ${confidence}% confidence. Keep up the good work! I'm here if you want tips on maintaining or improving your performance. What would you like to know?`;
    } else {
      greeting = "Hello! I'm your AI academic advisor. I can help you improve your study habits, understand your predictions, and build a plan to succeed. What would you like to talk about?";
    }

    setMessages([{ role: "bot", text: greeting }]);
  }, []);

  const sendMessage = async (text) => {
    const userText = text.trim();
    if (!userText || loading) return;

    setShowSuggestions(false);
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setLoading(true);

    try {
      const res = await API.post("/chat", {
        message:    userText,
        prediction: state?.prediction || null,
      });
      setMessages((prev) => [...prev, { role: "bot", text: res.data.message }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          text: "Sorry, I'm having trouble responding right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleSuggestion = (text) => {
    sendMessage(text);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-lg">
          🤖
        </div>
        <div>
          <h1 className="text-base font-semibold text-gray-900">AI Academic Advisor</h1>
          <span className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full inline-block" />
            Online
          </span>
        </div>
      </div>

      {/* Chat window */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl flex flex-col overflow-hidden">

        {/* Messages area */}
        <div className="flex-1 px-4 py-5 overflow-y-auto min-h-96 max-h-96">
          {messages.map((msg, i) => (
            <Message key={i} msg={msg} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && messages.length <= 1 && (
          <div className="px-4 pb-3 flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s}
                onClick={() => handleSuggestion(s)}
                className="text-xs bg-white border border-gray-200 text-gray-600 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition"
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200" />

        {/* Input bar */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 px-4 py-3"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask your academic advisor..."
            disabled={loading}
            className="flex-1 text-sm bg-white border border-gray-200 rounded-full px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M3.478 2.405a.75.75 0 00-.926.94l2.432 7.905H13.5a.75.75 0 010 1.5H4.984l-2.432 7.905a.75.75 0 00.926.94 60.519 60.519 0 0018.445-8.986.75.75 0 000-1.218A60.517 60.517 0 003.478 2.405z"/>
            </svg>
          </button>
        </form>

      </div>

    </div>
  );
}

export default Chatbot;