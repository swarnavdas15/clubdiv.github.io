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

const sampleProjects = [
  {
    title: "E-Commerce Platform",
    description: "A full-stack e-commerce solution built with modern technologies",
    technologies: ["React", "Node.js", "MongoDB", "Express"],
    githubUrl: "https://github.com/divclub/ecommerce-platform",
    liveUrl: "https://ecommerce.divclub.com",
    imageUrl: "/images/ecommerce-project.jpg",
    status: "active"
  },
  {
    title: "Task Management App",
    description: "A collaborative task management application for teams",
    technologies: ["Vue.js", "Firebase", "Tailwind CSS"],
    githubUrl: "https://github.com/divclub/task-manager",
    liveUrl: "https://tasks.divclub.com",
    imageUrl: "/images/task-manager.jpg",
    status: "active"
  },
  {
    title: "Weather Dashboard",
    description: "Real-time weather information dashboard with interactive maps",
    technologies: ["React", "OpenWeather API", "Chart.js"],
    githubUrl: "https://github.com/divclub/weather-dashboard",
    liveUrl: "https://weather.divclub.com",
    imageUrl: "/images/weather-dashboard.jpg",
    status: "active"
  }
];

const sampleTeam = [
  {
    name: "John Doe",
    role: "Lead Developer",
    bio: "Full-stack developer with 5+ years of experience in web technologies",
    image: "/images/john-doe.jpg",
    linkedinUrl: "https://linkedin.com/in/johndoe",
    githubUrl: "https://github.com/johndoe"
  },
  {
    name: "Jane Smith",
    role: "UI/UX Designer",
    bio: "Creative designer passionate about user experience and modern design trends",
    image: "/images/jane-smith.jpg",
    linkedinUrl: "https://linkedin.com/in/janesmith",
    githubUrl: "https://github.com/janesmith"
  },
  {
    name: "Mike Johnson",
    role: "Backend Engineer",
    bio: "Backend specialist with expertise in database design and API development",
    image: "/images/mike-johnson.jpg",
    linkedinUrl: "https://linkedin.com/in/mikejohnson",
    githubUrl: "https://github.com/mikejohnson"
  },
  {
    name: "Sarah Wilson",
    role: "Frontend Developer",
    bio: "Frontend developer focused on creating responsive and accessible web applications",
    image: "/images/sarah-wilson.jpg",
    linkedinUrl: "https://linkedin.com/in/sarahwilson",
    githubUrl: "https://github.com/sarahwilson"
  }
];

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
