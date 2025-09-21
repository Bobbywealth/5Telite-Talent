import nodemailer from 'nodemailer';
import { User, TalentProfile, Booking, Task } from '@shared/schema';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
}

class EmailServiceEnhanced {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private adminEmail: string;
  private frontendUrl: string;
  private logoUrl: string;

  constructor() {
    // Email configuration from environment variables
    const emailConfig: EmailConfig = {
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER || '',
        pass: process.env.SMTP_PASS || '', // App password for Gmail
      },
    };

    this.fromEmail = process.env.FROM_EMAIL || process.env.SMTP_USER || '';
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@5telite.com';
    this.frontendUrl = process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com';
    this.logoUrl = `${this.frontendUrl}/attached_assets/5t-logo.png`;

    // Create transporter
    this.transporter = nodemailer.createTransport(emailConfig);

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Enhanced Email service ready');
    } catch (error) {
      console.error('❌ Enhanced Email service configuration error:', error);
    }
  }

  // 🎨 Create branded email template
  private createEmailTemplate(title: string, content: string, ctaButton?: { text: string, url: string, color?: string }): string {
    const primaryColor = '#1a1a1a'; // 5T Elite brand color
    const accentColor = ctaButton?.color || '#ff6b35'; // Orange accent
    
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          body { margin: 0; padding: 0; font-family: 'Inter', Arial, sans-serif; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, ${primaryColor} 0%, #333333 100%); padding: 40px 20px; text-align: center; }
          .logo { max-width: 200px; height: auto; margin-bottom: 20px; }
          .header h1 { color: #ffffff; margin: 0; font-size: 28px; font-weight: 600; letter-spacing: -0.5px; }
          .content { padding: 40px 30px; }
          .content h2 { color: ${primaryColor}; font-size: 24px; font-weight: 600; margin: 0 0 20px 0; }
          .content h3 { color: ${primaryColor}; font-size: 20px; font-weight: 600; margin: 20px 0 15px 0; }
          .content p { color: #555555; line-height: 1.7; margin: 0 0 15px 0; font-size: 16px; }
          .card { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 4px solid ${accentColor}; box-shadow: 0 2px 10px rgba(0,0,0,0.05); }
          .cta-button { display: inline-block; background: linear-gradient(135deg, ${accentColor} 0%, #e55a2b 100%); color: #ffffff !important; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; transition: all 0.3s ease; box-shadow: 0 4px 15px rgba(255,107,53,0.3); }
          .cta-button:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(255,107,53,0.4); }
          .footer { background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); padding: 30px 20px; text-align: center; border-top: 1px solid #e9ecef; }
          .footer p { color: #888888; font-size: 14px; margin: 5px 0; }
          .footer strong { color: ${primaryColor}; }
          .social-links { margin: 20px 0; }
          .social-links a { display: inline-block; margin: 0 10px; color: ${primaryColor}; text-decoration: none; font-weight: 500; }
          .social-links a:hover { color: ${accentColor}; }
          ul { padding-left: 20px; }
          li { margin: 8px 0; color: #555555; line-height: 1.6; }
          ol { padding-left: 20px; }
          ol li { margin: 10px 0; color: #555555; line-height: 1.6; }
          .highlight { background: linear-gradient(120deg, #ff6b35 0%, #f7931e 100%); color: #ffffff; padding: 3px 10px; border-radius: 6px; font-weight: 600; font-size: 14px; }
          .stats { display: flex; justify-content: space-around; margin: 20px 0; }
          .stat { text-align: center; }
          .stat-number { font-size: 24px; font-weight: 700; color: ${accentColor}; }
          .stat-label { font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
          @media (max-width: 600px) {
            .content { padding: 20px 15px; }
            .header { padding: 30px 15px; }
            .logo { max-width: 150px; }
            .header h1 { font-size: 24px; }
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <img src="${this.logoUrl}" alt="5T Elite Talent" class="logo" />
            <h1>${title}</h1>
          </div>
          
          <div class="content">
            ${content}
            
            ${ctaButton ? `
              <div style="text-align: center; margin: 30px 0;">
                <a href="${ctaButton.url}" class="cta-button">${ctaButton.text}</a>
              </div>
            ` : ''}
          </div>
          
          <div class="footer">
            <p><strong>5T Elite Talent</strong></p>
            <p>📍 122 W 26th St, Suite 902, New York, NY 10001</p>
            <p>📧 ${this.adminEmail} | 📞 (555) 123-4567</p>
            
            <div class="social-links">
              <a href="https://instagram.com/5telitetalent">Instagram</a> • 
              <a href="https://linkedin.com/company/5telitetalent">LinkedIn</a> • 
              <a href="https://twitter.com/5telitetalent">Twitter</a>
            </div>
            
            <div class="stats">
              <div class="stat">
                <div class="stat-number">500+</div>
                <div class="stat-label">Talents</div>
              </div>
              <div class="stat">
                <div class="stat-number">1000+</div>
                <div class="stat-label">Bookings</div>
              </div>
              <div class="stat">
                <div class="stat-number">50+</div>
                <div class="stat-label">Clients</div>
              </div>
            </div>
            
            <p style="font-size: 12px; color: #aaa; margin-top: 20px;">
              © 2025 5T Elite Talent, Inc. All rights reserved.<br>
              You're receiving this email because you're part of our talent network.
            </p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private async sendEmail(to: string, subject: string, html: string, text?: string) {
    try {
      const mailOptions = {
        from: `"5T Elite Talent" <${this.fromEmail}>`,
        to,
        subject,
        html,
        text: text || html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
      };

      const result = await this.transporter.sendMail(mailOptions);
      console.log(`📧 Enhanced email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send enhanced email to ${to}:`, error);
      throw error;
    }
  }

  // 👋 Welcome Email for New Talents
  async sendTalentWelcomeEmail(talent: User) {
    const subject = `🎭 Welcome to 5T Elite Talent - Let's Get Started!`;
    
    const content = `
      <h2>Hi ${talent.firstName},</h2>
      
      <p>🎉 <strong>Welcome to 5T Elite Talent!</strong> We're thrilled to have you join our exclusive network of professional talent.</p>
      
      <div class="card">
        <h3 style="margin-top: 0; color: #ff6b35;">🚀 Here's what happens next:</h3>
        <ol>
          <li><strong>Complete Your Profile</strong> - Add your photos, bio, skills, and experience</li>
          <li><strong>Profile Review</strong> - Our team will review your profile (usually within 24 hours)</li>
          <li><strong>Get Discovered</strong> - Once approved, clients can find and book you for projects</li>
          <li><strong>Start Earning</strong> - Receive casting opportunities and bookings!</li>
        </ol>
      </div>
      
      <div class="card">
        <h3 style="color: #1a1a1a; margin-top: 0;">💡 Pro Tips for Success</h3>
        <ul>
          <li>Use professional, high-resolution photos (minimum 1920x1080)</li>
          <li>Write a compelling bio that showcases your unique experience</li>
          <li>List all relevant skills and categories accurately</li>
          <li>Set competitive rates for your market and experience level</li>
          <li>Keep your profile updated with recent work and achievements</li>
        </ul>
        
        <p style="margin-top: 15px;"><span class="highlight">Complete profiles get 3x more bookings!</span></p>
      </div>
      
      <p>Ready to join the elite? Complete your profile now and start your journey with 5T Elite Talent!</p>
    `;

    const ctaButton = {
      text: "Complete Your Profile",
      url: `${this.frontendUrl}/talent/profile-edit`,
      color: "#ff6b35"
    };

    const html = this.createEmailTemplate("Welcome to 5T Elite Talent!", content, ctaButton);
    await this.sendEmail(talent.email, subject, html);
  }

  // 🎭 New Talent Signup - Notify Admin (Enhanced)
  async notifyAdminNewTalentSignup(talent: User, profile?: TalentProfile) {
    const subject = `🎭 New Talent Registration: ${talent.firstName} ${talent.lastName}`;
    
    const content = `
      <h2>New Talent Alert! 🎉</h2>
      
      <p>A new talent has joined the 5T Elite platform and is ready for review.</p>
      
      <div class="card">
        <h3 style="margin-top: 0; color: #ff6b35;">👤 Talent Details</h3>
        <p><strong>Name:</strong> ${talent.firstName} ${talent.lastName}</p>
        <p><strong>Email:</strong> <a href="mailto:${talent.email}">${talent.email}</a></p>
        <p><strong>Phone:</strong> ${talent.phone || 'Not provided'}</p>
        <p><strong>Registration Date:</strong> ${new Date(talent.createdAt!).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        ${profile?.stageName ? `<p><strong>Stage Name:</strong> ${profile.stageName}</p>` : ''}
        ${profile?.location ? `<p><strong>Location:</strong> ${profile.location}</p>` : ''}
        ${profile?.bio ? `<p><strong>Bio:</strong> ${profile.bio.substring(0, 200)}${profile.bio.length > 200 ? '...' : ''}</p>` : ''}
      </div>
      
      <p><strong>Action Required:</strong> Please review and approve this talent profile in the admin panel.</p>
    `;

    const ctaButton = {
      text: "Review Talent Profile",
      url: `${this.frontendUrl}/admin/talents`,
      color: "#28a745"
    };

    const html = this.createEmailTemplate("New Talent Registration", content, ctaButton);
    await this.sendEmail(this.adminEmail, subject, html);
  }

  // Add more enhanced email methods here...
  // For now, let's create one more example - booking confirmation

  // 📅 Booking Confirmed - Enhanced
  async notifyBookingConfirmed(recipients: User[], booking: any) {
    const subject = `✅ Booking Confirmed: ${booking.eventName || 'New Project'}`;
    
    for (const recipient of recipients) {
      const isClient = recipient.role === 'client';
      
      const content = `
        <h2>Hi ${recipient.firstName},</h2>
        
        <p>🎉 Great news! Your booking has been confirmed and is ready to go.</p>
        
        <div class="card">
          <h3 style="margin-top: 0; color: #28a745;">📅 Booking Details</h3>
          <p><strong>Event:</strong> ${booking.eventName || 'Project Booking'}</p>
          <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
          <p><strong>Time:</strong> ${new Date(booking.startDate).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit'
          })}</p>
          <p><strong>Location:</strong> ${booking.location || 'TBD'}</p>
          <p><strong>Status:</strong> <span class="highlight">Confirmed</span></p>
        </div>
        
        <div class="card">
          <h3 style="color: #1a1a1a; margin-top: 0;">${isClient ? '🎬 Next Steps for You' : '🎭 What You Need to Do'}</h3>
          <ul>
            ${isClient ? `
              <li>Prepare any materials or briefs for the talent</li>
              <li>Confirm location details and parking information</li>
              <li>Review the project requirements</li>
            ` : `
              <li>Confirm your availability and any schedule changes</li>
              <li>Prepare your materials and wardrobe</li>
              <li>Review the project brief and requirements</li>
            `}
          </ul>
        </div>
        
        <p>Questions about this booking? Don't hesitate to reach out!</p>
      `;

      const ctaButton = {
        text: isClient ? "Manage Booking" : "View Booking Details",
        url: `${this.frontendUrl}/${recipient.role}/bookings`,
        color: "#28a745"
      };

      const html = this.createEmailTemplate("Booking Confirmed!", content, ctaButton);
      await this.sendEmail(recipient.email, subject, html);
    }
  }

  // 📄 Admin Contract Creation Needed - NEW
  async notifyAdminContractNeeded(data: {
    booking: any;
    talent: User;
    client: any;
    bookingTalentId: string;
  }) {
    const { booking, talent, client, bookingTalentId } = data;
    const subject = `📄 Contract Needed: ${talent.firstName} ${talent.lastName} Accepted Booking`;
    
    const content = `
      <h2>Hi Admin,</h2>
      
      <p>🎉 Great news! A talent has accepted a booking and is ready for contracting.</p>
      
      <div class="card" style="border-left: 4px solid #28a745;">
        <h3 style="margin-top: 0; color: #28a745;">✅ Booking Accepted</h3>
        <p><strong>Talent:</strong> ${talent.firstName} ${talent.lastName} (${talent.email})</p>
        <p><strong>Client:</strong> ${client.firstName} ${client.lastName} (${client.email})</p>
        <p><strong>Project:</strong> ${booking.title}</p>
        <p><strong>Date:</strong> ${new Date(booking.startDate).toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p><strong>Location:</strong> ${booking.location || 'TBD'}</p>
        <p><strong>Rate:</strong> $${booking.rate || 'TBD'}</p>
      </div>
      
      <div class="card">
        <h3 style="color: #1a1a1a; margin-top: 0;">📋 Next Steps</h3>
        <ul>
          <li>Create and send contract to the talent</li>
          <li>Include all project details and terms</li>
          <li>Set appropriate signing deadline</li>
          <li>Monitor contract signing progress</li>
        </ul>
      </div>
      
      <p><strong>Action Required:</strong> Please create and send the contract as soon as possible to keep the project moving forward.</p>
    `;

    const ctaButton = {
      text: 'Create Contract',
      url: `${this.frontendUrl}/admin/contracts?booking=${booking.id}&talent=${bookingTalentId}`,
      color: "#28a745"
    };

    const html = this.createEmailTemplate("Contract Creation Needed", content, ctaButton);
    await this.sendEmail(this.adminEmail, subject, html);
  }
}

export const enhancedEmailService = new EmailServiceEnhanced();
