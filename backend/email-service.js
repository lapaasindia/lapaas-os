const nodemailer = require('nodemailer');

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'noreply@lapaas.in',
    pass: 'uguxrfgsycnrslgy'
  }
});

// Verify SMTP connection
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP Connection Error:', error);
  } else {
    console.log('✅ SMTP Server is ready to send emails');
  }
});

/**
 * Send team invitation email
 */
async function sendTeamInvitation(to, teamName, email, password, isNewUser) {
  const subject = isNewUser 
    ? `Welcome to ${teamName} - Your Account Has Been Created`
    : `You've Been Added to ${teamName}`;

  const html = isNewUser ? `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .credentials { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Welcome to Lapaas OS!</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>You've been invited to join the <strong>${teamName}</strong> team on Lapaas OS. An account has been created for you.</p>
          
          <div class="credentials">
            <h3>📧 Your Login Credentials:</h3>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Temporary Password:</strong> <code style="background: #f0f0f0; padding: 5px 10px; border-radius: 3px; font-size: 16px;">${password}</code></p>
          </div>

          <p><strong>⚠️ Important:</strong> Please change your password after your first login for security.</p>

          <a href="http://localhost:5174/login" class="button">Login to Lapaas OS</a>

          <p>If you have any questions, feel free to reach out to your team administrator.</p>
        </div>
        <div class="footer">
          <p>This is an automated email from Lapaas OS. Please do not reply to this email.</p>
          <p>&copy; 2025 Lapaas OS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  ` : `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>👥 New Team Assignment!</h1>
        </div>
        <div class="content">
          <p>Hi there!</p>
          <p>You've been added to the <strong>${teamName}</strong> team on Lapaas OS.</p>
          
          <p>You can now collaborate with your team members and access team resources.</p>

          <a href="http://localhost:5174/login" class="button">Go to Lapaas OS</a>

          <p>If you have any questions, feel free to reach out to your team administrator.</p>
        </div>
        <div class="footer">
          <p>This is an automated email from Lapaas OS. Please do not reply to this email.</p>
          <p>&copy; 2025 Lapaas OS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: '"Lapaas OS" <noreply@lapaas.in>',
    to: to,
    subject: subject,
    html: html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Invitation email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending invitation email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Send password reset email
 */
async function sendPasswordResetEmail(to, resetToken, userName) {
  const resetLink = `http://localhost:5174/reset-password?token=${resetToken}`;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 5px; margin: 20px 0; }
        .token { background: white; padding: 20px; border-left: 4px solid #667eea; margin: 20px 0; font-family: monospace; font-size: 18px; letter-spacing: 2px; text-align: center; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔐 Password Reset Request</h1>
        </div>
        <div class="content">
          <p>Hi ${userName || 'there'}!</p>
          <p>We received a request to reset your password for your Lapaas OS account.</p>
          
          <p>Click the button below to reset your password:</p>
          <a href="${resetLink}" class="button">Reset Password</a>

          <p>Or copy and paste this link into your browser:</p>
          <div class="token">${resetLink}</div>

          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul>
              <li>This link will expire in 1 hour</li>
              <li>If you didn't request this reset, please ignore this email</li>
              <li>Your password will not change until you create a new one</li>
            </ul>
          </div>
        </div>
        <div class="footer">
          <p>This is an automated email from Lapaas OS. Please do not reply to this email.</p>
          <p>&copy; 2025 Lapaas OS. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const mailOptions = {
    from: '"Lapaas OS" <noreply@lapaas.in>',
    to: to,
    subject: 'Password Reset Request - Lapaas OS',
    html: html
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Generate random password
 */
function generateRandomPassword(length = 12) {
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*';
  
  const allChars = uppercase + lowercase + numbers + symbols;
  let password = '';
  
  // Ensure at least one of each type
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];
  
  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('');
}

module.exports = {
  sendTeamInvitation,
  sendPasswordResetEmail,
  generateRandomPassword
};
