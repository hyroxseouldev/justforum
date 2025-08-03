import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { paginationOptsValidator } from "convex/server";

/**
 * 모든 게시글 목록을 조회합니다. (페이지네이션 지원)
 */
export const list = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    type: v.optional(v.union(v.literal("notice"), v.literal("general"))),
    keyword: v.optional(v.string()),
    searchType: v.optional(v.union(v.literal("title"), v.literal("content"))),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
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
        isLiked: v.boolean(),
        commentCount: v.number(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
    totalCount: v.number(),
  }),
  handler: async (ctx, args) => {
    let postsQuery;

    // 키워드 검색이 있는 경우
    if (args.keyword && args.keyword.trim() !== "") {
      if (args.searchType === "title") {
        postsQuery = ctx.db
          .query("posts")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          });
      } else if (args.searchType === "content") {
        postsQuery = ctx.db
          .query("posts")
          .withSearchIndex("search_content", (q) => {
            let query = q.search("content", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          });
      } else {
        // searchType이 지정되지 않은 경우 제목으로 검색
        postsQuery = ctx.db
          .query("posts")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          });
      }
    } else {
      // 기존 필터링 로직
      if (args.subjectId) {
        postsQuery = ctx.db
          .query("posts")
          .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
          .order("desc");
      } else if (args.type) {
        postsQuery = ctx.db
          .query("posts")
          .withIndex("by_type", (q) => q.eq("type", args.type!))
          .order("desc");
      } else {
        postsQuery = ctx.db.query("posts").order("desc");
      }
    }

    const postsResult = await postsQuery.paginate(args.paginationOpts);
    const posts = postsResult.page;

    // 현재 사용자 정보 가져오기 (좋아요 상태 확인용)
    const identity = await ctx.auth.getUserIdentity();
    let currentUser: any = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
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

        // 코멘트 수 계산
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        // 현재 사용자가 좋아요를 눌렀는지 확인
        let isLiked = false;
        if (currentUser) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_user_and_post", (q) =>
              q.eq("userId", currentUser._id).eq("postId", post._id)
            )
            .unique();
          isLiked = like !== null;
        }

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
          isLiked,
          commentCount: comments.length,
        };
      })
    );

    // 전체 게시글 수 계산
    let totalCount: number;

    if (args.keyword && args.keyword.trim() !== "") {
      if (args.searchType === "title") {
        totalCount = await ctx.db
          .query("posts")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          })
          .collect()
          .then((posts) => posts.length);
      } else if (args.searchType === "content") {
        totalCount = await ctx.db
          .query("posts")
          .withSearchIndex("search_content", (q) => {
            let query = q.search("content", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          })
          .collect()
          .then((posts) => posts.length);
      } else {
        totalCount = await ctx.db
          .query("posts")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          })
          .collect()
          .then((posts) => posts.length);
      }
    } else if (args.subjectId) {
      totalCount = await ctx.db
        .query("posts")
        .withIndex("by_subject", (q) => q.eq("subjectId", args.subjectId!))
        .collect()
        .then((posts) => posts.length);
    } else if (args.type) {
      totalCount = await ctx.db
        .query("posts")
        .withIndex("by_type", (q) => q.eq("type", args.type!))
        .collect()
        .then((posts) => posts.length);
    } else {
      totalCount = await ctx.db
        .query("posts")
        .collect()
        .then((posts) => posts.length);
    }

    return {
      page: postsWithDetails,
      isDone: postsResult.isDone,
      continueCursor: postsResult.continueCursor,
      totalCount,
    };
  },
});

/**
 * 특정 게시글을 조회합니다.
 * 댓글도 함께 불러옵니다.
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
      isLiked: v.boolean(),
      comments: v.array(
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

    // 현재 사용자가 좋아요를 눌렀는지 확인
    const identity = await ctx.auth.getUserIdentity();
    let isLiked = false;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();

      if (user) {
        const like = await ctx.db
          .query("likes")
          .withIndex("by_user_and_post", (q) =>
            q.eq("userId", user._id).eq("postId", post._id)
          )
          .unique();
        isLiked = like !== null;
      }
    }

    // 댓글 목록 가져오기
    const topLevelComments = await ctx.db
      .query("comments")
      .withIndex("by_post", (q) => q.eq("postId", args.postId))
      .filter((q) => q.eq(q.field("parentId"), undefined))
      .order("asc")
      .collect();

    // 각 최상위 댓글에 대한 대댓글들을 가져오기
    const commentsWithReplies = await Promise.all(
      topLevelComments.map(async (comment) => {
        const commentAuthor = await ctx.db.get(comment.authorId);
        if (!commentAuthor) throw new Error("Comment author not found");

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
            _id: commentAuthor._id,
            name: commentAuthor.name,
          },
          replies: repliesWithAuthors,
        };
      })
    );

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
      isLiked,
      comments: commentsWithReplies,
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

/**
 * 모든 게시글 목록을 조회합니다. (기존 호환성을 위한 함수)
 */
export const listSimple = query({
  args: {
    subjectId: v.optional(v.id("subjects")),
    type: v.optional(v.union(v.literal("notice"), v.literal("general"))),
    keyword: v.optional(v.string()),
    searchType: v.optional(v.union(v.literal("title"), v.literal("content"))),
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
      isLiked: v.boolean(),
      commentCount: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    let posts: any[];

    // 키워드 검색이 있는 경우
    if (args.keyword && args.keyword.trim() !== "") {
      if (args.searchType === "title") {
        posts = await ctx.db
          .query("posts")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          })
          .take(args.limit || 50);
      } else if (args.searchType === "content") {
        posts = await ctx.db
          .query("posts")
          .withSearchIndex("search_content", (q) => {
            let query = q.search("content", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          })
          .take(args.limit || 50);
      } else {
        // searchType이 지정되지 않은 경우 제목으로 검색
        posts = await ctx.db
          .query("posts")
          .withSearchIndex("search_title", (q) => {
            let query = q.search("title", args.keyword!);
            if (args.subjectId) {
              query = query.eq("subjectId", args.subjectId);
            }
            if (args.type) {
              query = query.eq("type", args.type);
            }
            return query;
          })
          .take(args.limit || 50);
      }
    } else {
      // 기존 필터링 로직
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
    }

    // 현재 사용자 정보 가져오기 (좋아요 상태 확인용)
    const identity = await ctx.auth.getUserIdentity();
    let currentUser: any = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
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

        // 코멘트 수 계산
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        // 현재 사용자가 좋아요를 눌렀는지 확인
        let isLiked = false;
        if (currentUser) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_user_and_post", (q) =>
              q.eq("userId", currentUser._id).eq("postId", post._id)
            )
            .unique();
          isLiked = like !== null;
        }

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
          isLiked,
          commentCount: comments.length,
        };
      })
    );

    return postsWithDetails;
  },
});

/**
 * 특정 사용자가 작성한 게시글 목록을 조회합니다. (페이지네이션 지원)
 */
export const listByAuthor = query({
  args: {
    authorId: v.id("users"),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(
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
        isLiked: v.boolean(),
        commentCount: v.number(),
      })
    ),
    isDone: v.boolean(),
    continueCursor: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    const postsResult = await ctx.db
      .query("posts")
      .withIndex("by_author", (q) => q.eq("authorId", args.authorId))
      .order("desc")
      .paginate(args.paginationOpts);

    const posts = postsResult.page;

    // 현재 사용자 정보 가져오기 (좋아요 상태 확인용)
    const identity = await ctx.auth.getUserIdentity();
    let currentUser: any = null;

    if (identity) {
      currentUser = await ctx.db
        .query("users")
        .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
        .unique();
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

        // 코멘트 수 계산
        const comments = await ctx.db
          .query("comments")
          .withIndex("by_post", (q) => q.eq("postId", post._id))
          .collect();

        // 현재 사용자가 좋아요를 눌렀는지 확인
        let isLiked = false;
        if (currentUser) {
          const like = await ctx.db
            .query("likes")
            .withIndex("by_user_and_post", (q) =>
              q.eq("userId", currentUser._id).eq("postId", post._id)
            )
            .unique();
          isLiked = like !== null;
        }

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
          isLiked,
          commentCount: comments.length,
        };
      })
    );

    return {
      page: postsWithDetails,
      isDone: postsResult.isDone,
      continueCursor: postsResult.continueCursor,
    };
  },
});
