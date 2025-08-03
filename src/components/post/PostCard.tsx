import React, { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import { Eye, MessageCircle, MoreHorizontal, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "@/convex/_generated/dataModel";
import LikeButton from "@/components/post/LikeButton";
import SubjectBadge from "@/components/post/SubjectBadge";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

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
  author,
  subject,
  likeCount,
  detail = false,
  commentCount = 0,
  isLiked,
}) => {
  const { user } = useUser();
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const deletePost = useMutation(api.posts.remove);

  const formattedDate = formatDistanceToNow(new Date(_creationTime), {
    addSuffix: true,
    locale: ko,
  });

  // Check if current user is the author of this post
  const isAuthor =
    user?.fullName === author.name ||
    user?.firstName + " " + user?.lastName === author.name;

  const stripHtml = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  const truncateContent = (text: string, maxLength: number = 100) => {
    const plainText = stripHtml(text);
    return plainText.length > maxLength
      ? plainText.substring(0, maxLength) + "..."
      : plainText;
  };

  const handleDelete = async () => {
    if (
      !confirm(
        "정말로 이 게시글을 삭제하시겠습니까?\n삭제된 게시글은 복구할 수 없습니다."
      )
    ) {
      return;
    }

    try {
      setIsDeleting(true);
      await deletePost({ postId: _id });
      toast.success("게시글이 삭제되었습니다.");
      router.push("/"); // Redirect to home page after deletion
    } catch (error) {
      toast.error("게시글 삭제 중 오류가 발생했습니다.");
      console.error("Delete post error:", error);
    } finally {
      setIsDeleting(false);
    }
  };


  return (
    <>
      {detail ? (
        <div>
          <Card
            className={`border-none shadow-none w-full bg-white border-gray-200 rounded-lg p-6 mb-4 transition-shadow duration-200 ${
              !detail ? "hover:shadow-md cursor-pointer" : ""
            }`}
          >
            <CardHeader className="p-0 pb-3 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SubjectBadge subjectId={subject._id as Id<"subjects">} />
                </div>

                {/* Delete button - only show in detail mode for post author */}
                {detail && isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        disabled={isDeleting}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        게시글 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
                  <span className="font-medium text-gray-900">
                    {author.name}
                  </span>
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
        </div>
      ) : (
        <Link href={`/${_id}`}>
          <Card
            className={`border-none shadow-none w-full bg-white border-gray-200 rounded-lg p-6 mb-4 transition-shadow duration-200 ${
              !detail ? "hover:shadow-md cursor-pointer" : ""
            }`}
          >
            <CardHeader className="p-0 pb-3 border-b">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <SubjectBadge subjectId={subject._id as Id<"subjects">} />
                </div>

                {/* Delete button - only show in detail mode for post author */}
                {detail && isAuthor && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600"
                        disabled={isDeleting}
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-40">
                      <DropdownMenuItem
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="text-red-600 focus:text-red-600"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        게시글 삭제
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
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
                  <span className="font-medium text-gray-900">
                    {author.name}
                  </span>
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
        </Link>
      )}
    </>
  );
};

export default PostCard;
