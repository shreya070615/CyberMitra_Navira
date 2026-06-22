import React from 'react';
import { useAuth } from './AuthContext';
import { motion } from 'motion/react';
import { Globe, Volume2, Shield, LogOut, User } from 'lucide-react';
import { auth, signOut } from './lib/firebase';
import { useNavigate } from 'react-router-dom';
import { useVoice } from './hooks/useVoice';

export default function SettingsPage() {
  const { profile, setLanguage, setVoiceEnabled, t } = useAuth();
  const { speak } = useVoice();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  if (!profile) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-black text-slate-900 mb-2">{t('settings')}</h1>
          <p className="text-slate-600 text-lg">Manage your preferences and account</p>
        </div>
        <button 
          onClick={() => speak(`${t('settings')}. Manage your preferences and account.`)}
          className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Volume2 size={24} />
        </button>
      </header>

      <div className="space-y-6">
        {/* Language Selection */}
        <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-blue-600">
              <Globe size={28} />
              <h3 className="text-2xl font-black">{t('language')}</h3>
            </div>
            <button 
              onClick={() => speak(t('language'))}
              className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => {
                setLanguage('en');
                speak("Language set to English");
              }}
              className={cn(
                "p-6 rounded-2xl border-2 font-bold text-xl transition-all",
                profile.language === 'en' 
                  ? "border-blue-600 bg-blue-50 text-blue-600" 
                  : "border-slate-100 hover:border-blue-200"
              )}
            >
              English
            </button>
            <button
              onClick={() => {
                setLanguage('hi');
                speak("भाषा हिंदी में सेट की गई");
              }}
              className={cn(
                "p-6 rounded-2xl border-2 font-bold text-xl transition-all",
                profile.language === 'hi' 
                  ? "border-blue-600 bg-blue-50 text-blue-600" 
                  : "border-slate-100 hover:border-blue-200"
              )}
            >
              हिंदी (Hindi)
            </button>
          </div>
        </section>

        {/* Audio Settings */}
        <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-purple-600">
              <Volume2 size={28} />
              <h3 className="text-2xl font-black">{t('audio')}</h3>
            </div>
            <button 
              onClick={() => speak(t('audio'))}
              className="p-2 text-slate-300 hover:text-purple-600 transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <div className="flex items-center justify-between p-6 bg-slate-50 rounded-2xl">
            <div>
              <h4 className="font-bold text-slate-900 text-lg">{t('voiceOver')}</h4>
              <p className="text-slate-500">{t('voiceOverDesc')}</p>
            </div>
            <button
              onClick={() => {
                const newState = !profile.voiceEnabled;
                setVoiceEnabled(newState);
                speak(newState ? "Voice over enabled" : "Voice over disabled");
              }}
              className={cn(
                "w-16 h-8 rounded-full relative transition-colors",
                profile.voiceEnabled ? "bg-blue-600" : "bg-slate-300"
              )}
            >
              <motion.div
                animate={{ x: profile.voiceEnabled ? 32 : 4 }}
                className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-sm"
              />
            </button>
          </div>
        </section>

        {/* Account */}
        <section className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-slate-900">
              <User size={28} />
              <h3 className="text-2xl font-black">{t('account')}</h3>
            </div>
            <button 
              onClick={() => speak(t('account'))}
              className="p-2 text-slate-300 hover:text-slate-900 transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-black text-xl">
                {profile.name[0]}
              </div>
              <div>
                <p className="font-bold text-slate-900">{profile.name}</p>
                <p className="text-slate-500 text-sm">{profile.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 p-4 text-red-600 font-bold hover:bg-red-50 rounded-2xl transition-colors"
            >
              <LogOut size={20} />
              {t('logout')}
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
