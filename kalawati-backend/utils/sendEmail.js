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

const sendEmail = async ({ to, subject, html, attachments = [] }) => {
  try {
    if (
      !process.env.EMAIL_HOST ||
      !process.env.EMAIL_PORT ||
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_PASS ||
      !process.env.EMAIL_FROM
    ) {
      throw new Error("Email configuration is incomplete in .env");
    }

    if (!to) {
      throw new Error("Recipient email address is missing");
    }

    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
      attachments,
    });

    console.log("Email sent successfully:", {
      to,
      subject,
      messageId: info.messageId,
    });

    return info;
  } catch (error) {
    console.error("Email send failed:", {
      to,
      subject,
      message: error.message,
      code: error.code,
    });

    throw error;
  }
};

// ── Booking received confirmation ──────────────────────────────
// ── Booking Request Received — customer ko immediately jayega ──
const bookingConfirmEmail = (booking) => {
  const eventDate = new Date(booking.eventDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const totalAmount = Number(booking.totalAmount || 0);
  const amountPaid = Number(booking.advanceAmount || 0);
  const balanceAmount = Math.max(totalAmount - amountPaid, 0);

  return `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">

    <!-- Header -->
    <div style="background:#c9a96e;padding:28px;text-align:center;">
      <h1 style="color:white;margin:0;font-size:22px;">
        KD Utsav Lawn
      </h1>
      <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:13px;">
        Kalawati Devi Utsav Lawn
      </p>
    </div>

    <!-- Status -->
    <div style="background:#d97706;padding:12px;text-align:center;">
      <p style="color:white;margin:0;font-weight:bold;font-size:15px;">
        Booking Request Received
      </p>
    </div>

    <!-- Greeting -->
    <div style="padding:24px 28px 10px;">
      <p style="font-size:15px;color:#1f2937;">
        Namaskar <strong>${booking.contactName}</strong>,
      </p>

      <p style="font-size:14px;color:#4b5563;line-height:1.6;">
        Your booking request has been received successfully.
        Our team will verify availability and confirm your booking shortly.
      </p>
    </div>

    <!-- Booking Details -->
    <div style="margin:20px 28px;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;">

      <div style="background:#faf8f4;padding:14px 18px;border-bottom:1px solid #e5e7eb;">
        <p style="margin:0;font-size:13px;color:#6b7280;">
          Booking ID:
          <strong style="color:#1f2937;">
            #${booking._id.toString().slice(-8).toUpperCase()}
          </strong>
        </p>
      </div>

      <div style="padding:18px;">

        <p style="font-weight:bold;color:#c9a96e;font-size:12px;text-transform:uppercase;margin:0 0 12px;">
          Booking Details
        </p>

        <table style="width:100%;font-size:13px;border-collapse:collapse;">

          <tr>
            <td style="color:#6b7280;padding:6px 0;width:42%;">
              Customer Name
            </td>
            <td style="color:#1f2937;font-weight:500;">
              ${booking.contactName}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Event Date
            </td>
            <td style="color:#1f2937;">
              ${eventDate}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Event Type
            </td>
            <td style="color:#1f2937;">
              ${booking.eventType}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Number of Guests
            </td>
            <td style="color:#1f2937;">
              ${booking.guestCount} persons
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Package Selected
            </td>
            <td style="color:#1f2937;">
              ${booking.package?.name || "—"}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Amount Paid
            </td>
            <td style="color:#16a34a;font-weight:bold;">
              ₹${amountPaid.toLocaleString("en-IN")}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Balance Amount
            </td>
            <td style="color:#dc2626;font-weight:bold;">
              ₹${balanceAmount.toLocaleString("en-IN")}
            </td>
          </tr>

        </table>
      </div>

      <!-- Status -->
      <div style="background:#fef9ee;border-top:1px solid #f0d070;padding:14px 18px;">
        <table style="width:100%;font-size:14px;">
          <tr>
            <td style="font-weight:bold;color:#92400e;">
              Status
            </td>
            <td style="text-align:right;color:#d97706;font-weight:bold;">
              Pending Confirmation
            </td>
          </tr>
        </table>
      </div>

    </div>

    <!-- Message -->
    <div style="margin:0 28px 20px;background:#f9fafb;border-radius:10px;padding:16px;">
      <p style="font-size:13px;color:#374151;margin:0;line-height:1.6;">
        Your booking request has been received.
        Our team will verify availability and confirm your booking shortly.
      </p>
    </div>

    <!-- Contact -->
    <div style="margin:0 28px 28px;text-align:center;">
      <p style="font-size:13px;color:#6b7280;margin:0;">
        For any assistance, please contact us on WhatsApp or call:
      </p>

      <p style="font-size:14px;font-weight:bold;color:#1f2937;margin:8px 0 0;">
        +91 8808085237
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#c9a96e;padding:18px;text-align:center;">
      <p style="color:white;margin:0;font-size:12px;">
        KD Utsav Lawn | +91 8808085237 | kdutsavlawn@gmail.com
      </p>

      <p style="color:rgba(255,255,255,0.8);margin:6px 0 0;font-size:11px;">
        Teachers Colony, Gayatri Nagar Road, Kunraghat,
        Gorakhpur, Uttar Pradesh - 273008
      </p>
    </div>

  </div>
  `;
};

// ── Status update email (old simple one) ──────────────────────
const bookingStatusEmail = (booking, status) => `
  <div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #eee;border-radius:8px;">
    <h2 style="color:#b8860b;">Kalawati Utsav Lawn</h2>
    <p>Dear <strong>${booking.contactName}</strong>,</p>
    <p>Your booking status has been updated to: 
      <strong style="color:${status === "confirmed" ? "green" : "red"};">${status.toUpperCase()}</strong>
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
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const statusColor =
    {
      confirmed: "#16a34a",
      rejected: "#dc2626",
      completed: "#2563eb",
      pending: "#d97706",
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
 
    ${
      booking.adminNote
        ? `
    <div style="margin: 0 28px 20px; background: #fef9ee; border: 1px solid #f0d070; border-radius: 10px; padding: 14px 18px;">
      <p style="font-size: 12px; font-weight: bold; color: #92400e; margin: 0 0 6px;">Message from KD Utsav Lawn:</p>
      <p style="font-size: 13px; color: #1f2937; margin: 0;">${booking.adminNote}</p>
    </div>`
        : ""
    }
 
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
const paymentReceiptEmail = (booking, paidAmount, type, payment = {}) => {
  const totalAmount = booking.totalAmount || 0;
  const totalPaid = booking.advanceAmount || 0;

  const isPendingPayment = type === "pending";
  const isQRApproved = type === "qr_approved";
  const isQRRejected = type === "qr_rejected";

  const paymentSource =
    isPendingPayment || isQRApproved || isQRRejected
      ? "QR Payment"
      : payment.source === "manual"
        ? "Manual Payment"
        : "Razorpay";

  const paymentMethod = payment.paymentMethod
    ? payment.paymentMethod
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : paymentSource;

  const paymentDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString("en-IN")
    : new Date().toLocaleString("en-IN");

  const collectedBy = payment.collectedBy || "—";
  const transactionId = payment.transactionId || "—";
  const note = payment.note || "—";

  const remainingAmount = Math.max(totalAmount - totalPaid, 0);

  const paymentStatus = isPendingPayment
    ? "Pending Verification"
    : isQRRejected
      ? "Payment Rejected"
      : remainingAmount === 0
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
 ${
   isPendingPayment
     ? `Your QR payment of <strong>₹${paidAmount.toLocaleString(
         "en-IN",
       )}</strong> has been submitted successfully and is <strong style="color:#d97706;">pending verification</strong> by our team.`
     : isQRRejected
       ? `Your QR payment of <strong>₹${paidAmount.toLocaleString(
           "en-IN",
         )}</strong> has been <strong style="color:#dc2626;">rejected</strong> after verification. Please contact KD Utsav Lawn for further assistance.`
       : isQRApproved
         ? `Your QR payment of <strong>₹${paidAmount.toLocaleString(
             "en-IN",
           )}</strong> has been <strong style="color:#16a34a;">approved successfully</strong> by our team.`
         : `Your payment has been <strong style="color:#16a34a;">successfully received.</strong>`
 }
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
        <tr>
  <td style="padding:10px;border:1px solid #eee;">Payment Source</td>
  <td style="padding:10px;border:1px solid #eee;">
    ${paymentSource}
  </td>
</tr>

<tr>
  <td style="padding:10px;border:1px solid #eee;">Payment Mode</td>
  <td style="padding:10px;border:1px solid #eee;">
    ${paymentMethod}
  </td>
</tr>

<tr>
  <td style="padding:10px;border:1px solid #eee;">Collected By</td>
  <td style="padding:10px;border:1px solid #eee;">
    ${collectedBy}
  </td>
</tr>

<tr>
  <td style="padding:10px;border:1px solid #eee;">Payment Date</td>
  <td style="padding:10px;border:1px solid #eee;">
    ${paymentDate}
  </td>
</tr>

<tr>
  <td style="padding:10px;border:1px solid #eee;">Transaction / Reference ID</td>
  <td style="padding:10px;border:1px solid #eee;">
    ${transactionId}
  </td>
</tr>

<tr>
  <td style="padding:10px;border:1px solid #eee;">Note</td>
  <td style="padding:10px;border:1px solid #eee;">
    ${note}
  </td>
</tr>

${
  payment.receiptAttachment
    ? `
<tr>
  <td style="padding:10px;border:1px solid #eee;">Receipt</td>
  <td style="padding:10px;border:1px solid #eee;">
    <a href="${payment.receiptAttachment}" target="_blank">
      View Receipt
    </a>
  </td>
</tr>
`
    : ""
}
      </table>
      <p>Thank you for choosing KD Utsav Lawn.</p>
    </div>
  </div>
  `;
};

// ── Confirmed booking + payment link email ─────────────────────
const confirmedPaymentLinkEmail = (booking, payLink) => {
  const eventDate = new Date(booking.eventDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const totalAmount = Number(booking.totalAmount || 0);
  const advancePaid = Number(booking.advanceAmount || 0);
  const remainingAmount = Math.max(totalAmount - advancePaid, 0);

  return `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 12px;
    overflow: hidden;
  ">

    <!-- HEADER -->
    <div style="
      background: #c9a96e;
      padding: 28px;
      text-align: center;
    ">
      <h1 style="
        color: white;
        margin: 0;
        font-size: 23px;
      ">
        KD Utsav Lawn
      </h1>

      <p style="
        color: rgba(255,255,255,0.9);
        margin: 6px 0 0;
        font-size: 13px;
      ">
        Kalawati Devi Utsav Lawn
      </p>
    </div>


    <!-- CONFIRMED STATUS -->
    <div style="
      background: #16a34a;
      padding: 14px;
      text-align: center;
    ">
      <p style="
        color: white;
        margin: 0;
        font-weight: bold;
        font-size: 16px;
      ">
        ✅ Booking Confirmed
      </p>
    </div>


    <!-- GREETING -->
    <div style="
      padding: 24px 28px 10px;
    ">

      <p style="
        font-size: 15px;
        color: #1f2937;
        margin: 0 0 10px;
      ">
        Namaskar <strong>${booking.contactName}</strong>,
      </p>

      <p style="
        font-size: 14px;
        color: #4b5563;
        line-height: 1.6;
        margin: 0;
      ">
        Your booking has been confirmed by our team.
        Please find your booking details below.
      </p>

    </div>


    <!-- BOOKING DETAILS -->
    <div style="
      margin: 20px 28px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    ">

      <!-- BOOKING ID -->
      <div style="
        background: #faf8f4;
        padding: 14px 18px;
        border-bottom: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        ">
          Booking ID:
          <strong style="color:#1f2937;">
            #${booking._id.toString().slice(-8).toUpperCase()}
          </strong>
        </p>
      </div>


      <!-- CUSTOMER + EVENT DETAILS -->
      <div style="padding: 18px;">

        <p style="
          font-weight: bold;
          color: #c9a96e;
          font-size: 12px;
          text-transform: uppercase;
          margin: 0 0 12px;
        ">
          Booking Details
        </p>

        <table style="
          width: 100%;
          font-size: 13px;
          border-collapse: collapse;
        ">

          <!-- Customer Name -->
          <tr>
            <td style="
              color: #6b7280;
              padding: 6px 0;
              width: 42%;
            ">
              Customer Name
            </td>

            <td style="
              color: #1f2937;
              font-weight: 500;
            ">
              ${booking.contactName}
            </td>
          </tr>


          <!-- Event Date -->
          <tr>
            <td style="
              color: #6b7280;
              padding: 6px 0;
            ">
              Event Date
            </td>

            <td style="
              color: #1f2937;
            ">
              ${eventDate}
            </td>
          </tr>


          <!-- Venue -->
          <tr>
            <td style="
              color: #6b7280;
              padding: 6px 0;
            ">
              Venue / Lawn
            </td>

            <td style="
              color: #1f2937;
            ">
              KD Utsav Lawn
            </td>
          </tr>


          <!-- Event Type -->
          <tr>
            <td style="
              color: #6b7280;
              padding: 6px 0;
            ">
              Event Type
            </td>

            <td style="
              color: #1f2937;
            ">
              ${booking.eventType}
            </td>
          </tr>


          <!-- Package -->
          <tr>
            <td style="
              color: #6b7280;
              padding: 6px 0;
            ">
              Package / Services
            </td>

            <td style="
              color: #1f2937;
            ">
              ${booking.package?.name || "—"}
            </td>
          </tr>


          <!-- Guests -->
          <tr>
            <td style="
              color: #6b7280;
              padding: 6px 0;
            ">
              Number of Guests
            </td>

            <td style="
              color: #1f2937;
            ">
              ${booking.guestCount} persons
            </td>
          </tr>

        </table>

      </div>


      <!-- AMOUNT DETAILS -->
      <div style="
        background: #c9a96e;
        padding: 18px;
      ">

        <p style="
          color: white;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
          margin: 0 0 10px;
        ">
          Payment Details
        </p>

        <table style="
          width: 100%;
          font-size: 14px;
          border-collapse: collapse;
        ">

          <!-- Total -->
          <tr>
            <td style="
              color: white;
              padding: 5px 0;
            ">
              Total Amount
            </td>

            <td style="
              color: white;
              font-weight: bold;
              text-align: right;
            ">
              ₹${totalAmount.toLocaleString("en-IN")}
            </td>
          </tr>


          <!-- Advance -->
          <tr>
            <td style="
              color: white;
              padding: 5px 0;
            ">
              Advance Paid
            </td>

            <td style="
              color: white;
              font-weight: bold;
              text-align: right;
            ">
              ₹${advancePaid.toLocaleString("en-IN")}
            </td>
          </tr>


          <!-- Remaining -->
          <tr>
            <td style="
              color: white;
              padding: 5px 0;
            ">
              Remaining Amount
            </td>

            <td style="
              color: white;
              font-weight: bold;
              text-align: right;
            ">
              ₹${remainingAmount.toLocaleString("en-IN")}
            </td>
          </tr>

        </table>

      </div>

    </div>


    <!-- CANCELLATION / RESCHEDULING -->
    <div style="
      margin: 0 28px 20px;
      background: #f9fafb;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 16px;
    ">

      <p style="
        font-size: 12px;
        font-weight: bold;
        color: #92400e;
        margin: 0 0 7px;
      ">
        Cancellation / Rescheduling
      </p>

      <p style="
        font-size: 13px;
        color: #374151;
        margin: 0;
        line-height: 1.6;
      ">
        For cancellation or rescheduling requests, please contact KD Utsav Lawn directly.
        Any applicable cancellation, rescheduling or refund terms will be communicated by our team.
      </p>

    </div>


    <!-- LOCATION -->
    <div style="
      margin: 0 28px 20px;
      background: #faf8f4;
      border: 1px solid #e5e7eb;
      border-radius: 10px;
      padding: 18px;
    ">

      <p style="
        font-size: 12px;
        font-weight: bold;
        color: #92400e;
        margin: 0 0 8px;
      ">
        Venue / Location
      </p>

      <p style="
        font-size: 13px;
        color: #374151;
        margin: 0 0 14px;
        line-height: 1.6;
      ">
        <strong>KD Utsav Lawn</strong><br>
        Teachers Colony, Gayatri Nagar Road,<br>
        Kunraghat, Gorakhpur,<br>
        Uttar Pradesh - 273008
      </p>

      <a
        href="https://www.google.com/maps/search/?api=1&query=KD+Utsav+Lawn+Teachers+Colony+Gayatri+Nagar+Road+Kunraghat+Gorakhpur+Uttar+Pradesh+273008"
        style="
          display: inline-block;
          background: #1f2937;
          color: white;
          padding: 11px 22px;
          border-radius: 7px;
          text-decoration: none;
          font-size: 13px;
          font-weight: bold;
        "
      >
        📍 View Location on Google Maps
      </a>

    </div>


    <!-- PAYMENT SECTION -->
    <div style="
      margin: 0 28px 24px;
      background: #fef9ee;
      border: 1px solid #f0d070;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
    ">

      <p style="
        font-size: 14px;
        color: #374151;
        margin: 0 0 14px;
        line-height: 1.5;
      ">
        Your booking has been confirmed.
        Please pay the required advance amount to secure your booking.
      </p>

      <a
        href="${payLink}"
        style="
          display: inline-block;
          background: #c9a96e;
          color: white;
          padding: 14px 28px;
          border-radius: 8px;
          text-decoration: none;
          font-size: 14px;
          font-weight: bold;
        "
      >
        Pay Booking Amount
      </a>

      <p style="
        font-size: 11px;
        color: #777;
        margin: 12px 0 0;
      ">
        If you have already completed the payment, please ignore this message.
      </p>

    </div>


    <!-- CONTACT DETAILS -->
    <div style="
      margin: 0 28px 28px;
      text-align: center;
    ">

      <p style="
        font-size: 13px;
        color: #6b7280;
        margin: 0;
      ">
        For any assistance, please contact us:
      </p>

      <p style="
        font-size: 14px;
        font-weight: bold;
        color: #1f2937;
        margin: 8px 0 0;
      ">
        📞 +91 8808085237
      </p>

      <p style="
        font-size: 13px;
        color: #6b7280;
        margin: 5px 0 0;
      ">
        ✉ kdutsavlawn@gmail.com
      </p>

    </div>


    <!-- FOOTER -->
    <div style="
      background: #c9a96e;
      padding: 18px;
      text-align: center;
    ">

      <p style="
        color: white;
        margin: 0;
        font-size: 12px;
      ">
        KD Utsav Lawn | +91 8808085237 | kdutsavlawn@gmail.com
      </p>

      <p style="
        color: rgba(255,255,255,0.8);
        margin: 6px 0 0;
        font-size: 11px;
      ">
        Teachers Colony, Gayatri Nagar Road, Kunraghat,
        Gorakhpur, Uttar Pradesh - 273008
      </p>

    </div>

  </div>
  `;
};

// ── Booking Rejected Email — customer ko admin reject karne par jayega ──
const bookingRejectedEmail = (booking) => {
  const eventDate = new Date(booking.eventDate).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return `
  <div style="
    font-family: Arial, sans-serif;
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border: 1px solid #eeeeee;
    border-radius: 12px;
    overflow: hidden;
  ">

    <!-- HEADER -->
    <div style="
      background: #c9a96e;
      padding: 28px;
      text-align: center;
    ">
      <h1 style="
        color: white;
        margin: 0;
        font-size: 23px;
      ">
        KD Utsav Lawn
      </h1>

      <p style="
        color: rgba(255,255,255,0.9);
        margin: 6px 0 0;
        font-size: 13px;
      ">
        Kalawati Devi Utsav Lawn
      </p>
    </div>


    <!-- STATUS -->
    <div style="
      background: #dc2626;
      padding: 14px;
      text-align: center;
    ">
      <p style="
        color: white;
        margin: 0;
        font-weight: bold;
        font-size: 16px;
      ">
        Booking Request Update
      </p>
    </div>


    <!-- MESSAGE -->
    <div style="
      padding: 24px 28px 10px;
    ">

      <p style="
        font-size: 15px;
        color: #1f2937;
        margin: 0 0 12px;
      ">
        Namaskar <strong>${booking.contactName}</strong>,
      </p>

      <p style="
        font-size: 14px;
        color: #4b5563;
        line-height: 1.6;
        margin: 0;
      ">
        We’re sorry, but the requested booking slot is currently unavailable.
      </p>

    </div>


    <!-- BOOKING DETAILS -->
    <div style="
      margin: 20px 28px;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      overflow: hidden;
    ">

      <div style="
        background: #faf8f4;
        padding: 14px 18px;
        border-bottom: 1px solid #e5e7eb;
      ">
        <p style="
          margin: 0;
          font-size: 13px;
          color: #6b7280;
        ">
          Booking ID:
          <strong style="color:#1f2937;">
            #${booking._id.toString().slice(-8).toUpperCase()}
          </strong>
        </p>
      </div>


      <div style="padding: 18px;">

        <p style="
          font-weight: bold;
          color: #c9a96e;
          font-size: 12px;
          text-transform: uppercase;
          margin: 0 0 12px;
        ">
          Booking Details
        </p>

        <table style="
          width: 100%;
          font-size: 13px;
          border-collapse: collapse;
        ">

          <tr>
            <td style="color:#6b7280;padding:6px 0;width:42%;">
              Customer Name
            </td>

            <td style="color:#1f2937;font-weight:500;">
              ${booking.contactName}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Event Date
            </td>

            <td style="color:#1f2937;">
              ${eventDate}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Event Type
            </td>

            <td style="color:#1f2937;">
              ${booking.eventType}
            </td>
          </tr>

          <tr>
            <td style="color:#6b7280;padding:6px 0;">
              Package / Services
            </td>

            <td style="color:#1f2937;">
              ${booking.package?.name || "—"}
            </td>
          </tr>

        </table>

      </div>


      <!-- STATUS -->
      <div style="
        background: #fef2f2;
        border-top: 1px solid #fecaca;
        padding: 14px 18px;
      ">

        <table style="
          width: 100%;
          font-size: 14px;
        ">

          <tr>
            <td style="
              font-weight: bold;
              color: #991b1b;
            ">
              Status
            </td>

            <td style="
              text-align: right;
              color: #dc2626;
              font-weight: bold;
            ">
              Booking Not Accepted
            </td>
          </tr>

        </table>

      </div>

    </div>


    <!-- ADMIN MESSAGE -->
    ${
      booking.adminNote
        ? `
        <div style="
          margin: 0 28px 20px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 10px;
          padding: 16px;
        ">

          <p style="
            font-size: 12px;
            font-weight: bold;
            color: #92400e;
            margin: 0 0 6px;
          ">
            Message from KD Utsav Lawn
          </p>

          <p style="
            font-size: 13px;
            color: #374151;
            margin: 0;
            line-height: 1.6;
          ">
            ${booking.adminNote}
          </p>

        </div>
        `
        : ""
    }


    <!-- ALTERNATIVE / REFUND -->
    <div style="
      margin: 0 28px 20px;
      background: #f9fafb;
      border-radius: 10px;
      padding: 16px;
    ">

      <p style="
        font-size: 13px;
        color: #374151;
        margin: 0;
        line-height: 1.6;
      ">
        If applicable, our team can help you with alternative
        dates/times or refund information.
      </p>

    </div>


    <!-- CONTACT -->
    <div style="
      margin: 0 28px 28px;
      text-align: center;
    ">

      <p style="
        font-size: 13px;
        color: #6b7280;
        margin: 0;
      ">
        For any assistance, please contact us:
      </p>

      <p style="
        font-size: 14px;
        font-weight: bold;
        color: #1f2937;
        margin: 8px 0 0;
      ">
        📞 +91 8808085237
      </p>

      <p style="
        font-size: 13px;
        color: #6b7280;
        margin: 5px 0 0;
      ">
        ✉ kdutsavlawn@gmail.com
      </p>

    </div>


    <!-- FOOTER -->
    <div style="
      background: #c9a96e;
      padding: 18px;
      text-align: center;
    ">

      <p style="
        color: white;
        margin: 0;
        font-size: 12px;
      ">
        KD Utsav Lawn | +91 8808085237 | kdutsavlawn@gmail.com
      </p>

      <p style="
        color: rgba(255,255,255,0.8);
        margin: 6px 0 0;
        font-size: 11px;
      ">
        Teachers Colony, Gayatri Nagar Road, Kunraghat,
        Gorakhpur, Uttar Pradesh - 273008
      </p>

    </div>

  </div>
  `;
};

// ── NEW: Admin payment alert — jab bhi payment aaye, admin ko notify ──
const adminPaymentAlertEmail = (booking, paidAmount, type, payment = {}) => {
  const totalAmount = Number(booking.totalAmount || 0);
  const totalPaid = Number(booking.advanceAmount || 0);

  const remainingAmount = Math.max(totalAmount - totalPaid, 0);

  const isPendingPayment = type === "pending";
  const isApprovedPayment = type === "approved";
  const isRejectedPayment = type === "rejected";

  const paymentStatus = isPendingPayment
    ? "Pending Verification"
    : isRejectedPayment
      ? "Rejected"
      : remainingAmount === 0
        ? "Fully Paid"
        : "Advance Paid";

  const paymentSource =
    isPendingPayment || isApprovedPayment || isRejectedPayment
      ? "QR Payment"
      : payment.source === "manual"
        ? "Manual Payment"
        : "Razorpay";

  const paymentMethod = payment.paymentMethod
    ? payment.paymentMethod
        .replace(/_/g, " ")
        .replace(/\b\w/g, (char) => char.toUpperCase())
    : paymentSource;

  const transactionId = payment.transactionId || "—";
  const note = payment.note || "—";
  const collectedBy = payment.collectedBy || "—";

  const paymentDate = payment.paidAt
    ? new Date(payment.paidAt).toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : new Date().toLocaleString("en-IN");

  const receiptAttachment = payment.receiptAttachment || "";

  const customerName =
    booking.contactName ||
    booking.user?.name ||
    booking.name ||
    booking.customerName ||
    "Customer";

  const customerPhone =
    booking.contactPhone || booking.user?.phone || booking.phone || "—";

  const customerEmail =
    booking.contactEmail || booking.user?.email || booking.email || "—";

  const bookingId = booking._id?.toString() || "—";

  const packageName = booking.package?.name || booking.packageName || "—";

  const eventDate = booking.eventDate
    ? new Date(booking.eventDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "—";

  const receiptRow = receiptAttachment
    ? `
      <tr>
        <td style="
          padding:10px;
          border:1px solid #e5e7eb;
          font-weight:bold;
          background:#f9fafb;
        ">
          Receipt
        </td>
        <td style="
          padding:10px;
          border:1px solid #e5e7eb;
        ">
          <a
            href="${receiptAttachment}"
            target="_blank"
            style="
              color:#2563eb;
              text-decoration:none;
              font-weight:bold;
            "
          >
            View Receipt
          </a>
        </td>
      </tr>
    `
    : "";

  return `
    <div
      style="
        font-family:Arial,Helvetica,sans-serif;
        background:#f5f5f5;
        padding:30px 15px;
      "
    >
      <div
        style="
          max-width:700px;
          margin:0 auto;
          background:#ffffff;
          border-radius:10px;
          overflow:hidden;
          box-shadow:0 2px 10px rgba(0,0,0,0.08);
        "
      >

        <!-- Header -->
        <div
          style="
            background:#1f2937;
            padding:25px;
            text-align:center;
          "
        >
          <h2
            style="
              color:#ffffff;
              margin:0;
              font-size:24px;
            "
          >
            ${
              isPendingPayment
                ? "📱 QR Payment Submitted"
                : isRejectedPayment
                  ? "❌ QR Payment Rejected"
                  : isApprovedPayment
                    ? "✅ QR Payment Approved"
                    : "💰 Payment Received"
            }
          </h2>
        </div>

        <!-- Body -->
        <div style="padding:30px;">

          <p
            style="
              font-size:16px;
              color:#374151;
              line-height:1.6;
              margin-top:0;
            "
          >
            ${
              isPendingPayment
                ? `
                  A QR payment of
                  <strong>
                    ₹${Number(paidAmount || 0).toLocaleString("en-IN")}
                  </strong>
                  has been submitted by the customer and is
                  <strong style="color:#d97706;">
                    pending verification
                  </strong>.
                `
                : `
                  A payment of
                  <strong>
                    ₹${Number(paidAmount || 0).toLocaleString("en-IN")}
                  </strong>
                  has been successfully received.
                `
            }
          </p>

          <!-- Booking Information -->
          <h3
            style="
              color:#111827;
              margin-top:25px;
              margin-bottom:12px;
            "
          >
            Booking Information
          </h3>

          <table
            style="
              width:100%;
              border-collapse:collapse;
              font-size:14px;
            "
          >

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                  width:40%;
                "
              >
                Customer
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${customerName}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Email
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${customerEmail}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Phone
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${customerPhone}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Booking ID
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${bookingId}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Package
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${packageName}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Event Date
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${eventDate}
              </td>
            </tr>

          </table>

          <!-- Payment Information -->
          <h3
            style="
              color:#111827;
              margin-top:30px;
              margin-bottom:12px;
            "
          >
            Payment Information
          </h3>

          <table
            style="
              width:100%;
              border-collapse:collapse;
              font-size:14px;
            "
          >

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Payment Type
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${
                  isPendingPayment
                    ? "QR Payment — Pending Verification"
                    : isRejectedPayment
                      ? "QR Payment — Rejected"
                      : isApprovedPayment
                        ? "QR Payment — Approved"
                        : type === "advance"
                          ? "Advance Payment"
                          : "Balance Payment"
                }
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Total Amount
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                "
              >
                ₹${totalAmount.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                This Payment
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                "
              >
                ₹${Number(paidAmount || 0).toLocaleString("en-IN")}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Payment Source
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${paymentSource}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Payment Mode
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${paymentMethod}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Transaction / UTR ID
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${transactionId}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Collected By
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${collectedBy}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Payment Date
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${paymentDate}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Note
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                "
              >
                ${note}
              </td>
            </tr>

            ${receiptRow}

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Total Paid
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                "
              >
                ₹${totalPaid.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Remaining
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                "
              >
                ₹${remainingAmount.toLocaleString("en-IN")}
              </td>
            </tr>

            <tr>
              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                  background:#f9fafb;
                "
              >
                Status
              </td>

              <td
                style="
                  padding:10px;
                  border:1px solid #e5e7eb;
                  font-weight:bold;
                "
              >
                ${paymentStatus}
              </td>
            </tr>

          </table>

          ${
            isPendingPayment
              ? `
                <div
                  style="
                    margin-top:25px;
                    padding:15px;
                    background:#fff7ed;
                    border:1px solid #fed7aa;
                    border-radius:6px;
                    color:#9a3412;
                  "
                >
                  <strong>Action Required:</strong>
                  Please verify the QR payment and approve or reject it
                  from the admin panel.
                </div>
              `
              : ""
          }

          <p
            style="
              margin-top:30px;
              color:#6b7280;
              font-size:13px;
              line-height:1.5;
            "
          >
            This is an automated payment notification from
            KD Utsav Lawn.
          </p>

        </div>
      </div>
    </div>
  `;
};

module.exports = {
  sendEmail,
  bookingConfirmEmail,
  bookingStatusEmail,
  bookingBillEmail,
  bookingRejectedEmail,
  adminBookingAlertEmail,
  confirmedPaymentLinkEmail,
  paymentReceiptEmail,
  adminPaymentAlertEmail,
};
