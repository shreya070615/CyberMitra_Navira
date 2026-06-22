import { useEffect } from 'react';
import { useAuth } from '../AuthContext';

export function useVoice(text?: string) {
  const { profile } = useAuth();
  const lang = profile?.language || 'en';
  const voiceEnabled = profile?.voiceEnabled ?? true;

  const speak = (overrideText?: string) => {
    const textToSpeak = overrideText || text;
    if (!voiceEnabled || !window.speechSynthesis || !textToSpeak) return;
    
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return { speak };
}
