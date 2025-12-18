import { Controller, Get, Param, Res, UseGuards } from '@nestjs/common';
import type { Response } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PdfService } from './pdf.service';

@Controller('pdf')
@UseGuards(JwtAuthGuard)
export class PdfController {
    constructor(private readonly pdfService: PdfService) {}

    @Get(':bookingId')
    async getBookingPDF(@Param('bookingId') bookingId: string, @Res() res: Response) {
        try {
            const pdfBuffer = await this.pdfService.generateBookingPDF(parseInt(bookingId));

            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="e-ticket-${bookingId}.pdf"`,
                'Content-Length': pdfBuffer.length,
            });

            res.send(pdfBuffer);
        } catch (error) {
            res.status(404).json({ message: error.message });
        }
    }
}
