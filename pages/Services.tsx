import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Brain, 
  Eye, 
  Bone, 
  Baby, 
  Stethoscope, 
  Calendar, 
  Clock, 
  Shield, 
  Award,
  Users,
  Sparkles,
  ArrowRight,
  CheckCircle
} from 'lucide-react';

const Services: React.FC = () => {
  const departments = [
    {
      name: 'Cardiology',
      icon: Heart,
      description: 'Expert heart care and cardiovascular treatments',
      doctors: 25,
      gradient: 'from-red-500 to-pink-500'
    },
    {
      name: 'Neurology',
      icon: Brain,
      description: 'Advanced brain and nervous system care',
      doctors: 18,
      gradient: 'from-purple-500 to-indigo-500'
    },
    {
      name: 'Ophthalmology',
      icon: Eye,
      description: 'Comprehensive eye care and vision services',
      doctors: 12,
      gradient: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Orthopedics',
      icon: Bone,
      description: 'Bone, joint, and muscle treatments',
      doctors: 20,
      gradient: 'from-green-500 to-teal-500'
    },
    {
      name: 'Pediatrics',
      icon: Baby,
      description: 'Specialized care for children and infants',
      doctors: 15,
      gradient: 'from-yellow-500 to-orange-500'
    },
    {
      name: 'General Medicine',
      icon: Stethoscope,
      description: 'Primary healthcare and general consultations',
      doctors: 30,
      gradient: 'from-indigo-500 to-purple-500'
    }
  ];

  const features = [
    {
      icon: Calendar,
      title: 'Easy Booking',
      description: 'Book appointments with just a few clicks'
    },
    {
      icon: Clock,
      title: '24/7 Support',
      description: 'Round-the-clock medical assistance'
    },
    {
      icon: Shield,
      title: 'Secure & Private',
      description: 'Your health data is completely secure'
    },
    {
      icon: Award,
      title: 'Verified Doctors',
      description: 'All doctors are certified professionals'
    }
  ];

  const DepartmentCard: React.FC<{
    department: typeof departments[0];
    index: number;
  }> = ({ department, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="group relative"
      >
        <div className="relative p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl hover:border-cyan-500/30 transition-all duration-500 overflow-hidden h-full">
          {/* Animated background gradient */}
          <div className={`absolute inset-0 bg-gradient-to-br ${department.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
          
          {/* Floating particles */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(4)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                style={{
                  left: `${20 + i * 20}%`,
                  top: `${20 + i * 15}%`,
                }}
                animate={{
                  y: [0, -10, 0],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 2 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>

          <motion.div
            className="relative z-10"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.div
              className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:shadow-lg group-hover:shadow-cyan-500/25"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <department.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
            </motion.div>
            
            <h3 className="text-lg sm:text-xl font-bold text-white mb-2 sm:mb-3 group-hover:text-cyan-400 transition-colors duration-300">
              {department.name}
            </h3>
            
            <p className="text-sm sm:text-base text-gray-400 mb-3 sm:mb-4 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
              {department.description}
            </p>
            
            <div className="flex items-center text-xs sm:text-sm text-cyan-400 mb-4 sm:mb-6">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
              <span>{department.doctors} Doctors Available</span>
            </div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to="/booking"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl text-cyan-400 px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium text-sm sm:text-base border border-cyan-500/30 hover:bg-gradient-to-r hover:from-cyan-500/30 hover:to-blue-500/30 transition-all duration-300 group"
              >
                <span>Book Appointment</span>
                <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 group-hover:translate-x-1 transition-transform duration-300" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  const FeatureCard: React.FC<{
    feature: typeof features[0];
    index: number;
  }> = ({ feature, index }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: index * 0.1 }}
        viewport={{ once: true }}
        className="text-center group"
      >
        <motion.div
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-lg group-hover:shadow-cyan-500/25"
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-white" />
        </motion.div>
        <h3 className="text-lg sm:text-xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
          {feature.title}
        </h3>
        <p className="text-sm sm:text-base text-gray-400 group-hover:text-gray-300 transition-colors duration-300">
          {feature.description}
        </p>
      </motion.div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-16"
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
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
              opacity: [0.1, 0.3, 0.1],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Infinity,
              delay: Math.random() * 5,
            }}
          >
            <div className="w-2 h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12 sm:mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-4 sm:px-6 py-2 sm:py-3 mb-6 sm:mb-8"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium text-sm sm:text-base">Medical Services</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6 px-4">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              Our Medical Services
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Comprehensive healthcare services with expert doctors across multiple specializations. 
            Book your appointment today and experience world-class medical care.
          </p>
        </motion.div>

        {/* Departments Grid */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Medical Departments
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              Choose from our wide range of medical specializations
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {departments.map((department, index) => (
              <DepartmentCard
                key={department.name}
                department={department}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <motion.div
            className="text-center mb-8 sm:mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 px-4">
              <span className="bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Why Choose Our Services?
              </span>
            </h2>
            <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto px-4">
              We provide exceptional healthcare with modern technology and experienced professionals
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                feature={feature}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* CTA Section */}
        <motion.section
          className="text-center py-8 sm:py-12 lg:py-16 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 rounded-2xl sm:rounded-3xl"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 sm:mb-6">
              <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Ready to Book Your Appointment?
              </span>
            </h2>
            <p className="text-lg sm:text-xl text-gray-300 mb-6 sm:mb-8 max-w-2xl mx-auto">
              Take the first step towards better health. Our expert doctors are ready to provide you with the best care.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-4 lg:space-x-6">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/booking"
                  className="group inline-flex items-center space-x-2 sm:space-x-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25 w-full sm:w-auto justify-center"
                >
                  <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Book Appointment</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>

              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/ai-health"
                  className="inline-flex items-center space-x-2 sm:space-x-3 bg-white/10 backdrop-blur-xl text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg border border-white/20 hover:bg-white/20 transition-all duration-300 w-full sm:w-auto justify-center"
                >
                  <Brain className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>Try AI Assistant</span>
                </Link>
              </motion.div>
            </div>

            {/* Trust indicators */}
            <motion.div
              className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
            >
              {[
                { icon: CheckCircle, text: "500+ Verified Doctors" },
                { icon: Shield, text: "100% Secure & Private" },
                { icon: Award, text: "99% Patient Satisfaction" }
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-center space-x-2 text-gray-300 text-sm sm:text-base">
                  <item.icon className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-400" />
                  <span>{item.text}</span>
                </div>
              ))}
            </motion.div>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

export default Services;