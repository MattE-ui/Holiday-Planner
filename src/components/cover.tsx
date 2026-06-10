import { cn } from "@/lib/utils";

const GRADIENTS = [
  "from-[#1F4E5F] via-[#2E7D8A] to-[#5BA7A0]",
  "from-[#1d6a6a] via-[#2f8f8f] to-[#7cc0b4]",
  "from-[#234e6e] via-[#3a7ca5] to-[#79b3c4]",
  "from-[#3a5a40] via-[#588157] to-[#a3b18a]",
  "from-[#6d4b66] via-[#9a6a8f] to-[#c9a0c0]",
  "from-[#9a5b00] via-[#c97f1a] to-[#e6b566]",
];

function hashIndex(seed: string, mod: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h % mod;
}

/**
 * A deterministic gradient cover used wherever a photo hasn't been added yet.
 * If `image` is supplied it's used instead.
 */
export function Cover({
  seed,
  image,
  label,
  className,
  children,
}: {
  seed: string;
  image?: string;
  label?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const gradient = GRADIENTS[hashIndex(seed, GRADIENTS.length)];
  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden bg-gradient-to-br text-white",
        gradient,
        className,
      )}
      style={
        image
          ? { backgroundImage: `url(${image})`, backgroundSize: "cover", backgroundPosition: "center" }
          : undefined
      }
    >
      {!image && label && (
        <span className="pointer-events-none absolute right-4 top-3 text-3xl opacity-90" aria-hidden>
          {label}
        </span>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/35 to-transparent" />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
}
