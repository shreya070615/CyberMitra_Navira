import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Star, AlertCircle, CheckCircle2, XCircle, Volume2, ArrowRight } from 'lucide-react';
import { useAuth } from './AuthContext';
import { useVoice } from './hooks/useVoice';
import { db, doc, updateDoc, increment } from './lib/firebase';
import { useNavigate } from 'react-router-dom';

const questions = [
  {
    question: "If someone calls claiming to be from your bank and asks for your OTP, what should you do?",
    options: ["Share it immediately", "Ask them to wait", "Hang up and call your bank branch", "Give them a fake OTP"],
    correct: 2,
    explanation: "Banks never ask for OTP or PIN over the phone."
  },
  {
    question: "What does 'Digital Arrest' mean in reality?",
    options: ["Police arresting you via video call", "A common scam to scare you", "A new law in India", "A way to pay fines online"],
    correct: 1,
    explanation: "Police never arrest anyone over video calls or ask for money to 'verify' identity."
  },
  {
    question: "You receive a message saying you won a lottery of 1 Crore. To claim it, you must pay 5000 processing fee. Is this real?",
    options: ["Yes, it's a small fee for a big prize", "No, it's a scam", "Maybe, I should check with my friends", "Yes, if the message looks official"],
    correct: 1,
    explanation: "Lottery scams always ask for 'processing fees' or 'taxes' upfront. Real lotteries don't work this way."
  },
  {
    question: "What is the safest way to set a UPI PIN?",
    options: ["Use your birth year", "Use '1234'", "Use a random number that only you know", "Use your phone number's last 4 digits"],
    correct: 2,
    explanation: "Avoid easy-to-guess numbers like birthdays or sequences."
  }
];

export default function KBCQuiz() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  
  const { profile, t } = useAuth();
  const { speak } = useVoice();
  const navigate = useNavigate();

  useEffect(() => {
    if (!quizFinished) {
      speak(questions[currentQuestion].question);
    }
  }, [currentQuestion, quizFinished]);

  const handleOptionClick = (index: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(index);
    setShowResult(true);
    
    if (index === questions[currentQuestion].correct) {
      setScore(s => s + 1);
      speak("Correct! " + questions[currentQuestion].explanation);
    } else {
      speak("Incorrect. " + questions[currentQuestion].explanation);
    }
  };

  const nextQuestion = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(c => c + 1);
      setSelectedOption(null);
      setShowResult(false);
    } else {
      setQuizFinished(true);
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (profile) {
      const userRef = doc(db, 'users', profile.uid);
      const updates: any = {
        totalPoints: increment(score * 50)
      };
      
      // Update high score if current score is higher
      if (score > (profile.quizHighScore || 0)) {
        updates.quizHighScore = score;
      }

      await updateDoc(userRef, updates);
      
      // Update public leaderboard
      const publicRef = doc(db, 'users_public', profile.uid);
      const publicUpdates: any = {
        totalPoints: increment(score * 50),
        updatedAt: new Date().toISOString()
      };
      if (score > (profile.quizHighScore || 0)) {
        publicUpdates.quizHighScore = score;
      }
      await updateDoc(publicRef, publicUpdates);

      speak(`Quiz finished! You scored ${score} out of ${questions.length}. You earned ${score * 50} points!`);
    }
  };

  if (quizFinished) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-32 h-32 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 mx-auto"
        >
          <Trophy size={64} />
        </motion.div>
        <h2 className="text-4xl font-black text-slate-900">Quiz Finished!</h2>
        <p className="text-2xl text-slate-600">You scored <span className="text-blue-600 font-black">{score}</span> out of {questions.length}</p>
        <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100">
          <p className="text-blue-800 font-bold text-xl">You earned {score * 50} Points! 💰</p>
        </div>
        <button
          onClick={() => navigate('/dashboard')}
          className="bg-slate-900 text-white px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-800 transition-all"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const q = questions[currentQuestion];

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black text-slate-900">{t('kbcTitle')}</h1>
          <p className="text-slate-500 font-medium">Question {currentQuestion + 1} of {questions.length}</p>
        </div>
        <div className="bg-blue-600 text-white px-6 py-3 rounded-2xl font-black shadow-lg shadow-blue-100">
          Score: {score}
        </div>
      </header>

      <div className="bg-white p-8 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-8">
        <div className="flex justify-between items-start gap-4">
          <h2 className="text-2xl font-bold text-slate-900 leading-tight flex-1">
            {q.question}
          </h2>
          <button 
            onClick={() => speak(q.question)}
            className="p-3 bg-slate-50 rounded-2xl text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Volume2 size={24} />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {q.options.map((option, i) => (
            <button
              key={i}
              onClick={() => handleOptionClick(i)}
              disabled={selectedOption !== null}
              className={cn(
                "p-6 rounded-2xl border-2 font-bold text-lg text-left transition-all flex items-center justify-between",
                selectedOption === null ? "border-slate-100 hover:border-blue-300 hover:bg-blue-50" :
                i === q.correct ? "border-green-500 bg-green-50 text-green-700" :
                selectedOption === i ? "border-red-500 bg-red-50 text-red-700" : "border-slate-50 opacity-50"
              )}
            >
              <span>{option}</span>
              {selectedOption !== null && i === q.correct && <CheckCircle2 className="text-green-600" />}
              {selectedOption === i && i !== q.correct && <XCircle className="text-red-600" />}
            </button>
          ))}
        </div>

        <AnimatePresence>
          {showResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                "p-6 rounded-2xl border-2 flex items-start gap-4",
                selectedOption === q.correct ? "bg-green-50 border-green-100" : "bg-red-50 border-red-100"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                selectedOption === q.correct ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              )}>
                {selectedOption === q.correct ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              </div>
              <div className="flex-1">
                <p className={cn(
                  "font-bold mb-1",
                  selectedOption === q.correct ? "text-green-900" : "text-red-900"
                )}>
                  {selectedOption === q.correct ? "Correct Answer!" : "Incorrect Answer"}
                </p>
                <p className="text-slate-600">{q.explanation}</p>
                <button
                  onClick={nextQuestion}
                  className="mt-4 flex items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  {currentQuestion === questions.length - 1 ? "Finish Quiz" : "Next Question"}
                  <ArrowRight size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
