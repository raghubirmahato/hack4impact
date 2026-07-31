import { resolveApiUrl } from '../utils/apiUrl';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  profilePicture?: string;
  role: 'patient' | 'admin';
  isActive: boolean;
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  identityDocument?: VerificationDocument;
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'doctor';
  specialization: string;
  yearsOfExperience: number;
  experience?: number;
  hospitalAffiliation?: string;
  qualification: string;
  bio?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isAvailable: boolean; // Changed from isActive to isAvailable
  profilePicture?: string;
  consultationFee: number;
  availability?: any[]; // Added availability array
  availableSlots?: string[];
  createdAt: string;
  updatedAt: string;
  passwordHash?: string; // Added for authentication
  verificationStatus?: 'pending' | 'approved' | 'rejected';
  licenseNumber?: string;
  professionalRegistrationNumber?: string;
  identityDocument?: VerificationDocument;
  qualificationDocument?: VerificationDocument;
}

export interface VerificationDocument {
  type: string;
  number?: string;
  fileName: string;
  dataUrl?: string;
  submittedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  symptoms?: string;
  notes?: string;
  prescription?: any;
  followUpDate?: string;
  qrCode?: string;
  createdAt: string;
  updatedAt: string;
  
  // Joined data
  patientName?: string;
  doctorName?: string;
  doctorSpecialization?: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentId?: string;
  diagnosis?: string;
  symptoms?: string;
  treatment?: string;
  medications?: any[];
  labResults?: any[];
  notes?: string;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface QRCodeData {
  id: string;
  patientId: string;
  appointmentId?: string;
  qrCode: string;
  data: any;
  expiresAt?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

class ClientDatabaseService {
  private baseUrl = '/api'; // This would be your backend API URL

  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>, password: string): Promise<User> {
    const response = await fetch(resolveApiUrl(`${this.baseUrl}/users`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...userData, password }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create user');
    }
    
    return response.json();
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/users/${id}`));
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/users/email/${email}`));
      if (!response.ok) {
        return null;
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching user by email:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/users`));
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Doctor Management
  async createDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt'>): Promise<Doctor> {
    const response = await fetch(resolveApiUrl(`${this.baseUrl}/doctors`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(doctorData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create doctor');
    }
    
    return response.json();
  }

  async getAllDoctors(): Promise<Doctor[]> {
    try {
      // Fetch doctors from API
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/doctors`));
      let apiDoctors: Doctor[] = [];
      
      if (response.ok) {
        apiDoctors = await response.json();
      }
      
      // Also get demo doctors from localStorage for development
      const demoDoctors = JSON.parse(localStorage.getItem('goodhealth_doctors') || '[]');
      
      // Combine API doctors and demo doctors, removing duplicates by email
      const allDoctors = [...apiDoctors];
      demoDoctors.forEach((demoDoctor: Doctor) => {
        if (!allDoctors.find(doctor => doctor.email === demoDoctor.email)) {
          allDoctors.push(demoDoctor);
        }
      });
      
      // Filter only active and available doctors
      const availableDoctors = allDoctors.filter((doctor: Doctor) => 
        doctor.isAvailable !== false && doctor.isVerified !== false
      );
      
      return availableDoctors;
    } catch (error) {
      console.error('Error fetching doctors:', error);
      // Fallback to localStorage only
      const doctors = JSON.parse(localStorage.getItem('goodhealth_doctors') || '[]');
      return doctors.filter((doctor: Doctor) => 
        doctor.isAvailable !== false && doctor.isVerified !== false
      );
    }
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    try {
      // First try to fetch from API
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/doctors/${id}`));
      if (response.ok) {
        return await response.json();
      }
      
      // Fallback to localStorage only if API fails
      const doctors = JSON.parse(localStorage.getItem('goodhealth_doctors') || '[]');
      const doctor = doctors.find((d: Doctor) => d.id === id);
      return doctor || null;
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  }

  // Appointment Management
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    try {
      // Use localStorage for mock system
      const appointments = JSON.parse(localStorage.getItem('goodhealth_appointments') || '[]');
      const newAppointment: Appointment = {
        ...appointmentData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      appointments.push(newAppointment);
      localStorage.setItem('goodhealth_appointments', JSON.stringify(appointments));
      
      return newAppointment;
    } catch (error) {
      console.error('Error creating appointment:', error);
      throw new Error('Failed to create appointment');
    }
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    try {
      // Use localStorage for mock system
      const appointments = JSON.parse(localStorage.getItem('goodhealth_appointments') || '[]');
      return appointments.filter((appointment: Appointment) => appointment.patientId === patientId);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      return [];
    }
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    try {
      // Use localStorage for mock system
      const appointments = JSON.parse(localStorage.getItem('goodhealth_appointments') || '[]');
      return appointments.filter((appointment: Appointment) => appointment.doctorId === doctorId);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return [];
    }
  }

  async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<boolean> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/appointments/${id}/status`), {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });
      return response.ok;
    } catch (error) {
      console.error('Error updating appointment status:', error);
      return false;
    }
  }

  // Health Tips
  async getAllHealthTips(): Promise<HealthTip[]> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/health-tips`));
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching health tips:', error);
      return [];
    }
  }

  async getFeaturedHealthTips(): Promise<HealthTip[]> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/health-tips/featured`));
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching featured health tips:', error);
      return [];
    }
  }

  // QR Code Management
  async generateQRCode(patientId: string, appointmentId?: string): Promise<QRCodeData> {
    const response = await fetch(resolveApiUrl(`${this.baseUrl}/qr-codes`), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ patientId, appointmentId }),
    });
    
    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    
    return response.json();
  }

  async getQRCodesByPatient(patientId: string): Promise<QRCodeData[]> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/qr-codes/patient/${patientId}`));
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching QR codes:', error);
      return [];
    }
  }
}

// Export singleton instance
export const clientDatabaseService = new ClientDatabaseService();
export default clientDatabaseService;
