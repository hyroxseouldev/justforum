import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import PostDetailClient from "@/components/PostDetailClient";

const PostDetailPage = async ({ params }: { params: Promise<{ pid: string }> }) => {
  const { pid } = await params;
  return (
    <div className="container max-w-4xl mx-auto pt-16">
      <PostDetailClient postId={pid as Id<"posts">} />
    </div>
  );
};

export default PostDetailPage;
