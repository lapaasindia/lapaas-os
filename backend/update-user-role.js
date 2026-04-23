// Quick script to update user role
const jwt = require('jsonwebtoken');

const JWT_SECRET = 'test-secret-key-change-in-production';
const userId = process.argv[2];
const newRole = process.argv[3] || 'admin';

// Create admin token
const adminToken = jwt.sign(
  {
    sub: 'admin-temp',
    email: 'admin@temp.com',
    role: 'admin',
    orgId: null,
    teamId: null,
    type: 'access',
  },
  JWT_SECRET,
  { expiresIn: '1h' }
);

console.log('Admin Token:', adminToken);
console.log('\nRun this command:');
console.log(`curl -X PUT http://localhost:3000/api/v1/users/${userId}/role \\`);
console.log(`  -H "Content-Type: application/json" \\`);
console.log(`  -H "Authorization: Bearer ${adminToken}" \\`);
console.log(`  -d '{"role":"${newRole}"}'`);
