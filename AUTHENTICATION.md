# Authentication Integration Guide

## 📋 Overview

This document explains the professional authentication integration structure for your React Native Expo app with your FastAPI authentication microservice.

## 🏗️ Project Structure

```
Swappo-FE/
├── config/
│   └── api.config.ts          # API endpoint configuration
├── context/
│   └── AuthContext.tsx        # Global auth state management
├── hooks/
│   └── useAuth.ts             # Custom auth hook
├── lib/
│   ├── api/
│   │   └── axios.client.ts    # Configured axios instance with interceptors
│   └── storage/
│       └── token.storage.ts   # Secure token storage
├── screens/
│   ├── LoginScreen.tsx        # Login UI
│   ├── RegisterScreen.tsx     # Registration UI
│   └── HomeScreen.tsx         # Authenticated home screen
├── services/
│   └── auth.service.ts        # Authentication API calls
├── types/
│   └── auth.types.ts          # TypeScript interfaces
└── App.tsx                     # Main app with navigation
```

## 🔑 Key Features

### 1. **Secure Token Storage**
- Uses `expo-secure-store` for encrypted token storage
- Tokens are never exposed in memory unnecessarily
- Automatic token persistence across app restarts

### 2. **Automatic Token Refresh**
- Axios interceptor handles 401 responses
- Automatically refreshes expired tokens
- Queues failed requests during token refresh
- Seamless user experience

### 3. **Type Safety**
- Full TypeScript integration
- Interfaces match your API schema exactly
- Type-safe API calls throughout

### 4. **Professional Architecture**
- Separation of concerns (API, Service, Context, UI)
- Reusable components and hooks
- Easy to test and maintain
- Follows React Native best practices

## 🚀 API Endpoints Integrated

Your authentication microservice endpoints:

- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/auth/me` - Get current user
- `POST /api/v1/auth/change-password` - Change password

## 📱 Running the App

1. **Start your backend server** (make sure it's running on `http://127.0.0.1:8000`)

2. **Start the Expo development server**:
   ```bash
   npm start
   ```

3. **Run on your platform**:
   ```bash
   npm run android  # For Android
   npm run ios      # For iOS
   npm run web      # For web
   ```

## 🔄 Authentication Flow

### Registration Flow:
1. User enters details on `RegisterScreen`
2. Form validation runs locally
3. API call to `/api/v1/auth/register`
4. Auto-login after successful registration
5. Tokens saved to secure storage
6. Navigate to `HomeScreen`

### Login Flow:
1. User enters credentials on `LoginScreen`
2. Form validation runs locally
3. API call to `/api/v1/auth/login`
4. Tokens received and saved securely
5. User info fetched from `/api/v1/auth/me`
6. Auth context updated
7. Navigate to `HomeScreen`

### Auto-Login Flow (App Restart):
1. App checks for existing tokens in secure storage
2. If tokens exist, attempts to fetch user info
3. If successful, user is authenticated automatically
4. If failed, tokens are cleared and user sees login screen

### Token Refresh Flow:
1. API call receives 401 response
2. Axios interceptor catches the error
3. Queues the failed request
4. Calls `/api/v1/auth/refresh` with refresh token
5. Saves new tokens
6. Retries all queued requests with new token
7. If refresh fails, clears tokens and returns to login

## 🎨 UI Components

### LoginScreen
- Email and password input
- Form validation
- Error display
- Loading states
- Navigation to register

### RegisterScreen
- Email, username, password, full name inputs
- Password confirmation
- Comprehensive validation
- Error handling
- Auto-login after registration

### HomeScreen
- Displays user information
- Logout functionality
- Protected by authentication

## 🛠️ How to Use in Your Code

### Accessing Auth State:
```tsx
import { useAuth } from './hooks/useAuth';

function MyComponent() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  
  // Use auth data
  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <LoginPrompt />;
  
  return <div>Welcome {user?.username}!</div>;
}
```

### Making Authenticated API Calls:
```tsx
import { apiClient } from './lib/api/axios.client';

// The token is automatically added to requests
async function fetchUserData() {
  const response = await apiClient.get('/api/v1/some-endpoint');
  return response.data;
}
```

## 🔧 Configuration

### Change API URL:
Edit `config/api.config.ts`:
```typescript
export const API_CONFIG = {
  BASE_URL: 'https://your-production-api.com', // Change this
  // ... rest of config
};
```

### Customize Token Storage Keys:
Edit `lib/storage/token.storage.ts` to change the storage keys if needed.

## 🐛 Troubleshooting

### "Network Error" or Connection Issues:
- Make sure your backend is running on `http://127.0.0.1:8000`
- For Android emulator, you may need to use `http://10.0.2.2:8000`
- For iOS simulator, use `http://localhost:8000`
- For physical devices, use your computer's IP address

### Update the API URL for Android Emulator:
```typescript
// config/api.config.ts
BASE_URL: Platform.OS === 'android' 
  ? 'http://10.0.2.2:8000'  // Android emulator
  : 'http://127.0.0.1:8000', // iOS simulator / web
```

### Tokens Not Persisting:
- Check that `expo-secure-store` is properly installed
- On web, secure storage may not work - consider using AsyncStorage as fallback

## 📚 Next Steps

### Recommended Enhancements:

1. **Add Forgot Password Flow**
   - Create new screen for password reset
   - Integrate with backend password reset endpoint

2. **Add Profile Screen**
   - Allow users to view/edit their profile
   - Use `authService.getCurrentUser()` to refresh data

3. **Add Change Password Screen**
   - Use existing `authService.changePassword()` method
   - Create UI for old/new password input

4. **Error Boundary**
   - Add error boundary component for better error handling
   - Catch and display network errors gracefully

5. **Biometric Authentication**
   - Use `expo-local-authentication` for fingerprint/face unlock
   - Store a flag after first login to enable biometrics

6. **Remember Me**
   - Add checkbox to login screen
   - Store preference and adjust token refresh logic

## 🎯 Best Practices Implemented

✅ Separation of concerns (layers: UI → Context → Service → API)
✅ Type-safe with TypeScript
✅ Secure token storage
✅ Automatic token refresh
✅ Form validation
✅ Error handling
✅ Loading states
✅ Request queuing during token refresh
✅ Clean navigation flow
✅ Reusable components and hooks

## 📞 Support

For questions about:
- **Frontend structure**: Review the code comments in each file
- **API integration**: Check `services/auth.service.ts`
- **Navigation**: See `App.tsx` for navigation setup
- **State management**: Review `context/AuthContext.tsx`

---

**Built with** ❤️ using React Native, Expo, TypeScript, and NativeWind
