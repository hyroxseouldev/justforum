import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import PostDetailClient from "@/components/PostDetailClient";

const PostDetailPage = ({ params }: { params: { pid: string } }) => {
  return (
    <div className="container max-w-4xl mx-auto pt-16">
      <PostDetailClient postId={params.pid as Id<"posts">} />
    </div>
  );
};

export default PostDetailPage;
