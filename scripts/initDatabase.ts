const { initializeDatabase, testConnection } = require('../config/database');
const { postgresqlDatabaseService } = require('../services/postgresqlDatabaseService');

async function initializeApp() {
  try {
    console.log('🔄 Testing database connection...');
    await testConnection();
    console.log('✅ Database connection successful!');

    console.log('🔄 Initializing database tables...');
    await initializeDatabase();
    console.log('✅ Database tables initialized!');

    console.log('🔄 Seeding sample data...');
    await postgresqlDatabaseService.seedSampleData();
    console.log('✅ Sample data seeded!');

    console.log('🎉 Database initialization complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initializeApp();