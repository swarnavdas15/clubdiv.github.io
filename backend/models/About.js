import mongoose from 'mongoose';

const cardSchema = new mongoose.Schema({
  icon: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true }
});

const aboutSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  mission: { type: String, required: true },
  cards: [cardSchema]
});

const About = mongoose.model('About', aboutSchema);
export default About;
