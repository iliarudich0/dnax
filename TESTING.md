# Testing DNAx DNA Processing

## Quick Test Steps

### 1. Access the Site
**Production:** https://iliarudich0.github.io/dnax/

⚠️ **Important:** Must include `/dnax` at the end! Otherwise you'll get a 404.

### 2. Test DNA Upload

1. Go to **Dashboard → Cloud Processing** page
2. Upload the `sample-dna.txt` file from the project root
3. Watch the status change:
   - 📤 **Uploading** (a few seconds)
   - ⚙️ **Processing** (1-2 minutes) 
   - ✅ **Completed** (shows results)

### 3. Expected Results

After processing completes, you should see:

#### ✅ Success Indicators:
- **Total SNPs:** ~15-20 (from sample file)
- **Ethnicity Estimate:** Graph showing percentages
- **Sample SNPs Table:** List of detected variants

#### ❌ Common Issues:

**Problem:** "0 SNPs found"
- **Cause:** Wrong file format  
- **Fix:** Use tab-delimited format: `rs1234 1 12345 AA`
- **Fix:** Try uploading `sample-dna.txt` or `sample-dna.csv`

**Problem:** "Processing" stuck for 3+ minutes
- **Cause:** Cloud Function timeout or error
- **Fix:** Check Firebase Console → Functions → Logs
- **Fix:** Check you have matching SNPs in the file (rs1426654, rs3827760, etc.)

**Problem:** 404 on family tree
- **Cause:** Wrong URL
- **Fix:** Use https://iliarudich0.github.io/dnax/dashboard/gedcom/tree

## Firebase Console Debugging

### Check Cloud Function Logs:
1. Go to https://console.firebase.google.com/
2. Select project: **dnax-matmiluxai-2026**
3. Functions → Logs
4. Look for `processDNAFile` executions
5. Check for errors or SNP count in logs

### Check Firestore Data:
1. Firestore Database → Data
2. Navigate to: `users/{your-user-id}/dna_results`
3. Check document fields:
   - `status`: should be "completed"
   - `totalSnps`: should be > 0
   - `ethnicity`: should have `ancestry` object
   - `error`: should be empty/null

## Local Testing

```powershell
# Build locally
npm install
npm run build

# View locally (won't work with basePath=/dnax)
# For local testing, temporarily remove basePath from next.config.mjs
npm run dev
# Access at http://localhost:3000
```

## Sample DNA File Format

**Tab-delimited (.txt):**
```
rs1426654	15	48426484	AA
rs3827760	2	109513601	GG
```

**CSV (.csv):**
```
RSID,CHROMOSOME,POSITION,RESULT
rs1426654,15,48426484,AA
rs3827760,2,109513601,GG
```

## Troubleshooting Checklist

- [ ] Using correct URL with `/dnax`
- [ ] GitHub Actions workflow completed successfully
- [ ] Firebase Cloud Functions deployed (`firebase deploy --only functions`)
- [ ] Sample file is tab-delimited or CSV format
- [ ] File has SNP IDs starting with "rs" (e.g., rs1426654)
- [ ] Browser console shows no JavaScript errors (F12 → Console)
- [ ] Firebase Console shows function execution logs

## Get Help

If still not working, provide:
1. **Exact error message** you're seeing
2. **Screenshot** of the issue
3. **Firebase Function logs** from console  
4. **Browser console errors** (F12 → Console tab)
5. **File format** you're uploading (first 5 lines)
