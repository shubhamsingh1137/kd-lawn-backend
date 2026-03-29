const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async ({ to, subject, html }) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Email send error:", error.message);
  }
};

// Email templates
const bookingConfirmEmail = (booking) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#b8860b;">Kalawati Marriage Lawn</h2>
    <p>Dear <strong>${booking.contactName}</strong>,</p>
    <p>Your booking request has been received successfully.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Booking ID</strong></td><td style="padding:8px;border:1px solid #eee;">${booking._id}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Event Date</strong></td><td style="padding:8px;border:1px solid #eee;">${new Date(booking.eventDate).toDateString()}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Event Type</strong></td><td style="padding:8px;border:1px solid #eee;">${booking.eventType}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Status</strong></td><td style="padding:8px;border:1px solid #eee;color:orange;">Pending Confirmation</td></tr>
    </table>
    <p>We will confirm your booking within 24 hours.</p>
    <p style="color:#888;font-size:12px;">Kalawati Marriage Lawn | Contact: +91-XXXXXXXXXX</p>
  </div>
`;

const bookingStatusEmail = (booking, status) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#b8860b;">Kalawati Marriage Lawn</h2>
    <p>Dear <strong>${booking.contactName}</strong>,</p>
    <p>Your booking status has been updated to: 
      <strong style="color:${status === 'confirmed' ? 'green' : 'red'};">${status.toUpperCase()}</strong>
    </p>
    ${booking.adminNote ? `<p><strong>Note from admin:</strong> ${booking.adminNote}</p>` : ""}
    <p>Booking ID: <strong>${booking._id}</strong></p>
    <p>Event Date: <strong>${new Date(booking.eventDate).toDateString()}</strong></p>
    <p style="color:#888;font-size:12px;">Kalawati Marriage Lawn | Contact: +91-XXXXXXXXXX</p>
  </div>
`;

module.exports = { sendEmail, bookingConfirmEmail, bookingStatusEmail };
