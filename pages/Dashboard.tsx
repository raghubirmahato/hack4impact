import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  User, 
  Stethoscope, 
  MapPin, 
  Phone,
  Mail,
  QrCode,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useNavigate, useLocation } from 'react-router-dom';
import { bookingService } from '../services/clientBookingService';
import { authService } from '../services/clientAuthService';
import { databaseService } from '../services/databaseService';
import { QRCodeDisplay } from '../components/QRCodeScanner';
import type { Appointment, User as UserType, Doctor } from '../services/clientDatabaseService';

const Dashboard: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const navigate = useNavigate();
  const location = useLocation();

  const currentUser = authService.getCurrentUser();
  const currentDoctor = authService.getCurrentDoctor();
  const userType = authService.getUserType();

  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login');
      return;
    }
    loadData();
    
    // Show success message if coming from booking
    if (location.state?.message) {
      toast.success(location.state.message);
    }
  }, [navigate, location]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      if (userType === 'patient' && currentUser) {
        const userAppointments = await bookingService.getPatientAppointments(currentUser.id);
        setAppointments(userAppointments);
      } else if (userType === 'doctor' && currentDoctor) {
        const doctorAppointments = await bookingService.getDoctorAppointments(currentDoctor.id);
        setAppointments(doctorAppointments);
      }
      
      const doctorsList = await bookingService.getAllDoctors();
      setDoctors(doctorsList);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    if (!confirm('Are you sure you want to cancel this appointment?')) {
      return;
    }

    try {
      await bookingService.cancelAppointment(appointmentId);
      toast.success('Appointment cancelled successfully');
      loadData();
    } catch (error: any) {
      console.error('Error cancelling appointment:', error);
      toast.error(error.message || 'Failed to cancel appointment');
    }
  };

  const handleUpdateAppointmentStatus = async (appointmentId: string, status: 'confirmed' | 'completed' | 'cancelled') => {
    try {
      await bookingService.updateAppointmentStatus(appointmentId, status);
      toast.success(`Appointment ${status} successfully`);
      loadData();
    } catch (error: any) {
      console.error('Error updating appointment:', error);
      toast.error(error.message || 'Failed to update appointment');
    }
  };

  const getDoctorInfo = (doctorId: string) => {
    return doctors.find(doc => doc.id === doctorId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled': return <AlertCircle className="h-4 w-4" />;
      case 'confirmed': return <CheckCircle className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'cancelled': return <XCircle className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    const appointmentDate = new Date(appointment.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (selectedTab) {
      case 'upcoming':
        return appointmentDate >= today && appointment.status !== 'cancelled' && appointment.status !== 'completed';
      case 'past':
        return appointmentDate < today || appointment.status === 'completed';
      case 'all':
      default:
        return true;
    }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-white mb-2">
            {userType === 'doctor' ? 'Doctor Dashboard' : 'My Dashboard'}
          </h1>
          <p className="text-gray-300">
            {userType === 'doctor' 
              ? `Welcome back, Dr. ${currentDoctor?.name}` 
              : `Welcome back, ${currentUser?.name}`
            }
          </p>
        </motion.div>

        {/* Tab Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-lg p-1">
            {[
              { key: 'upcoming', label: 'Upcoming' },
              { key: 'past', label: 'Past' },
              { key: 'all', label: 'All' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedTab(tab.key as any)}
                className={`px-6 py-2 rounded-md font-medium transition-all ${
                  selectedTab === tab.key
                    ? 'bg-cyan-500 text-white shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        {userType === 'patient' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <button
              onClick={() => navigate('/booking')}
              className="bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg"
            >
              <Calendar className="h-5 w-5 inline mr-2" />
              Book New Appointment
            </button>
          </motion.div>
        )}

        {/* Appointments List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          {filteredAppointments.length === 0 ? (
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">No appointments found</h3>
              <p className="text-gray-300">
                {selectedTab === 'upcoming' 
                  ? "You don't have any upcoming appointments." 
                  : "No appointments in this category."
                }
              </p>
            </div>
          ) : (
            filteredAppointments.map((appointment) => {
              const doctor = getDoctorInfo(appointment.doctorId);
              return (
                <motion.div
                  key={appointment.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-6 hover:bg-white/20 transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <div className="w-12 h-12 bg-cyan-500/20 rounded-full flex items-center justify-center">
                          <User className="h-6 w-6 text-cyan-400" />
                        </div>
                        <div>
                          <h3 className="text-xl font-semibold text-white">
                            {userType === 'doctor' 
                              ? `Patient: ${appointment.patientId}` 
                              : `Dr. ${doctor?.name || 'Unknown Doctor'}`
                            }
                          </h3>
                          {doctor && userType === 'patient' && (
                            <p className="text-cyan-400">{doctor.specialization}</p>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center text-gray-300">
                          <Calendar className="h-4 w-4 mr-2" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center text-gray-300">
                          <Clock className="h-4 w-4 mr-2" />
                          {appointment.time}
                        </div>
                        {doctor && userType === 'patient' && (
                          <>
                            <div className="flex items-center text-gray-300">
                              <MapPin className="h-4 w-4 mr-2" />
                              {doctor.hospitalAffiliation}
                            </div>
                            <div className="flex items-center text-gray-300">
                              <Stethoscope className="h-4 w-4 mr-2" />
                              ${doctor.consultationFee}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="mb-4">
                        <h4 className="text-white font-medium mb-2">Symptoms:</h4>
                        <p className="text-gray-300">{appointment.symptoms}</p>
                        {appointment.notes && (
                          <>
                            <h4 className="text-white font-medium mb-2 mt-3">Notes:</h4>
                            <p className="text-gray-300">{appointment.notes}</p>
                          </>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center space-x-1 ${getStatusColor(appointment.status)}`}>
                          {getStatusIcon(appointment.status)}
                          <span className="capitalize">{appointment.status}</span>
                        </div>

                        <div className="flex items-center space-x-2">
                          {appointment.qrCode && (
                            <QRCodeDisplay appointmentId={appointment.id} />
                          )}
                          
                          {userType === 'doctor' && appointment.status === 'scheduled' && (
                            <>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'confirmed')}
                                className="bg-green-600 text-white px-3 py-1 rounded-md text-sm hover:bg-green-700 transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                onClick={() => handleUpdateAppointmentStatus(appointment.id, 'cancelled')}
                                className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors"
                              >
                                Cancel
                              </button>
                            </>
                          )}

                          {userType === 'doctor' && appointment.status === 'confirmed' && (
                            <button
                              onClick={() => handleUpdateAppointmentStatus(appointment.id, 'completed')}
                              className="bg-blue-600 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-700 transition-colors"
                            >
                              Mark Complete
                            </button>
                          )}

                          {userType === 'patient' && appointment.status === 'scheduled' && (
                            <button
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded-md text-sm hover:bg-red-700 transition-colors flex items-center space-x-1"
                            >
                              <Trash2 className="h-3 w-3" />
                              <span>Cancel</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Dashboard;