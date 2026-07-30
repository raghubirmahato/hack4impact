const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3001;

// A hardcoded fallback secret here would let anyone forge valid JWTs against a
// production deployment that forgot to set JWT_SECRET. In production, fail
// fast instead. In development, generate a random per-process secret so
// tokens still work locally without a real secret ever being committed.
let JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET environment variable must be set in production');
  }
  JWT_SECRET = require('crypto').randomBytes(32).toString('hex');
  console.warn('[dev] JWT_SECRET not set - using an ephemeral random secret for this process only.');
}

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://yourdomain.com'] 
    : ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// In-memory storage (replace with actual database in production)
let users = [];
let doctors = [];
let appointments = [];
let medicalRecords = [];
let healthTips = [];
let qrCodes = [];
let messages = []; // For chat functionality

// Initialize with sample data
const initializeSampleData = () => {
  // Sample health tips
  healthTips = [
    {
      id: uuidv4(),
      title: "Stay Hydrated",
      content: "Drink at least 8 glasses of water daily to maintain optimal health.",
      category: "General Health",
      isFeatured: true,
      views: 150,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: "Regular Exercise",
      content: "Aim for at least 30 minutes of moderate exercise 5 days a week.",
      category: "Fitness",
      isFeatured: true,
      views: 200,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      title: "Balanced Diet",
      content: "Include fruits, vegetables, whole grains, and lean proteins in your daily meals.",
      category: "Nutrition",
      isFeatured: false,
      views: 120,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample doctors
  doctors = [
    {
      id: uuidv4(),
      name: "Dr. Sarah Johnson",
      email: "sarah.johnson@hospital.com",
      passwordHash: bcrypt.hashSync("doctor123", 10),
      phone: "+1-555-0101",
      specialization: "Cardiology",
      yearsOfExperience: 15,
      qualification: "MD, FACC",
      bio: "Experienced cardiologist specializing in heart disease prevention and treatment.",
      rating: 4.8,
      totalReviews: 127,
      isVerified: true,
      isAvailable: true,
      consultationFee: 150,
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '15:00', isAvailable: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: uuidv4(),
      name: "Dr. Michael Chen",
      email: "michael.chen@hospital.com",
      passwordHash: bcrypt.hashSync("doctor123", 10),
      phone: "+1-555-0102",
      specialization: "Dermatology",
      yearsOfExperience: 12,
      qualification: "MD, Board Certified Dermatologist",
      bio: "Specialist in skin conditions, cosmetic dermatology, and skin cancer prevention.",
      rating: 4.9,
      totalReviews: 89,
      isVerified: true,
      isAvailable: true,
      consultationFee: 120,
      availability: [
        { dayOfWeek: 1, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '08:00', endTime: '16:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '08:00', endTime: '14:00', isAvailable: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ];

  // Sample users
  users = [
    {
      id: uuidv4(),
      name: "Test Patient",
      email: "patient1@test.com",
      passwordHash: bcrypt.hashSync("password123", 10),
      role: "patient"
    }
  ];
};

// Authentication middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'patient' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// Helper function to generate time slots
const generateTimeSlots = (startTime, endTime, duration = 30) => {
  const slots = [];
  const start = new Date(`2000-01-01 ${startTime}`);
  const end = new Date(`2000-01-01 ${endTime}`);
  
  while (start < end) {
    slots.push({
      time: start.toTimeString().slice(0, 5),
      isAvailable: true,
      isBooked: false
    });
    start.setMinutes(start.getMinutes() + duration);
  }
  
  return slots;
};

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : err.message
  });
};

// ==================== AUTH ROUTES ====================

app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, phone, dateOfBirth, gender, address } = req.body;
    
    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, and password are required' 
      });
    }
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create new user
    const newUser = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      phone: phone || '',
      dateOfBirth: dateOfBirth || '',
      gender: gender || '',
      address: address || '',
      role: 'patient',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    users.push(newUser);
    
    // Generate token
    const token = generateToken(newUser);
    
    // Return user without password
    const { passwordHash: _, ...userResponse } = newUser;
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: userResponse,
      token
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/register-doctor', async (req, res) => {
  try {
    let doctorInfo;
    if (req.body.doctorData) {
      doctorInfo = { ...req.body.doctorData, password: req.body.password };
    } else {
      doctorInfo = req.body;
    }
    
    const { 
      name, email, password, phone, specialization, 
      yearsOfExperience, qualification, bio, consultationFee 
    } = doctorInfo;
    
    // Validation
    if (!name || !email || !password || !specialization) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name, email, password, and specialization are required' 
      });
    }
    
    // Check if doctor already exists
    const existingDoctor = doctors.find(d => d.email === email);
    if (existingDoctor) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor already exists' 
      });
    }
    
    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    
    // Create new doctor
    const newDoctor = {
      id: uuidv4(),
      name,
      email,
      passwordHash,
      phone: phone || '',
      specialization,
      yearsOfExperience: parseInt(yearsOfExperience) || 0,
      qualification: qualification || '',
      bio: bio || '',
      rating: 0,
      totalReviews: 0,
      isVerified: true,
      isAvailable: true,
      consultationFee: parseInt(consultationFee) || 100,
      availability: [
        { dayOfWeek: 1, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 3, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 4, startTime: '09:00', endTime: '17:00', isAvailable: true },
        { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isAvailable: true }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    doctors.push(newDoctor);
    
    // Generate token
    const token = generateToken({ ...newDoctor, role: 'doctor' });
    
    // Return doctor without password
    const { passwordHash: _, ...doctorResponse } = newDoctor;
    
    res.status(201).json({
      success: true,
      message: 'Doctor registered successfully',
      user: { ...doctorResponse, role: 'doctor' },
      token
    });
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt:', { email, password });
    
    // Validation
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }
    
    // Check users first
    let user = users.find(u => u.email === email);
    console.log('User found in users array:', user);
    let role = 'patient';
    
    // If not found in users, check doctors
    if (!user) {
      user = doctors.find(d => d.email === email);
      role = 'doctor';
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password' 
      });
    }
    
    // Generate token
    const token = generateToken({ ...user, role });
    console.log('Generated Token:', token);
    
    // Return user without password
    const { passwordHash: _, ...userResponse } = user;
    
    res.json({
      success: true,
      message: 'Login successful',
      user: { ...userResponse, role },
      token
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// ==================== USER ROUTES ====================

app.get('/api/users', authenticateToken, (req, res) => {
  try {
    // Only admins can view all users
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/users/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only view their own profile, admins can view any
    if (req.user.id !== id && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const user = users.find(u => u.id === id);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const { passwordHash, ...userResponse } = user;
    res.json(userResponse);
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/users/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    // Users can only update their own profile
    if (req.user.id !== id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const userIndex = users.findIndex(u => u.id === id);
    if (userIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }
    
    const { password, ...rawUpdateData } = req.body;

    // Mass-assignment fix: only allow updating a fixed set of self-service
    // profile fields. Without this whitelist, a user could PUT
    // { "role": "admin" } (or isActive, id, passwordHash, etc.) to their own
    // profile and escalate privileges, since the old code spread the entire
    // request body directly onto the stored user record.
    const ALLOWED_SELF_UPDATE_FIELDS = ['name', 'phone', 'dateOfBirth', 'gender', 'address'];
    const updateData = {};
    for (const field of ALLOWED_SELF_UPDATE_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(rawUpdateData, field)) {
        updateData[field] = rawUpdateData[field];
      }
    }

    // If password is being updated, hash it
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    users[userIndex] = {
      ...users[userIndex],
      ...updateData,
      updatedAt: new Date().toISOString()
    };
    
    const { passwordHash, ...userResponse } = users[userIndex];
    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: userResponse
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== DOCTOR ROUTES ====================

app.get('/api/doctors', (req, res) => {
  try {
    const { specialization, available } = req.query;
    let filteredDoctors = doctors.filter(d => d.isAvailable !== false);
    
    if (specialization) {
      filteredDoctors = filteredDoctors.filter(d => 
        d.specialization.toLowerCase().includes(specialization.toLowerCase())
      );
    }
    
    if (available === 'true') {
      filteredDoctors = filteredDoctors.filter(d => d.isAvailable === true);
    }
    
    const doctorsWithoutPasswords = filteredDoctors.map(({ passwordHash, ...doctor }) => doctor);
    res.json(doctorsWithoutPasswords);
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/doctors/:id', (req, res) => {
  try {
    const { id } = req.params;
    const doctor = doctors.find(d => d.id === id);
    
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    
    const { passwordHash, ...doctorResponse } = doctor;
    res.json(doctorResponse);
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== APPOINTMENT ROUTES ====================

app.get('/api/appointments', authenticateToken, (req, res) => {
  try {
    let filteredAppointments = appointments;
    
    // Filter based on user role
    if (req.user.role === 'patient') {
      filteredAppointments = appointments.filter(a => a.patientId === req.user.id);
    } else if (req.user.role === 'doctor') {
      filteredAppointments = appointments.filter(a => a.doctorId === req.user.id);
    }
    
    // Add patient and doctor names
    const appointmentsWithDetails = filteredAppointments.map(appointment => {
      const patient = users.find(u => u.id === appointment.patientId);
      const doctor = doctors.find(d => d.id === appointment.doctorId);
      
      return {
        ...appointment,
        patientName: patient?.name || 'Unknown Patient',
        doctorName: doctor?.name || 'Unknown Doctor',
        doctorSpecialization: doctor?.specialization || ''
      };
    });
    
    res.json(appointmentsWithDetails);
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/appointments', authenticateToken, (req, res) => {
  try {
    const { doctorId, date, time, duration, type, symptoms, notes } = req.body;
    
    // Validation
    if (!doctorId || !date || !time) {
      return res.status(400).json({ 
        success: false, 
        message: 'Doctor ID, date, and time are required' 
      });
    }
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    
    // Check if slot is available
    const existingAppointment = appointments.find(a => 
      a.doctorId === doctorId && 
      a.date === date && 
      a.time === time && 
      a.status !== 'cancelled'
    );
    
    if (existingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot is not available' 
      });
    }
    
    const newAppointment = {
      id: uuidv4(),
      patientId: req.user.id,
      doctorId,
      date,
      time,
      duration: duration || 30,
      type: type || 'consultation',
      status: 'scheduled',
      symptoms: symptoms || '',
      notes: notes || '',
      prescription: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    appointments.push(newAppointment);
    
    // Add patient and doctor details
    const patient = users.find(u => u.id === req.user.id);
    const appointmentWithDetails = {
      ...newAppointment,
      patientName: patient?.name || 'Unknown Patient',
      doctorName: doctor.name,
      doctorSpecialization: doctor.specialization
    };
    
    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully',
      appointment: appointmentWithDetails
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/appointments/:id/status', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;
    
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    const appointment = appointments[appointmentIndex];
    
    // Only the doctor or admin can update appointment status
    if (req.user.role !== 'doctor' && req.user.role !== 'admin' && req.user.id !== appointment.patientId) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // Validate status
    const validStatuses = ['scheduled', 'confirmed', 'completed', 'cancelled', 'no-show', 'declined'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid status' 
      });
    }
    
    appointments[appointmentIndex] = {
      ...appointment,
      status,
      notes: notes || appointment.notes,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Appointment status updated',
      appointment: appointments[appointmentIndex]
    });
  } catch (error) {
    console.error('Update appointment status error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Update appointment details
app.put('/api/appointments/:id', authenticateToken, (req, res) => {
  try {
    const { id } = req.params;
    const { date, time, duration, type, symptoms, notes, status } = req.body;
    
    const appointmentIndex = appointments.findIndex(a => a.id === id);
    if (appointmentIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }
    
    const appointment = appointments[appointmentIndex];
    
    // Only the patient who booked the appointment, the doctor assigned to it, or an admin can update it
    if (req.user.id !== appointment.patientId && 
        req.user.id !== appointment.doctorId && 
        req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    // If changing date/time, check if the new slot is available
    if ((date && date !== appointment.date) || (time && time !== appointment.time)) {
      const existingAppointment = appointments.find(a => 
        a.doctorId === appointment.doctorId && 
        a.date === (date || appointment.date) && 
        a.time === (time || appointment.time) && 
        a.id !== id && 
        a.status !== 'cancelled'
      );
      
      if (existingAppointment) {
        return res.status(400).json({ 
          success: false, 
          message: 'The selected time slot is not available' 
        });
      }
    }
    
    // Update the appointment
    appointments[appointmentIndex] = {
      ...appointment,
      date: date || appointment.date,
      time: time || appointment.time,
      duration: duration || appointment.duration,
      type: type || appointment.type,
      symptoms: symptoms !== undefined ? symptoms : appointment.symptoms,
      notes: notes !== undefined ? notes : appointment.notes,
      status: status || appointment.status,
      updatedAt: new Date().toISOString()
    };
    
    res.json({
      success: true,
      message: 'Appointment updated successfully',
      appointment: appointments[appointmentIndex]
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== BOOKING ROUTES ====================

app.get('/api/bookings/slots/:doctorId/:date', (req, res) => {
  try {
    const { doctorId, date } = req.params;
    
    const doctor = doctors.find(d => d.id === doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    const dayOfWeek = new Date(date).getDay();
    const availability = doctor.availability?.find(a => a.dayOfWeek === dayOfWeek);
    
    if (!availability || !availability.isAvailable) {
      return res.json([]);
    }
    
    // Generate time slots
    const slots = generateTimeSlots(availability.startTime, availability.endTime);
    
    // Mark booked slots
    const bookedSlots = appointments.filter(a => 
      a.doctorId === doctorId && 
      a.date === date && 
      a.status !== 'cancelled'
    ).map(a => a.time);
    
    const availableSlots = slots.map(slot => ({
      ...slot,
      isBooked: bookedSlots.includes(slot.time),
      isAvailable: !bookedSlots.includes(slot.time)
    }));
    
    res.json(availableSlots);
  } catch (error) {
    console.error('Get slots error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== HEALTH TIPS ROUTES ====================

app.get('/api/health-tips', (req, res) => {
  try {
    const { category, featured } = req.query;
    let filteredTips = healthTips;
    
    if (category) {
      filteredTips = filteredTips.filter(tip => 
        tip.category.toLowerCase().includes(category.toLowerCase())
      );
    }
    
    if (featured === 'true') {
      filteredTips = filteredTips.filter(tip => tip.isFeatured === true);
    }
    
    res.json(filteredTips);
  } catch (error) {
    console.error('Get health tips error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/health-tips', authenticateToken, (req, res) => {
  try {
    // Only admins can create health tips
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const { title, content, category, isFeatured } = req.body;
    
    if (!title || !content || !category) {
      return res.status(400).json({ 
        success: false, 
        message: 'Title, content, and category are required' 
      });
    }
    
    const newTip = {
      id: uuidv4(),
      title,
      content,
      category,
      isFeatured: isFeatured || false,
      views: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    healthTips.push(newTip);
    
    res.status(201).json({
      success: true,
      message: 'Health tip created successfully',
      tip: newTip
    });
  } catch (error) {
    console.error('Create health tip error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== ADMIN ROUTES ====================

app.get('/api/admin/stats', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const stats = {
      totalUsers: users.length,
      totalDoctors: doctors.length,
      totalAppointments: appointments.length,
      appointmentsByStatus: {
        scheduled: appointments.filter(a => a.status === 'scheduled').length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length
      },
      recentAppointments: appointments
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(appointment => {
          const patient = users.find(u => u.id === appointment.patientId);
          const doctor = doctors.find(d => d.id === appointment.doctorId);
          return {
            ...appointment,
            patientName: patient?.name || 'Unknown Patient',
            doctorName: doctor?.name || 'Unknown Doctor'
          };
        })
    };
    
    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/admin/users', authenticateToken, (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);
    res.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Get admin users error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== HEALTH CHECK ====================

app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development'
  });
});

// ==================== CHAT ROUTES ====================

app.get('/api/messages/:userId', authenticateToken, (req, res) => {
  try {
    const { userId } = req.params;
    const { with: withUserId } = req.query;
    
    // Check permissions - users can only access their own messages
    if (req.user.id !== userId && req.user.role !== 'admin') {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    let filteredMessages = messages.filter(m => 
      m.senderId === userId || m.receiverId === userId
    );
    
    // If 'with' parameter is provided, filter messages between these two users
    if (withUserId) {
      filteredMessages = filteredMessages.filter(m => 
        (m.senderId === userId && m.receiverId === withUserId) ||
        (m.senderId === withUserId && m.receiverId === userId)
      );
    }
    
    // Sort messages by timestamp
    filteredMessages.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    
    // Add sender and receiver names
    const messagesWithNames = filteredMessages.map(message => {
      const sender = message.senderRole === 'doctor' 
        ? doctors.find(d => d.id === message.senderId)
        : users.find(u => u.id === message.senderId);
      
      const receiver = message.receiverRole === 'doctor'
        ? doctors.find(d => d.id === message.receiverId)
        : users.find(u => u.id === message.receiverId);
      
      return {
        ...message,
        senderName: sender?.name || 'Unknown',
        receiverName: receiver?.name || 'Unknown'
      };
    });
    
    res.json(messagesWithNames);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/messages', authenticateToken, (req, res) => {
  try {
    const { receiverId, content, receiverRole } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ 
        success: false, 
        message: 'Receiver ID and content are required' 
      });
    }
    
    // Verify receiver exists
    const receiverExists = receiverRole === 'doctor'
      ? doctors.some(d => d.id === receiverId)
      : users.some(u => u.id === receiverId);
    
    if (!receiverExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Receiver not found' 
      });
    }
    
    const newMessage = {
      id: uuidv4(),
      senderId: req.user.id,
      senderRole: req.user.role,
      receiverId,
      receiverRole: receiverRole || 'patient',
      content,
      timestamp: new Date().toISOString(),
      isRead: false
    };
    
    messages.push(newMessage);
    
    // Add sender name for response
    const sender = req.user.role === 'doctor'
      ? doctors.find(d => d.id === req.user.id)
      : users.find(u => u.id === req.user.id);
    
    const receiver = receiverRole === 'doctor'
      ? doctors.find(d => d.id === receiverId)
      : users.find(u => u.id === receiverId);
    
    const messageWithNames = {
      ...newMessage,
      senderName: sender?.name || 'Unknown',
      receiverName: receiver?.name || 'Unknown'
    };
    
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: messageWithNames
    });
  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.put('/api/messages/:messageId/read', authenticateToken, (req, res) => {
  try {
    const { messageId } = req.params;
    
    const messageIndex = messages.findIndex(m => m.id === messageId);
    if (messageIndex === -1) {
      return res.status(404).json({ 
        success: false, 
        message: 'Message not found' 
      });
    }
    
    const message = messages[messageIndex];
    
    // Only the receiver can mark a message as read
    if (message.receiverId !== req.user.id) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied' 
      });
    }
    
    messages[messageIndex] = {
      ...message,
      isRead: true
    };
    
    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark message as read error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.get('/api/messages/unread/count', authenticateToken, (req, res) => {
  try {
    const unreadCount = messages.filter(m => 
      m.receiverId === req.user.id && !m.isRead
    ).length;
    
    res.json({
      success: true,
      count: unreadCount
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// ==================== SERVER STARTUP ====================

// Initialize sample data
initializeSampleData();

app.listen(PORT, () => {
  console.log(`🚀 Good Health AI Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🔐 JWT Secret: ${JWT_SECRET.substring(0, 10)}...`);
  console.log(`📝 Sample doctors: ${doctors.length}`);
  console.log(`💡 Sample health tips: ${healthTips.length}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;