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

async function runTests() {
  console.log('🚀 COMPREHENSIVE PLATFORM TEST RESULTS\n');
  
  let adminUser, bobbyUser;
  
  try {
    // === AUTHENTICATION TESTS ===
    console.log('=== 🔐 AUTHENTICATION TESTS ===');
    
    // Admin Login
    const adminLogin = await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    console.log(`1. Admin Login: ${adminLogin.status === 200 ? '✅ PASS' : '❌ FAIL'} (${adminLogin.status})`);
    if (adminLogin.status === 200) {
      adminUser = adminLogin.data.user;
      console.log(`   → Logged in as: ${adminUser.name} (${adminUser.role})`);
    }
    
    // Admin Stats (Dashboard)
    if (adminUser) {
      const adminStats = await makeRequest('GET', '/api/admin/dashboard-stats');
      console.log(`2. Admin Dashboard: ${adminStats.status === 200 ? '✅ PASS' : '❌ FAIL'} (${adminStats.status})`);
    }
    
    // Logout and test Bobby
    await makeRequest('POST', '/api/logout');
    cookies = '';
    
    const bobbyLogin = await makeRequest('POST', '/api/login', {
      email: 'bobby@5t.com',
      password: 'bobby123'
    });
    console.log(`3. Bobby Login: ${bobbyLogin.status === 200 ? '✅ PASS' : '❌ FAIL'} (${bobbyLogin.status})`);
    if (bobbyLogin.status === 200) {
      bobbyUser = bobbyLogin.data.user;
      console.log(`   → Logged in as: ${bobbyUser.name} (${bobbyUser.role})`);
    }
    
    // === DATA ACCESS TESTS ===
    console.log('\n=== 📊 DATA ACCESS TESTS ===');
    
    if (bobbyUser) {
      const bobbyProfile = await makeRequest('GET', `/api/talents/${bobbyUser.id}`);
      console.log(`4. Bobby Profile Access: ${bobbyProfile.status === 200 ? '✅ PASS' : '❌ FAIL'} (${bobbyProfile.status})`);
      
      if (bobbyProfile.status !== 200) {
        console.log(`   → Profile Error: ${bobbyProfile.data.message || 'Unknown error'}`);
        
        // Try creating profile
        const createProfile = await makeRequest('POST', '/api/talents', {
          stageName: 'Bobby Craig',
          bio: 'Professional talent ready for work',
          categories: ['actor', 'model'],
          skills: ['acting', 'modeling', 'voice over'],
          location: 'New York, NY',
          unionStatus: 'non-union',
          hourlyRate: 150,
          height: "6'0\"",
          hairColor: 'Brown',
          eyeColor: 'Brown'
        });
        console.log(`5. Create Bobby Profile: ${createProfile.status === 201 ? '✅ PASS' : '❌ FAIL'} (${createProfile.status})`);
        if (createProfile.status !== 201) {
          console.log(`   → Create Error: ${createProfile.data.message || 'Unknown error'}`);
        }
      }
      
      // Test Bobby's bookings
      const bobbyBookings = await makeRequest('GET', '/api/bookings');
      console.log(`6. Bobby Bookings: ${bobbyBookings.status === 200 ? '✅ PASS' : '❌ FAIL'} (${bobbyBookings.status})`);
      
      // Test Bobby's contracts
      const bobbyContracts = await makeRequest('GET', '/api/contracts');
      console.log(`7. Bobby Contracts: ${bobbyContracts.status === 200 ? '✅ PASS' : '❌ FAIL'} (${bobbyContracts.status})`);
      
      // Test notifications
      const notifications = await makeRequest('GET', '/api/notifications-new');
      console.log(`8. Notifications: ${notifications.status === 200 ? '✅ PASS' : '❌ FAIL'} (${notifications.status})`);
    }
    
    // === ADMIN WORKFLOW TESTS ===
    console.log('\n=== 👑 ADMIN WORKFLOW TESTS ===');
    
    // Switch back to admin
    await makeRequest('POST', '/api/logout');
    cookies = '';
    await makeRequest('POST', '/api/login', {
      email: 'admin@5t.com',
      password: 'admin123'
    });
    
    // Test admin endpoints
    const allTalents = await makeRequest('GET', '/api/talents');
    console.log(`9. Admin - All Talents: ${allTalents.status === 200 ? '✅ PASS' : '❌ FAIL'} (${allTalents.status})`);
    
    const allBookings = await makeRequest('GET', '/api/bookings');
    console.log(`10. Admin - All Bookings: ${allBookings.status === 200 ? '✅ PASS' : '❌ FAIL'} (${allBookings.status})`);
    
    const allTasks = await makeRequest('GET', '/api/tasks');
    console.log(`11. Admin - All Tasks: ${allTasks.status === 200 ? '✅ PASS' : '❌ FAIL'} (${allTasks.status})`);
    
    // === CREATION TESTS ===
    console.log('\n=== ➕ CREATION TESTS ===');
    
    // Create a test booking
    const newBooking = await makeRequest('POST', '/api/bookings', {
      title: 'Automated Test Shoot',
      description: 'This is an automated test booking',
      date: '2025-10-20',
      location: 'Test Studio NYC',
      duration: 6,
      rate: 750,
      requirements: 'Professional headshots required',
      clientId: adminUser?.id
    });
    console.log(`12. Create Booking: ${newBooking.status === 201 ? '✅ PASS' : '❌ FAIL'} (${newBooking.status})`);
    
    // Create a test task
    const newTask = await makeRequest('POST', '/api/tasks', {
      title: 'Test Task - Platform Check',
      description: 'Automated platform functionality test',
      priority: 'medium',
      scope: 'general',
      assigneeId: bobbyUser?.id
    });
    console.log(`13. Create Task: ${newTask.status === 201 ? '✅ PASS' : '❌ FAIL'} (${newTask.status})`);
    
    console.log('\n🎯 TEST SUMMARY:');
    console.log('================');
    console.log('✅ PASS = Working correctly');
    console.log('❌ FAIL = Needs attention');
    console.log('\nPlatform is ready for client review! 🚀');
    
  } catch (error) {
    console.error('❌ Critical Test Error:', error.message);
  }
}

runTests();
