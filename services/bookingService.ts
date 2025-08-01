import { postgresqlDatabaseService, Appointment, Doctor, User } from './postgresqlDatabaseService';

export interface BookingData {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  duration: number;
  type: 'consultation' | 'follow-up' | 'emergency';
  symptoms: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

class BookingService {
  // Get all available doctors
  async getAllDoctors(): Promise<Doctor[]> {
    return await postgresqlDatabaseService.getAllDoctors();
  }

  // Get doctors by specialization
  async getDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    return await postgresqlDatabaseService.searchDoctors({ specialization });
  }

  // Get doctor by ID
  async getDoctorById(id: string): Promise<Doctor | null> {
    return await postgresqlDatabaseService.getDoctorById(id);
  }

  // Get available time slots for a doctor on a specific date
  async getAvailableTimeSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    const doctor = await postgresqlDatabaseService.getDoctorById(doctorId);
    if (!doctor) return [];

    const selectedDate = new Date(date);
    const dayOfWeek = selectedDate.getDay();

    // Find doctor's availability for the day
    const dayAvailability = doctor.availability.find(
      avail => avail.dayOfWeek === dayOfWeek && avail.isAvailable
    );

    if (!dayAvailability) return [];

    // Generate time slots
    const slots: TimeSlot[] = [];
    const startTime = this.parseTime(dayAvailability.startTime);
    const endTime = this.parseTime(dayAvailability.endTime);
    const slotDuration = 30; // 30 minutes per slot

    // Get existing appointments for the date
    const existingAppointments = await postgresqlDatabaseService
      .getAppointmentsByDoctor(doctorId);
    const dateAppointments = existingAppointments.filter(appointment => appointment.date === date);

    for (let time = startTime; time < endTime; time += slotDuration) {
      const timeString = this.formatTime(time);
      const isBooked = dateAppointments.some(
        appointment => appointment.time === timeString
      );

      slots.push({
        time: timeString,
        isAvailable: !isBooked,
        isBooked
      });
    }

    return slots;
  }

  // Book an appointment
  async bookAppointment(bookingData: BookingData): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      // Validate doctor exists
      const doctor = await postgresqlDatabaseService.getDoctorById(bookingData.doctorId);
      if (!doctor) {
        return { success: false, error: 'Doctor not found' };
      }

      // Validate patient exists
      const patient = await postgresqlDatabaseService.getUserById(bookingData.patientId);
      if (!patient) {
        return { success: false, error: 'Patient not found' };
      }

      // Check if time slot is available
      const availableSlots = await this.getAvailableTimeSlots(bookingData.doctorId, bookingData.date);
      const requestedSlot = availableSlots.find(slot => slot.time === bookingData.time);
      
      if (!requestedSlot || !requestedSlot.isAvailable) {
        return { success: false, error: 'Time slot is not available' };
      }

      // Create appointment
      const appointment = await postgresqlDatabaseService.createAppointment({
        ...bookingData,
        patientName: patient.name,
        doctorName: doctor.name,
        status: 'scheduled',
        fee: doctor.consultationFee,
        prescription: []
      });

      return { success: true, appointment };
    } catch (error: any) {
      return { success: false, error: error.message || 'Booking failed' };
    }
  }

  // Get appointments for a patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    return await postgresqlDatabaseService.getAppointmentsByPatient(patientId);
  }

  // Get appointments for a doctor
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    return await postgresqlDatabaseService.getAppointmentsByDoctor(doctorId);
  }

  // Update appointment status
  async updateAppointmentStatus(
    appointmentId: string, 
    status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      const appointment = await postgresqlDatabaseService.updateAppointment(appointmentId, { status });
      
      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      return { success: true, appointment };
    } catch (error: any) {
      return { success: false, error: error.message || 'Update failed' };
    }
  }

  // Cancel appointment
  async cancelAppointment(appointmentId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const appointment = await postgresqlDatabaseService.updateAppointment(appointmentId, { 
        status: 'cancelled' 
      });
      
      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || 'Cancellation failed' };
    }
  }

  // Reschedule appointment
  async rescheduleAppointment(
    appointmentId: string, 
    newDate: string, 
    newTime: string
  ): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      const existingAppointment = await postgresqlDatabaseService.getAppointmentById(appointmentId);
      if (!existingAppointment) {
        return { success: false, error: 'Appointment not found' };
      }

      // Check if new time slot is available
      const availableSlots = await this.getAvailableTimeSlots(existingAppointment.doctorId, newDate);
      const requestedSlot = availableSlots.find(slot => slot.time === newTime);
      
      if (!requestedSlot || !requestedSlot.isAvailable) {
        return { success: false, error: 'New time slot is not available' };
      }

      // Update appointment
      const appointment = await postgresqlDatabaseService.updateAppointment(appointmentId, {
        date: newDate,
        time: newTime
      });

      return { success: true, appointment };
    } catch (error: any) {
      return { success: false, error: error.message || 'Rescheduling failed' };
    }
  }

  // Get appointment by QR code
  async getAppointmentByQRCode(qrCode: string): Promise<Appointment | null> {
    const qrRecord = await postgresqlDatabaseService.getQRCodeByCode(qrCode);
    if (!qrRecord) return null;
    
    return await postgresqlDatabaseService.getAppointmentById(qrRecord.appointmentId);
  }

  // Verify QR code for appointment
  async verifyQRCode(qrCode: string): Promise<{ success: boolean; appointment?: Appointment; error?: string }> {
    try {
      const qrRecord = await postgresqlDatabaseService.getQRCodeByCode(qrCode);
      
      if (!qrRecord) {
        return { success: false, error: 'Invalid QR code' };
      }

      if (qrRecord.isUsed) {
        return { success: false, error: 'QR code has already been used' };
      }

      if (new Date(qrRecord.expiresAt) < new Date()) {
        return { success: false, error: 'QR code has expired' };
      }

      const appointment = await postgresqlDatabaseService.getAppointmentById(qrRecord.appointmentId);
      if (!appointment) {
        return { success: false, error: 'Appointment not found' };
      }

      // Mark QR code as used
      await postgresqlDatabaseService.markQRCodeAsUsed(qrCode);

      return { success: true, appointment };
    } catch (error: any) {
      return { success: false, error: error.message || 'QR verification failed' };
    }
  }

  // Get upcoming appointments
  async getUpcomingAppointments(userId: string, userType: 'user' | 'doctor'): Promise<Appointment[]> {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.getHours() * 60 + now.getMinutes();

    let appointments: Appointment[];
    
    if (userType === 'user') {
      appointments = await postgresqlDatabaseService.getAppointmentsByPatient(userId);
    } else {
      appointments = await postgresqlDatabaseService.getAppointmentsByDoctor(userId);
    }

    return appointments.filter(appointment => {
      if (appointment.status === 'cancelled' || appointment.status === 'completed') {
        return false;
      }

      const appointmentDate = appointment.date;
      const appointmentTime = this.parseTime(appointment.time);

      // Future dates
      if (appointmentDate > today) return true;
      
      // Today but future time
      if (appointmentDate === today && appointmentTime > currentTime) return true;
      
      return false;
    }).sort((a, b) => {
      // Sort by date, then by time
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return this.parseTime(a.time) - this.parseTime(b.time);
    });
  }

  // Get appointment history
  async getAppointmentHistory(userId: string, userType: 'user' | 'doctor'): Promise<Appointment[]> {
    let appointments: Appointment[];
    
    if (userType === 'user') {
      appointments = await postgresqlDatabaseService.getAppointmentsByPatient(userId);
    } else {
      appointments = await postgresqlDatabaseService.getAppointmentsByDoctor(userId);
    }

    return appointments
      .filter(appointment => appointment.status === 'completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Helper methods
  private parseTime(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private formatTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  // Get doctor statistics
  async getDoctorStats(doctorId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
    cancelledAppointments: number;
    rating: number;
    reviewCount: number;
  }> {
    const doctor = await postgresqlDatabaseService.getDoctorById(doctorId);
    const appointments = await postgresqlDatabaseService.getAppointmentsByDoctor(doctorId);

    const stats = {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      upcomingAppointments: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
      cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length,
      rating: doctor?.rating || 0,
      reviewCount: doctor?.reviewCount || 0
    };

    return stats;
  }

  // Get patient statistics
  async getPatientStats(patientId: string): Promise<{
    totalAppointments: number;
    completedAppointments: number;
    upcomingAppointments: number;
    cancelledAppointments: number;
  }> {
    const appointments = await postgresqlDatabaseService.getAppointmentsByPatient(patientId);

    return {
      totalAppointments: appointments.length,
      completedAppointments: appointments.filter(a => a.status === 'completed').length,
      upcomingAppointments: appointments.filter(a => a.status === 'scheduled' || a.status === 'confirmed').length,
      cancelledAppointments: appointments.filter(a => a.status === 'cancelled').length
    };
  }
}

export const bookingService = new BookingService();