import React from "react";
import { SUBJECT_INFO } from "@/lib/subjects";

interface SubjectBadgeProps {
  subjectName: string;
  className?: string;
}

const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subjectName,
  className = "",
}) => {
  // subjectName이 "question" 또는 "feedback"인지 확인
  if (subjectName !== "question" && subjectName !== "feedback") {
    return null;
  }

  const info = SUBJECT_INFO[subjectName as keyof typeof SUBJECT_INFO];

  if (!info) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.bgColor} ${info.color} ${info.borderColor} ${className}`}
    >
      {info.label}
    </span>
  );
};

export default SubjectBadge;
