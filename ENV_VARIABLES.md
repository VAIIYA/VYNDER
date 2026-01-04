# Environment Variables Reference

## Required Variables

### MONGODB_URI ✅
**Status**: Already configured in Vercel

Your MongoDB Atlas connection string:
```
mongodb+srv://Vercel-Admin-vynder-mongodb:6ywUthdW7YN6eniA@vynder-mongodb.6fnybvs.mongodb.net/?retryWrites=true&w=majority
```

**For local development**:
- Copy this from Vercel dashboard
- Add to `.env.local` file
- Make sure MongoDB Atlas allows your local IP

### NEXTAUTH_URL
**Required for**: Authentication callbacks

**Production**:
```
https://your-app-name.vercel.app
```

**Local Development**:
```
http://localhost:3000
```

**How to get**: Your Vercel project URL after deployment

### NEXTAUTH_SECRET
**Required for**: JWT token signing

**Generate**:
```bash
openssl rand -base64 32
```

**Example output**:
```
aBc123XyZ456DeF789GhI012JkL345MnO678PqR901StU234VwX567YzA890
```

**Important**: 
- Use the same secret for all environments OR
- Generate separate secrets for production/preview/development
- Never commit to git
- Keep it secure

## Optional Variables

### GOOGLE_CLIENT_ID
**Required for**: Google OAuth (currently structure only)

Get from: https://console.cloud.google.com/

### GOOGLE_CLIENT_SECRET
**Required for**: Google OAuth (currently structure only)

Get from: https://console.cloud.google.com/

## Environment File Setup

### Local Development (.env.local)
```env
MONGODB_URI=mongodb+srv://Vercel-Admin-vynder-mongodb:6ywUthdW7YN6eniA@vynder-mongodb.6fnybvs.mongodb.net/?retryWrites=true&w=majority
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_generated_secret_here
```

### Vercel Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add each variable for:
   - Production
   - Preview (optional)
   - Development (optional)

## Security Notes

⚠️ **Never commit these to git!**

- `.env.local` is in `.gitignore`
- Always use Vercel's environment variable system for production
- Rotate secrets periodically
- Use different secrets for different environments
- Restrict MongoDB network access to known IPs when possible

## Testing Your Setup

After setting up environment variables:

1. **Local**: Run `npm run dev` and check for connection errors
2. **Vercel**: Deploy and check function logs for errors
3. **MongoDB**: Check Atlas logs for connection attempts

## Troubleshooting

### "MONGODB_URI is not defined"
- Check `.env.local` exists (local) or Vercel env vars (production)
- Restart dev server after adding to `.env.local`
- Redeploy after adding to Vercel

### "NEXTAUTH_SECRET is not set"
- Generate secret with `openssl rand -base64 32`
- Add to environment variables
- Restart/redeploy

### Connection Timeout
- Check MongoDB Atlas Network Access
- Verify IP whitelist includes `0.0.0.0/0` or specific IPs
- Check connection string format





