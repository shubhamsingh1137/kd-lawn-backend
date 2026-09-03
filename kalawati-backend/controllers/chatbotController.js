const {
  detectIntent
} = require("../services/aiAgent/agent");

const {
  getPackages
} = require("../services/aiAgent/tools/packageTool");

const {
  checkAvailability
} = require("../services/aiAgent/tools/availabilityTool");

const {
  getPaymentStatus
} = require("../services/aiAgent/tools/paymentTool");

const {
  generateResponse
} = require("../services/aiAgent/responseGenerator");


const chatWithAgent = async (req, res) => {

  try {

    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message is required"
      });
    }


    // ==========================================
    // 1. DETECT USER INTENT
    // ==========================================

    const intent = detectIntent(message);


    // ==========================================
    // 2. RUN REQUIRED TOOL
    // ==========================================

    let data = null;


    switch (intent) {

      // ------------------------------------------
      // PACKAGE
      // ------------------------------------------

      case "PACKAGE_LIST":

        data = await getPackages();

        break;


      // ------------------------------------------
      // AVAILABILITY
      // ------------------------------------------

      case "AVAILABILITY":

        /*
         * Abhi temporary response.
         *
         * Next step mein hum entityExtractor.js
         * se actual date nikaalenge.
         */

        data = {
          available: true
        };

        break;

        case "BOOKING":

       data = {
          message:
        "Customer can book Kalawati Marriage Lawn by using the Book Now option."
        };

        break;


      // ------------------------------------------
      // PAYMENT STATUS
      // ------------------------------------------

      case "PAYMENT_STATUS":

        // User login nahi hai
        if (!req.user) {

          return res.json({
            success: true,
            intent,
            reply:
              "Please login first so I can check your booking and payment details."
          });

        }


        // Logged-in user ki payment information
        data = await getPaymentStatus(
          req.user._id
        );

        break;


      // ------------------------------------------
      // DEFAULT
      // ------------------------------------------

      default:

        data = null;

        break;
    }


    // ==========================================
    // 3. GENERATE RESPONSE
    // ==========================================

    const response = generateResponse(
      intent,
      data
    );


    // ==========================================
    // 4. SEND RESPONSE TO FRONTEND
    // ==========================================

    return res.json({

      success: true,

      intent,

      reply: response.reply

    });


  } catch (error) {

    console.error(
      "CHATBOT ERROR:",
      error
    );


    return res.status(500).json({

      success: false,

      message:
        "Chatbot failed",

      reply:
        "Sorry, something went wrong. Please try again."

    });

  }
};


module.exports = {
  chatWithAgent
};