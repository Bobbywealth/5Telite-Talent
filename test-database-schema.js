#!/usr/bin/env node

/**
 * Database Schema Test Script
 * 
 * This script tests if the database schema is correctly set up
 * for the admin approval system.
 */

const BASE_URL = 'https://5telite.org';

async function testDatabaseSchema() {
  console.log('🔍 Testing Database Schema for Approval System\n');
  
  try {
    // Test 1: Check if we can create a user with pending status
    console.log('1. Testing user creation with pending status...');
    
    const testUser = {
      email: `schema-test-${Date.now()}@example.com`,
      password: 'TestPassword123!',
      firstName: 'Schema',
      lastName: 'Test',
      role: 'talent'
    };
    
    const createResponse = await fetch(`${BASE_URL}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    
    const createResult = await createResponse.json();
    
    if (createResponse.ok && createResult.requiresApproval) {
      console.log('✅ User created with pending status');
      console.log('📧 Email:', testUser.email);
      console.log('🆔 User ID:', createResult.user?.id);
      console.log('📊 Status:', createResult.user?.status);
      
      // Test 2: Check if user appears in pending users endpoint
      console.log('\n2. Testing pending users endpoint...');
      
      const pendingResponse = await fetch(`${BASE_URL}/api/admin/users/pending`);
      const pendingResult = await pendingResponse.json();
      
      if (pendingResponse.ok) {
        console.log('✅ Pending users endpoint accessible');
        console.log('📊 Total pending users:', pendingResult.users?.length || 0);
        
        const ourUser = pendingResult.users?.find(u => u.email === testUser.email);
        if (ourUser) {
          console.log('✅ Our test user found in pending list');
          console.log('📊 User status in pending list:', ourUser.status);
          
          // Test 3: Check if we can update user status
          console.log('\n3. Testing user status update...');
          
          const updateResponse = await fetch(`${BASE_URL}/api/admin/users/${ourUser.id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'active' })
          });
          
          const updateResult = await updateResponse.json();
          
          if (updateResponse.ok) {
            console.log('✅ User status update successful');
            console.log('📊 Updated status:', updateResult.user?.status);
            
            // Test 4: Verify user can now login
            console.log('\n4. Testing approved user login...');
            
            const loginResponse = await fetch(`${BASE_URL}/api/login`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                email: testUser.email,
                password: testUser.password
              })
            });
            
            const loginResult = await loginResponse.json();
            
            if (loginResponse.ok) {
              console.log('✅ Approved user login successful');
              console.log('🎉 All database schema tests passed!');
            } else {
              console.log('❌ Approved user login failed:', loginResult);
            }
          } else {
            console.log('❌ User status update failed:', updateResult);
          }
        } else {
          console.log('❌ Our test user NOT found in pending list');
          console.log('📊 Available users:', pendingResult.users?.map(u => u.email));
        }
      } else {
        console.log('❌ Pending users endpoint failed:', pendingResult);
      }
    } else {
      console.log('❌ User creation failed:', createResult);
    }
  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run the test
testDatabaseSchema().catch(console.error);
