// Empty implementations to disable email notifications

const sendAdminNotification = async (application) => {
  // Intentionally left blank to disable email sending
};

const sendApplicantConfirmation = async (application) => {
  // Intentionally left blank to disable email sending
};

module.exports = {
  sendAdminNotification,
  sendApplicantConfirmation,
};