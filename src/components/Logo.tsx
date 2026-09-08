const BRAND = "Power Line Devices";

export default function Logo({ light = false }: { light?: boolean }) {
  const src = light ? "/brand/logo-icon-dark.jpg" : "/brand/logo-icon-light.jpg";

  return (
    <span className="flex items-center gap-2.5">
      <img
        src={src}
        alt=""
        width={40}
        height={40}
        className="h-9 w-9 shrink-0 rounded-md object-contain"
        aria-hidden
      />
      <span className="leading-tight">
        <span className={`block text-[15px] font-bold tracking-tight ${light ? "text-white" : "text-navy"}`}>
          {BRAND}
        </span>
        <span className={`block text-[10px] uppercase tracking-[0.14em] ${light ? "text-white/55" : "text-muted"}`}>
          Admin
        </span>
      </span>
    </span>
  );
}
