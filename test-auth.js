// Test script for authentication endpoints
// Run with: node test-auth.js

const testRegistration = async () => {
  try {
    console.log('Testing User Registration...');
    
    const response = await fetch('http://localhost:5000/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        role: 'user',
        password: 'testpassword123',
        name: 'John Doe',
        gmail: 'john.doe@example.com',
        age: 25,
        address: '123 Main St, City',
        phone: '+1234567890',
        gender: 'male',
        dob: '1998-01-15'
      }),
    });

    const data = await response.json();
    console.log('Registration Response:', data);
    
    if (data.success) {
      console.log('✅ Registration successful!');
      return data.user;
    } else {
      console.log('❌ Registration failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Registration error:', error.message);
    return null;
  }
};

const testLogin = async () => {
  try {
    console.log('\nTesting User Login...');
    
    const response = await fetch('http://localhost:5000/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'john.doe@example.com',
        password: 'testpassword123',
        role: 'user'
      }),
    });

    const data = await response.json();
    console.log('Login Response:', data);
    
    if (data.success) {
      console.log('✅ Login successful!');
      return data;
    } else {
      console.log('❌ Login failed:', data.error);
      return null;
    }
  } catch (error) {
    console.error('❌ Login error:', error.message);
    return null;
  }
};

const runTests = async () => {
  console.log('🚀 Starting Authentication Tests...\n');
  
  // Test registration
  const user = await testRegistration();
  
  if (user) {
    // Test login
    await testLogin();
  }
  
  console.log('\n✨ Tests completed!');
};

// Only run if this script is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests();
}
