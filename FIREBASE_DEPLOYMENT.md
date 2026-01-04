# Deploy Swappo Frontend to Firebase Hosting

This guide shows you how to deploy the web version of the Swappo mobile app to Firebase Hosting.

## What You're Deploying

Your React Native/Expo app has web support enabled, which means it can run in browsers as a Progressive Web App (PWA). Firebase Hosting is perfect for this because it's:
- **Free** (generous free tier)
- **Fast** (global CDN)
- **Secure** (automatic HTTPS)
- **Easy** to deploy

## Prerequisites

1. **Node.js and npm** installed
2. **Google Cloud account** (same one you use for GKE)
3. **Firebase CLI** installed

## Step 1: Install Firebase CLI

```powershell
npm install -g firebase-tools
```

## Step 2: Login to Firebase

```powershell
firebase login
```

This will open your browser to authenticate with Google.

## Step 3: Create/Select Firebase Project

### Option A: Use existing Google Cloud project
```powershell
# Navigate to frontend directory
cd Swappo-FE

# Initialize Firebase (select your existing GCP project)
firebase init hosting
```

When prompted:
- **Select "Use an existing project"** and choose your Google Cloud project
- **Public directory**: Enter `dist`
- **Configure as single-page app**: `Yes`
- **Set up automatic builds with GitHub**: `No` (for now)
- **Overwrite existing files**: `No`

### Option B: Create new Firebase project
If you want a separate project for the frontend:
```powershell
firebase projects:create swappo-frontend
```

Then update `.firebaserc` with your new project ID.

## Step 4: Configure Backend URLs

Update your API endpoint configuration to point to your GKE backend services.

Edit `Swappo-FE/config/api.ts` (or wherever your API URLs are) to use your GKE ingress URL:

```typescript
// Example - adjust based on your actual config location
export const API_BASE_URL = 'https://your-gke-ingress-url.com';

export const API_ENDPOINTS = {
  auth: `${API_BASE_URL}/auth`,
  catalog: `${API_BASE_URL}/catalog`,
  matchmaking: `${API_BASE_URL}/matchmaking`,
  chat: `${API_BASE_URL}/chat`,
  notifications: `${API_BASE_URL}/notifications`,
};
```

## Step 5: Build the Web App

```powershell
cd Swappo-FE

# Install dependencies (if not already done)
npm install

# Build for web
npx expo export --platform web
```

This creates optimized static files in the `dist` directory.

## Step 6: Deploy to Firebase

```powershell
# Deploy
firebase deploy --only hosting
```

You'll get a URL like: `https://your-project-id.web.app`

## Step 7: Custom Domain (Optional)

To use a custom domain like `swappo.app`:

1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Go to **Hosting** → **Add custom domain**
4. Follow the instructions to verify and connect your domain

## Update Backend CORS

Your backend services need to allow requests from your Firebase domain. Update your backend CORS settings:

```python
# In each service's main.py or app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:19006",  # Expo dev
        "https://your-project-id.web.app",  # Firebase
        "https://your-project-id.firebaseapp.com",  # Firebase alternative
        "https://your-custom-domain.com",  # If using custom domain
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## Continuous Deployment (Optional)

To auto-deploy when you push to GitHub:

```powershell
firebase init hosting:github
```

This sets up GitHub Actions to:
- Build your web app
- Deploy to Firebase automatically on every push

## Testing Your Deployment

1. **Open the URL** from the deploy output
2. **Test user registration/login** to ensure backend connectivity
3. **Check browser console** for any API errors
4. **Test on mobile browsers** (Chrome on Android, Safari on iOS)

## Common Issues

### Issue: "Failed to load resource: net::ERR_CERT_AUTHORITY_INVALID"
**Solution**: Your GKE backend doesn't have valid SSL. Either:
- Set up proper SSL certificates on GKE ingress
- Use HTTP for testing (not recommended for production)

### Issue: CORS errors
**Solution**: Update backend CORS settings (see "Update Backend CORS" above)

### Issue: 404 on page refresh
**Solution**: Already configured in `firebase.json` with the rewrite rule

### Issue: Build fails
**Solution**: 
```powershell
# Clear cache and rebuild
npx expo export --clear --platform web
```

## Cost

Firebase Hosting free tier includes:
- **10 GB** storage
- **360 MB/day** transfer
- **Unlimited** custom domains

This is more than enough for your app. You'll only pay if you exceed these limits (very unlikely).

## Quick Deploy Script

Create `deploy-web.ps1` for easy redeployment:

```powershell
#!/usr/bin/env pwsh
# Quick deploy script for Firebase

Write-Host "Building Expo web app..." -ForegroundColor Cyan
npx expo export --platform web

Write-Host "Deploying to Firebase..." -ForegroundColor Cyan
firebase deploy --only hosting

Write-Host "Deployment complete!" -ForegroundColor Green
firebase open hosting:site
```

Make it executable and run:
```powershell
.\deploy-web.ps1
```

## Next Steps

1. **Set up environment variables** for different environments (dev/prod)
2. **Enable Firebase Analytics** to track user behavior
3. **Set up Firebase Performance Monitoring**
4. **Configure Firebase Cloud Messaging** for push notifications (works on web too!)
5. **Build mobile apps** using Expo EAS Build when ready

## Mobile App Deployment (Future)

When ready to build actual mobile apps:

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Build for Android
eas build --platform android

# Build for iOS (requires Mac)
eas build --platform ios
```

## Resources

- Firebase Hosting docs: https://firebase.google.com/docs/hosting
- Expo Web docs: https://docs.expo.dev/workflow/web/
- Firebase Console: https://console.firebase.google.com
