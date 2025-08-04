import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import { PlusIcon } from "lucide-react";
import { SignedIn } from "@clerk/nextjs";
import { SearchFilters } from "@/components/post/SearchFilters";
import { fetchQuery } from "convex/nextjs";
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
  searchParams?: Promise<{
    type?: string;
    search?: string;
    searchType?: "title" | "content";
    page?: string;
  }>;
}

export default async function Home({ searchParams }: HomeProps) {
  const params = await searchParams;
  const currentType = params?.type;
  const searchQuery = params?.search;
  const searchType = params?.searchType || "title";
  const currentPage = parseInt(params?.page || "1");
  const posts = await fetchQuery(api.posts.listWithSubjectFilter, {
    type: "general",
    subject:
      currentType === "question"
        ? "question"
        : currentType === "feedback"
        ? "feedback"
        : undefined,
    paginationOpts: {
      numItems: 10,
      cursor: null,
    },
  });
  const totalCount = posts.totalCount;
  const totalPages = Math.ceil(totalCount / 10);

  return (
    <div className="min-h-screen pt-4">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="flex flex-col gap-4">
          {/* Title And Create Button */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-start sm:items-center">
            <h1 className="text-lg sm:text-xl font-bold flex-shrink-0">
              전체 게시글
            </h1>

            <SignedIn>
              <Link href="/create" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto">
                  <PlusIcon className="w-4 h-4" />
                  글쓰기
                </Button>
              </Link>
            </SignedIn>
          </div>
          {/* Subject Search Params & Search Input */}
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center">
            <Tabs value={currentType || "all"} className="flex-shrink-0">
              <TabsList className="grid w-full grid-cols-3 lg:flex lg:w-auto">
                <Link href={`/`}>
                  <TabsTrigger value="all" className="text-xs sm:text-sm">
                    전체
                  </TabsTrigger>
                </Link>
                <Link href={`/?type=question`}>
                  <TabsTrigger value="question" className="text-xs sm:text-sm">
                    질문
                  </TabsTrigger>
                </Link>
                <Link href={`/?type=feedback`}>
                  <TabsTrigger value="feedback" className="text-xs sm:text-sm">
                    피드백
                  </TabsTrigger>
                </Link>
              </TabsList>
            </Tabs>

            <div className="w-full lg:w-auto">
              <SearchFilters
                currentSearchType={searchType}
                currentSearch={searchQuery}
                currentType={currentType}
              />
            </div>
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
