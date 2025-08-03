"use client";

import React, { useEffect, useRef } from "react";

interface PreventFormProps {
  children: React.ReactNode;
  hasUnsavedChanges: boolean;
  isSubmitting?: boolean;
  message?: string;
}

export const PreventForm: React.FC<PreventFormProps> = ({
  children,
  hasUnsavedChanges,
  isSubmitting = false,
  message = "작성 중인 내용이 있습니다. 정말로 페이지를 떠나시겠습니까?",
}) => {
  const isInitialized = useRef(false);

  // 페이지 이탈 방지 (브라우저 닫기, 새로고침)
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        e.preventDefault();
        e.returnValue = message;
        return message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [hasUnsavedChanges, isSubmitting, message]);

  // 뒤로가기 방지
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      if (hasUnsavedChanges && !isSubmitting) {
        const confirmed = window.confirm(message);
        if (!confirmed) {
          // 뒤로가기를 방지하고 현재 페이지에 머무름
          window.history.pushState(null, "", window.location.href);
        }
        // confirmed가 true면 자연스럽게 뒤로가기 진행
      }
    };

    // 초기 히스토리 상태 설정 (한 번만)
    if (!isInitialized.current) {
      window.history.pushState(null, "", window.location.href);
      isInitialized.current = true;
    }

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [hasUnsavedChanges, isSubmitting, message]);

  return <>{children}</>;
};

export default PreventForm;
