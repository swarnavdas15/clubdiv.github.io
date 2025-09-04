import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Blog from './models/Blog.js';

// Load environment variables
dotenv.config();

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB Atlas connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

const sampleBlogPosts = [
  {
    title: "Welcome to Our Blog!",
    content: "This is our first blog post. We're excited to share our journey and insights with you. Stay tuned for more updates and articles about our projects, events, and community initiatives.",
    createdAt: new Date()
  },
  {
    title: "Getting Started with Web Development",
    content: "Web development is an exciting field that combines creativity with technical skills. In this post, we'll explore the basics of HTML, CSS, and JavaScript to help you get started on your coding journey.",
    createdAt: new Date(Date.now() - 86400000) // 1 day ago
  },
  {
    title: "The Importance of Community in Tech",
    content: "Building a strong community is essential for growth and learning in the tech industry. In this article, we discuss how communities foster collaboration, knowledge sharing, and professional development.",
    createdAt: new Date(Date.now() - 172800000) // 2 days ago
  }
];

const seedBlogData = async () => {
  try {
    // Clear existing blog posts
    await Blog.deleteMany({});
    console.log('Cleared existing blog posts');

    // Insert sample blog posts
    await Blog.insertMany(sampleBlogPosts);
    console.log('Sample blog posts added successfully');

    // Display the inserted posts
    const posts = await Blog.find();
    console.log('Current blog posts:', posts);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding blog data:', error);
    process.exit(1);
  }
};

seedBlogData();
