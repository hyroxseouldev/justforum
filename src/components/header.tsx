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
    <div className="flex justify-between items-center p-4 border-b fixed top-0 left-0 right-0 z-50 bg-background">
      <Link href="/">
        <h1 className="text-2xl font-bold">JustForum</h1>
      </Link>
      <div>
        <SignedOut>
          <SignInButton mode="modal">
            <Button>로그인</Button>
          </SignInButton>
        </SignedOut>
        <SignedIn>
          <div className="flex items-center gap-2">
            <UserButton />
            <SignOutButton>
              <Button>로그아웃</Button>
            </SignOutButton>
          </div>
        </SignedIn>
      </div>
    </div>
  );
};

export default Header;
