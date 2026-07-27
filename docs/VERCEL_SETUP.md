# Vercel Deployment Setup

This guide walks through connecting this repository to Vercel for automatic preview deployments.

## Prerequisites

- A Vercel account (free tier works)
- This repository pushed to GitHub
- A Neon Postgres database (see README.md)

## Steps

### 1. Create Vercel Project

1. Go to [vercel.com](https://vercel.com)
2. Sign in with GitHub
3. Click "Add New..." → "Project"
4. Import the `talentbank-event-calendar` repository
5. Configure the project:
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### 2. Configure Environment Variables

In the Vercel project settings, add:

```
DATABASE_URL = postgresql://...
```

Use your Neon connection string (same as in `.env.local`).

For production, you can create a separate Neon branch or use the same database.

### 3. Deploy

Click "Deploy" to trigger the first build.

Vercel will:

- Build the Next.js app
- Deploy to a production URL (e.g., `talentbank-event-calendar.vercel.app`)
- Set up preview deployments for every PR

### 4. Verify Preview Deployments

1. Create a new branch
2. Make a small change (e.g., edit `src/app/page.tsx`)
3. Push and create a PR
4. Vercel will automatically deploy a preview
5. Check the deployment URL in the PR checks

### 5. Optional: Custom Domain

To add a custom domain:

1. Go to Project Settings → Domains
2. Add your domain
3. Configure DNS records as instructed

## Environment Variables for Different Environments

Vercel supports environment-specific variables:

- **Production:** Main branch deployments
- **Preview:** PR and branch deployments
- **Development:** Local development (use `.env.local`)

You can configure different `DATABASE_URL` values for each environment in Vercel's project settings.

## Regions

The `vercel.json` configures deployment to Singapore (`sin1`) for optimal latency to Malaysia.

Other available regions:

- `hkg1` - Hong Kong
- `kix1` - Osaka
- `syd1` - Sydney

## CI/CD Flow

Once set up, every:

- **Push to main** → Production deployment
- **Push to branch** → Preview deployment
- **Pull request** → Preview deployment with unique URL

The GitHub Actions CI workflow (`.github/workflows/ci.yml`) runs in parallel with Vercel's build, providing additional validation.

## Troubleshooting

### Build Fails with Database Error

The build process should not connect to the database. If you see database connection errors:

1. Check that the build command is `npm run build`
2. Ensure no database queries run at build time (only at runtime)
3. Use the `SKIP_ENV_VALIDATION=true` environment variable if needed

### Preview Deployment Not Triggering

1. Check that Vercel has GitHub app permissions
2. Verify the repository is connected in Vercel settings
3. Check GitHub Actions → Deployments tab for logs

### Slow Build Times

Next.js builds are cached by Vercel. First builds may take 2-3 minutes, subsequent builds should be faster.

## Next Steps (Sprint 1)

After Sprint 1 schema is implemented:

1. Run database migrations on Neon
2. Update environment variables if needed
3. Seed the database with the 31 events from `docs/raw-source-data.json`
