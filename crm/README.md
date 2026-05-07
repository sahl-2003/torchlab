# CRM Plus - Lead Management System

A modern, production-ready full-stack CRM built for high-performance sales teams. This project demonstrates a polished SaaS experience with advanced lead tracking, smart prioritization, and real-time analytics.

## 🚀 Key Features

- **Advanced Dashboard**: Real-time visualization of sales metrics, revenue growth, and pipeline health using Recharts.
- **Lead Management**: Complete CRUD with advanced filtering, search, and CSV export.
- **Visual Pipeline (Kanban)**: Drag-and-drop interface for tracking leads across stages.
- **Smart Lead Health Score**: AI-inspired scoring system that highlights high-potential and stale leads.
- **Activity Timeline**: Full audit trail of status changes, notes, and follow-ups.
- **Secure Authentication**: JWT-based auth with protected routes and middleware.
- **Responsive Design**: Premium UI/UX optimized for both desktop and mobile.

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS, shadcn/ui.
- **Animations**: Framer Motion.
- **Charts**: Recharts.
- **Backend**: Next.js API Routes (REST).
- **Database**: PostgreSQL (Neon), Prisma ORM.
- **Auth**: JWT (using `jose`), Bcrypt.js.
- **Validation**: Zod + React Hook Form.

## 🏁 Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

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

3. **Environment Setup**:
   Create a `.env` file in the root:
   ```env
   DATABASE_URL="your-postgresql-url"
   JWT_SECRET="your-secure-secret"
   ```

4. **Database Migration**:
   ```bash
   npx prisma migrate dev --name init
   ```

5. **Seed Default Admin**:
   ```bash
   npx tsx prisma/seed.ts
   ```

6. **Run the app**:
   ```bash
   npm run dev
   ```

### Test Credentials

- **Email**: `admin@example.com`
- **Password**: `password123`

## 🧠 Product Decisions & Reflections

- **Aesthetics First**: Focused on a "Stripe-like" premium feel with consistent spacing, rounded corners, and soft shadows to inspire trust and professional use.
- **Smart Prioritization**: Implemented an automated health score to help sales teams prioritize high-value/highly-engaged leads over stale ones.
- **Performance**: Used Next.js App Router for server-side security and client-side interactivity where needed (Framer Motion).
- **Architecture**: Separated core logic into utilities (`crm-logic.ts`) to ensure business rules are consistent across API and UI.

## 📈 Future Improvements

- [ ] Real-time notifications using WebSockets/Pusher.
- [ ] Email integration (SMTP) for direct outreach.
- [ ] Role-based access control (RBAC) refinements.
- [ ] Mobile App version with React Native.
