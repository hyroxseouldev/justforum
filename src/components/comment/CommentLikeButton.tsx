"use client";

import React, { useOptimistic, startTransition, useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface CommentLikeButtonProps {
  commentId: Id<"comments">;
}

const CommentLikeButton: React.FC<CommentLikeButtonProps> = ({ commentId }) => {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingActionRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Get current like status and count
  const likeCount = useQuery(api.likes.getCommentLikeCount, { commentId }) ?? 0;
  const isLiked = useQuery(api.likes.isCommentLikedByCurrentUser, { commentId }) ?? false;
  
  const toggleCommentLike = useMutation(api.likes.toggleCommentLike);

  // Optimistic updates for better UX
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    { count: likeCount, isLiked: isLiked },
    (state, newIsLiked: boolean) => ({
      count: newIsLiked ? state.count + 1 : state.count - 1,
      isLiked: newIsLiked,
    })
  );

  // Sync optimistic state when props change
  useEffect(() => {
    if (!isProcessing) {
      startTransition(() => {
        setOptimisticLikes(isLiked);
      });
    }
  }, [likeCount, isLiked, isProcessing, setOptimisticLikes]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleLike = async () => {
    if (!user) {
      toast.error("로그인이 필요합니다.");
      return;
    }

    // Prevent multiple rapid clicks
    if (isProcessing || pendingActionRef.current) {
      return;
    }

    setIsProcessing(true);
    pendingActionRef.current = true;

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    try {
      // Optimistic update wrapped in startTransition
      const newLikedState = !optimisticLikes.isLiked;
      startTransition(() => {
        setOptimisticLikes(newLikedState);
      });

      // Debounce the actual API call
      timeoutRef.current = setTimeout(async () => {
        try {
          await toggleCommentLike({ commentId });
        } catch (error) {
          // Revert optimistic update on error
          startTransition(() => {
            setOptimisticLikes(!newLikedState);
          });
          toast.error("좋아요 처리 중 오류가 발생했습니다.");
          console.error("Comment like error:", error);
        } finally {
          setIsProcessing(false);
          pendingActionRef.current = false;
        }
      }, 300); // 300ms debounce

    } catch (error) {
      // Immediate error handling
      startTransition(() => {
        setOptimisticLikes(!optimisticLikes.isLiked);
      });
      setIsProcessing(false);
      pendingActionRef.current = false;
      toast.error("좋아요 처리 중 오류가 발생했습니다.");
      console.error("Comment like error:", error);
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleLike}
      disabled={isProcessing}
      className={`h-7 px-2 text-xs transition-all duration-200 ${
        optimisticLikes.isLiked
          ? "text-red-600 hover:text-red-700"
          : "text-gray-500 hover:text-gray-700"
      } ${
        isProcessing ? "opacity-70 cursor-wait" : ""
      }`}
    >
      <Heart
        className={`w-3 h-3 mr-1 ${optimisticLikes.isLiked ? "fill-red-600" : ""} ${
          isProcessing ? "animate-pulse" : ""
        }`}
      />
      {optimisticLikes.count > 0 && (
        <span className="ml-1">{optimisticLikes.count}</span>
      )}
      좋아요
    </Button>
  );
};

export default CommentLikeButton;