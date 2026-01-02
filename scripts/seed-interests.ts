/**
 * Seed script to populate default interests/tags
 * Run with: npx ts-node scripts/seed-interests.ts
 * Or: npm run seed:interests (if added to package.json)
 */

import mongoose from "mongoose";
import Interest from "../models/Interest";

const MONGODB_URI = process.env.MONGODB_URI || "";

const defaultInterests = [
  // Lifestyle
  { name: "Movies", category: "lifestyle", icon: "🎬" },
  { name: "Dining", category: "lifestyle", icon: "🍽️" },
  { name: "Walking", category: "lifestyle", icon: "🚶" },
  { name: "Travel", category: "lifestyle", icon: "✈️" },
  { name: "Fitness", category: "lifestyle", icon: "💪" },
  { name: "Cooking", category: "lifestyle", icon: "👨‍🍳" },
  { name: "Reading", category: "lifestyle", icon: "📚" },
  { name: "Music", category: "lifestyle", icon: "🎵" },
  { name: "Art", category: "lifestyle", icon: "🎨" },
  { name: "Photography", category: "lifestyle", icon: "📷" },
  
  // Hobbies
  { name: "Gaming", category: "hobbies", icon: "🎮" },
  { name: "Sports", category: "hobbies", icon: "⚽" },
  { name: "Yoga", category: "hobbies", icon: "🧘" },
  { name: "Dancing", category: "hobbies", icon: "💃" },
  { name: "Singing", category: "hobbies", icon: "🎤" },
  { name: "Writing", category: "hobbies", icon: "✍️" },
  { name: "Gardening", category: "hobbies", icon: "🌱" },
  { name: "Fishing", category: "hobbies", icon: "🎣" },
  { name: "Hiking", category: "hobbies", icon: "🥾" },
  { name: "Cycling", category: "hobbies", icon: "🚴" },
  
  // Activities
  { name: "Beach", category: "activities", icon: "🏖️" },
  { name: "Camping", category: "activities", icon: "⛺" },
  { name: "Concerts", category: "activities", icon: "🎸" },
  { name: "Festivals", category: "activities", icon: "🎪" },
  { name: "Museums", category: "activities", icon: "🏛️" },
  { name: "Theater", category: "activities", icon: "🎭" },
  { name: "Nightlife", category: "activities", icon: "🍻" },
  { name: "Brunch", category: "activities", icon: "🥐" },
  { name: "Coffee", category: "activities", icon: "☕" },
  { name: "Wine", category: "activities", icon: "🍷" },
  
  // Preferences
  { name: "Dogs", category: "preferences", icon: "🐕" },
  { name: "Cats", category: "preferences", icon: "🐈" },
  { name: "Outdoors", category: "preferences", icon: "🌲" },
  { name: "Indoors", category: "preferences", icon: "🏠" },
  { name: "Adventure", category: "preferences", icon: "🗺️" },
  { name: "Relaxation", category: "preferences", icon: "😌" },
  { name: "Social", category: "preferences", icon: "👥" },
  { name: "Quiet", category: "preferences", icon: "🤫" },
];

async function seedInterests() {
  try {
    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI is not set in environment variables");
      console.log("Please set MONGODB_URI in your .env.local file or environment");
      process.exit(1);
    }

    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");

    console.log("Seeding interests...");
    let created = 0;
    let skipped = 0;

    for (const interest of defaultInterests) {
      try {
        await Interest.create({
          name: interest.name.toLowerCase(),
          category: interest.category,
          icon: interest.icon,
          isActive: true,
        });
        created++;
        console.log(`✓ Created: ${interest.name}`);
      } catch (error: any) {
        if (error.code === 11000) {
          skipped++;
          console.log(`⊘ Skipped (exists): ${interest.name}`);
        } else {
          console.error(`✗ Error creating ${interest.name}:`, error.message);
        }
      }
    }

    console.log(`\n✅ Seeding complete!`);
    console.log(`Created: ${created}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Total: ${defaultInterests.length}`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding interests:", error);
    process.exit(1);
  }
}

seedInterests();

