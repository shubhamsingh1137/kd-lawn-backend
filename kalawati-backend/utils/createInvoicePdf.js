const PDFDocument = require("pdfkit");

const createInvoicePdf = (booking) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 45,
        bufferPages: true,
      });

      const chunks = [];

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      const originalAmount = Number(
        booking.originalAmount ??
          booking.package?.price ??
          booking.totalAmount ??
          0,
      );

      const discountAmount = Number(booking.discountAmount || 0);

      const payableAmount = Number(
        booking.payableAmount ??
          booking.totalAmount ??
          originalAmount - discountAmount,
      );

      const successfulPayments = Array.isArray(booking.paymentHistory)
        ? booking.paymentHistory.filter(
            (payment) => payment.status === "success",
          )
        : [];

      const totalPaid = successfulPayments.reduce(
        (sum, payment) => sum + Number(payment.amount || 0),
        0,
      );

      const remainingAmount = Math.max(payableAmount - totalPaid, 0);

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
          : parsed.toLocaleDateString("en-IN");
      };

      // Header
      doc
        .fillColor("#7c2d12")
        .fontSize(23)
        .font("Helvetica-Bold")
        .text("KD UTSAV LAWN", { align: "center" });

      doc
        .moveDown(0.3)
        .fillColor("#444444")
        .fontSize(10)
        .font("Helvetica")
        .text("BOOKING INVOICE & PAYMENT STATEMENT", {
          align: "center",
        });

      doc.moveDown(1);

      doc
        .strokeColor("#d6a756")
        .lineWidth(1.5)
        .moveTo(45, doc.y)
        .lineTo(550, doc.y)
        .stroke();

      doc.moveDown(1);

      // Booking and customer details
      doc.fillColor("#222222").fontSize(12).font("Helvetica-Bold");
      doc.text("Customer Details");

      doc.moveDown(0.4);
      doc.fontSize(10).font("Helvetica");

      const customerDetails = [
        `Name: ${booking.contactName || booking.user?.name || "N/A"}`,
        `Email: ${booking.contactEmail || booking.user?.email || "N/A"}`,
        `Phone: ${booking.contactPhone || booking.user?.phone || "N/A"}`,
        `Booking ID: ${String(booking._id || "N/A")}`,
        `Event: ${booking.eventType || "N/A"}`,
        `Event Date: ${date(booking.eventDate)}`,
        `Package: ${booking.package?.name || "N/A"}`,
        `Guests: ${booking.guestCount ?? "N/A"}`,
      ];

      customerDetails.forEach((line) => {
        doc.text(line);
      });

      doc.moveDown(1);

      // Amount summary
      doc.font("Helvetica-Bold").fontSize(12).text("Amount Summary");
      doc.moveDown(0.5);

      const summary = [
        ["Original Amount", money(originalAmount)],
        ["Discount", `- ${money(discountAmount)}`],
        ["Final Payable Amount", money(payableAmount)],
        ["Total Paid", money(totalPaid)],
        ["Remaining Balance", money(remainingAmount)],
      ];

      summary.forEach(([label, value], index) => {
        const y = doc.y;

        if (index === 2 || index === 4) {
          doc
            .rect(45, y - 3, 505, 21)
            .fill(index === 4 ? "#fff7ed" : "#fef3c7");
        }

        doc
          .fillColor("#222222")
          .font(index === 2 || index === 4 ? "Helvetica-Bold" : "Helvetica")
          .fontSize(10)
          .text(label, 55, y, { width: 300 });

        doc.text(value, 360, y, {
          width: 180,
          align: "right",
        });

        doc.moveDown(0.5);
      });

      doc.moveDown(1);

      // Payment history
      doc.font("Helvetica-Bold").fontSize(12).text("Payment Transactions");
      doc.moveDown(0.5);

      const columns = {
        date: 45,
        mode: 125,
        reference: 235,
        amount: 430,
      };

      const drawTableHeader = () => {
        const y = doc.y;

        doc.rect(45, y, 505, 23).fill("#7c2d12");

        doc.fillColor("#ffffff").font("Helvetica-Bold").fontSize(8);
        doc.text("Date", columns.date + 5, y + 7);
        doc.text("Payment Mode", columns.mode, y + 7);
        doc.text("Reference", columns.reference, y + 7, {
          width: 180,
        });
        doc.text("Amount", columns.amount, y + 7, {
          width: 110,
          align: "right",
        });

        doc.y = y + 28;
      };

      drawTableHeader();

      doc.font("Helvetica").fontSize(8).fillColor("#222222");

      if (successfulPayments.length === 0) {
        doc.text("No successful payments recorded.", 50, doc.y);
        doc.moveDown();
      } else {
        successfulPayments.forEach((payment, index) => {
          if (doc.y > 720) {
            doc.addPage();
            drawTableHeader();
            doc.font("Helvetica").fontSize(8).fillColor("#222222");
          }

          const y = doc.y;
          const reference =
            payment.transactionId ||
            payment.razorpayPaymentId ||
            payment.razorpayOrderId ||
            "-";

          if (index % 2 === 0) {
            doc.rect(45, y - 3, 505, 25).fill("#f9fafb");
          }

          doc.fillColor("#222222").font("Helvetica").fontSize(8);

          doc.text(date(payment.paidAt), columns.date + 5, y, {
            width: 75,
          });

          doc.text(
            payment.paymentMethod || payment.source || "N/A",
            columns.mode,
            y,
            { width: 105 },
          );

          doc.text(String(reference), columns.reference, y, {
            width: 180,
            ellipsis: true,
          });

          doc.text(money(payment.amount), columns.amount, y, {
            width: 110,
            align: "right",
          });

          doc.y = y + 25;
        });
      }

      doc.moveDown(1);

      doc
        .font("Helvetica")
        .fontSize(9)
        .fillColor("#666666")
        .text("Thank you for choosing KD Utsav Lawn.", 45, doc.y, {
          align: "center",
        });

      doc
        .moveDown(0.4)
        .fontSize(8)
        .text("Please retain this invoice for your records.", {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

module.exports = createInvoicePdf;
