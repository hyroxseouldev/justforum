import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_name", ["name"]),

  subjects: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
  }).index("by_name", ["name"]),

  posts: defineTable({
    title: v.string(),
    content: v.string(),
    views: v.number(),
    subjectId: v.id("subjects"),
    type: v.union(v.literal("notice"), v.literal("general")),
    authorId: v.id("users"),
  })
    .index("by_subject", ["subjectId"])
    .index("by_author", ["authorId"])
    .index("by_type", ["type"])
    .searchIndex("search_title", {
      searchField: "title",
      filterFields: ["type", "subjectId"],
    })
    .searchIndex("search_content", {
      searchField: "content",
      filterFields: ["type", "subjectId"],
    }),

  likes: defineTable({
    userId: v.id("users"),
    postId: v.optional(v.id("posts")),
    commentId: v.optional(v.id("comments")),
    type: v.union(v.literal("post"), v.literal("comment")),
  })
    .index("by_user", ["userId"])
    .index("by_post", ["postId"])
    .index("by_comment", ["commentId"])
    .index("by_user_and_post", ["userId", "postId"])
    .index("by_user_and_comment", ["userId", "commentId"])
    .index("by_type", ["type"]),

  comments: defineTable({
    content: v.string(),
    authorId: v.id("users"),
    postId: v.id("posts"),
    parentId: v.optional(v.id("comments")),
  })
    .index("by_post", ["postId"])
    .index("by_author", ["authorId"])
    .index("by_parent", ["parentId"]),
});
