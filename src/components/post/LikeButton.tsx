"use client";

import React, { useOptimistic, startTransition, useState, useRef, useEffect } from "react";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

interface LikeButtonProps {
  postId: Id<"posts">;
  initialLikes: number;
  variant?: "default" | "compact";
  isLiked: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({
  postId,
  initialLikes,
  variant = "default",
  isLiked,
}) => {
  const { user } = useUser();
  const [isProcessing, setIsProcessing] = useState(false);
  const pendingActionRef = useRef<boolean>(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleLike = useMutation(api.likes.toggleLike);

  // Optimistic updates for better UX
  const [optimisticLikes, setOptimisticLikes] = useOptimistic(
    { count: initialLikes, isLiked: isLiked },
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
  }, [initialLikes, isLiked, isProcessing, setOptimisticLikes]);

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
          await toggleLike({ postId });
        } catch (error) {
          // Revert optimistic update on error
          startTransition(() => {
            setOptimisticLikes(!newLikedState);
          });
          toast.error("좋아요 처리 중 오류가 발생했습니다.");
          console.error("Like error:", error);
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
      console.error("Like error:", error);
    }
  };

  if (variant === "compact") {
    return (
      <button
        onClick={handleLike}
        disabled={isProcessing}
        className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
          optimisticLikes.isLiked
            ? "bg-red-50 text-red-600 border border-red-200"
            : "bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100"
        } ${
          isProcessing ? "opacity-70 cursor-wait" : "cursor-pointer"
        }`}
      >
        <Heart
          className={`w-3 h-3 ${optimisticLikes.isLiked ? "fill-red-600" : ""} ${
            isProcessing ? "animate-pulse" : ""
          }`}
        />
        <span>{optimisticLikes.count}</span>
      </button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isProcessing}
      className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 ${
        optimisticLikes.isLiked
          ? "bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
          : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
      } ${
        isProcessing ? "opacity-70 cursor-wait" : ""
      }`}
    >
      <Heart
        className={`w-4 h-4 ${optimisticLikes.isLiked ? "fill-red-600" : ""} ${
          isProcessing ? "animate-pulse" : ""
        }`}
      />
      <span>{optimisticLikes.count}</span>
    </Button>
  );
};

export default LikeButton;
