"use client";

import React, { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { MoreHorizontal, Reply, Flag, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import CommentInput from "./CommentInput";
import CommentLikeButton from "./CommentLikeButton";

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
}

interface CommentProps {
  comment: CommentData;
  replies?: CommentData[];
  postId: Id<"posts">;
  depth?: number;
}

const Comment: React.FC<CommentProps> = ({ 
  comment, 
  replies = [], 
  postId, 
  depth = 0 
}) => {
  const { user } = useUser();
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const deleteComment = useMutation(api.comments.remove);

  const formattedDate = formatDistanceToNow(new Date(comment._creationTime), {
    addSuffix: true,
    locale: ko,
  });

  // Check if current user is the author of this comment
  // Since we need to match Clerk user ID with Convex user, we can use a query or 
  // compare using the user's full name or other available fields
  const isAuthor = user?.fullName === comment.author.name || 
                   user?.firstName + " " + user?.lastName === comment.author.name;

  const handleDelete = async () => {
    if (!confirm("댓글을 삭제하시겠습니까?")) return;

    try {
      setIsDeleting(true);
      await deleteComment({ commentId: comment._id });
      toast.success("댓글이 삭제되었습니다.");
    } catch (error) {
      toast.error("댓글 삭제 중 오류가 발생했습니다.");
      console.error("Delete comment error:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplySubmit = () => {
    setShowReplyForm(false);
  };

  const handleEditSubmit = () => {
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
  };

  // Maximum nesting depth to prevent excessive indentation
  const maxDepth = 3;
  const isMaxDepth = depth >= maxDepth;

  return (
    <div className={`${depth > 0 ? "ml-6 pl-4 border-l-2 border-gray-100" : ""}`}>
      <div className="bg-white rounded-lg">
        <div className="flex items-start gap-3">
          {/* Avatar placeholder */}
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
            <span className="text-xs font-medium text-gray-600">
              {comment.author.name.charAt(0)}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            {/* Comment header */}
            <div className="flex items-center gap-2 mb-2">
              <span className="font-medium text-gray-900 text-sm">
                {comment.author.name}
              </span>
              <span className="text-xs text-gray-500">{formattedDate}</span>
              
              {isAuthor && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                      disabled={isDeleting}
                    >
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-32">
                    <DropdownMenuItem
                      onClick={() => setIsEditing(true)}
                      disabled={isDeleting || isEditing}
                    >
                      <Edit className="w-3 h-3 mr-2" />
                      수정
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={handleDelete}
                      disabled={isDeleting || isEditing}
                      className="text-red-600 focus:text-red-600"
                    >
                      삭제
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>

            {/* Comment content */}
            <div className="mb-3">
              {isEditing ? (
                <div className="mt-2">
                  <CommentInput
                    postId={postId}
                    isEditMode={true}
                    editCommentId={comment._id}
                    editInitialContent={comment.content}
                    onSubmitSuccess={handleEditSubmit}
                    onCancelEdit={handleCancelEdit}
                    autoFocus
                    compact
                  />
                </div>
              ) : (
                <p className="text-sm text-gray-700 leading-5 whitespace-pre-wrap">
                  {comment.content}
                </p>
              )}
            </div>

            {/* Comment actions - Hide when editing */}
            {!isEditing && (
              <div className="flex items-center gap-3">
                {!isMaxDepth && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReplyForm(!showReplyForm)}
                    className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                  >
                    <Reply className="w-3 h-3 mr-1" />
                    답글
                  </Button>
                )}

                <CommentLikeButton commentId={comment._id} />

                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  <Flag className="w-3 h-3 mr-1" />
                  신고
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Reply form - Hide when editing */}
        {showReplyForm && !isEditing && (
          <div className="mt-4 ml-11">
            <CommentInput
              postId={postId}
              parentId={comment._id}
              placeholder={`${comment.author.name}님에게 답글...`}
              onSubmitSuccess={handleReplySubmit}
              autoFocus
              compact
            />
          </div>
        )}
      </div>

      {/* Nested replies */}
      {replies.length > 0 && (
        <div className="mt-4 space-y-4">
          {replies.map((reply) => (
            <Comment
              key={reply._id}
              comment={reply}
              postId={postId}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Comment;