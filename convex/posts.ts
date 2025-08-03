import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";

/**
 * 모든 게시글 목록을 조회합니다.
 */
export const list = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    type: v.optional(v.union(v.literal("notice"), v.literal("general"))),
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      views: v.number(),
      subjectId: v.id("subjects"),
      type: v.union(v.literal("notice"), v.literal("general")),
      authorId: v.id("users"),
      author: v.object({
        _id: v.id("users"),
        name: v.string(),
      }),
      subject: v.object({
        _id: v.id("subjects"),
        name: v.string(),
      }),
      likeCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let posts: any[];

    if (args.subjectId) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .order("desc")
        .take(args.limit || 50);
    } else if (args.type) {
      posts = await ctx.db
        .query("posts")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .order("desc")
        .take(args.limit || 50);
    } else {
      posts = await ctx.db
        .query("posts")
        .order("desc")
        .take(args.limit || 50);
    }

    // 작성자와 주제 정보를 함께 가져오기
    const postsWithDetails = await Promise.all(
      posts.map(async (post: any) => {
        const author = await ctx.db.get(post.authorId);
        const subject = await ctx.db.get(post.subjectId);

        if (!author || !subject) {
          throw new Error("Author or subject not found");
        }

        // 좋아요 수 계산
        const likes = await ctx.db
          .query("likes")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        return {
          ...post,
          author: {
            _id: author._id,
            name: (author as any).name,
          },
          subject: {
            _id: subject._id,
            name: (subject as any).name,
          },
          likeCount: likes.length,
        };
      })
    );

    return postsWithDetails;
  },
});

/**
 * 특정 게시글을 조회합니다.
 */
export const get = query({
  args: { postId: v.id("posts") },
  returns: v.union(
    v.object({
      _id: v.id("posts"),
      _creationTime: v.number(),
      title: v.string(),
      content: v.string(),
      views: v.number(),
      subjectId: v.id("subjects"),
      type: v.union(v.literal("notice"), v.literal("general")),
      authorId: v.id("users"),
      author: v.object({
        _id: v.id("users"),
        name: v.string(),
      }),
      subject: v.object({
        _id: v.id("subjects"),
        name: v.string(),
      }),
      likeCount: v.number(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) return null;

    const author = await ctx.db.get(post.authorId);
    const subject = await ctx.db.get(post.subjectId);

    if (!author || !subject) {
      throw new Error("Author or subject not found");
    }

    // 좋아요 수 계산
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", post._id))
      .collect();

    return {
      ...post,
      author: {
        _id: author._id,
        name: author.name,
      },
      subject: {
        _id: subject._id,
        name: subject.name,
      },
      likeCount: likes.length,
    };
  },
});

/**
 * 새로운 게시글을 생성합니다.
 * 인증된 사용자만 게시글을 작성할 수 있습니다.
 */
export const create = mutation({
  args: {
    title: v.string(),
    content: v.string(),
    subjectId: v.id("subjects"),
    type: v.union(v.literal("notice"), v.literal("general")),
  },
  returns: v.id("posts"),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 게시글을 작성할 수 있습니다.");
    }

    // 사용자 정보 조회
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    return await ctx.db.insert("posts", {
      title: args.title,
      content: args.content,
      views: 0,
      subjectId: args.subjectId,
      type: args.type,
      authorId: user._id,
    });
  },
});

/**
 * 게시글을 수정합니다.
 * 작성자만 수정할 수 있습니다.
 */
export const update = mutation({
  args: {
    postId: v.id("posts"),
    title: v.optional(v.string()),
    content: v.optional(v.string()),
    subjectId: v.optional(v.id("subjects")),
    type: v.optional(v.union(v.literal("notice"), v.literal("general"))),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 게시글을 수정할 수 있습니다.");
    }

    // 게시글 정보 조회
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    // 사용자 정보 조회
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 작성자 확인
    if (post.authorId !== user._id) {
      throw new Error("게시글 작성자만 수정할 수 있습니다.");
    }

    const { postId, ...updates } = args;
    await ctx.db.patch(postId, updates);
    return null;
  },
});

/**
 * 게시글을 삭제합니다.
 * 작성자만 삭제할 수 있습니다.
 */
export const remove = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 게시글을 삭제할 수 있습니다.");
    }

    // 게시글 정보 조회
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    // 사용자 정보 조회
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 작성자 확인
    if (post.authorId !== user._id) {
      throw new Error("게시글 작성자만 삭제할 수 있습니다.");
    }

    // 관련된 좋아요들도 함께 삭제
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    for (const like of likes) {
      await ctx.db.delete(like._id);
    }

    await ctx.db.delete(args.postId);
    return null;
  },
});

/**
 * 게시글 조회수를 증가시킵니다.
 */
export const incrementViews = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error("Post not found");

    await ctx.db.patch(args.postId, { views: post.views + 1 });
    return null;
  },
});
