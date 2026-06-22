import React, { useEffect } from 'react';
import { Shield, ArrowRight, Globe, Volume2 } from 'lucide-react';
import { auth, signInWithPopup, googleProvider } from './lib/firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { useVoice } from './hooks/useVoice';

export default function Landing() {
  const navigate = useNavigate();
  const { speak } = useVoice();

  const [error, setError] = React.useState<string | null>(null);

  useEffect(() => {
    speak("Cyber Mitra. Practice digital tasks. Stay safe. No real money is used. Learn in a safe environment.");
  }, []);

  const handleLogin = async (lang: 'en' | 'hi') => {
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      if (result.user) {
        // We'll let the AuthContext handle the profile creation, 
        // but we can store the language preference in localStorage temporarily
        // so AuthContext can pick it up for new users.
        localStorage.setItem('preferred_lang', lang);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Login failed', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("This domain is not authorized in Firebase. Please add 'localhost' and your app URL to the Authorized Domains list in Firebase Console.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Login popup was closed. Please try again.");
      } else {
        setError("Login failed: " + (err.message || "Unknown error"));
      }
    }
  };

  return (
    <div className="min-h-screen bg-paper flex flex-col items-center justify-center p-6 text-center font-sans overflow-hidden relative">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-gold/5 rounded-full -ml-32 -mt-32" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-forest/5 rounded-full -mr-48 -mb-48" />
      
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl relative z-10"
      >
        {error && (
          <div className="mb-10 p-6 bg-terracotta/10 border-4 border-terracotta/20 rounded-3xl text-wood font-bold shadow-lg">
            {error}
          </div>
        )}
        
        <div className="relative mb-12">
          <div className="w-24 h-24 bg-brass rounded-[2rem] flex items-center justify-center text-white mx-auto shadow-2xl border-4 border-white relative z-10">
            <Shield size={48} />
          </div>
          <div className="absolute inset-0 bg-gold/20 blur-3xl rounded-full -z-10 animate-pulse" />
          <button 
            onClick={() => speak("Cyber Mitra. Practice digital tasks. Stay safe. No real money is used. Learn in a safe environment.")}
            className="absolute -right-16 top-1/2 -translate-y-1/2 p-4 text-wood/30 hover:text-brass transition-all bg-white rounded-full shadow-md border-2 border-wood/5"
          >
            <Volume2 size={28} />
          </button>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-bold text-wood mb-8 tracking-tight font-serif">
          Cyber Mitra
        </h1>
        
        <p className="text-2xl md:text-3xl text-wood/70 mb-16 leading-relaxed font-serif italic">
          "Welcome to your Digital Chaupal. A dignified space to master <br className="hidden md:block" />
          the digital world with confidence and security."
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <button
            onClick={() => handleLogin('en')}
            onMouseEnter={() => speak("Start in English")}
            className="premium-button button-forest"
          >
            <Globe size={32} />
            English
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
          
          <button
            onClick={() => handleLogin('hi')}
            onMouseEnter={() => speak("हिंदी में शुरू करें")}
            className="premium-button button-gold"
          >
            🇮🇳 हिंदी (Hindi)
            <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform" />
          </button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-1 bg-wood/10 rounded-full" />
          <p className="text-wood/40 font-bold text-lg uppercase tracking-widest">
            Digital Heritage & Security
          </p>
        </div>
      </motion.div>
    </div>
  );
}
