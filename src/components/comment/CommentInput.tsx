"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

interface CommentInputProps {
  postId: Id<"posts">;
  parentId?: Id<"comments">;
  placeholder?: string;
  onSubmitSuccess?: () => void;
  autoFocus?: boolean;
  compact?: boolean;
}

const CommentInput: React.FC<CommentInputProps> = ({
  postId,
  parentId,
  placeholder = "댓글을 입력하세요...",
  onSubmitSuccess,
  autoFocus = false,
  compact = false,
}) => {
  const { user, isSignedIn } = useUser();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createComment = useMutation(api.comments.create);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isSignedIn) {
      toast.error("댓글을 작성하려면 로그인이 필요합니다.");
      return;
    }

    if (!content.trim()) {
      toast.error("댓글 내용을 입력해주세요.");
      return;
    }

    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      await createComment({
        content: content.trim(),
        postId,
        parentId,
      });

      setContent("");
      toast.success(parentId ? "답글이 작성되었습니다." : "댓글이 작성되었습니다.");
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      toast.error("댓글 작성 중 오류가 발생했습니다.");
      console.error("Comment creation error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  if (!isSignedIn) {
    return (
      <div className={`${compact ? "p-3" : "p-4"} bg-gray-50 rounded-lg border border-gray-200`}>
        <p className="text-sm text-gray-600 text-center">
          댓글을 작성하려면{" "}
          <span className="text-blue-600 font-medium">로그인</span>이 필요합니다.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoFocus={autoFocus}
          disabled={isSubmitting}
          className={`
            resize-none border-gray-300 focus:border-blue-500 focus:ring-blue-500
            ${compact ? "min-h-[80px]" : "min-h-[100px]"}
            ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}
          `}
          maxLength={1000}
        />
        <div className="absolute bottom-2 right-2 text-xs text-gray-400">
          {content.length}/1000
        </div>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500">
          Ctrl + Enter로 빠른 작성
        </p>
        <div className="flex items-center gap-2">
          {parentId && onSubmitSuccess && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onSubmitSuccess}
              disabled={isSubmitting}
            >
              취소
            </Button>
          )}
          <Button
            type="submit"
            size="sm"
            disabled={!content.trim() || isSubmitting}
            className="min-w-[80px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                작성중
              </>
            ) : (
              <>
                <Send className="w-3 h-3 mr-1" />
                {parentId ? "답글" : "댓글"}
              </>
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentInput;