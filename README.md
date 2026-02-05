# TikDNA

**Proprietary Software - All Rights Reserved**

TikDNA is a consumer genetics trait platform. Users upload raw DNA files (23andMe / AncestryDNA / MyHeritage), we normalize SNPs, and generate **educational, non-medical** trait reports. Raw DNA is never public and can be deleted any time.

> **Copyright © 2026 TikDNA. All Rights Reserved.**
> 
> This repository is publicly visible for transparency purposes only. The source code is proprietary and may not be copied, modified, distributed, or used for any purpose without explicit written permission from TikDNA.
> 
> See [LICENSE](LICENSE) for full terms.

> **Disclaimer:** This app is for education only and does not provide medical advice or diagnosis.

## Features
- Raw DNA upload with client-side parsing and normalization.
- 10+ trait reports with genotype, interpretation, limitations, and sources.
- Optional Firebase integration (Auth + Firestore + Storage).
- Mock mode: fully runs locally without Firebase.
- Privacy-first sharing: public summary only, no raw DNA or genotypes.
- Retention window for raw files (default 7 days).
- Optional client-side AES-GCM encryption for raw files.
- Static export note: in GitHub Pages mode, share links use `/share?id=...` so they work on a static host.

## Local run (mock mode)
1. Install deps:
   ```bash
   npm install
   ```
2. Run dev server:
   ```bash
   npm run dev
   ```
3. Open http://localhost:3000

Mock mode stores data in localStorage, no Firebase keys required.

## Firebase setup (optional)
1. Create a Firebase project and enable:
   - Authentication (Email/Password + Google)
   - Firestore
   - Storage
2. Copy `.env.example` to `.env.local` and fill values.
3. Deploy rules:
   ```bash
   firebase deploy --only firestore:rules,storage:rules
   ```
4. Run:
   ```bash
   npm run dev
   ```

### GitHub Pages build
Set `NEXT_PUBLIC_BASE_PATH=/dnax` in Actions secrets or `.env.production` locally. The workflow already injects it.

## Privacy & security notes
- Raw DNA is **never public**.
- Retention window deletes raw files after the configured number of days.
- Sharing is **disabled by default** and only exposes a short summary.
- Client-side encryption is optional and uses AES-GCM with a local key (see Settings).

## Env vars
See `.env.example` for all variables.

## Project structure
- `app/` ? Next.js routes
- `lib/` ? parsing, traits engine, adapters
- `components/` ? UI components
- `firestore.rules` / `storage.rules`
- `CREDITS.md` ? SNP/trait sources

## Disclaimer
TikDNA provides educational insights only. It does not diagnose conditions or predict disease risk. Always consult a qualified healthcare professional for medical guidance.

---

## License

**Proprietary Software - All Rights Reserved**

Copyright © 2026 TikDNA. This software is proprietary and confidential. Unauthorized copying, modification, distribution, or use is strictly prohibited. The source code is publicly visible for transparency only.

For licensing inquiries: matmiluxai@gmail.com
