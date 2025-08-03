import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import { SearchFilters } from "@/components/post/SearchFilters";
import { fetchQuery } from "convex/nextjs";
import { SUBJECT_IDS, SUBJECTS } from "@/lib/subjects";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
  PaginationLink,
} from "@/components/ui/pagination";
import PostList from "@/components/post/PostList";
import { api } from "@/convex/_generated/api";

interface HomeProps {
  searchParams?: {
    type?: string;
    search?: string;
    searchType?: "title" | "content";
    page?: string;
  };
}

export default async function Home({ searchParams }: HomeProps) {
  const currentType = searchParams?.type;
  const searchQuery = searchParams?.search;
  const searchType = searchParams?.searchType || "title";
  const currentPage = parseInt(searchParams?.page || "1");
  const posts = await fetchQuery(api.posts.list, {
    type: "general",
    subjectId:
      currentType === "question"
        ? SUBJECT_IDS[SUBJECTS.QUESTION]
        : currentType === "feedback"
        ? SUBJECT_IDS[SUBJECTS.FEEDBACK]
        : undefined,
    paginationOpts: {
      numItems: 10,
      cursor: null,
    },
  });
  const totalCount = posts.totalCount;
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
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
            <Tabs value={currentType || "all"} className="">
              <TabsList className="flex justify-center">
                <Link href={`/`}>
                  <TabsTrigger value="all" className="">
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

            <SearchFilters
              currentSearchType={searchType}
              currentSearch={searchQuery}
              currentType={currentType}
            />
          </div>
          {/* Post List with Pagination */}
          <PostList posts={posts.page} />

          <Pagination>
            <PaginationContent>
              {/* Previous Button */}
              <PaginationItem>
                <PaginationPrevious
                  href={
                    currentPage > 1
                      ? `/?${new URLSearchParams({
                          ...(currentType && { type: currentType }),
                          ...(searchQuery && { search: searchQuery }),
                          ...(searchType && { searchType }),
                          page: (currentPage - 1).toString(),
                        }).toString()}`
                      : undefined
                  }
                  className={
                    currentPage <= 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {/* First Page */}
              <PaginationItem>
                <PaginationLink
                  href={`/?${new URLSearchParams({
                    ...(currentType && { type: currentType }),
                    ...(searchQuery && { search: searchQuery }),
                    ...(searchType && { searchType }),
                    page: "1",
                  }).toString()}`}
                  isActive={currentPage === 1}
                >
                  1
                </PaginationLink>
              </PaginationItem>

              {/* Ellipsis after first page if needed */}
              {currentPage > 4 && totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Middle pages */}
              {Array.from({ length: Math.min(3, totalPages - 1) }, (_, i) => {
                const pageNum = currentPage - 1 + i;
                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink
                        href={`/?${new URLSearchParams({
                          ...(currentType && { type: currentType }),
                          ...(searchQuery && { search: searchQuery }),
                          ...(searchType && { searchType }),
                          page: pageNum.toString(),
                        }).toString()}`}
                        isActive={currentPage === pageNum}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                }
                return null;
              })}

              {/* Ellipsis before last page if needed */}
              {currentPage < totalPages - 3 && totalPages > 5 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}

              {/* Last Page (if not already shown) */}
              {totalPages > 1 && (
                <PaginationItem>
                  <PaginationLink
                    href={`/?${new URLSearchParams({
                      ...(currentType && { type: currentType }),
                      ...(searchQuery && { search: searchQuery }),
                      ...(searchType && { searchType }),
                      page: totalPages.toString(),
                    }).toString()}`}
                    isActive={currentPage === totalPages}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}

              {/* Next Button */}
              <PaginationItem>
                <PaginationNext
                  href={
                    currentPage < totalPages
                      ? `/?${new URLSearchParams({
                          ...(currentType && { type: currentType }),
                          ...(searchQuery && { search: searchQuery }),
                          ...(searchType && { searchType }),
                          page: (currentPage + 1).toString(),
                        }).toString()}`
                      : undefined
                  }
                  className={
                    currentPage >= totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      </div>
    </div>
  );
}
