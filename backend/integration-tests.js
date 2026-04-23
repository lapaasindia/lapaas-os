/**
 * Integration Tests for Lapaas OS
 * Tests complete workflows across multiple modules
 */

const http = require('http');

const BASE_URL = 'http://localhost:3000';
const API_V1 = `${BASE_URL}/api/v1`;

// Test utilities
const makeRequest = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(url, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            data: JSON.parse(data),
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            data: data,
          });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

// Test cases
const tests = [];
let passedTests = 0;
let failedTests = 0;

const test = (name, fn) => {
  tests.push({ name, fn });
};

const assert = (condition, message) => {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
};

const assertEqual = (actual, expected, message) => {
  if (actual !== expected) {
    throw new Error(`Expected ${expected}, got ${actual}. ${message}`);
  }
};

// ==================== INTEGRATION TESTS ====================

// Test 1: User Registration & Login Flow
test('User Registration and Login Flow', async () => {
  const testEmail = `testuser-${Date.now()}@example.com`;
  
  // Register user
  const registerRes = await makeRequest('POST', `${API_V1}/auth/register`, {
    email: testEmail,
    password: 'TestPass123!',
    firstName: 'Test',
    lastName: 'User',
  });
  assert(registerRes.status === 201 || registerRes.status === 200, `Registration should succeed, got ${registerRes.status}`);
  assert(registerRes.data.data && registerRes.data.data.id, 'Should return user data with ID');

  // Login user
  const loginRes = await makeRequest('POST', `${API_V1}/auth/login`, {
    email: testEmail,
    password: 'TestPass123!',
  });
  assert(loginRes.status === 200, `Login should succeed, got ${loginRes.status}`);
  assert(loginRes.data.data && loginRes.data.data.accessToken, 'Should return access token');
});

// Test 2: Organization Creation & Member Management
test('Organization Creation and Member Management', async () => {
  const userId = 'test-user-001';

  // Create organization
  const createOrgRes = await makeRequest('POST', `${API_V1}/organizations`, {
    name: 'Integration Test Org',
    description: 'Testing organization',
    ownerId: userId,
  });
  assert(createOrgRes.status === 200, 'Organization creation should succeed');
  const orgId = createOrgRes.data.data.id;
  assert(orgId, 'Should return organization ID');

  // Get organization
  const getOrgRes = await makeRequest('GET', `${API_V1}/organizations/${orgId}`);
  assert(getOrgRes.status === 200, 'Get organization should succeed');
  assertEqual(getOrgRes.data.data.name, 'Integration Test Org', 'Organization name should match');

  // Add member
  const addMemberRes = await makeRequest('POST', `${API_V1}/organizations/${orgId}/members`, {
    userId: 'test-user-002',
    role: 'Manager',
    addedBy: userId,
  });
  assert(addMemberRes.status === 200, 'Add member should succeed');
  assert(addMemberRes.data.data.members.length >= 2, 'Should have at least 2 members');
});

// Test 3: Team Creation & Member Management
test('Team Creation and Member Management', async () => {
  const userId = 'test-user-001';
  const orgId = 'test-org-001';

  // Create team
  const createTeamRes = await makeRequest('POST', `${API_V1}/teams`, {
    name: 'Integration Test Team',
    description: 'Testing team',
    organizationId: orgId,
    leaderId: userId,
  });
  assert(createTeamRes.status === 200, 'Team creation should succeed');
  const teamId = createTeamRes.data.data.id;
  assert(teamId, 'Should return team ID');

  // Get team
  const getTeamRes = await makeRequest('GET', `${API_V1}/teams/${teamId}`);
  assert(getTeamRes.status === 200, 'Get team should succeed');
  assertEqual(getTeamRes.data.data.name, 'Integration Test Team', 'Team name should match');

  // Add member
  const addMemberRes = await makeRequest('POST', `${API_V1}/teams/${teamId}/members`, {
    userId: 'test-user-002',
    role: 'Member',
    addedBy: userId,
  });
  assert(addMemberRes.status === 200, 'Add member should succeed');
  assert(addMemberRes.data.data.members.length >= 2, 'Should have at least 2 members');
});

// Test 4: RBAC - Role Assignment & Permission Check
test('RBAC - Role Assignment and Permission Check', async () => {
  const userId = 'test-user-002';
  const orgId = 'test-org-001';

  // First create an organization with a member
  const createOrgRes = await makeRequest('POST', `${API_V1}/organizations`, {
    name: 'RBAC Test Org',
    description: 'Testing RBAC',
    ownerId: 'test-user-001',
  });
  const testOrgId = createOrgRes.data.data.id;

  // Add member first
  await makeRequest('POST', `${API_V1}/organizations/${testOrgId}/members`, {
    userId,
    role: 'Member',
    addedBy: 'test-user-001',
  });

  // Assign role
  const assignRoleRes = await makeRequest('POST', `${API_V1}/roles/assign`, {
    userId,
    organizationId: testOrgId,
    role: 'Manager',
    assignedBy: 'test-user-001',
  });
  assert(assignRoleRes.status === 200, `Role assignment should succeed, got ${assignRoleRes.status}`);
  assert(assignRoleRes.data.data && assignRoleRes.data.data.role === 'Manager', 'Role should be Manager');

  // Check permission - should have create permission
  const checkCreateRes = await makeRequest('POST', `${API_V1}/permissions/check`, {
    userId,
    organizationId: testOrgId,
    action: 'create',
  });
  assert(checkCreateRes.status === 200, 'Permission check should succeed');
  assert(checkCreateRes.data.data.hasPermission === true, 'Manager should have create permission');

  // Check permission - should not have delete permission
  const checkDeleteRes = await makeRequest('POST', `${API_V1}/permissions/check`, {
    userId,
    organizationId: testOrgId,
    action: 'delete',
  });
  assert(checkDeleteRes.status === 200, 'Permission check should succeed');
  assert(checkDeleteRes.data.data.hasPermission === false, 'Manager should not have delete permission');
});

// Test 5: Activity Logging
test('Activity Logging Across Operations', async () => {
  // Get initial activity count
  const initialRes = await makeRequest('GET', `${API_V1}/activities`);
  const initialCount = initialRes.data.data.length;

  // Perform operations
  await makeRequest('POST', `${API_V1}/organizations`, {
    name: 'Activity Test Org',
    description: 'Testing activity logging',
    ownerId: 'test-user-001',
  });

  // Get final activity count
  const finalRes = await makeRequest('GET', `${API_V1}/activities`);
  const finalCount = finalRes.data.data.length;

  assert(finalCount > initialCount, 'Activity count should increase');
  assert(finalRes.data.data.some(a => a.action === 'CREATE'), 'Should have CREATE activity');
});

// Test 6: User Profile Management
test('User Profile Management', async () => {
  // First register a user
  const testEmail = `profile-test-${Date.now()}@example.com`;
  const registerRes = await makeRequest('POST', `${API_V1}/auth/register`, {
    email: testEmail,
    password: 'TestPass123!',
    firstName: 'Profile',
    lastName: 'Test',
  });
  const userId = registerRes.data.data.id;

  // Get profile
  const getRes = await makeRequest('GET', `${API_V1}/users/profile/${userId}`);
  if (getRes.status === 200) {
    assert(getRes.data.data, 'Should return user data');
  }

  // Update profile
  const updateRes = await makeRequest('PUT', `${API_V1}/users/profile/${userId}`, {
    firstName: 'Updated',
    lastName: 'Name',
  });
  assert(updateRes.status === 200, `Update profile should succeed, got ${updateRes.status}`);
  assert(updateRes.data.message === 'Profile updated successfully', 'Should return success message');
});

// Test 7: User Activity Tracking
test('User Activity Tracking', async () => {
  const userId = 'test-user-001';

  // Get user activities
  const activitiesRes = await makeRequest('GET', `${API_V1}/users/activity/${userId}`);
  assert(activitiesRes.status === 200, 'Get user activities should succeed');
  assert(Array.isArray(activitiesRes.data.data), 'Should return array of activities');
});

// Test 8: Get All Roles
test('Get All Roles', async () => {
  const rolesRes = await makeRequest('GET', `${API_V1}/roles`);
  assert(rolesRes.status === 200, 'Get roles should succeed');
  assert(rolesRes.data.data.length === 4, 'Should have 4 default roles');
  assert(rolesRes.data.data.some(r => r.name === 'Admin'), 'Should have Admin role');
  assert(rolesRes.data.data.some(r => r.name === 'Manager'), 'Should have Manager role');
  assert(rolesRes.data.data.some(r => r.name === 'Member'), 'Should have Member role');
  assert(rolesRes.data.data.some(r => r.name === 'Viewer'), 'Should have Viewer role');
});

// Test 9: Get Activities by Resource
test('Get Activities by Resource', async () => {
  const activitiesRes = await makeRequest('GET', `${API_V1}/activities/ORGANIZATION`);
  assert(activitiesRes.status === 200, 'Get activities by resource should succeed');
  assert(Array.isArray(activitiesRes.data.data), 'Should return array of activities');
  assert(activitiesRes.data.data.every(a => a.resource === 'ORGANIZATION'), 'All activities should be for ORGANIZATION');
});

// Test 10: Health Check
test('Health Check', async () => {
  const healthRes = await makeRequest('GET', `${BASE_URL}/api/health`);
  assert(healthRes.status === 200, 'Health check should succeed');
  assertEqual(healthRes.data.status, 'ok', 'Status should be ok');
});

// ==================== TEST RUNNER ====================

const runTests = async () => {
  console.log('\n🧪 INTEGRATION TESTS - LAPAAS OS');
  console.log('================================\n');

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✅ ${name}`);
      passedTests++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failedTests++;
    }
  }

  console.log('\n================================');
  console.log(`📊 Results: ${passedTests} passed, ${failedTests} failed`);
  console.log(`✅ Total: ${passedTests}/${tests.length} tests passed`);
  console.log('================================\n');

  if (failedTests === 0) {
    console.log('🎉 ALL TESTS PASSED!\n');
    process.exit(0);
  } else {
    console.log('❌ SOME TESTS FAILED!\n');
    process.exit(1);
  }
};

// Run tests
runTests().catch(console.error);
