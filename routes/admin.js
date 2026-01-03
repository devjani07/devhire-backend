const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const Application = require('../models/Application');
const protect = require('../middleware/auth'); // ✅ FIXED
const path = require('path');
const fs = require('fs');

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });
};

// @route   POST /api/admin/login
// @desc    Admin login
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const admin = await Admin.findOne({ email });

    if (admin && (await admin.matchPassword(password))) {
      res.json({
        success: true,
        data: {
          id: admin._id,
          name: admin.name,
          email: admin.email,
          token: generateToken(admin._id),
        },
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// @route   POST /api/admin/register
// @desc    Register new admin
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({ message: 'Admin already exists' });
    }

    const admin = await Admin.create({ name, email, password });

    res.status(201).json({
      success: true,
      data: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        token: generateToken(admin._id),
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// @route   GET /api/admin/profile
// @access  Private
router.get('/profile', protect, async (req, res) => {
  res.json({
    success: true,
    data: {
      id: req.admin._id,
      name: req.admin.name,
      email: req.admin.email,
    },
  });
});

// @route   GET /api/admin/applications
router.get('/applications', protect, async (req, res) => {
  try {
    const { search, status, sortBy, order, page = 1, limit = 10 } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { country: { $regex: search, $options: 'i' } },
      ];
    }

    if (status && status !== 'all') {
      query.status = status;
    }

    const sortOptions = sortBy
      ? { [sortBy]: order === 'asc' ? 1 : -1 }
      : { createdAt: -1 };

    const applications = await Application.find(query)
      .sort(sortOptions)
      .limit(Number(limit))
      .skip((page - 1) * limit);

    const count = await Application.countDocuments(query);

    res.json({
      success: true,
      data: applications,
      totalPages: Math.ceil(count / limit),
      currentPage: Number(page),
      total: count,
    });
  } catch (error) {
    console.error('Error fetching applications:', error);
    res.status(500).json({ message: 'Error fetching applications' });
  }
});

// @route   GET /api/admin/applications/:id
router.get('/applications/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching application' });
  }
});

// @route   PUT /api/admin/applications/:id
router.put('/applications/:id', protect, async (req, res) => {
  try {
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true, runValidators: true }
    );

    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    res.json({ success: true, data: application });
  } catch (error) {
    res.status(500).json({ message: 'Error updating application' });
  }
});

// @route   DELETE /api/admin/applications/:id
router.delete('/applications/:id', protect, async (req, res) => {
  try {
    const application = await Application.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ message: 'Application not found' });
    }

    const resumePath = path.join(__dirname, '..', application.resumeUrl);
    if (fs.existsSync(resumePath)) fs.unlinkSync(resumePath);

    await Application.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting application' });
  }
});

// @route   GET /api/admin/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const totalApplications = await Application.countDocuments();
    const newApplications = await Application.countDocuments({ status: 'new' });
    const reviewedApplications = await Application.countDocuments({ status: 'reviewed' });
    const shortlistedApplications = await Application.countDocuments({ status: 'shortlisted' });

    const recentApplications = await Application.find()
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      data: {
        total: totalApplications,
        new: newApplications,
        reviewed: reviewedApplications,
        shortlisted: shortlistedApplications,
        recent: recentApplications,
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching statistics' });
  }
});

module.exports = router;
