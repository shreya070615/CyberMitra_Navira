import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldAlert, ThumbsUp, MessageSquare, Plus, CheckCircle, MapPin, Clock, Volume2, Trophy, Medal } from 'lucide-react';
import { db, collection, query, orderBy, onSnapshot, addDoc, updateDoc, doc, increment, limit } from './lib/firebase';
import { useAuth } from './AuthContext';
import { ScamReport, UserProfile } from './types';
import { useVoice } from './hooks/useVoice';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Community() {
  const [reports, setReports] = useState<ScamReport[]>([]);
  const [leaderboard, setLeaderboard] = useState<UserProfile[]>([]);
  const [activeTab, setActiveTab] = useState<'reports' | 'leaderboard'>('reports');
  const [showForm, setShowForm] = useState(false);
  const [newReport, setNewReport] = useState({ type: 'otp', description: '', location: '' });
  const { profile, t } = useAuth();
  const { speak } = useVoice();

  useEffect(() => {
    // Fetch reports
    const qReports = query(collection(db, 'reports'), orderBy('timestamp', 'desc'));
    const unsubscribeReports = onSnapshot(qReports, (snapshot) => {
      const reportsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ScamReport[];
      setReports(reportsData);
    });

    // Fetch leaderboard only when user is authenticated
    let unsubscribeLeaderboard = () => {};
    if (profile) {
      const qLeaderboard = query(
        collection(db, 'users_public'), 
        orderBy('totalPoints', 'desc'),
        limit(10)
      );
      unsubscribeLeaderboard = onSnapshot(qLeaderboard, (snapshot) => {
        const leaderboardData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        })) as UserProfile[];
        setLeaderboard(leaderboardData);
      });
    } else {
      setLeaderboard([]);
    }

    return () => {
      unsubscribeReports();
      unsubscribeLeaderboard();
    };
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'reports') {
      speak(`${t('communitySiren')}. ${t('reportDesc')}`);
    } else {
      speak(t('leaderboard'));
    }
  }, [activeTab]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile || !newReport.description) return;

    try {
      await addDoc(collection(db, 'reports'), {
        authorUid: profile.uid,
        authorName: profile.name,
        type: newReport.type,
        description: newReport.description,
        location: newReport.location,
        timestamp: new Date(),
        upvotes: 0,
        verified: false
      });
      setShowForm(false);
      setNewReport({ type: 'otp', description: '', location: '' });
    } catch (error) {
      console.error('Error adding report:', error);
    }
  };

  const handleUpvote = async (reportId: string) => {
    const reportRef = doc(db, 'reports', reportId);
    await updateDoc(reportRef, {
      upvotes: increment(1)
    });
  };

  return (
    <div className="space-y-8">
      <header className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex justify-between items-start flex-1">
            <div>
              <h1 className="text-4xl font-black text-slate-900 mb-2">{t('communitySiren')}</h1>
              <p className="text-slate-600 text-lg">{t('reportDesc')}</p>
            </div>
            <button 
              onClick={() => speak(`${t('communitySiren')}. ${t('reportDesc')}`)}
              className="p-3 bg-white border-2 border-slate-100 rounded-2xl text-blue-600 hover:bg-blue-50 transition-colors"
            >
              <Volume2 size={24} />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
          >
            <Plus size={20} />
            {t('reportScam')}
          </button>
        </div>

        <div className="flex p-1.5 bg-slate-100 rounded-2xl w-full md:w-fit">
          <button
            onClick={() => setActiveTab('reports')}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all",
              activeTab === 'reports' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            {t('scamAlerts')}
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={cn(
              "flex-1 md:flex-none px-8 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2",
              activeTab === 'leaderboard' ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
            )}
          >
            <Trophy size={18} />
            {t('leaderboard')}
          </button>
        </div>
      </header>

      <AnimatePresence mode="wait">
        {activeTab === 'reports' ? (
          <motion.div
            key="reports"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="space-y-6"
          >
            {/* Report Form and Reports List */}
            <AnimatePresence>
              {showForm && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white p-8 rounded-[2.5rem] border-2 border-blue-100 shadow-xl shadow-blue-50 space-y-6 mb-8"
                >
                  <h3 className="text-2xl font-bold text-slate-900">New Scam Report</h3>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Scam Type</label>
                        <select
                          value={newReport.type}
                          onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all"
                        >
                          <option value="otp">OTP / PIN Safety</option>
                          <option value="upi">UPI / Payment Scam</option>
                          <option value="police">Fake Police / Arrest</option>
                          <option value="kyc">Fake KYC / Aadhaar</option>
                          <option value="investment">Investment / Lottery</option>
                          <option value="other">Other</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Location (Optional)</label>
                        <input
                          type="text"
                          placeholder="City, State"
                          value={newReport.location}
                          onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
                          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-bold text-slate-500 uppercase tracking-wider">Description</label>
                      <textarea
                        rows={4}
                        placeholder="What happened? How did they contact you?"
                        value={newReport.description}
                        onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-blue-600 outline-none transition-all resize-none"
                      />
                    </div>
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setShowForm(false)}
                        className="flex-1 bg-slate-100 text-slate-900 py-4 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-100"
                      >
                        Submit Report
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {reports.map((report) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-200 transition-all group"
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600">
                      <ShieldAlert size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 uppercase tracking-wide text-sm">
                          {report.type.toUpperCase()} SCAM ALERT
                        </span>
                        {report.verified && (
                          <div className="flex items-center gap-1 bg-green-50 text-green-600 px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                            <CheckCircle size={10} />
                            Verified
                          </div>
                        )}
                      </div>
                      <div className="text-slate-400 text-xs font-medium flex items-center gap-3 mt-0.5">
                        <span className="flex items-center gap-1"><Clock size={12} /> {new Date(report.timestamp?.seconds * 1000 || Date.now()).toLocaleDateString()}</span>
                        {report.location && <span className="flex items-center gap-1"><MapPin size={12} /> {report.location}</span>}
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => speak(`${report.type} scam alert. ${report.description}`)}
                    className="p-2 text-slate-300 hover:text-blue-600 transition-colors"
                  >
                    <Volume2 size={20} />
                  </button>
                </div>

                <p className="text-slate-700 leading-relaxed mb-6 text-lg">
                  {report.description}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                  <div className="text-slate-400 text-sm font-medium">
                    Reported by <span className="text-slate-900 font-bold">{report.authorName}</span>
                  </div>
                  <button
                    onClick={() => handleUpvote(report.id)}
                    className="flex items-center gap-2 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 text-slate-600 px-4 py-2 rounded-xl transition-all font-bold"
                  >
                    <ThumbsUp size={18} />
                    {report.upvotes}
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="leaderboard"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-black text-slate-900 mb-2">{t('leaderboard')}</h2>
              <p className="text-slate-600 text-lg">Top Cyber Guardians</p>
              {!profile && (
                <p className="text-amber-600 text-sm mt-2">⚠️ Please sign in to view the leaderboard</p>
              )}
              {profile && leaderboard.length === 0 && (
                <p className="text-blue-600 text-sm mt-4">ℹ️ Complete a simulation or sign in members to appear on the leaderboard!</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {leaderboard.map((user, index) => {
                const rank = index + 1;
                const isTopPerformer = rank === 1;
                const isRisingStar = rank <= 3;
                const badgeCount = Math.min(Math.floor(user.totalPoints / 100), 5); // Max 5 badges based on points

                return (
                  <motion.div
                    key={user.uid}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={cn(
                      "bg-white p-6 rounded-3xl border-2 shadow-lg transition-all hover:scale-105",
                      rank === 1 && "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-50 shadow-amber-100",
                      rank === 2 && "border-slate-300 bg-gradient-to-br from-slate-50 to-gray-50 shadow-slate-100",
                      rank === 3 && "border-amber-600 bg-gradient-to-br from-amber-50 to-orange-50 shadow-amber-100",
                      rank > 3 && "border-slate-200 shadow-slate-50",
                      user.uid === profile?.uid && "ring-4 ring-blue-200"
                    )}
                  >
                    <div className="text-center space-y-4">
                      {/* Rank and Medal */}
                      <div className="flex items-center justify-center gap-2">
                        {rank === 1 && <Trophy className="text-amber-400" size={32} />}
                        {rank === 2 && <Medal className="text-slate-400" size={32} />}
                        {rank === 3 && <Medal className="text-amber-700" size={32} />}
                        {rank > 3 && (
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <span className="text-2xl font-black text-slate-600">{rank}</span>
                          </div>
                        )}
                      </div>

                      {/* Avatar */}
                      <div className="w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-black text-3xl mx-auto shadow-lg">
                        {user.name[0].toUpperCase()}
                      </div>

                      {/* Name */}
                      <div>
                        <h3 className="text-xl font-black text-slate-900">{user.name}</h3>
                        <p className="text-slate-500 font-medium">Cyber Guardian</p>
                      </div>

                      {/* Badges */}
                      <div className="flex items-center justify-center gap-2">
                        {isTopPerformer && (
                          <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-black flex items-center gap-1">
                            <Trophy size={14} />
                            Top Performer
                          </div>
                        )}
                        {isRisingStar && !isTopPerformer && (
                          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-black flex items-center gap-1">
                            <ShieldAlert size={14} />
                            Rising Star
                          </div>
                        )}
                      </div>

                      {/* Reward Indicators */}
                      <div className="flex items-center justify-center gap-1">
                        {Array.from({ length: badgeCount }, (_, i) => (
                          <div key={i} className="w-6 h-6 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-black">★</span>
                          </div>
                        ))}
                        {badgeCount === 0 && (
                          <div className="text-slate-400 text-sm font-medium">Keep Learning!</div>
                        )}
                      </div>

                      {/* Progress Level */}
                      <div className="text-center">
                        <div className="text-slate-500 text-sm font-bold uppercase tracking-wider">Level</div>
                        <div className="text-2xl font-black text-green-600">
                          {Math.floor(user.totalPoints / 100) + 1}
                        </div>
                      </div>

                      {/* Current User Indicator */}
                      {user.uid === profile?.uid && (
                        <div className="bg-green-100 text-green-800 px-4 py-2 rounded-2xl text-sm font-black">
                          You
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12">
                <Trophy className="text-slate-300 mx-auto mb-4" size={48} />
                <p className="text-slate-500 text-lg font-medium">No guardians yet. Be the first!</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
