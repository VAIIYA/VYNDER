# MongoDB Storage Architecture

This document describes how all data is stored in MongoDB for the VYNDER dating app.

## Database Collections

### 1. Users Collection

Stores all user profile data and authentication information.

**Schema Fields:**
```typescript
{
  // Authentication
  email: string (unique, indexed)
  password: string (hashed with bcrypt)
  
  // Basic Profile
  username: string (unique, 3-30 chars)
  bio: string (max 500 chars)
  age: number (18-100)
  gender: "male" | "female" | "non-binary" | "prefer-not-to-say"
  interestedIn: ["male", "female", "non-binary", "all"]
  
  // Location
  location: string (city-level)
  city: string
  country: string
  coordinates: {
    latitude: number (-90 to 90)
    longitude: number (-180 to 180)
  } (2dsphere indexed for geolocation queries)
  
  // Interests/Tags (Tinder-style)
  interests: [ObjectId] (references to Interest collection, indexed)
  
  // Enhanced Profile Fields
  jobTitle: string (max 100 chars)
  company: string (max 100 chars)
  school: string (max 100 chars)
  height: number (100-250 cm)
  education: "high-school" | "some-college" | "bachelors" | "masters" | "phd" | "prefer-not-to-say"
  drinking: "never" | "socially" | "often" | "prefer-not-to-say"
  smoking: "never" | "socially" | "often" | "prefer-not-to-say"
  exercise: "never" | "sometimes" | "often" | "daily"
  kids: "no" | "yes" | "want" | "have" | "prefer-not-to-say"
  pets: [string] (e.g., ["dog", "cat"])
  languages: [string] (e.g., ["English", "Spanish"])
  
  // Photos (Legacy - for backward compatibility)
  photos: [string] (URLs, max 6)
  
  // Profile Metadata
  profileCompleted: boolean
  profileCompletionPercentage: number (0-100, auto-calculated)
  lastActive: Date (indexed)
  isVerified: boolean
  
  // Safety
  blockedUsers: [ObjectId] (references to User)
  reportedUsers: [ObjectId] (references to User)
  
  // Timestamps
  createdAt: Date (indexed)
  updatedAt: Date
}
```

**Indexes:**
- `email: 1` (unique)
- `location: 1`
- `city: 1`
- `gender: 1, interestedIn: 1` (compound)
- `interests: 1` (for interest-based matching)
- `coordinates: "2dsphere"` (for geolocation queries)
- `lastActive: -1`
- `createdAt: -1`
- `profileCompleted: 1`

### 2. Images Collection

Stores user photos separately from the User model for better organization and management.

**Schema Fields:**
```typescript
{
  user: ObjectId (reference to User, indexed)
  url: string (required, image URL)
  publicId: string (optional, for cloud storage like Cloudinary/S3)
  order: number (0-5, display order, indexed with user)
  isPrimary: boolean (primary profile photo, indexed)
  uploadedAt: Date
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `user: 1, order: 1` (compound, for sorting)
- `user: 1, isPrimary: 1` (compound)
- `user: 1`

**Relationship:**
- Each user can have up to 6 images (order 0-5)
- One image can be marked as primary
- Images are stored separately but linked to User via `user` field

### 3. Interests Collection

Stores predefined interests/tags that users can select (like Tinder's interests).

**Schema Fields:**
```typescript
{
  name: string (unique, lowercase, indexed)
  category: "lifestyle" | "hobbies" | "activities" | "preferences" | "other"
  icon: string (emoji or icon identifier)
  isActive: boolean (indexed, for filtering)
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `name: 1` (unique)
- `category: 1`
- `isActive: 1`

**Default Interests:**
- Lifestyle: Movies, Dining, Walking, Travel, Fitness, Cooking, Reading, Music, Art, Photography
- Hobbies: Gaming, Sports, Yoga, Dancing, Singing, Writing, Gardening, Fishing, Hiking, Cycling
- Activities: Beach, Camping, Concerts, Festivals, Museums, Theater, Nightlife, Brunch, Coffee, Wine
- Preferences: Dogs, Cats, Outdoors, Indoors, Adventure, Relaxation, Social, Quiet

**Seeding:**
Run `npm run seed:interests` to populate default interests.

### 4. Likes Collection

Stores all "swipe right" actions (likes).

**Schema Fields:**
```typescript
{
  fromUser: ObjectId (reference to User, indexed)
  toUser: ObjectId (reference to User, indexed)
  createdAt: Date (indexed)
}
```

**Indexes:**
- `fromUser: 1, toUser: 1` (compound, unique - prevents duplicate likes)
- `toUser: 1, fromUser: 1` (compound, for reverse lookups)
- `createdAt: -1`

**Matching Logic:**
- When User A likes User B, create a Like document
- Check if User B has already liked User A
- If yes, create a Match (mutual like)

### 5. Passes Collection

Stores all "swipe left" actions (passes).

**Schema Fields:**
```typescript
{
  fromUser: ObjectId (reference to User, indexed)
  toUser: ObjectId (reference to User, indexed)
  createdAt: Date (indexed)
}
```

**Indexes:**
- `fromUser: 1, toUser: 1` (compound, unique - prevents duplicate passes)
- `createdAt: -1`

**Usage:**
- Users who have been passed on are excluded from future discovery
- Prevents showing the same user twice

### 6. Matches Collection

Stores mutual likes (matches).

**Schema Fields:**
```typescript
{
  users: [ObjectId, ObjectId] (exactly 2 User references, indexed, unique)
  lastMessage: ObjectId (reference to Message, optional)
  lastMessageAt: Date (indexed, for sorting)
  createdAt: Date
  updatedAt: Date
}
```

**Indexes:**
- `users: 1` (unique, ensures no duplicate matches)
- `lastMessageAt: -1` (for sorting matches by recent activity)

**Creation:**
- Created automatically when two users like each other
- Contains exactly 2 users (the matched pair)

### 7. Messages Collection

Stores chat messages between matched users.

**Schema Fields:**
```typescript
{
  match: ObjectId (reference to Match, indexed)
  sender: ObjectId (reference to User, indexed)
  text: string (max 1000 chars, trimmed)
  read: boolean (default: false, indexed)
  readAt: Date (optional)
  createdAt: Date (indexed with match, for sorting)
  updatedAt: Date
}
```

**Indexes:**
- `match: 1, createdAt: -1` (compound, for message history)
- `sender: 1`
- `read: 1`

**Relationship:**
- Messages belong to a Match
- Each message has a sender (one of the matched users)
- Read status tracked for unread message counts

## Data Relationships

```
User
├── interests → [Interest] (many-to-many)
├── images → [Image] (one-to-many)
├── likes → [Like] (one-to-many, as fromUser)
├── receivedLikes → [Like] (one-to-many, as toUser)
├── passes → [Pass] (one-to-many, as fromUser)
├── matches → [Match] (many-to-many, via users array)
├── messages → [Message] (one-to-many, as sender)
└── blockedUsers → [User] (many-to-many)

Match
├── users → [User, User] (exactly 2)
├── lastMessage → Message (one-to-one, optional)
└── messages → [Message] (one-to-many)

Message
├── match → Match (many-to-one)
└── sender → User (many-to-one)
```

## Storage Strategy

### Images
- **Current**: URLs stored in User.photos array (legacy)
- **New**: Separate Image collection with full metadata
- **Future**: Can migrate to cloud storage (Cloudinary, S3) with publicId field
- **Benefits**: Better organization, easier management, supports ordering and primary photo

### Interests
- **Storage**: Separate Interest collection with predefined options
- **User Selection**: Stored as ObjectId references in User.interests array
- **Benefits**: Consistent tagging, easy filtering, can add new interests without user updates

### Profile Data
- **All in User collection**: Single document per user
- **Benefits**: Fast reads, atomic updates, simple queries
- **Considerations**: Document size limit (16MB) - not an issue for user profiles

### Likes/Passes
- **Separate collections**: Better for analytics and queries
- **Benefits**: Can query "who liked me", prevent duplicate actions, track swipe patterns

### Messages
- **Separate collection**: Better for scaling
- **Benefits**: Can paginate messages, easier to query by match, supports future features (media, reactions)

## Query Patterns

### Discovery (Swipe Feed)
1. Get current user's likes and passes (exclude those users)
2. Get users interested in current user's gender
3. Filter by current user's interestedIn preferences
4. Filter by interests (optional - interest-based matching)
5. Filter by location/distance (optional - geolocation)
6. Exclude blocked users
7. Return one random user with full profile + images + interests

### Matching
1. When User A likes User B:
   - Create Like document (A → B)
   - Check if Like exists (B → A)
   - If yes, create Match document

### Messaging
1. Get all matches for current user
2. For each match, get last message and unread count
3. Sort by lastMessageAt or createdAt
4. When viewing a match, get all messages sorted by createdAt
5. Mark messages as read when viewed

## Performance Optimizations

1. **Indexes**: All foreign keys and frequently queried fields are indexed
2. **Compound Indexes**: For complex queries (user + order, match + createdAt)
3. **Geospatial Index**: 2dsphere index on coordinates for location-based queries
4. **Selective Fields**: Use `.select()` to fetch only needed fields
5. **Population**: Use `.populate()` for references instead of multiple queries
6. **Lean Queries**: Use `.lean()` for read-only operations (faster)

## Data Migration

### From Legacy to New Structure

1. **Photos**: Migrate User.photos array to Image collection
2. **Interests**: Users can select from Interest collection
3. **Enhanced Fields**: Add new profile fields gradually

### Seeding

1. **Interests**: Run `npm run seed:interests` to populate default interests
2. **Test Users**: Create test users via registration API
3. **Sample Data**: Can create seed script for test data if needed

## Security Considerations

1. **Passwords**: Always hashed with bcrypt (never stored plaintext)
2. **Sensitive Data**: Coordinates stored but only approximate distance shown
3. **Blocked Users**: Excluded from all queries
4. **Reported Users**: Tracked for moderation
5. **Input Validation**: All inputs validated with Zod schemas
6. **No SQL Injection**: Mongoose handles parameterization

## Scalability

1. **Sharding**: Can shard by user ID or location
2. **Read Replicas**: Use for read-heavy operations (discovery, matches)
3. **Caching**: Cache interests, user profiles (Redis)
4. **Pagination**: Implement for matches and messages lists
5. **Archiving**: Archive old messages after N days

## Backup Strategy

1. **Automated Backups**: MongoDB Atlas provides automated backups
2. **Point-in-Time Recovery**: Available in MongoDB Atlas
3. **Export**: Can export collections for manual backups
4. **Replication**: Replica sets for high availability

---

**Last Updated**: Initial implementation
**Version**: 1.0.0






