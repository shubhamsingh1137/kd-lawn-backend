const INTENTS = require("./intents");
const { normalizeText } = require("./normalizer");


function detectIntent(message) {

  const text = normalizeText(message);


  // ==========================================
  // GREETING
  // ==========================================

  if (
    /\b(hi|hello|hey|hii|namaste|नमस्ते)\b/i.test(text)
  ) {
    return INTENTS.GREETING;
  }


  // ==========================================
  // PACKAGES
  // ==========================================

  if (
    text.includes("package") ||
    text.includes("packages") ||
    text.includes("pkg") ||
    text.includes("price") ||
    text.includes("pricing") ||
    text.includes("rate")
  ) {
    return INTENTS.PACKAGE_LIST;
  }


  // ==========================================
  // AVAILABILITY
  // ==========================================

  if (
    text.includes("available") ||
    text.includes("availability") ||
    text.includes("khali") ||
    text.includes("booked") ||
    text.includes("free")
  ) {
    return INTENTS.AVAILABILITY;
  }


  // ==========================================
  // PAYMENT
  // ==========================================

  if (
    text.includes("payment") ||
    text.includes("paid") ||
    text.includes("paisa") ||
    text.includes("amount") ||
    text.includes("remaining") ||
    text.includes("baki")
  ) {
    return INTENTS.PAYMENT_STATUS;
  }


  // ==========================================
  // CONTACT
  // ==========================================

  if (
    text.includes("contact") ||
    text.includes("phone") ||
    text.includes("mobile") ||
    text.includes("number")
  ) {
    return INTENTS.CONTACT;
  }
  // ==========================================
// BOOKING
// ==========================================

if (
  text.includes("booking") ||
  text.includes("book") ||
  text.includes("bookings") ||
  text.includes("reserve") ||
  text.includes("reservation") ||
  text.includes("booking process") ||
  text.includes("how to book") ||
  text.includes("book kaise") ||
  text.includes("booking kaise")
) {
  return INTENTS.BOOKING;
}


  // ==========================================
  // LOCATION
  // ==========================================

  if (
    text.includes("location") ||
    text.includes("address") ||
    text.includes("kaha")
  ) {
    return INTENTS.LOCATION;
  }


  // ==========================================
  // HELP
  // ==========================================

  if (
    text.includes("help") ||
    text.includes("madad") ||
    text.includes("kya kar sakte")
  ) {
    return INTENTS.HELP;
  }


  // ==========================================
  // UNKNOWN
  // ==========================================

  return INTENTS.UNKNOWN;
}


// ==========================================
// EXPORT
// ==========================================

module.exports = {
  detectIntent
};