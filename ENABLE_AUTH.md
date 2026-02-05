# Enable Firebase Authentication

## OAuth Error Fix: "The OAuth client was not found. Error 401: invalid_client"

This error occurs because no authentication providers are enabled in your Firebase project. Firebase requires manual configuration through the web console.

## Steps to Enable Authentication (Required)

### Option 1: Email/Password (Recommended - Simplest)

1. **Open Firebase Console:**
   ```
   https://console.firebase.google.com/project/dnax-matmiluxai-2026/authentication/providers
   ```

2. **Enable Email/Password:**
   - Click on "Email/Password" in the Sign-in providers list
   - Toggle the **Enable** switch to ON
   - Click **Save**

3. **Done!** No additional configuration needed.

### Option 2: Google Sign-In (Recommended - Best UX)

1. **Open Firebase Console:**
   ```
   https://console.firebase.google.com/project/dnax-matmiluxai-2026/authentication/providers
   ```

2. **Enable Google:**
   - Click on "Google" in the Sign-in providers list
   - Toggle the **Enable** switch to ON
   - Set **Project support email** to: `matmiluxai@gmail.com`
   - Click **Save**

3. **Add Authorized Domains:**
   - Scroll down to "Authorized domains" section
   - Add: `iliarudich0.github.io` (your GitHub Pages domain)
   - The domain should be automatically added, but verify it's present

4. **Done!** No OAuth client ID needed for Google Sign-In.

## Current Configuration Status

- ✅ Firebase project: `dnax-matmiluxai-2026`
- ✅ Firebase account: `matmiluxai@gmail.com`
- ✅ Cloud Functions deployed
- ✅ Firestore rules deployed
- ✅ Storage rules deployed
- ❌ Authentication providers: **NOT ENABLED YET**

## After Enabling Authentication

### Test the Application

1. **Visit your site:**
   ```
   https://iliarudich0.github.io/dnax/auth
   ```

2. **Sign up/Sign in:**
   - If you enabled Email/Password: Enter email and password
   - If you enabled Google: Click "Sign in with Google"

3. **Access Dashboard:**
   ```
   https://iliarudich0.github.io/dnax/dashboard
   ```

4. **Test DNA Upload:**
   ```
   https://iliarudich0.github.io/dnax/dashboard/cloud-processing
   ```

### Monitor Cloud Functions

To see processing logs:
```powershell
firebase functions:log --only processDNAFile
```

## Why Manual Configuration?

Firebase authentication provider configuration **cannot** be automated via CLI for security reasons:
- OAuth client credentials are sensitive
- Google requires manual review of OAuth consent screens
- Firebase enforces manual verification of authorized domains

## Troubleshooting

### Still Getting OAuth Error?
- Clear browser cache and cookies
- Check that you enabled the correct provider (Email/Password or Google)
- Verify `NEXT_PUBLIC_USE_FIREBASE=true` in `.env.local`
- Rebuild the application: `npm run build`

### Can't Access Firebase Console?
- Make sure you're logged in as: `matmiluxai@gmail.com`
- Use this direct link: https://console.firebase.google.com/project/dnax-matmiluxai-2026/authentication

### Authentication Works but Upload Fails?
- Check storage rules are deployed: `firebase deploy --only storage`
- Verify file size is under 100MB
- Check browser console for errors

## Next Steps After Enabling Auth

1. ✅ Enable Email/Password or Google Sign-In (you need to do this now)
2. Test sign-up on production site
3. Upload a DNA file (23andMe or AncestryDNA format)
4. Verify Cloud Function processes the file
5. Check results in Firestore database

---

**Current Status:** Waiting for you to enable authentication providers in Firebase Console.

**Quick Link:** https://console.firebase.google.com/project/dnax-matmiluxai-2026/authentication/providers
