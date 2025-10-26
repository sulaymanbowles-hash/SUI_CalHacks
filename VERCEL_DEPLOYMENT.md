# Vercel Deployment Guide

This guide covers deploying the DropKit web app to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. GitHub repository connected to Vercel (or use Vercel CLI)

## Quick Deploy

### Option 1: Deploy via GitHub (Recommended)

1. Push this repository to GitHub
2. Go to https://vercel.com/new
3. Import your GitHub repository
4. Vercel will auto-detect the Vite configuration
5. Add environment variables (see below)
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from project root
vercel

# Follow the prompts, then deploy to production
vercel --prod
```

## Environment Variables

Configure these in Vercel Dashboard → Settings → Environment Variables:

### Required for OAuth (zkLogin)

- `VITE_OAUTH_GOOGLE_CLIENT_ID` - Your Google OAuth client ID
- `VITE_OAUTH_REDIRECT_URL` - Your deployed URL + `/auth` (e.g., `https://yourdomain.vercel.app/auth`)

### Optional (already set in vercel.json)

- `VITE_PACKAGE_ID` - Sui package ID (testnet)
- `VITE_POLICY_ID` - Transfer policy ID (testnet)
- `VITE_WALRUS_PUBLISHER_URL` - Walrus publisher endpoint
- `VITE_WALRUS_AGGREGATOR_URL` - Walrus aggregator endpoint

## Build Configuration

The project is configured to build from the `web` directory:

- **Build Command**: `cd web && npm install && npm run build`
- **Output Directory**: `web/dist`
- **Install Command**: `cd web && npm install`
- **Framework**: Vite

## Post-Deployment

### 1. Update OAuth Redirect URI

After deployment, update your Google OAuth settings:

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add your Vercel URL to "Authorized redirect URIs":
   - `https://your-app.vercel.app/auth`
   - `https://your-app.vercel.app` (for zkLogin callback)

### 2. Update Environment Variables

In Vercel Dashboard:
1. Go to Settings → Environment Variables
2. Set `VITE_OAUTH_REDIRECT_URL` to `https://your-app.vercel.app/auth`
3. Redeploy if needed

### 3. Test the Deployment

1. Visit your Vercel URL
2. Test wallet connection
3. Try creating an event
4. Verify transactions on Sui testnet

## Troubleshooting

### Build Fails

- Check that Node.js version is 18.x or higher
- Verify all dependencies are in `web/package.json`
- Check build logs in Vercel dashboard

### Environment Variables Not Loading

- Ensure variables are prefixed with `VITE_`
- Redeploy after adding new variables
- Check browser console for `import.meta.env` values

### Routing Issues (404 on refresh)

- Verify `vercel.json` rewrites are in place
- This should already be configured in the root `vercel.json`

### OAuth Redirect Errors

- Double-check redirect URI matches exactly
- Ensure OAuth client ID is correct
- Check browser console for detailed errors

## Custom Domain

To add a custom domain:

1. Go to Vercel Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as instructed
4. Update `VITE_OAUTH_REDIRECT_URL` to use custom domain

## Production Checklist

- [ ] Environment variables configured
- [ ] OAuth redirect URIs updated
- [ ] Build succeeds without errors
- [ ] Wallet connection works
- [ ] Event creation works
- [ ] Transactions execute successfully
- [ ] Custom domain configured (optional)
- [ ] Analytics/monitoring set up (optional)

## Monitoring

Vercel provides built-in analytics. For more detailed monitoring:

- Enable Vercel Analytics in project settings
- Set up error tracking (e.g., Sentry)
- Monitor Sui testnet transactions

## Support

- Vercel Docs: https://vercel.com/docs
- Vite Docs: https://vitejs.dev/
- Sui Docs: https://docs.sui.io/

## Notes

- This is a **testnet** deployment
- Uses ephemeral browser wallets for demo purposes
- Not production-ready for mainnet without proper wallet integration
- Gas fees are on testnet (free from faucet)
