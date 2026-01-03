const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: [true, 'Full name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true,
  },
  country: {
    type: String,
    required: [true, 'Country is required'],
    trim: true,
  },
  yearsOfExperience: {
    type: Number,
    required: [true, 'Years of experience is required'],
    min: 0,
  },
  primarySkills: {
    type: [String],
    required: [true, 'At least one skill is required'],
  },
  portfolioUrl: {
    type: String,
    required: [true, 'Portfolio URL is required'],
    trim: true,
  },
  resumeUrl: {
    type: String,
    required: [true, 'Resume is required'],
  },
  resumeOriginalName: {
    type: String,
    required: true,
  },
  coverLetter: {
    type: String,
    required: [true, 'Cover letter is required'],
    maxlength: 1000,
  },
  status: {
    type: String,
    enum: ['new', 'reviewed', 'shortlisted', 'rejected', 'archived'],
    default: 'new',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

applicationSchema.index({ fullName: 'text', email: 'text', country: 'text' });

module.exports = mongoose.model('Application', applicationSchema);