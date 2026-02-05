# TikDNA - Quick Start Commands

## Essential Firebase Commands

### Login & Setup
```powershell
# Install Firebase CLI globally
npm install -g firebase-tools

# Login with matmiluxai@gmail.com
firebase login

# Check current project
firebase projects:list
firebase use dnax-matmiluxai-2026
```

### Local Development
```powershell
# Install function dependencies
npm --prefix functions install

# Build functions
npm --prefix functions run build

# Run Firebase emulators (test locally)
firebase emulators:start

# In another terminal: run Next.js dev server
npm run dev
```

### Deployment
```powershell
# Deploy everything (first time)
firebase deploy

# Deploy only functions
firebase deploy --only functions

# Deploy only rules
firebase deploy --only firestore:rules,storage:rules

# View deployment logs
firebase functions:log --limit 50
```

### Testing the DNA Upload
1. Navigate to: https://iliarudich0.github.io/dnax/dashboard/cloud-processing
2. Sign in with Firebase auth
3. Upload a 23andMe/AncestryDNA .txt file
4. Watch real-time processing status
5. View results when status changes to "completed"

### Monitoring
```powershell
# View function logs
firebase functions:log

# View specific function
firebase functions:log --only processDNAFile

# Stream logs in real-time
firebase functions:log --follow
```

## File Upload Flow

1. **Frontend** → User selects DNA file (.txt or .csv)
2. **Frontend** → Uploads to Firebase Storage: `users/{userId}/raw/{timestamp}_{filename}`
3. **Cloud Function** → Automatically triggered on file upload
4. **Processing** → Streams file, parses SNPs (skips # comments)
5. **Storage** → Saves first 100 SNPs + summary to Firestore: `users/{userId}/dna_results/{fileId}`
6. **Frontend** → Real-time listener shows status: "processing" → "completed"

## Useful Links

- Firebase Console: https://console.firebase.google.com/project/dnax-matmiluxai-2026
- Live Site: https://iliarudich0.github.io/dnax/
- Cloud Processing: https://iliarudich0.github.io/dnax/dashboard/cloud-processing/

## Security Rules

### Storage (`storage.rules`)
- Users can only upload to their own path: `users/{userId}/raw/`
- Max file size: 100MB
- Allowed types: text/plain, text/csv, application/octet-stream

### Firestore (`firestore.rules`)
- Users can read their own `dna_results`
- Cloud Functions can write (admin SDK)
- All data isolated per user

## Environment Variables

Update `.env.local` with Firebase config:
```env
NEXT_PUBLIC_USE_FIREBASE=true
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDtafp70xJzU-xeRmP8UAigX5YGKiykuNw
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=dnax-matmiluxai-2026.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=dnax-matmiluxai-2026
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=dnax-matmiluxai-2026.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=193259852525
NEXT_PUBLIC_FIREBASE_APP_ID=1:193259852525:web:8fe3829ee4aa20cae5b2e4
```

## Troubleshooting

**Q: Function not triggering?**  
A: Check file is uploaded to exact path: `users/{userId}/raw/{filename}`

**Q: Permission denied?**  
A: Ensure user is authenticated and uploading to their own userId path

**Q: Build fails?**  
A: Run `npm --prefix functions install` and `npm --prefix functions run build`

**Q: Want to test locally?**  
A: Run `firebase emulators:start` and update Firebase config to use localhost

## Cost Monitoring

Current free tier limits:
- Functions: 2M invocations/month
- Storage: 5GB
- Firestore: 1GB, 50K reads/day

Monitor usage: https://console.firebase.google.com/project/dnax-matmiluxai-2026/usage
