/**
 * Security Routes for Lapaas OS
 * - 2FA Setup and Verification
 * - Session Management
 * - Security Settings
 * - Audit Logs
 */

const {
  generate2FASecret,
  generate2FAQRCode,
  verify2FAToken,
  generateBackupCodes,
  hashBackupCode,
  logSecurityEvent,
  logAuditEvent,
  SecurityEventTypes,
  getUserSessions,
  revokeAllUserSessions,
  destroySession,
  isAccountLocked,
  clearFailedLogins,
  recordFailedLogin,
} = require('./security-advanced');

const bcrypt = require('bcryptjs');

module.exports = (app, db, authMiddleware) => {
  
  // ==================== 2FA ROUTES ====================
  
  /**
   * GET /api/v1/security/2fa/setup
   * Initialize 2FA setup - returns secret and QR code
   */
  app.get('/api/v1/security/2fa/setup', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const userEmail = req.user.email;
      
      // Check if 2FA is already enabled
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (user?.twoFactorEnabled) {
        return res.status(400).json({
          error: '2FA Already Enabled',
          message: 'Two-factor authentication is already enabled for this account',
        });
      }
      
      // Generate secret
      const { secret, otpauth_url } = generate2FASecret(userEmail);
      
      // Generate QR code
      const qrCode = await generate2FAQRCode(otpauth_url);
      
      // Store secret temporarily (not enabled yet)
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET twoFactorSecret = ?, updatedAt = ? WHERE id = ?',
          [secret, new Date().toISOString(), userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      // Generate backup codes
      const backupCodes = generateBackupCodes(10);
      
      res.json({
        success: true,
        data: {
          secret,
          qrCode,
          backupCodes,
          message: 'Scan the QR code with your authenticator app, then verify with a code to enable 2FA',
        },
      });
      
    } catch (error) {
      console.error('2FA setup error:', error);
      res.status(500).json({
        error: 'Setup Failed',
        message: 'Failed to initialize 2FA setup',
      });
    }
  });
  
  /**
   * POST /api/v1/security/2fa/enable
   * Verify and enable 2FA
   */
  app.post('/api/v1/security/2fa/enable', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { token, backupCodes } = req.body;
      
      if (!token) {
        return res.status(400).json({
          error: 'Token Required',
          message: 'Please provide the 6-digit code from your authenticator app',
        });
      }
      
      // Get user's secret
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!user?.twoFactorSecret) {
        return res.status(400).json({
          error: 'Setup Required',
          message: 'Please complete 2FA setup first',
        });
      }
      
      // Verify token
      const isValid = verify2FAToken(user.twoFactorSecret, token);
      
      if (!isValid) {
        logSecurityEvent(SecurityEventTypes.TWO_FACTOR_FAILURE, {
          userId,
          action: 'enable',
          ip: req.ip,
        });
        
        return res.status(400).json({
          error: 'Invalid Token',
          message: 'The verification code is incorrect. Please try again.',
        });
      }
      
      // Hash backup codes for storage
      const hashedBackupCodes = backupCodes?.map(code => hashBackupCode(code)) || [];
      
      // Enable 2FA
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET twoFactorEnabled = 1, twoFactorBackupCodes = ?, updatedAt = ? WHERE id = ?',
          [JSON.stringify(hashedBackupCodes), new Date().toISOString(), userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      logSecurityEvent(SecurityEventTypes.TWO_FACTOR_ENABLED, {
        userId,
        ip: req.ip,
      });
      
      logAuditEvent('2FA_ENABLED', {
        userId,
        ip: req.ip,
      });
      
      res.json({
        success: true,
        message: 'Two-factor authentication has been enabled successfully',
      });
      
    } catch (error) {
      console.error('2FA enable error:', error);
      res.status(500).json({
        error: 'Enable Failed',
        message: 'Failed to enable 2FA',
      });
    }
  });
  
  /**
   * POST /api/v1/security/2fa/verify
   * Verify 2FA token during login
   */
  app.post('/api/v1/security/2fa/verify', async (req, res) => {
    try {
      const { userId, token, backupCode } = req.body;
      
      if (!userId || (!token && !backupCode)) {
        return res.status(400).json({
          error: 'Invalid Request',
          message: 'User ID and verification code are required',
        });
      }
      
      // Get user
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!user) {
        return res.status(404).json({
          error: 'User Not Found',
          message: 'User not found',
        });
      }
      
      let verified = false;
      
      // Try TOTP token first
      if (token) {
        verified = verify2FAToken(user.twoFactorSecret, token);
      }
      
      // Try backup code if TOTP failed
      if (!verified && backupCode) {
        const hashedCode = hashBackupCode(backupCode);
        const storedCodes = JSON.parse(user.twoFactorBackupCodes || '[]');
        
        const codeIndex = storedCodes.indexOf(hashedCode);
        if (codeIndex !== -1) {
          verified = true;
          
          // Remove used backup code
          storedCodes.splice(codeIndex, 1);
          await new Promise((resolve, reject) => {
            db.run(
              'UPDATE users SET twoFactorBackupCodes = ?, updatedAt = ? WHERE id = ?',
              [JSON.stringify(storedCodes), new Date().toISOString(), userId],
              (err) => {
                if (err) reject(err);
                else resolve();
              }
            );
          });
        }
      }
      
      if (!verified) {
        logSecurityEvent(SecurityEventTypes.TWO_FACTOR_FAILURE, {
          userId,
          ip: req.ip,
        });
        
        return res.status(401).json({
          error: 'Verification Failed',
          message: 'Invalid verification code',
        });
      }
      
      logSecurityEvent(SecurityEventTypes.LOGIN_SUCCESS, {
        userId,
        ip: req.ip,
        twoFactorUsed: true,
      });
      
      res.json({
        success: true,
        message: '2FA verification successful',
        verified: true,
      });
      
    } catch (error) {
      console.error('2FA verify error:', error);
      res.status(500).json({
        error: 'Verification Failed',
        message: 'Failed to verify 2FA',
      });
    }
  });
  
  /**
   * POST /api/v1/security/2fa/disable
   * Disable 2FA (requires password confirmation)
   */
  app.post('/api/v1/security/2fa/disable', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { password, token } = req.body;
      
      if (!password) {
        return res.status(400).json({
          error: 'Password Required',
          message: 'Please confirm your password to disable 2FA',
        });
      }
      
      // Get user
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      // Verify password
      const passwordValid = await bcrypt.compare(password, user.password_hash);
      if (!passwordValid) {
        return res.status(401).json({
          error: 'Invalid Password',
          message: 'Password is incorrect',
        });
      }
      
      // Verify 2FA token if enabled
      if (user.twoFactorEnabled && token) {
        const tokenValid = verify2FAToken(user.twoFactorSecret, token);
        if (!tokenValid) {
          return res.status(401).json({
            error: 'Invalid Token',
            message: '2FA verification code is incorrect',
          });
        }
      }
      
      // Disable 2FA
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET twoFactorEnabled = 0, twoFactorSecret = NULL, twoFactorBackupCodes = NULL, updatedAt = ? WHERE id = ?',
          [new Date().toISOString(), userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      logSecurityEvent(SecurityEventTypes.TWO_FACTOR_DISABLED, {
        userId,
        ip: req.ip,
      });
      
      logAuditEvent('2FA_DISABLED', {
        userId,
        ip: req.ip,
      });
      
      res.json({
        success: true,
        message: 'Two-factor authentication has been disabled',
      });
      
    } catch (error) {
      console.error('2FA disable error:', error);
      res.status(500).json({
        error: 'Disable Failed',
        message: 'Failed to disable 2FA',
      });
    }
  });
  
  /**
   * GET /api/v1/security/2fa/backup-codes
   * Generate new backup codes
   */
  app.get('/api/v1/security/2fa/backup-codes', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if 2FA is enabled
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      if (!user?.twoFactorEnabled) {
        return res.status(400).json({
          error: '2FA Not Enabled',
          message: 'Two-factor authentication must be enabled first',
        });
      }
      
      // Generate new backup codes
      const backupCodes = generateBackupCodes(10);
      const hashedCodes = backupCodes.map(code => hashBackupCode(code));
      
      // Store hashed codes
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET twoFactorBackupCodes = ?, updatedAt = ? WHERE id = ?',
          [JSON.stringify(hashedCodes), new Date().toISOString(), userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      logAuditEvent('BACKUP_CODES_REGENERATED', {
        userId,
        ip: req.ip,
      });
      
      res.json({
        success: true,
        data: {
          backupCodes,
          message: 'New backup codes generated. Store them securely - they will only be shown once.',
        },
      });
      
    } catch (error) {
      console.error('Backup codes error:', error);
      res.status(500).json({
        error: 'Generation Failed',
        message: 'Failed to generate backup codes',
      });
    }
  });
  
  // ==================== SESSION MANAGEMENT ROUTES ====================
  
  /**
   * GET /api/v1/security/sessions
   * Get all active sessions for current user
   */
  app.get('/api/v1/security/sessions', authMiddleware, (req, res) => {
    try {
      const userId = req.user.id;
      const sessions = getUserSessions(userId);
      
      res.json({
        success: true,
        data: sessions,
        total: sessions.length,
      });
      
    } catch (error) {
      console.error('Get sessions error:', error);
      res.status(500).json({
        error: 'Failed',
        message: 'Failed to get sessions',
      });
    }
  });
  
  /**
   * DELETE /api/v1/security/sessions/:sessionId
   * Revoke a specific session
   */
  app.delete('/api/v1/security/sessions/:sessionId', authMiddleware, (req, res) => {
    try {
      const { sessionId } = req.params;
      
      destroySession(sessionId);
      
      logAuditEvent('SESSION_REVOKED', {
        userId: req.user.id,
        revokedSessionId: sessionId,
        ip: req.ip,
      });
      
      res.json({
        success: true,
        message: 'Session revoked successfully',
      });
      
    } catch (error) {
      console.error('Revoke session error:', error);
      res.status(500).json({
        error: 'Failed',
        message: 'Failed to revoke session',
      });
    }
  });
  
  /**
   * POST /api/v1/security/sessions/revoke-all
   * Revoke all sessions except current
   */
  app.post('/api/v1/security/sessions/revoke-all', authMiddleware, (req, res) => {
    try {
      const userId = req.user.id;
      const currentSessionId = req.headers['x-session-id'];
      
      const revokedSessions = revokeAllUserSessions(userId, currentSessionId);
      
      logAuditEvent('ALL_SESSIONS_REVOKED', {
        userId,
        revokedCount: revokedSessions.length,
        ip: req.ip,
      });
      
      res.json({
        success: true,
        message: `${revokedSessions.length} sessions revoked`,
        revokedCount: revokedSessions.length,
      });
      
    } catch (error) {
      console.error('Revoke all sessions error:', error);
      res.status(500).json({
        error: 'Failed',
        message: 'Failed to revoke sessions',
      });
    }
  });
  
  // ==================== SECURITY SETTINGS ROUTES ====================
  
  /**
   * GET /api/v1/security/settings
   * Get security settings for current user
   */
  app.get('/api/v1/security/settings', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      const sessions = getUserSessions(userId);
      
      res.json({
        success: true,
        data: {
          twoFactorEnabled: !!user?.twoFactorEnabled,
          backupCodesRemaining: user?.twoFactorBackupCodes ? JSON.parse(user.twoFactorBackupCodes).length : 0,
          activeSessions: sessions.length,
          lastPasswordChange: user?.passwordChangedAt || user?.createdAt,
          accountCreated: user?.createdAt,
        },
      });
      
    } catch (error) {
      console.error('Get security settings error:', error);
      res.status(500).json({
        error: 'Failed',
        message: 'Failed to get security settings',
      });
    }
  });
  
  /**
   * POST /api/v1/security/change-password
   * Change password with security logging
   */
  app.post('/api/v1/security/change-password', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          error: 'Invalid Request',
          message: 'Current password and new password are required',
        });
      }
      
      // Validate new password strength
      if (newPassword.length < 8) {
        return res.status(400).json({
          error: 'Weak Password',
          message: 'Password must be at least 8 characters',
        });
      }
      
      // Get user
      const user = await new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE id = ?', [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      // Verify current password
      const passwordValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!passwordValid) {
        logSecurityEvent(SecurityEventTypes.PASSWORD_CHANGE, {
          userId,
          success: false,
          reason: 'Invalid current password',
          ip: req.ip,
        });
        
        return res.status(401).json({
          error: 'Invalid Password',
          message: 'Current password is incorrect',
        });
      }
      
      // Hash new password
      const newPasswordHash = await bcrypt.hash(newPassword, 12);
      
      // Update password
      await new Promise((resolve, reject) => {
        db.run(
          'UPDATE users SET password_hash = ?, passwordChangedAt = ?, updatedAt = ? WHERE id = ?',
          [newPasswordHash, new Date().toISOString(), new Date().toISOString(), userId],
          (err) => {
            if (err) reject(err);
            else resolve();
          }
        );
      });
      
      logSecurityEvent(SecurityEventTypes.PASSWORD_CHANGE, {
        userId,
        success: true,
        ip: req.ip,
      });
      
      logAuditEvent('PASSWORD_CHANGED', {
        userId,
        ip: req.ip,
      });
      
      // Optionally revoke all other sessions
      const revokedSessions = revokeAllUserSessions(userId, req.headers['x-session-id']);
      
      res.json({
        success: true,
        message: 'Password changed successfully',
        sessionsRevoked: revokedSessions.length,
      });
      
    } catch (error) {
      console.error('Change password error:', error);
      res.status(500).json({
        error: 'Failed',
        message: 'Failed to change password',
      });
    }
  });
  
  // ==================== AUDIT LOG ROUTES ====================
  
  /**
   * GET /api/v1/security/audit-log
   * Get audit log for current user (admin can see all)
   */
  app.get('/api/v1/security/audit-log', authMiddleware, async (req, res) => {
    try {
      const userId = req.user.id;
      const userRole = req.user.role;
      const { page = 1, limit = 50, type } = req.query;
      
      // For now, return a placeholder - in production, read from log files or database
      res.json({
        success: true,
        data: [],
        message: 'Audit logs are stored in /logs directory',
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: 0,
        },
      });
      
    } catch (error) {
      console.error('Get audit log error:', error);
      res.status(500).json({
        error: 'Failed',
        message: 'Failed to get audit log',
      });
    }
  });
  
  // ==================== ACCOUNT LOCKOUT STATUS ====================
  
  /**
   * GET /api/v1/security/lockout-status
   * Check if an account is locked (public endpoint for login form)
   */
  app.get('/api/v1/security/lockout-status', (req, res) => {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({
        error: 'Email Required',
        message: 'Email is required',
      });
    }
    
    const lockStatus = isAccountLocked(email);
    
    res.json({
      success: true,
      data: lockStatus,
    });
  });
  
  console.log('✅ Security routes registered');
};
