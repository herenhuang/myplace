# OAuth Authentication Fix Instructions

## Problem
- OAuth redirect to Google works ✅
- Users are created in database ✅  
- Session not established after callback ❌
- Authentication state remains false ❌

## Root Cause
Google OAuth redirect URIs don't match your development server URLs.

## Solution Steps

### 1. Go to Google Cloud Console
Visit: https://console.cloud.google.com/

### 2. Navigate to OAuth Settings
1. Select your project
2. Go to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID: `469317135977-pu49gf3jk3qvd05kbm8joahjs5hdo3od.apps.googleusercontent.com`
4. Click **Edit** on this OAuth client

### 3. Add ALL These Redirect URIs
In the **Authorized redirect URIs** section, add:

```
https://fast-impala-442.convex.cloud/api/auth/callback/google
http://localhost:3000/api/auth/callback/google
http://localhost:3001/api/auth/callback/google  
http://localhost:3002/api/auth/callback/google
http://localhost:3003/api/auth/callback/google
```

⚠️ **CRITICAL**: The Convex redirect URI must be EXACT: 
`https://fast-impala-442.convex.cloud/api/auth/callback/google`

### 4. Save Changes
Click **Save** in Google Cloud Console

### 5. Test Authentication
1. Go to http://localhost:3002
2. Click "Sign in with Google" 
3. Complete OAuth flow
4. Should return with authenticated state

## Why This Happens
- Next.js dev server uses different ports (3000, 3001, 3002...)
- Google OAuth validates redirect URIs exactly
- Convex handles the actual OAuth callback at `/api/auth/callback/google`
- If the URI doesn't match exactly, callback fails silently

## Verification
After fixing, you should see:
- `isAuthenticated: true` in AuthDebug component
- `user: { name, email, ... }` object populated
- "Welcome, [Your Name]" message displayed
