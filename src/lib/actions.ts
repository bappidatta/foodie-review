"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { reviews, media, tags, reviewTags, users, likes, comments } from "@/lib/db/schema";
import { eq, desc, sql, count, ilike, and, or, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ── Create Review ──────────────────────────────────────
export async function createReview(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const text = formData.get("text") as string;
  const restaurantName = (formData.get("restaurantName") as string) ?? "";
  const location = (formData.get("location") as string) ?? "";
  const rating = Math.min(5, Math.max(1, parseInt(formData.get("rating") as string) || 5));
  const tagNames = (formData.get("tags") as string)
    .split(",")
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);
  const mediaItems = JSON.parse(
    (formData.get("media") as string) || "[]"
  ) as { url: string; type: "image" | "video" }[];

  if (!text?.trim()) throw new Error("Review text is required");
  if (text.length > 1000) throw new Error("Review text max 1000 characters");

  const [review] = await db
    .insert(reviews)
    .values({
      authorId: session.user.id,
      text: text.trim(),
      restaurantName: restaurantName.trim(),
      location: location.trim(),
      rating,
    })
    .returning();

  if (mediaItems.length > 0) {
    await db.insert(media).values(
      mediaItems.map((m, i) => ({
        reviewId: review.id,
        url: m.url,
        type: m.type as "image" | "video",
        order: i,
      }))
    );
  }

  if (tagNames.length > 0) {
    for (const name of tagNames) {
      const [tag] = await db
        .insert(tags)
        .values({ name })
        .onConflictDoNothing()
        .returning();
      const tagId =
        tag?.id ??
        (await db.select().from(tags).where(eq(tags.name, name)).limit(1))[0]?.id;
      if (tagId) {
        await db.insert(reviewTags).values({ reviewId: review.id, tagId });
      }
    }
  }

  revalidatePath("/");
  redirect(`/review/${review.id}`);
}

// ── Delete Review ──────────────────────────────────────
export async function deleteReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!review || review.authorId !== session.user.id) {
    throw new Error("Not allowed");
  }

  await db.delete(reviews).where(eq(reviews.id, reviewId));
  revalidatePath("/");
  redirect("/");
}

// ── Update Review ──────────────────────────────────────
export async function updateReview(
  reviewId: string,
  data: { text: string; tags: string[]; restaurantName?: string; location?: string; rating?: number }
) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, reviewId))
    .limit(1);

  if (!review || review.authorId !== session.user.id) {
    throw new Error("Not allowed");
  }

  if (!data.text?.trim()) throw new Error("Review text is required");
  if (data.text.length > 1000) throw new Error("Review text max 1000 characters");

  const updateData: Record<string, unknown> = { text: data.text.trim(), updatedAt: new Date() };
  if (data.restaurantName !== undefined) updateData.restaurantName = data.restaurantName.trim();
  if (data.location !== undefined) updateData.location = data.location.trim();
  if (data.rating !== undefined) updateData.rating = Math.min(5, Math.max(1, data.rating));

  await db
    .update(reviews)
    .set(updateData)
    .where(eq(reviews.id, reviewId));

  await db.delete(reviewTags).where(eq(reviewTags.reviewId, reviewId));

  for (const name of data.tags) {
    const tagName = name.trim().toLowerCase();
    if (!tagName) continue;
    const [tag] = await db
      .insert(tags)
      .values({ name: tagName })
      .onConflictDoNothing()
      .returning();
    const tagId =
      tag?.id ??
      (await db.select().from(tags).where(eq(tags.name, tagName)).limit(1))[0]?.id;
    if (tagId) {
      await db.insert(reviewTags).values({ reviewId, tagId });
    }
  }

  revalidatePath(`/review/${reviewId}`);
  revalidatePath("/");
}

// ── Get Feed ───────────────────────────────────────────
export async function getFeed(
  page = 1,
  limit = 12,
  sort: "newest" | "popular" | "top-rated" = "newest"
) {
  const offset = (page - 1) * limit;

  const feedReviews =
    sort === "popular"
      ? await db
          .select()
          .from(reviews)
          .orderBy(
            desc(
              sql`(SELECT COUNT(*) FROM ${likes} WHERE ${likes.reviewId} = ${reviews.id})`
            ),
            desc(reviews.createdAt)
          )
          .limit(limit)
          .offset(offset)
      : sort === "top-rated"
        ? await db
            .select()
            .from(reviews)
            .orderBy(desc(reviews.rating), desc(reviews.createdAt))
            .limit(limit)
            .offset(offset)
        : await db
            .select()
            .from(reviews)
            .orderBy(desc(reviews.createdAt))
            .limit(limit)
            .offset(offset);

  const results = await Promise.all(
    feedReviews.map(async (review) => {
      const [author] = await db
        .select()
        .from(users)
        .where(eq(users.id, review.authorId))
        .limit(1);

      const reviewMedia = await db
        .select()
        .from(media)
        .where(eq(media.reviewId, review.id))
        .orderBy(media.order);

      const reviewTagRows = await db
        .select({ name: tags.name })
        .from(reviewTags)
        .innerJoin(tags, eq(reviewTags.tagId, tags.id))
        .where(eq(reviewTags.reviewId, review.id));

      const [{ likeCount }] = await db
        .select({ likeCount: count() })
        .from(likes)
        .where(eq(likes.reviewId, review.id));

      return {
        ...review,
        author,
        media: reviewMedia,
        tags: reviewTagRows.map((t) => t.name),
        likeCount: Number(likeCount),
      };
    })
  );

  const [{ total }] = await db
    .select({ total: sql<number>`count(*)` })
    .from(reviews);

  return { reviews: results, total: Number(total), page, limit };
}

// ── Get Single Review ──────────────────────────────────
export async function getReview(id: string) {
  const [review] = await db
    .select()
    .from(reviews)
    .where(eq(reviews.id, id))
    .limit(1);

  if (!review) return null;

  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.id, review.authorId))
    .limit(1);

  const reviewMedia = await db
    .select()
    .from(media)
    .where(eq(media.reviewId, review.id))
    .orderBy(media.order);

  const reviewTagRows = await db
    .select({ name: tags.name })
    .from(reviewTags)
    .innerJoin(tags, eq(reviewTags.tagId, tags.id))
    .where(eq(reviewTags.reviewId, review.id));

  return {
    ...review,
    author,
    media: reviewMedia,
    tags: reviewTagRows.map((t) => t.name),
  };
}

// ── Get Reviews by Tag ─────────────────────────────────
export async function getReviewsByTag(tagName: string, page = 1, limit = 12) {
  const offset = (page - 1) * limit;

  const [tag] = await db
    .select()
    .from(tags)
    .where(eq(tags.name, tagName.toLowerCase()))
    .limit(1);

  if (!tag) return { reviews: [], total: 0, page, limit };

  const taggedReviewIds = await db
    .select({ reviewId: reviewTags.reviewId })
    .from(reviewTags)
    .where(eq(reviewTags.tagId, tag.id));

  const ids = taggedReviewIds.map((r) => r.reviewId);
  if (ids.length === 0) return { reviews: [], total: 0, page, limit };

  const feedReviews = await db
    .select()
    .from(reviews)
    .where(sql`${reviews.id} = ANY(${ids})`)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  const results = await Promise.all(
    feedReviews.map(async (review) => {
      const [author] = await db
        .select()
        .from(users)
        .where(eq(users.id, review.authorId))
        .limit(1);

      const reviewMedia = await db
        .select()
        .from(media)
        .where(eq(media.reviewId, review.id))
        .orderBy(media.order);

      const reviewTagRows = await db
        .select({ name: tags.name })
        .from(reviewTags)
        .innerJoin(tags, eq(reviewTags.tagId, tags.id))
        .where(eq(reviewTags.reviewId, review.id));

      const [{ likeCount }] = await db
        .select({ likeCount: count() })
        .from(likes)
        .where(eq(likes.reviewId, review.id));

      return {
        ...review,
        author,
        media: reviewMedia,
        tags: reviewTagRows.map((t) => t.name),
        likeCount: Number(likeCount),
      };
    })
  );

  return { reviews: results, total: ids.length, page, limit };
}

// ── Get User Profile ───────────────────────────────────
export async function getUserProfile(userId: string) {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!user) return null;

  const userReviews = await db
    .select()
    .from(reviews)
    .where(eq(reviews.authorId, userId))
    .orderBy(desc(reviews.createdAt));

  const results = await Promise.all(
    userReviews.map(async (review) => {
      const reviewMedia = await db
        .select()
        .from(media)
        .where(eq(media.reviewId, review.id))
        .orderBy(media.order);

      const reviewTagRows = await db
        .select({ name: tags.name })
        .from(reviewTags)
        .innerJoin(tags, eq(reviewTags.tagId, tags.id))
        .where(eq(reviewTags.reviewId, review.id));

      const [{ likeCount }] = await db
        .select({ likeCount: count() })
        .from(likes)
        .where(eq(likes.reviewId, review.id));

      return {
        ...review,
        author: user,
        media: reviewMedia,
        tags: reviewTagRows.map((t) => t.name),
        likeCount: Number(likeCount),
      };
    })
  );

  return { user, reviews: results };
}

// ── Restaurant Suggestions ───────────────────────────────
export async function getRestaurantSuggestions(limit = 24) {
  const recentReviews = await db
    .select({
      restaurantName: reviews.restaurantName,
      location: reviews.location,
      createdAt: reviews.createdAt,
    })
    .from(reviews)
    .orderBy(desc(reviews.createdAt))
    .limit(limit * 4);

  const seen = new Set<string>();

  return recentReviews
    .filter((review) => review.restaurantName.trim())
    .filter((review) => {
      const key = `${review.restaurantName.trim().toLowerCase()}::${review.location.trim().toLowerCase()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, limit)
    .map((review) => ({
      restaurantName: review.restaurantName,
      location: review.location,
    }));
}

// ── Search Reviews ─────────────────────────────────────
export async function searchReviews(query: string, page = 1, limit = 12, location = "") {
  const offset = (page - 1) * limit;
  const trimmedQuery = query.trim();
  const trimmedLocation = location.trim();
  const q = `%${trimmedQuery}%`;
  const locationQuery = `%${trimmedLocation}%`;

  if (!trimmedQuery && !trimmedLocation) {
    return { reviews: [], total: 0, page, limit };
  }

  const tagMatches = trimmedQuery
    ? await db
        .select({ reviewId: reviewTags.reviewId })
        .from(reviewTags)
        .innerJoin(tags, eq(reviewTags.tagId, tags.id))
        .where(ilike(tags.name, q))
    : [];

  const tagReviewIds = tagMatches.map((r) => r.reviewId);

  const reviewerMatches = trimmedQuery
    ? await db
        .select({ userId: users.id })
        .from(users)
        .where(ilike(users.name, q))
    : [];

  const reviewerIds = reviewerMatches.map((r) => r.userId);

  const searchConditions = trimmedQuery
    ? [
        ilike(reviews.text, q),
        ilike(reviews.restaurantName, q),
        ilike(reviews.location, q),
      ]
    : [];

  if (tagReviewIds.length > 0) {
    searchConditions.push(inArray(reviews.id, tagReviewIds));
  }

  if (reviewerIds.length > 0) {
    searchConditions.push(inArray(reviews.authorId, reviewerIds));
  }

  const textMatch = searchConditions.length > 0 ? or(...searchConditions) : undefined;
  const locationMatch = trimmedLocation ? ilike(reviews.location, locationQuery) : undefined;
  const searchCondition =
    textMatch && locationMatch
      ? and(textMatch, locationMatch)
      : (textMatch ?? locationMatch);

  const feedReviews = await db
    .select()
    .from(reviews)
    .where(searchCondition)
    .orderBy(desc(reviews.createdAt))
    .limit(limit)
    .offset(offset);

  const countResult = await db
    .select({ c: sql<number>`count(*)` })
    .from(reviews)
    .where(searchCondition);

  const total = Number(countResult[0]?.c ?? 0);

  const results = await Promise.all(
    feedReviews.map(async (review) => {
      const [author] = await db
        .select()
        .from(users)
        .where(eq(users.id, review.authorId))
        .limit(1);

      const reviewMedia = await db
        .select()
        .from(media)
        .where(eq(media.reviewId, review.id))
        .orderBy(media.order);

      const reviewTagRows = await db
        .select({ name: tags.name })
        .from(reviewTags)
        .innerJoin(tags, eq(reviewTags.tagId, tags.id))
        .where(eq(reviewTags.reviewId, review.id));

      const [{ likeCount }] = await db
        .select({ likeCount: count() })
        .from(likes)
        .where(eq(likes.reviewId, review.id));

      return {
        ...review,
        author,
        media: reviewMedia,
        tags: reviewTagRows.map((t) => t.name),
        likeCount: Number(likeCount),
      };
    })
  );

  return { reviews: results, total, page, limit };
}

// ── Like / Unlike Review ───────────────────────────────
export async function likeReview(reviewId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const userId = session.user.id;

  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)))
    .limit(1);

  if (existing) {
    await db
      .delete(likes)
      .where(and(eq(likes.userId, userId), eq(likes.reviewId, reviewId)));
  } else {
    await db.insert(likes).values({ userId, reviewId });
  }

  const [{ likeCount }] = await db
    .select({ likeCount: count() })
    .from(likes)
    .where(eq(likes.reviewId, reviewId));

  revalidatePath(`/review/${reviewId}`);
  revalidatePath("/");

  return { liked: !existing, count: Number(likeCount) };
}

// ── Get Like Status ────────────────────────────────────
export async function getLikeStatus(reviewId: string) {
  const session = await auth();

  const [{ likeCount }] = await db
    .select({ likeCount: count() })
    .from(likes)
    .where(eq(likes.reviewId, reviewId));

  if (!session?.user?.id) {
    return { liked: false, count: Number(likeCount) };
  }

  const [existing] = await db
    .select()
    .from(likes)
    .where(and(eq(likes.userId, session.user.id), eq(likes.reviewId, reviewId)))
    .limit(1);

  return { liked: !!existing, count: Number(likeCount) };
}

// ── Create Comment ─────────────────────────────────────
export async function createComment(reviewId: string, text: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  if (!text?.trim()) throw new Error("Comment text is required");
  if (text.length > 500) throw new Error("Comment text max 500 characters");

  const [comment] = await db
    .insert(comments)
    .values({ reviewId, authorId: session.user.id, text: text.trim() })
    .returning();

  const [author] = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  revalidatePath(`/review/${reviewId}`);

  return {
    id: comment.id,
    text: comment.text,
    createdAt: comment.createdAt,
    author: {
      id: author.id,
      name: author.name,
      image: author.image,
    },
  };
}

// ── Delete Comment ─────────────────────────────────────
export async function deleteComment(commentId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  const [comment] = await db
    .select()
    .from(comments)
    .where(eq(comments.id, commentId))
    .limit(1);

  if (!comment || comment.authorId !== session.user.id) {
    throw new Error("Not allowed");
  }

  await db.delete(comments).where(eq(comments.id, commentId));
  revalidatePath(`/review/${comment.reviewId}`);
}

// ── Get Comments ───────────────────────────────────────
export async function getComments(reviewId: string) {
  const rows = await db
    .select({
      id: comments.id,
      text: comments.text,
      createdAt: comments.createdAt,
      authorId: comments.authorId,
      authorName: users.name,
      authorImage: users.image,
    })
    .from(comments)
    .innerJoin(users, eq(comments.authorId, users.id))
    .where(eq(comments.reviewId, reviewId))
    .orderBy(comments.createdAt);

  return rows.map((row) => ({
    id: row.id,
    text: row.text,
    createdAt: row.createdAt,
    author: {
      id: row.authorId,
      name: row.authorName,
      image: row.authorImage,
    },
  }));
}
