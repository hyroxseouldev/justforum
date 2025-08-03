import { Id } from "@/convex/_generated/dataModel";
import React from "react";
import PostDetailClient from "@/components/PostDetailClient";

const PostDetailPage = ({ params }: { params: { pid: string } }) => {
  return <PostDetailClient postId={params.pid as Id<"posts">} />;
};

export default PostDetailPage;
