import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../Model/UserModel.js';
import Employee from '../Model/EmployeeModel.js';
import PasswordReset from '../Model/PasswordResetModel.js';
import { generateVerificationCode, sendVerificationEmail, sendPasswordResetConfirmation } from '../utils/emailService.js';

// Enhanced password validation function
const validatePassword = (password) => {
  const errors = [];
  
  if (!password) {
    return { isValid: false, message: 'Password is required' };
  }
  
  if (password.length < 8) {
    errors.push('Minimum length: 8 characters');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('At least one uppercase letter');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('At least one lowercase letter');
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('At least one number');
  }
  
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push('At least one special character');
  }
  
  // Common passwords check
  const commonPasswords = [
    'password', 'password123', '123456', '123456789', 'qwerty',
    'abc123', 'password1', '12345678', 'welcome', 'admin',
    'letmein', 'monkey', '1234567890', 'sunshine', 'master'
  ];
  
  if (commonPasswords.includes(password.toLowerCase())) {
    errors.push('Avoid common passwords');
  }
  
  if (errors.length > 0) {
    return { isValid: false, message: `Password requirements: ${errors.join(', ')}` };
  }
  
  return { isValid: true, message: 'Password meets all requirements' };
};

// Register user, employee, or admin
const register = async (req, res) => {
  try {
    const { role, password, ...userData } = req.body;
    
    console.log('Registration attempt:', { role, userData });

    // Validate password
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        error: passwordValidation.message
      });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    let newUser;

    if (role === 'user') {
      // Create user with UserModel fields
      const { name, gmail, age, address, phone, gender, dob } = userData;
      
      // Check if user already exists (check both email and gmail fields)
      const existingUser = await User.findOne({ 
        $or: [{ email: gmail }, { gmail: gmail }] 
      });
      if (existingUser) {
        return res.status(400).json({ 
          success: false, 
          error: 'User with this email already exists' 
        });
      }

      newUser = new User({
        name,
        email: gmail, // use email field for consistency
        gmail: gmail, // keep gmail for backward compatibility
        age,
        address,
        phone,
        gender: gender || null, // handle empty string
        dob,
        password: hashedPassword,
        role: 'user'
      });

    } else if (role === 'employee') {
      // Create employee with EmployeeModel fields
      const { 
        empId, 
        empName, 
        empPhone, 
        jobPosition, 
        status, 
        address, 
        emailAddress, 
        dob, 
        gender, 
        age 
      } = userData;

      // Check if employee already exists
      const existingEmployee = await Employee.findOne({ 
        $or: [{ empId }, { emailAddress }] 
      });
      if (existingEmployee) {
        return res.status(400).json({ 
          success: false, 
          error: 'Employee with this ID or email already exists' 
        });
      }

      newUser = new Employee({
        empId,
        empName,
        empPhone,
        jobPosition,
        status: status || 'active',
        address,
        emailAddress,
        dob,
        gender: gender || null, // handle empty string
        age,
        password: hashedPassword,
        role: 'employee'
      });

    } else if (role === 'admin') {
      // Create admin with basic fields
      const { name, gmail } = userData;

      // Check if admin already exists
      const existingAdmin = await User.findOne({ 
        $or: [{ email: gmail }, { gmail: gmail }] 
      });
      if (existingAdmin) {
        return res.status(400).json({ 
          success: false, 
          error: 'Admin with this email already exists' 
        });
      }

      newUser = new User({
        name,
        email: gmail, // use email field for consistency
        gmail, // keep gmail for backward compatibility
        password: hashedPassword,
        role: 'admin'  // Explicitly set admin role
      });

    } else {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid role specified' 
      });
    }

    // Save the user
    await newUser.save();

    // Log for debugging
    console.log('User saved successfully:', {
      id: newUser._id,
      role: newUser.role,
      name: newUser.name || newUser.empName,
      email: newUser.email || newUser.emailAddress
    });

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: newUser._id, 
        role: newUser.role,  // Use the actual saved role from database
        email: newUser.gmail || newUser.emailAddress 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response without password
    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      error: 'Registration failed. Please try again.'
    });
  }
};

// Login user
const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    let user;

    // Find user based on role
    if (role === 'employee') {
      user = await Employee.findOne({ emailAddress: email });
    } else {
      // For both 'user' and 'admin' roles, search in User collection
      user = await User.findOne({ 
        $or: [{ email: email }, { gmail: email }] 
      });
    }

    if (!user) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Verify the user has the correct role (for security)
    if (role && user.role && user.role !== role) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials or role mismatch'
      });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        success: false,
        error: 'Invalid credentials'
      });
    }

    // Generate JWT token using the actual user role from database
    const token = jwt.sign(
      { 
        id: user._id, 
        role: user.role,  // Use the role from database, not from request
        email: user.gmail || user.emailAddress 
      },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    // Return success response without password
    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed. Please try again.'
    });
  }
};

// Logout user (mainly for client-side token removal)
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

// Google OAuth handler
const googleOAuth = async (req, res) => {
  try {
    const { credential, mode } = req.body;
    console.log('Google OAuth request received:', { mode, credentialLength: credential?.length });

    if (!credential) {
      return res.status(400).json({
        success: false,
        error: 'Google credential is required'
      });
    }

    // Test import first
    console.log('Importing Google Auth Library...');
    
    // Import Google Auth Library
    const { OAuth2Client } = await import('google-auth-library');
    console.log('Google Auth Library imported successfully');
    
    const clientId = '837612251712-fi076juj2fr00lo8g3hvqok47i2o8s1r.apps.googleusercontent.com';
    const client = new OAuth2Client(clientId);
    
    console.log('OAuth2Client created with ID:', clientId);
    console.log('Attempting to verify Google token...');
    
    // Verify the Google token
    const ticket = await client.verifyIdToken({
      idToken: credential,
      audience: clientId
    });
    
    const payload = ticket.getPayload();
    const { email, name, given_name, family_name, picture } = payload;
    
    console.log('Google token verified successfully');
    
    console.log('Extracted Google user data:', {
      email,
      name,
      given_name,
      family_name,
      picture
    });

    // Check if user exists in either User or Employee collection
    let existingUser = await User.findOne({ 
      $or: [{ email: email }, { gmail: email }] 
    });
    
    if (!existingUser) {
      existingUser = await Employee.findOne({ 
        $or: [{ emailAddress: email }, { email: email }] 
      });
    }

    if (existingUser) {
      console.log('User found:', existingUser);
      
      // Update user data with Google info if missing
      const updatedFields = {};
      if (!existingUser.firstName && given_name) updatedFields.firstName = given_name;
      if (!existingUser.lastName && family_name) updatedFields.lastName = family_name;
      if (!existingUser.name && name) updatedFields.name = name;
      if (!existingUser.profilePicture && picture) updatedFields.profilePicture = picture;

      if (Object.keys(updatedFields).length > 0) {
        if (existingUser.role === 'employee') {
          await Employee.findByIdAndUpdate(existingUser._id, updatedFields);
        } else {
          await User.findByIdAndUpdate(existingUser._id, updatedFields);
        }
        // Merge updated fields
        Object.assign(existingUser, updatedFields);
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: existingUser._id, 
          email: existingUser.email || existingUser.gmail || existingUser.emailAddress,
          role: existingUser.role 
        },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: '7d' }
      );

      // Prepare user response with consistent field names
      const userResponse = {
        _id: existingUser._id,
        firstName: existingUser.firstName || given_name || '',
        lastName: existingUser.lastName || family_name || '',
        name: existingUser.name || existingUser.empName || name || `${given_name || ''} ${family_name || ''}`.trim(),
        email: existingUser.email || existingUser.gmail || existingUser.emailAddress,
        role: existingUser.role,
        profilePicture: existingUser.profilePicture || picture,
        // Include any other fields that might be needed
        empId: existingUser.empId,
        age: existingUser.age,
        phone: existingUser.phone || existingUser.empPhone,
        address: existingUser.address,
        gender: existingUser.gender
      };

      console.log('Google OAuth successful for existing user:', userResponse);

      return res.status(200).json({
        success: true,
        message: 'Google OAuth login successful',
        user: userResponse,
        token
      });

    } else {
      console.log('User not found, need to create account');
      
      // User doesn't exist, return for role selection
      return res.status(404).json({
        success: false,
        needsRole: true,
        message: 'User not found. Please select your role to create account.',
        userInfo: {
          email,
          firstName: given_name || '',
          lastName: family_name || '',
          name: name || `${given_name || ''} ${family_name || ''}`.trim(),
          profilePicture: picture
        }
      });
    }

  } catch (error) {
    console.error('Google OAuth error details:', {
      message: error.message,
      stack: error.stack,
      code: error.code,
      type: error.constructor.name
    });
    
    let errorMessage = 'Google OAuth authentication failed';
    
    // Handle specific error types
    if (error.message?.includes('Token used too early') || error.message?.includes('Token expired')) {
      errorMessage = 'Google token has expired. Please try signing in again.';
    } else if (error.message?.includes('Invalid token signature')) {
      errorMessage = 'Invalid Google token. Please try signing in again.';
    } else if (error.message?.includes('Audience mismatch')) {
      errorMessage = 'OAuth configuration error. Please contact support.';
    }
    
    res.status(500).json({
      success: false,
      error: errorMessage
    });
  }
};

// Forgot Password - Send verification code
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email is required'
      });
    }

    console.log('Forgot password request for email:', email);

    // Check if user exists in User or Employee collection
    let user = await User.findOne({ 
      $or: [{ email: email }, { gmail: email }] 
    });
    
    let userType = 'user';
    let userId = null;
    let userName = 'User';

    if (user) {
      userId = user._id;
      userName = user.name || user.firstName || 'User';
      userType = user.role || 'user';
    } else {
      // Check Employee collection
      user = await Employee.findOne({ 
        $or: [{ emailAddress: email }, { email: email }] 
      });
      
      if (user) {
        userId = user._id;
        userName = user.empName || user.name || 'Employee';
        userType = user.role || 'employee';
      }
    }

    if (!user) {
      // For security, don't reveal if email exists or not
      return res.status(200).json({
        success: true,
        message: 'If this email is registered, you will receive a verification code shortly.'
      });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();
    
    // Delete any existing password reset requests for this email
    await PasswordReset.deleteMany({ email: email });
    
    // Create new password reset request
    const passwordReset = new PasswordReset({
      email: email,
      verificationCode: verificationCode,
      userType: userType,
      userId: userId
    });
    
    await passwordReset.save();
    
    // Send verification email
    const emailResult = await sendVerificationEmail(email, verificationCode, userName);
    
    if (emailResult.success) {
      console.log('Verification code sent successfully to:', email);
      
      res.status(200).json({
        success: true,
        message: 'Verification code sent to your email. Please check your inbox.'
      });
    } else {
      console.error('Failed to send verification email:', emailResult.error);
      
      // Clean up the password reset request if email failed
      await PasswordReset.deleteOne({ email: email, verificationCode: verificationCode });
      
      res.status(500).json({
        success: false,
        error: 'Failed to send verification email. Please try again.'
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while processing your request. Please try again.'
    });
  }
};

// Verify Reset Code
const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;
    
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        error: 'Email and verification code are required'
      });
    }

    console.log('Verifying reset code for email:', email);

    // Find the password reset request
    const passwordReset = await PasswordReset.findOne({
      email: email,
      verificationCode: code
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code'
      });
    }

    // Check if too many attempts
    if (passwordReset.attempts >= 5) {
      await PasswordReset.deleteOne({ _id: passwordReset._id });
      return res.status(400).json({
        success: false,
        error: 'Too many invalid attempts. Please request a new verification code.'
      });
    }

    // Increment attempts
    passwordReset.attempts += 1;
    
    // Check if code matches
    if (passwordReset.verificationCode !== code) {
      await passwordReset.save();
      return res.status(400).json({
        success: false,
        error: `Invalid verification code. ${5 - passwordReset.attempts} attempts remaining.`
      });
    }

    // Mark as verified
    passwordReset.isVerified = true;
    await passwordReset.save();

    console.log('Verification code verified successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Verification code verified successfully. You can now reset your password.'
    });

  } catch (error) {
    console.error('Verify reset code error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while verifying the code. Please try again.'
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;
    
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Email, verification code, and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      });
    }

    console.log('Resetting password for email:', email);

    // Find and verify the password reset request
    const passwordReset = await PasswordReset.findOne({
      email: email,
      verificationCode: code,
      isVerified: true
    });

    if (!passwordReset) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired verification code. Please start the password reset process again.'
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in the appropriate collection
    let updateResult;
    let userName = 'User';

    if (passwordReset.userType === 'employee') {
      updateResult = await Employee.findByIdAndUpdate(
        passwordReset.userId,
        { password: hashedPassword },
        { new: true }
      );
      userName = updateResult?.empName || updateResult?.name || 'Employee';
    } else {
      updateResult = await User.findByIdAndUpdate(
        passwordReset.userId,
        { password: hashedPassword },
        { new: true }
      );
      userName = updateResult?.name || updateResult?.firstName || 'User';
    }

    if (!updateResult) {
      return res.status(404).json({
        success: false,
        error: 'User not found. Please contact support.'
      });
    }

    // Delete the password reset request
    await PasswordReset.deleteOne({ _id: passwordReset._id });

    // Send confirmation email
    await sendPasswordResetConfirmation(email, userName);

    console.log('Password reset successfully for:', email);

    res.status(200).json({
      success: true,
      message: 'Password reset successful. You can now login with your new password.'
    });

  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while resetting your password. Please try again.'
    });
  }
};

// Manual Password Change (for logged-in users)
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword, userEmail } = req.body;
    
    if (!currentPassword || !newPassword || !userEmail) {
      return res.status(400).json({
        success: false,
        error: 'Current password, new password, and email are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        error: 'New password must be different from current password'
      });
    }

    console.log('Manual password change request for email:', userEmail);

    // Find user in User or Employee collection
    let user = await User.findOne({ 
      $or: [{ email: userEmail }, { gmail: userEmail }] 
    });
    
    let userType = 'user';
    let userName = 'User';

    if (!user) {
      // Check Employee collection
      user = await Employee.findOne({ 
        $or: [{ emailAddress: userEmail }, { email: userEmail }] 
      });
      
      if (user) {
        userType = 'employee';
        userName = user.empName || user.name || 'Employee';
      }
    } else {
      userName = user.name || user.firstName || 'User';
      userType = user.role || 'user';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: 'Current password is incorrect'
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in the appropriate collection
    let updateResult;

    if (userType === 'employee') {
      updateResult = await Employee.findByIdAndUpdate(
        user._id,
        { password: hashedNewPassword },
        { new: true }
      );
    } else {
      updateResult = await User.findByIdAndUpdate(
        user._id,
        { password: hashedNewPassword },
        { new: true }
      );
    }

    if (!updateResult) {
      return res.status(500).json({
        success: false,
        error: 'Failed to update password. Please try again.'
      });
    }

    console.log('Password changed successfully for:', userEmail);

    // Send confirmation email (optional)
    try {
      await sendPasswordResetConfirmation(userEmail, userName);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      error: 'An error occurred while changing your password. Please try again.'
    });
  }
};

// Manual Password Change (without authentication - for public access)
const manualChangePassword = async (req, res) => {
  try {
    const { email, currentPassword, newPassword } = req.body;
    
    if (!email || !currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, current password, and new password are required'
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    // Enhanced password validation
    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    console.log('Manual password change request for email:', email);

    // Find user in User or Employee collection
    let user = await User.findOne({ 
      $or: [{ email: email }, { gmail: email }] 
    });
    
    let userType = 'user';
    let userName = 'User';

    if (!user) {
      // Check Employee collection
      user = await Employee.findOne({ 
        $or: [{ emailAddress: email }, { email: email }] 
      });
      
      if (user) {
        userType = 'employee';
        userName = user.empName || user.name || 'Employee';
      }
    } else {
      userName = user.name || user.firstName || 'User';
      userType = user.role || 'user';
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email address'
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }

    // Hash the new password
    const saltRounds = 10;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password in the appropriate collection
    let updateResult;

    if (userType === 'employee') {
      updateResult = await Employee.findByIdAndUpdate(
        user._id,
        { password: hashedNewPassword },
        { new: true }
      );
    } else {
      updateResult = await User.findByIdAndUpdate(
        user._id,
        { password: hashedNewPassword },
        { new: true }
      );
    }

    if (!updateResult) {
      return res.status(500).json({
        success: false,
        message: 'Failed to update password. Please try again.'
      });
    }

    console.log('Password changed successfully for:', email);

    // Send confirmation email (optional)
    try {
      await sendPasswordResetConfirmation(email, userName);
    } catch (emailError) {
      console.error('Failed to send confirmation email:', emailError);
      // Don't fail the request if email fails
    }

    res.status(200).json({
      success: true,
      message: 'Password changed successfully! You can now login with your new password.'
    });

  } catch (error) {
    console.error('Manual change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing your password. Please try again.'
    });
  }
};

export default { register, login, logout, googleOAuth, forgotPassword, verifyResetCode, resetPassword, changePassword, manualChangePassword };
