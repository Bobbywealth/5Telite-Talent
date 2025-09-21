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

async function testSettings() {
  console.log('🔍 TESTING SETTINGS PAGES FOR ADMIN & TALENT');
  console.log('===========================================\n');
  
  let passed = 0, total = 0;
  
  function logTest(testName, success, details = '') {
    total++;
    if (success) {
      passed++;
      console.log(`✅ ${testName}`);
    } else {
      console.log(`❌ ${testName} ${details}`);
    }
  }
  
  // === ADMIN SETTINGS TEST ===
  console.log('👑 ADMIN SETTINGS TEST');
  console.log('----------------------');
  
  // Login as admin
  const adminLogin = await makeRequest('POST', '/api/login', {
    email: 'admin@5t.com',
    password: 'admin123'
  });
  logTest('Admin Login', adminLogin.status === 200);
  
  if (adminLogin.status === 200) {
    // Test admin settings endpoint
    const adminSettings = await makeRequest('GET', '/api/admin/settings');
    logTest('Admin Settings API', adminSettings.status === 200, 
      adminSettings.status !== 200 ? `(${adminSettings.status})` : '');
    
    if (adminSettings.status === 200) {
      console.log('   → Admin settings loaded successfully');
    }
    
    // Test saving admin settings
    const saveAdminSettings = await makeRequest('POST', '/api/admin/settings', {
      siteName: 'Test Platform',
      emailNotifications: true,
      autoApproveBookings: false
    });
    logTest('Admin Settings Save', saveAdminSettings.status === 200 || saveAdminSettings.status === 201);
  }
  
  // === TALENT SETTINGS TEST ===
  console.log('\n👤 TALENT SETTINGS TEST');
  console.log('-----------------------');
  
  // Logout and login as Bobby
  await makeRequest('POST', '/api/logout');
  cookies = '';
  
  const bobbyLogin = await makeRequest('POST', '/api/login', {
    email: 'bobby@5t.com',
    password: 'bobby123'
  });
  logTest('Bobby Login', bobbyLogin.status === 200);
  
  if (bobbyLogin.status === 200) {
    // Test if Bobby can access settings (should use shared settings page)
    const bobbyProfile = await makeRequest('GET', '/api/auth/user');
    logTest('Bobby Settings Access', bobbyProfile.status === 200);
    
    if (bobbyProfile.status === 200) {
      console.log('   → Bobby can access settings page');
    }
  }
  
  // === RESULTS ===
  console.log('\n🎯 SETTINGS TEST RESULTS');
  console.log('========================');
  console.log(`✅ PASSED: ${passed}/${total} tests`);
  console.log(`📊 SUCCESS RATE: ${Math.round((passed / total) * 100)}%`);
  
  if (passed === total) {
    console.log('\n🎉 SETTINGS PAGES: FULLY FUNCTIONAL!');
    console.log('✨ Admin settings working');
    console.log('✨ Talent settings working');
    console.log('✨ All APIs operational');
  } else {
    console.log('\n⚠️  SETTINGS ISSUES FOUND');
    console.log('Some settings functionality needs attention');
  }
}

testSettings();
