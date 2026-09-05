import { ChevronLeft, ChevronRight } from "lucide-react";

export default function Pagination({
  page,
  totalPages,
  total,
  onChange,
  label = "items",
  className = "",
}: {
  page: number;
  totalPages: number;
  total: number;
  onChange: (page: number) => void;
  label?: string;
  className?: string;
}) {
  if (totalPages <= 1) return null;

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 ${className}`}
    >
      <p className="text-sm text-muted">
        {total} {label} · Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium hover:border-brand/50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft size={15} /> Prev
        </button>
        <span className="text-sm text-muted tabular-nums">{page}</span>
        <button
          type="button"
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          className="inline-flex items-center gap-1 rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium hover:border-brand/50 hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}