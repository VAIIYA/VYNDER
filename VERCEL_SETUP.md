# Vercel Deployment Checklist

## ✅ Already Configured
- MongoDB Atlas connection string is set up in Vercel
- GitHub repository is connected

## Required Environment Variables in Vercel

Go to your Vercel project → Settings → Environment Variables and add:

### 1. MONGODB_URI ✅
```
mongodb+srv://Vercel-Admin-vynder-mongodb:6ywUthdW7YN6eniA@vynder-mongodb.6fnybvs.mongodb.net/?retryWrites=true&w=majority
```
**Status**: Already configured ✅

### 2. NEXTAUTH_URL
```
https://your-app-name.vercel.app
```
Replace `your-app-name` with your actual Vercel project name.

**For local development**, use:
```
http://localhost:3000
```

### 3. NEXTAUTH_SECRET
Generate a secure secret:
```bash
openssl rand -base64 32
```
Copy the output and paste it as the value.

**Important**: Use the same secret for both production and preview environments, or generate separate ones.

## MongoDB Atlas Configuration

### Network Access
1. Go to MongoDB Atlas → Network Access
2. Add IP Address: `0.0.0.0/0` (allows all IPs)
   - Or add specific Vercel IP ranges for better security
3. Save

### Database Access
1. Go to MongoDB Atlas → Database Access
2. Ensure your user has read/write permissions
3. The user `Vercel-Admin-vynder-mongodb` should already be configured

### Database Name (Optional)
Your connection string doesn't specify a database name. MongoDB will use the default database or create one based on your connection. If you want to specify:

Add `&appName=vynder` or specify database in connection string:
```
mongodb+srv://...@vynder-mongodb.6fnybvs.mongodb.net/vynder?retryWrites=true&w=majority
```

## Deployment Steps

1. **Verify Environment Variables**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Ensure all three variables are set for:
     - Production
     - Preview (optional, but recommended)
     - Development (optional)

2. **Deploy**
   - Push to `main` branch (auto-deploys)
   - Or manually trigger deployment from Vercel dashboard

3. **Test Connection**
   - Visit your deployed app
   - Try to sign up
   - Check Vercel function logs for any MongoDB connection errors

## Troubleshooting

### MongoDB Connection Errors

**Error**: "MongoServerError: bad auth"
- Check username/password in connection string
- Verify database user permissions

**Error**: "MongoNetworkError: connection timeout"
- Check Network Access in MongoDB Atlas
- Ensure `0.0.0.0/0` is whitelisted (or Vercel IPs)

**Error**: "MongooseError: Operation timed out"
- Check if MongoDB cluster is running
- Verify connection string format

### NextAuth Errors

**Error**: "NEXTAUTH_SECRET is not set"
- Add `NEXTAUTH_SECRET` to Vercel environment variables
- Redeploy after adding

**Error**: "Invalid callback URL"
- Check `NEXTAUTH_URL` matches your actual Vercel URL
- Add callback URL in NextAuth configuration if needed

## Security Best Practices

1. **Rotate Secrets Regularly**
   - Change `NEXTAUTH_SECRET` periodically
   - Update MongoDB password if compromised

2. **Restrict Network Access**
   - Instead of `0.0.0.0/0`, use specific IP ranges
   - Vercel provides IP ranges you can whitelist

3. **Use Environment-Specific Secrets**
   - Different secrets for production/preview/development
   - Never commit secrets to git

4. **Monitor Access**
   - Check MongoDB Atlas logs regularly
   - Set up alerts for unusual activity

## Next Steps After Deployment

1. ✅ Test user registration
2. ✅ Test user login
3. ✅ Test profile creation
4. ✅ Test swiping functionality
5. ✅ Test matching
6. ✅ Test messaging
7. Add PWA icons (see `public/ICONS_README.md`)
8. Set up custom domain (optional)
9. Enable analytics (optional)
10. Set up error monitoring (Sentry, etc.)

## Quick Test Commands

After deployment, test these endpoints:

```bash
# Health check (should return 200)
curl https://your-app.vercel.app

# Test API (should return 401 - not authenticated, which is correct)
curl https://your-app.vercel.app/api/profile
```

## Support

If you encounter issues:
1. Check Vercel function logs
2. Check MongoDB Atlas logs
3. Verify all environment variables are set
4. Check network access settings
5. Review error messages in browser console

