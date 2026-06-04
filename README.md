# YuanBridge

**Your Bridge to Chinese Shopping**

YuanBridge is a professional purchasing service that helps customers buy products from Chinese marketplaces when they cannot purchase directly using Chinese Yuan (CNY) or do not have access to Chinese payment methods.

## Features

- **Premium Landing Page** — Hero, How It Works, Why Choose Us, Marketplace Support, Reviews, FAQ, Contact sections
- **Multi-step Order Form** — Dashboard-style form with validation, loading states, and review step
- **Telegram Integration** — All orders submitted via the form are sent to a Telegram chat with professional formatting
- **Anti-spam Protection** — IP-based rate limiting
- **Responsive Design** — Fully mobile responsive
- **SEO Optimized** — Proper metadata and Open Graph tags
- **Arabic Support** — Full RTL Arabic translation with language toggle
- **Modern Tech Stack** — Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations |
| Vercel | Deployment platform |

## Getting Started

### Prerequisites

- Node.js 20+
- npm

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd YuanBridge

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Edit .env.local with your Telegram bot credentials:
# TELEGRAM_BOT_TOKEN=your_bot_token
# TELEGRAM_CHAT_ID=your_chat_id
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `TELEGRAM_BOT_TOKEN` | Telegram Bot API token from @BotFather | Yes |
| `TELEGRAM_CHAT_ID` | Telegram chat ID to receive order notifications | Yes |

## Deployment to Vercel

### One-Click Deploy

1. Push your code to a GitHub repository
2. Go to [Vercel](https://vercel.com/new)
3. Import your GitHub repository
4. Add the following environment variables:
   - `TELEGRAM_BOT_TOKEN` — Your Telegram bot token
   - `TELEGRAM_CHAT_ID` — Your Telegram chat ID
5. Click **Deploy**

Vercel automatically detects Next.js and applies optimal settings.

### Manual Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

### Custom Domain

1. Go to your project on [Vercel Dashboard](https://vercel.com)
2. Navigate to **Settings > Domains**
3. Add your custom domain and follow DNS configuration instructions

## GitHub Integration

### Automatic Deployments

Once your repository is connected to Vercel, every push to the `main` branch triggers an automatic production deployment. Pull request previews are generated automatically.

### GitHub Actions CI

The project includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that:

- Runs on every push and pull request to `main`
- Installs dependencies
- Runs the production build
- Reports any build failures

## Performance Optimizations

- **Edge Runtime** — API route runs on Vercel Edge for fast cold starts (sub-50ms)
- **Image Optimization** — Next.js Image component configured for AVIF/WebP
- **Font Optimization** — Inter font loaded via `next/font` with `swap` display
- **Efficient Animations** — Canvas-based star background, CSS gradient overlays
- **Metadata** — Full Open Graph and Twitter Card support

## Project Structure

```
src/
├── app/
│   ├── api/submit-order/route.ts   # Telegram order submission API (Edge)
│   ├── order/page.tsx              # Order form page
│   ├── success/page.tsx            # Success page
│   ├── globals.css                 # Global styles
│   ├── layout.tsx                  # Root layout
│   └── page.tsx                    # Landing page
├── components/
│   ├── Navbar.tsx                  # Navigation bar
│   ├── Footer.tsx                  # Footer
│   ├── Hero.tsx                    # Hero section
│   ├── HowItWorks.tsx              # Steps section
│   ├── WhyChooseUs.tsx             # Features section
│   ├── MarketplaceSupport.tsx      # Supported platforms
│   ├── Reviews.tsx                 # Customer testimonials
│   ├── FAQ.tsx                     # Accordion FAQ
│   ├── Contact.tsx                 # Contact methods
│   └── OrderForm.tsx               # Multi-step order form
├── lib/
│   ├── i18n/                       # Internationalization
│   ├── rate-limit.ts               # Rate limiting utility
│   └── utils.ts                    # Helper functions
└── types/
    └── index.ts                    # TypeScript interfaces
```

## Telegram Bot Setup

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` and follow the prompts
3. Copy the API token and set it as `TELEGRAM_BOT_TOKEN`
4. Search for [@userinfobot](https://t.me/userinfobot)
5. Send `/start` to get your chat ID
6. Set the chat ID as `TELEGRAM_CHAT_ID`
7. Start a chat with your new bot by sending `/start`

## License

Private — All rights reserved.
