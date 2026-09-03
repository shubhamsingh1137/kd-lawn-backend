function generateResponse(intent, data) {

  switch (intent) {

    // ==========================================
    // GREETING
    // ==========================================

    case "GREETING":

      return {
        reply:
          "Hello 👋 Welcome to Kalawati Marriage Lawn. I can help you with packages, availability, bookings, payments and contact information."
      };


    // ==========================================
    // PACKAGES
    // ==========================================

    case "PACKAGE_LIST":

      if (!data || !data.length) {

        return {
          reply:
            "Currently package information is not available."
        };

      }

      return {
        reply:
          "Our available packages are:\n\n" +
          data
            .map(
              p =>
                `• ${p.name} — ₹${Number(
                  p.price || 0
                ).toLocaleString("en-IN")}`
            )
            .join("\n")
      };


    // ==========================================
    // AVAILABILITY
    // ==========================================

    case "AVAILABILITY":

      if (data?.available) {

        return {
          reply:
            "Yes 👍 The lawn appears to be available for this date."
        };

      }

      return {
        reply:
          "Sorry, this date already has a booking."
      };


    // ==========================================
    // BOOKING
    // ==========================================

    case "BOOKING":

      return {
        reply:
          "Sure! 😊 You can book Kalawati Marriage Lawn by clicking the 'Book Now' button. Select your event type, event date, package and guest count, then submit your booking request."
      };


    // ==========================================
    // PAYMENT STATUS
    // ==========================================

    case "PAYMENT_STATUS":

      if (!data?.length) {

        return {
          reply:
            "I couldn't find any booking/payment information for your account."
        };

      }

      return {
        reply:
          data
            .map(
              b =>
                `Booking #${String(b.bookingId)
                  .slice(-8)
                  .toUpperCase()}\n` +
                `Total: ₹${Number(
                  b.totalAmount || 0
                ).toLocaleString("en-IN")}\n` +
                `Paid: ₹${Number(
                  b.totalPaid || 0
                ).toLocaleString("en-IN")}\n` +
                `Remaining: ₹${Number(
                  b.remaining || 0
                ).toLocaleString("en-IN")}`
            )
            .join("\n\n")
      };


    // ==========================================
    // CONTACT
    // ==========================================

    case "CONTACT":

      return {
        reply:
          "You can contact Kalawati Marriage Lawn at +91 8808085237."
      };


    // ==========================================
    // LOCATION
    // ==========================================

    case "LOCATION":

      return {
        reply:
          "Kalawati Marriage Lawn is located in Gorakhpur."
      };


    // ==========================================
    // HELP
    // ==========================================

    case "HELP":

      return {
        reply:
          "I can help you with:\n\n" +
          "• Packages & prices\n" +
          "• Date availability\n" +
          "• Booking process\n" +
          "• Your bookings\n" +
          "• Payment status\n" +
          "• Remaining amount\n" +
          "• Contact information\n" +
          "• Lawn location"
      };


    // ==========================================
    // UNKNOWN
    // ==========================================

    default:

      return {
        reply:
          "Sorry, I didn't understand that. You can ask me about packages, availability, bookings, payments or contact information."
      };
  }
}


module.exports = {
  generateResponse
};