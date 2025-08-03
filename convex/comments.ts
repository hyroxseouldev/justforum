import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * 게시글의 댓글 목록을 조회합니다.
 */
export const listByPost = query({
  args: { postId: v.id("posts") },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      content: v.string(),
      authorId: v.id("users"),
      postId: v.id("posts"),
      parentId: v.optional(v.id("comments")),
      author: v.object({
        _id: v.id("users"),
        name: v.string(),
      }),
      replies: v.array(
        v.object({
          _id: v.id("comments"),
          _creationTime: v.number(),
          content: v.string(),
          authorId: v.id("users"),
          postId: v.id("posts"),
          parentId: v.optional(v.id("comments")),
          author: v.object({
            _id: v.id("users"),
            name: v.string(),
          }),
        })
      ),
    })
  ),
  handler: async (ctx, args) => {
    // 최상위 댓글들만 가져오기 (parentId가 없는 것들)
    const topLevelComments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .order("asc")
      .collect();

    // 각 최상위 댓글에 대한 대댓글들을 가져오기
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const author = await ctx.db.get(comment.authorId);
        if (!author) throw new Error("Author not found");

        // 대댓글들 가져오기
        const replies = await ctx.db
          .query("comments")
          .withIndex("by_parent", (q) => q.eq("parentId", comment._id))
          .order("asc")
          .collect();

        // 대댓글들의 작성자 정보 가져오기
        const repliesWithAuthors = await Promise.all(
          replies.map(async (reply) => {
            const replyAuthor = await ctx.db.get(reply.authorId);
            if (!replyAuthor) throw new Error("Reply author not found");

            return {
              ...reply,
              author: {
                _id: replyAuthor._id,
                name: replyAuthor.name,
              },
            };
          })
        );

        return {
          ...comment,
          author: {
            _id: author._id,
            name: author.name,
          },
          replies: repliesWithAuthors,
        };
      })
    );

    return commentsWithReplies;
  },
});

/**
 * 특정 댓글을 조회합니다.
 */
export const get = query({
  args: { commentId: v.id("comments") },
  returns: v.union(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      content: v.string(),
      authorId: v.id("users"),
      postId: v.id("posts"),
      parentId: v.optional(v.id("comments")),
      author: v.object({
        _id: v.id("users"),
        name: v.string(),
      }),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const comment = await ctx.db.get(args.commentId);
    if (!comment) return null;

    const author = await ctx.db.get(comment.authorId);
    if (!author) throw new Error("Author not found");

    return {
      ...comment,
      author: {
        _id: author._id,
        name: author.name,
      },
    };
  },
});

/**
 * 새로운 댓글을 생성합니다.
 * 인증된 사용자만 댓글을 작성할 수 있습니다.
 */
export const create = mutation({
  args: {
    content: v.string(),
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")),
  },
  returns: v.id("comments"),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 댓글을 작성할 수 있습니다.");
    }

    // 사용자 정보 조회
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (!user) {
      throw new Error("사용자 정보를 찾을 수 없습니다.");
    }

    // 게시글 존재 확인
    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error("게시글을 찾을 수 없습니다.");
    }

    // 부모 댓글 확인 (대댓글인 경우)
    if (args.parentId) {
      const parentComment = await ctx.db.get(args.parentId);
      if (!parentComment) {
        throw new Error("부모 댓글을 찾을 수 없습니다.");
      }
    }

    return await ctx.db.insert("comments", {
      content: args.content,
      authorId: user._id,
      postId: args.postId,
      parentId: args.parentId,
    });
  },
});

/**
 * 댓글을 수정합니다.
 * 작성자만 수정할 수 있습니다.
 */
export const update = mutation({
  args: {
    commentId: v.id("comments"),
    content: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 댓글을 수정할 수 있습니다.");
    }

    // 댓글 정보 조회
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다.");
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
    if (comment.authorId !== user._id) {
      throw new Error("댓글 작성자만 수정할 수 있습니다.");
    }

    await ctx.db.patch(args.commentId, { content: args.content });
    return null;
  },
});

/**
 * 댓글을 삭제합니다.
 * 작성자만 삭제할 수 있습니다.
 */
export const remove = mutation({
  args: { commentId: v.id("comments") },
  returns: v.null(),
  handler: async (ctx, args) => {
    // 현재 인증된 사용자 정보 가져오기
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("인증된 사용자만 댓글을 삭제할 수 있습니다.");
    }

    // 댓글 정보 조회
    const comment = await ctx.db.get(args.commentId);
    if (!comment) {
      throw new Error("댓글을 찾을 수 없습니다.");
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
    if (comment.authorId !== user._id) {
      throw new Error("댓글 작성자만 삭제할 수 있습니다.");
    }

    // 대댓글들도 함께 삭제
    const replies = await ctx.db
      .query("comments")
      .withIndex("by_parent", (q) => q.eq("parentId", args.commentId))
      .collect();

    // 대댓글들 삭제
    for (const reply of replies) {
      await ctx.db.delete(reply._id);
    }

    // 원본 댓글 삭제
    await ctx.db.delete(args.commentId);
    return null;
  },
});

/**
 * 사용자가 작성한 댓글 목록을 조회합니다.
 */
export const listByAuthor = query({
  args: { authorId: v.id("users") },
  returns: v.array(
    v.object({
      _id: v.id("comments"),
      _creationTime: v.number(),
      content: v.string(),
      authorId: v.id("users"),
      postId: v.id("posts"),
      parentId: v.optional(v.id("comments")),
      post: v.object({
        _id: v.id("posts"),
        title: v.string(),
      }),
    })
  ),
  handler: async (ctx, args) => {
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .collect();

    // 각 댓글에 대한 게시글 정보 가져오기
    const commentsWithPosts = await Promise.all(
      comments.map(async (comment) => {
        const post = await ctx.db.get(comment.postId);
        if (!post) throw new Error("Post not found");

        return {
          ...comment,
          post: {
            _id: post._id,
            title: post.title,
          },
        };
      })
    );

    return commentsWithPosts;
  },
});
