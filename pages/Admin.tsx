import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserCheck, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  BarChart3,
  PieChart
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Cell,
  LineChart,
  Line
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { AdminService } from '../services/clientAuthService';
import type { AdminStats, Doctor, Booking } from '../types';

const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [pendingDoctors, setPendingDoctors] = useState<Doctor[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'bookings' | 'analytics'>('overview');
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      loadAdminData();
    }
  }, [isAuthenticated, user]);

  const loadAdminData = async () => {
    try {
      setIsLoading(true);
      const [statsData, doctorsData, bookingsData] = await Promise.all([
        AdminService.getStats(),
        AdminService.getPendingDoctors(),
        AdminService.getRecentBookings()
      ]);
      
      setStats(statsData);
      setPendingDoctors(doctorsData);
      setRecentBookings(bookingsData);
    } catch (error) {
      toast.error('Failed to load admin data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDoctorApproval = async (doctorId: string, approved: boolean) => {
    try {
      await AdminService.approveDoctorRegistration(doctorId, approved);
      toast.success(`Doctor ${approved ? 'approved' : 'rejected'} successfully`);
      loadAdminData();
    } catch (error) {
      toast.error('Failed to update doctor status');
    }
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
          <p className="text-gray-600">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const chartData = [
    { name: 'Jan', bookings: 65, revenue: 6500 },
    { name: 'Feb', bookings: 78, revenue: 7800 },
    { name: 'Mar', bookings: 90, revenue: 9000 },
    { name: 'Apr', bookings: 81, revenue: 8100 },
    { name: 'May', bookings: 95, revenue: 9500 },
    { name: 'Jun', bookings: 110, revenue: 11000 }
  ];

  const specializationData = [
    { name: 'General Medicine', value: 35, color: '#3B82F6' },
    { name: 'Cardiology', value: 20, color: '#EF4444' },
    { name: 'Neurology', value: 15, color: '#10B981' },
    { name: 'Orthopedics', value: 12, color: '#F59E0B' },
    { name: 'Pediatrics', value: 10, color: '#8B5CF6' },
    { name: 'Others', value: 8, color: '#6B7280' }
  ];

  const StatCard = ({ icon: Icon, title, value, change, color }: any) => (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {change && (
            <p className={`text-sm mt-1 flex items-center ${change > 0 ? 'text-green-600' : 'text-red-600'}`}>
              <TrendingUp className="h-4 w-4 mr-1" />
              {change > 0 ? '+' : ''}{change}% from last month
            </p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-8 w-8 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage your healthcare platform</p>
          </div>
          
          {/* Tabs */}
          <div className="flex space-x-8 pb-4">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'doctors', label: 'Doctors', icon: UserCheck },
              { id: 'bookings', label: 'Bookings', icon: Calendar },
              { id: 'analytics', label: 'Analytics', icon: PieChart }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Tab */}
        {activeTab === 'overview' && stats && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                title="Total Users"
                value={stats.totalUsers}
                change={12}
                color="bg-blue-500"
              />
              <StatCard
                icon={UserCheck}
                title="Active Doctors"
                value={stats.totalDoctors}
                change={8}
                color="bg-green-500"
              />
              <StatCard
                icon={Calendar}
                title="Total Bookings"
                value={stats.totalBookings}
                change={15}
                color="bg-purple-500"
              />
              <StatCard
                icon={DollarSign}
                title="Monthly Revenue"
                value={`$${stats.monthlyRevenue.toLocaleString()}`}
                change={22}
                color="bg-yellow-500"
              />
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bookings</h3>
                <div className="space-y-4">
                  {recentBookings.slice(0, 5).map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">{booking.patientName}</p>
                        <p className="text-sm text-gray-600">Dr. {booking.doctorName}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{booking.date}</p>
                        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                          booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Doctor Approvals</h3>
                <div className="space-y-4">
                  {pendingDoctors.slice(0, 5).map((doctor) => (
                    <div key={doctor.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.specialization}</p>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleDoctorApproval(doctor.id, true)}
                          className="p-1 text-green-600 hover:bg-green-100 rounded"
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDoctorApproval(doctor.id, false)}
                          className="p-1 text-red-600 hover:bg-red-100 rounded"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Doctors Tab */}
        {activeTab === 'doctors' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Doctor Management</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Doctor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Specialization</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Experience</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingDoctors.map((doctor) => (
                      <tr key={doctor.id} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <div>
                            <p className="font-medium text-gray-900">Dr. {doctor.name}</p>
                            <p className="text-sm text-gray-600">{doctor.email}</p>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-900">{doctor.specialization}</td>
                        <td className="py-4 px-4 text-gray-900">{doctor.experience} years</td>
                        <td className="py-4 px-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                            Pending
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleDoctorApproval(doctor.id, true)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handleDoctorApproval(doctor.id, false)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                            <button className="text-blue-600 hover:text-blue-700">
                              <Eye className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div className="bg-white rounded-xl shadow-lg">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Booking Management</h3>
            </div>
            <div className="p-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Doctor</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Date & Time</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900">Fee</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">{booking.patientName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900">Dr. {booking.doctorName}</p>
                        </td>
                        <td className="py-4 px-4">
                          <p className="text-gray-900">{booking.date}</p>
                          <p className="text-sm text-gray-600">{booking.time}</p>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-gray-900">${booking.fee}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Bookings Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Bookings</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="bookings" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Revenue Chart */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Revenue</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Specialization Distribution */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Doctor Specialization Distribution</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPieChart>
                    <Tooltip />
                    <RechartsPieChart data={specializationData} cx="50%" cy="50%" outerRadius={80} fill="#8884d8" dataKey="value">
                      {specializationData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </RechartsPieChart>
                  </RechartsPieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {specializationData.map((item, index) => (
                    <div key={index} className="flex items-center">
                      <div 
                        className="w-4 h-4 rounded mr-3" 
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-sm text-gray-700">{item.name}</span>
                      <span className="ml-auto text-sm font-medium text-gray-900">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;