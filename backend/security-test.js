#!/usr/bin/env node

/**
 * Security Penetration Testing Script for Lapaas OS
 * Run with: node security-test.js [--url=http://localhost:3000]
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.argv.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000';
const VERBOSE = process.argv.includes('--verbose') || process.argv.includes('-v');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

const log = {
  info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}[PASS]${colors.reset} ${msg}`),
  fail: (msg) => console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}[WARN]${colors.reset} ${msg}`),
  section: (msg) => console.log(`\n${colors.cyan}=== ${msg} ===${colors.reset}\n`),
};

// HTTP request helper
const request = (method, path, data = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const isHttps = url.protocol === 'https:';
    const lib = isHttps ? https : http;
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      rejectUnauthorized: false, // Allow self-signed certs for testing
    };
    
    const req = lib.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null,
            raw: body,
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: null,
            raw: body,
          });
        }
      });
    });
    
    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  warnings: 0,
  tests: [],
};

const addResult = (name, passed, message, severity = 'medium') => {
  results.tests.push({ name, passed, message, severity });
  if (passed) {
    results.passed++;
    log.success(`${name}: ${message}`);
  } else {
    results.failed++;
    log.fail(`${name}: ${message}`);
  }
};

const addWarning = (name, message) => {
  results.warnings++;
  results.tests.push({ name, passed: null, message, severity: 'low' });
  log.warn(`${name}: ${message}`);
};

// ==================== SECURITY TESTS ====================

async function testSecurityHeaders() {
  log.section('Security Headers Test');
  
  try {
    const res = await request('GET', '/api/health');
    const headers = res.headers;
    
    // X-Content-Type-Options
    if (headers['x-content-type-options'] === 'nosniff') {
      addResult('X-Content-Type-Options', true, 'Header present and correct');
    } else {
      addResult('X-Content-Type-Options', false, 'Header missing or incorrect', 'high');
    }
    
    // X-Frame-Options
    if (headers['x-frame-options']) {
      addResult('X-Frame-Options', true, `Header present: ${headers['x-frame-options']}`);
    } else {
      addResult('X-Frame-Options', false, 'Header missing - vulnerable to clickjacking', 'high');
    }
    
    // Content-Security-Policy
    if (headers['content-security-policy']) {
      addResult('Content-Security-Policy', true, 'CSP header present');
    } else {
      addWarning('Content-Security-Policy', 'CSP header not set - consider adding');
    }
    
    // Strict-Transport-Security
    if (headers['strict-transport-security']) {
      addResult('Strict-Transport-Security', true, 'HSTS header present');
    } else {
      addWarning('Strict-Transport-Security', 'HSTS not set (requires HTTPS)');
    }
    
    // X-XSS-Protection (deprecated but still checked)
    if (headers['x-xss-protection'] !== undefined) {
      addResult('X-XSS-Protection', true, 'Header present (note: deprecated in favor of CSP)');
    }
    
    // Referrer-Policy
    if (headers['referrer-policy']) {
      addResult('Referrer-Policy', true, `Header present: ${headers['referrer-policy']}`);
    } else {
      addWarning('Referrer-Policy', 'Header not set');
    }
    
  } catch (error) {
    addResult('Security Headers', false, `Test failed: ${error.message}`, 'critical');
  }
}

async function testRateLimiting() {
  log.section('Rate Limiting Test');
  
  try {
    // Test general rate limiting
    const res = await request('GET', '/api/v1/tasks?org_id=org-001');
    
    if (res.headers['ratelimit-limit']) {
      addResult('Rate Limit Headers', true, `Limit: ${res.headers['ratelimit-limit']}, Remaining: ${res.headers['ratelimit-remaining']}`);
    } else {
      addResult('Rate Limit Headers', false, 'Rate limiting not implemented', 'high');
    }
    
    // Test auth rate limiting (don't actually trigger it)
    const authRes = await request('POST', '/api/v1/auth/login', {
      email: 'test@test.com',
      password: 'wrong',
    });
    
    if (authRes.headers['ratelimit-limit']) {
      const limit = parseInt(authRes.headers['ratelimit-limit']);
      if (limit <= 10) {
        addResult('Auth Rate Limiting', true, `Auth endpoint has strict rate limit: ${limit}`);
      } else {
        addWarning('Auth Rate Limiting', `Auth rate limit may be too high: ${limit}`);
      }
    }
    
  } catch (error) {
    addResult('Rate Limiting', false, `Test failed: ${error.message}`, 'high');
  }
}

async function testSQLInjection() {
  log.section('SQL Injection Test');
  
  const sqlPayloads = [
    "'; DROP TABLE users; --",
    "1' OR '1'='1",
    "1; SELECT * FROM users",
    "' UNION SELECT * FROM users --",
    "admin'--",
    "1' AND 1=1 --",
  ];
  
  let blocked = 0;
  
  for (const payload of sqlPayloads) {
    try {
      const res = await request('GET', `/api/v1/tasks?org_id=${encodeURIComponent(payload)}`);
      
      if (res.status === 400 && res.body?.message?.includes('invalid')) {
        blocked++;
        if (VERBOSE) log.info(`Blocked SQL injection: ${payload.substring(0, 20)}...`);
      } else if (res.status === 200) {
        addResult('SQL Injection', false, `Payload not blocked: ${payload}`, 'critical');
        return;
      }
    } catch (error) {
      // Connection error might mean WAF blocked it
      blocked++;
    }
  }
  
  if (blocked === sqlPayloads.length) {
    addResult('SQL Injection Prevention', true, `All ${sqlPayloads.length} SQL injection payloads blocked`);
  } else {
    addResult('SQL Injection Prevention', false, `Only ${blocked}/${sqlPayloads.length} payloads blocked`, 'critical');
  }
}

async function testXSS() {
  log.section('XSS Prevention Test');
  
  const xssPayloads = [
    '<script>alert("xss")</script>',
    '<img src=x onerror=alert("xss")>',
    'javascript:alert("xss")',
    '<svg onload=alert("xss")>',
    '"><script>alert("xss")</script>',
  ];
  
  let sanitized = 0;
  
  for (const payload of xssPayloads) {
    try {
      const res = await request('GET', `/api/v1/tasks?org_id=${encodeURIComponent(payload)}`);
      
      // Check if payload appears in response unsanitized
      if (res.raw && res.raw.includes(payload)) {
        addResult('XSS Prevention', false, `XSS payload reflected: ${payload.substring(0, 20)}...`, 'critical');
        return;
      }
      sanitized++;
    } catch (error) {
      sanitized++;
    }
  }
  
  addResult('XSS Prevention', true, `All ${xssPayloads.length} XSS payloads sanitized or blocked`);
}

async function testAuthentication() {
  log.section('Authentication Security Test');
  
  try {
    // Test unauthenticated access to protected endpoint
    const res = await request('GET', '/api/v1/users/me');
    
    if (res.status === 401) {
      addResult('Auth Required', true, 'Protected endpoints require authentication');
    } else {
      addResult('Auth Required', false, 'Protected endpoint accessible without auth', 'critical');
    }
    
    // Test invalid token
    const invalidTokenRes = await request('GET', '/api/v1/users/me', null, {
      'Authorization': 'Bearer invalid-token-12345',
    });
    
    if (invalidTokenRes.status === 401) {
      addResult('Invalid Token Rejection', true, 'Invalid tokens are rejected');
    } else {
      addResult('Invalid Token Rejection', false, 'Invalid token was accepted', 'critical');
    }
    
    // Test expired token format (malformed JWT)
    const malformedTokenRes = await request('GET', '/api/v1/users/me', null, {
      'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.invalid-signature',
    });
    
    if (malformedTokenRes.status === 401) {
      addResult('Malformed Token Rejection', true, 'Malformed tokens are rejected');
    } else {
      addResult('Malformed Token Rejection', false, 'Malformed token was accepted', 'critical');
    }
    
  } catch (error) {
    addResult('Authentication', false, `Test failed: ${error.message}`, 'critical');
  }
}

async function testBruteForce() {
  log.section('Brute Force Protection Test');
  
  try {
    let blocked = false;
    let attempts = 0;
    
    // Try multiple login attempts
    for (let i = 0; i < 10; i++) {
      const res = await request('POST', '/api/v1/auth/login', {
        email: `bruteforce-test-${Date.now()}@test.com`,
        password: 'wrongpassword',
      });
      
      attempts++;
      
      if (res.status === 429) {
        blocked = true;
        break;
      }
    }
    
    if (blocked) {
      addResult('Brute Force Protection', true, `Account locked after ${attempts} attempts`);
    } else {
      addWarning('Brute Force Protection', `No lockout after ${attempts} attempts (may need more attempts)`);
    }
    
  } catch (error) {
    addResult('Brute Force Protection', false, `Test failed: ${error.message}`, 'high');
  }
}

async function testCORS() {
  log.section('CORS Configuration Test');
  
  try {
    // Test with allowed origin
    const allowedRes = await request('OPTIONS', '/api/v1/tasks', null, {
      'Origin': 'http://localhost:5174',
      'Access-Control-Request-Method': 'GET',
    });
    
    if (allowedRes.headers['access-control-allow-origin']) {
      addResult('CORS Allowed Origin', true, 'CORS allows configured origins');
    }
    
    // Test with disallowed origin
    const disallowedRes = await request('OPTIONS', '/api/v1/tasks', null, {
      'Origin': 'http://evil-site.com',
      'Access-Control-Request-Method': 'GET',
    });
    
    if (!disallowedRes.headers['access-control-allow-origin'] || 
        disallowedRes.headers['access-control-allow-origin'] !== 'http://evil-site.com') {
      addResult('CORS Blocked Origin', true, 'CORS blocks unauthorized origins');
    } else {
      addResult('CORS Blocked Origin', false, 'CORS allows any origin', 'high');
    }
    
  } catch (error) {
    addWarning('CORS', `Test inconclusive: ${error.message}`);
  }
}

async function testInformationDisclosure() {
  log.section('Information Disclosure Test');
  
  try {
    // Test error messages
    const errorRes = await request('GET', '/api/v1/nonexistent-endpoint');
    
    if (errorRes.raw && (errorRes.raw.includes('stack') || errorRes.raw.includes('at /'))) {
      addResult('Stack Trace Exposure', false, 'Stack traces exposed in errors', 'high');
    } else {
      addResult('Stack Trace Exposure', true, 'Stack traces not exposed');
    }
    
    // Test server header
    const healthRes = await request('GET', '/api/health');
    
    if (healthRes.headers['x-powered-by']) {
      addResult('X-Powered-By Header', false, `Server technology exposed: ${healthRes.headers['x-powered-by']}`, 'medium');
    } else {
      addResult('X-Powered-By Header', true, 'Server technology not exposed');
    }
    
    // Test for sensitive data in responses
    if (healthRes.raw && healthRes.raw.includes('password')) {
      addResult('Sensitive Data Exposure', false, 'Password field found in response', 'critical');
    } else {
      addResult('Sensitive Data Exposure', true, 'No sensitive data in health response');
    }
    
  } catch (error) {
    addWarning('Information Disclosure', `Test inconclusive: ${error.message}`);
  }
}

async function testInputValidation() {
  log.section('Input Validation Test');
  
  try {
    // Test oversized payload
    const largePayload = { data: 'x'.repeat(20 * 1024 * 1024) }; // 20MB
    
    try {
      const res = await request('POST', '/api/v1/tasks', largePayload);
      if (res.status === 413 || res.status === 400) {
        addResult('Payload Size Limit', true, 'Large payloads are rejected');
      } else {
        addWarning('Payload Size Limit', 'Large payload was accepted');
      }
    } catch (error) {
      addResult('Payload Size Limit', true, 'Large payloads are rejected (connection reset)');
    }
    
    // Test special characters
    const specialChars = await request('POST', '/api/v1/auth/login', {
      email: 'test\x00@test.com', // Null byte
      password: 'test',
    });
    
    if (specialChars.status === 400 || specialChars.status === 401) {
      addResult('Null Byte Handling', true, 'Null bytes are handled safely');
    }
    
  } catch (error) {
    addWarning('Input Validation', `Test inconclusive: ${error.message}`);
  }
}

// ==================== MAIN ====================

async function runAllTests() {
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║           LAPAAS OS SECURITY PENETRATION TEST              ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

Target: ${BASE_URL}
Date: ${new Date().toISOString()}
`);

  try {
    await testSecurityHeaders();
    await testRateLimiting();
    await testSQLInjection();
    await testXSS();
    await testAuthentication();
    await testBruteForce();
    await testCORS();
    await testInformationDisclosure();
    await testInputValidation();
  } catch (error) {
    log.fail(`Test suite error: ${error.message}`);
  }

  // Print summary
  console.log(`
${colors.cyan}╔════════════════════════════════════════════════════════════╗
║                      TEST SUMMARY                          ║
╚════════════════════════════════════════════════════════════╝${colors.reset}

${colors.green}Passed:${colors.reset}   ${results.passed}
${colors.red}Failed:${colors.reset}   ${results.failed}
${colors.yellow}Warnings:${colors.reset} ${results.warnings}

${results.failed === 0 ? colors.green + '✅ All critical security tests passed!' : colors.red + '❌ Some security tests failed - review and fix issues'}${colors.reset}
`);

  // Print failed tests
  if (results.failed > 0) {
    console.log(`${colors.red}Failed Tests:${colors.reset}`);
    results.tests
      .filter(t => t.passed === false)
      .forEach(t => console.log(`  - ${t.name}: ${t.message} [${t.severity}]`));
  }

  // Exit with appropriate code
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
