import React from "react";
import PostItem from "./PostItem";

interface Post {
  _id: string;
  _creationTime: number;
  title: string;
  content: string;
  views: number;
  type: "notice" | "general";
  author: {
    _id: string;
    name: string;
  };
  subject: {
    _id: string;
    name: string;
  };
  likeCount: number;
  isLiked: boolean;
}

interface PaginatedPosts {
  page: Post[];
  isDone: boolean;
  continueCursor: string | null;
}

interface PostListProps {
  posts: Post[] | PaginatedPosts;
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  // Handle both old format (Post[]) and new format (PaginatedPosts)
  const postArray = Array.isArray(posts) ? posts : posts.page;

  return (
    <div className="">
      {!postArray || postArray.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 min-h-[500px] gap-2">
          <h3>게시글이 없습니다.</h3>
          <p>게시글을 작성해주세요.</p>
        </div>
      ) : (
        postArray.map((post) => <PostItem key={post._id} {...post} />)
      )}
    </div>
  );
};

export default PostList;
