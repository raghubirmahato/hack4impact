import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Search, 
  Filter, 
  Star, 
  MapPin, 
  Stethoscope,
  ChevronDown
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { bookingService } from '../services/clientBookingService';
import { authService } from '../services/clientAuthService';
import type { Doctor } from '../services/clientDatabaseService';

const specializations = [
  'All Specializations',
  'Cardiology',
  'Dermatology',
  'Pediatrics',
  'Orthopedics',
  'Neurology',
  'Psychiatry',
  'General Medicine'
];

const timeSlots = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '12:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM',
  '04:00 PM', '04:30 PM', '05:00 PM', '05:30 PM'
];

const schema = z.object({
  symptoms: z.string().min(1, 'Please describe your symptoms'),
  preferredDate: z.string().min(1, 'Please select a preferred date'),
  preferredTime: z.string().min(1, 'Please select a preferred time'),
  notes: z.string().optional()
});

type FormData = z.infer<typeof schema>;

const Booking: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialization, setSelectedSpecialization] = useState('All Specializations');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema)
  });

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const doctorsList = await bookingService.getAllDoctors();
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Failed to load doctors');
    }
  };

  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialization = selectedSpecialization === 'All Specializations' ||
                                 doctor.specialization === selectedSpecialization;
    return matchesSearch && matchesSpecialization;
  });

  const onSubmit = async (data: FormData) => {
    if (!selectedDoctor) {
      toast.error('Please select a doctor');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      toast.error('Please login to book an appointment');
      navigate('/login');
      return;
    }

    setIsLoading(true);
    try {
      const appointmentData = {
        doctorId: selectedDoctor.id,
        patientId: currentUser.id,
        date: data.preferredDate,
        time: data.preferredTime,
        symptoms: data.symptoms,
        notes: data.notes || '',
        status: 'scheduled' as const
      };

      const appointment = await bookingService.bookAppointment(appointmentData);
      
      toast.success('Appointment booked successfully!');
      reset();
      setSelectedDoctor(null);
      
      // Navigate to appointment confirmation or dashboard
      navigate('/dashboard', { 
        state: { 
          message: 'Appointment booked successfully!',
          appointmentId: appointment.id 
        }
      });
    } catch (error: any) {
      console.error('Error booking appointment:', error);
      toast.error(error.message || 'Failed to book appointment');
    } finally {
      setIsLoading(false);
    }
  };

  const availableSpecializations = [...new Set(doctors.map(doctor => doctor.specialization))];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Book an Appointment
            </h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Find and book appointments with our qualified doctors based on your symptoms
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Doctors List */}
          <div className="lg:col-span-2">
            {/* Search and Filter */}
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search doctors by name or specialization"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="sm:w-64">
                  <select
                    value={selectedSpecialization}
                    onChange={(e) => setSelectedSpecialization(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
                  >
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Debug Section - Remove in production */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Debug: {doctors.length} doctors loaded</span>
                  <button
                    type="button"
                    onClick={() => {
                      authService.reinitializeDemoData();
                      loadDoctors();
                    }}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
                  >
                    Reload Demo Data
                  </button>
                </div>
              </div>
            </div>

            {/* Doctors Grid */}
            <div className="space-y-4">
              {filteredDoctors.map((doctor) => (
                <div
                  key={doctor.id}
                  className={`bg-white rounded-xl shadow-lg p-6 cursor-pointer transition-all ${
                    selectedDoctor?.id === doctor.id
                      ? 'ring-2 ring-blue-500 border-blue-500'
                      : 'hover:shadow-xl'
                  }`}
                  onClick={() => setSelectedDoctor(doctor)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900">
                            Dr. {doctor.name}
                          </h3>
                          <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                          <p className="text-gray-600 text-sm">{doctor.qualification}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center mb-1">
                            <Star className="h-4 w-4 text-yellow-400 fill-current" />
                            <span className="ml-1 text-sm font-medium">4.8</span>
                          </div>
                          <p className="text-lg font-semibold text-green-600">
                            ${doctor.consultationFee}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Stethoscope className="h-4 w-4 mr-1" />
                          {doctor.experience} years exp.
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1" />
                          {doctor.hospitalAffiliation}
                        </div>
                      </div>
                      
                      <p className="mt-2 text-gray-600 text-sm line-clamp-2">
                        {doctor.bio}
                      </p>
                      
                      {doctor.availability && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {doctor.availability.map((slot, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
                            >
                              {slot.day} {slot.startTime}-{slot.endTime}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {filteredDoctors.length === 0 && (
              <div className="text-center py-12">
                <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No doctors found</h3>
                <p className="text-gray-600">Try adjusting your search criteria</p>
              </div>
            )}
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Book Appointment</h2>
              
              {selectedDoctor ? (
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">Selected Doctor</h3>
                  <p className="text-blue-700">Dr. {selectedDoctor.name}</p>
                  <p className="text-blue-600 text-sm">{selectedDoctor.specialization}</p>
                </div>
              ) : (
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Please select a doctor to continue</p>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe Your Symptoms
                  </label>
                  <textarea
                    {...register('symptoms')}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Please describe your symptoms in detail..."
                  />
                  {errors.symptoms && (
                    <p className="mt-1 text-sm text-red-600">{errors.symptoms.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Date
                  </label>
                  <input
                    {...register('preferredDate')}
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  {errors.preferredDate && (
                    <p className="mt-1 text-sm text-red-600">{errors.preferredDate.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preferred Time
                  </label>
                  <select
                    {...register('preferredTime')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select time</option>
                    {timeSlots.map((time) => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                  {errors.preferredTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.preferredTime.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Any additional information..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={!selectedDoctor || isLoading}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <>
                      <Calendar className="h-5 w-5 mr-2" />
                      Book Appointment
                    </>
                  )}
                </button>
              </form>

              {selectedDoctor && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Consultation Fee</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ${selectedDoctor.consultationFee}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    Payment will be processed after confirmation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;