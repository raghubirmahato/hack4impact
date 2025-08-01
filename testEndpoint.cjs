const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const testEndpoint = async () => {
  try {
    const response = await fetch('http://localhost:3001/api/messages/unread/count', {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjQxMjNkMmFkLTgwMjgtNDQxNS04M2YxLTM1ZjRiMjkzMzQzNiIsImVtYWlsIjoicGF0aWVudDFAdGVzdC5jb20iLCJyb2xlIjoicGF0aWVudCIsImlhdCI6MTc1NDAyOTk0OCwiZXhwIjoxNzU0MTE2MzQ4fQ.7PM0AkqJbr0XQQWJbHMGc_CVutO1XbAVhaxP7uZCy7k',
      },
    });

    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
};

testEndpoint();