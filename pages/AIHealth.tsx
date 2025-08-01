import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, Heart, Eye, Sparkles } from 'lucide-react';
import SymptomChecker from '../components/SymptomChecker';
import HealthTips from '../components/HealthTips';
import VisualAnalysis from '../components/VisualAnalysis';

const AIHealth: React.FC = () => {
  const [activeView, setActiveView] = useState<'symptom-checker' | 'health-tips' | 'visual-analysis'>('symptom-checker');

  const navItems = [
    {
      id: 'symptom-checker' as const,
      label: 'Symptom Checker',
      icon: Brain,
      description: 'AI-powered symptom analysis',
      gradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'health-tips' as const,
      label: 'Health Tips',
      icon: Heart,
      description: 'Personalized health advice',
      gradient: 'from-red-500 to-pink-500'
    },
    {
      id: 'visual-analysis' as const,
      label: 'Visual Analysis',
      icon: Eye,
      description: 'Image-based health insights',
      gradient: 'from-blue-500 to-cyan-500'
    }
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen pt-16"
    >
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -20, 0],
              opacity: [0.1, 0.3, 0.1],
              scale: [1, 1.2, 1],
            }}
            transition={{
              duration: 8 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 3,
            }}
          >
            <div className="w-1 h-1 sm:w-2 sm:h-2 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.div
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-500/20 rounded-full px-6 py-3 mb-6"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <span className="text-cyan-400 font-medium">AI-Powered Health Tools</span>
          </motion.div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
            <span className="bg-gradient-to-r from-white via-cyan-200 to-blue-400 bg-clip-text text-transparent">
              AI Health Assistant
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed px-4">
            Get instant health insights with our advanced AI-powered tools. 
            Analyze symptoms, receive personalized tips, and get visual health assessments.
          </p>
        </motion.div>

        {/* Navigation */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
          {navItems.map((item, index) => (
            <motion.button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className="group relative"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className={`relative p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border rounded-2xl transition-all duration-500 text-left overflow-hidden ${
                activeView === item.id
                  ? 'border-cyan-500/50 shadow-lg shadow-cyan-500/25'
                  : 'border-gray-800/50 hover:border-cyan-500/30'
              }`}>
                {/* Animated background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`} />
                
                {/* Active indicator */}
                {activeView === item.id && (
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10"
                    layoutId="activeTab"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden">
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute w-1 h-1 bg-cyan-400/30 rounded-full"
                      style={{
                        left: `${20 + i * 25}%`,
                        top: `${20 + i * 15}%`,
                      }}
                      animate={{
                        y: [0, -8, 0],
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

                <div className="relative z-10">
                  <div className="flex items-center mb-3 sm:mb-4">
                    <motion.div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center mr-3 sm:mr-4 ${
                        activeView === item.id
                          ? 'bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-cyan-500/25'
                          : 'bg-gradient-to-br from-gray-700 to-gray-800'
                      }`}
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <item.icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </motion.div>
                    <h3 className={`text-lg sm:text-xl font-bold transition-colors duration-300 ${
                      activeView === item.id ? 'text-cyan-400' : 'text-white group-hover:text-cyan-400'
                    }`}>
                      {item.label}
                    </h3>
                  </div>
                  <p className={`text-sm sm:text-base transition-colors duration-300 ${
                    activeView === item.id ? 'text-gray-300' : 'text-gray-400 group-hover:text-gray-300'
                  }`}>
                    {item.description}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Content */}
        <motion.div 
          className="relative bg-gradient-to-br from-gray-900/50 to-black/50 backdrop-blur-xl border border-gray-800/50 rounded-2xl p-4 sm:p-6 lg:p-8 overflow-hidden"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {/* Background decoration */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-500/5" />
          
          {/* Floating background elements */}
          <div className="absolute inset-0 overflow-hidden">
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 bg-cyan-400/10 rounded-full"
                style={{
                  left: `${10 + i * 12}%`,
                  top: `${10 + (i % 3) * 30}%`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4 + i * 0.5,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeView}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {activeView === 'symptom-checker' && <SymptomChecker />}
                {activeView === 'health-tips' && <HealthTips />}
                {activeView === 'visual-analysis' && <VisualAnalysis />}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AIHealth;