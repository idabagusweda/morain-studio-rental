<div align="center">

# 📸 Morain Studio Rental

### Professional Photography Studio Booking System

*Streamline your photography studio bookings with automated scheduling, secure payments, and real-time availability tracking*

[![React](https://img.shields.io/badge/React-18.3.1-61DAFB?logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

[Live Demo](https://morain-studio.vercel.app) • [Report Bug](https://github.com/idabagusweda/morain-studio-rental/issues) • [Request Feature](https://github.com/idabagusweda/morain-studio-rental/issues)

</div>

---

## 📋 About The Project

**Morain Studio Rental** is a modern, full-stack web application designed for photography studios to manage bookings, payments, and customer interactions seamlessly. Built with React and Supabase, it provides a complete solution for studio owners and their clients.

### Why This Project?

- **Real-time Availability:** Prevents double bookings with database-level constraints and live slot checking
- **Secure Authentication:** Multi-provider auth (Email/Password + Google OAuth) with row-level security
- **Payment Integration:** Midtrans payment gateway with webhook notifications and automatic status updates
- **Admin Dashboard:** Comprehensive management tools for bookings, users, and operational settings
- **Mobile-First:** Responsive design optimized for desktop, tablet, and mobile devices

---

## ✨ Key Features

### For Customers
- 🔐 **Secure Authentication** — Email/password or Google sign-in
- 📅 **Smart Booking System** — Multi-step wizard with real-time slot availability
- 💳 **Flexible Payments** — Full payment or 50% down payment options via Midtrans
- 📱 **User Dashboard** — Track booking history, view invoices, manage profile
- ⏱️ **Payment Timer** — 15-minute countdown to secure your booking slot
- 📧 **Auto-fill Forms** — Profile data automatically populated for returning customers

### For Studio Owners
- 👥 **User Management** — View all users, promote admins, search by name/email
- 📊 **Booking Overview** — Real-time statistics and revenue tracking
- 🗓️ **Calendar View** — Visual representation of all bookings
- ✏️ **Status Management** — Update booking and payment statuses
- ⚙️ **Operational Settings** — Configure studio hours and slot durations
- 🔒 **Role-Based Access** — Secure admin-only routes and data protection

### Technical Highlights
- 🚀 **Optimized Performance** — Code-split bundles, lazy loading, <600KB chunks
- 🔒 **Security Headers** — CSP, X-Frame-Options, HSTS, Referrer-Policy
- 🛡️ **RLS Policies** — Database-level security with Supabase Row Level Security
- 🎯 **Type Safety** — Full TypeScript coverage with strict mode
- 🧪 **Production Ready** — Environment-based configs, error boundaries, graceful fallbacks

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| **React 18.3** | UI library with hooks and context |
| **TypeScript 5.8** | Type-safe JavaScript |
| **Vite 5.4** | Lightning-fast build tool |
| **Tailwind CSS 3.4** | Utility-first styling |
| **shadcn/ui** | Accessible component library (Radix UI) |
| **React Router 7** | Client-side routing |
| **React Hook Form + Zod** | Form validation and schema validation |
| **TanStack Query 5** | Server state management |

### Backend
| Technology | Purpose |
|-----------|---------|
| **Supabase** | Backend-as-a-Service (PostgreSQL, Auth, Storage) |
| **PostgreSQL** | Relational database with RLS |
| **Deno Edge Functions** | Serverless functions (payment, webhooks) |
| **Midtrans API** | Payment gateway (Indonesia) |

### DevOps & Tools
| Tool | Purpose |
|------|---------|
| **Vercel** | Frontend hosting and deployment |
| **Git** | Version control |
| **ESLint + Prettier** | Code quality and formatting |

---

## 🖼️ Screenshots

<details>
<summary>View Application Screenshots</summary>

### Landing Page
Modern hero section with studio packages, photobox styles, gallery, testimonials, and FAQ sections.

### Booking Flow
5-step wizard: Date & Time → Duration → Customer Info → Payment Type → Confirmation

### Admin Dashboard
Comprehensive overview with booking statistics, revenue tracking, and user management.

### User Dashboard
Personal booking history with invoice generation and profile management.

</details>

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm, yarn, or bun package manager
- Supabase account (free tier available)
- Midtrans sandbox account for testing payments

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/idabagusweda/morain-studio-rental.git
   cd morain-studio-rental
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   bun install
   ```

3. **Set up environment variables**

   Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

   Update `.env` with your credentials:
   ```env
   VITE_SUPABASE_PROJECT_ID=your_project_id
   VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
   VITE_SUPABASE_URL=https://your-project.supabase.co
   ```

4. **Set up Supabase database**

   Run migrations in Supabase SQL Editor:
   ```bash
   # Navigate to supabase/migrations/ and execute SQL files in order
   # Or use Supabase CLI:
   supabase db push
   ```

5. **Configure Edge Functions secrets**

   In Supabase Dashboard → Edge Functions → Secrets:
   ```env
   MIDTRANS_SERVER_KEY=your_midtrans_server_key
   MIDTRANS_IS_PRODUCTION=false
   FRONTEND_BASE_URL=http://localhost:8080
   ```

6. **Start development server**
   ```bash
   npm run dev
   # or
   bun run dev
   ```

   App will be available at `http://localhost:8080`

---

## 📦 Environment Variables

### Frontend (.env in root)

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_PROJECT_ID` | Supabase project identifier | `tjkwiztehdcxrsdqdoaz` |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/public key (JWT) | `eyJ***` |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://***.supabase.co` |

### Edge Functions (Supabase Dashboard)

| Variable | Description | Example |
|----------|-------------|---------|
| `MIDTRANS_SERVER_KEY` | Midtrans server key (sandbox or production) | `SB-Mid-***` |
| `MIDTRANS_IS_PRODUCTION` | Production mode flag | `false` |
| `FRONTEND_BASE_URL` | Frontend URL for CORS | `https://morain-studio.vercel.app` |

**Important:** Never commit real credentials. Use `.env.example` as a template without sensitive values.

---

## 🗂️ Project Structure

```
morain-studio-rental/
├── public/                    # Static assets
│   └── images/               # Gallery images, photobox themes
├── src/
│   ├── components/           # React components
│   │   ├── ui/              # shadcn/ui components
│   │   ├── AuthModal.tsx    # Login/register modal
│   │   ├── BookingModal.tsx # Studio booking wizard
│   │   └── ...
│   ├── pages/               # Route pages
│   │   ├── Index.tsx        # Landing page
│   │   ├── Dashboard.tsx    # User dashboard
│   │   ├── PaymentReturn.tsx# Midtrans return handler
│   │   └── admin/           # Admin-only pages
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.tsx      # Authentication context
│   │   ├── useBookingSlots.ts
│   │   └── usePaymentLogic.ts
│   ├── integrations/supabase/
│   │   ├── client.ts        # Supabase client
│   │   └── types.ts         # Generated DB types
│   └── layouts/             # Layout components
├── supabase/
│   ├── functions/           # Deno Edge Functions
│   │   ├── create-midtrans-transaction/
│   │   ├── midtrans-webhook/
│   │   └── cancel-booking/
│   └── migrations/          # SQL migration files
├── .env.example             # Environment template
├── vite.config.ts           # Vite configuration
└── vercel.json              # Vercel deployment config
```

---

## 🧪 Testing

Currently, the project does not have automated tests. Manual testing procedures:

### Manual Testing Checklist
- [ ] Register new user → verify profile creation
- [ ] Login with email/password → verify session
- [ ] Create booking → verify slot availability
- [ ] Complete payment (sandbox) → verify webhook updates
- [ ] Admin: view all bookings → verify RLS policies
- [ ] Mobile responsiveness → test on Chrome DevTools

**Future improvement:** Add Playwright for E2E testing and Vitest for unit tests.

---

## 📦 Build & Deployment

### Production Build

```bash
npm run build
# Output: dist/
```

Build creates optimized, code-split bundles:
- Main bundle: ~364KB (gzipped: ~93KB)
- Vendor chunks: React, Supabase, UI components separated
- CSS: ~95KB (gzipped: ~16KB)

### Deploy to Vercel

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect Vercel**
   - Import repository on [vercel.com](https://vercel.com)
   - Configure environment variables in Vercel dashboard
   - Deploy automatically on every push

3. **Set Environment Variables in Vercel**
   ```
   VITE_SUPABASE_PROJECT_ID=***
   VITE_SUPABASE_PUBLISHABLE_KEY=***
   VITE_SUPABASE_URL=***
   ```

4. **Update Edge Function Environment**
   In Supabase Dashboard, update `FRONTEND_BASE_URL` to your Vercel URL

---

## 🤝 Contributing

Contributions are welcome! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/AmazingFeature
   ```
5. **Open a Pull Request**

### Code Standards
- Follow existing code style (ESLint + Prettier)
- Write meaningful commit messages
- Test changes locally before submitting
- Update documentation if needed

---

## 📄 License

Distributed under the MIT License. See `LICENSE` file for more information.

---

## 🙏 Acknowledgements

### Libraries & Tools
- [React](https://reactjs.org/) — UI library
- [Supabase](https://supabase.com/) — Backend-as-a-Service
- [shadcn/ui](https://ui.shadcn.com/) — Component library
- [Tailwind CSS](https://tailwindcss.com/) — CSS framework
- [Midtrans](https://midtrans.com/) — Payment gateway
- [Lucide Icons](https://lucide.dev/) — Icon set
- [date-fns](https://date-fns.org/) — Date utilities
- [Vercel](https://vercel.com/) — Hosting platform

### Inspirations
- Modern SaaS booking systems
- Photography studio operational workflows
- Indonesian payment ecosystem (Midtrans, e-wallets, bank transfers)

---

<div align="center">

Made with ❤️ by [Gusweda](https://github.com/idabagusweda)

**[⬆ back to top](#-morain-studio-rental)**

</div>
