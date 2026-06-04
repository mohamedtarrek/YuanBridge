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
- **Modern Tech Stack** — Next.js 16, TypeScript, Tailwind CSS v4, Framer Motion

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Next.js 16 | React framework with App Router |
| TypeScript | Type safety |
| Tailwind CSS v4 | Utility-first styling |
| Framer Motion | Animations |
| Railway | Deployment platform |

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
cp .env.example .env

# Edit .env with your Telegram bot credentials:
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

## Deployment to Railway

### Automatic Deployment

1. Push your code to a GitHub repository
2. Go to [Railway.app](https://railway.app) and create a new project
3. Select **Deploy from GitHub repo**
4. Connect your repository
5. Railway will automatically detect the Dockerfile and deploy

### Manual Configuration

If automatic detection fails:

1. Create a new project on Railway
2. Choose **Empty Project**
3. Add a new service → **GitHub Repo**
4. Railway will use the `Dockerfile` in the root directory
5. Add the following environment variables in Railway dashboard:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
6. Deploy

### Environment Variables on Railway

Go to your project dashboard → **Variables** and add:

| Key | Value |
|-----|-------|
| `TELEGRAM_BOT_TOKEN` | Your Telegram bot token |
| `TELEGRAM_CHAT_ID` | Your Telegram chat ID |
| `NODE_ENV` | `production` |

## Project Structure

```
src/
├── app/
│   ├── api/submit-order/route.ts   # Telegram order submission API
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
