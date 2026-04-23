/**
 * HTTPS Configuration for Lapaas OS
 * 
 * This file provides HTTPS server configuration for production deployment.
 * 
 * Usage:
 * 1. Obtain SSL certificates (Let's Encrypt recommended)
 * 2. Place certificates in /certs directory
 * 3. Set HTTPS_ENABLED=true in .env
 * 4. Restart server
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

/**
 * HTTPS Configuration
 */
const httpsConfig = {
  // Enable/disable HTTPS
  enabled: process.env.HTTPS_ENABLED === 'true',
  
  // Port for HTTPS (default 443)
  port: parseInt(process.env.HTTPS_PORT) || 443,
  
  // Port for HTTP redirect (default 80)
  httpPort: parseInt(process.env.HTTP_PORT) || 80,
  
  // Certificate paths
  certPath: process.env.SSL_CERT_PATH || path.join(__dirname, 'certs', 'cert.pem'),
  keyPath: process.env.SSL_KEY_PATH || path.join(__dirname, 'certs', 'key.pem'),
  caPath: process.env.SSL_CA_PATH || path.join(__dirname, 'certs', 'ca.pem'),
  
  // SSL options
  options: {
    // Minimum TLS version (TLS 1.2+)
    minVersion: 'TLSv1.2',
    
    // Cipher suites (secure defaults)
    ciphers: [
      'ECDHE-ECDSA-AES128-GCM-SHA256',
      'ECDHE-RSA-AES128-GCM-SHA256',
      'ECDHE-ECDSA-AES256-GCM-SHA384',
      'ECDHE-RSA-AES256-GCM-SHA384',
      'DHE-RSA-AES128-GCM-SHA256',
      'DHE-RSA-AES256-GCM-SHA384',
    ].join(':'),
    
    // Honor server cipher order
    honorCipherOrder: true,
  },
};

/**
 * Create HTTPS server
 */
const createHttpsServer = (app) => {
  if (!httpsConfig.enabled) {
    console.log('ℹ️  HTTPS is disabled. Set HTTPS_ENABLED=true in .env to enable.');
    return null;
  }
  
  // Check if certificates exist
  if (!fs.existsSync(httpsConfig.certPath)) {
    console.error(`❌ SSL certificate not found: ${httpsConfig.certPath}`);
    console.log('   Generate certificates with: npm run generate-certs');
    return null;
  }
  
  if (!fs.existsSync(httpsConfig.keyPath)) {
    console.error(`❌ SSL key not found: ${httpsConfig.keyPath}`);
    return null;
  }
  
  try {
    const options = {
      ...httpsConfig.options,
      cert: fs.readFileSync(httpsConfig.certPath),
      key: fs.readFileSync(httpsConfig.keyPath),
    };
    
    // Add CA certificate if exists
    if (fs.existsSync(httpsConfig.caPath)) {
      options.ca = fs.readFileSync(httpsConfig.caPath);
    }
    
    const server = https.createServer(options, app);
    
    console.log(`🔒 HTTPS server created`);
    
    return server;
  } catch (error) {
    console.error('❌ Failed to create HTTPS server:', error.message);
    return null;
  }
};

/**
 * Create HTTP to HTTPS redirect server
 */
const createHttpRedirectServer = () => {
  if (!httpsConfig.enabled) {
    return null;
  }
  
  const redirectApp = (req, res) => {
    const host = req.headers.host?.replace(/:\d+$/, '') || 'localhost';
    const redirectUrl = `https://${host}:${httpsConfig.port}${req.url}`;
    
    res.writeHead(301, { Location: redirectUrl });
    res.end();
  };
  
  const server = http.createServer(redirectApp);
  
  return server;
};

/**
 * Start HTTPS server with HTTP redirect
 */
const startHttpsServer = (app, callback) => {
  const httpsServer = createHttpsServer(app);
  
  if (!httpsServer) {
    // Fall back to HTTP only
    return null;
  }
  
  // Start HTTPS server
  httpsServer.listen(httpsConfig.port, () => {
    console.log(`🔒 HTTPS Server running on https://localhost:${httpsConfig.port}`);
    
    // Start HTTP redirect server
    const httpRedirect = createHttpRedirectServer();
    if (httpRedirect) {
      httpRedirect.listen(httpsConfig.httpPort, () => {
        console.log(`↪️  HTTP redirect running on http://localhost:${httpsConfig.httpPort}`);
      });
    }
    
    if (callback) callback(httpsServer);
  });
  
  return httpsServer;
};

/**
 * Generate self-signed certificates for development
 * Run: node -e "require('./https-config').generateDevCerts()"
 */
const generateDevCerts = () => {
  const { execSync } = require('child_process');
  const certsDir = path.join(__dirname, 'certs');
  
  // Create certs directory
  if (!fs.existsSync(certsDir)) {
    fs.mkdirSync(certsDir, { recursive: true });
  }
  
  const keyPath = path.join(certsDir, 'key.pem');
  const certPath = path.join(certsDir, 'cert.pem');
  
  console.log('🔐 Generating self-signed certificates for development...');
  
  try {
    // Generate private key and self-signed certificate
    execSync(`openssl req -x509 -newkey rsa:4096 -keyout ${keyPath} -out ${certPath} -days 365 -nodes -subj "/CN=localhost"`, {
      stdio: 'inherit',
    });
    
    console.log('✅ Certificates generated successfully!');
    console.log(`   Key: ${keyPath}`);
    console.log(`   Cert: ${certPath}`);
    console.log('\n⚠️  These are self-signed certificates for development only.');
    console.log('   For production, use Let\'s Encrypt or a trusted CA.');
  } catch (error) {
    console.error('❌ Failed to generate certificates:', error.message);
    console.log('   Make sure OpenSSL is installed.');
  }
};

module.exports = {
  httpsConfig,
  createHttpsServer,
  createHttpRedirectServer,
  startHttpsServer,
  generateDevCerts,
};
