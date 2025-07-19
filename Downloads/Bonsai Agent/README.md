# Bonsai SAT Platform

A comprehensive SAT prep platform for adult learners including college students (18+), professionals, career changers, and non-traditional students. 

## Features

- 🧠 **AI-Powered Learning** - Adaptive AI assistance with GPT-4 integration
- 🖥️ **Desktop Overlay** - Real-time screen monitoring and contextual help
- 👥 **Collaborative Learning** - Real-time whiteboard and study groups
- 👨‍🏫 **Tutor Marketplace** - Connect with verified SAT tutors
- 📱 **Modern Interface** - Clean, professional UI built with shadcn/ui
- 📊 **Advanced Analytics** - Detailed progress tracking and performance insights

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, shadcn/ui, TailwindCSS
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Desktop**: Electron 28+
- **AI**: OpenAI GPT-4, Vision API, Whisper
- **Payments**: Stripe
- **Deployment**: Vercel

## Project Structure

```
bonsai/
├── apps/
│   ├── web/                    # Next.js web application
│   ├── desktop/               # Electron desktop app
│   └── mobile/                # React Native (future)
├── packages/
│   ├── database/              # Supabase types & schemas
│   ├── shared/                # Shared utilities
│   └── ai/                    # AI processing logic
└── supabase/
    ├── migrations/            # Database migrations
    └── functions/            # Edge functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm 8+
- Supabase CLI

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   pnpm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

### Development Commands

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all applications
- `pnpm lint` - Run ESLint
- `pnpm type-check` - Run TypeScript checks
- `pnpm test` - Run tests

## License

MIT License - see [LICENSE](LICENSE) for details.