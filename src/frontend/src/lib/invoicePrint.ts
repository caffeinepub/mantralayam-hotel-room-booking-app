import { Booking } from './dataStorage';

export function generateInvoiceHTML(booking: Booking): string {
  const checkInDate = new Date(booking.checkInDate).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const checkOutDate = new Date(booking.checkOutDate).toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  const bookingDate = new Date(booking.bookingDate).toLocaleString('en-IN', {
    dateStyle: 'medium',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Booking Invoice - ${booking.id}</title>
      <style>
        @media print {
          body { margin: 0; }
          .no-print { display: none; }
        }
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 40px 20px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 40px;
          border-bottom: 3px solid #d97706;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #d97706;
          margin: 0 0 10px 0;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .section {
          margin-bottom: 30px;
        }
        .section-title {
          font-size: 18px;
          font-weight: bold;
          color: #d97706;
          margin-bottom: 15px;
          border-bottom: 2px solid #f3f4f6;
          padding-bottom: 8px;
        }
        .info-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          border-bottom: 1px solid #f3f4f6;
        }
        .info-label {
          font-weight: 600;
          color: #666;
        }
        .info-value {
          color: #333;
        }
        .total-row {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          font-size: 20px;
          font-weight: bold;
          color: #d97706;
          border-top: 3px solid #d97706;
          margin-top: 20px;
        }
        .status-badge {
          display: inline-block;
          padding: 5px 15px;
          border-radius: 20px;
          font-size: 14px;
          font-weight: 600;
        }
        .status-confirmed {
          background-color: #d1fae5;
          color: #065f46;
        }
        .status-pending {
          background-color: #fef3c7;
          color: #92400e;
        }
        .status-cancelled {
          background-color: #fee2e2;
          color: #991b1b;
        }
        .footer {
          margin-top: 50px;
          text-align: center;
          color: #666;
          font-size: 12px;
          border-top: 1px solid #f3f4f6;
          padding-top: 20px;
        }
        .print-instructions {
          background-color: #fef3c7;
          border: 2px solid #d97706;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 30px;
          text-align: center;
        }
        .print-button {
          background-color: #d97706;
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          border-radius: 6px;
          cursor: pointer;
          margin: 10px;
        }
        .print-button:hover {
          background-color: #b45309;
        }
      </style>
    </head>
    <body>
      <div class="print-instructions no-print">
        <p style="margin: 0 0 10px 0; font-weight: bold; color: #d97706;">
          To save this invoice as PDF:
        </p>
        <p style="margin: 0 0 15px 0; font-size: 14px;">
          Click the "Print / Save as PDF" button below, then select "Save as PDF" in the print dialog.
        </p>
        <button class="print-button" onclick="window.print()">Print / Save as PDF</button>
        <button class="print-button" onclick="window.close()" style="background-color: #6b7280;">Close</button>
      </div>

      <div class="header">
        <h1>Mantralayam Rooms</h1>
        <p>Booking Invoice & Confirmation</p>
        <p>Sri Raghavendra Swamy Mutt, Mantralayam</p>
      </div>

      <div class="section">
        <div class="section-title">Booking Details</div>
        <div class="info-row">
          <span class="info-label">Booking Reference:</span>
          <span class="info-value">${booking.id}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Booking Date:</span>
          <span class="info-value">${bookingDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Status:</span>
          <span class="status-badge status-${booking.status}">${booking.status.toUpperCase()}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Guest Information</div>
        <div class="info-row">
          <span class="info-label">Name:</span>
          <span class="info-value">${booking.customerName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Phone:</span>
          <span class="info-value">${booking.customerPhone}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Number of Guests:</span>
          <span class="info-value">${booking.guests}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Property Details</div>
        <div class="info-row">
          <span class="info-label">HomeStay:</span>
          <span class="info-value">${booking.homeStayName}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Hotel:</span>
          <span class="info-value">${booking.hotelName}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Stay Duration</div>
        <div class="info-row">
          <span class="info-label">Check-in:</span>
          <span class="info-value">${checkInDate}</span>
        </div>
        <div class="info-row">
          <span class="info-label">Check-out:</span>
          <span class="info-value">${checkOutDate}</span>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Payment Summary</div>
        <div class="info-row">
          <span class="info-label">Payment Method:</span>
          <span class="info-value">${booking.paymentMethod?.toUpperCase() || 'UPI'}</span>
        </div>
        <div class="total-row">
          <span>Total Amount Paid:</span>
          <span>₹${booking.totalPrice}</span>
        </div>
      </div>

      <div class="footer">
        <p><strong>Thank you for choosing Mantralayam Rooms!</strong></p>
        <p>For any queries, please contact the property directly.</p>
        <p style="margin-top: 15px;">© 2026 Mantralayam Rooms. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

export function printInvoice(booking: Booking): void {
  const invoiceHTML = generateInvoiceHTML(booking);
  const printWindow = window.open('', '_blank');
  
  if (printWindow) {
    printWindow.document.write(invoiceHTML);
    printWindow.document.close();
  } else {
    console.error('Failed to open print window');
  }
}
