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

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromEmail: string;
  private adminEmail: string;

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

    // Create transporter
    this.transporter = nodemailer.createTransporter(emailConfig);

    // Verify connection configuration
    this.verifyConnection();
  }

  private async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email service ready');
    } catch (error) {
      console.error('❌ Email service configuration error:', error);
    }
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
      console.log(`📧 Email sent to ${to}: ${subject}`);
      return result;
    } catch (error) {
      console.error(`❌ Failed to send email to ${to}:`, error);
      throw error;
    }
  }

  // 🎭 New Talent Signup - Notify Admin
  async notifyAdminNewTalentSignup(talent: User, profile?: TalentProfile) {
    const subject = `🎭 New Talent Registration: ${talent.firstName} ${talent.lastName}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎭 New Talent Registration</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Talent Details</h2>
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <p><strong>Name:</strong> ${talent.firstName} ${talent.lastName}</p>
            <p><strong>Email:</strong> ${talent.email}</p>
            <p><strong>Phone:</strong> ${talent.phone || 'Not provided'}</p>
            ${profile?.stageName ? `<p><strong>Stage Name:</strong> ${profile.stageName}</p>` : ''}
            ${profile?.location ? `<p><strong>Location:</strong> ${profile.location}</p>` : ''}
            ${profile?.bio ? `<p><strong>Bio:</strong> ${profile.bio}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/admin/talents" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review Talent Profile
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Please review and approve this talent profile in the admin panel.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(this.adminEmail, subject, html);
  }

  // ✅ Talent Approval/Rejection - Notify Talent
  async notifyTalentApprovalStatus(talent: User, status: 'approved' | 'rejected') {
    const isApproved = status === 'approved';
    const subject = isApproved 
      ? `🎉 Welcome to 5T Elite Talent - Profile Approved!`
      : `📝 Profile Update Required - 5T Elite Talent`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: ${isApproved ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)'}; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">${isApproved ? '🎉' : '📝'} Profile ${isApproved ? 'Approved' : 'Needs Updates'}</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${talent.firstName},</h2>
          
          ${isApproved ? `
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4CAF50;">
              <p>🎉 <strong>Congratulations!</strong> Your talent profile has been approved and is now live on our platform.</p>
              <p>You can now:</p>
              <ul>
                <li>Receive booking requests from clients</li>
                <li>Update your profile and portfolio</li>
                <li>Manage your bookings and tasks</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/dashboard" 
                 style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Access Your Dashboard
              </a>
            </div>
          ` : `
            <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ff6b6b;">
              <p>Thank you for your interest in joining 5T Elite Talent.</p>
              <p>Your profile needs some updates before we can approve it. Please review and update your profile with:</p>
              <ul>
                <li>Complete professional photos</li>
                <li>Detailed bio and experience</li>
                <li>Skills and categories</li>
                <li>Contact information</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 20px 0;">
              <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/talent/profile-edit" 
                 style="background: #ff6b6b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Update Your Profile
              </a>
            </div>
          `}
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Questions? Reply to this email or contact us at ${this.adminEmail}
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(talent.email, subject, html);
  }

  // 📋 New Task Assignment - Notify Talent
  async notifyTalentTaskAssigned(talent: User, task: Task, assigner: User) {
    const subject = `📋 New Task Assigned: ${task.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">📋 New Task Assigned</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${talent.firstName},</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3 style="color: #667eea; margin-top: 0;">${task.title}</h3>
            <p><strong>Description:</strong> ${task.description || 'No description provided'}</p>
            <p><strong>Scope:</strong> ${task.scope.charAt(0).toUpperCase() + task.scope.slice(1)}</p>
            <p><strong>Status:</strong> ${task.status.charAt(0).toUpperCase() + task.status.slice(1)}</p>
            <p><strong>Assigned by:</strong> ${assigner.firstName} ${assigner.lastName}</p>
            ${task.dueAt ? `<p><strong>Due Date:</strong> ${new Date(task.dueAt).toLocaleDateString()}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/talent/tasks" 
               style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Task Details
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Please complete this task by the due date and update the status accordingly.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(talent.email, subject, html);
  }

  // 📄 Contract Sent - Notify Talent/Client
  async notifyContractSent(recipient: User, booking: Booking, contractTitle: string, recipientType: 'talent' | 'client') {
    const subject = `📄 Contract Ready for Review: ${contractTitle}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">📄 Contract Ready</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${recipient.firstName},</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3 style="color: #f5576c; margin-top: 0;">${contractTitle}</h3>
            <p><strong>Booking:</strong> ${booking.title}</p>
            <p><strong>Location:</strong> ${booking.location || 'TBD'}</p>
            <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
            ${booking.rate ? `<p><strong>Rate:</strong> $${booking.rate}</p>` : ''}
          </div>
          
          <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #ffc107;">
            <p><strong>⚠️ Action Required:</strong> Please review and sign this contract within 7 days.</p>
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/contracts" 
               style="background: #f5576c; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              Review & Sign Contract
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Questions about this contract? Contact us at ${this.adminEmail}
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(recipient.email, subject, html);
  }

  // 🎬 Booking Request - Notify Talent
  async notifyTalentBookingRequest(talent: User, booking: Booking, client: User) {
    const subject = `🎬 New Booking Request: ${booking.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎬 New Booking Request</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Hi ${talent.firstName},</h2>
          
          <p>You have a new booking request!</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0;">
            <h3 style="color: #4facfe; margin-top: 0;">${booking.title}</h3>
            <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
            <p><strong>Location:</strong> ${booking.location || 'TBD'}</p>
            <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
            ${booking.rate ? `<p><strong>Offered Rate:</strong> $${booking.rate}</p>` : ''}
            ${booking.deliverables ? `<p><strong>Requirements:</strong> ${booking.deliverables}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/talent/bookings" 
               style="background: #4facfe; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Booking Details
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            Please respond to this booking request as soon as possible.
          </p>
        </div>
      </div>
    `;

    await this.sendEmail(talent.email, subject, html);
  }

  // 🎉 Booking Confirmed - Notify All Parties
  async notifyBookingConfirmed(recipients: User[], booking: Booking) {
    const subject = `🎉 Booking Confirmed: ${booking.title}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">🎉 Booking Confirmed</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #333;">Great news!</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 10px 0; border-left: 4px solid #4CAF50;">
            <h3 style="color: #4CAF50; margin-top: 0;">${booking.title}</h3>
            <p><strong>Booking Code:</strong> ${booking.code}</p>
            <p><strong>Status:</strong> Confirmed ✅</p>
            <p><strong>Location:</strong> ${booking.location || 'TBD'}</p>
            <p><strong>Start Date:</strong> ${new Date(booking.startDate).toLocaleDateString()}</p>
            <p><strong>End Date:</strong> ${new Date(booking.endDate).toLocaleDateString()}</p>
            ${booking.rate ? `<p><strong>Rate:</strong> $${booking.rate}</p>` : ''}
          </div>
          
          <div style="text-align: center; margin: 20px 0;">
            <a href="${process.env.FRONTEND_URL || 'https://fivetelite-talent.onrender.com'}/bookings" 
               style="background: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              View Booking Details
            </a>
          </div>
          
          <p style="color: #666; font-size: 14px; text-align: center;">
            All parties will receive contracts and further instructions soon.
          </p>
        </div>
      </div>
    `;

    // Send to all recipients
    for (const recipient of recipients) {
      await this.sendEmail(recipient.email, subject, html);
    }
  }
}

// Export singleton instance
export const emailService = new EmailService();
