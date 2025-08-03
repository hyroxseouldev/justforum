import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_name", ["name"]),
});
