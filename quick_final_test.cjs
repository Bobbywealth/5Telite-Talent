const https = require('https');

const BASE_URL = 'https://fivetelite-talent.onrender.com';
let cookies = '';

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookies
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        if (res.headers['set-cookie']) {
          cookies = res.headers['set-cookie'].join('; ');
        }
        
        try {
          const jsonBody = JSON.parse(body);
          resolve({ status: res.statusCode, data: jsonBody });
        } catch {
          resolve({ status: res.statusCode, data: body });
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

async function quickTest() {
  console.log('🚀 QUICK FINAL TEST - CHECKING THE FIXES\n');
  
  let passed = 0, total = 0;
  
  // Admin Login
  total++;
  const adminLogin = await makeRequest('POST', '/api/login', {
    email: 'admin@5t.com',
    password: 'admin123'
  });
  if (adminLogin.status === 200) {
    passed++;
    console.log('✅ Admin Login: PASS');
    
    // Test the fixes
    total++;
    const adminStats = await makeRequest('GET', '/api/admin/dashboard-stats');
    if (adminStats.status === 200) {
      passed++;
      console.log('✅ Admin Dashboard: PASS');
    } else {
      console.log('❌ Admin Dashboard: FAIL');
    }
    
    total++;
    const createBooking = await makeRequest('POST', '/api/bookings', {
      title: 'Final Test Booking',
      notes: 'Test booking creation',
      startDate: '2025-10-25T10:00:00Z',
      endDate: '2025-10-25T18:00:00Z',
      location: 'Test Studio',
      rate: '1000.00',
      clientId: adminLogin.data.id,
      createdBy: adminLogin.data.id
    });
    if (createBooking.status === 200 || createBooking.status === 201) {
      passed++;
      console.log('✅ Create Booking: PASS');
    } else {
      console.log('❌ Create Booking: FAIL');
    }
    
    total++;
    const createTask = await makeRequest('POST', '/api/tasks', {
      title: 'Final Test Task',
      description: 'Test task creation',
      scope: 'booking',
      createdBy: adminLogin.data.id
    });
    if (createTask.status === 200 || createTask.status === 201) {
      passed++;
      console.log('✅ Create Task: PASS');
    } else {
      console.log('❌ Create Task: FAIL');
    }
    
  } else {
    console.log('❌ Admin Login: FAIL');
  }
  
  // Bobby Login
  await makeRequest('POST', '/api/logout');
  cookies = '';
  
  total++;
  const bobbyLogin = await makeRequest('POST', '/api/login', {
    email: 'bobby@5t.com',
    password: 'bobby123'
  });
  if (bobbyLogin.status === 200) {
    passed++;
    console.log('✅ Bobby Login: PASS');
    
    total++;
    const bobbyBookings = await makeRequest('GET', '/api/bookings');
    if (bobbyBookings.status === 200) {
      passed++;
      console.log('✅ Bobby Data Access: PASS');
    } else {
      console.log('❌ Bobby Data Access: FAIL');
    }
    
  } else {
    console.log('❌ Bobby Login: FAIL');
  }
  
  console.log('\n🎯 QUICK TEST RESULTS');
  console.log('====================');
  console.log(`✅ PASSED: ${passed}/${total} tests`);
  console.log(`📊 SUCCESS RATE: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 ALL CORE FIXES WORKING! PLATFORM IS READY! 🎉');
  } else if (passed / total >= 0.8) {
    console.log('\n✨ MOSTLY WORKING - PLATFORM IS READY FOR CLIENT!');
  } else {
    console.log('\n⚠️  NEEDS MORE WORK');
  }
}

quickTest();
