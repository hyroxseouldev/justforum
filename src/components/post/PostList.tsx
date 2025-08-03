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
}

interface PostListProps {
  posts: Post[];
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  return (
    <div className="">
      {!posts || posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-4 min-h-[500px] gap-2">
          <h3>게시글이 없습니다.</h3>
          <p>게시글을 작성해주세요.</p>
        </div>
      ) : (
        posts.map((post) => <PostItem key={post._id} {...post} />)
      )}
    </div>
  );
};

export default PostList;
