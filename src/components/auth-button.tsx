"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User, PlusCircle } from "lucide-react";
import Link from "next/link";

export function AuthButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (!session) {
    return (
      <Button variant="default" size="sm" onClick={() => signIn()}>
        Sign In
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/review/new">
        <Button variant="default" size="sm">
          <PlusCircle className="mr-1 size-4" />
          New Review
        </Button>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger className="relative size-8 rounded-full cursor-pointer outline-none">
          <Avatar className="size-8">
            <AvatarImage
              src={session.user?.image ?? ""}
              alt={session.user?.name ?? "User"}
            />
            <AvatarFallback>
              {session.user?.name?.charAt(0)?.toUpperCase() ?? "U"}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem>
            <Link href={`/user/${session.user?.id}`} className="flex items-center w-full">
              <User className="mr-2 size-4" />
              Profile
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 size-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
