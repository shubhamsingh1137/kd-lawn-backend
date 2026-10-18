const nodemailer = require("nodemailer");

const sendOTPEmail = async (email, otp) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, EMAIL_FROM } =
    process.env;

  if (!EMAIL_HOST || !EMAIL_PORT || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error("OTP email configuration is missing");
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Valid customer email is required");
  }

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: Number(EMAIL_PORT),
    secure: Number(EMAIL_PORT) === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: EMAIL_FROM || EMAIL_USER,
    to: email,
    subject: "Your KD Utsav Lawn Login OTP",
    text: `Your login OTP is ${otp}. It is valid for 10 minutes. Do not share this code with anyone.`,
    html: `
      <div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;padding:24px;border:1px solid #eee;border-radius:12px">
        <h2 style="color:#7c3aed">KD Utsav Lawn</h2>
        <p>Your login verification code is:</p>
        <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:16px;background:#f5f3ff;text-align:center;border-radius:8px">
          ${otp}
        </div>
        <p>This OTP is valid for <strong>10 minutes</strong>.</p>
        <p>For your security, do not share this code with anyone.</p>
        <p style="color:#777;font-size:12px">If you did not request this code, please ignore this email.</p>
      </div>
    `,
  });
};

module.exports = sendOTPEmail;
