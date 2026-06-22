import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';
import { motion } from 'motion/react';
import { ShieldCheck, ShieldAlert, Trophy, ChevronRight, Volume2, ArrowRight, Lock, Scroll, Bell, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useVoice } from './hooks/useVoice';

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Dashboard() {
  const { profile, t } = useAuth();
  const { speak } = useVoice();

  useEffect(() => {
    if (profile) {
      speak(`${t('welcome', { name: profile.name })}`);
    }
  }, []);

  if (!profile) return null;

  const completedCount = Object.values(profile.progress).filter(s => s === 'completed').length;

  return (
    <div className="space-y-8 md:space-y-12">
      {/* High-Contrast Mobile Header / Status Bar */}
      <div className="md:hidden bg-forest text-white p-6 rounded-2xl shadow-lg border-4 border-white/20 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md">
            <ShieldCheck size={28} />
          </div>
          <div>
            <h2 className="text-xl font-bold leading-tight">Device Protected</h2>
            <p className="text-xs text-white/70 uppercase tracking-widest font-bold">Namaste {profile.name}</p>
          </div>
        </div>
        <div className="text-right">
          <span className="block text-2xl font-bold">{profile.totalPoints}</span>
          <span className="text-[10px] uppercase tracking-widest opacity-60 font-bold">Points</span>
        </div>
      </div>

      {/* Dignified Security Header (Desktop) */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="hidden md:block relative overflow-hidden rounded-[2rem] shadow-xl border-4 border-white"
      >
        <div className="absolute inset-0 bg-forest opacity-90" />
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M30 0l30 30-30 30-30-30z\' fill=\'%23ffffff\' fill-rule=\'evenodd\'/%3E%3C/svg%3E")' }} />
        
        <div className="relative z-10 p-10 flex flex-col md:flex-row items-center justify-between gap-8 text-white">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-md border-2 border-white/30">
              <ShieldCheck size={48} />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2 tracking-tight">
                {t('welcome', { name: profile.name })}
              </h1>
              <p className="text-xl text-white/80 font-serif italic">
                Your digital safety journey is progressing well.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm">
              <span className="block text-xs uppercase tracking-widest opacity-60 mb-1">Total Points</span>
              <span className="text-2xl font-bold">{profile.totalPoints}</span>
            </div>
            <div className="bg-white/10 px-6 py-3 rounded-xl border border-white/20 backdrop-blur-sm">
              <span className="block text-xs uppercase tracking-widest opacity-60 mb-1">Badges</span>
              <span className="text-2xl font-bold">{profile.badges.length}/5</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Daily Tip - Framed Notice Board */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-khadi border-[8px] md:border-[12px] border-wood rounded-[1rem] p-6 md:p-10 shadow-2xl relative"
      >
        <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-wood text-gold px-6 md:px-8 py-2 rounded-full font-bold uppercase tracking-[0.2em] text-[10px] md:text-sm border-2 border-gold/30 whitespace-nowrap">
          Daily Security Notice
        </div>
        
        <div className="flex flex-col md:flex-row items-start gap-6 md:gap-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-terracotta rounded-xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
            <Bell size={32} />
          </div>
          <div className="flex-1">
            <h3 className="text-wood font-bold text-xl md:text-2xl mb-3 md:mb-4 font-serif">{t('warningTitle')}</h3>
            <p className="text-wood/80 text-lg md:text-xl leading-relaxed font-medium">
              {t('warningText')}
            </p>
            <Link to="/help" className="text-terracotta font-bold text-lg mt-4 md:mt-6 inline-flex items-center gap-2 hover:underline group">
              {t('learnMore')}
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          <button 
            onClick={() => speak(`${t('warningTitle')}. ${t('warningText')}`)}
            className="p-4 text-brass hover:text-wood transition-colors bg-white/50 rounded-2xl border-2 border-wood/10 self-end md:self-start"
          >
            <Volume2 size={28} />
          </button>
        </div>
      </motion.div>

      {/* Special Feature: KBC Quiz - Slate Card Style */}
      <motion.div
        whileHover={{ scale: 1.01 }}
        className="slate-card p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-10 bg-wood text-white border-gold/20 min-h-[300px] md:min-h-0"
      >
        <div className="space-y-4 md:space-y-6 text-center md:text-left">
          <div className="inline-flex items-center gap-3 bg-gold text-wood px-6 py-2 rounded-full text-sm font-black uppercase tracking-widest">
            <Trophy size={18} />
            {t('kbcTitle')}
          </div>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight">{t('kbcTitle')}</h2>
          <p className="text-white/70 text-lg md:text-xl max-w-lg font-serif italic">
            {t('kbcDesc')}
          </p>
          <Link
            to="/quiz"
            className="premium-button button-gold w-full md:w-auto"
          >
            Enter Quiz
            <ArrowRight size={24} />
          </Link>
        </div>
        <div className="text-[8rem] md:text-[10rem] drop-shadow-2xl opacity-20">💰</div>
      </motion.div>

      {/* Awareness Lab Section - Standalone */}
      <div className="space-y-6 md:space-y-8 bg-khadi/50 p-6 md:p-10 rounded-[2.5rem] border-4 border-wood/10 shadow-inner">
        <div className="flex items-center gap-4 px-4">
          <div className="w-4 h-8 bg-terracotta rounded-full" />
          <h2 className="text-2xl md:text-3xl font-black text-wood tracking-tight">
            Advanced Awareness Lab
          </h2>
        </div>
        
        <Link to="/awareness-lab" className="group block">
          <motion.div
            whileHover={{ y: -5 }}
            className="slate-card p-8 md:p-10 bg-white border-brass/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-brass/5 rounded-full -mr-16 -mt-16" />
            
            <div className="flex flex-col md:flex-row items-center gap-8 relative z-10 text-center md:text-left">
              <div className="w-20 h-20 bg-brass rounded-2xl flex items-center justify-center text-white shadow-xl shadow-brass/20 border-4 border-white/20 shrink-0">
                <Search size={40} />
              </div>
              <div>
                <h4 className="font-bold text-3xl text-wood group-hover:text-terracotta transition-colors mb-2">Deepfake Recognition Lab</h4>
                <p className="text-lg text-wood/50 font-serif italic">Can you spot what feels off in synthetic media?</p>
              </div>
            </div>

            <div className="premium-button button-gold px-12 py-5 shadow-xl shadow-gold/20 relative z-10 w-full md:w-auto">
              Enter Lab
              <ArrowRight size={24} />
            </div>
          </motion.div>
        </Link>
      </div>

      {/* Learning Journey - The Library Shelf */}
      <div className="space-y-6 md:space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-4">
          <h2 className="text-2xl md:text-3xl font-bold text-wood flex items-center gap-4">
            <Scroll className="text-brass" size={32} />
            {t('learningJourney')}
          </h2>
          <div className="flex items-center gap-4">
            <span className="text-wood/40 font-bold text-lg">{completedCount}/5 {t('completed')}</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { id: 'block1', title: 'Bank Call & OTP Safety', icon: <Lock />, status: profile.progress.block1, label: 'Safety Module 1' },
            { id: 'block2', title: 'UPI & Payment Scams', icon: <Scroll />, status: profile.progress.block2, label: 'Safety Module 2' },
            { id: 'block3', title: 'Fake Police & Digital Arrest', icon: <ShieldCheck />, status: profile.progress.block3, label: 'Safety Module 3' },
            { id: 'block4', title: 'Fake KYC & Aadhaar Cloning', icon: <Lock />, status: profile.progress.block4, label: 'Safety Module 4' },
            { id: 'block5', title: 'Investment & Lottery Frauds', icon: <Trophy />, status: profile.progress.block5, label: 'Safety Module 5' },
          ].map((block) => (
            <Link 
              key={block.id} 
              to={`/learn/${block.id}`}
              className="group"
            >
              <motion.div
                whileHover={{ y: -5 }}
                className={cn(
                  "slate-card p-6 md:p-8 flex items-center gap-6 md:gap-8 min-h-[160px] md:min-h-0",
                  block.status === 'completed' ? "bg-forest/5 border-forest/20" : "bg-white"
                )}
              >
                <div className={cn(
                  "w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-inner border-2 transition-colors",
                  block.status === 'completed' ? "bg-forest text-white border-white/20" : "bg-paper border-wood/10 text-brass group-hover:bg-gold/10"
                )}>
                  {block.status === 'completed' ? '✓' : block.icon}
                </div>
                <div className="flex-1">
                  <span className="text-xs font-bold text-wood/30 uppercase tracking-widest">{block.label}</span>
                  <h4 className="font-bold text-2xl text-wood group-hover:text-terracotta transition-colors">{block.title}</h4>
                  <p className={cn(
                    "text-sm font-bold mt-2",
                    block.status === 'completed' ? "text-forest" : "text-wood/40"
                  )}>
                    {block.status === 'completed' ? t('completed') : t('upNext')}
                  </p>
                </div>
                <ChevronRight className="text-wood/20 group-hover:text-terracotta transition-colors" size={28} />
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
