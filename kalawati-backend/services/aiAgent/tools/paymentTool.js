const Booking = require("../../../models/Booking");

async function getPaymentStatus(userId) {

  const bookings = await Booking.find({
    user: userId
  }).populate("package");

  return bookings.map((booking) => {

    const totalAmount = Number(
      booking.totalAmount || 0
    );

    const payments = booking.paymentHistory || [];

    const totalPaid = payments
      .filter(p => p.status === "success")
      .reduce(
        (sum, p) => sum + Number(p.amount || 0),
        0
      );

    const remaining = Math.max(
      totalAmount - totalPaid,
      0
    );

    return {
      bookingId: booking._id,
      eventType: booking.eventType,
      totalAmount,
      totalPaid,
      remaining,
      paymentStatus:
        remaining === 0
          ? "fully_paid"
          : totalPaid > 0
          ? "advance_paid"
          : "unpaid"
    };
  });
}

module.exports = {
  getPaymentStatus
};