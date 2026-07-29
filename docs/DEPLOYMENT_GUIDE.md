# Deployment Guide - TalentBank Event Calendar

**Last Updated:** 2026-07-29
**Version:** 1.1

This guide covers deploying the TalentBank Event Calendar to production on Vercel with Neon Postgres.

---

## Prerequisites

Before deploying, ensure you have:

- ✅ Vercel account (free tier is sufficient)
- ✅ Neon Postgres database (free tier available)
- ✅ Google Cloud Console account (for OAuth)
- ✅ GitHub repository with your code

---

## Deployment Checklist

### Phase 1: Database Setup (Neon Postgres)

#### 1.1 Create Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **"Create a project"**
3. Name: `talentbank-event-calendar-prod`
4. Region: Choose closest to your users (Singapore for Malaysia)
5. Click **"Create project"**

#### 1.2 Get Database Connection String

1. In Neon dashboard, click **"Connection Details"**
2. Copy the connection string (starts with `postgresql://`)
3. Keep this safe - you'll need it for Vercel

#### 1.3 Run Database Migrations

```bash
# Set production database URL temporarily
export DATABASE_URL="postgresql://your-prod-connection-string"

# Run migrations
npm run db:push

# Seed data (optional - only if starting fresh)
npm run db:seed
```

---

### Phase 2: Google OAuth Setup

#### 2.1 Configure Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project: "TalentBank Event Calendar Prod"
3. Enable **Google+ API**
4. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**

#### 2.2 Configure OAuth Consent Screen

1. User Type: **Internal** (for Google Workspace)
2. App name: `TalentBank Event Calendar`
3. User support email: `events@talentcorp.com.my`
4. Authorized domains: Add your production domain
5. Save and continue

#### 2.3 Create OAuth Credentials

1. Application type: **Web application**
2. Name: `TalentBank Event Calendar Production`
3. Authorized JavaScript origins:
   ```
   https://your-production-domain.com
   ```
4. Authorized redirect URIs:
   ```
   https://your-production-domain.com/api/auth/callback/google
   ```
5. Click **Create**
6. Save **Client ID** and **Client Secret**

---

### Phase 3: Vercel Deployment

#### 3.1 Connect GitHub Repository

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure project:
   - Framework Preset: **Next.js**
   - Root Directory: `./` (leave default)
   - Build Command: `npm run build`
   - Output Directory: `.next`

#### 3.2 Configure Environment Variables

In Vercel project settings, add these environment variables:

```bash
# App Configuration
NEXT_PUBLIC_APP_URL=https://your-production-domain.com

# Database (from Neon)
DATABASE_URL=postgresql://user:password@host/database?sslmode=require

# Auth.js (NextAuth)
NEXTAUTH_URL=https://your-production-domain.com
NEXTAUTH_SECRET=your-generated-secret-here
AUTH_SECRET=your-generated-secret-here

# Google OAuth (from Google Cloud Console)
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Generate NEXTAUTH_SECRET and AUTH_SECRET:**
```bash
# Generate two different secrets
openssl rand -base64 32  # Use for NEXTAUTH_SECRET
openssl rand -base64 32  # Use for AUTH_SECRET
```
**Note:** Both secrets are required for Auth.js v5. Use different values for each.

#### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for build to complete (2-3 minutes)
3. Visit your production URL

---

### Phase 4: Post-Deployment Configuration

#### 4.1 Create First Admin User

1. Visit `https://your-domain.com/admin`
2. Sign in with your Google Workspace account
3. You'll be created as a "viewer" by default
4. Manually update the database to make yourself admin:

```sql
-- Connect to your Neon database
UPDATE users
SET role = 'admin'
WHERE email = 'your-email@talentcorp.com.my';
```

Or use Drizzle Studio:
```bash
npm run db:studio
# Navigate to users table and update your role
```

#### 4.2 Test Core Features

- [ ] User can view public calendar
- [ ] User can view event details
- [ ] User can register for an event
- [ ] Registration confirmation message appears
- [ ] Admin can sign in
- [ ] Admin can create an event
- [ ] Admin can view registrations
- [ ] .ics calendar download works
- [ ] Webcal subscription works

---

## Environment-Specific Configuration

### Production
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://events.talentcorp.com.my
```

### Staging (Optional)
```bash
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://staging-events.talentcorp.com.my
```

### Development
```bash
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Custom Domain Setup

### 4.1 Add Domain to Vercel

1. In Vercel project settings, go to **Domains**
2. Click **"Add"**
3. Enter your domain: `events.talentcorp.com.my`

### 4.2 Configure DNS

Add these DNS records to your domain:

**For root domain (talentcorp.com.my):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For subdomain (events.talentcorp.com.my):**
```
Type: CNAME
Name: events
Value: cname.vercel-dns.com
```

### 4.3 Wait for DNS Propagation

- Usually takes 5-60 minutes
- Vercel will automatically provision SSL certificate

---

## Monitoring and Maintenance

### Enable Vercel Analytics

1. Go to Vercel project settings
2. Navigate to **Analytics**
3. Click **"Enable"**
4. Track page views, performance, and errors

### Database Backups (Neon)

Neon automatically backs up your database:
- Point-in-time recovery available
- Backups retained for 7 days (free tier)
- Manual backups via pg_dump:

```bash
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql
```

### Update Dependencies Regularly

```bash
# Check for updates
npm outdated

# Update to latest safe versions
npm update

# For major updates
npm install package-name@latest
```

---

## Troubleshooting

### Build Failures

**Error: "DATABASE_URL is not defined"**
- Solution: Add DATABASE_URL to Vercel environment variables
- Ensure variable is set for Production environment

**Error: "Module not found"**
- Solution: Clear Vercel build cache
- Redeploy with "Force Deploy"

### Runtime Errors

**Error: "Failed to fetch events"**
- Check database connection
- Verify DATABASE_URL is correct
- Check Neon database is running

**Error: "OAuth error"**
- Verify Google OAuth redirect URIs match production URL
- Check GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET

### Performance Issues

**Slow page loads**
- Enable Vercel Analytics to identify bottlenecks
- Check database query performance
- Consider adding caching with Vercel KV

---

## Security Checklist

Before going live:

- [ ] NEXTAUTH_SECRET is strong (32+ characters)
- [ ] AUTH_SECRET is strong (32+ characters) and different from NEXTAUTH_SECRET
- [ ] All environment variables are set in Vercel (not in code)
- [ ] Google OAuth restricted to Workspace domain
- [ ] Database has strong password
- [ ] SSL certificate is active (automatic with Vercel)
- [ ] Security headers configured (already in next.config.ts)
- [ ] No API keys in Git history
- [ ] Admin users have strong passwords
- [ ] CORS properly configured

---

## Rollback Procedure

If deployment fails or has critical bugs:

1. Go to Vercel project → **Deployments**
2. Find the last working deployment
3. Click **"..."** → **"Promote to Production"**
4. Previous version is now live

For database rollback:
1. Contact Neon support for point-in-time recovery
2. Or restore from manual backup:
```bash
psql $DATABASE_URL < backup-YYYYMMDD.sql
```

---

## Performance Optimization

### Enable Edge Caching

Add to API routes that can be cached:

```typescript
export const runtime = 'edge'
export const revalidate = 3600 // Cache for 1 hour
```

### Image Optimization

Images are automatically optimized by Next.js. For external images, add domains to `next.config.ts`:

```typescript
images: {
  domains: ['example.com'],
}
```

### Database Connection Pooling

Neon provides built-in connection pooling. For high traffic:
- Upgrade to Neon Pro for more connections
- Or use Prisma Accelerate for connection pooling

---

## Scaling Considerations

### Current Limits (Free Tiers)

- **Vercel**: 100 GB bandwidth/month, 100 GB-hours serverless execution
- **Neon**: 3 GB storage, 100 hours compute time/month

### When to Upgrade

**Upgrade Vercel Pro ($20/mo) when:**
- Exceeding 100 GB bandwidth
- Need better performance analytics
- Want password-protected previews

**Upgrade Neon Scale ($19/mo) when:**
- Database exceeds 3 GB
- Need better performance
- Want 7-day point-in-time recovery

---

## Support and Resources

**Documentation:**
- See `docs/` folder for all guides
- README.md for project overview

**External Resources:**
- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Auth.js Docs](https://authjs.dev)

**Getting Help:**
- Technical Issues: Create GitHub issue
- Deployment Issues: Contact Vercel support
- Database Issues: Contact Neon support

---

## Deployment Automation (CI/CD)

Your GitHub Actions workflow already runs on push:

```yaml
# .github/workflows/ci.yml
- Runs type checking
- Runs tests
- Vercel automatically deploys on push to main
```

For more control:
1. Disable auto-deployments in Vercel
2. Use manual deployments via GitHub Actions
3. Add approval gates for production

---

**Deployment Status:** ✅ Production Ready
**Last Deployed:** [Date will be set by Vercel]
**Next Review:** After first production deployment

For questions about deployment, contact the development team or refer to this guide.
