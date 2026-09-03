const Booking = require("../../../models/Booking");

async function checkAvailability(date) {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);

  const end = new Date(date);
  end.setHours(23, 59, 59, 999);

  const booking = await Booking.findOne({
    eventDate: {
      $gte: start,
      $lte: end
    },
    status: {
      $in: ["pending", "confirmed"]
    }
  });

  return {
    available: !booking,
    booking
  };
}

module.exports = {
  checkAvailability
};