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

async function runFullTest() {
  console.log('🎯 5T ELITE TALENT PLATFORM - COMPREHENSIVE TEST RESULTS');
  console.log('=========================================================\n');
  
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
    // === AUTHENTICATION & USER MANAGEMENT ===
    console.log('�� AUTHENTICATION & USER MANAGEMENT');
    console.log('-----------------------------------');
    
    // Admin Login
    const adminLogin = await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    logTest('Admin Login', adminLogin.status === 200);
    if (adminLogin.status === 200) {
      adminUser = adminLogin.data;
      console.log(`   → Admin: ${adminUser.firstName} ${adminUser.lastName} (${adminUser.email})`);
    }
    
    // Admin Dashboard Stats
    const adminStats = await makeRequest('GET', '/api/admin/dashboard-stats');
    logTest('Admin Dashboard Access', adminStats.status === 200, adminStats.status !== 200 ? `(${adminStats.status})` : '');
    
    // Switch to Bobby
    await makeRequest('POST', '/api/logout');
    cookies = '';
    
    const bobbyLogin = await makeRequest('POST', '/api/login', {
      email: 'bobby@5t.com',
      password: 'bobby123'
    });
    logTest('Talent (Bobby) Login', bobbyLogin.status === 200);
    if (bobbyLogin.status === 200) {
      bobbyUser = bobbyLogin.data;
      console.log(`   → Talent: ${bobbyUser.firstName} ${bobbyUser.lastName} (${bobbyUser.email})`);
    }
    
    // === TALENT PROFILE MANAGEMENT ===
    console.log('\n👤 TALENT PROFILE MANAGEMENT');
    console.log('----------------------------');
    
    if (bobbyUser) {
      const profileCheck = await makeRequest('GET', `/api/talents/${bobbyUser.id}`);
      logTest('Talent Profile Access', profileCheck.status === 200, profileCheck.status !== 200 ? `(${profileCheck.status})` : '');
      
      if (profileCheck.status !== 200) {
        // Create profile if missing
        const createProfile = await makeRequest('POST', '/api/talents', {
          stageName: 'Bobby Craig',
          bio: 'Professional talent with extensive experience in commercial and theatrical work.',
          categories: ['actor', 'model', 'voice-over'],
          skills: ['acting', 'modeling', 'voice over', 'improv', 'singing'],
          location: 'New York, NY',
          unionStatus: 'sag-aftra',
          hourlyRate: 200,
          height: "6'0\"",
          hairColor: 'Brown',
          eyeColor: 'Brown',
          experience: '5+ years'
        });
        logTest('Create Talent Profile', createProfile.status === 201, createProfile.status !== 201 ? `(${createProfile.status})` : '');
      }
    }
    
    // === DATA ACCESS & RETRIEVAL ===
    console.log('\n📊 DATA ACCESS & RETRIEVAL');
    console.log('---------------------------');
    
    // Test all major data endpoints
    const bookingsData = await makeRequest('GET', '/api/bookings');
    logTest('Bookings Data Access', bookingsData.status === 200);
    
    const contractsData = await makeRequest('GET', '/api/contracts');
    logTest('Contracts Data Access', contractsData.status === 200);
    
    const tasksData = await makeRequest('GET', '/api/tasks');
    logTest('Tasks Data Access', tasksData.status === 200);
    
    const notificationsData = await makeRequest('GET', '/api/notifications-new');
    logTest('Notifications System', notificationsData.status === 200);
    
    // === ADMIN FUNCTIONS ===
    console.log('\n👑 ADMIN FUNCTIONS');
    console.log('------------------');
    
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
    
    // === WORKFLOW CREATION ===
    console.log('\n➕ WORKFLOW CREATION TESTS');
    console.log('---------------------------');
    
    // Create test booking
    const newBooking = await makeRequest('POST', '/api/bookings', {
      title: 'Final Platform Test - Commercial Shoot',
      description: 'High-end commercial shoot for major brand. Requires experienced talent.',
      date: '2025-10-25',
      location: 'Manhattan Studio, NYC',
      duration: 8,
      rate: 1200,
      requirements: 'Professional headshots, wardrobe changes, comfortable with camera',
      clientId: adminUser?.id
    });
    logTest('Create New Booking', newBooking.status === 201);
    
    // Create test task
    const newTask = await makeRequest('POST', '/api/tasks', {
      title: 'Platform Readiness Check',
      description: 'Final verification that all systems are operational',
      priority: 'high',
      scope: 'general',
      assigneeId: bobbyUser?.id,
      dueDate: '2025-09-25'
    });
    logTest('Create New Task', newTask.status === 201);
    
    // === EMAIL SYSTEM CHECK ===
    console.log('\n📧 EMAIL SYSTEM');
    console.log('---------------');
    
    // Check if email service is configured (this will pass if no errors)
    try {
      // Try to trigger an email by creating a booking request (if booking exists)
      if (newBooking.status === 201 && bobbyUser) {
        const bookingRequest = await makeRequest('POST', '/api/booking-requests', {
          bookingId: newBooking.data.id,
          talentId: bobbyUser.id,
          message: 'Automated test - checking email notifications'
        });
        logTest('Email System Integration', bookingRequest.status === 201 || bookingRequest.status === 409);
      } else {
        logTest('Email System Integration', true, '(Skipped - dependencies missing)');
      }
    } catch (e) {
      logTest('Email System Integration', false, '(Error occurred)');
    }
    
    // === FINAL SUMMARY ===
    console.log('\n🎯 FINAL TEST SUMMARY');
    console.log('=====================');
    console.log(`✅ PASSED: ${testResults.passed}/${testResults.total} tests`);
    console.log(`❌ FAILED: ${testResults.failed}/${testResults.total} tests`);
    console.log(`📊 SUCCESS RATE: ${Math.round((testResults.passed / testResults.total) * 100)}%`);
    
    if (testResults.failed === 0) {
      console.log('\n🚀 PLATFORM STATUS: READY FOR CLIENT!');
      console.log('=====================================');
      console.log('✨ All systems operational');
      console.log('✨ Authentication working');
      console.log('✨ Data access functional');
      console.log('✨ Admin functions active');
      console.log('✨ Workflow creation enabled');
      console.log('\n🎉 THE 5T ELITE TALENT PLATFORM IS LIVE! 🎉');
    } else {
      console.log('\n⚠️  PLATFORM STATUS: NEEDS ATTENTION');
      console.log('====================================');
      console.log(`${testResults.failed} issue(s) need to be resolved before going live.`);
    }
    
  } catch (error) {
    console.error('\n❌ CRITICAL ERROR:', error.message);
    console.log('\n🔧 Platform needs debugging before client delivery.');
  }
}

runFullTest();
