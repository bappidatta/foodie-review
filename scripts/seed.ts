import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../src/lib/db/schema";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set. Add it to .env.local first.");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const db = drizzle(sql, { schema });

// ── Dummy Users ────────────────────────────────────────
const dummyUsers = [
  { name: "Alice Chen", email: "alice@example.com", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=alice" },
  { name: "Bob Martinez", email: "bob@example.com", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=bob" },
  { name: "Chloe Park", email: "chloe@example.com", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=chloe" },
  { name: "David Kim", email: "david@example.com", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=david" },
  { name: "Emma Wilson", email: "emma@example.com", image: "https://api.dicebear.com/9.x/avataaars/svg?seed=emma" },
];

// ── Dummy Reviews ──────────────────────────────────────
const dummyReviews = [
  {
    restaurantName: "Sakura Ramen House",
    rating: 5,
    text: "Absolutely the best tonkotsu ramen I've had outside of Japan. The broth is rich and creamy, simmered for 18 hours. The chashu pork melts in your mouth. The ajitama egg was perfectly soft-boiled. I also tried their spicy miso — equally incredible. The portions are generous and the noodles have the perfect chew. Will definitely be coming back every week!",
    tags: ["ramen", "japanese", "noodles", "must-try"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80",
      "https://images.unsplash.com/photo-1557872943-16a5ac26437e?w=800&q=80",
    ],
  },
  {
    restaurantName: "The Burger Joint",
    rating: 4,
    text: "Solid smash burgers with a great crust. The special sauce is addictive — tangy and slightly sweet. Fries are crispy on the outside and fluffy inside. The milkshakes are thick and creamy. Only downside is the wait time during peak hours, but worth it. The brioche bun holds everything together perfectly without getting soggy.",
    tags: ["burgers", "american", "comfort-food"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80",
    ],
  },
  {
    restaurantName: "Mama Rosa's Pizzeria",
    rating: 5,
    text: "Authentic Neapolitan pizza with that perfect leopard-spotted crust. The Margherita is a masterpiece — San Marzano tomatoes, fresh mozzarella di bufala, and basil from their garden. Wood-fired at 900°F for 90 seconds. The Diavola with spicy salami is also fantastic. Great wine selection too. This place transports you straight to Naples.",
    tags: ["pizza", "italian", "wood-fired", "date-night"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80",
      "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=80",
    ],
  },
  {
    restaurantName: "Golden Wok",
    rating: 3,
    text: "Decent Chinese takeout spot. The kung pao chicken has good heat and plenty of peanuts. Fried rice is solid. However, the sweet and sour pork was a bit too heavy on the batter. Spring rolls were crispy though. Fast delivery and generous portions for the price. Good for a quick weeknight dinner when you don't feel like cooking.",
    tags: ["chinese", "takeout", "affordable"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1525755662778-989d0524087e?w=800&q=80",
    ],
  },
  {
    restaurantName: "Taco Loco",
    rating: 5,
    text: "These street-style tacos are the real deal! The al pastor is carved fresh off the trompo with bits of caramelized pineapple. The carnitas are slow-cooked for 6 hours until fall-apart tender. Their handmade corn tortillas make all the difference. The green salsa verde has the perfect kick. This tiny spot has better tacos than places three times the price.",
    tags: ["tacos", "mexican", "street-food", "hidden-gem"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800&q=80",
      "https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800&q=80",
    ],
  },
  {
    restaurantName: "Le Petit Café",
    rating: 4,
    text: "Charming French café with incredible pastries. The croissants are perfectly laminated — shatteringly flaky outside, soft and buttery inside. The pain au chocolat is dangerously good. Espresso is well-pulled. The croque monsieur for lunch is loaded with gruyère. Lovely outdoor seating area. A bit pricey but the quality justifies it.",
    tags: ["french", "cafe", "pastries", "brunch"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1555507036-ab1f4038024a?w=800&q=80",
    ],
  },
  {
    restaurantName: "Seoul Kitchen",
    rating: 4,
    text: "Fantastic Korean BBQ experience. The marinated bulgogi is tender and perfectly sweet-savory. The banchan spread is impressive — 8 different side dishes all freshly made. Kimchi jjigae is hearty and spicy. The soju cocktails are refreshing. Service is attentive and they help you grill if you're unsure. Great group dining spot.",
    tags: ["korean", "bbq", "group-dining"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1590301157890-4810ed352733?w=800&q=80",
      "https://images.unsplash.com/photo-1583224994076-0a31a8505669?w=800&q=80",
    ],
  },
  {
    restaurantName: "Pho 88",
    rating: 5,
    text: "The pho here is liquid gold. The beef broth is deeply aromatic with star anise and cinnamon, clearly simmered for hours. Generous portions of rare beef and brisket. The herbs and bean sprouts are always fresh. Their bánh mì is also excellent — crispy baguette with the perfect ratio of pâté, pickled veggies, and jalapeños. Ridiculously good value too.",
    tags: ["vietnamese", "pho", "soup", "best-value"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800&q=80",
    ],
  },
  {
    restaurantName: "Sweet Surrender Bakery",
    rating: 4,
    text: "A dessert lover's paradise. The tiramisu is cloud-like and not overly sweet. Red velvet cake is moist with the perfect cream cheese frosting. Their seasonal fruit tarts are beautiful and taste even better. The macarons rival Parisian ones. Only wish they had more seating. Pre-ordering is recommended for weekend specials.",
    tags: ["bakery", "desserts", "cakes", "sweets"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80",
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=800&q=80",
    ],
  },
  {
    restaurantName: "Curry Palace",
    rating: 4,
    text: "Rich, aromatic curries that warm your soul. The butter chicken is creamy and perfectly spiced — not too mild, not too hot. Garlic naan is pillowy and charred in all the right spots. The lamb biryani has beautifully fragrant basmati rice. Mango lassi is thick and refreshing. Generous portions. Great for sharing with family.",
    tags: ["indian", "curry", "spicy", "family-friendly"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?w=800&q=80",
    ],
  },
  {
    restaurantName: "Ocean's Catch",
    rating: 3,
    text: "Fresh seafood with a nice waterfront view. The grilled salmon was cooked well and the lemon butter sauce was delicious. Fish and chips were decent — beer batter was light and crispy. However, the lobster bisque was a bit thin for my taste. Great cocktail menu. The sunset view from the patio makes up for any shortcomings. Good for a casual dinner out.",
    tags: ["seafood", "waterfront", "casual-dining"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&q=80",
    ],
  },
  {
    restaurantName: "Green Bowl",
    rating: 5,
    text: "Best health-conscious restaurant in town. The acai bowls are stunning — topped with fresh dragon fruit, granola, and honey. Buddha bowls are filling and flavorful with the tahini dressing being the star. Fresh-pressed juices are excellent. Everything is organic and locally sourced. Even my meat-loving friends enjoy eating here. Proof that healthy food can be delicious!",
    tags: ["healthy", "vegan", "bowls", "organic"],
    mediaUrls: [
      "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=80",
      "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80",
    ],
  },
];

// ── Dummy Comments ─────────────────────────────────────
const commentTexts = [
  "Totally agree! This place is amazing!",
  "I need to try this. Adding to my list!",
  "Went there last week based on your review — not disappointed!",
  "The photos look incredible. How long was the wait?",
  "This is my go-to spot too! Try the dessert next time.",
  "Great review! Very detailed and helpful.",
  "I had a different experience, but glad you enjoyed it!",
  "Their lunch special is also worth checking out.",
  "Been going here for years. So happy more people are discovering it.",
  "Looks delicious! What would you recommend for a first-timer?",
];

async function seed() {
  console.log("🌱 Starting seed...\n");

  // 1. Insert users
  console.log("👤 Creating users...");
  const insertedUsers = [];
  for (const u of dummyUsers) {
    const [user] = await db
      .insert(schema.users)
      .values(u)
      .onConflictDoNothing()
      .returning();
    if (user) {
      insertedUsers.push(user);
      console.log(`   ✓ ${user.name}`);
    } else {
      // already exists, fetch it
      const [existing] = await db
        .select()
        .from(schema.users)
        .where(eq(schema.users.email, u.email))
        .limit(1);
      if (existing) insertedUsers.push(existing);
    }
  }

  // 2. Insert tags
  console.log("\n🏷️  Creating tags...");
  const allTagNames = [...new Set(dummyReviews.flatMap((r) => r.tags))];
  const tagMap = new Map<string, string>();
  for (const name of allTagNames) {
    const [tag] = await db
      .insert(schema.tags)
      .values({ name })
      .onConflictDoNothing()
      .returning();
    if (tag) {
      tagMap.set(name, tag.id);
    } else {
      const [existing] = await db
        .select()
        .from(schema.tags)
        .where(eq(schema.tags.name, name))
        .limit(1);
      if (existing) tagMap.set(name, existing.id);
    }
  }
  console.log(`   ✓ ${tagMap.size} tags created`);

  // 3. Insert reviews with media and tags
  console.log("\n📝 Creating reviews...");
  const insertedReviews = [];
  for (let i = 0; i < dummyReviews.length; i++) {
    const r = dummyReviews[i];
    const author = insertedUsers[i % insertedUsers.length];

    const [review] = await db
      .insert(schema.reviews)
      .values({
        authorId: author.id,
        restaurantName: r.restaurantName,
        rating: r.rating as 1 | 2 | 3 | 4 | 5,
        text: r.text,
      })
      .returning();

    insertedReviews.push(review);
    console.log(`   ✓ ${r.restaurantName} (${r.rating}★) by ${author.name}`);

    // Insert media
    if (r.mediaUrls.length > 0) {
      await db.insert(schema.media).values(
        r.mediaUrls.map((url, order) => ({
          reviewId: review.id,
          url,
          type: "image" as const,
          order,
        }))
      );
    }

    // Insert review-tag relations
    for (const tagName of r.tags) {
      const tagId = tagMap.get(tagName);
      if (tagId) {
        await db.insert(schema.reviewTags).values({
          reviewId: review.id,
          tagId,
        });
      }
    }
  }

  // 4. Insert likes (random pattern)
  console.log("\n❤️  Adding likes...");
  let likeCount = 0;
  for (const review of insertedReviews) {
    // Each review gets likes from random users
    const numLikes = Math.floor(Math.random() * insertedUsers.length) + 1;
    const shuffled = [...insertedUsers].sort(() => Math.random() - 0.5);
    for (let i = 0; i < numLikes; i++) {
      try {
        await db.insert(schema.likes).values({
          userId: shuffled[i].id,
          reviewId: review.id,
        });
        likeCount++;
      } catch {
        // skip duplicate
      }
    }
  }
  console.log(`   ✓ ${likeCount} likes added`);

  // 5. Insert comments
  console.log("\n💬 Adding comments...");
  let commentCount = 0;
  for (const review of insertedReviews) {
    const numComments = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numComments; i++) {
      const commenter = insertedUsers[(commentCount + i) % insertedUsers.length];
      const text = commentTexts[(commentCount + i) % commentTexts.length];
      await db.insert(schema.comments).values({
        reviewId: review.id,
        authorId: commenter.id,
        text,
      });
      commentCount++;
    }
  }
  console.log(`   ✓ ${commentCount} comments added`);

  console.log("\n✅ Seed complete! Your food review site is ready to go. 🎉");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
