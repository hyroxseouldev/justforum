import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * 모든 subjects를 조회합니다.
 */
export const list = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("subjects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
    })
  ),
  handler: async (ctx) => {
    return await ctx.db.query("subjects").collect();
  },
});

/**
 * subject를 생성합니다.
 */
export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  returns: v.id("subjects"),
  handler: async (ctx, args) => {
    return await ctx.db.insert("subjects", {
      name: args.name,
      description: args.description,
    });
  },
});

/**
 * 기본 subjects를 생성합니다 (question, feedback).
 */
export const createDefaultSubjects = mutation({
  args: {},
  returns: v.null(),
  handler: async (ctx) => {
    // 기존 subjects 확인
    const existingSubjects = await ctx.db.query("subjects").collect();

    // question subject가 없으면 생성
    const questionExists = existingSubjects.some(
      (subject) => subject.name === "question"
    );
    if (!questionExists) {
      await ctx.db.insert("subjects", {
        name: "question",
        description: "질문 카테고리",
      });
    }

    // feedback subject가 없으면 생성
    const feedbackExists = existingSubjects.some(
      (subject) => subject.name === "feedback"
    );
    if (!feedbackExists) {
      await ctx.db.insert("subjects", {
        name: "feedback",
        description: "피드백 카테고리",
      });
    }

    return null;
  },
});

/**
 * 특정 주제를 조회합니다.
 */
export const get = query({
  args: { subjectId: v.id("subjects") },
  returns: v.union(
    v.object({
      _id: v.id("subjects"),
      _creationTime: v.number(),
      name: v.string(),
      description: v.optional(v.string()),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.subjectId);
  },
});

/**
 * 주제를 수정합니다.
 */
export const update = mutation({
  args: {
    subjectId: v.id("subjects"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { subjectId, ...updates } = args;
    await ctx.db.patch(subjectId, updates);
    return null;
  },
});

/**
 * 주제를 삭제합니다.
 */
export const remove = mutation({
  args: { subjectId: v.id("subjects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.delete(args.subjectId);
    return null;
  },
});
