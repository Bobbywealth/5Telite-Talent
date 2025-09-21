# 📧 Email Configuration Guide

## Required Environment Variables

Add these to your Render environment variables:

### Gmail SMTP (Recommended)
```bash
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-business-email@gmail.com
SMTP_PASS=your-app-password  # NOT your regular password!
FROM_EMAIL=your-business-email@gmail.com
ADMIN_EMAIL=admin@5telite.com
FRONTEND_URL=https://fivetelite-talent.onrender.com
```

## Gmail App Password Setup

1. **Enable 2-Factor Authentication** on your Gmail account
2. Go to Google Account Settings → Security → 2-Step Verification
3. Scroll down to "App passwords"
4. Generate a new app password for "Mail"
5. Use this 16-character password as `SMTP_PASS`

## Email Notifications Implemented

### ✅ **Automatic Notifications:**

1. **🎭 New Talent Signup** → Admin gets notified
2. **✅ Talent Approved/Rejected** → Talent gets notified  
3. **📋 Task Assigned** → Talent gets notified
4. **🎬 Booking Request** → Talent gets notified
5. **🎉 Booking Confirmed** → All parties get notified
6. **📄 Contract Sent** → Talent & Client get notified

### 📧 **Email Features:**
- Professional HTML templates
- Mobile-responsive design
- Direct links to platform
- Error handling (emails won't break the app)
- Branded with 5T Elite Talent

## Testing

1. Add email environment variables to Render
2. Deploy the changes
3. Test by:
   - Creating a new talent profile (admin gets email)
   - Approving a talent (talent gets email)
   - Creating a task (assignee gets email)

## Alternative SMTP Providers

If Gmail doesn't work, you can use:

### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-username
SMTP_PASS=your-mailgun-password
```

## 🚀 Ready to Go Live!

Once email is configured, your platform will have professional automated notifications for all key events! 🎉
