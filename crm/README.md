# CRM Plus - Lead Management System

## Project Overview
CRM Plus is a modern, production-ready full-stack Customer Relationship Management (CRM) platform built for high-performance sales teams. It provides a polished SaaS experience with features designed for advanced lead tracking, smart prioritization, and real-time visualization of sales metrics. 

## Tech Stack Used
- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS
- **UI Components & Icons**: @base-ui/react, shadcn/ui, Lucide React
- **Animations**: Framer Motion
- **Data Visualization**: Recharts
- **Backend**: Next.js API Routes (REST)
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT (using `jose`), Bcrypt.js for password hashing
- **Validation**: Zod + React Hook Form

## Features Implemented
- **Advanced Dashboard**: Real-time visualization of sales metrics, revenue growth, and pipeline health using Recharts.
- **Lead Management**: Complete CRUD operations for prospects with advanced filtering, search, and CSV export capabilities.
- **Analytics Hub**: Forecast vs actual revenue area charts and pie charts of lead sources. Includes direct metric CSV download capabilities.
- **Smart Lead Interaction**: Detailed drill-down view of leads, capturing activity timeline, private notes, and health score (an AI-inspired scoring system highlighting high-potential prospects).
- **Secure Authentication**: JWT-based authentication system guarding protected routes via Next.js middleware.
- **Responsive Design**: Premium UI/UX optimized for both desktop and mobile web experiences.

## How to Run Locally

### Prerequisites
- Node.js 18+
- PostgreSQL database (running locally or via a cloud provider like Neon)

### Setup Instructions
1. **Clone the repository**:
   ```bash
   git clone <repo-url>
   cd crm
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   See the `Environment variables` section below and create your `.env` file.

4. **Initialize the Database**:
   See the `Database setup` section below to run migrations and seed data.

5. **Start the Development Server**:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` with your browser to preview the application!

## Environment Variables
Create a `.env` file in the root of the project. The application requires the following environment variables to run properly:

```env
# Connection string to your PostgreSQL instance
DATABASE_URL="postgresql://postgres:user@127.0.0.1:5432/crm_db?schema=public"

# Secret used to sign authentication JWTs
JWT_SECRET="super-secret-key-change-me"
```

## Test Login Credentials
For development testing, you can use the default seeded admin account:
- **Email**: `admin@example.com`
- **Password**: `password123`

## Database Setup
1. **Migrate Database Schema**:
   Run the following command to deploy the Prisma schema onto your PostgreSQL target.
   ```bash
   npx prisma migrate dev --name init
   ```

2. **Seed Default Admin**:
   Run the seed script to create the initial user accounts and roles required for logging in.
   ```bash
   npx tsx prisma/seed.ts
   ```

3. **Generate Prisma Client**:
   (Optional, as this is usually handled automatically after migration)
   ```bash
   npx prisma generate
   ```

## Known Limitations
- **Mock Fallbacks**: If the database is missing or currently unreachable, some pages (like the Leads list and Lead Details page) will automatically fallback to displaying hardcoded mock data so the UI can still be previewed.
- **Export Formats**: While CSV structural generation is fully implemented for Analytics and Dashboard reports, these are generated strictly locally on the client-side.
- **Email/SMS Integrations**: Real outbound communication options (email, VoIP calls) shown in the interface are visually mocked for demonstration and are not currently connected to SMTP or Twilio APIs.

## Reflection
- **Aesthetics First**: Focused heavily on a "Stripe-like" premium feel. Consistent spacing, rounded geometry (`rounded-3xl`), and glassmorphic soft shadow accents inspire trust and professional use.
- **Smart Prioritization**: The inclusion of an automated health score emphasizes value over vanity metrics, aiming to tangibly increase a sales team's efficacy.
- **Fullstack React**: Benefited from Next.js App Router by utilizing fast Server boundaries. Abstracting layout complexities behind Server Layouts resulted in a highly cohesive and easy to navigate user dashboard.
- **Robustness**: Strived for bulletproof user experiences by making sure errors gracefully handle the data fallback, and implemented Base UI primitives to guarantee accessibility on interactive components alongside standard elements.
