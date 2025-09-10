import mongoose from 'mongoose';
import dotenv from 'dotenv';
import About from './models/About.js';
import Event from './models/Event.js';
import Project from './models/Project.js';
import Team from './models/Team.js';
import Contact from './models/Contact.js';

// Load environment variables
dotenv.config();

// Sample data
const sampleAbout = {
  title: "About DIV Club",
  description: "Developer Innovation Vision Club - A community for tech enthusiasts and innovators",
  mission: "To foster innovation, collaboration, and skill development among developers",
  vision: "Creating a platform where developers can learn, grow, and build amazing projects together",
  values: ["Innovation", "Collaboration", "Learning", "Community"]
};

const sampleEvents = [];

const sampleProjects = [];

const sampleTeam = [];

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Seed data function
async function seedData() {
  try {
    // Clear existing data
    await About.deleteMany({});
    await Event.deleteMany({});
    await Project.deleteMany({});
    await Team.deleteMany({});
    await Contact.deleteMany({});

    console.log('Cleared existing data');

    // Insert sample data
    const about = await About.create(sampleAbout);
    const events = await Event.create(sampleEvents);
    const projects = await Project.create(sampleProjects);
    const team = await Team.create(sampleTeam);

    console.log('Sample data seeded successfully:');
    console.log('- About documents:', 1);
    console.log('- Event documents:', events.length);
    console.log('- Project documents:', projects.length);
    console.log('- Team documents:', team.length);

  } catch (error) {
    console.error('Error seeding data:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the seed script
async function run() {
  await connectDB();
  await seedData();
}

run().catch(console.error);
