import React from "react";
import { SUBJECT_INFO, getSubjectById } from "@/lib/subjects";
import { Id } from "@/convex/_generated/dataModel";

interface SubjectBadgeProps {
  subjectId: Id<"subjects">;
  className?: string;
}

const SubjectBadge: React.FC<SubjectBadgeProps> = ({
  subjectId,
  className = "",
}) => {
  const subject = getSubjectById(subjectId);

  if (!subject) {
    return null;
  }

  const info = SUBJECT_INFO[subject];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${info.bgColor} ${info.color} ${info.borderColor} ${className}`}
    >
      {info.label}
    </span>
  );
};

export default SubjectBadge;
