import { cn } from "@/lib/utils";

export function CureBoardLogo({
  className,
  size = 28,
  withWordmark = true,
  tone = "default",
}: {
  className?: string;
  size?: number;
  withWordmark?: boolean;
  tone?: "default" | "light";
}) {
  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="2" width="36" height="36" rx="9" fill="#2563eb" />
        <path
          d="M13 20.5L17 24.5L27 14"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="20" cy="32" r="2" fill="#0ea5e9" />
      </svg>
      {withWordmark && (
        <span
          className={cn(
            "text-lg font-semibold tracking-tight",
            tone === "light" ? "text-white" : "text-foreground"
          )}
        >
          Cure<span className="text-primary">Board</span>
        </span>
      )}
    </div>
  );
}
