
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Settings, Heart, Stethoscope, Shield, LayoutDashboard, UserCircle, Calendar, MessageCircle } from 'lucide-react';
import clientChatService from '../services/clientChatService';
import { toast } from 'react-hot-toast';
import { authService } from '../services/clientAuthService';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userType, setUserType] = useState<string>('');
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Check authentication status
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const user = authService.getCurrentUser();
      const doctor = authService.getCurrentDoctor();
      const type = authService.getUserType();
      
      setIsAuthenticated(authenticated);
      setCurrentUser(user || doctor);
      setUserType(type);
    };

    checkAuth();
    // Check auth status on route changes
    const interval = setInterval(checkAuth, 1000);
    return () => clearInterval(interval);
  }, [location]);
  
  // Fetch unread message count
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      const fetchUnreadCount = async () => {
        try {
          const count = await clientChatService.getUnreadMessageCount();
          setUnreadMessageCount(count);
        } catch (error) {
          console.error('Error fetching unread message count:', error);
        }
      };
      
      fetchUnreadCount();
      // Poll for unread messages every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, currentUser]);

  const handleLogout = async () => {
    try {
      authService.logout();
      setIsAuthenticated(false);
      setCurrentUser(null);
      setUserType('');
      toast.success('Logged out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Failed to logout');
    }
  };

  const navItems = [
    { name: 'Home', path: '/', icon: Heart },
    { name: 'AI Health', path: '/ai-health', icon: Stethoscope },
    { name: 'Services', path: '/services', icon: Settings },
    { name: 'Contact', path: '/contact', icon: User },
  ];

  const headerVariants = {
    initial: { y: -100, opacity: 0 },
    animate: { y: 0, opacity: 1 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const menuVariants = {
    closed: { opacity: 0, x: "100%" },
    open: { opacity: 1, x: 0 }
  };

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'bg-black/90 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' 
          : 'bg-transparent'
      }`}
      variants={headerVariants}
      initial="initial"
      animate="animate"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/" className="flex items-center space-x-3">
              <motion.div
                className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-xl flex items-center justify-center"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Heart className="w-6 h-6 text-white" />
              </motion.div>
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                HealthAI
              </span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Link
                    to={item.path}
                    className={`relative px-4 py-2 rounded-xl transition-all duration-300 flex items-center space-x-2 group ${
                      isActive
                        ? 'text-cyan-400 bg-cyan-400/10'
                        : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{item.name}</span>
                    {isActive && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 rounded-xl"
                        layoutId="activeTab"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {userType === 'admin' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/admin"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-purple-500/25"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Admin</span>
                    </Link>
                  </motion.div>
                )}
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-green-500/25"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>Dashboard</span>
                  </Link>
                </motion.div>
                
                {userType !== 'admin' && (
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/booking"
                      className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Book Appointment</span>
                    </Link>
                  </motion.div>
                )}

                <div className="flex items-center space-x-3">
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/messages"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-yellow-500/25 relative"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Messages</span>
                    {unreadMessageCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                      </span>
                    )}
                  </Link>
                </motion.div>
                
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                  >
                    <UserCircle className="w-4 h-4" />
                    <span>Profile</span>
                  </Link>
                </motion.div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                    <p className="text-xs text-gray-400">
                      {userType === 'admin' ? 'Admin' : userType === 'doctor' ? 'Doctor' : 'Patient'}
                    </p>
                  </div>
                  <motion.button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-white hover:bg-red-500/10 rounded-xl transition-all duration-300"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <LogOut className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/login"
                    className="px-6 py-2 text-gray-300 hover:text-white border border-gray-600 hover:border-gray-500 rounded-xl transition-all duration-300"
                  >
                    Login
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/register"
                    className="px-6 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 shadow-lg hover:shadow-cyan-500/25"
                  >
                    Sign Up
                  </Link>
                </motion.div>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </motion.button>
        </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-gray-800/50"
            variants={menuVariants}
            initial="closed"
            animate="open"
            exit="closed"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <div className="px-4 py-6 space-y-4">
              {navItems.map((item, index) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.path}
                      className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? 'text-cyan-400 bg-cyan-400/10'
                          : 'text-gray-300 hover:text-white hover:bg-white/5'
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="font-medium">{item.name}</span>
                    </Link>
                  </motion.div>
                );
              })}
              
              <div className="pt-4 border-t border-gray-800">
                {isAuthenticated ? (
                  <div className="space-y-3">
                    <div className="px-4 py-2">
                      <p className="text-sm font-medium text-white">{currentUser?.name}</p>
                      <p className="text-xs text-gray-400">
                        {userType === 'admin' ? 'Admin' : userType === 'doctor' ? 'Doctor' : 'Patient'}
                      </p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      className="flex items-center space-x-3 px-4 py-3 text-green-400 hover:text-green-300 hover:bg-green-500/10 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <LayoutDashboard className="w-5 h-5" />
                      <span>Dashboard</span>
                    </Link>
                    
                    <Link
                      to="/messages"
                      className="flex items-center space-x-3 px-4 py-3 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-500/10 rounded-xl transition-all duration-300 relative"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <MessageCircle className="w-5 h-5" />
                      <span>Messages</span>
                      {unreadMessageCount > 0 && (
                        <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {unreadMessageCount > 9 ? '9+' : unreadMessageCount}
                        </span>
                      )}
                    </Link>
                    
                    <Link
                      to="/profile"
                      className="flex items-center space-x-3 px-4 py-3 text-indigo-400 hover:text-indigo-300 hover:bg-indigo-500/10 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <UserCircle className="w-5 h-5" />
                      <span>Profile</span>
                    </Link>
                    
                    {userType === 'admin' && (
                      <Link
                        to="/admin"
                        className="flex items-center space-x-3 px-4 py-3 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10 rounded-xl transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Shield className="w-5 h-5" />
                        <span>Admin Dashboard</span>
                      </Link>
                    )}
                    
                    {userType !== 'admin' && (
                      <Link
                        to="/booking"
                        className="flex items-center space-x-3 px-4 py-3 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 rounded-xl transition-all duration-300"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Stethoscope className="w-5 h-5" />
                        <span>Book Appointment</span>
                      </Link>
                    )}
                    
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      className="flex items-center space-x-3 px-4 py-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-all duration-300 w-full"
                    >
                      <LogOut className="w-5 h-5" />
                      <span>Logout</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link
                      to="/login"
                      className="block px-4 py-3 text-gray-300 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/register"
                      className="block px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all duration-300 text-center"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Header;
