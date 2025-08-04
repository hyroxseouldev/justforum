"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
  SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchFiltersProps {
  currentSearchType: string;
  currentSearch?: string;
  currentType?: string;
}

export function SearchFilters({
  currentSearchType,
  currentSearch = "",
  currentType,
}: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [searchType, setSearchType] = useState(currentSearchType);
  const [searchValue, setSearchValue] = useState(currentSearch);

  const handleSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);

      if (searchValue.trim()) {
        params.set("search", searchValue.trim());
        params.set("searchType", searchType);
      } else {
        params.delete("search");
        params.delete("searchType");
      }

      // Reset to first page when searching
      params.delete("page");

      // Preserve type filter
      if (currentType) {
        params.set("type", currentType);
      }

      router.push(`/?${params.toString()}`);
    });
  };

  const handleClearSearch = () => {
    startTransition(() => {
      const params = new URLSearchParams(searchParams);
      params.delete("search");
      params.delete("searchType");
      params.delete("page");

      // Preserve type filter
      if (currentType) {
        params.set("type", currentType);
      }

      setSearchValue("");
      router.push(`/?${params.toString()}`);
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full">
      <Select value={searchType} onValueChange={setSearchType}>
        <SelectTrigger className="w-full sm:w-[100px] lg:w-[120px]">
          <SelectValue placeholder="검색 유형" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="title">제목</SelectItem>
          <SelectItem value="content">내용</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex gap-1 w-full sm:w-auto">
        <Input
          placeholder="검색어 입력"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-1 sm:w-[150px] lg:w-[200px] min-w-0"
          disabled={isPending}
        />

        <Button
          size="sm"
          onClick={handleSearch}
          disabled={isPending}
          variant="outline"
          className="flex-shrink-0"
        >
          <Search className="w-4 h-4" />
        </Button>

        {currentSearch && (
          <Button
            size="sm"
            onClick={handleClearSearch}
            disabled={isPending}
            variant="ghost"
            className="flex-shrink-0 text-xs px-2"
          >
            초기화
          </Button>
        )}
      </div>
    </div>
  );
}
