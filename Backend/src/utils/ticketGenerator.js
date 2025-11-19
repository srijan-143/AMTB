const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

// Ensure tickets directory exists
const ticketsDir = path.join(__dirname, '../tickets');
if (!fs.existsSync(ticketsDir)) {
  fs.mkdirSync(ticketsDir, { recursive: true });
}

/**
 * Generate QR code for booking
 * @param {string} ticketId - Unique ticket identifier
 * @param {string} bookingId - MongoDB booking ID
 * @returns {Promise<string>} - Path to QR code image
 */
async function generateQRCode(ticketId, bookingId) {
  try {
    const qrData = JSON.stringify({
      ticketId,
      bookingId,
      timestamp: Date.now()
    });

    const qrPath = path.join(ticketsDir, `${ticketId}_qr.png`);
    await QRCode.toFile(qrPath, qrData, {
      width: 300,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    return qrPath;
  } catch (error) {
    console.error('QR generation error:', error);
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Generate PDF ticket for booking
 * @param {Object} booking - Booking document with populated user
 * @returns {Promise<string>} - Path to generated PDF
 */
async function generateTicketPDF(booking) {
  try {
    const ticketId = booking.ticketId;
    const pdfPath = path.join(ticketsDir, `${ticketId}.pdf`);

    // Generate QR code first
    const qrPath = await generateQRCode(ticketId, booking._id.toString());

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const stream = fs.createWriteStream(pdfPath);

      doc.pipe(stream);

      // Header
      doc.fontSize(25)
        .fillColor('#4CAF50')
        .text('Mess Token Booking System', { align: 'center' })
        .moveDown();

      doc.fontSize(20)
        .fillColor('#333')
        .text('MEAL TICKET', { align: 'center' })
        .moveDown(2);

      // Ticket details
      doc.fontSize(12)
        .fillColor('#666')
        .text(`Ticket ID: ${ticketId}`, { align: 'left' })
        .moveDown(0.5);

      doc.text(`Student Name: ${booking.user?.name || 'N/A'}`)
        .moveDown(0.5);

      doc.text(`Student ID: ${booking.user?.studentId || 'N/A'}`)
        .moveDown(0.5);

      doc.text(`Email: ${booking.user?.email || 'N/A'}`)
        .moveDown(1);

      // Booking details box
      doc.rect(50, doc.y, 500, 120)
        .stroke('#4CAF50');

      const boxY = doc.y + 15;
      doc.fontSize(14)
        .fillColor('#333')
        .text('BOOKING DETAILS', 60, boxY, { underline: true })
        .moveDown(0.5);

      doc.fontSize(12)
        .fillColor('#666')
        .text(`Date: ${new Date(booking.date).toLocaleDateString('en-IN', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}`, 60)
        .moveDown(0.5);

      doc.text(`Meal Type: ${booking.mealType.toUpperCase()}`, 60)
        .moveDown(0.5);

      doc.text(`Number of Persons: ${booking.persons}`, 60)
        .moveDown(0.5);

      doc.fontSize(14)
        .fillColor('#4CAF50')
        .text(`Total Amount Paid: ₹${booking.amount}`, 60)
        .moveDown(2);

      // QR Code
      doc.fontSize(12)
        .fillColor('#333')
        .text('SCAN QR CODE AT MESS COUNTER', { align: 'center' })
        .moveDown();

      if (fs.existsSync(qrPath)) {
        const qrY = doc.y;
        doc.image(qrPath, (doc.page.width - 200) / 2, qrY, { width: 200 });
        doc.moveDown(12);
      }

      // Footer
      doc.fontSize(10)
        .fillColor('#999')
        .text('Please show this ticket at the mess counter', { align: 'center' })
        .moveDown(0.5)
        .text(`Generated on: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });

      doc.end();

      stream.on('finish', () => {
        resolve(pdfPath);
      });

      stream.on('error', (error) => {
        reject(error);
      });
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw new Error('Failed to generate PDF ticket');
  }
}

/**
 * Generate ticket ID
 * @returns {string} - Unique ticket ID
 */
function generateTicketId() {
  const timestamp = Date.now().toString().slice(-8);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `MTBS-${timestamp}-${random}`;
}

module.exports = {
  generateQRCode,
  generateTicketPDF,
  generateTicketId
};
