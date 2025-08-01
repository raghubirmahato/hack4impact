# Good Health AI

A comprehensive healthcare web application built with React, TypeScript, and PostgreSQL. This application provides AI-powered health analysis, doctor consultations, appointment booking, and medical record management.

## 🚀 Features

### Core Features
- **User Registration & Authentication** - Secure user and doctor registration with JWT authentication
- **Doctor Discovery** - Search and filter doctors by specialization, location, and availability
- **Appointment Booking** - Schedule appointments with doctors
- **Live Visual Analysis** - AI-powered image analysis using camera integration
- **Medical Records** - Comprehensive medical history management
- **QR Code Integration** - Quick access to medical information
- **Real-time Notifications** - Stay updated with appointment reminders and health tips

### Advanced Features
- **Camera Integration** - Profile picture capture and live visual analysis
- **AI Health Analysis** - Powered by Google's Gemini AI
- **Advanced Search** - Intelligent doctor and medical record search
- **Analytics Dashboard** - Comprehensive health and usage analytics
- **Data Management** - Backup, restore, and synchronization capabilities
- **Responsive Design** - Mobile-first design with modern UI/UX

## 🛠️ Tech Stack

### Frontend
- **React 19** - Modern React with hooks and context
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **Lucide React** - Beautiful icons
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation

### Backend & Database
- **PostgreSQL** - Robust relational database
- **Node.js** - JavaScript runtime
- **JWT** - Secure authentication
- **bcryptjs** - Password hashing
- **UUID** - Unique identifier generation

### AI & Services
- **Google Gemini AI** - Advanced AI capabilities
- **Camera API** - Browser camera integration
- **Geolocation API** - Location services

## 📋 Prerequisites

Before running this application, make sure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **PostgreSQL** (v12 or higher)
- **Git**

## 🚀 Quick Start

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/good-health-ai.git
cd good-health-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the example environment file and configure your settings:
```bash
cp .env.example .env
```

Edit the `.env` file with your configuration:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=good_health_ai
DB_USER=your_username
DB_PASSWORD=your_password

# Application Configuration
NODE_ENV=development
PORT=5173

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=7d

# API Keys (Optional)
GEMINI_API_KEY=your-gemini-api-key
FIREBASE_API_KEY=your-firebase-api-key

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Security Configuration
BCRYPT_ROUNDS=12
SESSION_SECRET=your-session-secret-here
```

### 4. Database Setup

#### Option A: Local PostgreSQL
1. Install PostgreSQL on your system
2. Create a database named `good_health_ai`
3. Update the database credentials in your `.env` file
4. Initialize the database:
```bash
npm run db:init
```

#### Option B: Docker PostgreSQL (Recommended)
```bash
# Run PostgreSQL in Docker
docker run --name good-health-postgres \
  -e POSTGRES_DB=good_health_ai \
  -e POSTGRES_USER=your_username \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  -d postgres:15

# Initialize the database
npm run db:init
```

### 5. Start the Development Server
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
good-health-ai/
├── public/                 # Static assets
├── src/
│   ├── components/         # React components
│   │   ├── ui/            # Reusable UI components
│   │   ├── forms/         # Form components
│   │   └── layout/        # Layout components
│   ├── pages/             # Page components
│   ├── services/          # API and business logic
│   ├── hooks/             # Custom React hooks
│   ├── utils/             # Utility functions
│   ├── types/             # TypeScript type definitions
│   └── styles/            # CSS and styling
├── config/                # Configuration files
├── scripts/               # Build and utility scripts
├── .env.example          # Environment variables template
├── .env                  # Environment variables (create this)
├── package.json          # Dependencies and scripts
└── README.md            # This file
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run db:init` - Initialize database with tables and sample data
- `npm run db:reset` - Reset database (drops and recreates all tables)

## 🌟 Key Features Explained

### Authentication System
- Secure JWT-based authentication
- Password hashing with bcrypt
- Role-based access (Users and Doctors)
- Session management

### Doctor Management
- Comprehensive doctor profiles
- Specialization-based filtering
- Availability scheduling
- Rating and review system

### Appointment System
- Real-time appointment booking
- Calendar integration
- Automated reminders
- Status tracking

### AI Integration
- Visual health analysis using camera
- Symptom analysis and recommendations
- Medical image processing
- Natural language health queries

### Camera Features
- Profile picture capture during registration
- Live visual analysis for health assessment
- Image capture with flash effects
- Camera switching (front/rear)

## 🔒 Security Features

- **Password Security** - bcrypt hashing with configurable rounds
- **JWT Authentication** - Secure token-based authentication
- **Input Validation** - Comprehensive data validation with Zod
- **SQL Injection Prevention** - Parameterized queries
- **XSS Protection** - Input sanitization
- **CORS Configuration** - Proper cross-origin resource sharing

## 🚀 Deployment

### Production Build
```bash
npm run build
```

### Environment Variables for Production
Make sure to set these environment variables in your production environment:
- `NODE_ENV=production`
- `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`
- `JWT_SECRET` (use a strong, unique secret)
- `GEMINI_API_KEY` (for AI features)

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5173
CMD ["npm", "run", "preview"]
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/yourusername/good-health-ai/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced AI capabilities
- **PostgreSQL** for robust database management
- **React Community** for excellent documentation and tools
- **Open Source Contributors** for the amazing libraries used in this project

---

**Made with ❤️ for better healthcare accessibility**
