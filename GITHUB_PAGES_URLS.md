# Accessing Your DNAx Site

## 🌐 Correct URLs

Your site is deployed with basePath `/dnax`, so all URLs need this prefix:

### ✅ Correct URLs:
- Homepage: `https://iliarudich0.github.io/dnax/`
- Dashboard: `https://iliarudich0.github.io/dnax/dashboard/`
- Cloud Processing: `https://iliarudich0.github.io/dnax/dashboard/cloud-processing/`
- Family Tree: `https://iliarudich0.github.io/dnax/dashboard/gedcom/tree/`
- Traits: `https://iliarudich0.github.io/dnax/dashboard/traits/`

### ❌ Wrong URLs (will show 404):
- `https://iliarudich0.github.io/dashboard/` ⛔
- `https://iliarudich0.github.io/dashboard/gedcom/tree/` ⛔

## 🔧 How to Fix

If you want to remove the `/dnax` prefix:

1. Edit `.env.local`:
```bash
NEXT_PUBLIC_BASE_PATH=
```

2. Rebuild and redeploy:
```bash
npm run build
git add -A
git commit -m "Remove basePath"
git push origin master
```

## 🚀 Current Setup

Your site is configured for GitHub Pages with repository name `/dnax`:
- Repository: `iliarudich0/dnax`
- Deployed URL: `https://iliarudich0.github.io/dnax/`

This is the standard GitHub Pages setup for project sites (not user sites).
