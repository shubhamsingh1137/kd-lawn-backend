
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
 
// ── Booking received confirmation ──────────────────────────────
const bookingConfirmEmail = (booking) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#b8860b;">Kalawati Utsav Lawn</h2>
    <p>Dear <strong>${booking.contactName}</strong>,</p>
    <p>Your booking request has been received successfully.</p>
    <table style="width:100%;border-collapse:collapse;margin:16px 0;">
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Booking ID</strong></td><td style="padding:8px;border:1px solid #eee;">${booking._id}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Event Date</strong></td><td style="padding:8px;border:1px solid #eee;">${new Date(booking.eventDate).toDateString()}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Event Type</strong></td><td style="padding:8px;border:1px solid #eee;">${booking.eventType}</td></tr>
      <tr><td style="padding:8px;border:1px solid #eee;"><strong>Status</strong></td><td style="padding:8px;border:1px solid #eee;color:orange;">Pending Confirmation</td></tr>
    </table>
    <p>We will confirm your booking within 24 hours.</p>
    <p style="color:#888;font-size:12px;">Kalawati Utsav Lawn | Contact: +91 8808085237</p>
  </div>
`;
 
// ── Status update email (old simple one) ──────────────────────
const bookingStatusEmail = (booking, status) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#b8860b;">Kalawati Utsav Lawn</h2>
    <p>Dear <strong>${booking.contactName}</strong>,</p>
    <p>Your booking status has been updated to: 
      <strong style="color:${status === 'confirmed' ? 'green' : 'red'};">${status.toUpperCase()}</strong>
    </p>
    ${booking.adminNote ? `<p><strong>Note from admin:</strong> ${booking.adminNote}</p>` : ""}
    <p>Booking ID: <strong>${booking._id}</strong></p>
    <p>Event Date: <strong>${new Date(booking.eventDate).toDateString()}</strong></p>
    <p style="color:#888;font-size:12px;">Kalawati Utsav Lawn | Contact: +91 8808085237</p>
  </div>
`;
 
// ── NEW: Full bill email — admin action pe automatically jayega ─
const bookingBillEmail = (booking, status) => {
  const eventDate = new Date(booking.eventDate).toLocaleDateString("en-IN", {
    day: "2-digit", month: "long", year: "numeric",
  });
  const statusColor = {
    confirmed: "#16a34a",
    rejected:  "#dc2626",
    completed: "#2563eb",
    pending:   "#d97706",
    cancelled: "#6b7280",
  }[status] || "#c9a96e";
 
  return `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #fff;">
 
    <div style="background: #c9a96e; padding: 28px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 22px;">KD Utsav Lawn</h1>
      <p style="color: rgba(255,255,255,0.85); margin: 6px 0 0; font-size: 13px;">Kalawati Devi Utsav Lawn</p>
    </div>
 
    <div style="background: ${statusColor}; padding: 12px; text-align: center;">
      <p style="color: white; margin: 0; font-weight: bold; font-size: 15px; text-transform: uppercase;">
        Booking ${status.charAt(0).toUpperCase() + status.slice(1)}
      </p>
    </div>
 
    <div style="padding: 24px 28px 0;">
      <p style="font-size: 15px; color: #1f2937;">
  Namaskar <strong>${booking.contactName}</strong>,
</p>
      <p style="font-size: 14px; color: #4b5563;">Your booking status has been updated. Below is your booking receipt.:</p>
    </div>
 
    <div style="margin: 20px 28px; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
 
      <div style="background: #faf8f4; padding: 14px 18px; border-bottom: 1px solid #e5e7eb;">
        <p style="margin: 0; font-size: 13px; color: #6b7280;">
          Booking ID: <strong style="color: #1f2937;">#${booking._id.toString().slice(-8).toUpperCase()}</strong>
        </p>
      </div>
 
      <div style="padding: 18px;">
        <p style="font-weight: bold; color: #c9a96e; font-size: 12px; text-transform: uppercase; margin: 0 0 12px;">Customer Details</p>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr><td style="color: #6b7280; padding: 4px 0; width: 40%;">Name</td><td style="color: #1f2937; font-weight: 500;">${booking.contactName}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Phone</td><td style="color: #1f2937;">${booking.contactPhone}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Email</td><td style="color: #1f2937;">${booking.contactEmail || "—"}</td></tr>
        </table>
      </div>
 
      <div style="height: 1px; background: #e5e7eb; margin: 0 18px;"></div>
 
      <div style="padding: 18px;">
        <p style="font-weight: bold; color: #c9a96e; font-size: 12px; text-transform: uppercase; margin: 0 0 12px;">Event Details</p>
        <table style="width: 100%; font-size: 13px; border-collapse: collapse;">
          <tr><td style="color: #6b7280; padding: 4px 0; width: 40%;">Event Type</td><td style="color: #1f2937; font-weight: 500;">${booking.eventType}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Event Date</td><td style="color: #1f2937;">${eventDate}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Package</td><td style="color: #1f2937;">${booking.package?.name || "—"}</td></tr>
          <tr><td style="color: #6b7280; padding: 4px 0;">Guests</td><td style="color: #1f2937;">${booking.guestCount} persons</td></tr>
        </table>
      </div>
 
      <div style="background: #c9a96e; padding: 14px 18px;">
        <table style="width: 100%; font-size: 14px; border-collapse: collapse;">
          <tr>
            <td style="color: white; font-weight: bold;">Total Amount</td>
            <td style="color: white; font-weight: bold; text-align: right;">Rs. ${booking.totalAmount?.toLocaleString("en-IN")}</td>
          </tr>
        </table>
      </div>
    </div>
 
    ${booking.adminNote ? `
    <div style="margin: 0 28px 20px; background: #fef9ee; border: 1px solid #f0d070; border-radius: 10px; padding: 14px 18px;">
      <p style="font-size: 12px; font-weight: bold; color: #92400e; margin: 0 0 6px;">Message from KD Utsav Lawn:</p>
      <p style="font-size: 13px; color: #1f2937; margin: 0;">${booking.adminNote}</p>
    </div>` : ""}
 
    <div style="margin: 0 28px 28px; text-align: center;">
      <a href="${process.env.FRONTEND_URL}/track-booking"
        style="display: inline-block; background: #1f2937; color: white; padding: 12px 28px; border-radius: 8px; text-decoration: none; font-size: 13px; font-weight: bold;">
        Track Your Booking
      </a>
    </div>
 
    <div style="background: #c9a96e; padding: 18px; text-align: center;">
      <p style="color: white; margin: 0; font-size: 12px;">KD Utsav Lawn | +91 8808085237 | kdutsavlawn@gmail.com</p>
      <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 11px;">Teachers colony Gayatri nagar road kunraghat , Gorakhpur , Uttar Pradesh - 273008</p>
    </div>
  </div>`;
};
 
 
// ── Admin new booking alert ──────────────────────────────
const adminBookingAlertEmail = (booking) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
 
    <h2 style="color:#b8860b;">New Booking Received</h2>
 
    <p>A new booking request has been submitted.</p>
 
    <table style="width:100%;border-collapse:collapse;margin-top:16px;">
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Name</strong></td>
        <td style="padding:8px;border:1px solid #eee;">${booking.contactName}</td>
      </tr>
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Phone</strong></td>
        <td style="padding:8px;border:1px solid #eee;">${booking.contactPhone}</td>
      </tr>
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Email</strong></td>
        <td style="padding:8px;border:1px solid #eee;">${booking.contactEmail || "N/A"}</td>
      </tr>
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Event Type</strong></td>
        <td style="padding:8px;border:1px solid #eee;">${booking.eventType}</td>
      </tr>
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Event Date</strong></td>
        <td style="padding:8px;border:1px solid #eee;">
          ${new Date(booking.eventDate).toDateString()}
        </td>
      </tr>
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Guests</strong></td>
        <td style="padding:8px;border:1px solid #eee;">${booking.guestCount}</td>
      </tr>
 
      <tr>
        <td style="padding:8px;border:1px solid #eee;"><strong>Amount</strong></td>
        <td style="padding:8px;border:1px solid #eee;">₹${booking.totalAmount}</td>
      </tr>
 
    </table>
 
    <p style="margin-top:20px;">
      Login to admin dashboard to review this booking.
    </p>
 
  </div>
`;
 
// ── NEW: Payment receipt email — customer ko payment confirm hone pe ──
const paymentReceiptEmail = (booking, paidAmount, type) => {
  const totalAmount = booking.totalAmount || 0;
  const totalPaid = booking.advanceAmount || 0;
  const remainingAmount = Math.max(
    totalAmount - totalPaid,
    0
  );
  const paymentStatus =
    remainingAmount === 0
      ? "Fully Paid"
      : "Advance Paid";
  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">
    <div style="background:#c9a96e;padding:28px;text-align:center;">
      <h1 style="color:white;margin:0;">KD Utsav Lawn</h1>
      <p style="color:white;margin:6px 0 0;">Payment Receipt</p>
    </div>
    <div style="padding:28px;">
      <p>
        Namaskar <strong>${booking.contactName}</strong>,
      </p>
      <p>
        Your payment has been
        <strong style="color:#16a34a;">
          successfully received.
        </strong>
      </p>
      <table style="width:100%;border-collapse:collapse;margin:20px 0;">
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Booking ID</td>
          <td style="padding:10px;border:1px solid #eee;">
            #${booking._id.toString().slice(-8).toUpperCase()}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Package</td>
          <td style="padding:10px;border:1px solid #eee;">
            ${booking.package?.name || "—"}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Total Amount</td>
          <td style="padding:10px;border:1px solid #eee;">
            ₹${totalAmount.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">This Payment</td>
          <td style="padding:10px;border:1px solid #eee;color:#16a34a;font-weight:bold;">
            ₹${paidAmount.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Total Paid</td>
          <td style="padding:10px;border:1px solid #eee;font-weight:bold;">
            ₹${totalPaid.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Remaining Amount</td>
          <td style="padding:10px;border:1px solid #eee;color:#dc2626;font-weight:bold;">
            ₹${remainingAmount.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Payment Status</td>
          <td style="padding:10px;border:1px solid #eee;font-weight:bold;">
            ${paymentStatus}
          </td>
        </tr>
      </table>
      <p>Thank you for choosing KD Utsav Lawn.</p>
    </div>
  </div>
  `;
};

// ── Confirmed booking + payment link email ─────────────────────
const confirmedPaymentLinkEmail = (booking, payLink) => {

  const eventDate = new Date(booking.eventDate).toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }
  );

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">

    <div style="background:#c9a96e;padding:28px;text-align:center;">
      <h1 style="color:white;margin:0;">KD Utsav Lawn</h1>
      <p style="color:white;margin:6px 0 0;">
        Kalawati Devi Utsav Lawn
      </p>
    </div>

    <div style="padding:28px;">

      <p>
        Namaskar <strong>${booking.contactName}</strong>,
      </p>

      <p>
        Your booking has been
        <strong style="color:#16a34a;">
          CONFIRMED
        </strong>.
      </p>

      <table style="width:100%;border-collapse:collapse;margin:20px 0;">

        <tr>
          <td style="padding:10px;border:1px solid #eee;">
            Booking ID
          </td>
          <td style="padding:10px;border:1px solid #eee;">
            #${booking._id.toString().slice(-8).toUpperCase()}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;border:1px solid #eee;">
            Event
          </td>
          <td style="padding:10px;border:1px solid #eee;">
            ${booking.eventType}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;border:1px solid #eee;">
            Event Date
          </td>
          <td style="padding:10px;border:1px solid #eee;">
            ${eventDate}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;border:1px solid #eee;">
            Package
          </td>
          <td style="padding:10px;border:1px solid #eee;">
            ${booking.package?.name || "—"}
          </td>
        </tr>

        <tr>
          <td style="padding:10px;border:1px solid #eee;">
            Total Amount
          </td>
          <td style="padding:10px;border:1px solid #eee;">
            ₹${booking.totalAmount?.toLocaleString("en-IN")}
          </td>
        </tr>

      </table>

      <p>
        Please pay the required advance amount using the button below.
      </p>

      <div style="text-align:center;margin:28px 0;">

        <a
          href="${payLink}"
          style="background:#c9a96e;color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:bold;"
        >
          Pay Booking Amount
        </a>

      </div>

      <p style="font-size:12px;color:#777;">
        If you have already completed the payment, please ignore this message.
      </p>

    </div>

    <div style="background:#c9a96e;padding:18px;text-align:center;">

      <p style="color:white;margin:0;font-size:12px;">
        KD Utsav Lawn | +91 8808085237 | kdutsavlawn@gmail.com
      </p>

    </div>

  </div>
  `;
};
 
// ── NEW: Admin payment alert — jab bhi payment aaye, admin ko notify ──
const adminPaymentAlertEmail = (booking, paidAmount, type) => {
  const totalAmount = booking.totalAmount || 0;
  const totalPaid = booking.advanceAmount || 0;
  const remainingAmount = Math.max(
    totalAmount - totalPaid,
    0
  );
  const paymentStatus =
    remainingAmount === 0
      ? "Fully Paid"
      : "Advance Paid";
  return `
  <div style="font-family:Arial,sans-serif;max-width:650px;margin:auto;">
    <div style="background:#1f2937;padding:25px;text-align:center;">
      <h2 style="color:white;margin:0;">
        💰 Payment Received
      </h2>
    </div>
    <div style="padding:28px;">
      <p>A payment has been successfully received.</p>
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Customer</td>
          <td style="padding:10px;border:1px solid #eee;">
            ${booking.contactName}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Phone</td>
          <td style="padding:10px;border:1px solid #eee;">
            ${booking.contactPhone}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Booking ID</td>
          <td style="padding:10px;border:1px solid #eee;">
            #${booking._id.toString().slice(-8).toUpperCase()}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Package</td>
          <td style="padding:10px;border:1px solid #eee;">
            ${booking.package?.name || "—"}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Payment Type</td>
          <td style="padding:10px;border:1px solid #eee;">
            ${type === "advance" ? "Advance Payment" : "Balance Payment"}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Total Amount</td>
          <td style="padding:10px;border:1px solid #eee;">
            ₹${totalAmount.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">This Payment</td>
          <td style="padding:10px;border:1px solid #eee;color:#16a34a;font-weight:bold;">
            ₹${paidAmount.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Total Paid</td>
          <td style="padding:10px;border:1px solid #eee;font-weight:bold;">
            ₹${totalPaid.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Remaining</td>
          <td style="padding:10px;border:1px solid #eee;color:#dc2626;font-weight:bold;">
            ₹${remainingAmount.toLocaleString("en-IN")}
          </td>
        </tr>
        <tr>
          <td style="padding:10px;border:1px solid #eee;">Status</td>
          <td style="padding:10px;border:1px solid #eee;font-weight:bold;">
            ${paymentStatus}
          </td>
        </tr>
      </table>
    </div>
  </div>
  `;
};
 
module.exports = {
  sendEmail,
  bookingConfirmEmail,
  bookingStatusEmail,
  bookingBillEmail,
  adminBookingAlertEmail,
  confirmedPaymentLinkEmail,  
  paymentReceiptEmail,       
  adminPaymentAlertEmail,
};