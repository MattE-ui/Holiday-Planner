"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/** Primary pill submit button with a pending spinner (uses form status). */
export function SubmitButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={cn(
        "inline-flex h-[50px] items-center justify-center gap-2 rounded-full bg-primary px-7 text-[15px] font-bold text-primary-foreground shadow-lift transition-transform duration-300 hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:translate-y-0 disabled:opacity-70",
        className,
      )}
    >
      {pending && <Loader2 className="h-[17px] w-[17px] animate-spin" aria-hidden />}
      {children}
    </button>
  );
}
