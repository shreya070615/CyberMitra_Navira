import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, ShieldAlert, ArrowRight, Volume2, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useVoice } from './hooks/useVoice';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Message {
  id: number;
  text: string;
  isScam: boolean;
  explanation: string;
}

const MESSAGES: Message[] = [
  {
    id: 1,
    text: "URGENT: Your SBI account will be blocked in 2 hours. Click here to update KYC: http://sbi-secure-kyc.com/login",
    isScam: true,
    explanation: "Banks never send links to update KYC. The website address looks suspicious."
  },
  {
    id: 2,
    text: "Dear Customer, your electricity bill for last month is ₹1,250. You can pay via the official app or at any authorized center.",
    isScam: false,
    explanation: "This is a standard informational message without any urgent threats or suspicious links."
  },
  {
    id: 3,
    text: "CONGRATULATIONS! You have won ₹25,00,000 in KBC Lottery. To claim, call Mr. Rana at 9876543210 and pay ₹5,000 processing fee.",
    isScam: true,
    explanation: "Lotteries that ask for money to 'process' winnings are always scams. KBC never asks for fees."
  },
  {
    id: 4,
    text: "Your Amazon order #123-456789 has been shipped. Track your package here: https://www.amazon.in/track/123",
    isScam: false,
    explanation: "This uses the official amazon.in domain and is a standard order update."
  }
];

export default function ScamCheck() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<'safe' | 'scam' | null>(null);
  const [showResult, setShowResult] = useState(false);
  const { t } = useAuth();
  const { speak } = useVoice();

  const currentMessage = MESSAGES[currentIndex];

  const handleChoice = (choice: 'safe' | 'scam') => {
    setSelectedAnswer(choice);
    setShowResult(true);
    const isCorrect = (choice === 'scam' && currentMessage.isScam) || (choice === 'safe' && !currentMessage.isScam);
    
    if (isCorrect) {
      speak("Correct! " + currentMessage.explanation);
    } else {
      speak("Not quite. " + currentMessage.explanation);
    }
  };

  const nextMessage = () => {
    if (currentIndex < MESSAGES.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Reset or show final score
      setCurrentIndex(0);
      setSelectedAnswer(null);
      setShowResult(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-24">
      <header className="text-center space-y-4">
        <div className="w-16 h-16 bg-brass rounded-2xl flex items-center justify-center text-white mx-auto shadow-lg border-4 border-white/20">
          <ShieldCheck size={32} />
        </div>
        <h1 className="text-4xl font-bold text-wood tracking-tight">{t('scamCheckTitle')}</h1>
        <p className="text-wood/60 text-lg font-serif italic max-w-md mx-auto">
          {t('scamCheckDesc')}
        </p>
      </header>

      {/* Message Card */}
      <motion.div
        key={currentIndex}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="slate-card p-8 md:p-12 bg-khadi min-h-[250px] flex flex-col justify-between relative"
      >
        <div className="absolute top-6 right-6">
          <button 
            onClick={() => speak(currentMessage.text)}
            className="p-3 bg-white border-2 border-wood/10 rounded-2xl text-brass hover:bg-gold/10 transition-colors"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <div className="text-xs font-bold text-wood/30 uppercase tracking-[0.2em] mb-6">Incoming Message</div>
        
        <div className="bg-white p-6 rounded-2xl border-2 border-wood/5 shadow-inner">
          <p className="text-2xl font-bold text-wood leading-relaxed">
            "{currentMessage.text}"
          </p>
        </div>

        <div className="mt-8 flex justify-between items-center text-wood/40 font-bold">
          <span>Message {currentIndex + 1} of {MESSAGES.length}</span>
        </div>
      </motion.div>

      {/* Big Button Toggles - Thumb-First Buckets */}
      {!showResult ? (
        <div className="grid grid-cols-2 gap-6">
          <button
            onClick={() => handleChoice('safe')}
            className="h-32 md:h-40 bg-forest text-white rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-xl shadow-forest/20 active:translate-y-2 active:shadow-inner transition-all border-4 border-white/20"
          >
            <ShieldCheck size={48} />
            <span className="text-2xl font-black tracking-widest">{t('safeBucket')}</span>
          </button>
          <button
            onClick={() => handleChoice('scam')}
            className="h-32 md:h-40 bg-terracotta text-white rounded-[2rem] flex flex-col items-center justify-center gap-3 shadow-xl shadow-terracotta/20 active:translate-y-2 active:shadow-inner transition-all border-4 border-white/20"
          >
            <ShieldAlert size={48} />
            <span className="text-2xl font-black tracking-widest">{t('scamBucket')}</span>
          </button>
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "slate-card p-8 text-center space-y-6 border-4",
            (selectedAnswer === 'scam' && currentMessage.isScam) || (selectedAnswer === 'safe' && !currentMessage.isScam)
              ? "bg-forest/5 border-forest/30"
              : "bg-terracotta/5 border-terracotta/30"
          )}
        >
          <div className="flex items-center justify-center gap-4">
            {((selectedAnswer === 'scam' && currentMessage.isScam) || (selectedAnswer === 'safe' && !currentMessage.isScam)) ? (
              <CheckCircle2 size={48} className="text-forest" />
            ) : (
              <XCircle size={48} className="text-terracotta" />
            )}
            <h3 className="text-3xl font-bold text-wood">
              {((selectedAnswer === 'scam' && currentMessage.isScam) || (selectedAnswer === 'safe' && !currentMessage.isScam)) ? "Correct!" : "Incorrect"}
            </h3>
          </div>
          
          <p className="text-xl text-wood/80 font-serif italic leading-relaxed">
            {currentMessage.explanation}
          </p>

          <button
            onClick={nextMessage}
            className="premium-button button-forest w-full"
          >
            {t('nextMessage')}
            <ArrowRight size={24} />
          </button>
        </motion.div>
      )}
    </div>
  );
}

