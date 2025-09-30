export type ProfessionalAvailability = 'available' | 'busy' | 'offline';

export interface ProfessionalContact {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  description: string;
  phone: string;
  email: string;
  website?: string;
  location: string;
  rating?: number;
  reviewCount?: number;
  image?: string;
  availability: ProfessionalAvailability;
  languages?: string[];
  type: 'psychologist' | 'therapist' | 'ngo' | 'crisis_line' | string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  country: string;
  available24h: boolean;
}
