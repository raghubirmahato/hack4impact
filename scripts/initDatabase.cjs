const { Pool } = require('pg');
require('dotenv').config();

// Database configuration
const dbConfig = {
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'goodhealth_ai',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

// Create connection pool
const pool = new Pool(dbConfig);

async function testConnection() {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    return false;
  }
}

async function initializeDatabase() {
  try {
    const client = await pool.connect();
    
    console.log('🏗️ Creating database tables...');
    
    // Create tables if they don't exist
    await client.query(`
      -- Users table
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        date_of_birth DATE,
        gender VARCHAR(20),
        address TEXT,
        profile_picture TEXT,
        role VARCHAR(20) DEFAULT 'patient',
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Doctors table
      CREATE TABLE IF NOT EXISTS doctors (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20) NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        specialization VARCHAR(100) NOT NULL,
        years_of_experience INTEGER NOT NULL,
        qualification VARCHAR(255) NOT NULL,
        license_number VARCHAR(100) UNIQUE NOT NULL,
        hospital_affiliation VARCHAR(255),
        consultation_fee DECIMAL(10,2) NOT NULL,
        bio TEXT,
        profile_picture TEXT,
        rating DECIMAL(3,2) DEFAULT 0.00,
        total_reviews INTEGER DEFAULT 0,
        is_verified BOOLEAN DEFAULT false,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Doctor availability table
      CREATE TABLE IF NOT EXISTS doctor_availability (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_available BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Appointments table
      CREATE TABLE IF NOT EXISTS appointments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_date DATE NOT NULL,
        appointment_time TIME NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'cancelled', 'rescheduled')),
        reason TEXT,
        notes TEXT,
        qr_code TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Medical records table
      CREATE TABLE IF NOT EXISTS medical_records (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        patient_id UUID REFERENCES users(id) ON DELETE CASCADE,
        doctor_id UUID REFERENCES doctors(id) ON DELETE CASCADE,
        appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
        diagnosis TEXT,
        symptoms TEXT,
        treatment TEXT,
        medications JSONB,
        lab_results JSONB,
        notes TEXT,
        record_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Health tips table
      CREATE TABLE IF NOT EXISTS health_tips (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category VARCHAR(100) NOT NULL,
        author_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
        is_featured BOOLEAN DEFAULT false,
        views INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -- Create indexes for better performance
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
      CREATE INDEX IF NOT EXISTS idx_doctors_specialization ON doctors(specialization);
      CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
      CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
      CREATE INDEX IF NOT EXISTS idx_medical_records_patient_id ON medical_records(patient_id);
      CREATE INDEX IF NOT EXISTS idx_doctor_availability_doctor_id ON doctor_availability(doctor_id);

      -- Create updated_at trigger function
      CREATE OR REPLACE FUNCTION update_updated_at_column()
      RETURNS TRIGGER AS $$
      BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
      END;
      $$ language 'plpgsql';

      -- Create triggers for updated_at
      DROP TRIGGER IF EXISTS update_users_updated_at ON users;
      CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_doctors_updated_at ON doctors;
      CREATE TRIGGER update_doctors_updated_at BEFORE UPDATE ON doctors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_appointments_updated_at ON appointments;
      CREATE TRIGGER update_appointments_updated_at BEFORE UPDATE ON appointments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_medical_records_updated_at ON medical_records;
      CREATE TRIGGER update_medical_records_updated_at BEFORE UPDATE ON medical_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

      DROP TRIGGER IF EXISTS update_health_tips_updated_at ON health_tips;
      CREATE TRIGGER update_health_tips_updated_at BEFORE UPDATE ON health_tips FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    `);

    client.release();
    console.log('✅ Database tables created successfully');
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    throw error;
  }
}

async function seedSampleData() {
  try {
    const client = await pool.connect();
    
    // Check if data already exists
    const userCount = await client.query('SELECT COUNT(*) FROM users');
    if (parseInt(userCount.rows[0].count) > 0) {
      console.log('Sample data already exists, skipping seed...');
      client.release();
      return;
    }

    console.log('🌱 Seeding sample data...');

    // Create sample health tips
    await client.query(`
      INSERT INTO health_tips (title, content, category, is_featured, views) VALUES
      ('Stay Hydrated for Better Health', 'Drinking adequate water is essential for maintaining good health. Aim for 8-10 glasses of water daily to keep your body properly hydrated.', 'General Health', true, 1250),
      ('The Importance of Regular Exercise', 'Regular physical activity helps maintain a healthy weight, reduces the risk of chronic diseases, and improves mental health.', 'Fitness', false, 890),
      ('Heart-Healthy Diet Tips', 'Include plenty of fruits, vegetables, whole grains, and lean proteins in your diet. Limit saturated fats, sodium, and added sugars.', 'Nutrition', true, 1456)
    `);

    client.release();
    console.log('✅ Sample data seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
    throw error;
  }
}

async function initializeApp() {
  try {
    console.log('🚀 Starting database initialization...');
    
    // Test database connection
    console.log('📡 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your database configuration.');
      console.log('💡 Make sure PostgreSQL is running and the database "goodhealth_ai" exists.');
      console.log('💡 You can create the database with: createdb goodhealth_ai');
      process.exit(1);
    }
    
    // Initialize database tables
    await initializeDatabase();
    
    // Seed sample data
    await seedSampleData();
    
    console.log('✅ Database initialization completed successfully!');
    console.log('🎉 Your Good Health AI application is ready to use!');
    
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  } finally {
    // Close database connection
    await pool.end();
    process.exit(0);
  }
}

// Run the initialization
initializeApp();