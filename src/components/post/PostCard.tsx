import React from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SUBJECT_INFO } from "@/lib/subjects";
import { Id } from "@/convex/_generated/dataModel";
import LikeButton from "@/components/post/LikeButton";
import SubjectBadge from "@/components/post/SubjectBadge";

interface PostCardProps {
  _id: Id<"posts">;
  _creationTime: number;
  title: string;
  content: string;
  views: number;
  type: "notice" | "general";
  author: {
    _id: Id<"users">;
    name: string;
  };
  subject: {
    _id: Id<"subjects">;
    name: string;
  };
  likeCount: number;
  detail?: boolean;
  commentCount?: number;
  isLiked: boolean;
}

const PostCard: React.FC<PostCardProps> = ({
  _id,
  _creationTime,
  title,
  content,
  views,
  type,
  author,
  subject,
  likeCount,
  detail = false,
  commentCount = 0,
  isLiked,
}) => {
  const subjectInfo = SUBJECT_INFO[subject.name as keyof typeof SUBJECT_INFO];
  const formattedDate = formatDistanceToNow(new Date(_creationTime), {
    addSuffix: true,
    locale: ko,
  });

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const truncateContent = (text: string, maxLength: number = 100) => {
    const plainText = stripHtml(text);
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  return (
    <Card
      className={`border-none shadow-none w-full bg-white border-gray-200 rounded-lg p-6 mb-4 transition-shadow duration-200 ${
        !detail ? "hover:shadow-md cursor-pointer" : ""
      }`}
    >
      <CardHeader className="p-0 pb-3 border-b">
        <div className="flex items-center gap-2 mb-3">
          <SubjectBadge subjectId={subject._id as Id<"subjects">} />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 leading-7">
          {title}
        </h2>
      </CardHeader>

      <CardContent className="p-0">
        <div className="mb-4">
          {detail ? (
            <div
              className="prose prose-sm max-w-none text-gray-700"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-gray-700 text-base leading-6">
              {truncateContent(content)}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="font-medium text-gray-900">{author.name}</span>
            <span>{formattedDate}</span>
          </div>

          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{views}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="w-4 h-4" />
              <span>{commentCount}</span>
            </div>
            <LikeButton
              postId={_id}
              initialLikes={likeCount}
              isLiked={isLiked}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PostCard;
