const express = require("express");
const axios = require("axios");
const router = express.Router();

router.post("/api/send-sms", async (req, res) => {
  const { name, phone, email, message } = req.body;

  try {
    const response = await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message:
          `Kalawati Enquiry!\n` +
          `Naam: ${name}\n` +
          `Phone: ${phone}\n` +
          `Email: ${email || "N/A"}\n` +
          `Msg: ${message || "N/A"}`,
        language: "english",
        flash: 0,
        numbers: process.env.ADMIN_PHONE,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
          "Content-Type": "application/json",
        },
      }
    );

    res.json({ success: true, data: response.data });
  } catch (err) {
    console.error("Fast2SMS error:", err.message);
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;