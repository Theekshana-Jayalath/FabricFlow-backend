import mongoose from 'mongoose';

const passwordResetSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true
  },
  verificationCode: {
    type: String,
    required: true
  },
  userType: {
    type: String,
    required: true,
    enum: ['user', 'employee', 'admin']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0,
    max: 5 // Maximum 5 attempts
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600 // Document expires after 10 minutes (600 seconds)
  }
});

// Index for faster queries
passwordResetSchema.index({ email: 1, verificationCode: 1 });
passwordResetSchema.index({ createdAt: 1 }, { expireAfterSeconds: 600 });

const PasswordReset = mongoose.model('PasswordReset', passwordResetSchema);

export default PasswordReset;
