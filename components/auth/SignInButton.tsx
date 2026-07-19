"use client";

import { cloneElement, isValidElement } from "react";
import { usePathname, useRouter } from "next/navigation";

interface SignInButtonProps {
  children?: React.ReactNode;
  /** Path to return to after signing in; defaults to the current page. */
  forceRedirectUrl?: string;
  /** Accepted for Clerk API compatibility; sign-in always opens as a page. */
  mode?: "modal" | "redirect";
}

export function SignInButton({ children, forceRedirectUrl }: SignInButtonProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleClick = () => {
    const redirectUrl = forceRedirectUrl ?? pathname ?? "/";
    router.push(`/sign-in?redirect_url=${encodeURIComponent(redirectUrl)}`);
  };

  if (isValidElement(children)) {
    return cloneElement(children as React.ReactElement<{ onClick?: () => void }>, {
      onClick: handleClick,
    });
  }

  return (
    <button onClick={handleClick} className="font-semibold hover:underline">
      Sign in
    </button>
  );
}
