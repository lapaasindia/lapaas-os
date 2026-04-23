import nodemailer from 'nodemailer';

// SMTP Configuration
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // TLS
  auth: {
    user: 'noreply@lapaas.in',
    pass: 'uguxrfgsycnrslgy',
  },
});

// Email templates
const emailTemplates = {
  verifyEmail: (code: string, email: string) => ({
    subject: 'Verify Your Lapaas OS Email',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #A2D18C 0%, #20510A 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Lapaas OS</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Verify Your Email</h2>
          <p style="color: #666; font-size: 16px;">
            Thank you for signing up for Lapaas OS! Please verify your email address by entering the code below:
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0; border: 2px solid #A2D18C;">
            <h1 style="color: #A2D18C; letter-spacing: 2px; margin: 0; font-size: 32px; font-weight: bold;">${code}</h1>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 24 hours. If you didn't request this verification, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 Lapaas OS. All rights reserved.<br>
            <a href="https://lapaas.in" style="color: #A2D18C; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </div>
    `,
  }),

  passwordReset: (resetLink: string, email: string) => ({
    subject: 'Reset Your Lapaas OS Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #A2D18C 0%, #20510A 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Lapaas OS</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Reset Your Password</h2>
          <p style="color: #666; font-size: 16px;">
            We received a request to reset your password. Click the button below to create a new password:
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background: #A2D18C; color: #0A3900; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            Or copy and paste this link in your browser:<br>
            <code style="background: white; padding: 10px; border-radius: 4px; display: block; margin: 10px 0; word-break: break-all; color: #A2D18C;">
              ${resetLink}
            </code>
          </p>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't request a password reset, please ignore this email.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 Lapaas OS. All rights reserved.<br>
            <a href="https://lapaas.in" style="color: #A2D18C; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (firstName: string, email: string) => ({
    subject: 'Welcome to Lapaas OS!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #A2D18C 0%, #20510A 100%); padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: white; margin: 0;">Lapaas OS</h1>
        </div>
        <div style="background: #f5f5f5; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Welcome, ${firstName}!</h2>
          <p style="color: #666; font-size: 16px;">
            Your account has been successfully created. You can now log in to Lapaas OS and start building your SaaS business.
          </p>
          <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #A2D18C;">
            <h3 style="color: #A2D18C; margin-top: 0;">Getting Started</h3>
            <ul style="color: #666; line-height: 1.8;">
              <li>Complete your profile</li>
              <li>Set up your organization</li>
              <li>Explore the dashboard</li>
              <li>Configure your settings</li>
            </ul>
          </div>
          <p style="color: #666; font-size: 14px;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
          <p style="color: #999; font-size: 12px; margin: 0;">
            © 2025 Lapaas OS. All rights reserved.<br>
            <a href="https://lapaas.in" style="color: #A2D18C; text-decoration: none;">Visit our website</a>
          </p>
        </div>
      </div>
    `,
  }),
};

// Send email function
export const sendEmail = async (
  to: string,
  templateType: 'verifyEmail' | 'passwordReset' | 'welcomeEmail',
  data: any
) => {
  try {
    let emailContent;

    switch (templateType) {
      case 'verifyEmail':
        emailContent = emailTemplates.verifyEmail(data.code, to);
        break;
      case 'passwordReset':
        emailContent = emailTemplates.passwordReset(data.resetLink, to);
        break;
      case 'welcomeEmail':
        emailContent = emailTemplates.welcomeEmail(data.firstName, to);
        break;
      default:
        throw new Error('Unknown email template');
    }

    const mailOptions = {
      from: 'noreply@lapaas.in',
      to,
      ...emailContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return { success: false, error: error.message };
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log('Email service is ready to send emails');
    return { success: true };
  } catch (error: any) {
    console.error('Email service verification failed:', error);
    return { success: false, error: error.message };
  }
};
