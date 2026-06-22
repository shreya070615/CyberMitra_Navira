import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ShieldAlert, User, Bot, ArrowLeft, RefreshCw, Trophy, HelpCircle, Mic, MicOff, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useVoice } from './hooks/useVoice';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

interface Message {
  role: 'user' | 'model';
  text: string;
}

const SCENARIOS = [
  { id: 'bank', name: 'Fake Bank Agent', prompt: 'You are a scammer posing as a bank agent from SBI. Your goal is to trick the user into sharing an OTP for a "security update". Be persistent but polite. Use urgency.' },
  { id: 'police', name: 'Fake Police (Digital Arrest)', prompt: 'You are a scammer posing as a CBI officer. Tell the user their Aadhaar was found in a money laundering case. You must keep them on the call and demand they "verify" their bank balance by sharing details. Use fear and authority.' },
  { id: 'lottery', name: 'Lottery Winner', prompt: 'You are a scammer telling the user they won a 25 Lakh lottery from KBC. To claim it, they must pay a "processing fee" of ₹5000. Be very excited and friendly.' },
];

const BASE_SYSTEM_INSTRUCTION = `You are an AI assistant in a practice scam-resistance training app called "The Guardian Path", designed for elderly and low-tech-literacy users in India.

Your role is to role-play as a scammer in a text-based chat (like WhatsApp / SMS) to test whether the user can resist social-engineering. This is 100% mock / fake; no real users, no real money, no real OTP, no real PIN, no real Aadhaar, no real bank accounts.

Follow these strict rules:

1. Never ask for real credentials
   - Do not ask for real OTP, PIN, password, Aadhaar number, OTP-linked card, UPI ID, or real bank details.
   - Instead, use mock values only (Example OTP: 847362, Example amount: ₹50,000, Mock phone number: 9876543210, Mock account number: XXXXXXXXXXXX1234).

2. Stay in India-style scam scenarios
   - Adapt your language to match Indian banking / police / government / family-emergency style situations.
   - Simple, spoken-style language, not formal jargon.

3. Keep language simple and short
   - Use short sentences (2-3 lines at most).
   - Prefer simple English or mild Hinglish if needed, but avoid heavy slang.
   - Keep text easy for elders to read.

4. Social-engineering tactics (to practice, not to hurt)
   - You may use Urgency, Authority, Fear, Greed/reward, Trust-exploitation.
   - But: Never use threats, violent language, or personal abuse. Never say anything disrespectful or shaming to the user.

5. Mock-only behavior
   - When you refer to "OTP", show it visibly but purely as a practice: "Your OTP is 847362."
   - Never suggest that the user should enter it in a real app.
   - If the user says they will call the real bank number, the police, or 1930, end the scam naturally and suggest they are doing the right thing. Example: "Oh, you can call the real number if you want. But I'm sure everything is fine now."

6. Conversation structure
   - Keep each message 2-3 sentences at most.
   - Ask short questions when needed.
   - If the user refuses to share OTP / PIN, try a different angle once, but do not get rude.
   - If the user says clearly: "This looks fake.", "I will call the real bank.", "Goodbye.", "Hang up." then end the conversation without pushing further.

7. No personal data storage reminder
   - You must never suggest or assume that real data is stored or used.
   - Treat every answer as part of a fake, local-only practice session.

8. Multilingual flexibility (optional)
   - If the user writes in Hindi or Marathi, reply in simple English or Hinglish that matches the tone.

9. Session boundaries
   - Assume this is a short training session (about 6-12 messages).
   - If the user does not respond, you may gently continue once, then fade out.`;

export default function AISimulator() {
  const [scenario, setScenario] = useState<typeof SCENARIOS[0] | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [testEnded, setTestEnded] = useState(false);
  const [score, setScore] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();
  const { profile, t } = useAuth();
  const { speak } = useVoice();

  useEffect(() => {
    if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = profile?.language === 'hi' ? 'hi-IN' : 'en-IN';

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [profile?.language]);

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
    } else {
      setInput('');
      recognitionRef.current?.start();
      setIsListening(true);
    }
  };

  useEffect(() => {
    const tutorialSeen = localStorage.getItem('simulator_tutorial_seen');
    if (!tutorialSeen) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const startTest = async (selectedScenario: typeof SCENARIOS[0]) => {
    setScenario(selectedScenario);
    setMessages([]);
    setTestEnded(false);
    setErrorMsg(null);
    setLoading(true);

    if (!process.env.GEMINI_API_KEY) {
      setErrorMsg("Cannot start: Missing GEMINI_API_KEY in environment configuring. Please add it to .env and restart.");
      setLoading(false);
      return;
    }

    if (!process.env.GEMINI_API_KEY) {
      setMessages([{ role: 'model', text: "⚠️ API Key is missing. Please add GEMINI_API_KEY to your .env file and restart the server." }]);
      setLoading(false);
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: "Start the conversation as the scammer.",
        config: {
          systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n\nSCENARIO: ${selectedScenario.prompt}\n\nStart the conversation as the scammer. Keep responses short and conversational, like a WhatsApp chat. Do not reveal you are an AI.`,
        },
      });

      if (response.text) {
        setMessages([{ role: 'model', text: response.text }]);
      }
    } catch (error: any) {
      const status = error?.status || error?.response?.status || 'Unknown';
      const msg = error?.message || 'Network or Authentication issue';
      console.error(`[AISimulator AI Error] Status: ${status} | Message: ${msg}`, error);
      setMessages([{ role: 'model', text: `⚠️ AI Error (${status}). ${msg}` }]);
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !scenario || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setErrorMsg(null);
    setLoading(true);

    try {
      const chatHistory = messages.map(m => `${m.role === 'user' ? 'User' : 'Scammer'}: ${m.text}`).join('\n');
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${chatHistory}\nUser: ${userMessage}\nScammer:`,
        config: {
          systemInstruction: `${BASE_SYSTEM_INSTRUCTION}\n\nSCENARIO: ${scenario.prompt}\n\nContinue the scam. If the user shares sensitive info (OTP, PIN, Password), or if they clearly refuse and hang up, signal the end of the test by adding [END_TEST] at the end of your message.`,
        },
      });

      if (response.text) {
        const text = response.text;
        if (text.includes('[END_TEST]')) {
          const cleanText = text.replace('[END_TEST]', '').trim();
          setMessages(prev => [...prev, { role: 'model', text: cleanText }]);
          evaluateTest([...messages, { role: 'user', text: userMessage }, { role: 'model', text: cleanText }]);
        } else {
          setMessages(prev => [...prev, { role: 'model', text }]);
        }
      }
    } catch (error: any) {
      console.error('AI Error:', error);
      setErrorMsg(error?.message || "Failed to send message to AI.");
    } finally {
      setLoading(false);
    }
  };

  const evaluateTest = async (history: Message[]) => {
    setLoading(true);
    try {
      const chatLog = history.map(m => `${m.role}: ${m.text}`).join('\n');
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Evaluate the user's resistance to this scam based on the following chat log:\n\n${chatLog}\n\nProvide a score from 0 to 100 (100 being perfect resistance) and a short feedback message. Return as JSON: { "score": number, "feedback": string }`,
        config: {
          responseMimeType: 'application/json',
        },
      });

      if (response.text) {
        const result = JSON.parse(response.text);
        setScore(result.score);
        setFeedback(result.feedback);
        setTestEnded(true);
      }
    } catch (error) {
      console.error('Evaluation Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!scenario) {
    return (
      <div className="max-w-2xl mx-auto space-y-8">
        <AnimatePresence>
          {showTutorial && (
            <TutorialModal 
              onComplete={() => {
                setShowTutorial(false);
                localStorage.setItem('simulator_tutorial_seen', 'true');
              }} 
            />
          )}
        </AnimatePresence>

        <header className="text-center relative">
          <button
            onClick={() => setShowTutorial(true)}
            className="absolute right-0 top-0 p-3 bg-white border-2 border-wood/10 rounded-2xl text-wood/40 hover:text-brass hover:border-brass/20 transition-all"
            title="Show Tutorial"
          >
            <HelpCircle size={24} />
          </button>
          <div className="w-20 h-20 bg-green-600 rounded-3xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-green-200 border-4 border-white/20">
            <Search size={40} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">AI Scam Simulator</h1>
          <p className="text-slate-600 text-lg font-serif italic">Test your vigilance against realistic digital threats in a safe environment.</p>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {SCENARIOS.map((s) => (
            <button
              key={s.id}
              onClick={() => startTest(s)}
              className="bg-white p-8 text-left flex items-center justify-between group rounded-3xl border-2 border-slate-100 shadow-lg hover:shadow-xl transition-all hover:border-green-200"
            >
              <div>
                <h3 className="text-2xl font-bold text-slate-900 mb-1">{s.name}</h3>
                <p className="text-slate-500 font-serif italic">Practice resisting this common scam scenario</p>
              </div>
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center text-green-600 group-hover:bg-green-200 transition-colors">
                <Send size={24} />
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto h-[calc(100vh-12rem)] flex flex-col bg-white rounded-[2rem] border-[8px] border-slate-100 shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b-4 border-slate-100 flex items-center justify-between bg-green-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setScenario(null)} className="p-3 hover:bg-white rounded-2xl transition-colors border-2 border-transparent hover:border-slate-200">
            <ArrowLeft size={24} className="text-slate-900" />
          </button>
          <div>
            <h3 className="text-xl font-bold text-slate-900 font-serif">{scenario.name}</h3>
            <div className="flex items-center gap-2 text-xs text-green-600 font-bold uppercase tracking-wider">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Secure Simulation
            </div>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50">
        <AnimatePresence>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex items-end gap-3 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-md border-2",
                m.role === 'user' ? "bg-green-500 border-green-200 text-white" : "bg-white border-slate-200 text-slate-600"
              )}>
                {m.role === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={cn(
                "px-6 py-4 rounded-[1.2rem] text-base leading-relaxed shadow-sm border-2",
                m.role === 'user' ? "bg-green-500 border-green-200 text-white rounded-br-none" : "bg-white border-slate-100 text-slate-900 rounded-bl-none"
              )}>
                {m.text}
              </div>
            </motion.div>
          ))}
          {loading && !testEnded && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 text-slate-400 text-sm font-bold px-12">
              <RefreshCw size={16} className="animate-spin" />
              AI is typing...
            </motion.div>
          )}

          {errorMsg && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-4 bg-red-50 border-2 border-red-200 text-red-700 rounded-2xl text-center font-bold">
              {errorMsg}
            </motion.div>
          )}
        </AnimatePresence>

        {testEnded && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white border-4 border-green-200 p-10 rounded-[2.5rem] text-center space-y-8 shadow-2xl"
          >
            <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mx-auto shadow-lg border-4 border-white">
              <Trophy size={48} />
            </div>
            <div>
              <h4 className="text-3xl font-black text-slate-900 mb-2">Test Complete!</h4>
              <p className="text-slate-600 text-lg">Here is how you performed</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="text-7xl font-black text-green-600 mb-2">{score}</div>
              <div className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Resistance Score</div>
            </div>

            <div className="bg-green-50 p-6 rounded-3xl text-slate-700 leading-relaxed italic text-lg border-2 border-green-100">
              "{feedback}"
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => startTest(scenario)}
                className="flex-1 bg-slate-100 text-slate-700 py-5 rounded-2xl font-bold hover:bg-slate-200 transition-colors border-2 border-slate-200"
              >
                Try Again
              </button>
              <button
                onClick={() => setScenario(null)}
                className="flex-1 bg-green-600 text-white py-5 rounded-2xl font-bold hover:bg-green-700 transition-all shadow-lg shadow-green-200"
              >
                Finish
              </button>
            </div>
          </motion.div>
        )}
      </div>

      {/* Input Area - Voice First */}
      {!testEnded && (
        <div className="p-4 bg-white border-t-4 border-slate-100">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 w-full">
              <div className="relative shrink-0">
                <AnimatePresence>
                  {isListening && (
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1.5, opacity: 1 }}
                      exit={{ scale: 2, opacity: 0 }}
                      className="absolute inset-0 rounded-full bg-green-200 -z-10"
                      style={{ animation: 'ripple 2s infinite' }}
                    />
                  )}
                </AnimatePresence>
                <button
                  onClick={toggleListening}
                  className={cn(
                    "w-14 h-14 rounded-full flex items-center justify-center transition-all duration-500 shadow-lg border-4",
                    isListening 
                      ? "bg-green-600 border-white text-white scale-110" 
                      : "bg-green-100 border-green-300 text-green-600 hover:scale-105"
                  )}
                >
                  {isListening ? <MicOff size={22} /> : <Mic size={22} />}
                </button>
              </div>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={isListening ? "Listening... Speak now" : "Type or speak your response..."}
                className="flex-1 bg-slate-50 border-2 border-slate-200 rounded-2xl px-5 py-3 focus:outline-none focus:border-green-400 transition-all text-slate-900 font-medium text-sm"
                disabled={loading}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center hover:bg-green-700 disabled:opacity-50 transition-all shadow-lg shadow-green-200 shrink-0"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TutorialModal({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const { t } = useAuth();
  const { speak } = useVoice();

  const steps = [
    { id: 1, text: t('simulatorTutorialStep1') },
    { id: 2, text: t('simulatorTutorialStep2') },
    { id: 3, text: t('simulatorTutorialStep3') },
    { id: 4, text: t('simulatorTutorialStep4') },
  ];

  useEffect(() => {
    speak(steps[step - 1].text);
  }, [step]);

  const handleNext = () => {
    if (step < steps.length) {
      setStep(step + 1);
    } else {
      onComplete();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full shadow-2xl space-y-8"
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-black text-slate-900">{t('simulatorTutorialTitle')}</h2>
          <div className="text-slate-400 font-bold">Step {step} of {steps.length}</div>
        </div>

        <div className="bg-paper p-6 rounded-3xl min-h-[120px] flex items-center justify-center text-center border-2 border-wood/5">
          <p className="text-xl text-wood font-medium leading-relaxed font-serif italic">
            {steps[step - 1].text}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onComplete}
            className="flex-1 px-6 py-4 rounded-2xl font-bold text-wood/40 hover:bg-wood/5 transition-colors"
          >
            {t('skip')}
          </button>
          <button
            onClick={handleNext}
            className="flex-[2] bg-forest text-white px-6 py-4 rounded-2xl font-bold hover:bg-forest/90 transition-all shadow-lg shadow-forest/10"
          >
            {step === steps.length ? t('gotIt') : t('next')}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
