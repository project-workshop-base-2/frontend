# IDRX AI Content Generator - Deployment Guide

## Overview

Frontend app untuk generate AI content dan post ke Farcaster menggunakan IDRX credits.

**Tech Stack:**
- Next.js 16 (App Router)
- OnchainKit (MiniKit integration)
- Wagmi & Viem
- Farcaster Auth Kit
- Base Sepolia testnet

---

## Pre-Deployment Checklist

### 1. Environment Variables

Pastikan semua environment variables sudah di-set di `.env.local`:

```bash
# Groq API Key (for AI generation)
GROQ_API_KEY=your_groq_api_key

# Coinbase Developer Platform API Key (for MiniKit)
NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_cdp_api_key

# Smart Contract Addresses (Base Sepolia)
NEXT_PUBLIC_PAYMENT_GATEWAY_ADDRESS=0x2a85321641E764599B4Bae824F57F58C0bb9Fb84
NEXT_PUBLIC_IDRX_ADDRESS=0x7C88517A431096cf923E0f2aD5BB65848d5b4C9d

# Chain Configuration
NEXT_PUBLIC_CHAIN_ID=84532

# Apify API Token (optional - for scraping)
APIFY_API_TOKEN=your_apify_token

# Privy App ID (optional - if using Privy)
NEXT_PUBLIC_PRIVY_APP_ID=your_privy_app_id

# Farcaster Configuration
NEXT_PUBLIC_FARCASTER_DOMAIN=your-domain.com
NEXT_PUBLIC_FARCASTER_SIWE_URI=https://your-domain.com

# App URL (production)
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### 2. Build Test

```bash
npm run build
```

Pastikan build sukses tanpa error.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Keuntungan:**
- Easy deployment
- Automatic HTTPS
- Edge functions
- Git integration

**Steps:**

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Link Project**
   ```bash
   cd frontend
   vercel link
   ```

3. **Set Environment Variables**
   ```bash
   # Production environment
   vercel env add GROQ_API_KEY production
   vercel env add NEXT_PUBLIC_CDP_CLIENT_API_KEY production
   vercel env add NEXT_PUBLIC_APP_URL production
   # ... add all other env vars
   ```

4. **Deploy to Staging**
   ```bash
   vercel
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

6. **Update Manifest**

   Setelah deploy, update `.well-known/farcaster.json` dengan:
   - Production domain URLs
   - Image assets URLs
   - Generate account association di https://build.base.org/account-association

### Option 2: Docker

**Dockerfile** sudah tersedia di root project:

```bash
# Build image
docker build -t idrx-frontend .

# Run container
docker run -p 3000:3000 \
  -e GROQ_API_KEY=your_key \
  -e NEXT_PUBLIC_CDP_CLIENT_API_KEY=your_key \
  -e NEXT_PUBLIC_APP_URL=https://your-domain.com \
  idrx-frontend
```

### Option 3: Traditional Hosting

```bash
# Build for production
npm run build

# Start production server
npm run start

# Or use PM2 for process management
pm2 start npm --name "idrx-frontend" -- start
```

---

## Post-Deployment

### 1. Verify Routes

Test semua routes:
- ✅ `/` → redirects to `/dashboard`
- ✅ `/dashboard` → Homepage dengan credits & posts
- ✅ `/ai-studio` → AI content generation (4 steps)
- ✅ `/wallet` → Buy/use credits
- ✅ `/.well-known/farcaster.json` → Manifest untuk Base App Mini App

### 2. Test Farcaster Integration

Di Base App mobile:
1. Open your deployed URL
2. Verify MiniKit context detected
3. Test AI generation flow
4. Test posting ke Farcaster

### 3. Test Wallet Connection

1. Connect dengan wallet
2. Check IDRX balance
3. Buy credits transaction
4. Use credits transaction
5. Generate AI content (uses 1 credit)

### 4. Generate Account Association

**CRITICAL untuk Base App Mini App:**

1. Go to https://build.base.org/account-association
2. Connect wallet dengan Farcaster account
3. Enter your production domain
4. Sign message
5. Copy generated JSON
6. Update `public/.well-known/farcaster.json`:
   ```json
   {
     "accountAssociation": {
       "header": "<generated_header>",
       "payload": "<generated_payload>",
       "signature": "<generated_signature>"
     }
   }
   ```
7. Redeploy

### 5. Image Assets

Create dan upload required images:
- `icon-1024.png` (1024×1024px) - App icon
- `loading-200.png` (200×200px) - Loading screen
- `splash-1024.png` (1024×1024px) - Splash screen
- `og-image.png` (1200×630px) - Social preview

---

## Testing Checklist

### Functional Testing

- [ ] Homepage redirects to dashboard
- [ ] Dashboard shows credit balance
- [ ] Dashboard shows generated posts list
- [ ] Navigation bar works (dashboard, ai-studio, wallet)
- [ ] Wallet page displays balance correctly
- [ ] Buy credits flow works end-to-end
- [ ] Use credits flow works end-to-end
- [ ] AI Studio - Step 1: Personality selection
- [ ] AI Studio - Step 2: Topic input
- [ ] AI Studio - Step 3: Hook selection (5 hooks generated)
- [ ] AI Studio - Step 4: Content preview
- [ ] Farcaster posting works (MiniKit integration)
- [ ] Copy to clipboard functionality
- [ ] Error handling displays correctly
- [ ] Loading states show properly

### Mobile Testing (430px)

- [ ] All pages fit within 430px width
- [ ] Bottom navbar visible and functional
- [ ] Forms are usable on mobile
- [ ] Buttons are tap-friendly
- [ ] Text is readable

### Performance

- [ ] First load < 3 seconds
- [ ] Time to Interactive < 2 seconds
- [ ] Lighthouse score > 90

---

## Monitoring & Maintenance

### Key Metrics to Watch

1. **Error Rate**: Should be < 1%
2. **Transaction Success Rate**: Should be > 95%
3. **API Response Time**: Should be < 500ms p95
4. **AI Generation Success**: Track hook generation & content generation success rates

### Common Issues

**Issue: "Mini App context not detected"**
- Check MiniKit configuration in `providers.tsx`
- Verify `NEXT_PUBLIC_CDP_CLIENT_API_KEY` is set
- Check frame headers in `next.config.ts`

**Issue: "Transaction failed"**
- Check wallet has enough IDRX balance
- Verify smart contract addresses
- Check Base Sepolia RPC is working

**Issue: "AI generation failed"**
- Check `GROQ_API_KEY` is valid
- Verify API quota not exceeded
- Check personality templates are loaded

### Rollback Process

If deployment fails:

```bash
# Vercel
vercel ls  # List deployments
vercel promote <previous-deployment-url>

# Docker
docker ps  # Get container ID
docker stop <container_id>
docker run <previous-image>
```

---

## Support & Resources

- **Base App Docs**: https://docs.base.org/wallet-app/mini-apps
- **OnchainKit**: https://docs.base.org/onchainkit
- **Farcaster Auth Kit**: https://docs.farcaster.xyz/auth-kit
- **Next.js Docs**: https://nextjs.org/docs

---

## Success Criteria

✅ Build passes without errors
✅ All environment variables set
✅ Farcaster manifest accessible
✅ Account association generated
✅ MiniKit integration works
✅ All core flows functional
✅ Mobile responsive (430px)
✅ Performance metrics met

Deployment complete! 🎉
