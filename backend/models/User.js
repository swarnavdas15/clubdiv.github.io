import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstName: {
    type: String,
    trim: true,
    default: '',
  },
  lastName: {
    type: String,
    trim: true,
    default: '',
  },
  college: {
    type: String,
    trim: true,
    default: '',
  },
  branch: {
    type: String,
    trim: true,
    default: '',
  },
  number: {
    type: String,
    trim: true,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    default: '',
    maxlength: 500,
  },
  profileImage: {
    type: String,
    default: '',
  },
  lastLogin: {
    type: Date,
    default: Date.now,
  },
  loginStreak: {
    type: Number,
    default: 0,
  },
  totalLogins: {
    type: Number,
    default: 0,
  },
  otp: {
    type: String,
    default: null,
  },
  otpExpires: {
    type: Date,
    default: null,
  },
  role: {
    type: String,
    enum: ['member', 'administrator', 'admin', 'moderator'],
    default: 'member',
  },
  isActive: {
    type: Boolean,
    default: false,
  },
  securityQuestions: [{
    question: {
      type: String,
      required: true,
    },
    answer: {
      type: String,
      required: true,
    }
  }],
  pendingPasswordChange: {
    newPassword: {
      type: String,
      default: null,
    },
    requestedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: null,
    },
    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    approvedAt: {
      type: Date,
      default: null,
    }
  },
  // OAuth provider IDs
  googleId: {
    type: String,
    default: null,
  },
  githubId: {
    type: String,
    default: null,
  },
  linkedinId: {
    type: String,
    default: null,
  },

}, { timestamps: true });

const User = mongoose.model('User', userSchema);

export default User;
