import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Smartphone, ShieldCheck, AlertTriangle, ArrowLeft, Volume2, CreditCard, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { useVoice } from './hooks/useVoice';
import { db, doc, updateDoc, increment } from './lib/firebase';

export default function Block2() {
  const [step, setStep] = useState(0);
  const [amount, setAmount] = useState('5000');
  const [receiver, setReceiver] = useState('Electricity Board Official');
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState('');
  const [result, setResult] = useState<'success' | 'scam' | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<{[key: string]: 'real' | 'fake'}>({});
  const [quizFeedback, setQuizFeedback] = useState<{[key: string]: string}>({});
  
  const navigate = useNavigate();
  const { profile, t } = useAuth();
  const { speak } = useVoice();

  const quizItems = [
    { id: '1', text: 'Utility company sends payment link via SMS', type: 'real', reason: 'Legitimate companies may send payment reminders via SMS with official links.' },
    { id: '2', text: 'Someone calls demanding immediate payment via UPI', type: 'fake', reason: 'Real utility companies never call demanding immediate payment via personal UPI IDs.' },
    { id: '3', text: 'You pay bill through official app or website', type: 'real', reason: 'Always use official apps or websites for bill payments to stay safe.' },
    { id: '4', text: 'Official threatens disconnection unless paid now', type: 'fake', reason: 'Legitimate companies give proper notice periods, never threaten immediate disconnection.' }
  ];

  useEffect(() => {
    speak("Block 2: UPI and Payment Scams. You receive a message saying your electricity will be cut tonight unless you pay immediately via UPI.");
  }, []);

  const handlePinSubmit = async () => {
    if (pin.length === 4) {
      setResult('scam');
      speak("Oh no! You entered your PIN for a fake payment. Real officials never ask for payment via personal UPI links for utility bills.");      setTimeout(() => setShowQuiz(true), 2000);    }
  };

  const completeBlock = async () => {
    if (profile) {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        totalPoints: increment(100),
        'progress.block2': 'completed',
        'progress.block3': 'in-progress',
        badges: Array.from(new Set([...profile.badges, 'upi-safe']))
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

      <div className="bg-white rounded-[3rem] border-2 border-slate-100 shadow-xl overflow-hidden">
        {/* Phone UI */}
        <div className="bg-slate-900 p-4 flex justify-between items-center text-white text-xs font-bold">
          <span>9:41</span>
          <div className="flex gap-1">
            <div className="w-4 h-2 bg-white/20 rounded-sm" />
            <div className="w-4 h-2 bg-white/20 rounded-sm" />
            <div className="w-6 h-2 bg-green-500 rounded-sm" />
          </div>
        </div>

        <div className="p-8 space-y-8 min-h-[500px] flex flex-col">
          {step === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex-1">
              <div className="bg-green-50 p-6 rounded-3xl border-2 border-green-100">
                <div className="flex items-center gap-3 text-green-600 mb-2">
                  <ShieldCheck size={24} />
                  <span className="font-black">Instructions</span>
                </div>
                <p className="text-slate-800 font-bold text-lg">
                  1. You'll receive a message about electricity bill payment<br/>
                  2. Choose to call the number or report as spam<br/>
                  3. Real officials never demand immediate payment via UPI<br/>
                  4. Use voice guidance if needed
                </p>
              </div>
              <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
                <div className="flex items-center gap-3 text-blue-600 mb-2">
                  <AlertTriangle size={24} />
                  <span className="font-black">Scenario</span>
                </div>
                <p className="text-slate-800 font-bold text-lg">
                  You receive a threatening message saying your electricity will be cut tonight unless you pay immediately via UPI to an unofficial number.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={() => setStep(1)}
                  className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-700 transition-all"
                >
                  Call the "Officer"
                </button>
                <button
                  onClick={() => {
                    speak("Correct! This is a common scam. Utility companies don't send such threatening messages.");
                    setResult('success');
                  }}
                  className="w-full bg-slate-100 text-slate-600 py-5 rounded-2xl font-black text-xl hover:bg-slate-200 transition-all"
                >
                  Report as Spam
                </button>
              </div>
            </motion.div>
          )}

          {step === 1 && !result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex-1">
              <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                  <Smartphone size={40} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Calling...</h3>
                  <p className="text-slate-500 font-bold">9876543210</p>
                </div>
              </div>
              <div className="bg-slate-50 p-6 rounded-3xl border-2 border-slate-100 italic text-slate-600">
                "Hello, this is the Electricity Board. Your bill of ₹5,000 is pending. I am sending you a payment link. Pay now or power will be cut in 10 minutes."
              </div>
              <button
                onClick={() => {
                  speak("Wrong! Real utility companies don't demand immediate payment via unofficial links. This is a scam.");
                  setResult('scam');
                }}
                className="w-full bg-green-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-green-700 transition-all"
              >
                Open Payment Link
              </button>
            </motion.div>
          )}

          {step === 2 && !result && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex-1">
              <div className="bg-white border-2 border-slate-100 rounded-3xl p-6 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Paying To</span>
                  <span className="font-black text-slate-900">{receiver}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold uppercase text-xs tracking-widest">Amount</span>
                  <span className="font-black text-3xl text-slate-900">₹{amount}</span>
                </div>
                <div className="pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-3 text-slate-400 text-sm font-bold">
                    <CreditCard size={18} />
                    <span>HDFC Bank **** 1234</span>
                  </div>
                </div>
              </div>

              {!showPin ? (
                <button
                  onClick={() => setShowPin(true)}
                  className="w-full bg-blue-600 text-white py-5 rounded-2xl font-black text-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-3"
                >
                  Proceed to Pay
                  <Send size={20} />
                </button>
              ) : (
                <div className="space-y-4">
                  <label className="block text-center font-black text-slate-900">ENTER 4-DIGIT UPI PIN</label>
                  <div className="flex justify-center gap-4">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={cn(
                        "w-12 h-12 rounded-xl border-2 flex items-center justify-center text-2xl font-black",
                        pin.length >= i ? "border-blue-600 bg-blue-50" : "border-slate-200"
                      )}>
                        {pin.length >= i ? '•' : ''}
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, '', 0, '✓'].map((n, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          if (n === '✓') handlePinSubmit();
                          else if (typeof n === 'number' && pin.length < 4) setPin(p => p + n);
                        }}
                        className="h-14 bg-slate-50 rounded-xl font-black text-xl hover:bg-slate-100"
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {result && !showQuiz && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 flex-1 flex flex-col justify-center">
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
                  ? "Great job! You recognized the threat and didn't fall for the pressure tactic."
                  : "You lost ₹5,000. Remember: Never enter your UPI PIN to pay for bills via links sent on SMS or WhatsApp."}
              </p>
            </motion.div>
          )}

          {showQuiz && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex-1 flex flex-col space-y-6"
            >
              <div className="text-center">
                <h2 className="text-2xl font-black text-slate-900">Quick Quiz</h2>
                <p className="text-slate-600">Classify each scenario as Real or Fake</p>
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
        </div>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
