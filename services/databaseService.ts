// Temporary Database Service for Good Health AI
// This service manages all data storage using localStorage as a temporary database

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  dateOfBirth: string;
  gender: string;
  address: string;
  profileImage?: string;
  medicalHistory: MedicalRecord[];
  appointments: Appointment[];
  createdAt: string;
  updatedAt: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  specialization: string;
  yearsOfExperience: number;
  qualification: string;
  licenseNumber: string;
  hospitalAffiliation: string;
  consultationFee: number;
  bio: string;
  profileImage?: string;
  availability: DoctorAvailability[];
  appointments: Appointment[];
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  patientName: string;
  doctorName: string;
  date: string;
  time: string;
  duration: number; // in minutes
  type: 'consultation' | 'follow-up' | 'emergency';
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string;
  notes?: string;
  prescription?: Prescription[];
  qrCode: string;
  meetingLink?: string;
  fee: number;
  createdAt: string;
  updatedAt: string;
}

export interface MedicalRecord {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  prescription: Prescription[];
  notes: string;
  attachments: string[];
  createdAt: string;
}

export interface Prescription {
  id: string;
  medicationName: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface DoctorAvailability {
  id: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isAvailable: boolean;
}

export interface QRCode {
  id: string;
  appointmentId: string;
  patientId: string;
  doctorId: string;
  code: string;
  expiresAt: string;
  isUsed: boolean;
  createdAt: string;
}

export interface HealthTip {
  id: string;
  title: string;
  content: string;
  category: string;
  author: string;
  createdAt: string;
  likes: number;
}

export interface AIAnalysis {
  id: string;
  userId: string;
  type: 'symptom-check' | 'visual-analysis' | 'health-assessment';
  input: string;
  result: string;
  confidence: number;
  recommendations: string[];
  createdAt: string;
}

class DatabaseService {
  private readonly STORAGE_KEYS = {
    USERS: 'goodhealth_users',
    DOCTORS: 'goodhealth_doctors',
    APPOINTMENTS: 'goodhealth_appointments',
    MEDICAL_RECORDS: 'goodhealth_medical_records',
    QR_CODES: 'goodhealth_qr_codes',
    HEALTH_TIPS: 'goodhealth_health_tips',
    AI_ANALYSES: 'goodhealth_ai_analyses',
    CURRENT_USER: 'goodhealth_current_user',
    CURRENT_DOCTOR: 'goodhealth_current_doctor'
  }

  // Clear all data (for testing)
  clearAllData(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  };

  // Initialize database with sample data
  initializeDatabase(): void {
    if (!this.getUsers().length) {
      this.seedSampleData();
    }
  }

  // Generate unique ID
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Generate QR Code
  private generateQRCode(): string {
    return 'QR' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 4).toUpperCase();
  }

  // Generic storage methods
  private getFromStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from storage key ${key}:`, error);
      return [];
    }
  }

  private saveToStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving to storage key ${key}:`, error);
    }
  }

  // User Management
  getUsers(): User[] {
    return this.getFromStorage<User>(this.STORAGE_KEYS.USERS);
  }

  getUserById(id: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.id === id) || null;
  }

  getUserByEmail(email: string): User | null {
    const users = this.getUsers();
    return users.find(user => user.email === email) || null;
  }

  createUser(userData: Omit<User, 'id' | 'medicalHistory' | 'appointments' | 'createdAt' | 'updatedAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: this.generateId(),
      medicalHistory: [],
      appointments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    this.saveToStorage(this.STORAGE_KEYS.USERS, users);
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const userIndex = users.findIndex(user => user.id === id);
    
    if (userIndex === -1) return null;
    
    users[userIndex] = {
      ...users[userIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage(this.STORAGE_KEYS.USERS, users);
    return users[userIndex];
  }

  // Doctor Management
  getDoctors(): Doctor[] {
    return this.getFromStorage<Doctor>(this.STORAGE_KEYS.DOCTORS);
  }

  getDoctorById(id: string): Doctor | null {
    const doctors = this.getDoctors();
    return doctors.find(doctor => doctor.id === id) || null;
  }

  getDoctorByEmail(email: string): Doctor | null {
    const doctors = this.getDoctors();
    return doctors.find(doctor => doctor.email === email) || null;
  }

  getDoctorsBySpecialization(specialization: string): Doctor[] {
    const doctors = this.getDoctors();
    return doctors.filter(doctor => 
      doctor.specialization.toLowerCase().includes(specialization.toLowerCase())
    );
  }

  createDoctor(doctorData: Omit<Doctor, 'id' | 'appointments' | 'rating' | 'reviewCount' | 'createdAt' | 'updatedAt'>): Doctor {
    const doctors = this.getDoctors();
    const newDoctor: Doctor = {
      ...doctorData,
      id: this.generateId(),
      appointments: [],
      rating: 0,
      reviewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    doctors.push(newDoctor);
    this.saveToStorage(this.STORAGE_KEYS.DOCTORS, doctors);
    return newDoctor;
  }

  updateDoctor(id: string, updates: Partial<Doctor>): Doctor | null {
    const doctors = this.getDoctors();
    const doctorIndex = doctors.findIndex(doctor => doctor.id === id);
    
    if (doctorIndex === -1) return null;
    
    doctors[doctorIndex] = {
      ...doctors[doctorIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage(this.STORAGE_KEYS.DOCTORS, doctors);
    return doctors[doctorIndex];
  }

  // Appointment Management
  getAppointments(): Appointment[] {
    return this.getFromStorage<Appointment>(this.STORAGE_KEYS.APPOINTMENTS);
  }

  getAppointmentById(id: string): Appointment | null {
    const appointments = this.getAppointments();
    return appointments.find(appointment => appointment.id === id) || null;
  }

  getAppointmentsByPatient(patientId: string): Appointment[] {
    const appointments = this.getAppointments();
    return appointments.filter(appointment => appointment.patientId === patientId);
  }

  getAppointmentsByDoctor(doctorId: string): Appointment[] {
    const appointments = this.getAppointments();
    return appointments.filter(appointment => appointment.doctorId === doctorId);
  }

  createAppointment(appointmentData: Omit<Appointment, 'id' | 'qrCode' | 'createdAt' | 'updatedAt'>): Appointment {
    const appointments = this.getAppointments();
    const qrCode = this.generateQRCode();
    
    const newAppointment: Appointment = {
      ...appointmentData,
      id: this.generateId(),
      qrCode,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    this.saveToStorage(this.STORAGE_KEYS.APPOINTMENTS, appointments);
    
    // Create QR Code record
    this.createQRCode({
      appointmentId: newAppointment.id,
      patientId: newAppointment.patientId,
      doctorId: newAppointment.doctorId,
      code: qrCode,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      isUsed: false
    });
    
    return newAppointment;
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
    const appointments = this.getAppointments();
    const appointmentIndex = appointments.findIndex(appointment => appointment.id === id);
    
    if (appointmentIndex === -1) return null;
    
    appointments[appointmentIndex] = {
      ...appointments[appointmentIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    this.saveToStorage(this.STORAGE_KEYS.APPOINTMENTS, appointments);
    return appointments[appointmentIndex];
  }

  // Medical Records Management
  getMedicalRecords(): MedicalRecord[] {
    return this.getFromStorage<MedicalRecord>(this.STORAGE_KEYS.MEDICAL_RECORDS);
  }

  getMedicalRecordsByPatient(patientId: string): MedicalRecord[] {
    const records = this.getMedicalRecords();
    return records.filter(record => record.patientId === patientId);
  }

  createMedicalRecord(recordData: Omit<MedicalRecord, 'id' | 'createdAt'>): MedicalRecord {
    const records = this.getMedicalRecords();
    const newRecord: MedicalRecord = {
      ...recordData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    records.push(newRecord);
    this.saveToStorage(this.STORAGE_KEYS.MEDICAL_RECORDS, records);
    return newRecord;
  }

  // QR Code Management
  getQRCodes(): QRCode[] {
    return this.getFromStorage<QRCode>(this.STORAGE_KEYS.QR_CODES);
  }

  getQRCodeByCode(code: string): QRCode | null {
    const qrCodes = this.getQRCodes();
    return qrCodes.find(qr => qr.code === code) || null;
  }

  createQRCode(qrData: Omit<QRCode, 'id' | 'createdAt'>): QRCode {
    const qrCodes = this.getQRCodes();
    const newQRCode: QRCode = {
      ...qrData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    qrCodes.push(newQRCode);
    this.saveToStorage(this.STORAGE_KEYS.QR_CODES, qrCodes);
    return newQRCode;
  }

  markQRCodeAsUsed(code: string): boolean {
    const qrCodes = this.getQRCodes();
    const qrIndex = qrCodes.findIndex(qr => qr.code === code);
    
    if (qrIndex === -1) return false;
    
    qrCodes[qrIndex].isUsed = true;
    this.saveToStorage(this.STORAGE_KEYS.QR_CODES, qrCodes);
    return true;
  }

  // Health Tips Management
  getHealthTips(): HealthTip[] {
    return this.getFromStorage<HealthTip>(this.STORAGE_KEYS.HEALTH_TIPS);
  }

  createHealthTip(tipData: Omit<HealthTip, 'id' | 'createdAt' | 'likes'>): HealthTip {
    const tips = this.getHealthTips();
    const newTip: HealthTip = {
      ...tipData,
      id: this.generateId(),
      likes: 0,
      createdAt: new Date().toISOString()
    };
    
    tips.push(newTip);
    this.saveToStorage(this.STORAGE_KEYS.HEALTH_TIPS, tips);
    return newTip;
  }

  // AI Analysis Management
  getAIAnalyses(): AIAnalysis[] {
    return this.getFromStorage<AIAnalysis>(this.STORAGE_KEYS.AI_ANALYSES);
  }

  getAIAnalysesByUser(userId: string): AIAnalysis[] {
    const analyses = this.getAIAnalyses();
    return analyses.filter(analysis => analysis.userId === userId);
  }

  createAIAnalysis(analysisData: Omit<AIAnalysis, 'id' | 'createdAt'>): AIAnalysis {
    const analyses = this.getAIAnalyses();
    const newAnalysis: AIAnalysis = {
      ...analysisData,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    
    analyses.push(newAnalysis);
    this.saveToStorage(this.STORAGE_KEYS.AI_ANALYSES, analyses);
    return newAnalysis;
  }

  // Authentication
  setCurrentUser(user: User): void {
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
  }

  getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_USER);
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  }

  setCurrentDoctor(doctor: Doctor): void {
    localStorage.setItem(this.STORAGE_KEYS.CURRENT_DOCTOR, JSON.stringify(doctor));
  }

  getCurrentDoctor(): Doctor | null {
    try {
      const doctorData = localStorage.getItem(this.STORAGE_KEYS.CURRENT_DOCTOR);
      return doctorData ? JSON.parse(doctorData) : null;
    } catch {
      return null;
    }
  }

  logout(): void {
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(this.STORAGE_KEYS.CURRENT_DOCTOR);
  }

  // Seed sample data
  private seedSampleData(): void {
    // Comprehensive Sample Doctors across all specializations
    const sampleDoctors = [
      // Cardiology
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@goodhealth.ai',
        phone: '+1234567890',
        password: 'doctor123',
        specialization: 'Cardiology',
        yearsOfExperience: 15,
        qualification: 'MD, FACC, FSCAI',
        licenseNumber: 'MD12345',
        hospitalAffiliation: 'Good Health Medical Center',
        consultationFee: 200,
        bio: 'Leading cardiologist with expertise in interventional cardiology, heart failure management, and preventive cardiology. Published researcher with 50+ peer-reviewed papers.',
        availability: [
          { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true }
        ]
      },
      {
        name: 'Dr. Robert Martinez',
        email: 'robert.martinez@goodhealth.ai',
        phone: '+1234567891',
        password: 'doctor123',
        specialization: 'Cardiology',
        yearsOfExperience: 22,
        qualification: 'MD, PhD, FACC',
        licenseNumber: 'MD12346',
        hospitalAffiliation: 'Heart Institute of Excellence',
        consultationFee: 250,
        bio: 'Renowned cardiac surgeon and researcher specializing in complex heart surgeries, valve replacements, and cardiac transplants.',
        availability: [
          { id: '6', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '7', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '8', dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true }
        ]
      },

      // Dermatology
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@goodhealth.ai',
        phone: '+1234567892',
        password: 'doctor123',
        specialization: 'Dermatology',
        yearsOfExperience: 12,
        qualification: 'MD, FAAD, FACMS',
        licenseNumber: 'MD12347',
        hospitalAffiliation: 'Advanced Skin Care Clinic',
        consultationFee: 180,
        bio: 'Board-certified dermatologist specializing in skin cancer detection, Mohs surgery, and advanced cosmetic procedures including laser treatments.',
        availability: [
          { id: '9', dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { id: '10', dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { id: '11', dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@goodhealth.ai',
        phone: '+1234567893',
        password: 'doctor123',
        specialization: 'Dermatology',
        yearsOfExperience: 8,
        qualification: 'MD, FAAD',
        licenseNumber: 'MD12348',
        hospitalAffiliation: 'Dermatology Associates',
        consultationFee: 160,
        bio: 'Pediatric and adult dermatologist with special interest in eczema, psoriasis, and acne treatment. Expert in photodynamic therapy.',
        availability: [
          { id: '12', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '13', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '14', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      },

      // Neurology
      {
        name: 'Dr. David Thompson',
        email: 'david.thompson@goodhealth.ai',
        phone: '+1234567894',
        password: 'doctor123',
        specialization: 'Neurology',
        yearsOfExperience: 18,
        qualification: 'MD, PhD, FAAN',
        licenseNumber: 'MD12349',
        hospitalAffiliation: 'Neurological Institute',
        consultationFee: 220,
        bio: 'Leading neurologist specializing in epilepsy, stroke, and neurodegenerative diseases. Director of the Comprehensive Epilepsy Center.',
        availability: [
          { id: '15', dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '16', dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '17', dayOfWeek: 5, startTime: '08:00', endTime: '14:00', isAvailable: true }
        ]
      },
      {
        name: 'Dr. Lisa Wang',
        email: 'lisa.wang@goodhealth.ai',
        phone: '+1234567895',
        password: 'doctor123',
        specialization: 'Neurology',
        yearsOfExperience: 14,
        qualification: 'MD, FAAN',
        licenseNumber: 'MD12350',
        hospitalAffiliation: 'Brain & Spine Center',
        consultationFee: 200,
        bio: 'Neurologist with expertise in multiple sclerosis, headache disorders, and movement disorders. Research focus on neuroprotective therapies.',
        availability: [
          { id: '18', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '19', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '20', dayOfWeek: 6, startTime: '09:00', endTime: '13:00', isAvailable: true }
        ]
      },

      // Orthopedics
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@goodhealth.ai',
        phone: '+1234567896',
        password: 'doctor123',
        specialization: 'Orthopedics',
        yearsOfExperience: 20,
        qualification: 'MD, FAAOS',
        licenseNumber: 'MD12351',
        hospitalAffiliation: 'Orthopedic Surgery Center',
        consultationFee: 190,
        bio: 'Orthopedic surgeon specializing in joint replacement, sports medicine, and trauma surgery. Team physician for professional sports teams.',
        availability: [
          { id: '21', dayOfWeek: 1, startTime: '07:00', endTime: '15:00', isAvailable: true },
          { id: '22', dayOfWeek: 3, startTime: '07:00', endTime: '15:00', isAvailable: true },
          { id: '23', dayOfWeek: 5, startTime: '07:00', endTime: '15:00', isAvailable: true }
        ]
      },
      {
        name: 'Dr. Maria Garcia',
        email: 'maria.garcia@goodhealth.ai',
        phone: '+1234567897',
        password: 'doctor123',
        specialization: 'Orthopedics',
        yearsOfExperience: 16,
        qualification: 'MD, FAAOS',
        licenseNumber: 'MD12352',
        hospitalAffiliation: 'Sports Medicine Institute',
        consultationFee: 175,
        bio: 'Orthopedic surgeon with subspecialty in pediatric orthopedics and spine surgery. Expert in minimally invasive surgical techniques.',
        availability: [
          { id: '24', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '25', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '26', dayOfWeek: 6, startTime: '08:00', endTime: '12:00', isAvailable: true }
        ]
      },

      // Pediatrics
      {
        name: 'Dr. Jennifer Lee',
        email: 'jennifer.lee@goodhealth.ai',
        phone: '+1234567898',
        password: 'doctor123',
        specialization: 'Pediatrics',
        yearsOfExperience: 13,
        qualification: 'MD, FAAP',
        licenseNumber: 'MD12353',
        hospitalAffiliation: 'Children\'s Medical Center',
        consultationFee: 140,
        bio: 'Board-certified pediatrician with expertise in developmental pediatrics, childhood obesity, and adolescent medicine. Advocate for preventive care.',
        availability: [
          { id: '27', dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '28', dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '29', dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '30', dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '31', dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        name: 'Dr. Kevin Brown',
        email: 'kevin.brown@goodhealth.ai',
        phone: '+1234567899',
        password: 'doctor123',
        specialization: 'Pediatrics',
        yearsOfExperience: 19,
        qualification: 'MD, FAAP, FACP',
        licenseNumber: 'MD12354',
        hospitalAffiliation: 'Pediatric Specialty Clinic',
        consultationFee: 160,
        bio: 'Pediatric specialist in infectious diseases and immunology. Expert in childhood vaccines and immune system disorders.',
        availability: [
          { id: '32', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '33', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '34', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      },

      // Psychiatry
      {
        name: 'Dr. Amanda Taylor',
        email: 'amanda.taylor@goodhealth.ai',
        phone: '+1234567900',
        password: 'doctor123',
        specialization: 'Psychiatry',
        yearsOfExperience: 11,
        qualification: 'MD, MRCPsych',
        licenseNumber: 'MD12355',
        hospitalAffiliation: 'Mental Health Institute',
        consultationFee: 170,
        bio: 'Psychiatrist specializing in anxiety disorders, depression, and PTSD. Expert in cognitive behavioral therapy and psychopharmacology.',
        availability: [
          { id: '35', dayOfWeek: 1, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { id: '36', dayOfWeek: 2, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { id: '37', dayOfWeek: 3, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { id: '38', dayOfWeek: 4, startTime: '10:00', endTime: '18:00', isAvailable: true },
          { id: '39', dayOfWeek: 5, startTime: '10:00', endTime: '16:00', isAvailable: true }
        ]
      },

      // Gynecology
      {
        name: 'Dr. Rachel Adams',
        email: 'rachel.adams@goodhealth.ai',
        phone: '+1234567901',
        password: 'doctor123',
        specialization: 'Gynecology',
        yearsOfExperience: 17,
        qualification: 'MD, FACOG',
        licenseNumber: 'MD12356',
        hospitalAffiliation: 'Women\'s Health Center',
        consultationFee: 185,
        bio: 'Board-certified gynecologist with expertise in reproductive endocrinology, minimally invasive surgery, and high-risk pregnancy management.',
        availability: [
          { id: '40', dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '41', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '42', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '43', dayOfWeek: 5, startTime: '08:00', endTime: '14:00', isAvailable: true }
        ]
      },

      // Ophthalmology
      {
        name: 'Dr. Steven Clark',
        email: 'steven.clark@goodhealth.ai',
        phone: '+1234567902',
        password: 'doctor123',
        specialization: 'Ophthalmology',
        yearsOfExperience: 21,
        qualification: 'MD, FACS',
        licenseNumber: 'MD12357',
        hospitalAffiliation: 'Eye Care Institute',
        consultationFee: 195,
        bio: 'Ophthalmologist and retinal specialist with expertise in cataract surgery, retinal detachment repair, and diabetic retinopathy treatment.',
        availability: [
          { id: '44', dayOfWeek: 1, startTime: '07:30', endTime: '15:30', isAvailable: true },
          { id: '45', dayOfWeek: 3, startTime: '07:30', endTime: '15:30', isAvailable: true },
          { id: '46', dayOfWeek: 5, startTime: '07:30', endTime: '15:30', isAvailable: true }
        ]
      },

      // ENT (Otolaryngology)
      {
        name: 'Dr. Patricia White',
        email: 'patricia.white@goodhealth.ai',
        phone: '+1234567903',
        password: 'doctor123',
        specialization: 'ENT',
        yearsOfExperience: 14,
        qualification: 'MD, FACS',
        licenseNumber: 'MD12358',
        hospitalAffiliation: 'ENT Surgical Center',
        consultationFee: 165,
        bio: 'ENT surgeon specializing in sinus surgery, hearing disorders, and head and neck cancer treatment. Expert in endoscopic procedures.',
        availability: [
          { id: '47', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '48', dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '49', dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },

      // General Medicine
      {
        name: 'Dr. Thomas Anderson',
        email: 'thomas.anderson@goodhealth.ai',
        phone: '+1234567904',
        password: 'doctor123',
        specialization: 'General Medicine',
        yearsOfExperience: 25,
        qualification: 'MD, FACP',
        licenseNumber: 'MD12359',
        hospitalAffiliation: 'Primary Care Associates',
        consultationFee: 120,
        bio: 'Experienced family physician providing comprehensive primary care, preventive medicine, and chronic disease management for all ages.',
        availability: [
          { id: '50', dayOfWeek: 1, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '51', dayOfWeek: 2, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '52', dayOfWeek: 3, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '53', dayOfWeek: 4, startTime: '08:00', endTime: '18:00', isAvailable: true },
          { id: '54', dayOfWeek: 5, startTime: '08:00', endTime: '16:00', isAvailable: true }
        ]
      },
      {
        name: 'Dr. Nancy Davis',
        email: 'nancy.davis@goodhealth.ai',
        phone: '+1234567905',
        password: 'doctor123',
        specialization: 'General Medicine',
        yearsOfExperience: 12,
        qualification: 'MD, FAAFP',
        licenseNumber: 'MD12360',
        hospitalAffiliation: 'Community Health Center',
        consultationFee: 110,
        bio: 'Family medicine physician with special interest in geriatric care, diabetes management, and women\'s health.',
        availability: [
          { id: '55', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '56', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '57', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
          { id: '58', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
        ]
      },

      // Endocrinology
      {
        name: 'Dr. Mark Johnson',
        email: 'mark.johnson@goodhealth.ai',
        phone: '+1234567906',
        password: 'doctor123',
        specialization: 'Endocrinology',
        yearsOfExperience: 16,
        qualification: 'MD, FACE',
        licenseNumber: 'MD12361',
        hospitalAffiliation: 'Diabetes & Endocrine Center',
        consultationFee: 180,
        bio: 'Endocrinologist specializing in diabetes, thyroid disorders, and hormone replacement therapy. Research focus on insulin pump technology.',
        availability: [
          { id: '59', dayOfWeek: 1, startTime: '08:30', endTime: '16:30', isAvailable: true },
          { id: '60', dayOfWeek: 3, startTime: '08:30', endTime: '16:30', isAvailable: true },
          { id: '61', dayOfWeek: 5, startTime: '08:30', endTime: '14:30', isAvailable: true }
        ]
      },

      // Gastroenterology
      {
        name: 'Dr. Susan Miller',
        email: 'susan.miller@goodhealth.ai',
        phone: '+1234567907',
        password: 'doctor123',
        specialization: 'Gastroenterology',
        yearsOfExperience: 18,
        qualification: 'MD, FACG',
        licenseNumber: 'MD12362',
        hospitalAffiliation: 'Digestive Health Institute',
        consultationFee: 190,
        bio: 'Gastroenterologist with expertise in inflammatory bowel disease, liver disorders, and advanced endoscopic procedures.',
        availability: [
          { id: '62', dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '63', dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
          { id: '64', dayOfWeek: 6, startTime: '08:00', endTime: '12:00', isAvailable: true }
        ]
      }
    ];

    // Create doctors with realistic ratings
    sampleDoctors.forEach((doctor, index) => {
      const rating = 4.2 + (Math.random() * 0.8); // Rating between 4.2 and 5.0
      const reviewCount = 50 + Math.floor(Math.random() * 200); // 50-250 reviews
      
      this.createDoctor({
        ...doctor,
        rating: Math.round(rating * 10) / 10,
        reviewCount
      });
    });

    // Enhanced Sample Health Tips
    const sampleTips = [
      {
        title: 'Stay Hydrated for Optimal Health',
        content: 'Drink at least 8-10 glasses of water daily. Proper hydration supports kidney function, maintains body temperature, and helps transport nutrients throughout your body.',
        category: 'General Health',
        author: 'Good Health AI Team'
      },
      {
        title: 'The Power of Regular Exercise',
        content: 'Aim for at least 150 minutes of moderate-intensity aerobic activity per week. Regular exercise reduces the risk of heart disease, diabetes, and improves mental health.',
        category: 'Fitness',
        author: 'Dr. Sarah Johnson'
      },
      {
        title: 'Quality Sleep for Better Health',
        content: 'Adults need 7-9 hours of quality sleep each night. Good sleep hygiene includes maintaining a consistent sleep schedule and creating a comfortable sleep environment.',
        category: 'Sleep',
        author: 'Dr. Amanda Taylor'
      },
      {
        title: 'Heart-Healthy Diet Tips',
        content: 'Include omega-3 rich foods like salmon, walnuts, and flaxseeds in your diet. Limit saturated fats and increase fiber intake with fruits and vegetables.',
        category: 'Nutrition',
        author: 'Dr. Robert Martinez'
      },
      {
        title: 'Protecting Your Skin from UV Damage',
        content: 'Apply broad-spectrum SPF 30+ sunscreen daily, even on cloudy days. Wear protective clothing and seek shade during peak sun hours (10 AM - 4 PM).',
        category: 'Skin Care',
        author: 'Dr. Michael Chen'
      },
      {
        title: 'Managing Stress for Mental Wellness',
        content: 'Practice stress-reduction techniques like deep breathing, meditation, or yoga. Regular physical activity and social connections also help manage stress levels.',
        category: 'Mental Health',
        author: 'Dr. Amanda Taylor'
      },
      {
        title: 'Bone Health and Calcium',
        content: 'Ensure adequate calcium and vitamin D intake for strong bones. Weight-bearing exercises like walking and resistance training help maintain bone density.',
        category: 'Bone Health',
        author: 'Dr. Maria Garcia'
      },
      {
        title: 'Eye Care in the Digital Age',
        content: 'Follow the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds. This helps reduce digital eye strain and fatigue.',
        category: 'Eye Health',
        author: 'Dr. Steven Clark'
      },
      {
        title: 'Preventive Health Screenings',
        content: 'Stay up-to-date with recommended health screenings based on your age and risk factors. Early detection is key to successful treatment.',
        category: 'Preventive Care',
        author: 'Dr. Thomas Anderson'
      },
      {
        title: 'Healthy Aging Tips',
        content: 'Maintain social connections, stay physically active, eat a balanced diet, and keep your mind engaged with learning new skills or hobbies.',
        category: 'Aging',
        author: 'Dr. Nancy Davis'
      }
    ];

    sampleTips.forEach(tip => this.createHealthTip(tip));

    // Sample Medical Records for demonstration
    const sampleMedicalRecords = [
      {
        patientId: 'sample_patient_1',
        doctorId: 'sample_doctor_1',
        date: '2024-01-15',
        diagnosis: 'Hypertension',
        symptoms: 'High blood pressure, headaches',
        treatment: 'Lifestyle modifications, ACE inhibitor',
        prescription: [
          {
            id: 'rx1',
            medicationName: 'Lisinopril',
            dosage: '10mg',
            frequency: 'Once daily',
            duration: '30 days',
            instructions: 'Take with or without food'
          }
        ],
        notes: 'Patient advised on dietary changes and regular exercise',
        attachments: []
      }
    ];

    sampleMedicalRecords.forEach(record => this.createMedicalRecord(record));
  }

  // Advanced Search and Analytics Features
  
  // Search doctors by multiple criteria
  searchDoctors(criteria: {
    specialization?: string;
    name?: string;
    hospital?: string;
    minRating?: number;
    maxFee?: number;
    availability?: { day: number; time: string };
  }): Doctor[] {
    const doctors = this.getDoctors();
    
    return doctors.filter(doctor => {
      if (criteria.specialization && doctor.specialization !== criteria.specialization) return false;
      if (criteria.name && !doctor.name.toLowerCase().includes(criteria.name.toLowerCase())) return false;
      if (criteria.hospital && !doctor.hospitalAffiliation.toLowerCase().includes(criteria.hospital.toLowerCase())) return false;
      if (criteria.minRating && doctor.rating < criteria.minRating) return false;
      if (criteria.maxFee && doctor.consultationFee > criteria.maxFee) return false;
      
      if (criteria.availability) {
        const hasAvailability = doctor.availability.some(slot => 
          slot.dayOfWeek === criteria.availability!.day && 
          slot.isAvailable &&
          this.isTimeInRange(criteria.availability!.time, slot.startTime, slot.endTime)
        );
        if (!hasAvailability) return false;
      }
      
      return true;
    });
  }

  private isTimeInRange(time: string, startTime: string, endTime: string): boolean {
    const timeMinutes = this.timeToMinutes(time);
    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);
    
    return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Get analytics data
  getAnalytics(): {
    totalUsers: number;
    totalDoctors: number;
    totalAppointments: number;
    appointmentsByStatus: Record<string, number>;
    appointmentsBySpecialization: Record<string, number>;
    averageRating: number;
    popularSpecializations: Array<{ specialization: string; count: number }>;
    monthlyAppointments: Array<{ month: string; count: number }>;
  } {
    const users = this.getUsers();
    const doctors = this.getDoctors();
    const appointments = this.getAppointments();

    const appointmentsByStatus = appointments.reduce((acc, apt) => {
      acc[apt.status] = (acc[apt.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const appointmentsBySpecialization = appointments.reduce((acc, apt) => {
      const doctor = doctors.find(d => d.id === apt.doctorId);
      if (doctor) {
        acc[doctor.specialization] = (acc[doctor.specialization] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const averageRating = doctors.reduce((sum, doctor) => sum + doctor.rating, 0) / doctors.length;

    const popularSpecializations = Object.entries(
      doctors.reduce((acc, doctor) => {
        acc[doctor.specialization] = (acc[doctor.specialization] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
    .map(([specialization, count]) => ({ specialization, count }))
    .sort((a, b) => b.count - a.count);

    // Monthly appointments for the last 6 months
    const monthlyAppointments = this.getMonthlyAppointmentStats(appointments);

    return {
      totalUsers: users.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      appointmentsByStatus,
      appointmentsBySpecialization,
      averageRating: Math.round(averageRating * 10) / 10,
      popularSpecializations,
      monthlyAppointments
    };
  }

  private getMonthlyAppointmentStats(appointments: Appointment[]): Array<{ month: string; count: number }> {
    const monthCounts: Record<string, number> = {};
    const now = new Date();
    
    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toISOString().slice(0, 7); // YYYY-MM format
      monthCounts[monthKey] = 0;
    }

    appointments.forEach(apt => {
      const monthKey = apt.date.slice(0, 7);
      if (monthCounts.hasOwnProperty(monthKey)) {
        monthCounts[monthKey]++;
      }
    });

    return Object.entries(monthCounts).map(([month, count]) => ({ month, count }));
  }

  // Data validation
  validateUserData(userData: Partial<User>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (userData.email && !this.isValidEmail(userData.email)) {
      errors.push('Invalid email format');
    }

    if (userData.phone && !this.isValidPhone(userData.phone)) {
      errors.push('Invalid phone number format');
    }

    if (userData.password && userData.password.length < 6) {
      errors.push('Password must be at least 6 characters long');
    }

    if (userData.dateOfBirth && !this.isValidDate(userData.dateOfBirth)) {
      errors.push('Invalid date of birth');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  validateDoctorData(doctorData: Partial<Doctor>): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (doctorData.email && !this.isValidEmail(doctorData.email)) {
      errors.push('Invalid email format');
    }

    if (doctorData.phone && !this.isValidPhone(doctorData.phone)) {
      errors.push('Invalid phone number format');
    }

    if (doctorData.consultationFee && (doctorData.consultationFee < 0 || doctorData.consultationFee > 1000)) {
      errors.push('Consultation fee must be between $0 and $1000');
    }

    if (doctorData.yearsOfExperience && (doctorData.yearsOfExperience < 0 || doctorData.yearsOfExperience > 50)) {
      errors.push('Years of experience must be between 0 and 50');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private isValidPhone(phone: string): boolean {
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone);
  }

  private isValidDate(dateString: string): boolean {
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime()) && date < new Date();
  }

  // Backup and restore with encryption simulation
  createBackup(): { data: string; timestamp: string; checksum: string } {
    const data = this.exportData();
    const timestamp = new Date().toISOString();
    const checksum = this.generateChecksum(data);
    
    return {
      data: btoa(data), // Base64 encoding for simulation
      timestamp,
      checksum
    };
  }

  restoreFromBackup(backup: { data: string; checksum: string }): boolean {
    try {
      const decodedData = atob(backup.data);
      const calculatedChecksum = this.generateChecksum(decodedData);
      
      if (calculatedChecksum !== backup.checksum) {
        console.error('Backup integrity check failed');
        return false;
      }
      
      return this.importData(decodedData);
    } catch (error) {
      console.error('Error restoring backup:', error);
      return false;
    }
  }

  private generateChecksum(data: string): string {
    // Simple checksum for demonstration (in real app, use proper hashing)
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(16);
  }

  // Real-time notifications simulation
  private notificationCallbacks: Array<(notification: any) => void> = [];

  subscribeToNotifications(callback: (notification: any) => void): () => void {
    this.notificationCallbacks.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.notificationCallbacks.indexOf(callback);
      if (index > -1) {
        this.notificationCallbacks.splice(index, 1);
      }
    };
  }

  private notifySubscribers(notification: any): void {
    this.notificationCallbacks.forEach(callback => {
      try {
        callback(notification);
      } catch (error) {
        console.error('Error in notification callback:', error);
      }
    });
  }

  // Enhanced appointment creation with notifications
  createAppointmentWithNotification(appointmentData: Omit<Appointment, 'id' | 'qrCode' | 'createdAt' | 'updatedAt'>): Appointment {
    const appointment = this.createAppointment(appointmentData);
    
    // Notify subscribers
    this.notifySubscribers({
      type: 'appointment_created',
      data: appointment,
      timestamp: new Date().toISOString()
    });
    
    return appointment;
  }

  // Data synchronization simulation
  async syncData(): Promise<{ success: boolean; message: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // In a real app, this would sync with a remote server
      const localData = this.exportData();
      const dataSize = new Blob([localData]).size;
      
      return {
        success: true,
        message: `Successfully synced ${dataSize} bytes of data`
      };
    } catch (error) {
      return {
        success: false,
        message: 'Sync failed: ' + (error as Error).message
      };
    }
  }

  // Export data (for backup)
  exportData(): string {
    const data = {
      users: this.getUsers(),
      doctors: this.getDoctors(),
      appointments: this.getAppointments(),
      medicalRecords: this.getMedicalRecords(),
      qrCodes: this.getQRCodes(),
      healthTips: this.getHealthTips(),
      aiAnalyses: this.getAIAnalyses()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import data (for restore)
  importData(jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.users) this.saveToStorage(this.STORAGE_KEYS.USERS, data.users);
      if (data.doctors) this.saveToStorage(this.STORAGE_KEYS.DOCTORS, data.doctors);
      if (data.appointments) this.saveToStorage(this.STORAGE_KEYS.APPOINTMENTS, data.appointments);
      if (data.medicalRecords) this.saveToStorage(this.STORAGE_KEYS.MEDICAL_RECORDS, data.medicalRecords);
      if (data.qrCodes) this.saveToStorage(this.STORAGE_KEYS.QR_CODES, data.qrCodes);
      if (data.healthTips) this.saveToStorage(this.STORAGE_KEYS.HEALTH_TIPS, data.healthTips);
      if (data.aiAnalyses) this.saveToStorage(this.STORAGE_KEYS.AI_ANALYSES, data.aiAnalyses);
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();

// Initialize database on import
databaseService.initializeDatabase();