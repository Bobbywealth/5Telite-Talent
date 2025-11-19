# 5TELITE Talent Platform

A comprehensive talent management platform built with React, Express, PostgreSQL, and TypeScript.

## 🚀 Features

- **Talent Management**: Complete profiles with skills, measurements, rates, and portfolios
- **Booking System**: Create and manage talent bookings with multi-talent support
- **Contract Generation**: Automated contract creation with digital signatures
- **Task Management**: Organize tasks by scope (talent, booking, general)
- **Announcements**: Open calls and event notifications
- **Admin Dashboard**: Comprehensive analytics and user management
- **Email Notifications**: Automated emails for bookings, approvals, and updates
- **File Storage**: Google Cloud Storage integration for images and documents

## 📋 Prerequisites

- Node.js 18+ and npm
- PostgreSQL database (local or cloud-hosted like Render)
- Google Cloud Storage account (for file uploads)
- SMTP email service (Gmail, SendGrid, etc.)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/Bobbywealth/5Telite-Talent.git
cd 5Telite-Talent
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Edit `.env` with your actual credentials:

```env
# Database (get from Render PostgreSQL dashboard)
DATABASE_URL=postgresql://user:password@host:port/database

# Session secret (generate with: openssl rand -base64 32)
SESSION_SECRET=your-super-secret-key-here

# Email configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=noreply@5telite.com
ADMIN_EMAIL=admin@5telite.com

# Google Cloud Storage
GCS_PROJECT_ID=your-project-id
GCS_CLIENT_EMAIL=your-service-account@project.iam.gserviceaccount.com
GCS_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GCS_BUCKET=your-bucket-name

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Environment
NODE_ENV=development
PORT=5000
```

### 4. Initialize the database

The application will automatically create tables on first run. To seed demo data:

```bash
# Start the development server
npm run dev

# In another terminal, seed demo data
curl -X POST http://localhost:5000/api/admin/seed-demo-data
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

This starts both the backend server and Vite dev server. Access the app at `http://localhost:5173`

### Production Build

```bash
# Build the application
npm run build

# Start production server
npm start
```

### Type Checking

```bash
npm run check
```

## 📁 Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── components/     # Reusable UI components
│       ├── pages/          # Page components
│       ├── hooks/          # Custom React hooks
│       └── lib/            # Utilities and helpers
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API routes
│   ├── auth.ts             # Authentication logic
│   ├── storage.ts          # Database operations
│   ├── emailService.ts     # Email functionality
│   └── contractService.ts  # Contract generation
├── shared/                 # Shared types and schemas
│   └── schema.ts           # Database schema (Drizzle ORM)
└── migrations/             # Database migrations
```

## 🔐 Security

- Passwords are hashed using scrypt
- Session management with PostgreSQL store
- CORS protection with origin validation
- SQL injection protection via Drizzle ORM
- Environment variables for sensitive data
- Secure cookies in production

## 🌐 Deployment

### Render (Recommended)

1. **Create a PostgreSQL database** on Render
2. **Create a Web Service** on Render
3. **Set environment variables** in Render dashboard
4. **Deploy** from your GitHub repository

### Environment Variables for Render

Set these in your Render dashboard:

- `DATABASE_URL` - From your Render PostgreSQL instance
- `SESSION_SECRET` - Generate with `openssl rand -base64 32`
- `NODE_ENV=production`
- All SMTP and GCS variables from `.env.example`
- `FRONTEND_URL` - Your Render web service URL

## 📧 Email Setup

### Gmail Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: https://myaccount.google.com/apppasswords
3. Use the app password in `SMTP_PASS`

### SendGrid Setup

1. Create a SendGrid account
2. Generate an API key
3. Use `smtp.sendgrid.net` as SMTP_HOST
4. Use `apikey` as SMTP_USER
5. Use your API key as SMTP_PASS

## 🗄️ Database Schema

The application uses PostgreSQL with Drizzle ORM. Main tables:

- `users` - User accounts (admin, talent, client)
- `talent_profiles` - Detailed talent information
- `bookings` - Booking requests and details
- `booking_talents` - Many-to-many relationship for bookings
- `tasks` - Task management
- `contracts` - Generated contracts
- `signatures` - Digital signatures
- `announcements` - Open calls and events
- `sessions` - User sessions

## 🧪 Demo Accounts

After seeding demo data, you can login with:

- **Admin**: admin@5t.com / admin123
- **Talent**: bobby@5t.com / bobby123
- **Client**: client@5t.com / client123

**⚠️ Change these passwords in production!**

## 🐛 Troubleshooting

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check if PostgreSQL is running
- Ensure database exists and is accessible

### Email Not Sending

- Verify SMTP credentials
- Check spam folder
- Enable "Less secure app access" for Gmail (or use App Password)

### Build Errors

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Clear build cache
rm -rf dist
npm run build
```

## 📝 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues or questions, please open an issue on GitHub or contact admin@5telite.com
