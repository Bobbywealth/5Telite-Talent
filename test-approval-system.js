#!/usr/bin/env node

/**
 * Comprehensive Test Script for Admin Approval System
 * 
 * This script tests the complete workflow:
 * 1. Public talent registration from /auth page
 * 2. Verification that user appears in admin approvals
 * 3. Admin approval process
 * 4. User login after approval
 */

const BASE_URL = 'https://5telite.org';

// Test data
const testUser = {
  email: `test-${Date.now()}@example.com`,
  password: 'TestPassword123!',
  firstName: 'Test',
  lastName: 'User',
  role: 'talent'
};

const adminCredentials = {
  email: 'bobby@5t.com', // Replace with actual admin email
  password: 'your-admin-password' // Replace with actual admin password
};

async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    });
    
    const data = await response.json();
    return { status: response.status, data, ok: response.ok };
  } catch (error) {
    console.error(`Request failed: ${error.message}`);
    return { status: 0, data: null, ok: false, error: error.message };
  }
}

async function testSiteConnectivity() {
  console.log('🔍 Testing site connectivity...');
  const result = await makeRequest(`${BASE_URL}/api/health`);
  
  if (result.ok) {
    console.log('✅ Site is accessible');
    return true;
  } else {
    console.log('❌ Site is not accessible:', result.error || result.data);
    return false;
  }
}

async function testPublicRegistration() {
  console.log('\n📝 Testing public talent registration...');
  
  const result = await makeRequest(`${BASE_URL}/api/register`, {
    method: 'POST',
    body: JSON.stringify(testUser)
  });
  
  if (result.ok && result.data.requiresApproval) {
    console.log('✅ Registration successful - user requires approval');
    console.log('📧 User email:', testUser.email);
    console.log('🆔 User ID:', result.data.user?.id);
    return result.data.user;
  } else {
    console.log('❌ Registration failed:', result.data);
    return null;
  }
}

async function testAdminLogin() {
  console.log('\n🔐 Testing admin login...');
  
  const result = await makeRequest(`${BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify(adminCredentials)
  });
  
  if (result.ok) {
    console.log('✅ Admin login successful');
    return true;
  } else {
    console.log('❌ Admin login failed:', result.data);
    return false;
  }
}

async function testPendingUsersEndpoint() {
  console.log('\n👥 Testing pending users endpoint...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/users/pending`);
  
  if (result.ok) {
    console.log('✅ Pending users endpoint accessible');
    console.log('📊 Pending users count:', result.data.users?.length || 0);
    
    // Check if our test user is in the list
    const testUserInList = result.data.users?.find(u => u.email === testUser.email);
    if (testUserInList) {
      console.log('✅ Test user found in pending list');
      return testUserInList;
    } else {
      console.log('❌ Test user NOT found in pending list');
      return null;
    }
  } else {
    console.log('❌ Pending users endpoint failed:', result.data);
    return null;
  }
}

async function testUserApproval(userId) {
  console.log('\n✅ Testing user approval...');
  
  const result = await makeRequest(`${BASE_URL}/api/admin/users/${userId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status: 'active' })
  });
  
  if (result.ok) {
    console.log('✅ User approval successful');
    return true;
  } else {
    console.log('❌ User approval failed:', result.data);
    return false;
  }
}

async function testApprovedUserLogin() {
  console.log('\n🔓 Testing approved user login...');
  
  const result = await makeRequest(`${BASE_URL}/api/login`, {
    method: 'POST',
    body: JSON.stringify({
      email: testUser.email,
      password: testUser.password
    })
  });
  
  if (result.ok) {
    console.log('✅ Approved user login successful');
    return true;
  } else {
    console.log('❌ Approved user login failed:', result.data);
    return false;
  }
}

async function runAllTests() {
  console.log('🚀 Starting Admin Approval System Tests\n');
  console.log('Test User:', testUser.email);
  console.log('=' .repeat(50));
  
  // Test 1: Site connectivity
  const siteUp = await testSiteConnectivity();
  if (!siteUp) {
    console.log('\n❌ Site is down - cannot proceed with tests');
    return;
  }
  
  // Test 2: Public registration
  const registeredUser = await testPublicRegistration();
  if (!registeredUser) {
    console.log('\n❌ Registration failed - cannot proceed with tests');
    return;
  }
  
  // Test 3: Admin login
  const adminLoggedIn = await testAdminLogin();
  if (!adminLoggedIn) {
    console.log('\n❌ Admin login failed - cannot proceed with approval tests');
    return;
  }
  
  // Test 4: Check pending users
  const pendingUser = await testPendingUsersEndpoint();
  if (!pendingUser) {
    console.log('\n❌ Test user not found in pending list - approval system may be broken');
    return;
  }
  
  // Test 5: Approve user
  const approvalSuccess = await testUserApproval(pendingUser.id);
  if (!approvalSuccess) {
    console.log('\n❌ User approval failed');
    return;
  }
  
  // Test 6: Test approved user login
  const loginSuccess = await testApprovedUserLogin();
  if (!loginSuccess) {
    console.log('\n❌ Approved user login failed');
    return;
  }
  
  console.log('\n🎉 ALL TESTS PASSED! Admin approval system is working correctly.');
}

// Run the tests
runAllTests().catch(console.error);
