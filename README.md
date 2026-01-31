# 🤖 Bit AI

> **Build Your Personal Branding** - AI-powered platform for generating high-quality Farcaster posts

![Next.js](https://img.shields.io/badge/Next.js-16.1.4-black?logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61dafb?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4-06b6d4?logo=tailwindcss)

## ✨ Features

- 🧠 **AI Content Generation** - Generate engaging Farcaster posts powered by Groq AI
- 🎯 **Personal Branding** - Build and maintain consistent personal brand
- 🔗 **Farcaster Integration** - Native MiniApp support with Farcaster SDK
- 💳 **Web3 Wallet** - Connect with Privy authentication and OnchainKit
- 📊 **Analytics Dashboard** - Track your content performance
- 🎨 **Modern UI** - Beautiful interface with Radix UI components

## 🛠️ Tech Stack

| Category | Technologies |
|----------|-------------|
| **Framework** | Next.js 16, React 19, TypeScript |
| **Styling** | TailwindCSS 4, Radix UI Components |
| **Web3** | Wagmi, Viem, OnchainKit, Privy |
| **Farcaster** | Farcaster MiniApp SDK, Auth Kit |
| **AI** | Groq SDK |
| **Database** | Supabase |
| **State** | TanStack React Query |

## 📦 Installation

### Prerequisites

- Node.js 18+ 
- npm or yarn or pnpm

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   
   # Privy
   NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id
   
   # Groq AI
   GROQ_API_KEY=your_groq_api_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # Reusable UI components
├── contexts/      # React context providers
├── hooks/         # Custom React hooks
├── lib/           # Utility functions & configurations
├── abi/           # Smart contract ABIs
├── data/          # Static data files
├── styles/        # Global styles
└── types/         # TypeScript type definitions
```

## 🚀 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## 🌐 Deployment

This project is optimized for deployment on [Vercel](https://vercel.com).

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

## 📄 License

This project is private and proprietary.

---

<p align="center">
  <strong>Generate. Post. Grow. Powered by AI.</strong>
</p>
