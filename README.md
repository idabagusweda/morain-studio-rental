<p align="center">
  <img src="./public/images/morainLogo-New.png" alt="Morain Studio Rental" width="180" />
</p>

<h1 align="center">Morain Studio Rental</h1>

<p align="center">
  A web-based booking and studio management system for photography studio rentals.
</p>

<p align="center">
  <a href="https://morainstudio.web.id">Live Demo</a>
  &nbsp;·&nbsp;
  <a href="https://github.com/idabagusweda/morain-studio-rental/issues">Report an Issue</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=20232A" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript&logoColor=white" />
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5.4-646CFF?logo=vite&logoColor=white" />
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white" />
  <a href="./LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" /></a>
</p>

---

## Overview

Morain Studio Rental is a web application for managing photography studio bookings. Customers can check studio availability, create reservations, make payments, and review their booking history. Studio administrators can manage bookings, users, and operational settings through an administration dashboard.

The application uses React and TypeScript on the frontend, with Supabase providing authentication, database, and storage services. Midtrans is used to process payments.

## Features

### Customer

- **Account access:** Register and sign in using email and password or Google OAuth.
- **Studio booking:** Follow a multi-step booking process and check available date and time slots.
- **Payment options:** Pay in full or choose a 50% down payment through Midtrans.
- **Booking dashboard:** Review booking history, access invoices, and manage profile information.
- **Payment countdown:** A 15-minute countdown is provided during the payment process.
- **Language support:** Switch between Indonesian and English for all interface text.

### Administration

- **Booking management:** View bookings and update booking or payment statuses.
- **Dashboard overview:** Review booking statistics and revenue information.
- **Calendar:** View scheduled studio bookings in a calendar layout.
- **User management:** Search users and manage administrative roles.
- **Studio settings:** Configure operating hours and booking slot duration.

## Technology Stack

| Area                 | Technology                               |
| -------------------- | ---------------------------------------- |
| Frontend             | React 18, TypeScript, Vite               |
| Styling and UI       | Tailwind CSS, shadcn/ui, Radix UI        |
| Routing              | React Router                             |
| Forms and validation | React Hook Form, Zod                     |
| Server state         | TanStack Query                           |
| Internationalization | i18next, react-i18next, date-fns         |
| Backend services     | Supabase                                 |
| Database             | PostgreSQL with Row Level Security (RLS) |
| Serverless functions | Supabase Edge Functions (Deno)           |
| Payment gateway      | Midtrans                                 |
| Hosting              | Vercel                                   |
| Code quality         | ESLint, Prettier                         |

## Getting Started

### Prerequisites

- Node.js 18 or later, or Bun 1.0 or later
- npm or Bun
- A Supabase project
- A Midtrans account for payment testing

### 1. Clone the repository

```bash
git clone https://github.com/idabagusweda/morain-studio-rental.git
cd morain-studio-rental
```

### 2. Install dependencies

Using npm:

```bash
npm install
```

Or using Bun:

```bash
bun install
```

### 3. Configure environment variables

Create a local environment file from the example:

```bash
cp .env.example .env
```

Set the following frontend variables in `.env`:

```env
VITE_SUPABASE_PROJECT_ID=your_project_id
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
```

Do not commit `.env` or place private credentials in variables prefixed with `VITE_`. Values exposed through `VITE_` variables are included in the client-side application bundle.

### 4. Configure Supabase

Apply the SQL migrations in `supabase/migrations/` to your Supabase project. You can use the Supabase SQL Editor or the Supabase CLI after configuring it for the project:

```bash
supabase db push
```

Configure the following secrets for the Supabase Edge Functions in the Supabase Dashboard:

```env
MIDTRANS_SERVER_KEY=your_midtrans_server_key
MIDTRANS_IS_PRODUCTION=false
FRONTEND_BASE_URL=http://localhost:8080
```

Use your production frontend URL for `FRONTEND_BASE_URL` when deploying. Keep the Midtrans server key in the server-side environment; it must not be exposed to the frontend.

### 5. Run the development server

```bash
npm run dev
```

Or with Bun:

```bash
bun run dev
```

The development server is configured to run at `http://localhost:8080`.

## Environment Variables

### Frontend (`.env`)

| Variable                        | Description                                |
| ------------------------------- | ------------------------------------------ |
| `VITE_SUPABASE_PROJECT_ID`      | Supabase project identifier.               |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase publishable/anonymous client key. |
| `VITE_SUPABASE_URL`             | Supabase project URL.                      |

### Supabase Edge Functions

| Secret                   | Description                                   |
| ------------------------ | --------------------------------------------- |
| `MIDTRANS_SERVER_KEY`    | Server-side Midtrans API key.                 |
| `MIDTRANS_IS_PRODUCTION` | Enables or disables Midtrans production mode. |
| `FRONTEND_BASE_URL`      | Frontend origin used by the Edge Functions.   |

Use test credentials for local development. Never commit real keys, tokens, passwords, or other secrets to the repository.

## Project Structure

```text
morain-studio-rental/
├── public/
│   └── images/                 # Public images and static assets
├── src/
│   ├── components/             # Shared and feature-specific components
│   │   ├── admin/              # Administration components
│   │   ├── dashboard/          # Customer dashboard components
│   │   └── ui/                 # UI components
│   ├── hooks/                  # Custom React hooks
│   ├── integrations/
│   │   └── supabase/           # Supabase client and generated types
│   ├── layouts/                # Shared page layouts
│   ├── lib/                    # Utility helpers and locale formatters
│   ├── locales/                # Translation dictionaries
│   │   ├── en/                 # English translations
│   │   └── id/                 # Indonesian translations
│   ├── pages/                  # Application pages and route views
│   │   └── admin/              # Administration pages
│   ├── App.tsx                 # Application routes
│   └── i18n.ts                 # i18next configuration
├── supabase/
│   ├── functions/              # Supabase Edge Functions
│   └── migrations/             # Database migrations
├── .env.example                # Environment variable template
├── vite.config.ts              # Vite configuration
└── vercel.json                 # Vercel deployment configuration
```

## Testing

The project does not currently include an automated test suite. The following core flows should be checked manually when validating a local or deployed instance:

- Register a user and verify that the user profile is created.
- Sign in and sign out using the supported authentication methods.
- Create a booking and verify date and time-slot availability.
- Complete a payment using Midtrans sandbox credentials and verify the resulting booking status.
- Check that administrative pages and data are restricted to authorized users.
- Review the layout on desktop and mobile screen sizes.

## Build and Deployment

Create a production build with:

```bash
npm run build
```

The generated frontend files are placed in the `dist/` directory.

For deployment on Vercel:

1. Import the GitHub repository into Vercel.
2. Configure the frontend environment variables in the Vercel project settings.
3. Deploy the application.
4. Set `FRONTEND_BASE_URL` in Supabase Edge Function secrets to the deployed application URL.
5. Configure the required Midtrans credentials for the selected environment.

## Contributing

Contributions and suggestions are welcome. To propose a change:

1. Fork the repository.
2. Create a branch for your change.
3. Make and test your updates.
4. Open a pull request with a clear description of the changes.

Please follow the existing code style and update the documentation when behavior or configuration changes.

## License

This project is distributed under the MIT License. See the [`LICENSE`](./LICENSE) file for details.

## Acknowledgements

This project uses open-source tools and services including [React](https://react.dev/), [Supabase](https://supabase.com/), [shadcn/ui](https://ui.shadcn.com/), [Tailwind CSS](https://tailwindcss.com/), [Midtrans](https://midtrans.com/), [Lucide](https://lucide.dev/), and [Vercel](https://vercel.com/).

---

<p align="center">
  <a href="https://github.com/idabagusweda">GitHub: idabagusweda</a>
</p>
