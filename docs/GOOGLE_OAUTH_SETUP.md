# Google OAuth Setup for Admin Authentication

## Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Name it "Talentbank Event Calendar"

## Step 2: Configure OAuth Consent Screen

1. Navigate to **APIs & Services** → **OAuth consent screen**
2. Select **External** user type
3. Fill in:
   - **App name:** Talentbank Event Calendar Admin
   - **User support email:** Your email
   - **Developer contact:** Your email
4. Click **Save and Continue**
5. Skip scopes (defaults are fine)
6. Add test users if needed
7. Click **Save and Continue**

## Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Select **Web application**
4. Configure:
   - **Name:** Talentbank Admin
   - **Authorized JavaScript origins:**
     - `http://localhost:3000` (development)
     - `https://your-production-domain.vercel.app` (production)
   - **Authorized redirect URIs:**
     - `http://localhost:3000/api/auth/callback/google`
     - `https://your-production-domain.vercel.app/api/auth/callback/google`
5. Click **Create**
6. Copy the **Client ID** and **Client Secret**

## Step 4: Add to Environment Variables

Add to `.env.local`:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=<generate-with-command-below>
GOOGLE_CLIENT_ID=<your-client-id>.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=<your-client-secret>
```

Generate `NEXTAUTH_SECRET`:

```bash
openssl rand -base64 32
```

## Step 5: Add to Vercel

In your Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all four variables above
3. For `NEXTAUTH_URL`, use your production URL

## Step 6: Set Your Admin Role

After first login, update your role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

Or use Drizzle Studio:

```bash
npm run db:studio
```

Navigate to the `users` table and change your role to `admin`.

## User Roles

- **admin** - Full access (create, edit, delete, manage users)
- **editor** - Can create and edit events
- **viewer** - Read-only access

## Testing

1. Start dev server: `npm run dev`
2. Go to `http://localhost:3000/admin`
3. Click "Sign in with Google"
4. Authorize the app
5. You'll be redirected to admin dashboard

## Troubleshooting

**Redirect URI mismatch:**
- Ensure the redirect URI in Google Console matches exactly
- Check for http vs https
- Verify trailing slashes

**403 access_denied:**
- Make sure app is published or you're a test user
- Check OAuth consent screen configuration

**Role not appearing:**
- Clear cookies and sign in again
- Check database - role should be set in `users` table
