import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * 게시글의 좋아요 수를 조회합니다.
 */
export const getLikeCount = query({
  args: { postId: v.id("posts") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();
    return likes.length;
  },
});

/**
 * 댓글의 좋아요 수를 조회합니다.
 */
export const getCommentLikeCount = query({
  args: { commentId: v.id("comments") },
  returns: v.number(),
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();
    return likes.length;
  },
});

/**
 * 사용자가 특정 게시글에 좋아요를 눌렀는지 확인합니다.
 */
export const isLikedByUser = query({
  args: {
    postId: v.id("posts"),
    userId: v.id("users"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", args.userId).eq("postId", args.postId)
      )
      .unique();
    return like !== null;
  },
});

/**
 * 사용자가 특정 댓글에 좋아요를 눌렀는지 확인합니다.
 */
export const isCommentLikedByUser = query({
  args: {
    commentId: v.id("comments"),
    userId: v.id("users"),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_comment", (q) =>
        q.eq("userId", args.userId).eq("commentId", args.commentId)
      )
      .unique();
    return like !== null;
  },
});

/**
 * 현재 사용자가 특정 게시글에 좋아요를 눌렀는지 확인합니다.
 */
export const isLikedByCurrentUser = query({
  args: { postId: v.id("posts") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();
    return like !== null;
  },
});

/**
 * 현재 사용자가 특정 댓글에 좋아요를 눌렀는지 확인합니다.
 */
export const isCommentLikedByCurrentUser = query({
  args: { commentId: v.id("comments") },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return false;
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return false;
    }

    const like = await ctx.db
      .query("likes")
      .withIndex("by_user_and_comment", (q) =>
        q.eq("userId", user._id).eq("commentId", args.commentId)
      )
      .unique();
    return like !== null;
  },
});

/**
 * 게시글에 좋아요를 추가하거나 제거합니다.
 * 인증된 사용자만 좋아요를 할 수 있습니다.
 */
export const toggleLike = mutation({
  args: { postId: v.id("posts") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 좋아요를 할 수 있습니다.");
    }

    // 사용자 정보 조회
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_post", (q) =>
        q.eq("userId", user._id).eq("postId", args.postId)
      )
      .unique();

    if (existingLike) {
      // 좋아요 제거
      await ctx.db.delete(existingLike._id);
    } else {
      // 좋아요 추가
      await ctx.db.insert("likes", {
        userId: user._id,
        postId: args.postId,
        type: "post",
      });
    }
    return null;
  },
});

/**
 * 댓글에 좋아요를 추가하거나 제거합니다.
 * 인증된 사용자만 좋아요를 할 수 있습니다.
 */
export const toggleCommentLike = mutation({
  args: { commentId: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 좋아요를 할 수 있습니다.");
    }

    // 사용자 정보 조회
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    const existingLike = await ctx.db
      .query("likes")
      .withIndex("by_user_and_comment", (q) =>
        q.eq("userId", user._id).eq("commentId", args.commentId)
      )
      .unique();

    if (existingLike) {
      // 좋아요 제거
      await ctx.db.delete(existingLike._id);
    } else {
      // 좋아요 추가
      await ctx.db.insert("likes", {
        userId: user._id,
        commentId: args.commentId,
        type: "comment",
      });
    }
    return null;
  },
});

/**
 * 게시글의 좋아요한 사용자 목록을 조회합니다.
 */
export const getLikedUsers = query({
  args: { postId: v.id("posts") },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .collect();

    const users = await Promise.all(
      likes.map(async (like) => {
        const user = await ctx.db.get(like.userId);
        if (!user) throw new Error("User not found");
        return {
          _id: user._id,
          name: user.name,
        };
      })
    );

    return users;
  },
});

/**
 * 댓글의 좋아요한 사용자 목록을 조회합니다.
 */
export const getCommentLikedUsers = query({
  args: { commentId: v.id("comments") },
  returns: v.array(
    v.object({
      _id: v.id("users"),
      name: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_comment", (q) => q.eq("commentId", args.commentId))
      .collect();

    const users = await Promise.all(
      likes.map(async (like) => {
        const user = await ctx.db.get(like.userId);
        if (!user) throw new Error("User not found");
        return {
          _id: user._id,
          name: user.name,
        };
      })
    );

    return users;
  },
});

/**
 * 사용자가 좋아요한 게시글 목록을 조회합니다.
 */
export const getLikedPosts = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("posts"),
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
    })
  ),
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), "post"))
      .collect();

    const posts = await Promise.all(
      likes.map(async (like) => {
        if (!like.postId) throw new Error("Post ID not found");
        const post = await ctx.db.get(like.postId);
        if (!post) throw new Error("Post not found");

        const author = await ctx.db.get(post.authorId);
        const subject = await ctx.db.get(post.subjectId);

        if (!author || !subject) {
          throw new Error("Author or subject not found");
        }

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
        };
      })
    );

    return posts;
  },
});

/**
 * 사용자가 좋아요한 댓글 목록을 조회합니다.
 */
export const getLikedComments = query({
  args: { userId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      content: v.string(),
      authorId: v.id("users"),
      postId: v.id("posts"),
      parentId: v.optional(v.id("comments")),
      author: v.object({
        _id: v.id("users"),
        name: v.string(),
      }),
      post: v.object({
        _id: v.id("posts"),
        title: v.string(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .filter((q) => q.eq(q.field("type"), "comment"))
      .collect();

    const comments = await Promise.all(
      likes.map(async (like) => {
        if (!like.commentId) throw new Error("Comment ID not found");
        const comment = await ctx.db.get(like.commentId);
        if (!comment) throw new Error("Comment not found");

        const author = await ctx.db.get(comment.authorId);
        const post = await ctx.db.get(comment.postId);

        if (!author || !post) {
          throw new Error("Author or post not found");
        }

        return {
          ...comment,
          author: {
            _id: author._id,
            name: author.name,
          },
          post: {
            _id: post._id,
            title: post.title,
          },
        };
      })
    );

    return comments;
  },
});

/**
 * 현재 사용자가 좋아요한 게시글 목록을 조회합니다.
 */
export const getCurrentUserLikedPosts = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("posts"),
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
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("type"), "post"))
      .collect();

    const posts = await Promise.all(
      likes.map(async (like) => {
        if (!like.postId) throw new Error("Post ID not found");
        const post = await ctx.db.get(like.postId);
        if (!post) throw new Error("Post not found");

        const author = await ctx.db.get(post.authorId);
        const subject = await ctx.db.get(post.subjectId);

        if (!author || !subject) {
          throw new Error("Author or subject not found");
        }

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
        };
      })
    );

    return posts;
  },
});

/**
 * 현재 사용자가 좋아요한 댓글 목록을 조회합니다.
 */
export const getCurrentUserLikedComments = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      content: v.string(),
      authorId: v.id("users"),
      postId: v.id("posts"),
      parentId: v.optional(v.id("comments")),
      author: v.object({
        _id: v.id("users"),
        name: v.string(),
      }),
      post: v.object({
        _id: v.id("posts"),
        title: v.string(),
      }),
    })
  ),
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      return [];
    }

    const likes = await ctx.db
      .query("likes")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .filter((q) => q.eq(q.field("type"), "comment"))
      .collect();

    const comments = await Promise.all(
      likes.map(async (like) => {
        if (!like.commentId) throw new Error("Comment ID not found");
        const comment = await ctx.db.get(like.commentId);
        if (!comment) throw new Error("Comment not found");

        const author = await ctx.db.get(comment.authorId);
        const post = await ctx.db.get(comment.postId);

        if (!author || !post) {
          throw new Error("Author or post not found");
        }

        return {
          ...comment,
          author: {
            _id: author._id,
            name: author.name,
          },
          post: {
            _id: post._id,
            title: post.title,
          },
        };
      })
    );

    return comments;
  },
});
