export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isPremium: boolean;
  premiumExpiresAt?: Date;
  createdAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  name: string;
}

export interface ForgotPasswordData {
  email: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  duration: number; // in months
  price: number;
  features: string[];
  popular?: boolean;
}