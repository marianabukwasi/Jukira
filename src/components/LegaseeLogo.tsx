import Link from "next/link";

interface LegaseeLogoProps {
  href?: string;
  size?: "sm" | "md" | "lg";
  inverted?: boolean;
}

export function LegaseeLogo({
  href = "/",
  size = "md",
  inverted = false,
}: LegaseeLogoProps) {
  const iconSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };
  const textSizes = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  const strokeColor = inverted ? "#F8F7F3" : "#202020";
  const accentColor = "#B6A995";

  const content = (
    <span className="inline-flex items-center gap-2.5 select-none">
      <svg
        viewBox="0 0 32 32"
        width={size === "lg" ? 36 : size === "sm" ? 24 : 28}
        height={size === "lg" ? 36 : size === "sm" ? 24 : 28}
        fill="none"
        className={`${iconSizes[size]} shrink-0`}
        aria-hidden="true"
      >
        <rect
          x="3"
          y="6"
          width="26"
          height="20"
          rx="3"
          stroke={strokeColor}
          strokeWidth="1.6"
        />
        <line
          x1="10"
          y1="6"
          x2="10"
          y2="26"
          stroke={accentColor}
          strokeWidth="1.3"
        />
        <line
          x1="22"
          y1="6"
          x2="22"
          y2="26"
          stroke={accentColor}
          strokeWidth="1.3"
        />
        <circle cx="16" cy="16" r="2.4" fill={strokeColor} />
      </svg>
      <span
        className={`font-editorial font-medium tracking-tight ${textSizes[size]} ${
          inverted ? "text-[#F8F7F3]" : "text-[#202020]"
        }`}
      >
        Jukira
      </span>
    </span>
  );

  if (!href) return content;

  return (
    <Link
      href={href}
      className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B6A995] rounded-sm"
    >
      {content}
    </Link>
  );
}
