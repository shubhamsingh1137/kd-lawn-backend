const mongoose = require("mongoose");

const bookingCounterSchema = new mongoose.Schema({
  dateKey: {
    type: String,
    required: true,
    unique: true,
  },
  sequence: {
    type: Number,
    required: true,
    default: 0,
  },
});

module.exports = mongoose.model("BookingCounter", bookingCounterSchema);
