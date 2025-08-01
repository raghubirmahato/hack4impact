import { postgresqlDatabaseService, User, Doctor, Appointment } from './postgresqlDatabaseService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export interface UserData {
  name: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profilePicture?: string;
}

export interface DoctorData {
  name: string;
  email: string;
  phone: string;
  specialization: string;
  yearsOfExperience: number;
  qualification: string;
  licenseNumber: string;
  hospitalAffiliation: string;
  consultationFee: number;
  bio: string;
  profilePicture?: string;
  availability: Array<{
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    isAvailable: boolean;
  }>;
}

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

class AuthService {
  private currentUser: User | null = null;
  private currentDoctor: Doctor | null = null;

  async registerUser(userData: UserData, password: string) {
    try {
      // Check if user already exists
      const existingUser = await postgresqlDatabaseService.getUserByEmail(userData.email);
      if (existingUser) {
        return { success: false, error: 'User with this email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10'));

      // Create new user
      const newUser = await postgresqlDatabaseService.createUser({
        ...userData,
        password: hashedPassword
      });

      // Set as current user
      this.currentUser = newUser;

      // Generate JWT token
      const token = jwt.sign(
        { userId: newUser.id, email: newUser.email, type: 'user' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return { success: true, user: newUser, token };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async registerDoctor(doctorData: DoctorData, password: string) {
    try {
      // Check if doctor already exists
      const existingDoctor = await postgresqlDatabaseService.getDoctorByEmail(doctorData.email);
      if (existingDoctor) {
        return { success: false, error: 'Doctor with this email already exists' };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '10'));

      // Create new doctor
      const newDoctor = await postgresqlDatabaseService.createDoctor({
        ...doctorData,
        password: hashedPassword
      });

      // Set as current doctor
      this.currentDoctor = newDoctor;

      // Generate JWT token
      const token = jwt.sign(
        { doctorId: newDoctor.id, email: newDoctor.email, type: 'doctor' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return { success: true, user: newDoctor, token };
    } catch (error: any) {
      return { success: false, error: error.message || 'Registration failed' };
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const user = await postgresqlDatabaseService.getUserByEmail(email);
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid password' };
      }

      // Set as current user
      this.currentUser = user;

      // Generate JWT token
      const token = jwt.sign(
        { userId: user.id, email: user.email, type: 'user' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return { success: true, user, userType: 'user', token };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async loginDoctor(email: string, password: string) {
    try {
      const doctor = await postgresqlDatabaseService.getDoctorByEmail(email);
      
      if (!doctor) {
        return { success: false, error: 'Doctor not found' };
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, doctor.password);
      if (!isValidPassword) {
        return { success: false, error: 'Invalid password' };
      }

      // Set as current doctor
      this.currentDoctor = doctor;

      // Generate JWT token
      const token = jwt.sign(
        { doctorId: doctor.id, email: doctor.email, type: 'doctor' },
        process.env.JWT_SECRET || 'default-secret',
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
      );

      return { success: true, user: doctor, userType: 'doctor', token };
    } catch (error: any) {
      return { success: false, error: error.message || 'Login failed' };
    }
  }

  async logout() {
    try {
      this.currentUser = null;
      this.currentDoctor = null;
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Logout failed' };
    }
  }

  getCurrentUser(): User | null {
    return this.currentUser;
  }

  getCurrentDoctor(): Doctor | null {
    return this.currentDoctor;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null || this.currentDoctor !== null;
  }

  getUserType(): 'user' | 'doctor' | null {
    if (this.currentUser) return 'user';
    if (this.currentDoctor) return 'doctor';
    return null;
  }

  async verifyToken(token: string): Promise<{ success: boolean; user?: User | Doctor; type?: string; error?: string }> {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default-secret') as any;
      
      if (decoded.type === 'user') {
        const user = await postgresqlDatabaseService.getUserById(decoded.userId);
        if (user) {
          this.currentUser = user;
          return { success: true, user, type: 'user' };
        }
      } else if (decoded.type === 'doctor') {
        const doctor = await postgresqlDatabaseService.getDoctorById(decoded.doctorId);
        if (doctor) {
          this.currentDoctor = doctor;
          return { success: true, user: doctor, type: 'doctor' };
        }
      }
      
      return { success: false, error: 'Invalid token' };
    } catch (error: any) {
      return { success: false, error: 'Token verification failed' };
    }
  }
}

export const authService = new AuthService();

// Doctor Service
export class DoctorService {
  static async getAllDoctors(): Promise<Doctor[]> {
    try {
      return await postgresqlDatabaseService.getAllDoctors();
    } catch (error) {
      console.error('Error fetching doctors:', error);
      return [];
    }
  }

  static async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    try {
      return await postgresqlDatabaseService.searchDoctors({ specialization });
    } catch (error) {
      console.error('Error fetching doctors by specialization:', error);
      return [];
    }
  }

  static async getDoctorById(doctorId: string): Promise<Doctor | null> {
    try {
      return await postgresqlDatabaseService.getDoctorById(doctorId);
    } catch (error) {
      console.error('Error fetching doctor:', error);
      return null;
    }
  }

  static async searchDoctors(query: string): Promise<Doctor[]> {
    try {
      return await postgresqlDatabaseService.searchDoctors({ query });
    } catch (error) {
      console.error('Error searching doctors:', error);
      return [];
    }
  }
}

// Booking Service
export class BookingService {
  static async createBooking(bookingData: {
    patientId: string;
    doctorId: string;
    appointmentDate: Date;
    appointmentTime: string;
    reason: string;
    status?: string;
  }): Promise<string> {
    try {
      const appointment = await postgresqlDatabaseService.createAppointment({
        ...bookingData,
        status: bookingData.status || 'scheduled'
      });
      return appointment.id;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create booking');
    }
  }

  static async getUserBookings(userId: string): Promise<Appointment[]> {
    try {
      return await postgresqlDatabaseService.getAppointmentsByPatient(userId);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
      return [];
    }
  }

  static async getDoctorBookings(doctorId: string): Promise<Appointment[]> {
    try {
      return await postgresqlDatabaseService.getAppointmentsByDoctor(doctorId);
    } catch (error) {
      console.error('Error fetching doctor bookings:', error);
      return [];
    }
  }

  static async updateBookingStatus(bookingId: string, status: string): Promise<void> {
    try {
      await postgresqlDatabaseService.updateAppointment(bookingId, { status });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update booking status');
    }
  }
}

// Admin Service
export class AdminService {
  static async getAdminStats(): Promise<AdminStats> {
    try {
      return await postgresqlDatabaseService.getAnalytics();
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      throw new Error('Failed to fetch admin statistics');
    }
  }

  static async approveDoctorRegistration(doctorId: string): Promise<void> {
    try {
      await postgresqlDatabaseService.updateDoctor(doctorId, { isApproved: true });
    } catch (error: any) {
      throw new Error(error.message || 'Failed to approve doctor');
    }
  }

  static async getPendingDoctors(): Promise<Doctor[]> {
    try {
      return await postgresqlDatabaseService.searchDoctors({ isApproved: false });
    } catch (error) {
      console.error('Error fetching pending doctors:', error);
      return [];
    }
  }
}