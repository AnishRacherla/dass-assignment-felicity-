/**
 * EMAIL SERVICE - Handles all email sending in the application
 * 
 * Purpose: Send emails for registration confirmations, tickets, and account credentials
 * Uses: nodemailer package to send emails via SMTP
 * 
 * Flow:
 * 1. Create email transporter (connection to email server)
 * 2. Define email content (HTML template)
 * 3. Send email
 * 4. Return success/error
 */

import nodemailer from "nodemailer";

/**
 * CREATE EMAIL TRANSPORTER
 * This creates the connection to the email server
 * 
 * Development Mode: Uses fake email (ethereal.email) - emails don't actually send
 * Production Mode: Uses real email service (Gmail, SendGrid, etc.)
 */
const createTransporter = async () => {
  try {
    // Check if we're in production or development
    if (process.env.NODE_ENV === "production") {
      // PRODUCTION: Use real email service
      // Example: Gmail, SendGrid, AWS SES, etc.
      return nodemailer.createTransport({
        service: process.env.EMAIL_SERVICE || "gmail", // Email provider
        auth: {
          user: process.env.EMAIL_USER,     // Your email address
          pass: process.env.EMAIL_PASSWORD, // App password (not regular password!)
        },
      });
    } else {
      // DEVELOPMENT: Use fake email server
      // For now, just return a test account
      const testAccount = await nodemailer.createTestAccount();
      return nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      });
    }
  } catch (error) {
    console.error('❌ Email transporter error:', error);
    throw new Error('Failed to create email transporter');
  }
};

/**
 * SEND REGISTRATION CONFIRMATION EMAIL
 * 
 * Purpose: Send a beautiful email with ticket and QR code after successful registration
 * When called: After participant registers for an event
 * 
 * @param {Object} options - Email options
 * @param {String} options.to - Recipient email address
 * @param {String} options.participantName - Name of the participant
 * @param {String} options.eventName - Name of the event
 * @param {String} options.ticketId - Unique ticket ID
 * @param {String} options.qrCode - Base64 encoded QR code image
 * @param {Date} options.eventDate - Event date and time
 * 
 * Returns: Email sending info (messageId, etc.)
 * Throws: Error if email fails to send
 */
export const sendRegistrationEmail = async ({
  to,
  participantName,
  eventName,
  ticketId,
  qrCode,
  eventDate,
}) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "Felicity <noreply@felicity.iiit.ac.in>",
      to,
      subject: `Registration Confirmed: ${eventName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Registration Confirmed! 🎉</h2>
          
          <p>Dear ${participantName},</p>
          
          <p>Your registration for <strong>${eventName}</strong> has been confirmed!</p>
          
          <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Event Details</h3>
            <p><strong>Event:</strong> ${eventName}</p>
            <p><strong>Date:</strong> ${new Date(eventDate).toLocaleDateString("en-IN", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}</p>
            <p><strong>Ticket ID:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px;">${ticketId}</code></p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p><strong>Your Ticket QR Code</strong></p>
            <img src="${qrCode}" alt="Ticket QR Code" style="max-width: 250px; border: 2px solid #E5E7EB; border-radius: 8px; padding: 10px;"/>
            <p style="font-size: 12px; color: #6B7280;">Show this QR code at the event venue</p>
          </div>
          
          <p>Please save this email or take a screenshot of the QR code for entry at the event.</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;"/>
          
          <p style="font-size: 12px; color: #6B7280;">
            If you have any questions, please contact the event organizer.<br/>
            This is an automated email, please do not reply.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log("✅ Email sent:", info.messageId);
    
    // For development, log the preview URL
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Preview URL:", nodemailer.getTestMessageUrl(info));
    }
    
    return info;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw new Error("Failed to send email");
  }
};

/**
 * Send organizer credentials email
 */
export const sendOrganizerCredentials = async ({
  to,
  organizerName,
  email,
  password,
}) => {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || "Felicity Admin <admin@felicity.iiit.ac.in>",
      to,
      subject: "Your Felicity Organizer Account",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #4F46E5;">Welcome to Felicity! 🎉</h2>
          
          <p>Dear ${organizerName},</p>
          
          <p>Your organizer account has been created. Here are your login credentials:</p>
          
          <div style="background-color: #FEF3C7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #F59E0B;">
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Password:</strong> <code style="background: white; padding: 5px 10px; border-radius: 4px;">${password}</code></p>
          </div>
          
          <p><strong>⚠️ Important:</strong> Please change your password after your first login.</p>
          
          <p>You can now login and start creating events for Felicity.</p>
          
          <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 30px 0;"/>
          
          <p style="font-size: 12px; color: #6B7280;">
            Keep these credentials secure. If you need a password reset, contact the admin.
          </p>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Organizer credentials email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw new Error("Failed to send credentials email");
  }
};
