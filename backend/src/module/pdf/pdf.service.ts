import { Injectable, NotFoundException } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class PdfService {
  constructor(private prisma: PrismaService) {}

  async generateBookingPDF(bookingId: number): Promise<Buffer> {
    // Get booking details with all necessary information
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        flight: {
          include: {
            aircraft: true
          }
        },
        passengers: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!booking) {
      throw new NotFoundException('Booking not found');
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({
        size: 'A4',
        margin: 50,
      });

      const buffers: Buffer[] = [];

      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve(pdfBuffer);
      });

      doc.on('error', reject);

      // Header
      doc.fontSize(24).font('Helvetica-Bold').text('E-TICKET', { align: 'center' });
      doc.moveDown(0.5);

      doc.fontSize(16).font('Helvetica-Bold').text('SkyFly Airlines', { align: 'center' });
      doc.moveDown(1);

      // Booking Information
      doc.fontSize(14).font('Helvetica-Bold').text('Booking Details');
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica');
      doc.text(`Booking ID: ${booking.id}`);
      doc.text(`Booking Date: ${new Date(booking.createdAt).toLocaleDateString('en-IN')}`);
      doc.text(`Passenger Name: ${booking.user.name}`);
      doc.text(`Email: ${booking.user.email}`);
      doc.moveDown(1);

      // Flight Information
      doc.fontSize(14).font('Helvetica-Bold').text('Flight Information');
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica');
      doc.text(`Flight Number: ${booking.flight.flightNumber}`);
      doc.text(`From: ${booking.flight.fromCity}`);
      doc.text(`To: ${booking.flight.toCity}`);
      doc.text(`Departure: ${new Date(booking.flight.departureTime).toLocaleString('en-IN')}`);
      doc.text(`Arrival: ${new Date(booking.flight.arrivalTime).toLocaleString('en-IN')}`);
      doc.text(`Aircraft: ${booking.flight.aircraft.model}`);
      doc.moveDown(1);

      // Passenger Information
      doc.fontSize(14).font('Helvetica-Bold').text('Passenger Information');
      doc.moveDown(0.5);

      booking.passengers.forEach((passenger, index) => {
        doc.fontSize(12).font('Helvetica');
        doc.text(`Passenger ${index + 1}: ${passenger.name}`);
        doc.text(`Age: ${passenger.age} years`);
        doc.text(`Gender: ${passenger.gender}`);
        doc.text(`Seat: ${passenger.seatNumber} (${passenger.seatClass})`);
        doc.moveDown(0.5);
      });

      doc.moveDown(1);

      // Payment Information
      doc.fontSize(14).font('Helvetica-Bold').text('Payment Information');
      doc.moveDown(0.5);

      doc.fontSize(12).font('Helvetica');
      doc.text(`Total Passengers: ${booking.passengerCount}`);
      doc.text(`Total Amount: ₹${booking.totalAmount.toLocaleString()}`);
      doc.moveDown(1);

      // Important Information
      doc.fontSize(14).font('Helvetica-Bold').text('Important Information');
      doc.moveDown(0.5);

      doc.fontSize(10).font('Helvetica');
      doc.text('• Please arrive at the airport 2 hours before domestic flights and 3 hours before international flights.');
      doc.text('• Carry a valid government-issued photo ID for all passengers.');
      doc.text('• Seat selection is confirmed as shown above.');
      doc.text('• Flight updates will be sent to your registered mobile number.');
      doc.text('• This e-ticket is valid only with a valid photo ID.');
      doc.moveDown(1);

      // Footer
      doc.fontSize(10).font('Helvetica');
      doc.text('Thank you for choosing SkyFly Airlines!', { align: 'center' });
      doc.text('For any queries, please contact our customer support.', { align: 'center' });

      doc.end();
    });
  }
}
