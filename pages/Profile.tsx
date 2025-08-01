import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  MapPin, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Stethoscope,
  Award,
  GraduationCap,
  Building,
  DollarSign,
  Clock,
  Star,
  Shield,
  Eye,
  EyeOff,
  Lock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/clientAuthService';
import ProfilePictureCapture from '../components/ProfilePictureCapture';
import type { User as UserType, Doctor } from '../services/clientDatabaseService';

// Validation schemas
const userProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone number is required'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  gender: z.string().min(1, 'Gender is required'),
  address: z.string().min(1, 'Address is required'),
});

const doctorProfileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  phone: z.string().min(1, 'Phone number is required'),
  specialization: z.string().min(1, 'Specialization is required'),
  yearsOfExperience: z.number().min(0, 'Experience must be positive'),
  qualification: z.string().min(1, 'Qualification is required'),
  bio: z.string().min(1, 'Bio is required'),
  consultationFee: z.number().min(0, 'Fee must be positive'),
});

const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Confirm password is required'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords must match',
  path: ['confirmPassword']
});

type UserProfileForm = z.infer<typeof userProfileSchema>;
type DoctorProfileForm = z.infer<typeof doctorProfileSchema>;
type PasswordChangeForm = z.infer<typeof passwordChangeSchema>;

const Profile: React.FC = () => {
  const { user, isDoctor } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profilePicture, setProfilePicture] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const profileForm = useForm<UserProfileForm | DoctorProfileForm>({
    resolver: zodResolver(isDoctor ? doctorProfileSchema : userProfileSchema),
  });

  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
  });

  useEffect(() => {
    if (user) {
      setProfilePicture(user.profilePicture || '');
      
      if (isDoctor) {
        const doctor = user as Doctor;
        profileForm.reset({
          name: doctor.name,
          email: doctor.email,
          phone: doctor.phone,
          specialization: doctor.specialization,
          yearsOfExperience: doctor.yearsOfExperience,
          qualification: doctor.qualification,
          bio: doctor.bio,
          consultationFee: doctor.consultationFee,
        });
      } else {
        const patient = user as UserType;
        profileForm.reset({
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          dateOfBirth: patient.dateOfBirth,
          gender: patient.gender,
          address: patient.address,
        });
      }
    }
  }, [user, isDoctor, profileForm]);

  const onProfileSubmit = async (data: UserProfileForm | DoctorProfileForm) => {
    setIsLoading(true);
    try {
      const updateData = { ...data, profilePicture };
      const result = await authService.updateProfile(updateData);
      
      if (result.success) {
        toast.success('Profile updated successfully!');
        setIsEditing(false);
      } else {
        toast.error(result.message || 'Failed to update profile');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const onPasswordSubmit = async (data: PasswordChangeForm) => {
    setIsLoading(true);
    try {
      const result = await authService.changePassword(data.currentPassword, data.newPassword);
      
      if (result.success) {
        toast.success('Password changed successfully!');
        setIsChangingPassword(false);
        passwordForm.reset();
      } else {
        toast.error(result.message || 'Failed to change password');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const specializations = [
    'General Medicine', 'Cardiology', 'Neurology', 'Orthopedics',
    'Pediatrics', 'Gynecology', 'Dermatology', 'Psychiatry',
    'Ophthalmology', 'ENT', 'Radiology', 'Anesthesiology'
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 py-8 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-6 py-3 mb-6">
            <User className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">Profile Management</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
            {isDoctor ? 'Doctor Profile' : 'Patient Profile'}
          </h1>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Picture & Basic Info */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <div className="text-center">
                {/* Profile Picture */}
                <div className="relative inline-block mb-6">
                  <div className="w-32 h-32 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 p-1">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      {profilePicture ? (
                        <img
                          src={profilePicture}
                          alt="Profile"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <User className="w-16 h-16 text-gray-400" />
                      )}
                    </div>
                  </div>
                  {isEditing && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -bottom-2 -right-2"
                    >
                      <ProfilePictureCapture
                        onCapture={setProfilePicture}
                        trigger={
                          <button className="bg-cyan-500 hover:bg-cyan-600 text-white p-2 rounded-full transition-colors">
                            <Camera className="w-4 h-4" />
                          </button>
                        }
                      />
                    </motion.div>
                  )}
                </div>

                {/* Basic Info */}
                <h2 className="text-xl font-bold text-white mb-2">{user.name}</h2>
                <p className="text-gray-400 mb-4">{user.email}</p>
                
                {isDoctor && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-center text-cyan-400">
                      <Stethoscope className="w-4 h-4 mr-2" />
                      <span className="text-sm">{(user as Doctor).specialization}</span>
                    </div>
                    <div className="flex items-center justify-center text-gray-400">
                      <Award className="w-4 h-4 mr-2" />
                      <span className="text-sm">{(user as Doctor).yearsOfExperience} years experience</span>
                    </div>
                    {(user as Doctor).rating > 0 && (
                      <div className="flex items-center justify-center text-yellow-400">
                        <Star className="w-4 h-4 mr-1 fill-current" />
                        <span className="text-sm">{(user as Doctor).rating} ({(user as Doctor).totalReviews} reviews)</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 space-y-3">
                  <motion.button
                    onClick={() => setIsEditing(!isEditing)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-2 px-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 flex items-center justify-center"
                  >
                    {isEditing ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel Edit
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Edit Profile
                      </>
                    )}
                  </motion.button>
                  
                  <motion.button
                    onClick={() => setIsChangingPassword(!isChangingPassword)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white py-2 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Change Password
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Profile Details */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-gray-800/30 backdrop-blur-xl rounded-2xl p-6 border border-gray-700/50">
              <AnimatePresence mode="wait">
                {isChangingPassword ? (
                  <motion.div
                    key="password-change"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Lock className="w-5 h-5 mr-2 text-cyan-400" />
                      Change Password
                    </h3>
                    
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                      {/* Current Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Current Password
                        </label>
                        <div className="relative">
                          <input
                            {...passwordForm.register('currentPassword')}
                            type={showCurrentPassword ? 'text' : 'password'}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter current password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                          >
                            {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.currentPassword && (
                          <p className="text-red-400 text-sm mt-1">
                            {passwordForm.formState.errors.currentPassword.message}
                          </p>
                        )}
                      </div>

                      {/* New Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <input
                            {...passwordForm.register('newPassword')}
                            type={showNewPassword ? 'text' : 'password'}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                            placeholder="Enter new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                          >
                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.newPassword && (
                          <p className="text-red-400 text-sm mt-1">
                            {passwordForm.formState.errors.newPassword.message}
                          </p>
                        )}
                      </div>

                      {/* Confirm Password */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <input
                            {...passwordForm.register('confirmPassword')}
                            type={showConfirmPassword ? 'text' : 'password'}
                            className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                            placeholder="Confirm new password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-cyan-400"
                          >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                          </button>
                        </div>
                        {passwordForm.formState.errors.confirmPassword && (
                          <p className="text-red-400 text-sm mt-1">
                            {passwordForm.formState.errors.confirmPassword.message}
                          </p>
                        )}
                      </div>

                      <div className="flex space-x-4">
                        <motion.button
                          type="submit"
                          disabled={isLoading}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                        >
                          {isLoading ? (
                            <motion.div
                              animate={{ rotate: 360 }}
                              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                            />
                          ) : (
                            <Save className="w-5 h-5 mr-2" />
                          )}
                          {isLoading ? 'Changing...' : 'Change Password'}
                        </motion.button>
                        
                        <motion.button
                          type="button"
                          onClick={() => {
                            setIsChangingPassword(false);
                            passwordForm.reset();
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300"
                        >
                          Cancel
                        </motion.button>
                      </div>
                    </form>
                  </motion.div>
                ) : (
                  <motion.div
                    key="profile-details"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center">
                      <Shield className="w-5 h-5 mr-2 text-cyan-400" />
                      Profile Information
                    </h3>

                    <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Full Name
                          </label>
                          {isEditing ? (
                            <input
                              {...profileForm.register('name')}
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                              {user.name}
                            </div>
                          )}
                          {profileForm.formState.errors.name && (
                            <p className="text-red-400 text-sm mt-1">
                              {profileForm.formState.errors.name.message}
                            </p>
                          )}
                        </div>

                        {/* Email */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Email Address
                          </label>
                          {isEditing ? (
                            <input
                              {...profileForm.register('email')}
                              type="email"
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                              {user.email}
                            </div>
                          )}
                          {profileForm.formState.errors.email && (
                            <p className="text-red-400 text-sm mt-1">
                              {profileForm.formState.errors.email.message}
                            </p>
                          )}
                        </div>

                        {/* Phone */}
                        <div>
                          <label className="block text-sm font-medium text-gray-300 mb-2">
                            Phone Number
                          </label>
                          {isEditing ? (
                            <input
                              {...profileForm.register('phone')}
                              className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                            />
                          ) : (
                            <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                              {user.phone}
                            </div>
                          )}
                          {profileForm.formState.errors.phone && (
                            <p className="text-red-400 text-sm mt-1">
                              {profileForm.formState.errors.phone.message}
                            </p>
                          )}
                        </div>

                        {/* Conditional Fields based on user type */}
                        {isDoctor ? (
                          <>
                            {/* Specialization */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Specialization
                              </label>
                              {isEditing ? (
                                <select
                                  {...profileForm.register('specialization')}
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                >
                                  {specializations.map((spec) => (
                                    <option key={spec} value={spec} className="bg-gray-800">
                                      {spec}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                                  {(user as Doctor).specialization}
                                </div>
                              )}
                            </div>

                            {/* Years of Experience */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Years of Experience
                              </label>
                              {isEditing ? (
                                <input
                                  {...profileForm.register('yearsOfExperience', { valueAsNumber: true })}
                                  type="number"
                                  min="0"
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                                  {(user as Doctor).yearsOfExperience} years
                                </div>
                              )}
                            </div>

                            {/* Qualification */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Qualification
                              </label>
                              {isEditing ? (
                                <input
                                  {...profileForm.register('qualification')}
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                                  {(user as Doctor).qualification}
                                </div>
                              )}
                            </div>

                            {/* Consultation Fee */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Consultation Fee ($)
                              </label>
                              {isEditing ? (
                                <input
                                  {...profileForm.register('consultationFee', { valueAsNumber: true })}
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                                  ${(user as Doctor).consultationFee}
                                </div>
                              )}
                            </div>

                            {/* Bio */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Bio
                              </label>
                              {isEditing ? (
                                <textarea
                                  {...profileForm.register('bio')}
                                  rows={4}
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none"
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white min-h-[100px]">
                                  {(user as Doctor).bio}
                                </div>
                              )}
                            </div>
                          </>
                        ) : (
                          <>
                            {/* Date of Birth */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Date of Birth
                              </label>
                              {isEditing ? (
                                <input
                                  {...profileForm.register('dateOfBirth')}
                                  type="date"
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                                  {new Date((user as UserType).dateOfBirth).toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {/* Gender */}
                            <div>
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Gender
                              </label>
                              {isEditing ? (
                                <select
                                  {...profileForm.register('gender')}
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300"
                                >
                                  <option value="male" className="bg-gray-800">Male</option>
                                  <option value="female" className="bg-gray-800">Female</option>
                                  <option value="other" className="bg-gray-800">Other</option>
                                </select>
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white capitalize">
                                  {(user as UserType).gender}
                                </div>
                              )}
                            </div>

                            {/* Address */}
                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-300 mb-2">
                                Address
                              </label>
                              {isEditing ? (
                                <textarea
                                  {...profileForm.register('address')}
                                  rows={3}
                                  className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-300 resize-none"
                                />
                              ) : (
                                <div className="px-4 py-3 bg-gray-900/30 border border-gray-700 rounded-xl text-white">
                                  {(user as UserType).address}
                                </div>
                              )}
                            </div>
                          </>
                        )}
                      </div>

                      {isEditing && (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="flex space-x-4 pt-6"
                        >
                          <motion.button
                            type="submit"
                            disabled={isLoading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-600 text-white py-3 px-4 rounded-xl font-medium hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 flex items-center justify-center"
                          >
                            {isLoading ? (
                              <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                              />
                            ) : (
                              <Save className="w-5 h-5 mr-2" />
                            )}
                            {isLoading ? 'Saving...' : 'Save Changes'}
                          </motion.button>
                          
                          <motion.button
                            type="button"
                            onClick={() => {
                              setIsEditing(false);
                              profileForm.reset();
                            }}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl font-medium transition-all duration-300"
                          >
                            Cancel
                          </motion.button>
                        </motion.div>
                      )}
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Profile;