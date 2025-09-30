export type AchievementMood = 'celebration' | 'progress' | 'struggle' | 'gratitude';
export type AchievementVisibility = 'public' | 'community';

export interface Achievement {
  id: string;
  userId: string;
  title: string;
  description?: string;
  mood: AchievementMood;
  visibility: AchievementVisibility;
  likesCount: number;
  commentsCount: number;
  createdAt: Date;
  userName: string;
  userAvatar?: string;
}

export interface NewAchievement {
  title: string;
  description?: string;
  mood: AchievementMood;
  visibility: AchievementVisibility;
}

export type MembershipRole = 'owner' | 'moderator' | 'member';

export interface Community {
  id: string;
  name: string;
  description?: string;
  focusArea: string;
  ownerId: string;
  createdAt: Date;
  memberCount: number;
  isMember: boolean;
}

export interface CommunityInput {
  name: string;
  description?: string;
  focusArea: string;
  isPrivate?: boolean;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  coverUrl?: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  durationMinutes: number;
  modulesCount: number;
  isPremium: boolean;
  price: number;
  createdAt: Date;
}

export interface SubscriptionStatus {
  planId: string;
  status: 'none' | 'active' | 'expired' | 'cancelled';
  expiresAt?: Date;
}

export interface UserCourseAccess {
  courseId: string;
  progress: number;
  lastAccessed?: Date;
}

