import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
  Search, 
  Volume2, 
  ArrowRight, 
  ArrowLeft, 
  Eye, 
  Lock, 
  Phone, 
  Users, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Play,
  RotateCcw,
  Maximize2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Data Structure for Media Items
const MEDIA_ITEMS = [
  {
    type: "image",
    real: { 
      src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop", 
      fallback: "https://via.placeholder.com/800x800?text=Real+Human+Face" 
    },
    fake: { 
      src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop", // Stylized as 'fake' for demo
      fallback: "https://via.placeholder.com/800x800?text=AI+Generated+Face" 
    },
    clue: {
      focus_area: "eyes & skin",
      explanation: "Look for natural skin texture and perfectly symmetrical pupils. AI often smoothes skin too much."
    }
  },
  {
    type: "image",
    real: { 
      src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=800&auto=format&fit=crop", 
      fallback: "https://via.placeholder.com/800x800?text=Real+Expression" 
    },
    fake: { 
      src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=800&auto=format&fit=crop", 
      fallback: "https://via.placeholder.com/800x800?text=Deepfake+Face" 
    },
    clue: {
      focus_area: "hair & background",
      explanation: "Check the edges where the hair meets the background. AI struggles with fine strands of hair."
    }
  }
];

export default function DeepfakeLab() {
  const [step, setStep] = useState(0); // -1 for loading, 0 for intro, 1+ for screens
  const [preloaded, setPreloaded] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigate = useNavigate();

  // Preloading System
  useEffect(() => {
    const preloadMedia = async () => {
      setStep(-1); // Show loading screen
      const imagesToPreload = MEDIA_ITEMS.flatMap(item => [item.real.src, item.fake.src]);
      
      const promises = imagesToPreload.map(src => {
        return new Promise((resolve) => {
          const img = new Image();
          img.src = src;
          img.onload = resolve;
          img.onerror = resolve; // Continue even if one fails
        });
      });

      await Promise.all(promises);
      setTimeout(() => {
        setPreloaded(true);
        setStep(0); // Go to Intro
      }, 1500); // Simulate processing time for UX
    };

    preloadMedia();
  }, []);

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => Math.max(0, prev - 1));

  if (step === -1) {
    return (
      <div className="fixed inset-0 bg-wood flex flex-col items-center justify-center z-[200] text-white p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-24 h-24 border-8 border-gold/20 border-t-gold rounded-full mb-8 shadow-2xl"
        />
        <h2 className="text-3xl font-black font-serif tracking-tight">Preparing your Deepfake Lab...</h2>
        <p className="text-gold/60 mt-4 font-bold uppercase tracking-widest text-sm">Initializing Neural Awareness Training</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-khadi z-[150] overflow-y-auto font-sans text-wood">
      <AnimatePresence mode="wait">
        {step === 0 && <ScreenIntro onEnter={nextStep} />}
        {step === 1 && <ScreenImagePractice onNext={nextStep} onPrev={prevStep} />}
        {step === 2 && <ScreenAudioPractice onNext={nextStep} onPrev={prevStep} />}
        {step === 3 && <ScreenPatternInsight onNext={nextStep} onPrev={prevStep} />}
        {step === 4 && <ScreenSafeHabits onNext={nextStep} onPrev={prevStep} />}
        {step === 5 && <ScreenRealLifeScenario onNext={nextStep} onPrev={prevStep} />}
        {step === 6 && <ScreenPostLabTips onNext={nextStep} onPrev={prevStep} />}
        {step === 7 && <ScreenCompletion onReplay={() => setStep(0)} onExit={() => navigate('/dashboard')} />}
      </AnimatePresence>
    </div>
  );
}

// --- SCREEN COMPONENTS ---

function ScreenIntro({ onEnter }: { onEnter: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-b from-wood/80 to-wood" />
        <img 
          src="https://images.unsplash.com/photo-1633539039786-89753c98d66a?q=80&w=1200&auto=format&fit=crop" 
          className="w-full h-full object-cover blur-sm opacity-30"
          alt="Abstract Tech"
        />
      </div>

      <div className="relative z-10 max-w-2xl space-y-12 text-white">
        <div className="w-24 h-24 bg-gold rounded-3xl flex items-center justify-center mx-auto shadow-2xl border-4 border-white/20">
          <Shield size={48} className="text-wood" />
        </div>
        <div className="space-y-6">
          <h1 className="text-5xl md:text-6xl font-black font-serif tracking-tight text-gold">
            Deepfake Recognition Lab
          </h1>
          <p className="text-xl md:text-2xl font-medium leading-relaxed italic opacity-90">
            "Some videos and voices can look completely real. You don’t need to be perfect. Just be careful."
          </p>
        </div>
        <button 
          onClick={onEnter}
          className="premium-button button-gold px-16 py-6 text-2xl shadow-[0_20px_50px_rgba(212,175,55,0.3)] group"
        >
          Enter Lab
          <ArrowRight size={32} className="group-hover:translate-x-2 transition-transform" />
        </button>
      </div>
    </motion.div>
  );
}

function ScreenImagePractice({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const [index, setIndex] = useState(0);
  const [showClue, setShowClue] = useState(false);
  const item = MEDIA_ITEMS[index];

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-6 md:p-12 flex flex-col"
    >
      <header className="flex justify-between items-center mb-10">
        <button onClick={onPrev} className="flex items-center gap-2 text-wood/40 font-bold hover:text-wood">
          <ArrowLeft size={24} /> Back
        </button>
        <div className="text-sm font-black uppercase tracking-[0.3em] text-brass">Step 1: Image Practice</div>
        <div className="w-20" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-3xl font-black text-center mb-10 font-serif">Compare these two photos. One is Real, one is Fake.</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-6xl">
          <div className="space-y-4">
            <div className="relative rounded-[2rem] overflow-hidden border-8 border-white shadow-2xl group cursor-zoom-in">
                <img src={item.real.src} className="w-full aspect-square object-cover" alt="Real image" />
                <div className="absolute top-4 left-4 bg-white/90 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-forest">Original</div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="relative rounded-[2rem] overflow-hidden border-8 border-gold/30 shadow-2xl group cursor-zoom-in">
                <img src={item.fake.src} className="w-full aspect-square object-cover" alt="Fake image" />
                <div className="absolute top-4 left-4 bg-slate-900/90 px-4 py-1 rounded-full text-xs font-black uppercase tracking-widest text-gold">Generated</div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {showClue ? (
            <motion.div 
              initial={{ height: 0, opacity: 0 }} 
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-12 bg-white border-l-8 border-terracotta p-8 rounded-2xl max-w-3xl shadow-xl space-y-4"
            >
              <h3 className="text-xl font-bold flex items-center gap-2 text-terracotta capitalize">
                <Eye size={24} /> Clue: Focus on {item.clue.focus_area}
              </h3>
              <p className="text-lg leading-relaxed">{item.clue.explanation}</p>
            </motion.div>
          ) : (
            <button 
              onClick={() => setShowClue(true)}
              className="mt-12 px-10 py-4 bg-wood/5 border-2 border-wood/10 rounded-2xl font-bold text-wood/60 hover:bg-wood/10 transition-all flex items-center gap-2"
            >
              <Search size={20} /> Highlight the inconsistency
            </button>
          )}
        </AnimatePresence>
      </div>

      <footer className="mt-12 flex justify-center">
        <button onClick={onNext} className="premium-button button-forest px-16 py-5 shadow-xl">
          Continue to Audio
        </button>
      </footer>
    </motion.div>
  );
}

function ScreenAudioPractice({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const [playing, setPlaying] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, x: 100 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -100 }}
      className="min-h-screen p-6 md:p-12 flex flex-col bg-slate-900 text-white"
    >
      <header className="flex justify-between items-center mb-10">
        <button onClick={onPrev} className="flex items-center gap-2 text-white/40 font-bold hover:text-white">
          <ArrowLeft size={24} /> Back
        </button>
        <div className="text-sm font-black uppercase tracking-[0.3em] text-blue-400">Step 2: Audio Analysis</div>
        <div className="w-20" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-center space-y-16">
        <h2 className="text-4xl font-black text-center font-serif text-blue-100 italic">"Listen to the flow of the sentences."</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {[
            { label: "Voice Sample A", type: "Natural" },
            { label: "Voice Sample B", type: "Synthetic" }
          ].map((v, i) => (
            <button 
              key={i}
              onClick={() => setPlaying(i)}
              className={cn(
                "p-10 rounded-[2.5rem] border-4 transition-all flex flex-col items-center gap-6",
                playing === i ? "bg-blue-600 border-white shadow-[0_0_40px_rgba(37,99,235,0.5)]" : "bg-white/5 border-white/20 hover:border-white/40"
              )}
            >
              <div className="w-20 h-20 rounded-full bg-blue-400/20 flex items-center justify-center text-blue-400">
                {playing === i ? <Volume2 size={40} className="animate-pulse" /> : <Play size={40} />}
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold mb-1">{v.label}</div>
                <div className="text-xs font-black uppercase tracking-widest opacity-40">Tap to play</div>
              </div>
              {playing === i && (
                <div className="flex gap-1 h-8 items-center mt-4">
                  {[...Array(12)].map((_, j) => (
                    <motion.div 
                      key={j}
                      animate={{ height: [8, Math.random() * 32 + 8, 8] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: j * 0.1 }}
                      className="w-1.5 bg-blue-400 rounded-full"
                    />
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>

        <div className="bg-white/5 p-8 rounded-3xl border-2 border-white/10 max-w-2xl text-center">
          <p className="text-lg opacity-80 leading-relaxed italic">
            "Notice how Sample B has flat tones and sudden unnatural jumps between words. Real voices have subtle breathing patterns."
          </p>
        </div>
      </div>

      <footer className="mt-12 flex justify-center">
        <button onClick={onNext} className="premium-button bg-blue-500 text-white px-16 py-5 shadow-xl shadow-blue-500/30">
          Continue to Patterns
        </button>
      </footer>
    </motion.div>
  );
}

function ScreenPatternInsight({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="min-h-screen p-6 md:p-12 flex flex-col"
    >
      <header className="flex justify-between items-center mb-10">
        <button onClick={onPrev} className="flex items-center gap-2 text-wood/40 font-bold hover:text-wood">
          <ArrowLeft size={24} /> Back
        </button>
        <div className="text-sm font-black uppercase tracking-[0.3em] text-terracotta">Step 3: Pattern Gallery</div>
        <div className="w-20" />
      </header>

      <div className="flex-1 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-4xl font-black font-serif">Visual Pattern Insight</h2>
          <p className="text-xl text-wood/60 italic">These tiny details often give away a synthetic image.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { title: "The Eyes", img: "https://images.unsplash.com/photo-1541411191165-f184e0af1b9a?q=80&w=400&auto=format&fit=crop", desc: "Look for mismatched reflections or unnatural sharpness in the iris." },
            { title: "The Lips", img: "https://images.unsplash.com/photo-1510127034890-ba27508e9f1c?q=80&w=400&auto=format&fit=crop", desc: "AI often struggles with the way lips move against teeth. Look for 'smudging'." },
            { title: "The Jewelry", img: "https://images.unsplash.com/photo-1515562141521-7a4ce007391b?q=80&w=400&auto=format&fit=crop", desc: "AI frequently misses matching patterns in earrings or necklace symmetry." },
          ].map((p, i) => (
            <div key={i} className="slate-card p-6 space-y-6">
              <div className="aspect-square rounded-2xl overflow-hidden shadow-inner flex items-center justify-center bg-paper">
                <img src={p.img} className="w-full h-full object-cover grayscale opacity-80" alt={p.title} />
              </div>
              <div>
                <h4 className="text-2xl font-bold mb-2">{p.title}</h4>
                <p className="text-wood/60 leading-relaxed italic">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <footer className="mt-12 flex justify-center">
        <button onClick={onNext} className="premium-button button-gold px-16 py-5">
          See Safe Habits
        </button>
      </footer>
    </motion.div>
  );
}

function ScreenSafeHabits({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen p-6 md:p-12 flex flex-col items-center justify-center bg-paper shadow-inner"
    >
      <div className="max-w-4xl space-y-12">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-forest text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white">
            <CheckCircle size={40} />
          </div>
          <h2 className="text-5xl font-black font-serif tracking-tight">Vigilance Over Perfection</h2>
          <p className="text-xl text-wood/60 italic leading-relaxed">"You don't need to prove something is fake. You only need to protect yourself."</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { icon: <Clock size={32} />, title: "Pause Always", desc: "Fake media always creates artificial urgency. Take 5 minutes before acting." },
            { icon: <Phone size={32} />, title: "Call Direct", desc: "If a loved one sends an unusual video/audio, call their known number separately." },
            { icon: <Users size={32} />, title: "Ask Someone", desc: "Two pairs of eyes are better than one. Show the media to a trusted person." },
            { icon: <Lock size={32} />, title: "No Sharing", desc: "Do not forward if you feel even 1% unsure. Breaking the chain stops the threat." },
          ].map((h, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border-4 border-wood/5 flex gap-6 items-start shadow-sm">
              <div className="text-brass shrink-0 mt-1">{h.icon}</div>
              <div>
                <h4 className="text-2xl font-bold mb-2">{h.title}</h4>
                <p className="text-wood/60 leading-relaxed font-medium">{h.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-center pt-8">
          <button onClick={onNext} className="premium-button button-gold px-20">
            Final Scenario
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function ScreenRealLifeScenario({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  const [choice, setChoice] = useState<number | null>(null);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="min-h-screen p-6 md:p-12 flex flex-col"
    >
      <div className="max-w-4xl mx-auto flex-1 flex flex-col justify-center space-y-12">
        <div className="slate-card p-10 bg-wood text-white border-gold/20 flex flex-col md:flex-row gap-10 items-center">
            <div className="w-40 h-40 bg-white/10 rounded-full flex items-center justify-center relative shrink-0">
                <Phone size={80} className="text-gold animate-bounce" />
                <div className="absolute inset-0 border-4 border-gold/20 rounded-full animate-ping" />
            </div>
            <div className="space-y-4">
                <h3 className="text-3xl font-bold font-serif italic tracking-tight">The "Urgent Request"</h3>
                <p className="text-xl text-white/80 leading-relaxed font-medium">
                    You receive a video call from a relative who looks correct but sounds slightly robotic. They say they've lost their wallet and need ₹10,000 sent to a UPI ID right now.
                </p>
            </div>
        </div>

        <div className="space-y-6">
            <h4 className="text-2xl font-black text-center mb-8 uppercase tracking-widest text-wood/40">What is your first action?</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <button 
                  onClick={() => setChoice(1)}
                  className={cn(
                    "p-8 rounded-[2rem] border-4 text-left transition-all text-xl font-bold",
                    choice === 1 ? "bg-terracotta border-white text-white shadow-xl scale-95" : "bg-white border-wood/10 text-wood hover:border-brass/40"
                  )}
                >
                    Send the money immediately since it's an emergency.
                </button>
                <button 
                   onClick={() => setChoice(2)}
                   className={cn(
                    "p-8 rounded-[2rem] border-4 text-left transition-all text-xl font-bold",
                    choice === 2 ? "bg-forest border-white text-white shadow-xl scale-95" : "bg-white border-wood/10 text-wood hover:border-brass/40"
                  )}
                >
                    Hang up and call them back on their saved mobile number.
                </button>
            </div>
        </div>

        <AnimatePresence>
            {choice && (
                <motion.div 
                   initial={{ opacity: 0, height: 0 }} 
                   animate={{ opacity: 1, height: 'auto' }} 
                   className={cn(
                        "p-8 rounded-[2rem] border-l-[12px] flex items-start gap-6 shadow-2xl",
                        choice === 2 ? "bg-forest/10 border-forest" : "bg-terracotta/10 border-terracotta"
                   )}
                >
                    <div className={cn("mt-1", choice === 2 ? "text-forest" : "text-terracotta")}>
                        {choice === 2 ? <CheckCircle size={40} /> : <AlertTriangle size={40} />}
                    </div>
                    <div>
                        <h5 className="text-2xl font-black mb-2">{choice === 2 ? "Perfect Awareness!" : "High Risk Action!"}</h5>
                        <p className="text-lg leading-relaxed font-serif italic text-wood/80">
                            {choice === 2 
                                ? "Calling back on a trusted, saved number is the ONLY way to verify their identity. Never trust the contact that called you first."
                                : "Sending money based on a video/audio request is extremely dangerous today. Always break the loop and verify through a separate call."}
                        </p>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="flex justify-center pt-10">
            <button onClick={onNext} className="premium-button button-gold px-20 shadow-2xl">
                Get Final Safety Strategies
            </button>
        </div>
      </div>
    </motion.div>
  );
}

function ScreenPostLabTips({ onNext, onPrev }: { onNext: () => void, onPrev: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      className="min-h-screen p-6 md:p-12 flex flex-col bg-white"
    >
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center space-y-4">
            <div className="w-20 h-20 bg-brass rounded-3xl flex items-center justify-center text-white mx-auto shadow-xl border-4 border-white">
                <Lock size={40} />
            </div>
            <h2 className="text-4xl md:text-5xl font-black font-serif tracking-tight text-wood">Protection Strategies</h2>
            <p className="text-xl text-wood/50 italic">"Practical habits for the real world outside this app."</p>
        </header>

        <section className="space-y-6">
            <h3 className="text-2xl font-black text-brass uppercase tracking-widest flex items-center gap-3">
                <Volume2 size={24} /> How to stay safe from voice scams
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-khadi/50 p-8 rounded-[2.5rem] border-2 border-brass/10 hover:border-brass/30 transition-all shadow-sm">
                    <h4 className="text-xl font-black text-wood mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-forest" /> 🔐 Safe Word Tip
                    </h4>
                    <p className="text-lg leading-relaxed text-wood/70 font-medium">
                        Create a unique family safe word. If someone calls asking for money, ask them for the word. If they can't say it, it's likely a scam.
                    </p>
                </div>
                <div className="bg-khadi/50 p-8 rounded-[2.5rem] border-2 border-brass/10 hover:border-brass/30 transition-all shadow-sm">
                    <h4 className="text-xl font-black text-wood mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-forest" /> 📞 Call-Back Rule
                    </h4>
                    <p className="text-lg leading-relaxed text-wood/70 font-medium">
                        Always call back the person using a trusted number stored in your phone. Never trust the caller ID of an incoming request.
                    </p>
                </div>
                <div className="bg-khadi/50 p-8 rounded-[2.5rem] border-2 border-brass/10 hover:border-brass/30 transition-all shadow-sm">
                    <h4 className="text-xl font-black text-wood mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-forest" /> ⏳ Delay Strategy
                    </h4>
                    <p className="text-lg leading-relaxed text-wood/70 font-medium">
                        Scammers rely on panic. "Slow is smooth, and smooth is safe." Take a breath and wait 5 minutes before making any decision.
                    </p>
                </div>
                <div className="bg-khadi/50 p-8 rounded-[2.5rem] border-2 border-brass/10 hover:border-brass/30 transition-all shadow-sm">
                    <h4 className="text-xl font-black text-wood mb-3 flex items-center gap-2">
                        <CheckCircle size={20} className="text-forest" /> 👥 Family Verification
                    </h4>
                    <p className="text-lg leading-relaxed text-wood/70 font-medium">
                        Always inform another trusted family member before sending any money. They may notice a red flag that you missed in the panic.
                    </p>
                </div>
            </div>
        </section>

        <section className="bg-wood text-white p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gold opacity-30" />
            <h3 className="text-2xl font-black text-gold mb-6 italic font-serif tracking-tight">Important things to remember</h3>
            <div className="space-y-6 text-xl leading-relaxed">
                <p className="flex items-start gap-4">
                    <span className="text-gold font-bold">●</span>
                    "Even experts cannot always detect deepfakes. Being careful matters more than being perfect."
                </p>
                <p className="flex items-start gap-4">
                    <span className="text-gold font-bold">●</span>
                    "If something feels unusual, treat it as a warning sign. Trust your gut over your eyes."
                </p>
                <p className="flex items-start gap-4">
                    <span className="text-gold font-bold">●</span>
                    "You do not need to prove it is fake. You only need to verify through a separate channel before acting."
                </p>
            </div>
            
            <div className="mt-10 pt-10 border-t border-white/10 text-white/50 text-sm font-bold uppercase tracking-[0.2em] text-center">
                ⚠️ This is informational guidance only and not part of the lab testing.
            </div>
        </section>

        <div className="flex justify-center pt-8">
            <button onClick={onNext} className="premium-button button-gold px-20 shadow-2xl">
                Complete Lab
            </button>
        </div>
      </div>
    </motion.div>
  );
}

function ScreenCompletion({ onReplay, onExit }: { onReplay: () => void, onExit: () => void }) {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-forest text-white"
    >
      <div className="max-w-2xl space-y-12">
        <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-10 shadow-3xl border-8 border-white animate-bounce">
            <CheckCircle size={64} />
        </div>
        
        <div className="space-y-6">
            <h1 className="text-6xl font-black font-serif tracking-tight">You are becoming more aware.</h1>
            <p className="text-2xl font-medium leading-relaxed italic opacity-80">
                "Being careful matters more than being perfect."
            </p>
        </div>

        <div className="flex flex-col md:flex-row gap-6 pt-10">
            <button 
                onClick={onReplay}
                className="premium-button bg-white/10 text-white border-2 border-white/30 px-12 py-5 hover:bg-white/20"
            >
                <RotateCcw size={24} /> Replay Lab
            </button>
            <button 
                onClick={onExit}
                className="premium-button bg-white text-forest px-12 py-5 shadow-2xl shadow-black/20"
            >
                Back to Dashboard
            </button>
        </div>
      </div>
    </motion.div>
  );
}
