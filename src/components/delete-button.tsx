"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Quiet destructive button: asks for confirmation, then runs the bound server
 * action. Used for trips, locations and stays.
 */
export function DeleteButton({
  action,
  confirmText,
  children,
  className,
}: {
  action: () => Promise<void>;
  confirmText: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirmText)) startTransition(() => action());
      }}
      className={cn(
        "inline-flex h-10 items-center gap-1.5 rounded-full border border-danger/40 px-4 text-[13.5px] font-semibold text-danger transition-colors hover:bg-danger/5 disabled:opacity-60",
        className,
      )}
    >
      {pending ? (
        <Loader2 className="h-[15px] w-[15px] animate-spin" aria-hidden />
      ) : (
        <Trash2 className="h-[15px] w-[15px]" aria-hidden />
      )}
      {children}
    </button>
  );
}
