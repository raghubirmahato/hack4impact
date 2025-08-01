import { pool } from '../config/database';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import QRCode from 'qrcode';

// Enhanced interfaces for PostgreSQL
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
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  passwordHash?: string;
  specialization: string;
  yearsOfExperience: number;
  qualification: string;
  licenseNumber: string;
  hospitalAffiliation?: string;
  consultationFee: number;
  bio?: string;
  profilePicture?: string;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  isActive: boolean;
  availability: DoctorAvailability[];
  createdAt: string;
  updatedAt: string;
}

export interface DoctorAvailability {
  id: string;
  doctorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  appointmentTime: string;
  durationMinutes: number;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';
  reason?: string;
  notes?: string;
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
  recordDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Prescription {
  id: string;
  patientId: string;
  doctorId: string;
  medicalRecordId: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  isActive: boolean;
  prescribedDate: string;
  createdAt: string;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  authorId?: string;
  isFeatured: boolean;
  views: number;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysis {
  id: string;
  userId: string;
  analysisType: string;
  inputData: any;
  result: any;
  confidenceScore?: number;
  createdAt: string;
}

export interface QRCodeData {
  id: string;
  appointmentId: string;
  qrData: string;
  qrImage: string;
  isUsed: boolean;
  expiresAt?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId?: string;
  doctorId?: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

class PostgreSQLDatabaseService {
  // User Management
  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash'>, password: string): Promise<User> {
    const client = await pool.connect();
    try {
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
      const id = uuidv4();
      
      const query = `
        INSERT INTO users (id, name, email, phone, password_hash, date_of_birth, gender, address, profile_picture, role, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING id, name, email, phone, date_of_birth, gender, address, profile_picture, role, is_active, created_at, updated_at
      `;
      
      const values = [
        id,
        userData.name,
        userData.email,
        userData.phone,
        passwordHash,
        userData.dateOfBirth || null,
        userData.gender || null,
        userData.address || null,
        userData.profilePicture || null,
        userData.role || 'patient',
        userData.isActive !== false
      ];
      
      const result = await client.query(query, values);
      return this.mapUserRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getUserByEmail(email: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE email = $1 AND is_active = true';
      const result = await client.query(query, [email]);
      return result.rows.length > 0 ? this.mapUserRow(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async getUserById(id: string): Promise<User | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE id = $1 AND is_active = true';
      const result = await client.query(query, [id]);
      return result.rows.length > 0 ? this.mapUserRow(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    const client = await pool.connect();
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          const dbKey = this.camelToSnake(key);
          setClause.push(`${dbKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (setClause.length === 0) return null;

      const query = `
        UPDATE users 
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount} AND is_active = true
        RETURNING *
      `;
      values.push(id);

      const result = await client.query(query, values);
      return result.rows.length > 0 ? this.mapUserRow(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  async getAllUsers(): Promise<User[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM users WHERE is_active = true ORDER BY created_at DESC';
      const result = await client.query(query);
      return result.rows.map(row => this.mapUserRow(row));
    } finally {
      client.release();
    }
  }

  // Doctor Management
  async createDoctor(doctorData: Omit<Doctor, 'id' | 'createdAt' | 'updatedAt' | 'passwordHash' | 'availability'>, password: string): Promise<Doctor> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const passwordHash = await bcrypt.hash(password, parseInt(process.env.BCRYPT_ROUNDS || '12'));
      const id = uuidv4();
      
      const doctorQuery = `
        INSERT INTO doctors (id, name, email, phone, password_hash, specialization, years_of_experience, 
                           qualification, license_number, hospital_affiliation, consultation_fee, bio, 
                           profile_picture, rating, total_reviews, is_verified, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
        RETURNING *
      `;
      
      const doctorValues = [
        id,
        doctorData.name,
        doctorData.email,
        doctorData.phone,
        passwordHash,
        doctorData.specialization,
        doctorData.yearsOfExperience,
        doctorData.qualification,
        doctorData.licenseNumber,
        doctorData.hospitalAffiliation || null,
        doctorData.consultationFee,
        doctorData.bio || null,
        doctorData.profilePicture || null,
        doctorData.rating || 0,
        doctorData.totalReviews || 0,
        doctorData.isVerified || false,
        doctorData.isActive !== false
      ];
      
      const doctorResult = await client.query(doctorQuery, doctorValues);
      
      // Add default availability (Monday to Friday, 9 AM to 5 PM)
      const availabilityQuery = `
        INSERT INTO doctor_availability (id, doctor_id, day_of_week, start_time, end_time, is_available)
        VALUES ($1, $2, $3, $4, $5, $6)
      `;
      
      for (let day = 1; day <= 5; day++) {
        await client.query(availabilityQuery, [
          uuidv4(),
          id,
          day,
          '09:00',
          '17:00',
          true
        ]);
      }
      
      await client.query('COMMIT');
      
      const doctor = this.mapDoctorRow(doctorResult.rows[0]);
      doctor.availability = await this.getDoctorAvailability(id);
      return doctor;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getDoctorByEmail(email: string): Promise<Doctor | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM doctors WHERE email = $1 AND is_active = true';
      const result = await client.query(query, [email]);
      if (result.rows.length === 0) return null;
      
      const doctor = this.mapDoctorRow(result.rows[0]);
      doctor.availability = await this.getDoctorAvailability(doctor.id);
      return doctor;
    } finally {
      client.release();
    }
  }

  async getDoctorById(id: string): Promise<Doctor | null> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM doctors WHERE id = $1 AND is_active = true';
      const result = await client.query(query, [id]);
      if (result.rows.length === 0) return null;
      
      const doctor = this.mapDoctorRow(result.rows[0]);
      doctor.availability = await this.getDoctorAvailability(id);
      return doctor;
    } finally {
      client.release();
    }
  }

  async getAllDoctors(): Promise<Doctor[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM doctors WHERE is_active = true ORDER BY rating DESC, total_reviews DESC';
      const result = await client.query(query);
      
      const doctors = await Promise.all(
        result.rows.map(async (row) => {
          const doctor = this.mapDoctorRow(row);
          doctor.availability = await this.getDoctorAvailability(doctor.id);
          return doctor;
        })
      );
      
      return doctors;
    } finally {
      client.release();
    }
  }

  async searchDoctors(filters: {
    specialization?: string;
    name?: string;
    hospital?: string;
    minRating?: number;
    maxFee?: number;
    isAvailable?: boolean;
  }): Promise<Doctor[]> {
    const client = await pool.connect();
    try {
      let query = 'SELECT * FROM doctors WHERE is_active = true';
      const values: any[] = [];
      let paramCount = 1;

      if (filters.specialization) {
        query += ` AND LOWER(specialization) LIKE LOWER($${paramCount})`;
        values.push(`%${filters.specialization}%`);
        paramCount++;
      }

      if (filters.name) {
        query += ` AND LOWER(name) LIKE LOWER($${paramCount})`;
        values.push(`%${filters.name}%`);
        paramCount++;
      }

      if (filters.hospital) {
        query += ` AND LOWER(hospital_affiliation) LIKE LOWER($${paramCount})`;
        values.push(`%${filters.hospital}%`);
        paramCount++;
      }

      if (filters.minRating) {
        query += ` AND rating >= $${paramCount}`;
        values.push(filters.minRating);
        paramCount++;
      }

      if (filters.maxFee) {
        query += ` AND consultation_fee <= $${paramCount}`;
        values.push(filters.maxFee);
        paramCount++;
      }

      query += ' ORDER BY rating DESC, total_reviews DESC';

      const result = await client.query(query, values);
      
      const doctors = await Promise.all(
        result.rows.map(async (row) => {
          const doctor = this.mapDoctorRow(row);
          doctor.availability = await this.getDoctorAvailability(doctor.id);
          return doctor;
        })
      );
      
      return doctors;
    } finally {
      client.release();
    }
  }

  private async getDoctorAvailability(doctorId: string): Promise<DoctorAvailability[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM doctor_availability WHERE doctor_id = $1 ORDER BY day_of_week';
      const result = await client.query(query, [doctorId]);
      return result.rows.map(row => ({
        id: row.id,
        doctorId: row.doctor_id,
        dayOfWeek: row.day_of_week,
        startTime: row.start_time,
        endTime: row.end_time,
        isAvailable: row.is_available,
        createdAt: row.created_at
      }));
    } finally {
      client.release();
    }
  }

  // Appointment Management
  async createAppointment(appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'updatedAt'>): Promise<Appointment> {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const qrData = `appointment:${id}:${appointmentData.patientId}:${appointmentData.doctorId}`;
      const qrCode = await QRCode.toDataURL(qrData);
      
      const query = `
        INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, 
                                duration_minutes, status, reason, notes, qr_code)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *
      `;
      
      const values = [
        id,
        appointmentData.patientId,
        appointmentData.doctorId,
        appointmentData.appointmentDate,
        appointmentData.appointmentTime,
        appointmentData.durationMinutes || 30,
        appointmentData.status || 'scheduled',
        appointmentData.reason || null,
        appointmentData.notes || null,
        qrCode
      ];
      
      const result = await client.query(query, values);
      
      // Create QR code record
      await this.createQRCode({
        appointmentId: id,
        qrData,
        qrImage: qrCode,
        isUsed: false,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours
      });
      
      return this.mapAppointmentRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getAppointmentsByPatient(patientId: string): Promise<Appointment[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT a.*, u.name as patient_name, d.name as doctor_name, d.specialization as doctor_specialization
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.patient_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      const result = await client.query(query, [patientId]);
      return result.rows.map(row => this.mapAppointmentRow(row));
    } finally {
      client.release();
    }
  }

  async getAppointmentsByDoctor(doctorId: string): Promise<Appointment[]> {
    const client = await pool.connect();
    try {
      const query = `
        SELECT a.*, u.name as patient_name, d.name as doctor_name, d.specialization as doctor_specialization
        FROM appointments a
        JOIN users u ON a.patient_id = u.id
        JOIN doctors d ON a.doctor_id = d.id
        WHERE a.doctor_id = $1
        ORDER BY a.appointment_date DESC, a.appointment_time DESC
      `;
      const result = await client.query(query, [doctorId]);
      return result.rows.map(row => this.mapAppointmentRow(row));
    } finally {
      client.release();
    }
  }

  async updateAppointment(id: string, updates: Partial<Appointment>): Promise<Appointment | null> {
    const client = await pool.connect();
    try {
      const setClause = [];
      const values = [];
      let paramCount = 1;

      for (const [key, value] of Object.entries(updates)) {
        if (key !== 'id' && key !== 'createdAt' && key !== 'updatedAt') {
          const dbKey = this.camelToSnake(key);
          setClause.push(`${dbKey} = $${paramCount}`);
          values.push(value);
          paramCount++;
        }
      }

      if (setClause.length === 0) return null;

      const query = `
        UPDATE appointments 
        SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP
        WHERE id = $${paramCount}
        RETURNING *
      `;
      values.push(id);

      const result = await client.query(query, values);
      return result.rows.length > 0 ? this.mapAppointmentRow(result.rows[0]) : null;
    } finally {
      client.release();
    }
  }

  // QR Code Management
  async createQRCode(qrData: Omit<QRCodeData, 'id' | 'createdAt'>): Promise<QRCodeData> {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const query = `
        INSERT INTO qr_codes (id, appointment_id, qr_data, qr_image, is_used, expires_at)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
      `;
      
      const values = [
        id,
        qrData.appointmentId,
        qrData.qrData,
        qrData.qrImage,
        qrData.isUsed || false,
        qrData.expiresAt || null
      ];
      
      const result = await client.query(query, values);
      return this.mapQRCodeRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  // Health Tips Management
  async createHealthTip(tipData: Omit<HealthTip, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthTip> {
    const client = await pool.connect();
    try {
      const id = uuidv4();
      const query = `
        INSERT INTO health_tips (id, title, content, category, author_id, is_featured, views)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING *
      `;
      
      const values = [
        id,
        tipData.title,
        tipData.content,
        tipData.category,
        tipData.authorId || null,
        tipData.isFeatured || false,
        tipData.views || 0
      ];
      
      const result = await client.query(query, values);
      return this.mapHealthTipRow(result.rows[0]);
    } finally {
      client.release();
    }
  }

  async getAllHealthTips(): Promise<HealthTip[]> {
    const client = await pool.connect();
    try {
      const query = 'SELECT * FROM health_tips ORDER BY is_featured DESC, created_at DESC';
      const result = await client.query(query);
      return result.rows.map(row => this.mapHealthTipRow(row));
    } finally {
      client.release();
    }
  }

  // Authentication
  async verifyPassword(email: string, password: string, isDoctor: boolean = false): Promise<User | Doctor | null> {
    const client = await pool.connect();
    try {
      const table = isDoctor ? 'doctors' : 'users';
      const query = `SELECT * FROM ${table} WHERE email = $1 AND is_active = true`;
      const result = await client.query(query, [email]);
      
      if (result.rows.length === 0) return null;
      
      const user = result.rows[0];
      const isValid = await bcrypt.compare(password, user.password_hash);
      
      if (!isValid) return null;
      
      if (isDoctor) {
        const doctor = this.mapDoctorRow(user);
        doctor.availability = await this.getDoctorAvailability(doctor.id);
        return doctor;
      } else {
        return this.mapUserRow(user);
      }
    } finally {
      client.release();
    }
  }

  // Analytics
  async getAnalytics(): Promise<any> {
    const client = await pool.connect();
    try {
      const [usersResult, doctorsResult, appointmentsResult] = await Promise.all([
        client.query('SELECT COUNT(*) as count FROM users WHERE is_active = true'),
        client.query('SELECT COUNT(*) as count FROM doctors WHERE is_active = true'),
        client.query('SELECT COUNT(*) as count FROM appointments')
      ]);

      const specializationResult = await client.query(`
        SELECT specialization, COUNT(*) as count 
        FROM doctors 
        WHERE is_active = true 
        GROUP BY specialization 
        ORDER BY count DESC 
        LIMIT 5
      `);

      return {
        totalUsers: parseInt(usersResult.rows[0].count),
        totalDoctors: parseInt(doctorsResult.rows[0].count),
        totalAppointments: parseInt(appointmentsResult.rows[0].count),
        popularSpecializations: specializationResult.rows
      };
    } finally {
      client.release();
    }
  }

  // Utility methods
  private mapUserRow(row: any): User {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      dateOfBirth: row.date_of_birth,
      gender: row.gender,
      address: row.address,
      profilePicture: row.profile_picture,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapDoctorRow(row: any): Doctor {
    return {
      id: row.id,
      name: row.name,
      email: row.email,
      phone: row.phone,
      specialization: row.specialization,
      yearsOfExperience: row.years_of_experience,
      qualification: row.qualification,
      licenseNumber: row.license_number,
      hospitalAffiliation: row.hospital_affiliation,
      consultationFee: parseFloat(row.consultation_fee),
      bio: row.bio,
      profilePicture: row.profile_picture,
      rating: parseFloat(row.rating),
      totalReviews: row.total_reviews,
      isVerified: row.is_verified,
      isActive: row.is_active,
      availability: [], // Will be populated separately
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapAppointmentRow(row: any): Appointment {
    return {
      id: row.id,
      patientId: row.patient_id,
      doctorId: row.doctor_id,
      appointmentDate: row.appointment_date,
      appointmentTime: row.appointment_time,
      durationMinutes: row.duration_minutes,
      status: row.status,
      reason: row.reason,
      notes: row.notes,
      qrCode: row.qr_code,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      patientName: row.patient_name,
      doctorName: row.doctor_name,
      doctorSpecialization: row.doctor_specialization
    };
  }

  private mapHealthTipRow(row: any): HealthTip {
    return {
      id: row.id,
      title: row.title,
      content: row.content,
      category: row.category,
      authorId: row.author_id,
      isFeatured: row.is_featured,
      views: row.views,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };
  }

  private mapQRCodeRow(row: any): QRCodeData {
    return {
      id: row.id,
      appointmentId: row.appointment_id,
      qrData: row.qr_data,
      qrImage: row.qr_image,
      isUsed: row.is_used,
      expiresAt: row.expires_at,
      createdAt: row.created_at
    };
  }

  private camelToSnake(str: string): string {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
  }

  // Seed sample data
  async seedSampleData(): Promise<void> {
    const client = await pool.connect();
    try {
      // Check if data already exists
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      if (parseInt(userCount.rows[0].count) > 0) {
        console.log('Sample data already exists, skipping seed...');
        return;
      }

      console.log('Seeding sample data...');

      // Create sample doctors
      const sampleDoctors = [
        {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@goodhealth.ai',
          phone: '+1234567890',
          specialization: 'Cardiology',
          yearsOfExperience: 15,
          qualification: 'MD, FACC',
          licenseNumber: 'MD12345',
          hospitalAffiliation: 'City General Hospital',
          consultationFee: 200,
          bio: 'Experienced cardiologist specializing in heart disease prevention and treatment.',
          rating: 4.8,
          totalReviews: 156,
          isVerified: true,
          isActive: true
        },
        {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@goodhealth.ai',
          phone: '+1234567891',
          specialization: 'Dermatology',
          yearsOfExperience: 12,
          qualification: 'MD, FAAD',
          licenseNumber: 'MD12346',
          hospitalAffiliation: 'Skin Care Center',
          consultationFee: 150,
          bio: 'Board-certified dermatologist with expertise in skin cancer detection and cosmetic procedures.',
          rating: 4.9,
          totalReviews: 203,
          isVerified: true,
          isActive: true
        },
        {
          name: 'Dr. Emily Rodriguez',
          email: 'emily.rodriguez@goodhealth.ai',
          phone: '+1234567892',
          specialization: 'Pediatrics',
          yearsOfExperience: 10,
          qualification: 'MD, FAAP',
          licenseNumber: 'MD12347',
          hospitalAffiliation: 'Children\'s Medical Center',
          consultationFee: 120,
          bio: 'Dedicated pediatrician providing comprehensive care for children from infancy through adolescence.',
          rating: 4.7,
          totalReviews: 89,
          isVerified: true,
          isActive: true
        }
      ];

      for (const doctor of sampleDoctors) {
        await this.createDoctor(doctor, 'doctor123');
      }

      // Create sample health tips
      const sampleHealthTips = [
        {
          title: 'Stay Hydrated for Better Health',
          content: 'Drinking adequate water is essential for maintaining good health. Aim for 8-10 glasses of water daily to keep your body properly hydrated.',
          category: 'General Health',
          isFeatured: true,
          views: 1250
        },
        {
          title: 'The Importance of Regular Exercise',
          content: 'Regular physical activity helps maintain a healthy weight, reduces the risk of chronic diseases, and improves mental health.',
          category: 'Fitness',
          isFeatured: false,
          views: 890
        },
        {
          title: 'Heart-Healthy Diet Tips',
          content: 'Include plenty of fruits, vegetables, whole grains, and lean proteins in your diet. Limit saturated fats, sodium, and added sugars.',
          category: 'Nutrition',
          isFeatured: true,
          views: 1456
        }
      ];

      for (const tip of sampleHealthTips) {
        await this.createHealthTip(tip);
      }

      console.log('✅ Sample data seeded successfully');
    } catch (error) {
      console.error('❌ Error seeding sample data:', error);
      throw error;
    } finally {
      client.release();
    }
  }

  // Clear all data (for testing)
  async clearAllData(): Promise<void> {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const tables = [
        'notifications',
        'qr_codes',
        'ai_analyses',
        'health_tips',
        'prescriptions',
        'medical_records',
        'appointments',
        'doctor_availability',
        'doctors',
        'users'
      ];

      for (const table of tables) {
        await client.query(`DELETE FROM ${table}`);
      }

      await client.query('COMMIT');
      console.log('✅ All data cleared successfully');
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('❌ Error clearing data:', error);
      throw error;
    } finally {
      client.release();
    }
  }
}

// Export singleton instance
export const databaseService = new PostgreSQLDatabaseService();
export default databaseService;

// Create a named export for the service
export const postgresqlDatabaseService = databaseService;

// CommonJS exports for compatibility
module.exports = {
  PostgreSQLDatabaseService,
  databaseService,
  postgresqlDatabaseService: databaseService
};