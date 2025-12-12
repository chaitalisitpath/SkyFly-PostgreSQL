import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter;

  constructor(private config: ConfigService) {
    console.log('SMTP Config:', {
      host: this.config.get('SMTP_HOST'),
      port: 465,
      user: this.config.get('SMTP_USER'),
      pass: this.config.get('SMTP_PASS') ? '***' : 'missing',
    });
    this.transporter = nodemailer.createTransport({
      host: this.config.get('SMTP_HOST'),
      port: 465,
      secure: true,
      auth: {
        user: this.config.get('SMTP_USER'),
        pass: this.config.get('SMTP_PASS'),
      },
    });
  }

  async sendBookingEmail(to: string, bookingId: string) {
    const mail = {
      from: `"SkyFly" <${this.config.get('SMTP_USER')}>`,
      to,
      subject: 'Booking Successful',
      html: `
        <div style="
  max-width: 600px; 
  margin: 0 auto; 
  padding: 20px; 
  font-family: Arial, sans-serif; 
  background: #f7f7f7;
  border-radius: 8px;
">

  <div style="
    background: #3b82f6; 
    padding: 16px; 
    border-radius: 8px 8px 0 0; 
    text-align: center;
    color: white;
  ">
    <h2 style="margin: 0;">SkyFly ✈️</h2>
  </div>

  <div style="
    background: white; 
    padding: 25px; 
    border-radius: 0 0 8px 8px;
    box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  ">
    <h2 style="margin-top: 0; color: #333;">Booking Confirmed</h2>

    <p style="font-size: 15px; color: #555;">
      Thank you for booking with <b>SkyFly</b>!
    </p>

    <p style="font-size: 15px; color: #555;">
      Your booking has been successfully confirmed.  
    </p>

    <div style="
      margin: 20px 0; 
      padding: 15px; 
      background: #f0f4ff;
      border-left: 4px solid #3b82f6;
      border-radius: 6px;
    ">
      <p style="margin: 0; font-size: 16px; color: #333;">
        <b>Booking ID:</b> ${bookingId}
      </p>
    </div>

    <p style="font-size: 14px; color: #777;">
      If you have any questions or need support, feel free to contact us anytime.
    </p>

    <p style="font-size: 14px; color: #333; margin-top: 25px;">
      Regards, <br>
      <b>SkyFly Team</b>
    </p>
  </div>

</div>

      `,
    };

    try {
      const result = await this.transporter.sendMail(mail);
      console.log('Email sent successfully:', result);
      return result;
    } catch (error) {
      console.error('Email sending failed:', error.message);
      console.error('Full error:', error);
      throw error;
    }
  }
}
