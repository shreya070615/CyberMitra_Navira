import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, AlertTriangle, ArrowLeft, Volume2, Video, PhoneOff, Lock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useVoice } from './hooks/useVoice';
import { db, doc, updateDoc, increment } from './lib/firebase';

export default function Block3() {
  const [step, setStep] = useState(-1);
  const [result, setResult] = useState<'success' | 'scam' | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: 'real' | 'fake'}>({});
  const [quizFeedback, setQuizFeedback] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();
  const { profile, t } = useAuth();
  const { speak } = useVoice();

  const quizItems = [
    { id: '1', text: 'Police calls you about investigation and asks for money', type: 'fake', reason: 'Real police never call asking for money or transfers for any investigation.' },
    { id: '2', text: 'You call police station yourself to report a crime', type: 'real', reason: 'Always contact police directly through official channels when you need help.' },
    { id: '3', text: 'Government official visits your home for verification', type: 'real', reason: 'Legitimate officials conduct verifications in person with proper identification.' },
    { id: '4', text: 'Someone threatens arrest unless you pay immediately', type: 'fake', reason: 'No government agency threatens immediate arrest or demands payment over phone.' }
  ];

  useEffect(() => {
    speak("Block 3: Fake Police and Digital Arrest. You receive an audio call from someone claiming to be a CBI officer saying your Aadhaar was used in money laundering.");
  }, []);

  const completeBlock = async () => {
    if (profile) {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        totalPoints: increment(100),
        'progress.block3': 'completed',
        'progress.block4': 'in-progress',
        badges: Array.from(new Set([...profile.badges, 'police-safe']))
      });

      // Update public leaderboard
      const publicRef = doc(db, 'users_public', profile.uid);
      await updateDoc(publicRef, {
        totalPoints: increment(100),
        updatedAt: new Date().toISOString()
      });

      navigate('/learn');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <button onClick={() => navigate('/learn')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors">
        <ArrowLeft size={20} />
        Back to Learn
      </button>

      <div className="bg-slate-900 rounded-[3rem] border-4 border-slate-800 shadow-2xl overflow-hidden aspect-[9/16] relative max-h-[800px] mx-auto">
        {!result && step === 0 && (
          <div className="absolute inset-0 bg-white p-6 space-y-6 overflow-y-auto">
            <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-100">
              <div className="flex items-center gap-3 text-green-600 mb-2">
                <ShieldCheck size={24} />
                <span className="font-black">Instructions</span>
              </div>
              <p className="text-slate-800 font-bold text-lg">
                1. You'll receive an audio call claiming to be from CBI<br/>
                2. They will threaten 'Digital Arrest' for money laundering<br/>
                3. Real police never call about investigations or ask for money<br/>
                4. Use voice guidance if needed
              </p>
            </div>
            <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
              <div className="flex items-center gap-3 text-blue-600 mb-2">
                <AlertTriangle size={24} />
                <span className="font-black">Scenario</span>
              </div>
              <p className="text-slate-800 font-bold text-lg">
                You receive an audio call from someone claiming to be a CBI officer. They say your Aadhaar was found in a package with illegal drugs and you're under 'Digital Arrest'.
              </p>
            </div>
            <button
              onClick={() => setStep(0)}
              className="w-full bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
            >
              Start Simulation
            </button>
          </div>
        )}

        {(!result && step !== 0) || result ? (
          <>
            {step === 0 && (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center space-y-12">
                <div className="space-y-4">
                  <div className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center mx-auto animate-pulse">
                    <Volume2 size={48} className="text-white" />
                  </div>
                  <h3 className="text-white text-3xl font-black">Incoming Audio Call</h3>
                  <p className="text-green-400 font-bold text-xl">CBI Officer - Mumbai</p>
                </div>
                <div className="flex gap-8">
                  <button
                    onClick={() => {
                      speak("Correct! Real police or CBI never make audio calls to investigate or 'arrest' people digitally.");
                      setResult('success');
                    }}
                    className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-all"
                  >
                    <PhoneOff size={32} />
                  </button>
                  <button
                    onClick={() => setStep(1)}
                    className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white hover:bg-green-600 transition-all"
                  >
                    <Volume2 size={32} />
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="absolute inset-0 flex flex-col">
                {/* Mock Audio Call */}
                <div className="flex-1 bg-slate-800 relative flex items-center justify-center">
                  <div className="text-center space-y-4 p-8">
                    <div className="w-32 h-32 bg-slate-700 rounded-full mx-auto flex items-center justify-center">
                      <Volume2 size={64} className="text-slate-400" />
                    </div>
                    <p className="text-white font-bold text-lg italic">
                      "Listen carefully. Your Aadhaar card was found in a package containing illegal drugs. You are under 'Digital Arrest'. Do not hang up or talk to anyone, or we will send a team to your house."
                    </p>
                  </div>
                </div>
                <div className="bg-slate-900/90 backdrop-blur-md p-8 space-y-4">
                  <button
                    onClick={() => {
                      speak("The scammer is asking for money to 'clear your name'. This is a scam.");
                      setStep(2);
                    }}
                    className="w-full bg-green-600 text-white py-4 rounded-2xl font-black hover:bg-green-700 transition-all"
                  >
                    Ask how to clear my name
                  </button>
                  <button
                    onClick={() => {
                      speak("Good choice! Hanging up is the right thing to do.");
                      setResult('success');
                    }}
                    className="w-full bg-red-500 text-white py-4 rounded-2xl font-black hover:bg-red-600 transition-all"
                  >
                    Hang Up & Call 1930
                  </button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="absolute inset-0 bg-slate-900 flex flex-col items-center justify-center p-8 text-center space-y-8">
                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center text-red-600">
                  <Lock size={40} />
                </div>
                <p className="text-white text-xl font-bold">
                  "To verify your bank accounts are not linked to money laundering, transfer ₹50,000 to this 'Government Security Account'. It will be refunded after verification."
                </p>
                <div className="w-full space-y-4">
                  <button
                    onClick={() => {
                      setResult('scam');
                      speak("Scammed! You transferred money to a criminal. Real police never ask for money transfers over calls.");
                      setTimeout(() => setShowQuiz(true), 2000);
                    }}
                    className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xl"
                  >
                    Transfer Money
                  </button>
                  <button
                    onClick={() => {
                      setResult('success');
                      speak("Excellent! You realized this was a scam. No government agency asks for money transfers for 'verification'.");
                      setTimeout(() => setShowQuiz(true), 2000);
                    }}
                    className="w-full bg-slate-800 text-white py-5 rounded-2xl font-black text-xl"
                  >
                    Refuse & Report
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="absolute inset-0 bg-white flex flex-col items-center justify-center p-8 text-center space-y-6">
            {!showQuiz ? (
              <>
                <div className={cn(
                  "w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4",
                  result === 'success' ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                )}>
                  {result === 'success' ? <ShieldCheck size={64} /> : <AlertTriangle size={64} />}
                </div>
                <h2 className="text-3xl font-black text-slate-900">
                  {result === 'success' ? "You're Safe!" : "Scammed!"}
                </h2>
                <p className="text-slate-600 text-lg font-medium">
                  {result === 'success' 
                    ? "You correctly identified the 'Digital Arrest' scam. Remember: Real police will NEVER investigate you via audio call or ask for money."
                    : "You fell for the pressure. Digital Arrest is 100% fake. Never stay on a call with someone threatening you like this."}
                </p>
              </>
            ) : (
              <div className="w-full space-y-6">
                <h2 className="text-2xl font-black text-slate-900">Quick Quiz</h2>
                <p className="text-slate-600">Classify each scenario as Real or Fake</p>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 text-center">
                      <div className="text-green-600 font-black text-lg">REAL</div>
                      <div className="min-h-[120px] space-y-2">
                        {quizItems.filter(item => quizAnswers[item.id] === 'real').map(item => (
                          <div key={item.id} className="bg-white p-2 rounded-lg text-sm font-medium">
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-4 text-center">
                      <div className="text-red-600 font-black text-lg">FAKE</div>
                      <div className="min-h-[120px] space-y-2">
                        {quizItems.filter(item => quizAnswers[item.id] === 'fake').map(item => (
                          <div key={item.id} className="bg-white p-2 rounded-lg text-sm font-medium">
                            {item.text}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {quizItems.filter(item => !quizAnswers[item.id]).map(item => (
                      <div key={item.id} className="bg-slate-50 p-3 rounded-lg flex justify-between items-center">
                        <span className="text-sm font-medium">{item.text}</span>
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setQuizAnswers(prev => ({ ...prev, [item.id]: 'real' }));
                              if (item.type === 'real') {
                                setQuizFeedback(prev => ({ ...prev, [item.id]: `✅ Correct! ${item.reason}` }));
                              } else {
                                setQuizFeedback(prev => ({ ...prev, [item.id]: `❌ Wrong! ${item.reason}` }));
                              }
                            }}
                            className="bg-green-500 text-white px-3 py-1 rounded text-sm font-bold"
                          >
                            Real
                          </button>
                          <button
                            onClick={() => {
                              setQuizAnswers(prev => ({ ...prev, [item.id]: 'fake' }));
                              if (item.type === 'fake') {
                                setQuizFeedback(prev => ({ ...prev, [item.id]: `✅ Correct! ${item.reason}` }));
                              } else {
                                setQuizFeedback(prev => ({ ...prev, [item.id]: `❌ Wrong! ${item.reason}` }));
                              }
                            }}
                            className="bg-red-500 text-white px-3 py-1 rounded text-sm font-bold"
                          >
                            Fake
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {Object.keys(quizFeedback).length > 0 && (
                    <div className="bg-blue-50 p-4 rounded-2xl space-y-2">
                      {Object.entries(quizFeedback).map(([id, feedback]) => (
                        <p key={id} className="text-blue-800 text-sm font-medium">{feedback}</p>
                      ))}
                    </div>
                  )}

                  {Object.keys(quizAnswers).length === quizItems.length && (
                    <button
                      onClick={completeBlock}
                      className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold text-lg"
                    >
                      Complete Lesson
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
