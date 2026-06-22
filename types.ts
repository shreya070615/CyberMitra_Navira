import { FirebaseUser } from './lib/firebase';

export type BlockStatus = 'locked' | 'in-progress' | 'completed';

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  language: 'en' | 'hi';
  voiceEnabled: boolean;
  totalPoints: number;
  quizHighScore?: number;
  badges: string[];
  progress: {
    block1: BlockStatus;
    block2: BlockStatus;
    block3: BlockStatus;
    block4: BlockStatus;
    block5: BlockStatus;
  };
  createdAt: string;
}

export interface ScamReport {
  id: string;
  authorUid: string;
  authorName: string;
  type: 'otp' | 'upi' | 'police' | 'kyc' | 'investment' | 'other';
  description: string;
  location?: string;
  timestamp: any;
  upvotes: number;
  verified: boolean;
}

export interface Block {
  id: string;
  title: string;
  description: string;
  icon: string;
  estimatedTime: string;
  points: number;
}
