# Frontend Environment Setup & Deployment

This guide covers setting up local and production environments, and automating deployments to Firebase Hosting.

## 🌍 Environment Configuration

Your app now uses environment-based configuration for different deployment scenarios:

### Environment Files

- **`.env.local`** - Local development (not committed to Git)
- **`.env.production`** - Production environment (template - real URL in GitHub Secrets)

### Environment Variables

```bash
EXPO_PUBLIC_API_BASE_URL=https://your-backend-url.com
EXPO_PUBLIC_ENVIRONMENT=production  # or 'development'
```

## 🔧 Local Development Setup

### 1. Configure Local Environment

The `.env.local` file is already configured for local development with your backend services running on localhost.

### 2. Start Backend Services

You have two options:

#### Option A: Using Docker Compose (Recommended for local dev)
```powershell
# Start all services at once
docker-compose up
```

#### Option B: Using Kubernetes Locally
```powershell
# Start port forwarding to access K8s services
cd k8s
.\start-port-forwards.ps1
```

### 3. Start Frontend

```powershell
cd Swappo-FE

# Install dependencies (first time only)
npm install

# Start Expo dev server
npm start

# Or directly start web version
npm run web
```

The app will run at `http://localhost:19006` and connect to your local backend services.

## 🚀 Production Setup (GKE + Firebase)

### Step 1: Get Your GKE Ingress URL

After deploying your backend to GKE, you need to get the external IP/URL:

```powershell
# Get the external IP of your ingress
kubectl get ingress swappo-ingress -n swappo

# Wait until you see an IP address in the ADDRESS column
# It might take 5-10 minutes for GKE to assign an IP
```

Your backend will be accessible at:
- **HTTP**: `http://<EXTERNAL_IP>`
- **HTTPS** (after SSL setup): `https://your-domain.com`

### Step 2: Update Production Environment

Update `.env.production` with your actual GKE ingress URL:

```bash
EXPO_PUBLIC_API_BASE_URL=http://<YOUR_GKE_EXTERNAL_IP>
EXPO_PUBLIC_ENVIRONMENT=production
```

Or with a domain (recommended):
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.swappo.app
EXPO_PUBLIC_ENVIRONMENT=production
```

### Step 3: Update Backend CORS

Update your backend services to allow requests from your Firebase domain.

In each service's `main.py` or `app/main.py`:

```python
from fastapi.middleware.cors import CORSMiddleware

# Get allowed origins from environment or use defaults
allowed_origins = [
    "http://localhost:19006",          # Local Expo dev
    "http://localhost:8081",           # Expo web dev
    "https://swappo-b1e68.web.app",    # Firebase Hosting
    "https://swappo-b1e68.firebaseapp.com",
    # Add your custom domain if you have one
    "https://swappo.app",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Then redeploy your backend services to GKE.

### Step 4: Manual Production Deploy

```powershell
cd Swappo-FE

# Build with production environment
npx expo export --platform web

# Deploy to Firebase
firebase deploy --only hosting
```

## 🤖 Automatic Deployment (CI/CD)

GitHub Actions will automatically deploy to Firebase when you push to the `main` branch.

### Setup GitHub Secrets

1. **Generate Firebase Service Account**

```powershell
# Create a service account for GitHub Actions
firebase init hosting:github
```

Follow the prompts - this will:
- Create a GitHub workflow file (we already have one)
- Set up Firebase service account credentials

OR manually create the secret:

```powershell
# Login to Firebase
firebase login

# Get the service account key
# Go to: https://console.firebase.google.com
# Project Settings → Service Accounts → Generate New Private Key
# Download the JSON file
```

2. **Add Secrets to GitHub**

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

- **`FIREBASE_SERVICE_ACCOUNT`**: Paste the entire JSON content from the service account file
- **`PRODUCTION_API_URL`**: Your GKE ingress URL (e.g., `http://<EXTERNAL_IP>` or `https://api.swappo.app`)

### How It Works

The workflow in `.github/workflows/deploy-frontend.yml`:

```yaml
on:
  push:
    branches:
      - main  # Only triggers on main branch
```

**What happens:**
1. You push code to `main` branch
2. GitHub Actions triggers automatically
3. Installs dependencies
4. Builds the web app with production environment
5. Deploys to Firebase Hosting
6. Your users see the updated app immediately

**Development branch:**
- Pushes to `development` (or any other branch) **do NOT trigger deployment**
- Use for testing before merging to main

### Manual Trigger

You can also trigger deployment manually from GitHub:

1. Go to your repository → Actions
2. Select "Deploy to Firebase Hosting"
3. Click "Run workflow"

## 📁 Project Structure

```
Swappo-FE/
├── .env.local              # Local dev (ignored by git)
├── .env.development        # Dev environment
├── .env.production         # Production template
├── config/
│   ├── env.config.ts       # Environment configuration
│   └── api.config.ts       # API endpoints
└── .github/
    └── workflows/
        └── deploy-frontend.yml  # CI/CD workflow
```

## 🔄 Development Workflow

### Daily Development

```powershell
# 1. Start backend (choose one)
docker-compose up          # OR
cd k8s; .\start-port-forwards.ps1

# 2. Start frontend
cd Swappo-FE
npm start

# 3. Make changes, test locally
# 4. Commit to development branch
git checkout development
git add .
git commit -m "Add feature"
git push origin development
```

### Deploy to Production

```powershell
# 1. Merge to main
git checkout main
git merge development
git push origin main

# 2. GitHub Actions deploys automatically
# 3. Check deployment status at:
#    https://github.com/YOUR_USERNAME/YOUR_REPO/actions
```

## 🌐 API Endpoint Patterns

Your backend services are behind a single ingress with path-based routing:

### Local Development
```
http://localhost:8000/auth/*
http://localhost:8000/catalog/*
http://localhost:8000/matchmaking/*
http://localhost:8000/chat/*
http://localhost:8000/notifications/*
```

### Production (GKE)
```
http://<EXTERNAL_IP>/auth/*
http://<EXTERNAL_IP>/catalog/*
http://<EXTERNAL_IP>/matchmaking/*
http://<EXTERNAL_IP>/chat/*
http://<EXTERNAL_IP>/notifications/*
```

The `config/api.config.ts` automatically handles this - it uses the base URL from environment variables and appends the correct paths.

## 🐛 Troubleshooting

### Local Development Issues

**Problem**: "Network request failed" when calling API

**Solution**:
1. Check if backend services are running:
   ```powershell
   docker ps  # Should show running containers
   ```
2. Verify the port forwarding (if using K8s):
   ```powershell
   netstat -an | findstr "8000"  # Should show LISTENING
   ```
3. Check browser console for the actual URL being called

### Production Issues

**Problem**: CORS errors in production

**Solution**: Update backend CORS settings to include your Firebase domain (see Step 3 above)

**Problem**: "Cannot connect to backend"

**Solution**:
1. Verify GKE ingress has external IP:
   ```powershell
   kubectl get ingress swappo-ingress -n swappo
   ```
2. Check if backend pods are running:
   ```powershell
   kubectl get pods -n swappo
   ```
3. Test backend directly:
   ```powershell
   curl http://<EXTERNAL_IP>/auth/health
   ```

**Problem**: Environment variables not working

**Solution**:
1. Environment variables must start with `EXPO_PUBLIC_`
2. Rebuild after changing env files:
   ```powershell
   npx expo export --clear --platform web
   ```

### CI/CD Issues

**Problem**: GitHub Actions deployment fails

**Solution**:
1. Check GitHub Actions logs
2. Verify secrets are set correctly in GitHub
3. Make sure Firebase service account has permissions:
   ```powershell
   firebase projects:list
   # Should show your project
   ```

**Problem**: Build succeeds but app shows old version

**Solution**: Hard refresh your browser (Ctrl+Shift+R) to bypass cache

## 🔒 SSL/HTTPS Setup (Recommended for Production)

### Option 1: Google Cloud Load Balancer with SSL

```powershell
# Reserve static IP
gcloud compute addresses create swappo-ip --global

# Create managed certificate
gcloud compute ssl-certificates create swappo-cert \
  --domains=api.swappo.app --global

# Update ingress to use the certificate
# (See GKE-DEPLOYMENT.md for full instructions)
```

### Option 2: Cloudflare (Easiest)

1. Add your domain to Cloudflare (free)
2. Point your domain to GKE external IP
3. Enable "Full" SSL mode in Cloudflare
4. Cloudflare provides free HTTPS automatically

Then update `.env.production`:
```bash
EXPO_PUBLIC_API_BASE_URL=https://api.swappo.app
```

## 📊 Monitoring

### Check Deployment Status

**Firebase Hosting**:
```powershell
firebase hosting:channel:list
```

**GKE Backend**:
```powershell
kubectl get pods -n swappo
kubectl logs -f deployment/auth-service -n swappo
```

### View Logs

**Frontend** (Firebase Hosting):
- No server-side logs (it's static hosting)
- Use browser console for client-side errors

**Backend** (GKE):
```powershell
# View logs for specific service
kubectl logs -f deployment/catalog-service -n swappo

# View all logs
kubectl logs -l app=swappo -n swappo --tail=100
```

## 🎯 Next Steps

1. ✅ Set up SSL certificates for HTTPS
2. ✅ Configure custom domain (e.g., swappo.app)
3. ✅ Set up staging environment (optional)
4. ✅ Add environment-specific feature flags
5. ✅ Set up monitoring and analytics
6. ✅ Build mobile apps with Expo EAS Build

## 📚 Resources

- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Firebase Hosting Docs](https://firebase.google.com/docs/hosting)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [GKE Ingress Guide](https://cloud.google.com/kubernetes-engine/docs/concepts/ingress)
