export interface Service {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  category: string;
  benefits: string[];
  duration: string;
  priceEstimate: string;
  iconName: string; // Dynamic icon reference from lucide-react
}

export interface Dentist {
  id: string;
  name: string;
  role: string;
  specialty: string;
  experience: string;
  education: string;
  imageUrl: string;
  rating: number;
  availableDays: string[];
}

export interface Review {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  treatmentName: string;
  comment: string;
  date: string;
  verified: boolean;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export interface Appointment {
  id: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  serviceId: string;
  dentistId: string;
  date: string;
  timeSlot: string;
  notes?: string;
  status: 'confirmed' | 'pending' | 'canceled';
  createdAt: string;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  createdAt: string;
}
