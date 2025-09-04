import mongoose from 'mongoose';

const passwordChangeRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  oldPassword: {
    type: String,
    required: true
  },
  newPassword: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  reviewedAt: {
    type: Date
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewNote: {
    type: String
  }
});

const PasswordChangeRequest = mongoose.model('PasswordChangeRequest', passwordChangeRequestSchema);

export default PasswordChangeRequest;
