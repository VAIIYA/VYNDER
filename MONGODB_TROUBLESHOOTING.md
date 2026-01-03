# MongoDB Connection Troubleshooting

## Connection String
Your MongoDB URI is set in Vercel:
```
mongodb+srv://Vercel-Admin-vynder-mongodb:6ywUthdW7YN6eniA@vynder-mongodb.6fnybvs.mongodb.net/?retryWrites=true&w=majority
```

## Common Issues & Solutions

### 1. Network Access Error
**Error**: `MongoServerError: connection timeout` or `ENOTFOUND`

**Solution**:
1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Add `0.0.0.0/0` to allow all IPs (or specific Vercel IP ranges)
4. Click "Confirm"
5. Wait 1-2 minutes for changes to propagate

### 2. Authentication Error
**Error**: `MongoServerError: authentication failed`

**Solution**:
1. Verify username and password in connection string
2. Check MongoDB Atlas → Database Access
3. Ensure user has read/write permissions
4. Verify user is active (not deleted)

### 3. Database Name
Your connection string doesn't specify a database name. MongoDB will:
- Use the default database, or
- Create one based on your connection

**Optional**: Add database name to connection string:
```
mongodb+srv://...@vynder-mongodb.6fnybvs.mongodb.net/vynder?retryWrites=true&w=majority
```

### 4. Connection Pool Exhausted
**Error**: Too many connections

**Solution**: 
- The code now limits to 10 connections (maxPoolSize: 10)
- Connections are cached and reused
- Old connections are automatically closed

### 5. Vercel Environment Variables
**Check**:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify `MONGODB_URI` is set for:
   - Production ✅
   - Preview (optional)
   - Development (optional)
3. Make sure there are no extra spaces or quotes
4. Redeploy after adding/changing variables

### 6. Connection String Format
**Verify**:
- Starts with `mongodb+srv://`
- Contains username:password
- Has cluster address
- Includes query parameters (`?retryWrites=true&w=majority`)

## Testing Connection

### Check Vercel Logs
1. Go to Vercel Dashboard → Your Project → Logs
2. Look for:
   - `✅ MongoDB connected successfully` (good)
   - `❌ MongoDB connection error` (bad)
3. Check error messages for specific issues

### Test Locally
```bash
# Set MONGODB_URI in .env.local
MONGODB_URI=your_connection_string

# Run the app
npm run dev

# Check console for connection messages
```

## Connection Options (Already Configured)

The code now includes:
- `maxPoolSize: 10` - Limits connections
- `serverSelectionTimeoutMS: 5000` - 5 second timeout
- `socketTimeoutMS: 45000` - 45 second socket timeout
- `family: 4` - Use IPv4 only
- Connection caching - Reuses existing connections

## Quick Fixes

### If connection fails:
1. **Check Network Access**: Add `0.0.0.0/0` in MongoDB Atlas
2. **Verify Credentials**: Check username/password in connection string
3. **Check Vercel Env Vars**: Ensure MONGODB_URI is set correctly
4. **Redeploy**: After changing env vars, redeploy the app
5. **Check Logs**: Look at Vercel function logs for specific errors

### If collections don't exist:
- This is normal on first run
- Collections are created automatically when first document is inserted
- The app now handles missing collections gracefully

## Still Having Issues?

1. Check MongoDB Atlas dashboard for connection attempts
2. Review Vercel function logs
3. Verify connection string format
4. Test connection string in MongoDB Compass or similar tool
5. Check MongoDB Atlas status page for outages

---

**Last Updated**: After adding improved connection handling

