export interface ProfessionalContact {
  id: string;
  name: string;
  title: string;
  specialization: string[];
  description: string;
  phone?: string;
  email?: string;
  website?: string;
  location: string;
  rating: number;
  reviewCount: number;
  image?: string;
  availability: 'available' | 'busy' | 'unavailable';
  languages: string[];
  type: 'psychologist' | 'therapist' | 'counselor' | 'ngo' | 'crisis_line';
  isEmergency?: boolean;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  description: string;
  country: string;
  available24h: boolean;
}