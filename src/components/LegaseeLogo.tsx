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
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const strokeColor = inverted ? "#F8F7F3" : "#202020";
  const accentColor = "#B6A995";

  const content = (
    <span className="inline-flex items-center gap-2.5 select-none">
      {/* Preserved-memory film frame & timeline emblem */}
      <svg
        viewBox="0 0 36 36"
        width={size === "lg" ? 36 : size === "sm" ? 24 : 28}
        height={size === "lg" ? 36 : size === "sm" ? 24 : 28}
        fill="none"
        className={`${iconSizes[size]} shrink-0`}
        aria-hidden="true"
      >
        <rect
          x="3"
          y="6"
          width="30"
          height="24"
          rx="3.5"
          stroke={strokeColor}
          strokeWidth="1.6"
        />
        <line
          x1="10.5"
          y1="6"
          x2="10.5"
          y2="30"
          stroke={accentColor}
          strokeWidth="1.3"
        />
        <line
          x1="25.5"
          y1="6"
          x2="25.5"
          y2="30"
          stroke={accentColor}
          strokeWidth="1.3"
        />
        {/* Subtle timeline horizon + preserved moment */}
        <line
          x1="13"
          y1="18"
          x2="23"
          y2="18"
          stroke={accentColor}
          strokeWidth="1.2"
          strokeLinecap="round"
        />
        <circle cx="18" cy="18" r="2.6" fill={strokeColor} />
      </svg>
      <span
        className={`font-editorial font-semibold uppercase tracking-[0.18em] ${textSizes[size]} ${
          inverted ? "text-[#F8F7F3]" : "text-[#202020]"
        }`}
      >
        JUKIRA
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
