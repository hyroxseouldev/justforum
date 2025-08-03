"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import PostList from "./PostList";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PostListWithPaginationProps {
  subjectId?: string;
  type?: "notice" | "general";
  authorId?: string;
}

export const PostListWithPagination: React.FC<PostListWithPaginationProps> = ({
  subjectId,
  type,
  authorId,
}) => {
  const [paginationOpts, setPaginationOpts] = useState({
    numItems: 10,
    cursor: null as string | null,
  });

  // Use the appropriate query based on props
  const postsResult = useQuery(
    authorId ? api.posts.listByAuthor : api.posts.list,
    authorId
      ? { authorId, paginationOpts }
      : { subjectId, type, paginationOpts }
  );

  const handleNextPage = () => {
    if (postsResult && !postsResult.isDone && postsResult.continueCursor) {
      setPaginationOpts({
        numItems: 10,
        cursor: postsResult.continueCursor,
      });
    }
  };

  const handlePreviousPage = () => {
    // For simplicity, we'll reset to the first page
    // In a more sophisticated implementation, you might want to maintain a stack of cursors
    setPaginationOpts({
      numItems: 10,
      cursor: null,
    });
  };

  if (!postsResult) {
    return (
      <div className="flex flex-col items-center justify-center p-4 min-h-[500px] gap-2">
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <PostList posts={postsResult} />

      {/* Pagination Controls */}
      <div className="flex justify-center items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handlePreviousPage}
          disabled={!paginationOpts.cursor}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          이전
        </Button>

        <span className="text-sm text-muted-foreground">
          페이지 {paginationOpts.cursor ? "다음" : "첫"}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={handleNextPage}
          disabled={postsResult.isDone || !postsResult.continueCursor}
        >
          다음
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PostListWithPagination;
