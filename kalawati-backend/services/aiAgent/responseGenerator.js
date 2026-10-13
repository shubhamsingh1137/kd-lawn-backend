function generateResponse(intent, data) {
  switch (intent) {
    // ==========================================
    // GREETING
    // ==========================================

    case "GREETING":
      return {
        reply:
          "Hello 👋 Welcome to Kalawati Marriage Lawn! I can help you with packages, availability, bookings, payments, facilities, location and more. How can I help you?",
      };

    // ==========================================
    // THANK YOU
    // ==========================================

    case "THANK_YOU":
      return {
        reply:
          "You're welcome! 😊 If you need any more information about Kalawati Marriage Lawn, feel free to ask.",
      };

    // ==========================================
    // PACKAGE LIST
    // ==========================================

    case "PACKAGE_LIST":
      if (!data || !data.length) {
        return {
          reply:
            "Currently package information is not available. Please contact us for package details.",
        };
      }

      return {
        reply:
          "Our available packages are:\n\n" +
          data
            .map(
              (p) =>
                `• ${p.name} — ₹${Number(p.price || 0).toLocaleString(
                  "en-IN",
                )}`,
            )
            .join("\n"),
      };

    // ==========================================
    // PACKAGE DETAILS
    // ==========================================

    case "PACKAGE_DETAILS":
      if (!data || !data.length) {
        return {
          reply:
            "Package details are currently unavailable. Please contact us for more information.",
        };
      }

      return {
        reply:
          "Here are our package details:\n\n" +
          data
            .map((p) => {
              let response = `• ${p.name}`;

              if (p.price) {
                response += ` — ₹${Number(p.price).toLocaleString("en-IN")}`;
              }

              if (p.description) {
                response += `\n  ${p.description}`;
              }

              return response;
            })
            .join("\n\n"),
      };

    // ==========================================
    // AVAILABILITY
    // ==========================================

    case "AVAILABILITY":
      if (data?.available) {
        return {
          reply: data?.date
            ? `Yes 👍 Kalawati Marriage Lawn is available for ${data.date}.`
            : "Yes 👍 The lawn appears to be available for this date.",
        };
      }

      return {
        reply: data?.date
          ? `Sorry, Kalawati Marriage Lawn is already booked for ${data.date}.`
          : "Sorry, this date already has a booking.",
      };

    // ==========================================
    // BOOKING
    // ==========================================

    case "BOOKING":
      return {
        reply:
          "Sure! 😊 You can book Kalawati Marriage Lawn by clicking the 'Book Now' button. Select your event type, event date, package and guest count, then submit your booking request.",
      };

    // ==========================================
    // BOOKING PROCESS
    // ==========================================

    case "BOOKING_PROCESS":
      return {
        reply:
          "Booking Kalawati Marriage Lawn is easy 😊\n\n" +
          "1. Click on the 'Book Now' button.\n" +
          "2. Select your event type.\n" +
          "3. Select your event date.\n" +
          "4. Choose your package.\n" +
          "5. Enter the number of guests.\n" +
          "6. Submit your booking request.\n" +
          "7. Once your booking is confirmed, you can make the required payment.",
      };

    // ==========================================
    // BOOKING INFO
    // ==========================================

    case "BOOKING_INFO":
      return {
        reply:
          "To make a booking, you generally need to provide your name, mobile number, email, event type, event date, selected package and guest count. You can provide these details through the 'Book Now' option.",
      };

    // ==========================================
    // BOOKING STATUS
    // ==========================================

    case "BOOKING_STATUS":
      if (!data || !data.length) {
        return {
          reply:
            "I couldn't find any booking information for your account. Please login first and try again.",
        };
      }

      return {
        reply: data
          .map(
            (b) =>
              `Booking #${String(b.bookingId).slice(-8).toUpperCase()}\n` +
              `Status: ${b.status || "Unknown"}\n` +
              `Event Date: ${b.eventDate || "Not available"}`,
          )
          .join("\n\n"),
      };

    // ==========================================
    // MY BOOKINGS
    // ==========================================

    case "MY_BOOKINGS":
      if (!data || !data.length) {
        return {
          reply:
            "I couldn't find any bookings for your account. Please login first or create a new booking.",
        };
      }

      return {
        reply:
          "Here are your bookings:\n\n" +
          data
            .map(
              (b, index) =>
                `${index + 1}. Booking #${String(b.bookingId)
                  .slice(-8)
                  .toUpperCase()}\n` +
                `Event Date: ${b.eventDate || "Not available"}\n` +
                `Status: ${b.status || "Unknown"}\n` +
                `Total Amount: ₹${Number(b.totalAmount || 0).toLocaleString(
                  "en-IN",
                )}`,
            )
            .join("\n\n"),
      };

    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    case "PAYMENT_STATUS":
      if (!data?.length) {
        return {
          reply:
            "I couldn't find any booking or payment information for your account. Please login first.",
        };
      }

      return {
        reply: data
          .map(
            (b) =>
              `Booking #${String(b.bookingId).slice(-8).toUpperCase()}\n` +
              `Total: ₹${Number(b.totalAmount || 0).toLocaleString(
                "en-IN",
              )}\n` +
              `Paid: ₹${Number(b.totalPaid || 0).toLocaleString("en-IN")}\n` +
              `Remaining: ₹${Number(b.remaining || 0).toLocaleString("en-IN")}`,
          )
          .join("\n\n"),
      };

    // ==========================================
    // PAYMENT METHOD
    // ==========================================

    case "PAYMENT_METHOD":
      return {
        reply:
          "You can make your payment using the available payment options on your booking page. Online payment through Razorpay and QR/UPI payment are supported. For QR/UPI payments, you may need to submit the transaction/UTR details and payment receipt.",
      };

    // ==========================================
    // PAYMENT HISTORY
    // ==========================================

    case "PAYMENT_HISTORY":
      if (!data?.length) {
        return {
          reply:
            "I couldn't find any payment history for your account. Please login first.",
        };
      }

      return {
        reply: data
          .map((b) => {
            const payments = Array.isArray(b.paymentHistory)
              ? b.paymentHistory
              : [];

            if (!payments.length) {
              return (
                `Booking #${String(b.bookingId).slice(-8).toUpperCase()}\n` +
                "No payment transactions found."
              );
            }

            const paymentText = payments
              .map(
                (payment, index) =>
                  `${index + 1}. ₹${Number(payment.amount || 0).toLocaleString(
                    "en-IN",
                  )}\n` +
                  `Mode: ${
                    payment.paymentMethod || payment.source || "Unknown"
                  }\n` +
                  `Status: ${payment.status || "Unknown"}\n` +
                  `${
                    payment.paidAt
                      ? `Date: ${new Date(payment.paidAt).toLocaleDateString(
                          "en-IN",
                        )}`
                      : ""
                  }`,
              )
              .join("\n\n");

            return (
              `Booking #${String(b.bookingId).slice(-8).toUpperCase()}\n\n` +
              paymentText
            );
          })
          .join("\n\n----------------\n\n"),
      };

    // ==========================================
    // CANCELLATION
    // ==========================================

    case "CANCELLATION":
      return {
        reply:
          "If you want to cancel your booking, please open your booking details and use the cancellation option if it is available. Cancellation and refund will be subject to the applicable booking terms and conditions.",
      };

    // ==========================================
    // RESCHEDULE
    // ==========================================

    case "RESCHEDULE":
      return {
        reply:
          "If you want to change your booking date, please contact Kalawati Marriage Lawn or check the booking management options available for your booking. Rescheduling depends on date availability and applicable terms.",
      };

    // ==========================================
    // REFUND
    // ==========================================

    case "REFUND":
      return {
        reply:
          "Refunds depend on the booking cancellation and refund terms applicable to your booking. Please contact Kalawati Marriage Lawn with your booking details for refund-related assistance.",
      };

    // ==========================================
    // CONTACT
    // ==========================================

    case "CONTACT":
      return {
        reply: "You can contact Kalawati Marriage Lawn at +91 8808085237.",
      };

    // ==========================================
    // LOCATION
    // ==========================================

    case "LOCATION":
      return {
        reply:
          "Kalawati Marriage Lawn is located in Gorakhpur. You can contact us for the complete address and location details.",
      };

    // ==========================================
    // TIMING
    // ==========================================

    case "TIMING":
      return {
        reply:
          "Please contact Kalawati Marriage Lawn at +91 8808085237 for the current lawn timings and event-specific timing information.",
      };

    // ==========================================
    // FACILITIES
    // ==========================================

    case "FACILITIES":
      return {
        reply:
          "Kalawati Marriage Lawn provides facilities for wedding and other events. For the complete list of available facilities, please contact us or ask me about a specific facility such as parking, decoration, food or guest capacity.",
      };

    // ==========================================
    // DECORATION
    // ==========================================

    case "DECORATION":
      return {
        reply:
          "Decoration options may be available depending on the selected package and event requirements. Please contact us for available decoration options and pricing.",
      };

    // ==========================================
    // PARKING
    // ==========================================

    case "PARKING":
      return {
        reply:
          "For parking availability and capacity, please contact Kalawati Marriage Lawn at +91 8808085237.",
      };

    // ==========================================
    // CAPACITY
    // ==========================================

    case "CAPACITY":
      return {
        reply:
          "For the lawn's current guest capacity and seating arrangement, please contact us with your event requirements.",
      };

    // ==========================================
    // FOOD
    // ==========================================

    case "FOOD":
      return {
        reply:
          "Food and catering options may depend on the selected package and event requirements. Please contact us for the available catering and menu options.",
      };

    // ==========================================
    // TERMS
    // ==========================================

    case "TERMS":
      return {
        reply:
          "Booking terms and conditions apply to reservations, payments, cancellations, rescheduling and refunds. Please check the booking terms provided during the booking process or contact us for clarification.",
      };

    // ==========================================
    // ABOUT LAWN
    // ==========================================

    case "ABOUT_LAWN":
      return {
        reply:
          "Kalawati Marriage Lawn is an event and marriage venue in Gorakhpur. It is suitable for weddings, marriage functions and other events. You can ask me about packages, availability, booking, payments and facilities.",
      };

    // ==========================================
    // BUSINESS INFO
    // ==========================================

    case "BUSINESS_INFO":
      return {
        reply:
          "Kalawati Marriage Lawn is a marriage and event venue based in Gorakhpur. For business, booking, package or contact-related information, please ask me your specific question.",
      };

    // ==========================================
    // HELP
    // ==========================================

    case "HELP":
      return {
        reply:
          "I can help you with:\n\n" +
          "• Packages & prices\n" +
          "• Package details\n" +
          "• Date availability\n" +
          "• Booking process\n" +
          "• Booking status\n" +
          "• Your bookings\n" +
          "• Payment methods\n" +
          "• Payment status\n" +
          "• Payment history\n" +
          "• Cancellation\n" +
          "• Rescheduling\n" +
          "• Refund information\n" +
          "• Location & contact\n" +
          "• Lawn timings\n" +
          "• Facilities\n" +
          "• Decoration\n" +
          "• Parking\n" +
          "• Guest capacity\n" +
          "• Food & catering\n" +
          "• Terms & conditions",
      };

    // ==========================================
    // UNKNOWN
    // ==========================================

    case "UNKNOWN":

    default:
      return {
        reply:
          "Sorry, I didn't understand that. 😊 You can ask me about packages, availability, booking, payment, cancellation, location, facilities, parking, decoration, food or any other Kalawati Marriage Lawn information.",
      };
  }
}

module.exports = {
  generateResponse,
};
