const PDFDocument = require("pdfkit");

const createCancellationPdf = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const details = booking.cancellationDetails || {};

      const money = (amount) =>
        `Rs. ${Number(amount || 0).toLocaleString("en-IN", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}`;

      const date = (value) => {
        if (!value) return "N/A";

        const parsed = new Date(value);

        return Number.isNaN(parsed.getTime())
          ? "N/A"
          : parsed.toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            });
      };

      doc
        .fillColor("#7c2d12")
        .font("Helvetica-Bold")
        .fontSize(23)
        .text("KD UTSAV LAWN", { align: "center" });

      doc
        .moveDown(0.5)
        .fillColor("#444444")
        .font("Helvetica")
        .fontSize(12)
        .text("BOOKING CANCELLATION STATEMENT", {
          align: "center",
        });

      doc.moveDown(1.5);

      doc
        .strokeColor("#d6a756")
        .lineWidth(1.5)
        .moveTo(45, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1.5);

      doc
        .fillColor("#222222")
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("Booking Details");

      doc.moveDown(0.6);
      doc.font("Helvetica").fontSize(10);

      const rows = [
        ["Customer Name", booking.contactName || "N/A"],
        ["Email", booking.contactEmail || "N/A"],
        ["Phone", booking.contactPhone || "N/A"],
        ["Booking ID", booking.bookingNumber || String(booking._id || "N/A")],
        ["Event Type", booking.eventType || "N/A"],
        ["Event Date", date(booking.eventDate)],
        ["Cancellation Date", date(details.cancelledAt)],
        ["Cancellation Reason", details.reason || "Not provided"],
      ];

      rows.forEach(([label, value]) => {
        doc.font("Helvetica-Bold").text(`${label}:`, {
          continued: true,
        });
        doc.font("Helvetica").text(` ${value}`);
        doc.moveDown(0.35);
      });

      doc.moveDown(1);

      doc
        .font("Helvetica-Bold")
        .fontSize(13)
        .text("Payment & Settlement Summary");

      doc.moveDown(0.7);

      const summary = [
        ["Amount received", details.amountPaidAtCancellation],
        ["Non-refundable amount", details.nonRefundableAmount],
        ["Amount pending office settlement", details.amountToSettle],
        ["Amount actually settled", details.settledAmount],
      ];

      summary.forEach(([label, amount]) => {
        doc.font("Helvetica").fontSize(10).text(label, {
          continued: true,
        });

        doc
          .font("Helvetica-Bold")
          .text(`  ${money(amount)}`, { align: "right" });

        doc.moveDown(0.6);
      });

      doc.moveDown(0.5);
      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#555555")
        .text(
          `Settlement status: ${details.settlementStatus || "not_required"}`,
        );

      doc.moveDown(1);

      doc.text(
        "The non-refundable amount is limited to the amount actually received, up to Rs. 11,000. Any applicable balance is subject to settlement through the KD Utsav Lawn office. This statement does not itself confirm that a refund or settlement has been completed.",
        { align: "justify", lineGap: 3 },
      );

      doc.moveDown(2);
      doc
        .fillColor("#777777")
        .fontSize(9)
        .text("This is a system-generated cancellation statement.", {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = createCancellationPdf;
