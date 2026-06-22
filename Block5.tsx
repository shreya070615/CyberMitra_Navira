import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Block5() {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto space-y-8 py-12 text-center">
      <button onClick={() => navigate('/learn')} className="flex items-center gap-2 text-slate-500 font-bold hover:text-slate-900 transition-colors mx-auto">
        <ArrowLeft size={20} />
        Back to Learn
      </button>
      <div className="bg-white p-12 rounded-[3rem] border-2 border-slate-100 shadow-xl">
        <div className="text-6xl mb-6">💰</div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">Block 5: Investment & Lottery Frauds</h2>
        <p className="text-slate-600 text-lg mb-8">This simulation is coming soon! You will learn to identify "Get Rich Quick" schemes and fake stock market tips.</p>
        <button onClick={() => navigate('/learn')} className="bg-blue-600 text-white px-8 py-4 rounded-2xl font-bold">Return to Learn</button>
      </div>
    </div>
  );
}
