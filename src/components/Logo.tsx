const BRAND = "Power Line Devices";

export default function Logo({
  light = false,
  compact = false,
}: {
  light?: boolean;
  compact?: boolean;
}) {
  const src = light
    ? compact
      ? "/brand/logo-icon-dark.jpg"
      : "/brand/logo-full-dark.jpg"
    : compact
      ? "/brand/logo-icon-light.jpg"
      : "/brand/logo-full-light.jpg";

  return (
    <img
      src={src}
      alt={BRAND}
      className={
        compact
          ? "h-9 w-9 object-contain"
          : "h-10 w-auto max-w-[180px] object-contain object-left"
      }
    />
  );
}
