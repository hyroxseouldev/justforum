import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignOutButton,
  UserButton,
} from "@clerk/nextjs";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const Header = () => {
  return (
    <div className="flex justify-between items-center px-4 py-3 border-b fixed top-0 left-0 right-0 z-50 bg-background">
      <Link href="/">
        <h1 className="text-xl sm:text-2xl font-bold truncate">JustForum</h1>
      </Link>
      <div className="flex-shrink-0">
        <SignedOut>
          <SignInButton mode="modal" forceRedirectUrl="/">
            <Button size="sm" className="text-sm px-3 py-1.5">로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-1 sm:gap-2">
            <UserButton />
            <SignOutButton>
              <Button size="sm" className="text-sm px-3 py-1.5 hidden sm:inline-flex">로그아웃</Button>
            </SignOutButton>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Header;
