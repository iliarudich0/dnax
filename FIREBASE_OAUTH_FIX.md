# Fixing Firebase OAuth Error - Step by Step Guide

## Error: "The OAuth client was not found. Error 401: invalid_client"

This error occurs because Google Sign-In (OAuth) is not properly configured in your Firebase project.

---

## SOLUTION - Firebase Console Setup

### Step 1: Enable Google Sign-In Provider

1. Go to Firebase Console: https://console.firebase.google.com/project/dnax-matmiluxai-2026
2. Click **Authentication** in the left sidebar
3. Click **Sign-in method** tab
4. Under "Sign-in providers", find **Google**
5. Click **Google** row
6. Toggle **Enable** switch to ON
7. **Project public-facing name:** Set to "TikDNA"
8. **Project support email:** matmiluxai@gmail.com
9. Click **Save**

### Step 2: Add Authorized Domains

1. Still in **Authentication** → **Settings** tab
2. Scroll to **Authorized domains**
3. Add these domains:
   - `iliarudich0.github.io` (your production domain)
   - `localhost` (already there for local testing)
4. Click **Add domain** for each

### Step 3: Configure OAuth Consent Screen (if needed)

1. Go to Google Cloud Console: https://console.cloud.google.com/
2. Select project **dnax-matmiluxai-2026**
3. Go to **APIs & Services** → **OAuth consent screen**
4. If not configured:
   - User Type: **External**
   - App name: **TikDNA**
   - User support email: matmiluxai@gmail.com
   - Developer contact: matmiluxai@gmail.com
   - Click **Save and Continue**
   - Skip scopes (default is fine)
   - Add test users: matmiluxai@gmail.com
   - Click **Save and Continue**

---

## ALTERNATIVE - Use Email/Password Auth Instead

If Google OAuth is too complex, you can use email/password authentication:

### Enable Email/Password in Firebase Console

1. Firebase Console → **Authentication** → **Sign-in method**
2. Click **Email/Password**
3. Toggle **Enable** to ON
4. Click **Save**

Then users can sign up/sign in with just email and password (no Google OAuth needed).

---

## CLI Commands to Check Status

```powershell
# Check Firebase project
firebase projects:list

# Verify current project
firebase use

# Check authentication providers (requires console access)
# No CLI command available - must use Firebase Console
```

---

## Testing After Fix

1. Enable Google Sign-In in Firebase Console (steps above)
2. Rebuild and redeploy:
   ```powershell
   npm run build
   firebase deploy
   ```
3. Visit: https://iliarudich0.github.io/dnax/auth/
4. Click "Continue with Google"
5. Should work now!

---

## Common OAuth Issues

### Issue: "The OAuth client was not found"
**Fix:** Enable Google provider in Firebase Console → Authentication → Sign-in method

### Issue: "Unauthorized domain"
**Fix:** Add `iliarudich0.github.io` to Authorized domains in Firebase Console

### Issue: "redirect_uri_mismatch"
**Fix:** Firebase automatically handles this - just ensure domain is authorized

---

## Quick Links

- Firebase Console Auth: https://console.firebase.google.com/project/dnax-matmiluxai-2026/authentication/providers
- Google Cloud Console: https://console.cloud.google.com/apis/credentials?project=dnax-matmiluxai-2026

---

## Recommended: Use Email/Password for Now

Since OAuth requires additional setup, **I recommend enabling Email/Password auth first** for easier testing:

1. Firebase Console → Authentication → Sign-in method
2. Enable **Email/Password**
3. Users can then create accounts with just email + password
4. Add Google OAuth later when needed

This way you can test the DNA processing functionality immediately without OAuth complexity!
