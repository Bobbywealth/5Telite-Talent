# Admin Approval System Test Checklist

## 🎯 Objective
Test the complete admin approval workflow for public talent registrations from the `/auth` page.

## 📋 Test Steps

### 1. Site Connectivity Check
- [ ] Visit https://5telite.org
- [ ] Verify site loads properly
- [ ] Check that `/auth` page is accessible

### 2. Public Talent Registration Test
- [ ] Go to https://5telite.org/auth
- [ ] Click "Register" tab
- [ ] Fill out the registration form with:
  - **Email**: `test-approval-${timestamp}@example.com`
  - **Password**: `TestPassword123!`
  - **First Name**: `Test`
  - **Last Name**: `User`
  - **Role**: `Talent` (should be selected by default)
- [ ] Click "Sign Up"
- [ ] **Expected Result**: 
  - ✅ Success message: "Registration successful! Your account is pending admin approval"
  - ✅ User stays on auth page (not logged in)
  - ✅ No redirect to dashboard

### 3. Admin Dashboard Check
- [ ] Login as admin (bobby@5t.com)
- [ ] Go to Admin Dashboard
- [ ] Check the sidebar for "Approvals" link
- [ ] **Expected Result**: 
  - ✅ "Approvals" link visible with badge showing pending count
  - ✅ Badge shows at least "1" (the test user we just created)

### 4. Admin Approvals Page Test
- [ ] Click "Approvals" in admin sidebar
- [ ] **Expected Result**:
  - ✅ Page loads without errors
  - ✅ Test user appears in the pending users table
  - ✅ User details show: email, name, registration date
  - ✅ "Approve" and "Reject" buttons are visible

### 5. User Approval Test
- [ ] Click "Approve" button for the test user
- [ ] Confirm the approval action
- [ ] **Expected Result**:
  - ✅ Success message: "User approved successfully"
  - ✅ User disappears from pending list
  - ✅ User status changes to "active"

### 6. Approved User Login Test
- [ ] Go back to https://5telite.org/auth
- [ ] Try to login with the test user credentials:
  - **Email**: `test-approval-${timestamp}@example.com`
  - **Password**: `TestPassword123!`
- [ ] **Expected Result**:
  - ✅ Login successful
  - ✅ Redirected to talent dashboard
  - ✅ No "pending approval" message

### 7. Rejection Test (Optional)
- [ ] Create another test user
- [ ] Go to admin approvals
- [ ] Click "Reject" for the new test user
- [ ] **Expected Result**:
  - ✅ User status changes to "suspended"
  - ✅ User cannot login (gets "account suspended" message)

## 🐛 Common Issues to Check

### Issue 1: User doesn't appear in pending list
**Symptoms**: Registration succeeds but user not visible in admin approvals
**Possible Causes**:
- Database connection issues
- User status not set to "pending"
- Admin approvals page not fetching data correctly

### Issue 2: Approval doesn't work
**Symptoms**: Click approve but user remains pending
**Possible Causes**:
- API endpoint not working
- Database update failing
- Permission issues

### Issue 3: Approved user can't login
**Symptoms**: User approved but still can't login
**Possible Causes**:
- Status not actually updated in database
- Login logic not checking status correctly
- Session issues

## 🔧 Debug Commands

If issues occur, run these in the browser console:

```javascript
// Check if user was created
fetch('/api/admin/debug/users')
  .then(r => r.json())
  .then(console.log);

// Check pending users
fetch('/api/admin/users/pending')
  .then(r => r.json())
  .then(console.log);

// Test approval endpoint
fetch('/api/admin/users/{USER_ID}/status', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ status: 'active' })
})
.then(r => r.json())
.then(console.log);
```

## ✅ Success Criteria

The approval system is working correctly if:
1. ✅ Public registrations create users with "pending" status
2. ✅ Pending users appear in admin approvals dashboard
3. ✅ Admins can approve/reject users
4. ✅ Approved users can login successfully
5. ✅ Rejected users cannot login
6. ✅ Email notifications are sent (if configured)

## 📝 Test Results

**Date**: ___________
**Tester**: ___________
**Site Version**: ___________

| Test Step | Status | Notes |
|-----------|--------|-------|
| Site Connectivity | ⬜ Pass / ⬜ Fail | |
| Public Registration | ⬜ Pass / ⬜ Fail | |
| Admin Dashboard | ⬜ Pass / ⬜ Fail | |
| Approvals Page | ⬜ Pass / ⬜ Fail | |
| User Approval | ⬜ Pass / ⬜ Fail | |
| Approved Login | ⬜ Pass / ⬜ Fail | |
| User Rejection | ⬜ Pass / ⬜ Fail | |

**Overall Result**: ⬜ PASS / ⬜ FAIL

**Issues Found**:
- 

**Recommendations**:
- 
