const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const upload = require('../middleware/upload');
const { applicationValidationRules, validate } = require('../middleware/validation');
const { sendAdminNotification, sendApplicantConfirmation } = require('../config/email');

// @route   POST /api/applications
// @desc    Submit new application
// @access  Public
router.post(
  '/',
  upload.single('resume'),
  applicationValidationRules(),
  validate,
  async (req, res) => {
    try {
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ message: 'Resume file is required' });
      }

      // Parse primarySkills if it's a string
      let primarySkills = req.body.primarySkills;
      if (typeof primarySkills === 'string') {
        primarySkills = JSON.parse(primarySkills);
      }

      // Create application
      const application = await Application.create({
        fullName: req.body.fullName,
        email: req.body.email,
        phone: req.body.phone,
        country: req.body.country,
        yearsOfExperience: req.body.yearsOfExperience,
        primarySkills: primarySkills,
        portfolioUrl: req.body.portfolioUrl,
        resumeUrl: `/uploads/${req.file.filename}`,
        resumeOriginalName: req.file.originalname,
        coverLetter: req.body.coverLetter,
      });

      // Send email notifications (don't wait for them)
      sendAdminNotification(application).catch(err => console.error(err));
      sendApplicantConfirmation(application).catch(err => console.error(err));

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully',
        data: application,
      });
    } catch (error) {
      console.error('Error submitting application:', error);
      res.status(500).json({
        success: false,
        message: 'Error submitting application',
        error: error.message,
      });
    }
  }
);

module.exports = router;