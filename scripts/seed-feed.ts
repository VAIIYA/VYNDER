import mongoose from 'mongoose';
import Creator from '../models/Creator';
import Post from '../models/Post';
import connectDB from '../lib/mongodb';

// No dotenv usage here; rely on process.env at runtime

async function seed() {
  try {
    await connectDB();
    // Ensure some creators exist
    const creators = [
      { name: 'Nova Studio', handle: '@novastudio', price: '$5', subscribers: 1200, avatar: '' },
      { name: 'Aura Creations', handle: '@aura', price: '$7', subscribers: 980, avatar: '' },
      { name: 'PixelMuse', handle: '@pixel', price: '$3', subscribers: 430, avatar: '' },
    ];

    for (const c of creators) {
      const exists = await Creator.findOne({ name: c.name });
      if (!exists) {
        await Creator.create({
          name: c.name,
          handle: c.handle,
          price: c.price,
          subscribers: c.subscribers,
          avatar: c.avatar
        });
      }
    }

    // Create posts if none exist
    const creatorDocs = await Creator.find();
    if (creatorDocs.length > 0) {
      const count = await Post.countDocuments();
      if (count === 0) {
        const posts = [
          {
            author: creatorDocs[0]._id,
            content: 'Welcome to Vynder — a social feed with creator content!',
            image: '',
          },
          {
            author: creatorDocs[1]._id,
            content: 'Exclusive behind-the-scenes drops coming soon.',
            image: '',
          },
        ];
        for (const p of posts) {
          await Post.create(p as any);
        }
      }
    }
    console.log('Seed complete');
  } catch (err) {
    console.error('Seed feed failed', err);
  } finally {
    await mongoose.connection.close();
  }
}

seed();
