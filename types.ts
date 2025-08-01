
export interface ChatMessage {
  role: 'user' | 'ai';
  text: string;
}

export type ActiveView = 'symptom-checker' | 'health-tips' | 'visual-analysis';
export type VisualAnalysisMode = 'wound' | 'emotion';

// User and Authentication Types
export interface User {
  id: string;
  email: string;
  phone: string;
  name: string;
  role: 'user' | 'doctor' | 'admin';
  isVerified: boolean;
  createdAt: Date;
  profileImage?: string;
}

export interface Doctor extends User {
  role: 'doctor';
  specialization: string;
  experience: number;
  qualification: string;
  licenseNumber: string;
  consultationFee: number;
  availability: DoctorAvailability[];
  rating: number;
  reviewCount: number;
  bio: string;
  isApproved: boolean;
}

export interface DoctorAvailability {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

// Booking Types
export interface Booking {
  id: string;
  userId: string;
  doctorId: string;
  patientName: string;
  patientAge: number;
  symptoms: string;
  preferredDate: Date;
  preferredTime: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  consultationType: 'online' | 'offline';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Admin Dashboard Types
export interface AdminStats {
  totalUsers: number;
  totalDoctors: number;
  totalBookings: number;
  pendingApprovals: number;
  revenueThisMonth: number;
  bookingsThisMonth: number;
  userGrowth: number;
  doctorGrowth: number;
}

export interface ChartData {
  name: string;
  value: number;
  date?: string;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  role: 'user' | 'doctor';
}

export interface DoctorRegistrationForm extends RegisterForm {
  specialization: string;
  experience: number;
  qualification: string;
  licenseNumber: string;
  consultationFee: number;
  bio: string;
}

export interface BookingForm {
  patientName: string;
  patientAge: number;
  symptoms: string;
  preferredDate: string;
  preferredTime: string;
  consultationType: 'online' | 'offline';
  notes?: string;
}



// Navigation Types
export type NavItem = 'home' | 'ai-health' | 'services' | 'contact' | 'admin' | 'bookings' | 'profile';
