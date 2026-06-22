import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Lock, Scroll, Search, Bell, HelpCircle, Settings, LogOut, Shield } from 'lucide-react';
import CyberMitraAssistant from './CyberMitraAssistant';
import { auth, signOut } from '../lib/firebase';
import { useAuth } from '../AuthContext';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, t } = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const navItems = [
    { name: t('dashboard'), path: '/dashboard', icon: Lock, label: 'Safety' },
    { name: t('learn'), path: '/learn', icon: Scroll, label: 'Heritage' },
    { name: 'AI Scam Test', path: '/ai-test', icon: Search, label: 'Verify' },
    { name: t('community'), path: '/community', icon: Bell, label: 'Alerts' },
    { name: t('help'), path: '/help', icon: HelpCircle, label: 'Support' },
    { name: t('settings'), path: '/settings', icon: Settings, label: 'Profile' },
  ];

  const mobileNavItems = [
    { name: 'Home', path: '/dashboard', icon: Lock },
    { name: 'Verify', path: '/ai-test', icon: Search },
    { name: 'Lessons', path: '/learn', icon: Scroll },
    { name: 'Emergency', path: '/help', icon: Bell },
  ];

  if (!user) return <>{children}</>;

  return (
    <div className="min-h-screen bg-paper flex flex-col md:flex-row font-sans relative">
      {/* Decorative Border Pattern */}
      <div className="hidden md:block absolute inset-y-0 left-0 w-2 bg-wood/20 z-50" />
      
      {/* Sidebar for Desktop - The Almari */}
      <aside className="hidden md:flex w-72 bg-khadi border-r-8 border-wood/10 flex-col sticky top-0 h-screen shadow-2xl z-40">
        <div className="p-8 flex flex-col items-center gap-4 border-b-4 border-wood/10 bg-wood/5">
          <div className="w-16 h-16 bg-brass rounded-2xl flex items-center justify-center text-white shadow-lg border-4 border-white/20">
            <Shield size={32} />
          </div>
          <span className="font-serif font-bold text-2xl text-wood leading-tight text-center tracking-tight">Cyber Mitra</span>
        </div>

        <nav className="flex-1 px-6 py-10 space-y-6 overflow-y-auto">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="block group"
            >
              <motion.div
                whileHover={{ x: 10 }}
                className={cn(
                  "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 border-2 shadow-sm",
                  location.pathname === item.path
                    ? "bg-gold border-wood/20 text-wood font-bold scale-105 shadow-md"
                    : "bg-white/50 border-transparent text-wood/70 hover:bg-white hover:border-wood/10 hover:text-wood"
                )}
              >
                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center transition-colors shadow-inner",
                  location.pathname === item.path ? "bg-white/40" : "bg-wood/5 group-hover:bg-wood/10"
                )}>
                  <item.icon size={24} className={cn(
                    "transition-transform group-hover:scale-110",
                    location.pathname === item.path ? "text-wood" : "text-wood/50 group-hover:text-wood"
                  )} />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-serif opacity-60 leading-none mb-1">{item.label}</span>
                  <span className="text-lg leading-none">{item.name}</span>
                </div>
              </motion.div>
            </Link>
          ))}
        </nav>

        <div className="p-6 border-t-4 border-wood/20 bg-wood/5">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-6 py-4 w-full rounded-2xl text-wood/60 hover:bg-terracotta hover:text-white transition-all duration-300 font-bold border-2 border-transparent hover:border-wood/20"
          >
            <LogOut size={20} />
            {t('logout')}
          </button>
        </div>
      </aside>

      {/* Mobile Nav - Thumb-First Chaupal */}
      <nav className="mobile-bottom-nav">
        {mobileNavItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "mobile-nav-item",
              location.pathname === item.path ? "active" : ""
            )}
          >
            <item.icon size={28} className={location.pathname === item.path ? "text-wood" : "text-brass"} />
            <span className="text-xs font-bold uppercase tracking-wider">{item.name}</span>
          </Link>
        ))}
      </nav>

      <main className="flex-1 pb-24 md:pb-0 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 md:p-12">
          {children}
        </div>
      </main>
      <CyberMitraAssistant />
    </div>
  );
}
