"use client";

import { useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";

interface ViewIncrementerProps {
  postId: Id<"posts">;
}

const ViewIncrementer: React.FC<ViewIncrementerProps> = ({ postId }) => {
  const incrementViews = useMutation(api.posts.incrementViews);

  useEffect(() => {
    // 컴포넌트 마운트 시 조회수 증가
    const handleViewIncrement = async () => {
      try {
        await incrementViews({ postId });
      } catch (error) {
        // 조회수 증가 실패는 사용자에게 표시하지 않음 (백그라운드 작업)
        console.error("Failed to increment views:", error);
      }
    };

    // 페이지 로드 후 약간의 지연을 두고 조회수 증가
    // 이는 봇이나 빠른 페이지 이동을 방지하기 위함
    const timer = setTimeout(handleViewIncrement, 1000);

    return () => clearTimeout(timer);
  }, [postId, incrementViews]);

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null;
};

export default ViewIncrementer;