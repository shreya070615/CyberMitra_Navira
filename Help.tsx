import React, { useEffect } from 'react';
import { Phone, ExternalLink, ShieldAlert, AlertCircle, HelpCircle, Volume2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useVoice } from './hooks/useVoice';
import { useAuth } from './AuthContext';

export default function Help() {
  const { speak } = useVoice();
  const { profile, t } = useAuth();

  useEffect(() => {
    speak(`${t('help')}. ${t('emergencyTitle')} and what to do if you've been scammed.`);
  }, []);

  return (
    <div className="space-y-8 pb-12">
      <header className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-wood mb-2 tracking-tight">{t('help')}</h1>
          <p className="text-wood/60 text-lg font-serif italic">{t('emergencyTitle')} and what to do if you've been scammed</p>
        </div>
        <button 
          onClick={() => speak(`${t('help')}. ${t('emergencyTitle')} and what to do if you've been scammed.`)}
          className="p-3 bg-white border-2 border-wood/10 rounded-2xl text-brass hover:bg-gold/10 transition-colors"
        >
          <Volume2 size={24} />
        </button>
      </header>

      {/* Emergency Contact - Massive for Mobile */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-terracotta text-white p-8 md:p-12 rounded-[2rem] shadow-2xl flex flex-col items-center text-center space-y-8 relative border-4 border-white/20"
      >
        <button 
          onClick={() => speak(`${t('emergencyTitle')}. Call 1930 immediately.`)}
          className="absolute top-6 right-6 p-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors"
        >
          <Volume2 size={24} />
        </button>
        <div className="w-24 h-24 bg-white/20 rounded-3xl flex items-center justify-center backdrop-blur-md border-2 border-white/30">
          <ShieldAlert size={56} />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-black mb-2 uppercase tracking-widest">{t('emergencyTitle')}</h2>
          <div className="text-7xl md:text-8xl font-black mb-4 tracking-tighter drop-shadow-lg">1930</div>
          <p className="text-white/80 text-xl max-w-md mx-auto font-serif italic">
            {t('helpline')}. If you've been scammed, call this number immediately.
          </p>
        </div>
        <a
          href="tel:1930"
          className="bg-white text-terracotta w-full md:w-auto px-16 py-6 rounded-2xl font-black text-3xl hover:bg-paper transition-all shadow-xl active:scale-95 active:shadow-inner flex items-center justify-center gap-4"
        >
          <Phone size={32} />
          {t('tapToCall')}
        </a>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* What to do */}
        <section className="slate-card p-8 space-y-6">
          <div className="flex items-center justify-between text-terracotta">
            <div className="flex items-center gap-3">
              <AlertCircle size={32} />
              <h3 className="text-2xl font-bold font-serif">{t('scammedTitle')}</h3>
            </div>
            <button 
              onClick={() => speak(`${t('scammedTitle')}. Steps to take: Call 1930, Block Cards, Change Passwords, Report Online.`)}
              className="p-2 text-wood/30 hover:text-terracotta transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>
          
          <div className="space-y-6">
            {[
              { title: 'Call 1930', desc: t('helpline') },
              { title: 'Block Cards', desc: 'Call your bank immediately to freeze accounts' },
              { title: 'Change Passwords', desc: 'Update all your online account passwords' },
              { title: 'Report Online', desc: 'File a complaint at cybercrime.gov.in' },
            ].map((step, i) => (
              <div key={i} className="flex gap-5">
                <div className="w-10 h-10 bg-khadi border-2 border-wood/10 rounded-full flex items-center justify-center text-wood font-black shrink-0 shadow-sm">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-xl text-wood">{step.title}</h4>
                  <p className="text-wood/50 font-serif italic leading-snug">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Useful Links */}
        <section className="slate-card p-8 space-y-6">
          <div className="flex items-center justify-between text-forest">
            <div className="flex items-center gap-3">
              <HelpCircle size={32} />
              <h3 className="text-2xl font-bold font-serif">{t('usefulLinks')}</h3>
            </div>
            <button 
              onClick={() => speak(t('usefulLinks'))}
              className="p-2 text-wood/30 hover:text-forest transition-colors"
            >
              <Volume2 size={20} />
            </button>
          </div>

          <div className="space-y-4">
            {[
              { name: 'National Cyber Crime Portal', url: 'https://cybercrime.gov.in' },
              { name: 'UIDAI Official (Aadhaar)', url: 'https://uidai.gov.in' },
              { name: 'RBI Consumer Awareness', url: 'https://rbi.org.in' },
              { name: 'Check Local Cyber Cells', url: 'https://cybercrime.gov.in/Webform/Crime_Cells.aspx' },
            ].map((link, i) => (
              <a
                key={i}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-5 bg-paper rounded-2xl border-2 border-wood/5 hover:border-forest/20 hover:bg-forest/5 transition-all group"
              >
                <span className="font-bold text-wood group-hover:text-forest">{link.name}</span>
                <ExternalLink size={18} className="text-wood/20 group-hover:text-forest" />
              </a>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
