const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendAdminNotification = async (application) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.ADMIN_EMAIL,
    subject: `New Application: ${application.fullName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">New Developer Application Received</h2>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px;">
          <p><strong>Name:</strong> ${application.fullName}</p>
          <p><strong>Email:</strong> ${application.email}</p>
          <p><strong>Phone:</strong> ${application.phone}</p>
          <p><strong>Country:</strong> ${application.country}</p>
          <p><strong>Experience:</strong> ${application.yearsOfExperience} years</p>
          <p><strong>Primary Skills:</strong> ${application.primarySkills.join(', ')}</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Admin notification sent');
  } catch (error) {
    console.error('❌ Error sending admin notification:', error);
  }
};

const sendApplicantConfirmation = async (application) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: application.email,
    subject: 'Application Received - Thank You!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Thank You for Your Application!</h2>
        <p>Dear ${application.fullName},</p>
        <p>We have received your application for the App Developer position.</p>
        <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="margin-top: 0;">Application Summary:</h3>
          <p><strong>Experience:</strong> ${application.yearsOfExperience} years</p>
          <p><strong>Skills:</strong> ${application.primarySkills.join(', ')}</p>
        </div>
        <p>Best regards,<br><strong>The Hiring Team</strong></p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log('✅ Applicant confirmation sent');
  } catch (error) {
    console.error('❌ Error sending applicant confirmation:', error);
  }
};

module.exports = {
  sendAdminNotification,
  sendApplicantConfirmation,
};