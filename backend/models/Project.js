import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  technologies: [{ type: String }],
  githubUrl: { type: String },
  liveUrl: { type: String },
  imageUrl: { type: String },
  author: { type: String },  // Added author field as string
  date: { type: Date, default: Date.now },  // Added date field
  status: { type: String, enum: ['active', 'completed', 'upcoming'], default: 'active' }
});

const Project = mongoose.model('Project', projectSchema);
export default Project;
