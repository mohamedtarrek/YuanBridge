# YuanBridge AI - Forex Trading Strategies Platform

## Overview

YuanBridge AI is a comprehensive Forex trading strategies platform powered by multiple AI providers (GPT-4, Claude, Gemini, DeepSeek). It generates real-time trading strategies, provides market analysis, and supports Arabic/English bilingual interface with dark/light themes.

## Features

- AI-powered Forex strategy generation
- Real-time market analysis
- Premium subscription ($15/month)
- Multi-language (Arabic/English)
- Dark/Light theme
- Stripe & PayPal payments
- Real-time notifications
- Telegram integration
- Technical & fundamental analysis
- Multi-provider AI engine

## Tech Stack

- Next.js 16 (App Router)
- TypeScript
- Tailwind CSS
- Prisma ORM
- PostgreSQL
- NextAuth.js
- Stripe & PayPal
- Framer Motion
- Vitest (Testing)

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL
- npm

### Installation

```bash
git clone https://github.com/yourusername/yuanbridge.git
cd yuanbridge
npm install
npx prisma db push
npx tsx src/lib/db/seed.ts
```

### Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | NextAuth encryption secret |
| `NEXTAUTH_URL` | Application URL |
| `STRIPE_SECRET_KEY` | Stripe API secret |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `PAYPAL_CLIENT_ID` | PayPal client ID |
| `PAYPAL_CLIENT_SECRET` | PayPal client secret |
| `RESEND_API_KEY` | Resend API key for emails |
| `TELEGRAM_BOT_TOKEN` | Telegram bot token |
| `ALPHA_VANTAGE_API_KEY` | Market data API key |
| `OPENAI_API_KEY` | AI provider API key |
| `ANTHROPIC_API_KEY` | Claude API key |
| `GOOGLE_AI_API_KEY` | Gemini API key |
| `DEEPSEEK_API_KEY` | DeepSeek API key |
| `CRON_SECRET` | Secret for cron job endpoints |
| `NEXT_PUBLIC_APP_URL` | Public app URL |

### Running

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Production Build

```bash
npm run build
npm start
```

### Docker

```bash
docker-compose up
```

### Database Seeding

```bash
npx tsx src/lib/db/seed.ts
```

Seed credentials:
- Admin: admin@yuanbridge.com / Admin123!
- Users: ahmed@example.com, sarah@example.com, omar@example.com, emma@example.com (password: User1234!)

## API Documentation

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Strategies
- `GET /api/strategies` - List published strategies
- `GET /api/strategies/[id]` - Get strategy details

### Payments
- `POST /api/payments/create` - Create payment intent
- `POST /api/payments/webhook` - Stripe/PayPal webhook

### User
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile

## Project Structure

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/          # Auth pages
│   ├── (dashboard)/     # Dashboard pages
│   ├── (marketing)/     # Marketing pages
│   └── api/             # API routes
├── components/           # React components
├── lib/                  # Business logic
│   ├── ai/              # AI Strategy Engine
│   ├── auth/            # Authentication
│   ├── db/              # Database client
│   ├── market-data/     # Market data providers
│   ├── notifications/   # Notifications
│   ├── payment/         # Payment processing
│   ├── security/        # Security utilities
│   └── types/           # TypeScript types
└── generated/           # Prisma client
```

## License

Private / All rights reserved
