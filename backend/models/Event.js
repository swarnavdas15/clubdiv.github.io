import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: Date, required: true },
  location: { type: String, required: true },
  description: { type: String },
  image: { type: String }, // Changed from imageUrl to image to match the field name used in frontend
  imageUrl: { type: String }, // Keeping for backward compatibility

  // Additional fields for detailed event information
  eventType: { type: String, default: 'Tech Conference' },
  targetAudience: { type: String, default: 'Developers, Students, Tech Enthusiasts' },
  duration: { type: String, default: 'Full Day Event' },
  registrationInfo: { type: String, default: 'Free (Limited Seats)' },

  // What to Expect section
  whatToExpect: [{
    type: String,
    default: [
      'Interactive sessions with industry experts',
      'Networking opportunities with fellow tech enthusiasts',
      'Hands-on workshops and demonstrations',
      'Refreshments and snacks provided'
    ]
  }],

  // Registration details
  registrationRequired: { type: Boolean, default: true },
  registrationOpens: { type: Date },
  maxAttendees: { type: Number },
  registrationTitle: { type: String, default: 'Ready to Join Us?' },
  registrationDescription: { type: String, default: 'Don\'t miss out on this amazing opportunity to learn and connect with fellow tech enthusiasts!' },
  registrationLink: { type: String, default: '' },

  // Contact information
  organizerEmail: { type: String },
  organizerPhone: { type: String },

  // Additional metadata
  tags: [{ type: String }],
  status: { type: String, enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], default: 'upcoming' },
  featured: { type: Boolean, default: false }
});

const Event = mongoose.model('Event', eventSchema);
export default Event;
