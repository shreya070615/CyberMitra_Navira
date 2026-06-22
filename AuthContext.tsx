import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db, onAuthStateChanged, doc, getDoc, setDoc, FirebaseUser } from './lib/firebase';
import { UserProfile } from './types';

import { translations, TranslationKey } from './translations';

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  loading: boolean;
  setLanguage: (lang: 'en' | 'hi') => Promise<void>;
  setVoiceEnabled: (enabled: boolean) => Promise<void>;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          setProfile(userDoc.data() as UserProfile);
        } else {
          const savedLang = localStorage.getItem('preferred_lang') as 'en' | 'hi';
          const newProfile: UserProfile = {
            uid: user.uid,
            name: user.displayName || 'User',
            email: user.email || '',
            language: savedLang || 'en',
            voiceEnabled: true,
            totalPoints: 0,
            badges: [],
            progress: {
              block1: 'in-progress',
              block2: 'locked',
              block3: 'locked',
              block4: 'locked',
              block5: 'locked',
            },
            createdAt: new Date().toISOString(),
          };
          await setDoc(doc(db, 'users', user.uid), newProfile);
          // Create public profile for leaderboard
          await setDoc(doc(db, 'users_public', user.uid), {
            uid: user.uid,
            name: newProfile.name,
            quizHighScore: 0,
            totalPoints: 0,
            updatedAt: new Date().toISOString()
          });
          setProfile(newProfile);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const setLanguage = async (lang: 'en' | 'hi') => {
    if (user && profile) {
      const updatedProfile = { ...profile, language: lang };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const setVoiceEnabled = async (enabled: boolean) => {
    if (user && profile) {
      const updatedProfile = { ...profile, voiceEnabled: enabled };
      await setDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(updatedProfile);
    }
  };

  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    const lang = profile?.language || 'en';
    let text = translations[lang][key] || translations['en'][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v);
      });
    }
    
    return text;
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, setLanguage, setVoiceEnabled, t }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
