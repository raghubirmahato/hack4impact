// Client-side Booking Service for Good Health AI
// This service makes API calls to the backend instead of direct database connections

import { clientDatabaseService, Appointment, Doctor, User } from './clientDatabaseService';
import { STORAGE_KEYS } from '../constants/storage';
import { resolveApiUrl } from '../utils/apiUrl';

const getStoredToken = () => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN) || localStorage.getItem('goodhealth_token') || '';
const getStoredUser = () => {
  const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER) || localStorage.getItem('goodhealth_user');
  return data ? JSON.parse(data) : null;
};

export interface BookingData {
  doctorId: string;
  patientId: string;
  date: string;
  time: string;
  duration?: number;
  type?: 'consultation' | 'follow-up' | 'emergency';
  symptoms: string;
  notes?: string;
}

export interface TimeSlot {
  time: string;
  isAvailable: boolean;
  isBooked: boolean;
}

class ClientBookingService {
  private baseUrl = '/api/bookings';

  // Get all available doctors
  async getAllDoctors(): Promise<Doctor[]> {
    return await clientDatabaseService.getAllDoctors();
  }

  // Get doctor by ID
  async getDoctorById(id: string): Promise<Doctor | null> {
    return await clientDatabaseService.getDoctorById(id);
  }

  // Get available time slots for a doctor on a specific date
  async getAvailableSlots(doctorId: string, date: string): Promise<TimeSlot[]> {
    try {
      const response = await fetch(resolveApiUrl(`${this.baseUrl}/slots/${doctorId}/${date}`));
      if (!response.ok) {
        return [];
      }
      return response.json();
    } catch (error) {
      console.error('Error fetching available slots:', error);
      return [];
    }
  }

  // Book an appointment
  async bookAppointment(bookingData: BookingData): Promise<Appointment> {
    try {
      // First verify the doctor exists
      const doctor = await this.getDoctorById(bookingData.doctorId);
      if (!doctor) {
        throw new Error('Doctor not found');
      }

      // Create appointment using the backend API
      const response = await fetch(resolveApiUrl('/api/appointments'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({
          doctorId: bookingData.doctorId,
          date: bookingData.date,
          time: bookingData.time,
          duration: bookingData.duration || 30,
          type: bookingData.type || 'consultation',
          symptoms: bookingData.symptoms,
          notes: bookingData.notes || ''
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to book appointment');
      }

      const result = await response.json();
      return result.appointment;
    } catch (error) {
      console.error('Error booking appointment:', error);
      throw error;
    }
  }

  // Get appointments for a patient
  async getPatientAppointments(patientId: string): Promise<Appointment[]> {
    try {
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(resolveApiUrl('/api/appointments'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      
      const appointments = await response.json();
      return appointments.filter((appointment: Appointment) => appointment.patientId === patientId);
    } catch (error) {
      console.error('Error fetching patient appointments:', error);
      // Fallback to local storage if API fails
      return await clientDatabaseService.getAppointmentsByPatient(patientId);
    }
  }

  // Get appointments for a doctor
  async getDoctorAppointments(doctorId: string): Promise<Appointment[]> {
    try {
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(resolveApiUrl('/api/appointments'), {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch appointments');
      }
      
      const appointments = await response.json();
      return appointments.filter((appointment: Appointment) => appointment.doctorId === doctorId);
    } catch (error) {
      console.error('Error fetching doctor appointments:', error);
      // Fallback to local storage if API fails
      return await clientDatabaseService.getAppointmentsByDoctor(doctorId);
    }
  }

  // Cancel an appointment
  async cancelAppointment(appointmentId: string): Promise<boolean> {
    try {
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      const response = await fetch(resolveApiUrl(`/api/appointments/${appointmentId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'cancelled' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to cancel appointment');
      }
      
      return true;
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return false;
    }
  }

  async updateAppointmentStatus(appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled' | 'no-show'): Promise<boolean> {
    if (status === 'cancelled') return this.cancelAppointment(appointmentId);
    if (status === 'confirmed') return this.confirmAppointment(appointmentId);
    if (status === 'completed') return this.completeAppointment(appointmentId);
    return this.markNoShow(appointmentId);
  }

  verifyQRCode(qrCode: string): { success: boolean; appointment?: Appointment; error?: string } {
    try {
      const appointments: Appointment[] = JSON.parse(localStorage.getItem(STORAGE_KEYS.APPOINTMENTS) || '[]');
      const appointment = appointments.find(item => item.qrCode === qrCode || item.id === qrCode);
      return appointment ? { success: true, appointment } : { success: false, error: 'No appointment matches this code.' };
    } catch {
      return { success: false, error: 'Unable to read appointment data.' };
    }
  }

  // Reschedule an appointment
  async rescheduleAppointment(appointmentId: string, newDate: string, newTime: string): Promise<boolean> {
    try {
      const token = getStoredToken();
      
      if (!token) {
        throw new Error('Authentication required');
      }
      
      // First get the current user data
      const user = getStoredUser();
      if (!user) {
        throw new Error('User data not found');
      }
      
      // Get the appointment to check availability
      const appointments = await this.getPatientAppointments(user.id);
      const appointment = appointments.find(a => a.id === appointmentId);
      
      if (!appointment) {
        throw new Error('Appointment not found');
      }
      
      // Check if the new slot is available
      const slots = await this.getAvailableSlots(appointment.doctorId, newDate);
      const isSlotAvailable = slots.some(slot => slot.time === newTime && slot.isAvailable);
      
      if (!isSlotAvailable) {
        throw new Error('The selected time slot is not available');
      }
      
      // Update the appointment with new date and time
      const response = await fetch(resolveApiUrl(`/api/appointments/${appointmentId}`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          date: newDate, 
          time: newTime,
          status: 'rescheduled'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to reschedule appointment');
      }
      
      return true;
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      return false;
    }
  }

  // Confirm an appointment (for doctors)
  async confirmAppointment(appointmentId: string): Promise<boolean> {
    try {
      const response = await fetch(resolveApiUrl(`/api/appointments/${appointmentId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ status: 'confirmed' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to confirm appointment');
      }
      
      return true;
    } catch (error) {
      console.error('Error confirming appointment:', error);
      return false;
    }
  }

  // Decline an appointment (for doctors)
  async declineAppointment(appointmentId: string, reason: string = ''): Promise<boolean> {
    try {
      const response = await fetch(resolveApiUrl(`/api/appointments/${appointmentId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ 
          status: 'declined',
          notes: reason
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to decline appointment');
      }
      
      return true;
    } catch (error) {
      console.error('Error declining appointment:', error);
      return false;
    }
  }

  // Complete an appointment (for doctors)
  async completeAppointment(appointmentId: string): Promise<boolean> {
    try {
      const response = await fetch(resolveApiUrl(`/api/appointments/${appointmentId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ status: 'completed' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to complete appointment');
      }
      
      return true;
    } catch (error) {
      console.error('Error completing appointment:', error);
      return false;
    }
  }

  // Mark appointment as no-show
  async markNoShow(appointmentId: string): Promise<boolean> {
    try {
      const response = await fetch(resolveApiUrl(`/api/appointments/${appointmentId}/status`), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getStoredToken()}`
        },
        body: JSON.stringify({ status: 'no-show' })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to mark appointment as no-show');
      }
      
      return true;
    } catch (error) {
      console.error('Error marking appointment as no-show:', error);
      return false;
    }
  }

  // Get upcoming appointments for a user
  async getUpcomingAppointments(userId: string, isDoctor: boolean = false): Promise<Appointment[]> {
    try {
      const appointments = isDoctor 
        ? await this.getDoctorAppointments(userId)
        : await this.getPatientAppointments(userId);
      
      const now = new Date();
      return appointments.filter(appointment => {
        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
        return appointmentDate > now && appointment.status !== 'cancelled';
      }).sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateA.getTime() - dateB.getTime();
      });
    } catch (error) {
      console.error('Error fetching upcoming appointments:', error);
      return [];
    }
  }

  // Get past appointments for a user
  async getPastAppointments(userId: string, isDoctor: boolean = false): Promise<Appointment[]> {
    try {
      const appointments = isDoctor 
        ? await this.getDoctorAppointments(userId)
        : await this.getPatientAppointments(userId);
      
      const now = new Date();
      return appointments.filter(appointment => {
        const appointmentDate = new Date(`${appointment.date} ${appointment.time}`);
        return appointmentDate <= now || appointment.status === 'completed';
      }).sort((a, b) => {
        const dateA = new Date(`${a.date} ${a.time}`);
        const dateB = new Date(`${b.date} ${b.time}`);
        return dateB.getTime() - dateA.getTime();
      });
    } catch (error) {
      console.error('Error fetching past appointments:', error);
      return [];
    }
  }

  // Search doctors by specialization
  async searchDoctorsBySpecialization(specialization: string): Promise<Doctor[]> {
    try {
      const allDoctors = await this.getAllDoctors();
      return allDoctors.filter(doctor => 
        doctor.specialization.toLowerCase().includes(specialization.toLowerCase()) &&
        doctor.isAvailable !== false
      );
    } catch (error) {
      console.error('Error searching doctors:', error);
      return [];
    }
  }

  // Get doctor availability for the next 7 days
  async getDoctorAvailability(doctorId: string): Promise<{ date: string; slots: TimeSlot[] }[]> {
    try {
      const availability = [];
      const today = new Date();
      
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        const dateStr = date.toISOString().split('T')[0];
        
        const slots = await this.getAvailableSlots(doctorId, dateStr);
        availability.push({ date: dateStr, slots });
      }
      
      return availability;
    } catch (error) {
      console.error('Error fetching doctor availability:', error);
      return [];
    }
  }

  // Generate time slots for a day (helper method)
  generateTimeSlots(startHour: number = 9, endHour: number = 17, intervalMinutes: number = 30): string[] {
    const slots = [];
    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += intervalMinutes) {
        const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        slots.push(time);
      }
    }
    return slots;
  }
}

export const bookingService = new ClientBookingService();
