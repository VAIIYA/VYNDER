# VYNDER Setup Guide

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Up Environment Variables**
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=your_mongodb_atlas_connection_string
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate_with_openssl_rand_base64_32
   ```

3. **Generate NextAuth Secret**
   ```bash
   openssl rand -base64 32
   ```
   Copy the output to `NEXTAUTH_SECRET` in `.env.local`

4. **Create PWA Icons**
   You need to create two icon files:
   - `public/icon-192x192.png` (192x192 pixels)
   - `public/icon-512x512.png` (512x512 pixels)
   
   You can use any image editor or online tool to create these. They should be square PNG images with your app logo.

5. **Run Development Server**
   ```bash
   npm run dev
   ```

## MongoDB Setup

1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster
3. Get your connection string
4. Add your connection string to `.env.local` as `MONGODB_URI`
5. The app will automatically create the necessary collections on first run

## Image Upload

Currently, the app expects image URLs for photos. To implement actual image upload:

1. Set up a cloud storage service (Cloudinary, AWS S3, etc.)
2. Create an API route at `/api/upload` to handle file uploads
3. Update the profile page to use the upload endpoint
4. Store the returned URLs in the user's photos array

Example Cloudinary setup:
```typescript
// app/api/upload/route.ts
import { v2 as cloudinary } from 'cloudinary';

export async function POST(request: Request) {
  const formData = await request.formData();
  const file = formData.get('file') as File;
  
  // Upload to Cloudinary
  // Return the URL
}
```

## Deployment to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
   - `NEXTAUTH_URL` (your Vercel URL)
   - `NEXTAUTH_SECRET`
4. Deploy!

## Testing the App

1. Sign up with a new account
2. Complete your profile (add photos, bio, etc.)
3. Create a second test account
4. Complete that profile too
5. Sign in with the first account
6. Swipe on the second account
7. Sign in with the second account
8. Swipe right on the first account to create a match
9. Start messaging!

## Notes

- The app uses polling for real-time updates (matches and messages)
- For production, consider implementing WebSockets for true real-time messaging
- Image upload is not implemented - you'll need to add that
- Rate limiting is structured but not fully implemented
- The app works best with at least 2 test accounts

