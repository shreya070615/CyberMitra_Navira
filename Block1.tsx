import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Phone, PhoneOff, ArrowRight, ShieldCheck, AlertTriangle, Coins } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useVoice } from './hooks/useVoice';
import { db, doc, updateDoc, increment } from './lib/firebase';
import { useAuth } from './AuthContext';

export default function Block1() {
  const [step, setStep] = useState(1);
  const [balance, setBalance] = useState(35000);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [showCall, setShowCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [result, setResult] = useState<'success' | 'fail' | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: 'real' | 'fake'}>({});
  const [quizFeedback, setQuizFeedback] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();
  const { profile, t } = useAuth();
  const { speak } = useVoice();

  const quizItems = [
    { id: '1', text: 'Bank calls you asking for OTP to update KYC', type: 'fake', reason: 'Real banks never call asking for OTP. They may send SMS, but never ask you to share it over phone.' },
    { id: '2', text: 'You call bank helpline yourself to report issue', type: 'real', reason: 'Always contact your bank directly using the official number on their website or card.' },
    { id: '3', text: 'Someone offers lottery winnings via phone call', type: 'fake', reason: 'No legitimate lottery or government scheme asks you to pay fees to claim winnings.' },
    { id: '4', text: 'Police visits your home in person for investigation', type: 'real', reason: 'Real police always show official ID and conduct investigations in person, never over phone.' }
  ];

  useEffect(() => {
    if (step === 1) {
      speak(t('block1Intro'));
    }
  }, [step]);

  const handlePinSubmit = () => {
    if (pin === '1234' || pin === '0000' || pin === '1111') {
      setPinError("Scammers can guess this easily. Try something harder.");
      speak("Scammers can guess this easily. Try something harder.");
      return;
    }
    if (pin.length < 4) {
      setPinError("PIN must be 4 digits.");
      speak("PIN must be 4 digits.");
      return;
    }
    setStep(3);
  };

  const handleAcceptCall = () => {
    setCallAccepted(true);
    speak("Namaste, I am calling from SBI. Your KYC is incomplete. Share the OTP sent to your phone to avoid account block.");
    setTimeout(() => setOtpSent(true), 3000);
  };

  const handleAction = (action: 'share' | 'hangup') => {
    if (action === 'share') {
      setResult('fail');
      setBalance(0);
      speak("Scammed! In real life, your money would be gone in seconds. Never share OTP with anyone.");
    } else {
      setResult('success');
      speak("Well done! You protected your money! Real banks never ask for OTP, PIN, or password.");
    }
    setTimeout(() => setShowQuiz(true), 2000);
  };

  const completeBlock = async () => {
    if (profile && result === 'success') {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        totalPoints: increment(100),
        'progress.block1': 'completed',
        // Unlock next block if it was locked
        'progress.block2': profile.progress.block2 === 'locked' ? 'in-progress' : profile.progress.block2,
        badges: Array.from(new Set([...profile.badges, 'otp-safety']))
      });

      // Update public leaderboard
      const publicRef = doc(db, 'users_public', profile.uid);
      await updateDoc(publicRef, {
        totalPoints: increment(100),
        updatedAt: new Date().toISOString()
      });

      navigate('/learn'); // Go back to learn to see progress
    } else {
      // Reset
      setStep(1);
      setResult(null);
      setBalance(35000);
      setPin('');
      setShowCall(false);
      setCallAccepted(false);
      setOtpSent(false);
    }
  };

  return (
    <div className="max-w-md mx-auto min-h-[600px] bg-white rounded-[3rem] shadow-2xl border-8 border-slate-900 overflow-hidden relative flex flex-col">
      {/* Phone Status Bar */}
      <div className="bg-slate-900 h-8 flex items-center justify-between px-6 text-white text-xs">
        <span>9:41</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 bg-white/20 rounded-full" />
          <div className="w-3 h-3 bg-white/20 rounded-full" />
        </div>
      </div>

      <div className="flex-1 p-6 flex flex-col">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col justify-center text-center space-y-6"
            >
              <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-100">
                <div className="flex items-center gap-3 text-green-600 mb-2">
                  <ShieldCheck size={24} />
                  <span className="font-black">Instructions</span>
                </div>
                <p className="text-slate-800 font-bold text-lg">
                  1. Set a strong 4-digit UPI PIN (avoid easy numbers like 1234)<br/>
                  2. You'll receive a call from "SBI" asking for OTP<br/>
                  3. Choose wisely - real banks never ask for OTP over phone<br/>
                  4. Use voice guidance if needed
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <AlertTriangle size={24} />
                  <span className="font-black">Scenario</span>
                </div>
                <p className="text-slate-800 font-bold text-lg">
                  You just set up UPI on your phone. Suddenly, you get a call from "SBI Customer Care" saying your KYC is incomplete and you need to share an OTP to avoid account block.
                </p>
              </div>
              <button
                onClick={() => setStep(2)}
                className="bg-green-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg shadow-green-100 hover:bg-green-700 transition-all"
              >
                Start Simulation
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col"
            >
              <div className="bg-green-600 -mx-6 -mt-6 p-6 text-white mb-6">
                <h3 className="font-bold">Mock UPI App</h3>
                <div className="mt-4">
                  <span className="text-sm opacity-80">Balance</span>
                  <div className="text-3xl font-black">₹{balance.toLocaleString()}</div>
                </div>
              </div>

              <div className="flex-1 space-y-6">
                <h4 className="font-bold text-slate-900">Create Your 4-Digit UPI PIN</h4>
                <div className="flex justify-center gap-4">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className="w-12 h-16 bg-slate-100 rounded-xl flex items-center justify-center text-2xl font-bold border-2 border-transparent focus-within:border-green-500">
                      {pin[i] ? '●' : ''}
                    </div>
                  ))}
                </div>
                
                {pinError && <p className="text-red-500 text-sm text-center font-medium">{pinError}</p>}

                <div className="grid grid-cols-3 gap-3">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'OK'].map(val => (
                    <button
                      key={val}
                      onClick={() => {
                        if (val === 'C') setPin('');
                        else if (val === 'OK') handlePinSubmit();
                        else if (pin.length < 4) setPin(p => p + val);
                      }}
                      className="h-14 bg-slate-50 rounded-xl font-bold text-xl hover:bg-slate-100 active:scale-95 transition-all"
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && !result && (
            <motion.div
              key="step3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-8"
            >
              {!callAccepted ? (
                <div className="w-full space-y-8">
                  <div className="animate-bounce text-6xl">📱</div>
                  <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 w-full">
                    <div className="text-slate-400 text-sm font-bold uppercase tracking-widest mb-1">Incoming Call</div>
                    <div className="text-2xl font-black text-slate-900">SBI Customer Care</div>
                  </div>
                  <div className="flex justify-around w-full">
                    <button className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-red-100">
                      <PhoneOff size={24} />
                    </button>
                    <button 
                      onClick={handleAcceptCall}
                      className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-green-100 animate-pulse"
                    >
                      <Phone size={24} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-6">
                  <div className="bg-slate-900 -mx-6 -mt-24 p-12 text-white flex flex-col items-center">
                    <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mb-4">
                      <Phone size={32} />
                    </div>
                    <div className="text-xl font-bold">SBI Agent</div>
                    <div className="text-sm opacity-60">04:12</div>
                  </div>

                  <div className="p-4 bg-blue-50 rounded-2xl text-blue-800 text-left text-sm italic">
                    "Namaste, I am calling from SBI. Your KYC is incomplete. Share the OTP sent to your phone to avoid account block."
                  </div>

                  {otpSent && (
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="bg-amber-50 border-2 border-amber-200 p-4 rounded-2xl text-left"
                    >
                      <div className="text-xs font-bold text-amber-600 uppercase mb-1">New Message</div>
                      <div className="font-mono font-bold text-lg">OTP: 812345</div>
                    </motion.div>
                  )}

                  <div className="grid grid-cols-1 gap-4 w-full pt-4">
                    <button
                      onClick={() => handleAction('share')}
                      className="bg-slate-800 text-white py-4 rounded-2xl font-bold"
                    >
                      Share OTP with caller
                    </button>
                    <button
                      onClick={() => handleAction('hangup')}
                      className="bg-green-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-green-100"
                    >
                      Do not share. Hang up.
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {result && !showQuiz && (
            <motion.div
              key="result"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
            >
              {result === 'success' ? (
                <>
                  <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4">
                    <ShieldCheck size={64} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">{t('safe')}</h2>
                  <p className="text-slate-600">You protected your money! Real banks never ask for OTP, PIN, or password.</p>
                  <div className="text-2xl font-black text-green-600">₹{balance.toLocaleString()}</div>
                </>
              ) : (
                <>
                  <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4">
                    <AlertTriangle size={64} />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900">{t('scammed')}</h2>
                  <p className="text-slate-600">In real life, your money would be gone in seconds. Never share OTP with anyone.</p>
                  <div className="flex items-center gap-2 text-4xl font-black text-red-600">
                    <Coins size={32} />
                    ₹0
                  </div>
                </>
              )}
            </motion.div>
          )}

          {showQuiz && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">Quick Quiz</h2>
                <p className="text-slate-600">Drag each scenario to Real or Fake</p>
              </div>

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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
