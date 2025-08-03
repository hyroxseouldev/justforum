import React from "react";
import { Id } from "@/convex/_generated/dataModel";
import CommentInput from "./CommentInput";
import Comment from "./Comment";
import { Separator } from "@/components/ui/separator";

interface CommentData {
  _id: Id<"comments">;
  _creationTime: number;
  content: string;
  authorId: Id<"users">;
  postId: Id<"posts">;
  parentId?: Id<"comments">;
  author: {
    _id: Id<"users">;
    name: string;
  };
  replies: {
    _id: Id<"comments">;
    _creationTime: number;
    content: string;
    authorId: Id<"users">;
    postId: Id<"posts">;
    parentId?: Id<"comments">;
    author: {
      _id: Id<"users">;
      name: string;
    };
  }[];
}

interface CommentSectionProps {
  postId: Id<"posts">;
  comments: CommentData[];
}

const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  comments,
}) => {
  const totalCommentCount = comments.reduce(
    (total, comment) => total + 1 + comment.replies.length,
    0
  );

  return (
    <div className="mt-6 pt-6 border-t border-gray-200">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-gray-900">
          댓글 ({totalCommentCount})
        </h3>
      </div>

      <div className="mb-6">
        <CommentInput postId={postId} />
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p className="text-sm">첫 번째 댓글을 작성해보세요!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment, index) => (
            <div key={comment._id}>
              <Comment
                comment={comment}
                replies={comment.replies}
                postId={postId}
              />
              {index < comments.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
