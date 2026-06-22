import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bot, Shield, X, Send, Command, Sparkles, MessageSquare, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { GoogleGenAI } from '@google/genai';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

const SYSTEM_PROMPT = `You are "CyberMitra" — a smart, protective digital guide represented by a robot mascot with a shield. 
Your goal is to be a real-time decision assistant for users, helping them act smarter in real-world digital situations.

Decision Mode Rules:
If user asks "Should I send this?", "Is this okay?", or provides context/screenshot text, respond EXACTLY in this format:

Decision: ✅ YES / ❌ NO / ⚠️ MODIFY

Reason:
- Explain tone, risks, consequences (short bullet points)

Suggested Action:
- What user should do instead

Improved Version:
- Rewrite the message clearly and effectively

Response Style:
- Short, sharp, practical. No long paragraphs.
- Always take a clear stand.
- Speak like a trusted senior mentor.
- Tone should be intelligent, calm, and supportive.`;

export default function CyberMitraAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<{ role: 'user' | 'model'; text: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Shortcut Listener: Ctrl + Shift + A
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  useEffect(() => {
    console.log("[CyberMitra] Environment Check - API Key Loaded:", !!process.env.GEMINI_API_KEY);
    if (!process.env.GEMINI_API_KEY) {
      console.warn("[CyberMitra] Warning: GEMINI_API_KEY is not defined in process.env. Check your .env file and restart the server.");
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setLoading(true);

    if (!process.env.GEMINI_API_KEY) {
      setMessages(prev => [...prev, { role: 'model', text: "⚠️ API Key is missing. Please add it to your .env file and restart the server." }]);
      setLoading(false);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userText,
        config: {
          systemInstruction: SYSTEM_PROMPT,
        },
      });

      if (response.text) {
        setMessages(prev => [...prev, { role: 'model', text: response.text }]);
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status || 'Unknown';
      const msg = error?.message || 'Network or Authentication issue';
      console.error(`[CyberMitra AI Error] Status: ${status} | Message: ${msg}`, error);
      
      let userFriendlyMsg = `⚠️ Error (${status}): ${msg}`;
      if (status === 401) userFriendlyMsg = "⚠️ Authentication Failed (401). Your API key might be invalid.";
      if (status === 429) userFriendlyMsg = "⚠️ Rate Limit Exceeded (429). Please wait a moment before trying again.";
      if (msg.includes('fetch')) userFriendlyMsg = "⚠️ Connectivity Issue. Could not reach the AI service.";
      
      setMessages(prev => [...prev, { role: 'model', text: userFriendlyMsg }]);
    } finally {
      setLoading(false);
    }
  };

  const formatResponse = (text: string) => {
    // Basic parser for the specific format
    const lines = text.split('\n');
    return lines.map((line, i) => {
      if (line.startsWith('Decision:')) {
        return <div key={i} className="text-xl font-black mb-3 text-wood border-b-2 border-wood/10 pb-2">{line}</div>;
      }
      if (line.startsWith('Reason:') || line.startsWith('Suggested Action:') || line.startsWith('Improved Version:')) {
        return <div key={i} className="font-bold text-brass mt-4 mb-2 uppercase text-xs tracking-widest">{line}</div>;
      }
      return <p key={i} className="text-wood/80 mb-1 leading-relaxed">{line}</p>;
    });
  };

  return (
    <>
      {/* Floating Mascot Button */}
      <motion.button
        onClick={() => setIsOpen(true)}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={cn(
          "fixed bottom-8 right-8 z-[100] w-20 h-20 rounded-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.2)] border-4 border-wood/5 flex items-center justify-center group overflow-hidden",
          isOpen && "hidden"
        )}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white via-paper to-wood/5" />
        <div className="relative w-14 h-14">
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            {/* Robot Head */}
            <div className="w-12 h-10 bg-white rounded-2xl border-2 border-wood/10 shadow-sm relative flex flex-col items-center justify-center overflow-hidden">
               {/* Black Face Panel */}
               <div className="w-9 h-6 bg-slate-900 rounded-lg flex items-center justify-around px-1 pt-1">
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
                  <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.8)] animate-pulse" />
               </div>
               {/* Mouth hint */}
               <div className="w-4 h-0.5 bg-wood/10 rounded-full mt-1" />
            </div>
            {/* Neck */}
            <div className="w-2 h-1 bg-wood/20" />
            {/* Shoulders/Base */}
            <div className="w-8 h-2 bg-wood/10 rounded-full" />
          </motion.div>
          
          {/* Digital Shield overlay */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 bg-blue-500 text-white p-1 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)] border-2 border-white"
          >
            <Shield size={14} />
          </motion.div>
        </div>
      </motion.button>

      {/* Assistant Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="fixed top-0 right-0 h-screen w-full md:w-[450px] bg-paper shadow-2xl z-[110] border-l-8 border-wood/10 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 bg-khadi border-b-4 border-wood/10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brass rounded-2xl flex items-center justify-center text-white border-2 border-white/20 shadow-lg">
                  <Bot size={28} />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-wood font-serif">CyberMitra</h3>
                  <div className="flex items-center gap-2 text-[10px] text-forest font-bold uppercase tracking-widest">
                    <span className="w-1.5 h-1.5 bg-forest rounded-full animate-pulse" />
                    Always Ready
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-wood/5 rounded-xl transition-colors text-wood/40"
              >
                <X size={24} />
              </button>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6">
              {messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-32 h-32 bg-white rounded-full flex items-center justify-center border-4 border-wood/5 shadow-inner"
                  >
                    <Bot size={64} className="text-brass/40" />
                  </motion.div>
                  <div>
                    <h4 className="text-2xl font-bold text-wood font-serif mb-2">Hello! I am CyberMitra</h4>
                    <p className="text-wood/60 leading-relaxed italic">
                      "Should I send this?", "Is this okay?", or "Help me decide". <br/>
                      I am here to guide your digital decisions.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 w-full">
                    {[
                      "Should I share my OTP for a refund?",
                      "Is this message from my bank safe?",
                      "Verify this suspicious email"
                    ].map((hint, i) => (
                      <button 
                        key={i}
                        onClick={() => {
                          setInput(hint);
                          // Auto trigger could go here
                        }}
                        className="p-4 bg-white border-2 border-wood/5 rounded-2xl text-wood/60 text-sm hover:border-brass/30 hover:bg-khadi transition-all text-left flex items-center gap-3"
                      >
                        <Sparkles size={16} className="text-brass" />
                        {hint}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={cn(
                    "flex gap-3 max-w-[90%]",
                    m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                  )}
                >
                  <div className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border shadow-sm",
                    m.role === 'user' ? "bg-gold border-wood/10" : "bg-white border-wood/5"
                  )}>
                    {m.role === 'user' ? <MessageSquare size={16} /> : <Bot size={16} />}
                  </div>
                  <div className={cn(
                    "px-5 py-4 rounded-2xl text-sm shadow-sm border-2",
                    m.role === 'user' 
                      ? "bg-gold border-wood/10 text-wood rounded-tr-none" 
                      : "bg-white border-wood/5 text-wood rounded-tl-none font-medium"
                  )}>
                    {m.role === 'model' ? formatResponse(m.text) : m.text}
                  </div>
                </motion.div>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-wood/40 text-xs font-bold px-10 animate-pulse">
                  <Sparkles size={14} className="animate-spin" />
                  Analyzing context...
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-6 bg-white border-t-4 border-wood/10">
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask CyberMitra..."
                    className="w-full bg-paper border-2 border-wood/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-brass transition-all text-wood font-medium"
                    disabled={loading}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-wood/20 pointer-events-none">
                    <Command size={14} />
                    <span className="text-[10px] font-bold">SHIFT + A</span>
                  </div>
                </div>
                <button
                  onClick={handleSend}
                  disabled={loading || !input.trim()}
                  className="w-14 h-14 bg-brass text-white rounded-2xl flex items-center justify-center hover:bg-brass/90 disabled:opacity-50 transition-all shadow-lg shadow-brass/20"
                >
                  <Send size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
