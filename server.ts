import express from 'express';
import cors from 'cors';
import { AuthService } from './services/authService';
import { postgresqlDatabaseService } from './services/postgresqlDatabaseService';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize services
const authService = new AuthService();

// Auth Routes
app.post('/api/auth/register', async (req, res) => {
  try {
    const { userData, password } = req.body;
    const result = await authService.registerUser(userData, password);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/register-doctor', async (req, res) => {
  try {
    const { doctorData, password } = req.body;
    const result = await authService.registerDoctor(doctorData, password);
    
    if (result.success) {
      res.status(201).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    console.error('Doctor registration error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginUser(email, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

app.post('/api/auth/login-doctor', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await authService.loginDoctor(email, password);
    
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(401).json(result);
    }
  } catch (error) {
    console.error('Doctor login error:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

// Database Routes
app.get('/api/doctors', async (req, res) => {
  try {
    const doctors = await postgresqlDatabaseService.getAllDoctors();
    res.json(doctors);
  } catch (error) {
    console.error('Error fetching doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/users', async (req, res) => {
  try {
    const users = await postgresqlDatabaseService.getAllUsers();
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/users', async (req, res) => {
  try {
    const { userData, password } = req.body;
    const user = await postgresqlDatabaseService.createUser(userData, password);
    res.status(201).json(user);
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/doctors', async (req, res) => {
  try {
    const { doctorData, password } = req.body;
    const doctor = await postgresqlDatabaseService.createDoctor(doctorData, password);
    res.status(201).json(doctor);
  } catch (error) {
    console.error('Error creating doctor:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Good Health AI Backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Good Health AI Backend server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
});

export default app;