import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { motion } from 'motion/react';
import { Play, CheckCircle2, Clock, Trophy, Volume2, Star } from 'lucide-react';
import { Link } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useVoice } from './hooks/useVoice';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const blocks = [
  {
    id: 'block1',
    icon: '🏦',
    color: 'bg-blue-600',
    points: 100,
    time: '15-20 min',
  },
  {
    id: 'block2',
    icon: '💳',
    color: 'bg-purple-600',
    points: 100,
    time: '15-20 min',
  },
  {
    id: 'block3',
    icon: '👮',
    color: 'bg-slate-800',
    points: 150,
    time: '20-25 min',
  },
  {
    id: 'block4',
    icon: '🆔',
    color: 'bg-emerald-600',
    points: 100,
    time: '15-20 min',
  },
  {
    id: 'block5',
    icon: '💰',
    color: 'bg-amber-600',
    points: 100,
    time: '15-20 min',
  },
];

const translations_blocks = {
  en: {
    block1: { title: 'Bank Call & OTP Safety', desc: 'Learn why you should never share OTP or PIN with anyone, even if they claim to be from your bank.' },
    block2: { title: 'UPI & Payment Scams', desc: 'Learn to identify fake payment requests, QR code scams, and screenshot frauds.' },
    block3: { title: 'Fake Police & Digital Arrest', desc: 'Learn how scammers impersonate police/CBI to scare you into giving money.' },
    block4: { title: 'Fake KYC & Aadhaar Cloning', desc: 'Learn to spot fake government websites and protect your Aadhaar from cloning.' },
    block5: { title: 'Investment & Lottery Frauds', desc: 'Learn to identify fake investment schemes and lottery scams targeting your savings.' },
  },
  hi: {
    block1: { title: 'बैंक कॉल और ओटीपी सुरक्षा', desc: 'नकली बैंक कॉल की पहचान करना सीखें और जानें कि आपको अपना ओटीपी या पिन कभी क्यों साझा नहीं करना चाहिए।' },
    block2: { title: 'यूपीआई और भुगतान घोटाले', desc: 'नकली भुगतान अनुरोधों, क्यूआर कोड घोटालों और स्क्रीनशॉट धोखाधड़ी की पहचान करना सीखें।' },
    block3: { title: 'नकली पुलिस और डिजिटल अरेस्ट', desc: 'जानें कि कैसे धोखेबाज पैसे देने के लिए आपको डराने के लिए पुलिस/सीबीआई का रूप धारण करते हैं।' },
    block4: { title: 'नकली केवाईसी और आधार क्लोनिंग', desc: 'नकली सरकारी वेबसाइटों को पहचानना सीखें और अपने आधार को क्लोनिंग से बचाएं।' },
    block5: { title: 'निवेश और लॉटरी धोखाधड़ी', desc: 'अपनी बचत को लक्षित करने वाली नकली निवेश योजनाओं और लॉटरी घोटालों की पहचान करना सीखें।' },
  }
};

export default function Learn() {
  const { profile, t } = useAuth();
  const { speak } = useVoice();
  const lang = profile?.language || 'en';

  useEffect(() => {
    speak(`${t('chooseBlock')}. ${t('completeAll')}`);
  }, []);

  if (!profile) return null;

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{t('chooseBlock')}</h1>
          <p className="text-slate-600 text-lg">{t('completeAll')}</p>
        </div>
        <button 
          onClick={() => speak(`${t('chooseBlock')}. ${t('completeAll')}`)}
          className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Volume2 size={24} />
        </button>
      </header>

      <div className="grid grid-cols-1 gap-6">
        {blocks.map((block) => {
          const isCompleted = (profile.progress as any)[block.id] === 'completed';
          const blockData = (translations_blocks as any)[lang][block.id];
          
          return (
            <motion.div
              key={block.id}
              whileHover={{ scale: 1.01 }}
              className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm hover:border-blue-200 transition-all flex flex-col md:flex-row items-center gap-8 group"
            >
              <div className={cn(
                "w-24 h-24 rounded-3xl flex items-center justify-center text-4xl shadow-lg shrink-0 group-hover:rotate-6 transition-transform",
                block.color,
                "text-white"
              )}>
                {block.icon}
              </div>
              
              <div className="flex-1 text-center md:text-left space-y-2">
                <div className="flex items-center justify-center md:justify-start gap-3">
                  <h3 className="text-2xl font-black text-slate-900">{blockData.title}</h3>
                  <button 
                    onClick={() => speak(`${blockData.title}. ${blockData.desc}`)}
                    className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>
                <p className="text-slate-500 text-lg font-medium leading-relaxed">
                  {blockData.desc}
                </p>
                <div className="flex items-center justify-center md:justify-start gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-slate-50 text-slate-500 px-3 py-1 rounded-full text-sm font-bold">
                    <Clock size={14} />
                    {block.time}
                  </div>
                  <div className="flex items-center gap-2 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-bold">
                    <Star size={14} fill="currentColor" />
                    {block.points} Points
                  </div>
                  {isCompleted && (
                    <div className="flex items-center gap-2 bg-green-50 text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                      <CheckCircle2 size={14} />
                      {t('completed')}
                    </div>
                  )}
                </div>
              </div>

              <div className="w-full md:w-auto">
                <Link
                  to={`/learn/${block.id}`}
                  className={cn(
                    "flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg transition-all w-full md:w-auto",
                    isCompleted 
                      ? "bg-slate-100 text-slate-600 hover:bg-slate-200" 
                      : "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100"
                  )}
                >
                  <Play size={20} fill="currentColor" />
                  {isCompleted ? t('practiceAgain') : t('start')}
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
