type LogoProps = {
  size?: number;
};

export function Logo({ size = 44 }: LogoProps) {
  return (
    <span className="logo" aria-label="MadeByYou">
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        role="img"
        aria-hidden="true"
        focusable="false"
      >
        <rect x="4" y="4" width="56" height="56" rx="16" fill="#fff" />
        <path
          d="M20 44V22l12 13 12-13v22"
          fill="none"
          stroke="#56b6f7"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="32" cy="15" r="4" fill="#f7c948" />
      </svg>
      <span className="logo__word">
        Made<span className="logo__word--accent">By</span>You
      </span>
    </span>
  );
}
