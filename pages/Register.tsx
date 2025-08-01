import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Stethoscope, ArrowLeft, Mail, Lock, UserPlus, Phone, Calendar, MapPin, GraduationCap, Award, Building, DollarSign, FileText } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/clientAuthService';
import ProfilePictureCapture from '../components/ProfilePictureCapture';
import type { RegisterForm, DoctorRegistrationForm } from '../types';

const userSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().min(1, 'Address is required'),
  profilePicture: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

const doctorSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email').min(1, 'Email is required'),
  phone: z.string().min(1, 'Phone number is required'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  experience: z.coerce.number().min(0, 'Experience must be positive'),
  qualification: z.string().min(1, 'Qualification is required'),
  licenseNumber: z.string().min(1, 'License number is required'),
  hospitalAffiliation: z.string().min(1, 'Hospital affiliation is required'),
  consultationFee: z.coerce.number().min(0, 'Fee must be positive'),
  bio: z.string().min(1, 'Bio is required'),
  profilePicture: z.string().optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [userType, setUserType] = useState<'user' | 'doctor'>('user');
  const [isLoading, setIsLoading] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const userForm = useForm<RegisterForm>({
    resolver: zodResolver(userSchema)
  });

  const doctorForm = useForm<DoctorRegistrationForm>({
    resolver: zodResolver(doctorSchema)
  });

  const currentForm = userType === 'user' ? userForm : doctorForm;

  const onSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      let result;
      
      if (userType === 'doctor') {
        const doctorInfo = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          specialization: data.specialization,
          yearsOfExperience: parseInt(data.experience),
          qualification: data.qualification,
          licenseNumber: data.licenseNumber,
          hospitalAffiliation: data.hospitalAffiliation,
          consultationFee: parseFloat(data.consultationFee),
          bio: data.bio,
          profilePicture: profilePicture,
          availability: [
            { id: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { id: '2', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { id: '3', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { id: '4', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
            { id: '5', dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true }
          ]
        };
        result = await authService.registerDoctor(doctorInfo, data.password);
        toast.success('Doctor registration successful! Your account is pending approval.');
      } else {
        const userInfo = {
          name: data.name,
          email: data.email,
          phone: data.phone,
          dateOfBirth: data.dateOfBirth,
          gender: data.gender,
          address: data.address,
          profilePicture: profilePicture
        };
        result = await authService.registerUser(userInfo, data.password);
        toast.success('Registration successful!');
      }
      
      if (result.success && result.user) {
        // Auto-login after successful registration
        await login(data.email, data.password);
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const specializations = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry',
    'Ophthalmology', 'ENT', 'Radiology', 'Anesthesiology'
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(25)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              rotate: [0, 180, 360],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 8 + Math.random() * 12,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <div className="w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
          </motion.div>
        ))}
      </div>

      {/* Gradient background overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      <div className="relative z-10 max-w-4xl w-full space-y-6 sm:space-y-8">
        {/* Back Button */}
        <motion.div
          className="flex justify-start"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to="/"
              className="flex items-center text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300 group"
            >
              <ArrowLeft className="h-4 w-4 mr-1 group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Home
            </Link>
          </motion.div>
        </motion.div>

        {/* Header */}
        <motion.div
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-6 py-3 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <UserPlus className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Create Account</span>
          </motion.div>

          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              Join Good Health AI
            </span>
          </h2>
          <p className="text-sm sm:text-base text-gray-300">
            Already have an account?{' '}
            <Link to="/login" className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors duration-300">
              Sign in here
            </Link>
          </p>
        </motion.div>

        {/* User Type Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-1 hover:border-cyan-500/30 transition-all duration-500 max-w-md mx-auto"
        >
          <div className="grid grid-cols-2 gap-1">
            <motion.button
              type="button"
              onClick={() => setUserType('user')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                userType === 'user'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50'
              }`}
            >
              <User className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Patient Registration
            </motion.button>
            <motion.button
              type="button"
              onClick={() => setUserType('doctor')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-center py-2 sm:py-3 px-3 sm:px-4 rounded-xl font-medium text-sm sm:text-base transition-all duration-300 ${
                userType === 'doctor'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25'
                  : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/50'
              }`}
            >
              <Stethoscope className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
              Doctor Registration
            </motion.button>
          </div>
        </motion.div>

        {/* Registration Form */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative"
        >
          <div className="bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-6 sm:p-8 hover:border-cyan-500/30 transition-all duration-500">
            {/* Floating particles */}
            <div className="absolute inset-0 overflow-hidden rounded-2xl">
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                  style={{
                    left: `${10 + i * 8}%`,
                    top: `${15 + i * 7}%`,
                  }}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.3, 1, 0.3],
                  }}
                  transition={{
                    duration: 3 + i * 0.5,
                    repeat: Infinity,
                    delay: i * 0.3,
                  }}
                />
              ))}
            </div>

            <div className="relative z-10">
              <form onSubmit={currentForm.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                {/* Common Fields */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <User className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-cyan-400" />
                      Full Name
                    </label>
                    <input
                      {...currentForm.register('name')}
                      type="text"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                      placeholder="Enter your full name"
                    />
                    {currentForm.formState.errors.name && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-400"
                      >
                        {currentForm.formState.errors.name.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Mail className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-cyan-400" />
                      Email Address
                    </label>
                    <input
                      {...currentForm.register('email')}
                      type="email"
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                      placeholder="Enter your email"
                    />
                    {currentForm.formState.errors.email && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-400"
                      >
                        {currentForm.formState.errors.email.message}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <input
                    {...currentForm.register('phone')}
                    type="tel"
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                  {currentForm.formState.errors.phone && (
                    <motion.p
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-1 text-sm text-red-400"
                    >
                      {currentForm.formState.errors.phone.message}
                    </motion.p>
                  )}
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
                      <Lock className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-cyan-400" />
                      Password
                    </label>
                    <div className="relative">
                      <input
                        {...currentForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10 sm:pr-12 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Create a password"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-cyan-400 transition-colors duration-300" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-cyan-400 transition-colors duration-300" />
                        )}
                      </motion.button>
                    </div>
                    {currentForm.formState.errors.password && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-400"
                      >
                        {currentForm.formState.errors.password.message}
                      </motion.p>
                    )}
                  </motion.div>

                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        {...currentForm.register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent pr-10 sm:pr-12 transition-all duration-300 text-sm sm:text-base"
                        placeholder="Confirm your password"
                      />
                      <motion.button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-cyan-400 transition-colors duration-300" />
                        ) : (
                          <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400 hover:text-cyan-400 transition-colors duration-300" />
                        )}
                      </motion.button>
                    </div>
                    {currentForm.formState.errors.confirmPassword && (
                      <motion.p
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-1 text-sm text-red-400"
                      >
                        {currentForm.formState.errors.confirmPassword.message}
                      </motion.p>
                    )}
                  </motion.div>
                </div>

                {/* Profile Picture Capture */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="space-y-4"
                >
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Profile Picture (Optional)
                  </label>
                  <ProfilePictureCapture
                    onImageCapture={setProfilePicture}
                    currentImage={profilePicture}
                  />
                </motion.div>

                {/* User-specific fields */}
                {userType === 'user' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Date of Birth
                        </label>
                        <input
                          {...userForm.register('dateOfBirth')}
                          type="date"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                        />
                        {userForm.formState.errors.dateOfBirth && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {userForm.formState.errors.dateOfBirth.message}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Gender
                        </label>
                        <select
                          {...userForm.register('gender')}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                        >
                          <option value="">Select gender</option>
                          <option value="male">Male</option>
                          <option value="female">Female</option>
                          <option value="other">Other</option>
                        </select>
                        {userForm.formState.errors.gender && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {userForm.formState.errors.gender.message}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Address
                      </label>
                      <textarea
                        {...userForm.register('address')}
                        rows={3}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base resize-none"
                        placeholder="Enter your address"
                      />
                      {userForm.formState.errors.address && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-400"
                        >
                          {userForm.formState.errors.address.message}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                {/* Doctor-specific fields */}
                {userType === 'doctor' && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="space-y-4 sm:space-y-6"
                  >
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Specialization
                        </label>
                        <select
                          {...doctorForm.register('specialization')}
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                        >
                          <option value="">Select specialization</option>
                          {specializations.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                        {doctorForm.formState.errors.specialization && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {doctorForm.formState.errors.specialization.message}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Experience (Years)
                        </label>
                        <input
                          {...doctorForm.register('experience')}
                          type="number"
                          min="0"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                          placeholder="Years of experience"
                        />
                        {doctorForm.formState.errors.experience && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {doctorForm.formState.errors.experience.message}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Qualification
                        </label>
                        <input
                          {...doctorForm.register('qualification')}
                          type="text"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                          placeholder="e.g., MBBS, MD"
                        />
                        {doctorForm.formState.errors.qualification && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {doctorForm.formState.errors.qualification.message}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          License Number
                        </label>
                        <input
                          {...doctorForm.register('licenseNumber')}
                          type="text"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                          placeholder="Medical license number"
                        />
                        {doctorForm.formState.errors.licenseNumber && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {doctorForm.formState.errors.licenseNumber.message}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Hospital Affiliation
                        </label>
                        <input
                          {...doctorForm.register('hospitalAffiliation')}
                          type="text"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                          placeholder="Hospital or clinic name"
                        />
                        {doctorForm.formState.errors.hospitalAffiliation && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {doctorForm.formState.errors.hospitalAffiliation.message}
                          </motion.p>
                        )}
                      </motion.div>

                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Consultation Fee ($)
                        </label>
                        <input
                          {...doctorForm.register('consultationFee')}
                          type="number"
                          min="0"
                          className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base"
                          placeholder="Consultation fee"
                        />
                        {doctorForm.formState.errors.consultationFee && (
                          <motion.p
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-1 text-sm text-red-400"
                          >
                            {doctorForm.formState.errors.consultationFee.message}
                          </motion.p>
                        )}
                      </motion.div>
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Bio
                      </label>
                      <textarea
                        {...doctorForm.register('bio')}
                        rows={4}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 text-sm sm:text-base resize-none"
                        placeholder="Tell us about yourself and your medical practice"
                      />
                      {doctorForm.formState.errors.bio && (
                        <motion.p
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-1 text-sm text-red-400"
                        >
                          {doctorForm.formState.errors.bio.message}
                        </motion.p>
                      )}
                    </motion.div>
                  </motion.div>
                )}

                <motion.button
                  type="submit"
                  disabled={isLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 sm:py-4 px-6 rounded-xl font-semibold text-sm sm:text-base hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                >
                  {isLoading ? (
                    <motion.div
                      className="flex items-center justify-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <motion.div
                        className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      />
                      Creating Account...
                    </motion.div>
                  ) : (
                    <span className="flex items-center justify-center">
                      <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Create {userType === 'doctor' ? 'Doctor' : 'User'} Account
                    </span>
                  )}
                </motion.button>

                <div className="text-center">
                  <p className="text-sm text-gray-400">
                    By creating an account, you agree to our{' '}
                    <motion.a
                      href="#"
                      whileHover={{ scale: 1.05 }}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                    >
                      Terms of Service
                    </motion.a>{' '}
                    and{' '}
                    <motion.a
                      href="#"
                      whileHover={{ scale: 1.05 }}
                      className="text-cyan-400 hover:text-cyan-300 transition-colors duration-300"
                    >
                      Privacy Policy
                    </motion.a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </motion.div>

        {/* Login Link */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <p className="text-gray-400 text-sm sm:text-base">
            Already have an account?{' '}
            <motion.button
              onClick={() => navigate('/login')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition-colors duration-300"
            >
              Sign in here
            </motion.button>
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Register;