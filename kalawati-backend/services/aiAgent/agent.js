const INTENTS = require("./intents");
const { normalizeText } = require("./normalizer");

function detectIntent(message) {
  const text = normalizeText(message);

  // ==========================================
  // GREETING
  // ==========================================

  if (/\b(hi|hello|hey|hii|heyy|namaste|नमस्ते|नमस्कार)\b/i.test(text)) {
    return INTENTS.GREETING;
  }

  // ==========================================
  // THANK YOU
  // ==========================================

  if (
    text.includes("thank you") ||
    text.includes("thanks") ||
    text.includes("thank") ||
    text.includes("dhanyawad") ||
    text.includes("dhanyavaad") ||
    text.includes("shukriya") ||
    text.includes("bahut acha") ||
    text.includes("thanks a lot")
  ) {
    return INTENTS.THANK_YOU;
  }

  // ==========================================
  // PACKAGE DETAILS
  // ==========================================

  if (
    text.includes("package detail") ||
    text.includes("package details") ||
    text.includes("package me kya") ||
    text.includes("package mein kya") ||
    text.includes("package includes") ||
    text.includes("package included") ||
    text.includes("package mein kya hai") ||
    text.includes("package me kya hai") ||
    text.includes("kya kya included") ||
    text.includes("package ki details") ||
    text.includes("package ka detail")
  ) {
    return INTENTS.PACKAGE_DETAILS;
  }

  // ==========================================
  // PACKAGE LIST
  // ==========================================

  if (
    text.includes("package") ||
    text.includes("packages") ||
    text.includes("pkg") ||
    text.includes("pricing") ||
    text.includes("price") ||
    text.includes("prices") ||
    text.includes("rate") ||
    text.includes("rates") ||
    text.includes("kitne ka") ||
    text.includes("kitna price") ||
    text.includes("kitna charge") ||
    text.includes("charges") ||
    text.includes("cost") ||
    text.includes("budget")
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
    text.includes("khali hai") ||
    text.includes("booked") ||
    text.includes("free") ||
    text.includes("date available") ||
    text.includes("date khali") ||
    text.includes("date free") ||
    text.includes("date available hai") ||
    text.includes("booking available") ||
    text.includes("booking open")
  ) {
    return INTENTS.AVAILABILITY;
  }

  // ==========================================
  // BOOKING STATUS
  // ==========================================

  if (
    text.includes("booking status") ||
    text.includes("meri booking") ||
    text.includes("my booking") ||
    text.includes("booking confirm") ||
    text.includes("booking confirmed") ||
    text.includes("booking pending") ||
    text.includes("booking rejected") ||
    text.includes("booking cancel") ||
    text.includes("booking complete") ||
    text.includes("meri booking ka status") ||
    text.includes("mera booking status")
  ) {
    return INTENTS.BOOKING_STATUS;
  }

  // ==========================================
  // MY BOOKINGS
  // ==========================================

  if (
    text.includes("my bookings") ||
    text.includes("meri bookings") ||
    text.includes("meri booking details") ||
    text.includes("my booking details") ||
    text.includes("meri sari booking") ||
    text.includes("meri saari booking") ||
    text.includes("meri bookings dikhao") ||
    text.includes("my bookings dikhao")
  ) {
    return INTENTS.MY_BOOKINGS;
  }

  // ==========================================
  // BOOKING PROCESS
  // ==========================================

  if (
    text.includes("booking process") ||
    text.includes("how to book") ||
    text.includes("how can i book") ||
    text.includes("booking kaise") ||
    text.includes("booking kaise kare") ||
    text.includes("booking kaise karu") ||
    text.includes("booking kaise karni") ||
    text.includes("book kaise") ||
    text.includes("book kaise kare") ||
    text.includes("book kaise karu") ||
    text.includes("kaise book") ||
    text.includes("kaise booking") ||
    text.includes("booking karne ka tarika") ||
    text.includes("booking karne ka process")
  ) {
    return INTENTS.BOOKING_PROCESS;
  }

  // ==========================================
  // BOOKING INFO
  // ==========================================

  if (
    text.includes("booking information") ||
    text.includes("booking info") ||
    text.includes("booking ke liye kya") ||
    text.includes("booking ke liye kya chahiye") ||
    text.includes("book karne ke liye kya") ||
    text.includes("booking requirements") ||
    text.includes("booking requirement")
  ) {
    return INTENTS.BOOKING_INFO;
  }

  // ==========================================
  // BOOKING
  // ==========================================

  if (
    text.includes("booking") ||
    text.includes("book") ||
    text.includes("reserve") ||
    text.includes("reservation") ||
    text.includes("reserve karna") ||
    text.includes("book karna")
  ) {
    return INTENTS.BOOKING;
  }

  // ==========================================
  // PAYMENT METHOD
  // ==========================================

  if (
    text.includes("payment method") ||
    text.includes("payment methods") ||
    text.includes("payment kaise") ||
    text.includes("payment kaise kare") ||
    text.includes("payment kaise karu") ||
    text.includes("pay kaise") ||
    text.includes("pay kaise karu") ||
    text.includes("upi") ||
    text.includes("qr payment") ||
    text.includes("qr se payment") ||
    text.includes("razorpay") ||
    text.includes("cash payment") ||
    text.includes("bank transfer") ||
    text.includes("card payment") ||
    text.includes("online payment")
  ) {
    return INTENTS.PAYMENT_METHOD;
  }

  // ==========================================
  // PAYMENT HISTORY
  // ==========================================

  if (
    text.includes("payment history") ||
    text.includes("payment history dikhao") ||
    text.includes("meri payment history") ||
    text.includes("my payment history") ||
    text.includes("payment transactions") ||
    text.includes("payment transaction") ||
    text.includes("meri payments") ||
    text.includes("meri payment details") ||
    text.includes("payment details dikhao")
  ) {
    return INTENTS.PAYMENT_HISTORY;
  }

  // ==========================================
  // PAYMENT STATUS
  // ==========================================

  if (
    text.includes("payment status") ||
    text.includes("payment pending") ||
    text.includes("payment successful") ||
    text.includes("payment success") ||
    text.includes("payment failed") ||
    text.includes("payment approve") ||
    text.includes("payment approved") ||
    text.includes("payment reject") ||
    text.includes("payment rejected") ||
    text.includes("meri payment") ||
    text.includes("mera payment") ||
    text.includes("maine kitna pay") ||
    text.includes("kitna pay kiya") ||
    text.includes("kitna payment kiya") ||
    text.includes("kitna paid") ||
    text.includes("paid amount") ||
    text.includes("remaining amount") ||
    text.includes("remaining") ||
    text.includes("baki amount") ||
    text.includes("baki paisa") ||
    text.includes("kitna baki") ||
    text.includes("paisa baki") ||
    text.includes("amount baki") ||
    text.includes("advance kitna")
  ) {
    return INTENTS.PAYMENT_STATUS;
  }

  // ==========================================
  // CANCELLATION
  // ==========================================

  if (
    text.includes("cancel booking") ||
    text.includes("booking cancel") ||
    text.includes("cancel karna") ||
    text.includes("cancel karni") ||
    text.includes("booking cancellation") ||
    text.includes("cancellation") ||
    text.includes("booking ko cancel")
  ) {
    return INTENTS.CANCELLATION;
  }

  // ==========================================
  // RESCHEDULE
  // ==========================================

  if (
    text.includes("reschedule") ||
    text.includes("rescheduling") ||
    text.includes("date change") ||
    text.includes("date change karna") ||
    text.includes("booking date change") ||
    text.includes("booking ki date change") ||
    text.includes("date badal") ||
    text.includes("date badalna") ||
    text.includes("booking postpone")
  ) {
    return INTENTS.RESCHEDULE;
  }

  // ==========================================
  // REFUND
  // ==========================================

  if (
    text.includes("refund") ||
    text.includes("refund kab") ||
    text.includes("refund kaise") ||
    text.includes("refund milega") ||
    text.includes("paisa wapas") ||
    text.includes("money back") ||
    text.includes("payment return")
  ) {
    return INTENTS.REFUND;
  }

  // ==========================================
  // LOCATION
  // ==========================================

  if (
    text.includes("location") ||
    text.includes("address") ||
    text.includes("kaha") ||
    text.includes("kahan") ||
    text.includes("kidhar") ||
    text.includes("where") ||
    text.includes("lawn kaha") ||
    text.includes("lawn kahan")
  ) {
    return INTENTS.LOCATION;
  }

  // ==========================================
  // CONTACT
  // ==========================================

  if (
    text.includes("contact") ||
    text.includes("contact number") ||
    text.includes("phone") ||
    text.includes("mobile") ||
    text.includes("number") ||
    text.includes("call") ||
    text.includes("phone number") ||
    text.includes("whatsapp")
  ) {
    return INTENTS.CONTACT;
  }

  // ==========================================
  // TIMING
  // ==========================================

  if (
    text.includes("timing") ||
    text.includes("time") ||
    text.includes("open time") ||
    text.includes("closing time") ||
    text.includes("opening time") ||
    text.includes("kab open") ||
    text.includes("kab band") ||
    text.includes("kitne baje") ||
    text.includes("samay") ||
    text.includes("hours")
  ) {
    return INTENTS.TIMING;
  }

  // ==========================================
  // FACILITIES
  // ==========================================

  if (
    text.includes("facility") ||
    text.includes("facilities") ||
    text.includes("suvidha") ||
    text.includes("amenities") ||
    text.includes("services") ||
    text.includes("kya facilities") ||
    text.includes("kya facility")
  ) {
    return INTENTS.FACILITIES;
  }

  // ==========================================
  // DECORATION
  // ==========================================

  if (
    text.includes("decoration") ||
    text.includes("decor") ||
    text.includes("decorate") ||
    text.includes("decoration available") ||
    text.includes("decoration hai") ||
    text.includes("sajawat") ||
    text.includes("sajawat available") ||
    text.includes("stage decoration")
  ) {
    return INTENTS.DECORATION;
  }

  // ==========================================
  // PARKING
  // ==========================================

  if (
    text.includes("parking") ||
    text.includes("car parking") ||
    text.includes("vehicle parking") ||
    text.includes("parking available") ||
    text.includes("parking hai") ||
    text.includes("gaadi parking") ||
    text.includes("gadi parking")
  ) {
    return INTENTS.PARKING;
  }

  // ==========================================
  // CAPACITY
  // ==========================================

  if (
    text.includes("capacity") ||
    text.includes("kitne log") ||
    text.includes("kitna guest") ||
    text.includes("kitne guest") ||
    text.includes("guest capacity") ||
    text.includes("people capacity") ||
    text.includes("maximum guests") ||
    text.includes("maximum guest") ||
    text.includes("kitne logo") ||
    text.includes("kitne aadmi")
  ) {
    return INTENTS.CAPACITY;
  }

  // ==========================================
  // FOOD / CATERING
  // ==========================================

  if (
    text.includes("food") ||
    text.includes("catering") ||
    text.includes("khana") ||
    text.includes("khaana") ||
    text.includes("khane") ||
    text.includes("food available") ||
    text.includes("catering available") ||
    text.includes("catering hai") ||
    text.includes("food hai") ||
    text.includes("menu") ||
    text.includes("dinner") ||
    text.includes("lunch")
  ) {
    return INTENTS.FOOD;
  }

  // ==========================================
  // TERMS & CONDITIONS
  // ==========================================

  if (
    text.includes("terms") ||
    text.includes("terms and conditions") ||
    text.includes("terms conditions") ||
    text.includes("conditions") ||
    text.includes("rules") ||
    text.includes("booking rules") ||
    text.includes("policy") ||
    text.includes("policies") ||
    text.includes("niyam") ||
    text.includes("sharte")
  ) {
    return INTENTS.TERMS;
  }

  // ==========================================
  // ABOUT LAWN
  // ==========================================

  if (
    text.includes("about lawn") ||
    text.includes("about kalawati") ||
    text.includes("kalawati ke bare") ||
    text.includes("kalawati ke baare") ||
    text.includes("lawn ke bare") ||
    text.includes("lawn ke baare") ||
    text.includes("marriage lawn ke bare") ||
    text.includes("marriage lawn ke baare") ||
    text.includes("tell me about lawn") ||
    text.includes("lawn ke baare mein")
  ) {
    return INTENTS.ABOUT_LAWN;
  }

  // ==========================================
  // BUSINESS INFO
  // ==========================================

  if (
    text.includes("business") ||
    text.includes("business information") ||
    text.includes("company") ||
    text.includes("owner") ||
    text.includes("owner kaun") ||
    text.includes("kalawati marriage lawn") ||
    text.includes("kalawati lawn")
  ) {
    return INTENTS.BUSINESS_INFO;
  }

  // ==========================================
  // HELP
  // ==========================================

  if (
    text.includes("help") ||
    text.includes("madad") ||
    text.includes("kya kar sakte") ||
    text.includes("what can you do") ||
    text.includes("what can i ask") ||
    text.includes("help me") ||
    text.includes("meri help")
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
  detectIntent,
};
