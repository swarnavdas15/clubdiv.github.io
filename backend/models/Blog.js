import mongoose from 'mongoose';

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    default: null,
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: {
    type: Date,
  },
  reviewNote: {
    type: String,
  },
  likes: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  }],
  dislikes: [{
    type: mongoose.Schema.Types.Mixed,
    ref: 'User'
  }],
}, { timestamps: true });

const Blog = mongoose.model('Blog', blogSchema);

export default Blog;
