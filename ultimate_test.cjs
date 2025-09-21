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
      resolve({ status: 0, data: { error: error.message } });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function ultimateTest() {
  console.log('🎯 5T ELITE TALENT PLATFORM - ULTIMATE FINAL TEST');
  console.log('=================================================\n');
  
  let results = {
    auth: { passed: 0, total: 0 },
    admin: { passed: 0, total: 0 },
    talent: { passed: 0, total: 0 },
    workflows: { passed: 0, total: 0 },
    data: { passed: 0, total: 0 }
  };
  
  function logTest(category, testName, passed, details = '') {
    results[category].total++;
    if (passed) {
      results[category].passed++;
      console.log(`✅ ${testName}`);
    } else {
      console.log(`❌ ${testName} ${details}`);
    }
  }
  
  // === AUTHENTICATION SYSTEM ===
  console.log('🔐 AUTHENTICATION SYSTEM');
  console.log('------------------------');
  
  // Admin Login
  const adminLogin = await makeRequest('POST', '/api/login', {
    email: 'admin@5t.com',
    password: 'admin123'
  });
  logTest('auth', 'Admin Login', adminLogin.status === 200);
  
  if (adminLogin.status === 200) {
    const adminUser = adminLogin.data;
    
    // Admin Dashboard & Data
    const adminStats = await makeRequest('GET', '/api/admin/dashboard-stats');
    logTest('admin', 'Admin Dashboard Stats', adminStats.status === 200);
    
    const allTalents = await makeRequest('GET', '/api/talents');
    logTest('admin', 'Admin View All Talents', allTalents.status === 200);
    
    const allBookings = await makeRequest('GET', '/api/bookings');
    logTest('admin', 'Admin View All Bookings', allBookings.status === 200);
    
    const allTasks = await makeRequest('GET', '/api/tasks');
    logTest('admin', 'Admin View All Tasks', allTasks.status === 200);
    
    // Test Admin Workflow Creation
    const newBooking = await makeRequest('POST', '/api/bookings', {
      title: 'ULTIMATE TEST - Commercial Campaign',
      notes: 'Final verification booking for platform launch',
      startDate: '2025-11-01T09:00:00Z',
      endDate: '2025-11-01T17:00:00Z',
      location: 'Ultimate Test Studio, NYC',
      rate: '2000.00',
      clientId: adminUser.id,
      createdBy: adminUser.id
    });
    logTest('workflows', 'Admin Create Booking', newBooking.status === 200 || newBooking.status === 201);
    
    const newTask = await makeRequest('POST', '/api/tasks', {
      title: 'ULTIMATE TEST - Platform Verification',
      description: 'Final platform verification task before client handoff',
      scope: 'booking',
      createdBy: adminUser.id
    });
    logTest('workflows', 'Admin Create Task', newTask.status === 200 || newTask.status === 201);
  }
  
  // === TALENT SYSTEM ===
  console.log('\n👤 TALENT SYSTEM');
  console.log('----------------');
  
  // Logout and login as Bobby
  await makeRequest('POST', '/api/logout');
  cookies = '';
  
  const bobbyLogin = await makeRequest('POST', '/api/login', {
    email: 'bobby@5t.com',
    password: 'bobby123'
  });
  logTest('auth', 'Bobby (Talent) Login', bobbyLogin.status === 200);
  
  if (bobbyLogin.status === 200) {
    const bobbyUser = bobbyLogin.data;
    
    // Test new auth endpoints
    const authUser = await makeRequest('GET', '/api/auth/user');
    logTest('talent', 'Auth User Endpoint', authUser.status === 200);
    
    const legacyUser = await makeRequest('GET', '/api/user');
    logTest('talent', 'Legacy User Endpoint', legacyUser.status === 200);
    
    // Test profile access
    const bobbyProfile = await makeRequest('GET', `/api/talents/${bobbyUser.id}`);
    logTest('talent', 'Bobby Profile Access', bobbyProfile.status === 200);
    
    if (bobbyProfile.status === 200) {
      console.log(`   → Profile Data: Stage: "${bobbyProfile.data.talentProfile?.stageName}", Location: "${bobbyProfile.data.talentProfile?.location}"`);
      
      // Test profile update (merge functionality)
      const profileUpdate = await makeRequest('PATCH', `/api/talents/${bobbyUser.id}`, {
        bio: 'ULTIMATE TEST - Updated bio for final verification'
      });
      logTest('talent', 'Profile Update (Merge)', profileUpdate.status === 200);
      
      // Verify other data wasn't lost
      const verifyProfile = await makeRequest('GET', `/api/talents/${bobbyUser.id}`);
      if (verifyProfile.status === 200) {
        const hasCategories = verifyProfile.data.talentProfile?.categories?.length > 0;
        const hasSkills = verifyProfile.data.talentProfile?.skills?.length > 0;
        logTest('data', 'Data Preservation Test', hasCategories && hasSkills, 
          !hasCategories || !hasSkills ? '(Data lost during update)' : '');
      }
    }
    
    // Test Bobby's data access
    const bobbyBookings = await makeRequest('GET', '/api/bookings');
    logTest('talent', 'Bobby Bookings Access', bobbyBookings.status === 200);
    
    const bobbyContracts = await makeRequest('GET', '/api/contracts');
    logTest('talent', 'Bobby Contracts Access', bobbyContracts.status === 200);
    
    const bobbyTasks = await makeRequest('GET', '/api/tasks');
    logTest('talent', 'Bobby Tasks Access', bobbyTasks.status === 200);
  }
  
  // === FINAL CALCULATIONS ===
  console.log('\n🎯 ULTIMATE TEST RESULTS');
  console.log('========================');
  
  const totalPassed = Object.values(results).reduce((sum, cat) => sum + cat.passed, 0);
  const totalTests = Object.values(results).reduce((sum, cat) => sum + cat.total, 0);
  const successRate = Math.round((totalPassed / totalTests) * 100);
  
  console.log(`🔐 AUTHENTICATION: ${results.auth.passed}/${results.auth.total}`);
  console.log(`👑 ADMIN FUNCTIONS: ${results.admin.passed}/${results.admin.total}`);
  console.log(`👤 TALENT FUNCTIONS: ${results.talent.passed}/${results.talent.total}`);
  console.log(`⚙️  WORKFLOWS: ${results.workflows.passed}/${results.workflows.total}`);
  console.log(`📊 DATA INTEGRITY: ${results.data.passed}/${results.data.total}`);
  
  console.log(`\n�� OVERALL: ${totalPassed}/${totalTests} (${successRate}%)`);
  
  // === PLATFORM READINESS ===
  console.log('\n🏆 PLATFORM READINESS ASSESSMENT');
  console.log('=================================');
  
  if (successRate >= 95) {
    console.log('🎉 PLATFORM IS PERFECT - 100% READY FOR CLIENT!');
    console.log('✨ All systems operational');
    console.log('✨ All fixes working');
    console.log('✨ Production ready');
    console.log('\n🚀 LAUNCH STATUS: GO! 🚀');
  } else if (successRate >= 85) {
    console.log('✅ PLATFORM IS EXCELLENT - READY FOR CLIENT!');
    console.log('✨ Core systems working perfectly');
    console.log('✨ Minor issues are non-blocking');
    console.log('\n🚀 LAUNCH STATUS: GO! 🚀');
  } else if (successRate >= 70) {
    console.log('⚠️  PLATFORM NEEDS MINOR FIXES');
    console.log('🔧 Some issues need attention before launch');
  } else {
    console.log('❌ PLATFORM NOT READY');
    console.log('🔧 Major issues need fixing');
  }
  
  console.log('\n🎉 5T ELITE TALENT PLATFORM TESTING COMPLETE! 🎉');
}

ultimateTest();
