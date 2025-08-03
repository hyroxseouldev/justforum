import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationLink,
} from "@/components/ui/pagination";
import { SignedIn } from "@clerk/nextjs";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";

export default async function Home() {
  // Get Post
  const posts = await fetchQuery(api.posts.list, {});
  return (
    <div className="flex flex-col items-center justify-center h-screen pt-20">
      <div className="container max-w-3xl mx-auto">
        <div className="flex flex-col gap-4">
          {/* Title And Create Button */}
          <div className="flex flex-row gap-4 justify-between items-center w-full">
            <h1 className="text-lg font-bold">전체 게시글</h1>

            <SignedIn>
              <Link href="/create">
                <Button>
                  <PlusIcon className="w-4 h-4" />
                  글쓰기
                </Button>
              </Link>
            </SignedIn>
          </div>
          {/* Subject Search Params & Search Input */}
          <div className="flex flex-row gap-4 justify-between items-center w-full">
            <Tabs className="">
              <TabsList className="flex justify-center">
                <Link href={`/`}>
                  <TabsTrigger value="" className="">
                    전체 게시글
                  </TabsTrigger>
                </Link>
                <Link href={`/?type=question`}>
                  <TabsTrigger value="question">질문</TabsTrigger>
                </Link>
                <Link href={`/?type=feedback`}>
                  <TabsTrigger value="feedback">피드백</TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>

            <div className="flex space-x-2">
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="주제 선택" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="title">제목</SelectItem>
                  <SelectItem value="content">내용</SelectItem>
                  <SelectItem value="author">글쓴이</SelectItem>
                </SelectContent>
              </Select>
              <Input placeholder="검색어 입력" />
            </div>
          </div>
          {/* Post List */}
          <div className="">
            {!posts || posts.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-4 min-h-[500px] gap-2">
                <h3>게시글이 없습니다.</h3>
                <p>게시글을 작성해주세요.</p>
                <Link href="/create">
                  <Button>
                    <PlusIcon className="w-4 h-4" />
                    글쓰기
                  </Button>
                </Link>
              </div>
            ) : (
              posts.map((post) => (
                <div key={post._id}>
                  <h3>{post.title}</h3>
                  <p>{post.content}</p>
                </div>
              ))
            )}
          </div>
          {/* Pagination */}
          <div className="">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" />
                </PaginationItem>
                <PaginationItem>
                  <PaginationLink href="#">1</PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
                <PaginationItem>
                  <PaginationNext href="#" />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </div>
  );
}
