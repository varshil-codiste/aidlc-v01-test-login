interface Props {
  'data-testid'?: string;
}

export function BrandLogo(props: Props) {
  return (
    // Logo is a wordmark; using SVG so we don't ship a binary asset.
    <svg
      role="img"
      aria-label="Zone POS"
      viewBox="0 0 313 85"
      width="160"
      height="44"
      className="text-neutral-900"
      {...props}
    >
      <text
        x="50%"
        y="60%"
        textAnchor="middle"
        fontFamily="Inter, system-ui, sans-serif"
        fontSize="48"
        fontWeight="800"
        fill="currentColor"
      >
        zone
      </text>
    </svg>
  );
}
