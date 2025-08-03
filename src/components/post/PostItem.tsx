import Link from "next/link";
import React from "react";
import SubjectBadge from "./SubjectBadge";
import { Id } from "@/convex/_generated/dataModel";
import { formatTimeAgo } from "@/lib/time";
import { extractPreviewText } from "@/lib/string";

// 타입 정의
export interface PostItemProps {
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
  onClick?: (id: string) => void;
  className?: string;
}

// 포스트 아이템 컴포넌트
export const PostItem: React.FC<PostItemProps> = ({
  _id,
  _creationTime,
  title,
  content,
  views,
  type,
  author,
  subject,
  likeCount,
  onClick,
  className = "",
}) => {
  // 시간 계산
  const timeAgo = formatTimeAgo(_creationTime);

  // TipTap HTML에서 미리보기 텍스트 추출
  const previewText = extractPreviewText(content, 80);

  return (
    <Link
      href={`/${_id}`}
      className={`flex items-start py-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 cursor-pointer ${className}`}
    >
      {/* 왼쪽 카테고리 라벨 */}
      <div className="flex-shrink-0 mr-3">
        <SubjectBadge subjectId={subject._id as Id<"subjects">} />
      </div>

      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 min-w-0">
        {/* 제목과 댓글 수 */}
        <div className="flex items-center mb-1">
          <h3 className="text-sm font-medium text-gray-900 truncate hover:text-blue-600 transition-colors">
            {title}
          </h3>
          {likeCount > 0 && (
            <span className="ml-2 text-xs font-medium text-red-500">
              {likeCount}
            </span>
          )}
        </div>

        {/* 미리보기 텍스트 */}
        <p className="text-xs text-gray-600 truncate mb-2">{previewText}</p>
      </div>

      {/* 오른쪽 메타데이터 */}
      <div className="flex-shrink-0 text-right text-xs text-gray-500 ml-4">
        <div className="mb-1">{author.name}</div>
        <div className="flex items-center justify-end gap-1">
          <span className="flex items-center gap-1">
            <EyeIcon className="w-3 h-3" />
            {views}
          </span>
          <span>{timeAgo}</span>
        </div>
      </div>
    </Link>
  );
};

// 간단한 눈 아이콘 컴포넌트
const EyeIcon: React.FC<{ className?: string }> = ({
  className = "w-4 h-4",
}) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
    />
  </svg>
);

export default PostItem;
