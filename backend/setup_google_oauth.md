# Google OAuth Setup Guide

## Error Details
The error "The OAuth client was not found" (Error 401: invalid_client) occurs because:
1. Google OAuth client credentials are not configured
2. The client ID doesn't exist or is invalid
3. Redirect URI is not properly configured

## Setup Instructions

### 1. Create Google OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable Google+ API and Google OAuth2 API
4. Go to "Credentials" page
5. Click "Create Credentials" > "OAuth client ID"
6. Select "Web application"
7. Configure authorized redirect URIs:
   - Development: `http://localhost:5000/api/auth/google/callback`
   - Production: `https://your-domain.com/api/auth/google/callback`

### 2. Update Environment Variables

Create/update your `.env` file with the Google OAuth credentials:

```bash
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your_actual_google_client_id_here
GOOGLE_CLIENT_SECRET=your_actual_google_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:5000/api/auth/google/callback
FRONTEND_URL=http://localhost:5173
```

### 3. Test the Configuration

1. Restart your Flask application
2. Try the Google login again
3. Check that the redirect URI matches exactly in Google Console

## Common Issues and Solutions

### Issue: "invalid_client" Error
**Cause**: Client ID is wrong or doesn't exist
**Solution**: 
- Verify client ID in Google Cloud Console
- Copy the exact client ID (no extra spaces)
- Ensure you're using the correct project

### Issue: "redirect_uri_mismatch" Error
**Cause**: Redirect URI doesn't match what's configured in Google Console
**Solution**:
- Check the exact redirect URI in your `.env` file
- Add the same URI to authorized redirect URIs in Google Console
- Ensure no trailing slashes or protocol differences

### Issue: "access_denied" Error
**Cause**: User denied access or OAuth consent screen not configured
**Solution**:
- Configure OAuth consent screen in Google Cloud Console
- Add required scopes (email, profile, openid)
- Test with a different Google account

## Production Deployment

For production, update these values:

```bash
GOOGLE_CLIENT_ID=production_client_id
GOOGLE_CLIENT_SECRET=production_client_secret
GOOGLE_REDIRECT_URI=https://your-domain.com/api/auth/google/callback
FRONTEND_URL=https://your-domain.com
```

## Security Notes

- Never commit `.env` file to version control
- Use environment-specific credentials
- Regularly rotate client secrets
- Monitor OAuth usage in Google Cloud Console
- Restrict API usage to your domain only
