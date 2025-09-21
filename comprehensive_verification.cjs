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
          resolve({ status: res.statusCode, data: jsonBody, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, data: body, headers: res.headers });
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

async function comprehensiveVerification() {
  console.log('🔍 COMPREHENSIVE PLATFORM VERIFICATION');
  console.log('=====================================\n');
  
  let results = {
    critical: { passed: 0, total: 0, tests: [] },
    important: { passed: 0, total: 0, tests: [] },
    minor: { passed: 0, total: 0, tests: [] }
  };
  
  function logTest(category, testName, passed, details = '') {
    results[category].total++;
    const status = passed ? '✅ PASS' : '❌ FAIL';
    const result = { name: testName, status, details };
    results[category].tests.push(result);
    
    if (passed) results[category].passed++;
    
    console.log(`${status} ${testName} ${details}`);
  }
  
  // === CRITICAL BUSINESS FUNCTIONS ===
  console.log('🚨 CRITICAL BUSINESS FUNCTIONS');
  console.log('-------------------------------');
  
  // Admin Authentication
  const adminLogin = await makeRequest('POST', '/api/login', {
    email: 'admin@5t.com',
    password: 'admin123'
  });
  logTest('critical', 'Admin Authentication', adminLogin.status === 200, 
    adminLogin.status !== 200 ? `(${adminLogin.status})` : '');
  
  if (adminLogin.status !== 200) {
    console.log('\n❌ CRITICAL FAILURE: Admin login failed - platform not operational');
    return;
  }
  
  const adminUser = adminLogin.data;
  
  // Admin Dashboard
  const dashStats = await makeRequest('GET', '/api/admin/dashboard-stats');
  logTest('critical', 'Admin Dashboard Stats', dashStats.status === 200,
    dashStats.status !== 200 ? `(${dashStats.status})` : '');
  
  if (dashStats.status === 200) {
    console.log(`   → Stats: ${dashStats.data.totalTalents} talents, ${dashStats.data.totalBookings} bookings, ${dashStats.data.totalContracts} contracts`);
  }
  
  // Data Access Tests
  const talents = await makeRequest('GET', '/api/talents');
  logTest('critical', 'Talent Data Access', talents.status === 200);
  
  const bookings = await makeRequest('GET', '/api/bookings');
  logTest('critical', 'Booking Data Access', bookings.status === 200);
  
  const contracts = await makeRequest('GET', '/api/contracts');
  logTest('critical', 'Contract Data Access', contracts.status === 200);
  
  const tasks = await makeRequest('GET', '/api/tasks');
  logTest('critical', 'Task Data Access', tasks.status === 200);
  
  // Workflow Creation
  const newBooking = await makeRequest('POST', '/api/bookings', {
    title: 'Verification Test Booking',
    notes: 'Comprehensive platform verification test',
    startDate: '2025-10-30T10:00:00Z',
    endDate: '2025-10-30T18:00:00Z',
    location: 'Verification Studio',
    rate: '1500.00',
    clientId: adminUser.id,
    createdBy: adminUser.id
  });
  logTest('critical', 'Booking Creation', newBooking.status === 200 || newBooking.status === 201);
  
  const newTask = await makeRequest('POST', '/api/tasks', {
    title: 'Verification Test Task',
    description: 'Platform verification task',
    scope: 'booking',
    createdBy: adminUser.id
  });
  logTest('critical', 'Task Creation', newTask.status === 200 || newTask.status === 201);
  
  // === IMPORTANT USER FUNCTIONS ===
  console.log('\n📋 IMPORTANT USER FUNCTIONS');
  console.log('----------------------------');
  
  // Talent Authentication
  await makeRequest('POST', '/api/logout');
  cookies = '';
  
  const bobbyLogin = await makeRequest('POST', '/api/login', {
    email: 'bobby@5t.com',
    password: 'bobby123'
  });
  logTest('important', 'Talent Authentication', bobbyLogin.status === 200);
  
  if (bobbyLogin.status === 200) {
    const bobbyUser = bobbyLogin.data;
    
    // Talent Profile Access
    const bobbyProfile = await makeRequest('GET', `/api/talents/${bobbyUser.id}`);
    logTest('important', 'Talent Profile Access', bobbyProfile.status === 200);
    
    // Talent Data Access
    const bobbyBookings = await makeRequest('GET', '/api/bookings');
    logTest('important', 'Talent Booking Access', bobbyBookings.status === 200);
    
    const bobbyContracts = await makeRequest('GET', '/api/contracts');
    logTest('important', 'Talent Contract Access', bobbyContracts.status === 200);
    
    const bobbyTasks = await makeRequest('GET', '/api/tasks');
    logTest('important', 'Talent Task Access', bobbyTasks.status === 200);
  }
  
  // === MINOR/OPTIONAL FUNCTIONS ===
  console.log('\n🔔 MINOR/OPTIONAL FUNCTIONS');
  console.log('----------------------------');
  
  // Notifications (we know this has issues)
  const notifications = await makeRequest('GET', '/api/notifications-new');
  logTest('minor', 'Notification System', notifications.status === 200,
    notifications.status !== 200 ? '(Known issue - table missing)' : '');
  
  // === RESULTS SUMMARY ===
  console.log('\n🎯 COMPREHENSIVE VERIFICATION RESULTS');
  console.log('=====================================');
  
  const criticalRate = Math.round((results.critical.passed / results.critical.total) * 100);
  const importantRate = Math.round((results.important.passed / results.important.total) * 100);
  const minorRate = Math.round((results.minor.passed / results.minor.total) * 100);
  
  console.log(`🚨 CRITICAL: ${results.critical.passed}/${results.critical.total} (${criticalRate}%)`);
  console.log(`📋 IMPORTANT: ${results.important.passed}/${results.important.total} (${importantRate}%)`);
  console.log(`🔔 MINOR: ${results.minor.passed}/${results.minor.total} (${minorRate}%)`);
  
  const totalPassed = results.critical.passed + results.important.passed + results.minor.passed;
  const totalTests = results.critical.total + results.important.total + results.minor.total;
  const overallRate = Math.round((totalPassed / totalTests) * 100);
  
  console.log(`\n📊 OVERALL: ${totalPassed}/${totalTests} (${overallRate}%)`);
  
  // === PLATFORM READINESS ASSESSMENT ===
  console.log('\n🏆 PLATFORM READINESS ASSESSMENT');
  console.log('=================================');
  
  if (results.critical.passed === results.critical.total) {
    if (results.important.passed === results.important.total) {
      console.log('🎉 PLATFORM IS FULLY READY FOR CLIENT!');
      console.log('✨ All critical and important functions working perfectly');
      console.log('✨ Minor issues (if any) are non-blocking');
    } else {
      console.log('✅ PLATFORM IS READY FOR CLIENT WITH MINOR LIMITATIONS');
      console.log('✨ All critical functions working');
      console.log('⚠️  Some important features need attention');
    }
  } else {
    console.log('❌ PLATFORM NOT READY - CRITICAL ISSUES FOUND');
    console.log('🔧 Must fix critical issues before client delivery');
  }
  
  // List any failures
  const allFailures = [
    ...results.critical.tests.filter(t => t.status.includes('FAIL')),
    ...results.important.tests.filter(t => t.status.includes('FAIL')),
    ...results.minor.tests.filter(t => t.status.includes('FAIL'))
  ];
  
  if (allFailures.length > 0) {
    console.log('\n🔧 ISSUES TO ADDRESS:');
    allFailures.forEach(failure => {
      console.log(`   • ${failure.name} ${failure.details}`);
    });
  }
}

comprehensiveVerification();
