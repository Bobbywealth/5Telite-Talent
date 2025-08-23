# 5T Talent Platform

## Overview

5T Talent Platform is a comprehensive booking platform for a talent agency that connects professional performers (talents) with clients for various projects. The platform facilitates talent management, booking workflows, and administrative operations through role-based access control supporting admins, talents, and clients.

The system enables talent onboarding with rich profiles including media uploads, a public talent directory with advanced search capabilities, a complete booking workflow from inquiry to completion, admin calendar management, task tracking, and integrated payment processing.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with Vite for fast development and hot module replacement
- **Styling**: TailwindCSS for utility-first styling with shadcn/ui component library for consistent, accessible UI components
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Forms**: React Hook Form with Zod validation for type-safe form handling
- **File Uploads**: Uppy with dashboard modal interface for handling media uploads

### Backend Architecture
- **Runtime**: Node.js with Express.js for the REST API server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Database Provider**: Neon serverless PostgreSQL for cloud database hosting
- **Authentication**: Replit Auth integration with session-based authentication using PostgreSQL session store
- **File Storage**: Google Cloud Storage for media files (images, videos, PDFs) with custom ACL system for access control

### Data Storage Solutions
- **Primary Database**: PostgreSQL with comprehensive schema including users, talent profiles, bookings, booking-talent relationships, tasks, and sessions
- **Object Storage**: Google Cloud Storage with custom access control logic for managing media files
- **Session Storage**: PostgreSQL-based session store for authentication persistence

### Authentication and Authorization
- **Authentication Provider**: Replit Auth using OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store for persistence
- **Authorization**: Role-based access control with three primary roles: admin, talent, and client
- **User Management**: Automatic user creation and profile management with role-specific features

### External Dependencies
- **Database**: Neon PostgreSQL serverless database
- **Object Storage**: Google Cloud Storage for media file management
- **Authentication**: Replit Auth service for user authentication
- **File Upload**: Uppy dashboard with AWS S3 compatibility for direct uploads
- **UI Components**: Radix UI primitives through shadcn/ui for accessible component foundation
- **Email**: Configured for Resend or SendGrid for transactional notifications (mentioned in spec)
- **Payments**: Stripe integration planned for payment processing (mentioned in spec)
- **E-signature**: Dropbox Sign API planned for contract management (mentioned in spec)

### Key Design Patterns
- **Monorepo Structure**: Shared schema and utilities between client and server in `/shared` directory
- **Type Safety**: End-to-end TypeScript with Drizzle for database type safety and Zod for runtime validation
- **Component-Based Architecture**: Reusable UI components with consistent design system
- **Server-Side API**: RESTful API design with Express.js handling CRUD operations and business logic
- **File Management**: Sophisticated object storage system with custom ACL policies for secure file access
- **Responsive Design**: Mobile-first approach with TailwindCSS breakpoints for all screen sizes