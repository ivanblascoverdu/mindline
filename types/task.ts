export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  createdAt: Date;
  completedAt?: Date;
  dueDate?: Date;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  completedToday: number;
  completedThisWeek: number;
  totalPoints: number;
  pointsToday: number;
  pointsThisWeek: number;
}

export interface MissionCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  missions: Mission[];
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
  completed: boolean;
  completedAt?: Date;
}

export interface UserProfile {
  id: string;
  name: string;
  totalPoints: number;
  level: number;
  completedMissions: number;
  rank: number;
}

export const MISSION_CATEGORIES: MissionCategory[] = [
  {
    id: 'fitness',
    name: 'Fitness & Health',
    description: 'Stay active and healthy',
    icon: 'dumbbell',
    color: '#ef4444',
    missions: [
      {
        id: 'walk_10k',
        title: 'Walk 10,000 steps',
        description: 'Complete 10,000 steps in a single day',
        points: 50,
        difficulty: 'easy',
        category: 'fitness',
        completed: false
      },
      {
        id: 'workout_30min',
        title: '30-minute workout',
        description: 'Complete a 30-minute exercise session',
        points: 75,
        difficulty: 'medium',
        category: 'fitness',
        completed: false
      },
      {
        id: 'drink_water',
        title: 'Drink 8 glasses of water',
        description: 'Stay hydrated throughout the day',
        points: 30,
        difficulty: 'easy',
        category: 'fitness',
        completed: false
      },
      {
        id: 'run_5k',
        title: 'Run 5 kilometers',
        description: 'Complete a 5K run without stopping',
        points: 100,
        difficulty: 'hard',
        category: 'fitness',
        completed: false
      }
    ]
  },
  {
    id: 'learning',
    name: 'Learning & Growth',
    description: 'Expand your knowledge',
    icon: 'book-open',
    color: '#3b82f6',
    missions: [
      {
        id: 'read_30min',
        title: 'Read for 30 minutes',
        description: 'Spend 30 minutes reading a book or article',
        points: 40,
        difficulty: 'easy',
        category: 'learning',
        completed: false
      },
      {
        id: 'online_course',
        title: 'Complete online lesson',
        description: 'Finish one lesson from an online course',
        points: 60,
        difficulty: 'medium',
        category: 'learning',
        completed: false
      },
      {
        id: 'new_skill',
        title: 'Practice new skill',
        description: 'Spend 1 hour practicing a new skill',
        points: 80,
        difficulty: 'medium',
        category: 'learning',
        completed: false
      },
      {
        id: 'language_practice',
        title: 'Language practice',
        description: 'Practice a foreign language for 45 minutes',
        points: 70,
        difficulty: 'medium',
        category: 'learning',
        completed: false
      }
    ]
  },
  {
    id: 'productivity',
    name: 'Productivity',
    description: 'Get things done efficiently',
    icon: 'target',
    color: '#10b981',
    missions: [
      {
        id: 'inbox_zero',
        title: 'Achieve inbox zero',
        description: 'Clear all emails from your inbox',
        points: 50,
        difficulty: 'medium',
        category: 'productivity',
        completed: false
      },
      {
        id: 'deep_work',
        title: '2 hours of deep work',
        description: 'Focus on important tasks for 2 hours straight',
        points: 90,
        difficulty: 'hard',
        category: 'productivity',
        completed: false
      },
      {
        id: 'organize_workspace',
        title: 'Organize workspace',
        description: 'Clean and organize your work area',
        points: 35,
        difficulty: 'easy',
        category: 'productivity',
        completed: false
      },
      {
        id: 'plan_tomorrow',
        title: 'Plan tomorrow',
        description: 'Create a detailed plan for the next day',
        points: 25,
        difficulty: 'easy',
        category: 'productivity',
        completed: false
      }
    ]
  },
  {
    id: 'social',
    name: 'Social & Relationships',
    description: 'Connect with others',
    icon: 'users',
    color: '#f59e0b',
    missions: [
      {
        id: 'call_friend',
        title: 'Call a friend',
        description: 'Have a meaningful conversation with a friend',
        points: 45,
        difficulty: 'easy',
        category: 'social',
        completed: false
      },
      {
        id: 'help_someone',
        title: 'Help someone',
        description: 'Offer help or support to someone in need',
        points: 60,
        difficulty: 'medium',
        category: 'social',
        completed: false
      },
      {
        id: 'family_time',
        title: 'Quality family time',
        description: 'Spend quality time with family members',
        points: 55,
        difficulty: 'easy',
        category: 'social',
        completed: false
      },
      {
        id: 'network_event',
        title: 'Attend networking event',
        description: 'Participate in a social or professional event',
        points: 80,
        difficulty: 'hard',
        category: 'social',
        completed: false
      }
    ]
  },
  {
    id: 'creativity',
    name: 'Creativity & Hobbies',
    description: 'Express your creative side',
    icon: 'palette',
    color: '#8b5cf6',
    missions: [
      {
        id: 'draw_sketch',
        title: 'Create a drawing',
        description: 'Spend 30 minutes drawing or sketching',
        points: 40,
        difficulty: 'easy',
        category: 'creativity',
        completed: false
      },
      {
        id: 'write_journal',
        title: 'Write in journal',
        description: 'Write a thoughtful journal entry',
        points: 35,
        difficulty: 'easy',
        category: 'creativity',
        completed: false
      },
      {
        id: 'music_practice',
        title: 'Practice music',
        description: 'Practice playing an instrument for 45 minutes',
        points: 65,
        difficulty: 'medium',
        category: 'creativity',
        completed: false
      },
      {
        id: 'creative_project',
        title: 'Work on creative project',
        description: 'Spend 2 hours on a personal creative project',
        points: 85,
        difficulty: 'hard',
        category: 'creativity',
        completed: false
      }
    ]
  }
];

export const TASK_CATEGORIES = [
  'Personal',
  'Work',
  'Health',
  'Learning',
  'Shopping',
  'Other'
] as const;

export const TASK_PRIORITIES = [
  { value: 'low', label: 'Low', color: '#10b981' },
  { value: 'medium', label: 'Medium', color: '#f59e0b' },
  { value: 'high', label: 'High', color: '#ef4444' },
] as const;

export const DIFFICULTY_POINTS = {
  easy: 25,
  medium: 50,
  hard: 100
} as const;

export const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 1750, 2750, 4000, 5500, 7500, 10000];

export function calculateLevel(points: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (points >= LEVEL_THRESHOLDS[i]) {
      return i + 1;
    }
  }
  return 1;
}

export function getPointsForNextLevel(currentPoints: number): number {
  const currentLevel = calculateLevel(currentPoints);
  if (currentLevel >= LEVEL_THRESHOLDS.length) {
    return 0;
  }
  return LEVEL_THRESHOLDS[currentLevel] - currentPoints;
}