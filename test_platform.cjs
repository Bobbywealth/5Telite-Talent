const https = require('https');
const querystring = require('querystring');

const BASE_URL = 'https://fivetelite-talent.onrender.com';
let cookies = '';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies,
        ...headers
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        // Store cookies
        if (res.headers['set-cookie']) {
          cookies = res.headers['set-cookie'].join('; ');
        }
        
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🚀 STARTING COMPREHENSIVE PLATFORM TESTS\n');
  
  // TEST 1: Authentication System
  console.log('=== PHASE 1: AUTHENTICATION TESTS ===');
  
  try {
    // Test Admin Login
    console.log('1.1 Testing Admin Login...');
    const adminLogin = await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    console.log(`✅ Admin Login: ${adminLogin.status === 200 ? 'PASS' : 'FAIL'} (${adminLogin.status})`);
    if (adminLogin.status !== 200) {
      console.log('   Error:', adminLogin.data);
      return;
    }
    
    // Test Admin Dashboard Access
    console.log('1.2 Testing Admin Dashboard Access...');
    const adminDash = await makeRequest('GET', '/api/admin/stats');
    console.log(`✅ Admin Dashboard: ${adminDash.status === 200 ? 'PASS' : 'FAIL'} (${adminDash.status})`);
    
    // Logout
    await makeRequest('POST', '/api/logout');
    cookies = '';
    
    // Test Bobby Login
    console.log('1.3 Testing Bobby (Talent) Login...');
    const bobbyLogin = await makeRequest('POST', '/api/login', {
      email: 'bobby@5t.com',
      password: 'bobby123'
    });
    console.log(`✅ Bobby Login: ${bobbyLogin.status === 200 ? 'PASS' : 'FAIL'} (${bobbyLogin.status})`);
    
    if (bobbyLogin.status === 200) {
      // Test Bobby's Profile Access
      console.log('1.4 Testing Bobby Profile Access...');
      const bobbyProfile = await makeRequest('GET', `/api/talents/${bobbyLogin.data.user.id}`);
      console.log(`✅ Bobby Profile: ${bobbyProfile.status === 200 ? 'PASS' : 'FAIL'} (${bobbyProfile.status})`);
      if (bobbyProfile.status !== 200) {
        console.log('   Error:', bobbyProfile.data);
        
        // Try to create Bobby's profile
        console.log('1.5 Creating Bobby Profile...');
        const createProfile = await makeRequest('POST', '/api/talents', {
          stageName: 'Bobby Craig',
          bio: 'Test talent profile',
          categories: ['actor'],
          skills: ['acting'],
          location: 'New York, NY',
          unionStatus: 'non-union',
          hourlyRate: 100,
          height: "6'0\"",
          hairColor: 'Brown',
          eyeColor: 'Brown'
        });
        console.log(`✅ Create Profile: ${createProfile.status === 201 ? 'PASS' : 'FAIL'} (${createProfile.status})`);
      }
    }
    
    // Logout Bobby
    await makeRequest('POST', '/api/logout');
    cookies = '';
    
    console.log('\n=== PHASE 2: DATA INTEGRITY TESTS ===');
    
    // Login as admin for data tests
    await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    
    // Test data endpoints
    console.log('2.1 Testing Talents Endpoint...');
    const talents = await makeRequest('GET', '/api/talents');
    console.log(`✅ Talents List: ${talents.status === 200 ? 'PASS' : 'FAIL'} (${talents.status})`);
    
    console.log('2.2 Testing Bookings Endpoint...');
    const bookings = await makeRequest('GET', '/api/bookings');
    console.log(`✅ Bookings List: ${bookings.status === 200 ? 'PASS' : 'FAIL'} (${bookings.status})`);
    
    console.log('2.3 Testing Contracts Endpoint...');
    const contracts = await makeRequest('GET', '/api/contracts');
    console.log(`✅ Contracts List: ${contracts.status === 200 ? 'PASS' : 'FAIL'} (${contracts.status})`);
    
    console.log('2.4 Testing Tasks Endpoint...');
    const tasks = await makeRequest('GET', '/api/tasks');
    console.log(`✅ Tasks List: ${tasks.status === 200 ? 'PASS' : 'FAIL'} (${tasks.status})`);
    
    console.log('2.5 Testing Notifications Endpoint...');
    const notifications = await makeRequest('GET', '/api/notifications-new');
    console.log(`✅ Notifications: ${notifications.status === 200 ? 'PASS' : 'FAIL'} (${notifications.status})`);
    
    console.log('\n=== PHASE 3: WORKFLOW TESTS ===');
    
    // Test creating a booking
    console.log('3.1 Testing Booking Creation...');
    const newBooking = await makeRequest('POST', '/api/bookings', {
      title: 'Test Shoot - Automated',
      description: 'Automated test booking',
      date: '2025-10-15',
      location: 'Test Studio',
      duration: 4,
      rate: 500,
      requirements: 'Test requirements',
      clientId: adminLogin.data.user.id
    });
    console.log(`✅ Create Booking: ${newBooking.status === 201 ? 'PASS' : 'FAIL'} (${newBooking.status})`);
    
    if (newBooking.status === 201) {
      console.log('3.2 Testing Task Creation...');
      const newTask = await makeRequest('POST', '/api/tasks', {
        title: 'Test Task - Automated',
        description: 'Automated test task',
        priority: 'medium',
        scope: 'general',
        assigneeId: bobbyLogin?.data?.user?.id || null
      });
      console.log(`✅ Create Task: ${newTask.status === 201 ? 'PASS' : 'FAIL'} (${newTask.status})`);
    }
    
    console.log('\n🎉 TESTING COMPLETE!');
    console.log('📊 Check the results above for any FAIL status');
    
  } catch (error) {
    console.error('❌ Test Error:', error.message);
  }
}

runTests();
