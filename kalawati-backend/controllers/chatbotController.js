const { detectIntent } = require("../services/aiAgent/agent");

const { getPackages } = require("../services/aiAgent/tools/packageTool");

const {
  checkAvailability,
} = require("../services/aiAgent/tools/availabilityTool");

const { getPaymentStatus } = require("../services/aiAgent/tools/paymentTool");

const { generateResponse } = require("../services/aiAgent/responseGenerator");

const chatWithAgent = async (req, res) => {
  try {
    const { message } = req.body;

    // ==========================================
    // VALIDATE MESSAGE
    // ==========================================

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required",
      });
    }

    // ==========================================
    // 1. DETECT USER INTENT
    // ==========================================

    const intent = detectIntent(message);

    console.log("CHATBOT MESSAGE:", message);
    console.log("DETECTED INTENT:", intent);

    // ==========================================
    // 2. RUN REQUIRED TOOL
    // ==========================================

    let data = null;

    switch (intent) {
      // ========================================
      // PACKAGE LIST
      // ========================================

      case "PACKAGE_LIST":
        data = await getPackages();

        break;

      // ========================================
      // PACKAGE DETAILS
      // ========================================

      case "PACKAGE_DETAILS":
        /*
         * Currently using package tool.
         *
         * Later packageTool can be enhanced
         * to return full package details.
         */

        data = await getPackages();

        break;

      // ========================================
      // AVAILABILITY
      // ========================================

      case "AVAILABILITY":
        /*
         * Current availabilityTool implementation
         * will decide how availability is checked.
         *
         * Later we will extract the actual date
         * from the user's message.
         */

        try {
          data = await checkAvailability(message);
        } catch (error) {
          console.error("Availability tool error:", error);

          data = {
            available: false,
          };
        }

        break;

      // ========================================
      // BOOKING
      // ========================================

      case "BOOKING":
        data = {
          message:
            "Customer can book Kalawati Marriage Lawn by using the Book Now option.",
        };

        break;

      // ========================================
      // BOOKING PROCESS
      // ========================================

      case "BOOKING_PROCESS":
        data = {
          message:
            "Customer can book Kalawati Marriage Lawn by clicking the Book Now button and entering event details.",
        };

        break;

      // ========================================
      // BOOKING INFO
      // ========================================

      case "BOOKING_INFO":
        data = {
          message:
            "Booking requires customer details, event type, event date, package and guest count.",
        };

        break;

      // ========================================
      // BOOKING STATUS
      // ========================================

      case "BOOKING_STATUS":
        /*
         * Booking-specific tool is not available yet.
         *
         * Do not return fake booking information.
         */

        if (!req.user) {
          return res.json({
            success: true,
            intent,
            reply: "Please login first so I can check your booking status.",
          });
        }

        /*
         * Temporary response until bookingTool
         * is connected.
         */

        data = null;

        break;

      // ========================================
      // MY BOOKINGS
      // ========================================

      case "MY_BOOKINGS":
        if (!req.user) {
          return res.json({
            success: true,
            intent,
            reply: "Please login first so I can check your bookings.",
          });
        }

        /*
         * Booking tool needs to be added here.
         */

        data = null;

        break;

      // ========================================
      // PAYMENT STATUS
      // ========================================

      case "PAYMENT_STATUS":
        if (!req.user) {
          return res.json({
            success: true,
            intent,
            reply:
              "Please login first so I can check your booking and payment details.",
          });
        }

        data = await getPaymentStatus(req.user._id);

        break;

      // ========================================
      // PAYMENT HISTORY
      // ========================================

      case "PAYMENT_HISTORY":
        if (!req.user) {
          return res.json({
            success: true,
            intent,
            reply: "Please login first so I can check your payment history.",
          });
        }

        /*
         * Existing paymentTool currently provides
         * payment status.
         *
         * Payment history should be added to
         * paymentTool separately.
         */

        data = await getPaymentStatus(req.user._id);

        break;

      // ========================================
      // PAYMENT METHOD
      // ========================================

      case "PAYMENT_METHOD":
        data = {
          methods: ["Razorpay", "UPI / QR", "Cash", "Bank Transfer"],
        };

        break;

      // ========================================
      // CANCELLATION
      // ========================================

      case "CANCELLATION":
        data = {
          message:
            "Customers can cancel their booking according to the applicable booking cancellation terms.",
        };

        break;

      // ========================================
      // RESCHEDULE
      // ========================================

      case "RESCHEDULE":
        data = {
          message:
            "Booking rescheduling depends on date availability and applicable booking terms.",
        };

        break;

      // ========================================
      // REFUND
      // ========================================

      case "REFUND":
        data = {
          message:
            "Refunds are subject to the applicable cancellation and refund terms.",
        };

        break;

      // ========================================
      // CONTACT
      // ========================================

      case "CONTACT":
        data = {
          phone: "+91 8808085237",
        };

        break;

      // ========================================
      // LOCATION
      // ========================================

      case "LOCATION":
        data = {
          city: "Gorakhpur",
        };

        break;

      // ========================================
      // TIMING
      // ========================================

      case "TIMING":
        data = null;

        break;

      // ========================================
      // FACILITIES
      // ========================================

      case "FACILITIES":
        data = null;

        break;

      // ========================================
      // DECORATION
      // ========================================

      case "DECORATION":
        data = null;

        break;

      // ========================================
      // PARKING
      // ========================================

      case "PARKING":
        data = null;

        break;

      // ========================================
      // CAPACITY
      // ========================================

      case "CAPACITY":
        data = null;

        break;

      // ========================================
      // FOOD
      // ========================================

      case "FOOD":
        data = null;

        break;

      // ========================================
      // TERMS
      // ========================================

      case "TERMS":
        data = null;

        break;

      // ========================================
      // ABOUT LAWN
      // ========================================

      case "ABOUT_LAWN":
        data = null;

        break;

      // ========================================
      // BUSINESS INFO
      // ========================================

      case "BUSINESS_INFO":
        data = null;

        break;

      // ========================================
      // GREETING
      // ========================================

      case "GREETING":
        data = null;

        break;

      // ========================================
      // THANK YOU
      // ========================================

      case "THANK_YOU":
        data = null;

        break;

      // ========================================
      // HELP
      // ========================================

      case "HELP":
        data = null;

        break;

      // ========================================
      // UNKNOWN
      // ========================================

      case "UNKNOWN":

      default:
        data = null;

        break;
    }

    // ==========================================
    // 3. GENERATE RESPONSE
    // ==========================================

    const response = generateResponse(intent, data);

    // ==========================================
    // 4. SEND RESPONSE TO FRONTEND
    // ==========================================

    return res.json({
      success: true,

      intent,

      reply: response.reply,
    });
  } catch (error) {
    console.error("CHATBOT ERROR:", error);

    return res.status(500).json({
      success: false,

      message: "Chatbot failed",

      reply: "Sorry, something went wrong. Please try again.",
    });
  }
};

module.exports = {
  chatWithAgent,
};
