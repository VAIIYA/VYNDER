# VYNDER - Tinder-style Dating PWA

A full-featured Tinder-style dating application built as a Progressive Web App (PWA) using Next.js, MongoDB, and TypeScript.

## Features

- ✅ Email/password authentication with NextAuth
- ✅ User profile creation and editing
- ✅ Tinder-style swipe system with smooth animations
- ✅ Matching logic (mutual likes create matches)
- ✅ Real-time messaging between matched users
- ✅ PWA support (installable on iOS/Android)
- ✅ Dark mode support
- ✅ Mobile-first responsive design
- ✅ Security features (input validation, rate limiting structure, report/block)

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: MongoDB Atlas (Mongoose)
- **Authentication**: NextAuth.js
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Custom components with Heroicons
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- ✅ MongoDB Atlas already configured in Vercel
- Vercel account (for deployment)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/VAIIYA/VYNDER.git
cd VYNDER
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables for local development:
```bash
# Create .env.local file
touch .env.local
```

Edit `.env.local` and add:
- `MONGODB_URI`: Copy from Vercel dashboard (already configured ✅)
- `NEXTAUTH_SECRET`: Generate with `openssl rand -base64 32`
- `NEXTAUTH_URL`: `http://localhost:3000` for local dev

See `ENV_VARIABLES.md` for detailed instructions.

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Vercel Deployment

✅ **MongoDB is already configured in Vercel!**

See `VERCEL_SETUP.md` for complete deployment instructions. You just need to add:
- `NEXTAUTH_URL` (your Vercel URL)
- `NEXTAUTH_SECRET` (generate a secret)

## Project Structure

```
VYNDER/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   ├── auth/             # Authentication pages
│   ├── swipe/            # Swipe/discover page
│   ├── matches/          # Matches list page
│   ├── chat/             # Chat pages
│   └── profile/          # Profile page
├── components/            # React components
├── lib/                   # Utility functions
├── models/                # MongoDB Mongoose models
├── public/                # Static assets
└── types/                 # TypeScript type definitions
```

## Database Schemas

- **User**: User profiles, authentication, preferences
- **Like**: User likes (swipe right)
- **Pass**: User passes (swipe left)
- **Match**: Mutual likes (matches)
- **Message**: Chat messages between matched users

## API Routes

- `POST /api/auth/register` - User registration
- `GET/POST /api/auth/[...nextauth]` - NextAuth endpoints
- `GET/PUT /api/profile` - Get/update user profile
- `GET /api/swipe/discover` - Get next user to swipe
- `POST /api/swipe/like` - Like a user
- `POST /api/swipe/pass` - Pass on a user
- `GET /api/matches` - Get user's matches
- `GET/POST /api/messages/[matchId]` - Get/send messages
- `POST /api/users/report` - Report a user
- `POST /api/users/block` - Block a user

## PWA Features

- Installable on iOS and Android via browser
- Offline shell support
- App manifest configured
- Service worker for caching
- Mobile-optimized UI

## Deployment

### Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

The app is configured for Vercel deployment out of the box.

## Security Features

- Input validation with Zod
- Password hashing with bcrypt
- JWT-based sessions
- Rate limiting structure (can be enhanced)
- User blocking and reporting
- Self-matching prevention

## Future Enhancements

- Image upload to cloud storage (Cloudinary/S3)
- Real WebSocket support for real-time messaging
- Push notifications
- Advanced matching algorithm
- Video profiles
- Super likes
- Boost features
- Advanced filters

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.


