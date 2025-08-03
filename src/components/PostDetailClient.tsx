"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import PostCard from "@/components/post/PostCard";
import CommentSection from "@/components/comment/CommentSection";
import ViewIncrementer from "@/components/ViewIncrementer";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface PostDetailClientProps {
  postId: Id<"posts">;
}

const PostDetailClient: React.FC<PostDetailClientProps> = ({ postId }) => {
  const post = useQuery(api.posts.get, { postId });

  if (post === undefined) {
    return (
      <div className="min-h-screen">
        <div className="container max-w-4xl mx-auto px-4 py-6">
          {/* Back button skeleton */}
          <Skeleton className="h-10 w-24 mb-4" />

          {/* Post card skeleton */}
          <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
            <div className="pb-3 border-b">
              <Skeleton className="h-6 w-20 mb-3" />
              <Skeleton className="h-8 w-3/4" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3 mb-4" />
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-12" />
                </div>
                <div className="flex gap-4">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-8 w-16" />
                </div>
              </div>
            </div>
          </div>

          {/* Comments section skeleton */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <Skeleton className="h-6 w-24 mb-5" />
            <div className="space-y-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (post === null) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            게시글을 찾을 수 없습니다
          </h1>
          <p className="text-gray-600 mb-4">
            요청하신 게시글이 삭제되었거나 존재하지 않습니다.
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              목록으로 돌아가기
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        {/* Back button */}
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </Link>

        {/* View incrementer component */}
        <ViewIncrementer postId={post._id} />

        {/* Post content */}
        <PostCard
          _id={post._id}
          _creationTime={post._creationTime}
          title={post.title}
          content={post.content}
          views={post.views}
          type={post.type}
          author={post.author}
          subject={post.subject}
          likeCount={post.likeCount}
          isLiked={post.isLiked}
          detail={true}
          commentCount={post.comments.reduce(
            (total, comment) => total + 1 + comment.replies.length,
            0
          )}
        />

        {/* Comments section */}
        <CommentSection postId={post._id} comments={post.comments} />
      </div>
    </div>
  );
};

export default PostDetailClient;
