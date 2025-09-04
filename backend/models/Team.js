import mongoose from 'mongoose';

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  email: { type: String },
  linkedinUrl: { type: String },
  githubUrl: { type: String },
  image: { type: String },
  bio: { type: String }
});

const Team = mongoose.model('Team', teamSchema);
export default Team;
