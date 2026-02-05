# TikDNA Firebase Cloud Functions Deployment Guide

## Prerequisites

Your account: **matmiluxai@gmail.com**  
Firebase Project: **dnax-matmiluxai-2026**

## 1. FIREBASE CLI SETUP

### Install Firebase Tools Globally
```bash
npm install -g firebase-tools
```

### Login to Firebase
```bash
firebase login
```
This will open a browser window. Sign in with **matmiluxai@gmail.com**.

### Verify Current Project
```bash
firebase use
```
Should show: `dnax-matmiluxai-2026 (current)`

---

## 2. INSTALL FUNCTION DEPENDENCIES

Navigate to the functions directory and install dependencies:

```bash
cd functions
npm install
cd ..
```

---

## 3. DEPLOYMENT COMMANDS

### Deploy Everything (Functions, Firestore Rules, Storage Rules)
```bash
firebase deploy
```

### Deploy Only Functions
```bash
firebase deploy --only functions
```

### Deploy Only Firestore Rules
```bash
firebase deploy --only firestore:rules
```

### Deploy Only Storage Rules
```bash
firebase deploy --only storage:rules
```

### Deploy Specific Function
```bash
firebase deploy --only functions:processDNAFile
```

---

## 4. TESTING THE DEPLOYMENT

### Test with Firebase Emulators (Local Testing)
```bash
# Start emulators for local testing
firebase emulators:start

# In another terminal, run your Next.js app
npm run dev
```

The emulators will run on:
- Functions: http://localhost:5001
- Firestore: http://localhost:8080
- Storage: http://localhost:9199

### View Cloud Function Logs
```bash
firebase functions:log
```

### View Specific Function Logs
```bash
firebase functions:log --only processDNAFile
```

---

## 5. ENABLE REQUIRED FIREBASE SERVICES

Make sure these are enabled in Firebase Console (https://console.firebase.google.com/):

1. **Authentication** - Already enabled
2. **Firestore Database** - Already enabled
3. **Cloud Storage** - Already enabled
4. **Cloud Functions** - Will be enabled on first deploy

### Required APIs (Auto-enabled by Firebase)
- Cloud Functions API
- Cloud Build API
- Cloud Storage API
- Firestore API

---

## 6. SET ENVIRONMENT VARIABLES (if needed)

If you need to set secrets or config for Cloud Functions:

```bash
firebase functions:config:set someservice.key="THE API KEY"
```

---

## 7. PRODUCTION DEPLOYMENT WORKFLOW

```bash
# 1. Build and test locally
npm run build
npm run test

# 2. Build functions
cd functions
npm run build
cd ..

# 3. Deploy to Firebase
firebase deploy

# 4. Verify deployment
firebase functions:log --limit 50

# 5. Test upload on https://iliarudich0.github.io/dnax/dashboard/cloud-processing
```

---

## 8. MONITORING AND DEBUGGING

### View Firebase Console
https://console.firebase.google.com/project/dnax-matmiluxai-2026

Navigate to:
- **Functions** → See deployed functions and metrics
- **Firestore** → View data structure
- **Storage** → See uploaded files
- **Authentication** → User management

### Common Issues

**Issue:** Function deployment fails with "insufficient permissions"  
**Solution:** Run `firebase login --reauth` and ensure billing is enabled

**Issue:** Storage trigger not firing  
**Solution:** Check Storage rules and ensure files are uploaded to `users/{userId}/raw/` path

**Issue:** Timeout errors  
**Solution:** Increase timeout in function config (currently 540s / 9 minutes)

---

## 9. COST OPTIMIZATION

Current configuration:
- Memory: 512 MiB (suitable for DNA files up to 100MB)
- Timeout: 540 seconds
- Region: us-central1

To reduce costs:
- Delete old DNA files after processing
- Use Firebase Storage lifecycle rules to auto-delete files
- Monitor function invocations in Firebase Console

---

## 10. GITHUB ACTIONS INTEGRATION

The GitHub workflow (`.github/workflows/pages.yml`) handles frontend deployment.  
Cloud Functions are deployed separately using Firebase CLI.

For automated Cloud Function deployment, add this to your workflow:

```yaml
- name: Deploy Cloud Functions
  run: |
    npm install -g firebase-tools
    cd functions && npm ci && cd ..
    firebase deploy --only functions --token ${{ secrets.FIREBASE_TOKEN }}
```

To generate a CI token:
```bash
firebase login:ci
```

---

## 11. QUICK REFERENCE

```bash
# Deploy everything
firebase deploy

# Deploy only what changed
firebase deploy --only functions:processDNAFile
firebase deploy --only firestore:rules
firebase deploy --only storage:rules

# Check status
firebase projects:list
firebase use

# View logs
firebase functions:log --limit 100

# Local testing
firebase emulators:start

# Clear function cache (if needed)
firebase functions:delete processDNAFile
firebase deploy --only functions:processDNAFile
```

---

## 12. ARCHITECTURE SUMMARY

### Data Flow:
1. User uploads DNA file via frontend → Firebase Storage (`users/{userId}/raw/{fileName}`)
2. Cloud Storage trigger fires → `processDNAFile` function
3. Function streams file, parses SNPs, extracts first 100 as sample
4. Function writes results to Firestore → `users/{userId}/dna_results/{fileId}`
5. Frontend listens to Firestore real-time → Displays processing status and results

### Security:
- Storage Rules: Users can only access their own files
- Firestore Rules: Users can only read their own results
- Functions run with admin privileges to write results
- File size limit: 100MB
- Allowed types: .txt, .csv

---

## Next Steps

1. Run `cd functions && npm install`
2. Run `firebase deploy`
3. Test upload at https://iliarudich0.github.io/dnax/dashboard/cloud-processing
4. Monitor logs with `firebase functions:log`

For issues, check:
- Firebase Console Logs
- Browser DevTools Console
- Network tab for API calls
