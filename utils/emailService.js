import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter for sending emails
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: 'gmail', // You can change this to other email services
    auth: {
      user: process.env.EMAIL_USER || 'your-email@gmail.com', // Add your email
      pass: process.env.EMAIL_PASSWORD || 'your-app-password' // Add your app password
    }
  });
};

// Generate 6-digit verification code
export const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
export const sendVerificationEmail = async (email, code, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@fabricflow.com',
      to: email,
      subject: 'FabricFlow - Password Reset Verification Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Reset - FabricFlow</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              padding: 20px; 
              border-radius: 10px; 
              margin-top: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #005A54, #EF6869); 
              color: white; 
              padding: 20px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
              margin: -20px -20px 20px -20px; 
            }
            .code-container { 
              background: #f8f9fa; 
              border: 2px dashed #005A54; 
              padding: 20px; 
              text-align: center; 
              margin: 20px 0; 
              border-radius: 8px; 
            }
            .verification-code { 
              font-size: 32px; 
              font-weight: bold; 
              color: #005A54; 
              letter-spacing: 5px; 
              margin: 10px 0; 
            }
            .warning { 
              background: #fff3cd; 
              border: 1px solid #ffeaa7; 
              color: #856404; 
              padding: 15px; 
              border-radius: 5px; 
              margin: 20px 0; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
            }
            .button {
              display: inline-block;
              background: #005A54;
              color: white;
              padding: 12px 30px;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏭 FabricFlow</h1>
              <h2>Password Reset Request</h2>
            </div>
            
            <p>Hello ${userName},</p>
            
            <p>We received a request to reset your password for your FabricFlow account. Use the verification code below to proceed with resetting your password:</p>
            
            <div class="code-container">
              <p>Your verification code is:</p>
              <div class="verification-code">${code}</div>
              <p><small>This code will expire in 10 minutes</small></p>
            </div>
            
            <div class="warning">
              <strong>⚠️ Important Security Information:</strong>
              <ul>
                <li>This code is valid for only 10 minutes</li>
                <li>Never share this code with anyone</li>
                <li>If you didn't request this reset, please ignore this email</li>
                <li>Your password will remain unchanged unless you complete the reset process</li>
              </ul>
            </div>
            
            <p>If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.</p>
            
            <div class="footer">
              <p>
                <strong>FabricFlow - Apparel Management System</strong><br>
                This is an automated message, please do not reply to this email.
              </p>
              <p>
                <small>© 2025 FabricFlow. All rights reserved.</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Verification email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending verification email:', error);
    return { success: false, error: error.message };
  }
};

// Send password reset confirmation email
export const sendPasswordResetConfirmation = async (email, userName = 'User') => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@fabricflow.com',
      to: email,
      subject: 'FabricFlow - Password Reset Successful',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <title>Password Reset Successful - FabricFlow</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              line-height: 1.6; 
              margin: 0; 
              padding: 0; 
              background-color: #f4f4f4; 
            }
            .container { 
              max-width: 600px; 
              margin: 0 auto; 
              background: white; 
              padding: 20px; 
              border-radius: 10px; 
              margin-top: 20px; 
            }
            .header { 
              background: linear-gradient(135deg, #005A54, #28a745); 
              color: white; 
              padding: 20px; 
              text-align: center; 
              border-radius: 10px 10px 0 0; 
              margin: -20px -20px 20px -20px; 
            }
            .success-icon { 
              font-size: 48px; 
              margin-bottom: 10px; 
            }
            .footer { 
              text-align: center; 
              margin-top: 30px; 
              padding-top: 20px; 
              border-top: 1px solid #eee; 
              color: #666; 
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="success-icon">✅</div>
              <h1>🏭 FabricFlow</h1>
              <h2>Password Reset Successful</h2>
            </div>
            
            <p>Hello ${userName},</p>
            
            <p>Your FabricFlow account password has been successfully reset. You can now log in with your new password.</p>
            
            <p><strong>What's next?</strong></p>
            <ul>
              <li>Log in to your account with your new password</li>
              <li>Make sure to keep your password secure</li>
              <li>Consider enabling two-factor authentication for added security</li>
            </ul>
            
            <p>If you didn't make this change or if you have any concerns about your account security, please contact our support team immediately.</p>
            
            <div class="footer">
              <p>
                <strong>FabricFlow - Apparel Management System</strong><br>
                This is an automated message, please do not reply to this email.
              </p>
              <p>
                <small>© 2025 FabricFlow. All rights reserved.</small>
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Password reset confirmation email sent successfully:', result.messageId);
    return { success: true, messageId: result.messageId };
    
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return { success: false, error: error.message };
  }
};
