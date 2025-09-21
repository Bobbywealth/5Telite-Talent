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

    req.on('error', (error) => {
      console.error(`Request error for ${method} ${path}:`, error.message);
      resolve({ status: 500, data: { error: error.message } });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runFullTest() {
  console.log('🎯 5T ELITE TALENT PLATFORM - FINAL TEST RESULTS');
  console.log('=================================================\n');
  
  let adminUser, bobbyUser;
  let testResults = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  function logTest(testName, passed, details = '') {
    testResults.total++;
    if (passed) {
      testResults.passed++;
      console.log(`✅ ${testName}`);
    } else {
      testResults.failed++;
      console.log(`❌ ${testName} ${details}`);
    }
  }
  
  try {
    // === AUTHENTICATION ===
    console.log('🔐 AUTHENTICATION TESTS');
    console.log('-----------------------');
    
    // Admin Login
    const adminLogin = await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    logTest('Admin Login', adminLogin.status === 200);
    if (adminLogin.status === 200) {
      adminUser = adminLogin.data;
      console.log(`   → Admin: ${adminUser.firstName} ${adminUser.lastName}`);
    }
    
    // Admin Dashboard
    const adminStats = await makeRequest('GET', '/api/admin/dashboard-stats');
    logTest('Admin Dashboard Stats', adminStats.status === 200);
    if (adminStats.status === 200) {
      console.log(`   → Stats: ${JSON.stringify(adminStats.data, null, 2)}`);
    }
    
    // Logout and test Bobby
    await makeRequest('POST', '/api/logout');
    cookies = '';
    
    const bobbyLogin = await makeRequest('POST', '/api/login', {
      email: 'bobby@5t.com',
      password: 'bobby123'
    });
    logTest('Bobby (Talent) Login', bobbyLogin.status === 200);
    if (bobbyLogin.status === 200) {
      bobbyUser = bobbyLogin.data;
      console.log(`   → Bobby: ${bobbyUser.firstName} ${bobbyUser.lastName}`);
    }
    
    // === TALENT FUNCTIONALITY ===
    console.log('\n👤 TALENT FUNCTIONALITY');
    console.log('------------------------');
    
    if (bobbyUser) {
      const bobbyProfile = await makeRequest('GET', `/api/talents/${bobbyUser.id}`);
      logTest('Bobby Profile Access', bobbyProfile.status === 200, 
        bobbyProfile.status !== 200 ? `(${bobbyProfile.status}: ${bobbyProfile.data.message || 'Unknown error'})` : '');
      
      if (bobbyProfile.status !== 200) {
        // Try creating profile
        const createProfile = await makeRequest('POST', '/api/talents', {
          stageName: 'Bobby Craig',
          bio: 'Professional talent ready for any project',
          categories: ['actor', 'model'],
          skills: ['acting', 'modeling', 'voice over'],
          location: 'New York, NY',
          unionStatus: 'Non-Union',
          hourlyRate: 150,
          height: "6'0\"",
          hairColor: 'Brown',
          eyeColor: 'Brown'
        });
        logTest('Create Bobby Profile', createProfile.status === 201, 
          createProfile.status !== 201 ? `(${createProfile.status}: ${createProfile.data.message || 'Unknown error'})` : '');
      }
      
      // Test data access as Bobby
      const bobbyBookings = await makeRequest('GET', '/api/bookings');
      logTest('Bobby Bookings Access', bobbyBookings.status === 200);
      
      const bobbyContracts = await makeRequest('GET', '/api/contracts');
      logTest('Bobby Contracts Access', bobbyContracts.status === 200);
      
      const bobbyTasks = await makeRequest('GET', '/api/tasks');
      logTest('Bobby Tasks Access', bobbyTasks.status === 200);
      
      const bobbyNotifications = await makeRequest('GET', '/api/notifications-new');
      logTest('Bobby Notifications', bobbyNotifications.status === 200, 
        bobbyNotifications.status !== 200 ? `(${bobbyNotifications.status})` : '');
    }
    
    // === ADMIN FUNCTIONALITY ===
    console.log('\n👑 ADMIN FUNCTIONALITY');
    console.log('----------------------');
    
    // Switch back to admin
    await makeRequest('POST', '/api/logout');
    cookies = '';
    await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    
    const allTalents = await makeRequest('GET', '/api/talents');
    logTest('Admin - View All Talents', allTalents.status === 200);
    
    const allBookings = await makeRequest('GET', '/api/bookings');
    logTest('Admin - View All Bookings', allBookings.status === 200);
    
    const allContracts = await makeRequest('GET', '/api/contracts');
    logTest('Admin - View All Contracts', allContracts.status === 200);
    
    const allTasks = await makeRequest('GET', '/api/tasks');
    logTest('Admin - View All Tasks', allTasks.status === 200);
    
    const adminNotifications = await makeRequest('GET', '/api/notifications-new');
    logTest('Admin Notifications', adminNotifications.status === 200);
    
    // === WORKFLOW TESTS ===
    console.log('\n➕ WORKFLOW CREATION');
    console.log('--------------------');
    
    // Create test booking
    const newBooking = await makeRequest('POST', '/api/bookings', {
      title: 'Final Test - Commercial Shoot',
      notes: 'Automated test booking for platform verification',
      startDate: '2025-10-25T10:00:00Z',
      endDate: '2025-10-25T18:00:00Z',
      location: 'Test Studio NYC',
      rate: '1000.00',
      clientId: adminUser?.id,
      createdBy: adminUser?.id
    });
    logTest('Create New Booking', newBooking.status === 200 || newBooking.status === 201, 
      (newBooking.status !== 200 && newBooking.status !== 201) ? `(${newBooking.status}: ${newBooking.data.message || 'Unknown error'})` : '');
    
    // Create test task
    const newTask = await makeRequest('POST', '/api/tasks', {
      title: 'Platform Test - Final Check',
      description: 'Final platform verification task',
      scope: 'general',
      assigneeId: bobbyUser?.id,
      createdBy: adminUser?.id
    });
    logTest('Create New Task', newTask.status === 201, 
      newTask.status !== 201 ? `(${newTask.status}: ${newTask.data.message || 'Unknown error'})` : '');
    
    // === FINAL SUMMARY ===
    console.log('\n🎯 FINAL RESULTS');
    console.log('================');
    console.log(`✅ PASSED: ${testResults.passed}/${testResults.total} tests`);
    console.log(`❌ FAILED: ${testResults.failed}/${testResults.total} tests`);
    console.log(`📊 SUCCESS RATE: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🚀 PLATFORM STATUS: READY FOR CLIENT!');
      console.log('=====================================');
      console.log('🎉 ALL SYSTEMS OPERATIONAL! 🎉');
    } else if (testResults.passed / testResults.total >= 0.8) {
      console.log('\n✨ PLATFORM STATUS: MOSTLY READY');
      console.log('=================================');
      console.log('Minor issues to address, but core functionality works!');
    } else {
      console.log('\n⚠️  PLATFORM STATUS: NEEDS WORK');
      console.log('===============================');
      console.log('Several critical issues need attention.');
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
  }
}

runFullTest();
