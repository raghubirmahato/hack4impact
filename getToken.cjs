const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function getToken() {
  try {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: 'patient1@test.com', password: 'password123' }),
    });

    const result = await response.json();
    if (result.success) {
      console.log('Token:', result.token);
    } else {
      console.error('Login failed:', result.message);
    }
  } catch (error) {
    console.error('Error getting token:', error);
  }
}

getToken();