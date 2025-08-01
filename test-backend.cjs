const { default: fetch } = require('node-fetch');

async function testBackend() {
  try {
    console.log('Testing backend endpoints...\n');
    
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch('http://localhost:3001/api/health');
    const healthData = await healthResponse.json();
    console.log('Health:', healthData);
    
    // Test doctors endpoint
    console.log('\n2. Testing doctors endpoint...');
    const doctorsResponse = await fetch('http://localhost:3001/api/doctors');
    const doctorsData = await doctorsResponse.json();
    console.log('Doctors:', doctorsData);
    
    // Test health tips endpoint
    console.log('\n3. Testing health tips endpoint...');
    const tipsResponse = await fetch('http://localhost:3001/api/health-tips');
    if (tipsResponse.ok) {
      const tipsData = await tipsResponse.json();
      console.log('Health Tips:', tipsData);
    } else {
      console.log('Health Tips Error:', tipsResponse.status, await tipsResponse.text());
    }
    
    // Test registration
    console.log('\n4. Testing user registration...');
    const registerResponse = await fetch('http://localhost:3001/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Test User',
        email: `test${Date.now()}@example.com`,
        password: 'password123',
        phone: '+1-555-0123'
      })
    });
    
    if (registerResponse.ok) {
      const registerData = await registerResponse.json();
      console.log('Registration successful:', registerData.success);
      console.log('User ID:', registerData.user?.id);
    } else {
      console.log('Registration Error:', registerResponse.status, await registerResponse.text());
    }
    
  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testBackend();