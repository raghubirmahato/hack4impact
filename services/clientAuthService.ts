// Client-side Auth Service for Good Health AI
// This service makes API calls to the backend instead of direct database connections

import { clientDatabaseService, User, Doctor, Appointment, VerificationDocument } from './clientDatabaseService';
import { STORAGE_KEYS } from '../constants/storage';
import { resolveApiUrl } from '../utils/apiUrl';

export interface UserData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profilePicture?: string;
  identityDocument: VerificationDocument;
}

export interface DoctorData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  qualification: string;
  bio?: string;
  consultationFee: number;
  profilePicture?: string;
  licenseNumber: string;
  professionalRegistrationNumber: string;
  hospitalAffiliation: string;
  identityDocument: VerificationDocument;
  qualificationDocument: VerificationDocument;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User | Doctor;
  token?: string;
  message?: string;
}

class ClientAuthService {
  private baseUrl = '/api/auth';
  private currentUser: User | Doctor | null = null;
  private authToken: string | null = null;
  
  // Demo doctors for development
  private demoDoctors: Doctor[] = [
    {
      id: 'demo-doctor-1',
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@demo.com',
      phone: '+1234567891',
      specialization: 'Cardiology',
      yearsOfExperience: 15,
      qualification: 'MD, FACC',
      bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
      consultationFee: 200,
      profilePicture: '',
      rating: 4.8,
      totalReviews: 156,
      isVerified: true,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      availability: [
        { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true }
      ]
    },
    {
      id: 'demo-doctor-2',
      name: 'Dr. Michael Chen',
      email: 'michael.chen@demo.com',
      phone: '+1234567892',
      specialization: 'Dermatology',
      yearsOfExperience: 12,
      qualification: 'MD, FAAD',
      bio: 'Board-certified dermatologist with expertise in skin cancer detection and cosmetic procedures.',
      consultationFee: 180,
      profilePicture: '',
      rating: 4.9,
      totalReviews: 203,
      isVerified: true,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      availability: [
        { id: '1', dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { id: '2', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { id: '3', dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { id: '4', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { id: '5', dayOfWeek: 5, startTime: '08:00', endTime: '14:00', isAvailable: true }
      ]
    },
    {
      id: 'demo-doctor-3',
      name: 'Dr. Emily Rodriguez',
      email: 'emily.rodriguez@demo.com',
      phone: '+1234567893',
      specialization: 'Pediatrics',
      yearsOfExperience: 10,
      qualification: 'MD, FAAP',
      bio: 'Pediatrician dedicated to providing comprehensive healthcare for children and adolescents.',
      consultationFee: 150,
      profilePicture: '',
      rating: 4.7,
      totalReviews: 89,
      isVerified: true,
      isAvailable: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      availability: [
        { id: '1', dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { id: '2', dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { id: '3', dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { id: '4', dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
        { id: '5', dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isAvailable: true }
      ]
    }
  ];

  constructor() {
    // Try to restore session from localStorage
    this.restoreSession();
    // Initialize demo users for development
    this.initializeDemoUsers();
  }

  // Public method to manually trigger demo initialization (for testing)
  public reinitializeDemoData(): void {
    console.log('Manually triggering demo data initialization...');
    this.initializeDemoUsers();
  }

  // Initialize demo users for development testing
  private initializeDemoUsers(): void {
    const users = JSON.parse(localStorage.getItem('goodhealth_users') || '[]');
    const doctors = JSON.parse(localStorage.getItem('goodhealth_doctors') || '[]');

    // Add demo patient if not exists
    if (users.length === 0) {
      const demoUser = {
        id: 'demo-user-1',
        name: 'John Doe',
        email: 'patient@demo.com',
        phone: '+1234567890',
        role: 'patient',
        dateOfBirth: '1990-01-01',
        gender: 'male',
        address: '123 Demo Street, Demo City',
        profilePicture: '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        isActive: true,
        passwordHash: 'demo123'
      };
      users.push(demoUser);
      localStorage.setItem('goodhealth_users', JSON.stringify(users));
    }

    if (!users.some((user: User) => user.email === 'admin@demo.com')) {
      users.push({
        id: 'demo-admin-1', name: 'Platform Admin', email: 'admin@demo.com', phone: '+1234567899',
        role: 'admin', isActive: true, passwordHash: 'demo123', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString()
      });
      localStorage.setItem('goodhealth_users', JSON.stringify(users));
    }

    // Add demo doctors if they don't exist (check by ID to avoid duplicates)
    const demoDoctorIds = this.demoDoctors.map(d => d.id);
    const existingDoctorIds = doctors.map((d: any) => d.id);
    const missingDemoIds = demoDoctorIds.filter(id => !existingDoctorIds.includes(id));
    
    if (missingDemoIds.length > 0) {
      // Only add missing demo doctors
      const doctorsToAdd = this.demoDoctors.filter(demo => missingDemoIds.includes(demo.id));
      doctors.push(...doctorsToAdd);
      localStorage.setItem('goodhealth_doctors', JSON.stringify(doctors));
    }
  }

  // User Registration
  async registerUser(userData: UserData, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/register`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...userData, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.token) this.setSession(result.user, result.token);
        return result;
      } else {
        return {
          success: false,
          message: result.message || 'Registration failed'
        };
      }
    } catch {
      const users: User[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
      if (users.some(user => user.email.toLowerCase() === userData.email.toLowerCase())) return { success: false, message: 'An account with this email already exists.' };
      const now = new Date().toISOString();
      const user: User = { id: crypto.randomUUID(), ...userData, passwordHash: password, role: 'patient', isActive: false, verificationStatus: 'pending', createdAt: now, updatedAt: now };
      users.push(user); localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
      return { success: true, user, message: 'Identity evidence submitted for administrator review.' };
    }
  }

  // Doctor Registration
  async registerDoctor(doctorData: DoctorData, password: string): Promise<AuthResponse> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/register-doctor`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ doctorData, password }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        if (result.token) this.setSession(result.user, result.token);
        return result;
      } else {
        return {
          success: false,
          message: result.message || 'Doctor registration failed'
        };
      }
    } catch {
      const doctors: Doctor[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS) || '[]');
      if (doctors.some(doctor => doctor.email.toLowerCase() === doctorData.email.toLowerCase())) return { success: false, message: 'An account with this email already exists.' };
      const now = new Date().toISOString();
      const doctor: Doctor = { id: crypto.randomUUID(), ...doctorData, passwordHash: password, rating: 0, totalReviews: 0, isVerified: false, isAvailable: false, verificationStatus: 'pending', createdAt: now, updatedAt: now };
      doctors.push(doctor); localStorage.setItem(STORAGE_KEYS.DOCTORS, JSON.stringify(doctors));
      return { success: true, user: doctor, message: 'Professional credentials submitted for administrator review.' };
    }
  }

  // User Login
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/login`), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        this.setSession(result.user, result.token);
        return result;
      } else {
        return {
          success: false,
          message: result.message || 'Login failed'
        };
      }
    } catch (error) {
      // Offline demo mode keeps the UI usable without a running API server.
      const people = [
        ...JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]'),
        ...JSON.parse(localStorage.getItem(STORAGE_KEYS.DOCTORS) || '[]')
      ] as Array<User | Doctor>;
      const person = people.find(item => item.email.toLowerCase() === credentials.email.trim().toLowerCase() && item.passwordHash === credentials.password);
      if (person) {
        if (person.verificationStatus === 'pending' || ('isActive' in person && !person.isActive) || ('isVerified' in person && !person.isVerified)) {
          return { success: false, message: 'Your account is awaiting administrator approval.' };
        }
        const token = `demo.${person.id}.${Date.now()}`;
        this.setSession(person, token);
        return { success: true, user: person, token };
      }
      return { success: false, message: 'Invalid email or password.' };
    }
  }

  // Logout
  logout(): void {
    this.currentUser = null;
    this.authToken = null;
    localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem('goodhealth_token');
    localStorage.removeItem('goodhealth_user');
  }

  // Method to reset demo data for testing
  resetDemoData(): void {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.DOCTORS);
    localStorage.removeItem(STORAGE_KEYS.APPOINTMENTS);
    this.initializeDemoUsers();
  }

  // Get current user
  getCurrentUser(): User | Doctor | null {
    return this.currentUser;
  }

  // Get current doctor (returns doctor if current user is a doctor, null otherwise)
  getCurrentDoctor(): Doctor | null {
    if (this.currentUser && 'specialization' in this.currentUser) {
      return this.currentUser as Doctor;
    }
    return null;
  }

  // Get user type
  getUserType(): 'user' | 'doctor' | 'admin' | null {
    if (!this.currentUser) return null;
    
    if ('specialization' in this.currentUser) {
      return 'doctor';
    }
    
    if ('role' in this.currentUser) {
      if (this.currentUser.role === 'admin') {
        return 'admin';
      }
      return 'user';
    }
    
    return 'user';
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null && this.authToken !== null;
  }

  // Check if current user is a doctor
  isDoctor(): boolean {
    return this.currentUser !== null && 'specialization' in this.currentUser;
  }

  // Check if current user is a patient
  isPatient(): boolean {
    return this.currentUser !== null && 'role' in this.currentUser && this.currentUser.role === 'patient';
  }

  // Check if current user is an admin
  isAdmin(): boolean {
    return this.currentUser !== null && 'role' in this.currentUser && this.currentUser.role === 'admin';
  }

  // Get auth token
  getAuthToken(): string | null {
    return this.authToken;
  }

  // Update user profile
  async updateProfile(userData: Partial<UserData | DoctorData>): Promise<AuthResponse> {
    if (!this.currentUser || !this.authToken) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const isDoctor = 'specialization' in this.currentUser;
      
      if (isDoctor) {
        // Update doctor profile
        const doctors = JSON.parse(localStorage.getItem('goodhealth_doctors') || '[]');
        const doctorIndex = doctors.findIndex((d: any) => d.id === this.currentUser!.id);
        
        if (doctorIndex !== -1) {
          doctors[doctorIndex] = { ...doctors[doctorIndex], ...userData, updatedAt: new Date().toISOString() };
          localStorage.setItem('goodhealth_doctors', JSON.stringify(doctors));
          
          // Update current user
          this.currentUser = { ...this.currentUser, ...userData };
          localStorage.setItem('goodhealth_current_user', JSON.stringify(this.currentUser));
          
          return { success: true, user: this.currentUser };
        }
      } else {
        // Update patient profile
        const users = JSON.parse(localStorage.getItem('goodhealth_users') || '[]');
        const userIndex = users.findIndex((u: any) => u.id === this.currentUser!.id);
        
        if (userIndex !== -1) {
          users[userIndex] = { ...users[userIndex], ...userData, updatedAt: new Date().toISOString() };
          localStorage.setItem('goodhealth_users', JSON.stringify(users));
          
          // Update current user
          this.currentUser = { ...this.currentUser, ...userData };
          localStorage.setItem('goodhealth_current_user', JSON.stringify(this.currentUser));
          
          return { success: true, user: this.currentUser };
        }
      }
      
      return { success: false, message: 'User not found' };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, message: 'Failed to update profile' };
    }
  }

  // Change password
  async changePassword(currentPassword: string, newPassword: string): Promise<AuthResponse> {
    if (!this.currentUser || !this.authToken) {
      return { success: false, message: 'Not authenticated' };
    }

    try {
      const isDoctor = 'specialization' in this.currentUser;
      
      if (isDoctor) {
        // Change doctor password
        const doctors = JSON.parse(localStorage.getItem('goodhealth_doctors') || '[]');
        const doctor = doctors.find((d: any) => d.id === this.currentUser!.id);
        
        if (doctor && doctor.passwordHash === currentPassword) {
          const doctorIndex = doctors.findIndex((d: any) => d.id === this.currentUser!.id);
          doctors[doctorIndex].passwordHash = newPassword;
          doctors[doctorIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('goodhealth_doctors', JSON.stringify(doctors));
          
          return { success: true, message: 'Password changed successfully' };
        } else {
          return { success: false, message: 'Current password is incorrect' };
        }
      } else {
        // Change patient password
        const users = JSON.parse(localStorage.getItem('goodhealth_users') || '[]');
        const user = users.find((u: any) => u.id === this.currentUser!.id);
        
        if (user && user.passwordHash === currentPassword) {
          const userIndex = users.findIndex((u: any) => u.id === this.currentUser!.id);
          users[userIndex].passwordHash = newPassword;
          users[userIndex].updatedAt = new Date().toISOString();
          localStorage.setItem('goodhealth_users', JSON.stringify(users));
          
          return { success: true, message: 'Password changed successfully' };
        } else {
          return { success: false, message: 'Current password is incorrect' };
        }
      }
    } catch (error) {
      console.error('Password change error:', error);
      return { success: false, message: 'Failed to change password' };
    }
  }

  // Private methods
  private setSession(user: User | Doctor, token: string): void {
    this.currentUser = user;
    this.authToken = token;
    localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    // Also save under secondary keys for backward compatibility with booking and chat services
    localStorage.setItem('goodhealth_token', token);
    localStorage.setItem('goodhealth_user', JSON.stringify(user));
  }

  private restoreSession(): void {
    try {
      const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('goodhealth_token');
      const userStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('goodhealth_user');
      
      if (token && userStr) {
        this.authToken = token;
        this.currentUser = JSON.parse(userStr);
      }
    } catch (error) {
      console.error('Session restoration error:', error);
      this.logout();
    }
  }
}

// Admin Service
export class AdminService {
  private baseUrl = '/api/admin';

  async getAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.baseUrl}/users`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  async getAllDoctors(): Promise<Doctor[]> {
    try {
      const response = await fetch(`${this.baseUrl}/doctors`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }

  async getAllAppointments(): Promise<Appointment[]> {
    try {
      const response = await fetch(`${this.baseUrl}/appointments`);
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching appointments:', error);
      return [];
    }
  }

  async verifyDoctor(doctorId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/doctors/${doctorId}/verify`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error verifying doctor:', error);
      return false;
    }
  }

  async deactivateUser(userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/users/${userId}/deactivate`, {
        method: 'POST',
      });
      return response.ok;
    } catch (error) {
      console.error('Error deactivating user:', error);
      return false;
    }
  }
}

export const authService = new ClientAuthService();

// Doctor Service
export class DoctorService {
  static async getAllDoctors(): Promise<Doctor[]> {
    try {
      return await clientDatabaseService.getAllDoctors();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }

  static async getDoctorById(id: string): Promise<Doctor | null> {
    try {
      return await clientDatabaseService.getDoctorById(id);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  }

  static async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    try {
      return await clientDatabaseService.getAppointmentsByDoctor(doctorId);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      return [];
    }
  }
}
