import { type ChangeEvent, type DragEvent, useRef, useState } from "react";
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  ListChecks,
  Loader2,
  RefreshCw,
  UploadCloud,
  X,
  XCircle,
} from "lucide-react";
import { useImportProductsMutation } from "@/store/adminApi";

const EXPECTED_COLUMNS: Array<[csvName: string, field: string]> = [
  ["id", "id"],
  ["title", "title"],
  ["description", "description"],
  ["link", "link"],
  ["sale_price", "salePrice"],
  ["price", "price"],
  ["brand", "brand"],
  ["condition", "condition"],
  ["gtin", "gtin"],
  ["image_link", "imageLink"],
  ["mpn", "mpn"],
  ["product_type", "productType"],
  ["quantity", "quantity"],
  ["shipping", "shipping"],
  ["tax", "tax"],
  ["availablity", "availability"],
  ["google_product", "googleProductCategory"],
  ["shipping_weight", "shippingWeight"],
  ["custom_label_0", "customLabel0"],
];

const REQUIRED_FIELDS = ["id", "title"];
const OPTIONAL_FIELDS = EXPECTED_COLUMNS.map(([, field]) => field).filter(
  (f) => !REQUIRED_FIELDS.includes(f),
);

const ALIASES: Record<string, string> = {
  availablity: "availability",
  available: "availability",
  google_product: "googleProductCategory",
  "google product category": "googleProductCategory",
  brandname: "brand",
  "brand name": "brand",
  producttype: "productType",
  "product type": "productType",
  saleprice: "salePrice",
};

function normalizeHeader(header: string) {
  const raw = header.trim().toLowerCase();
  const snake = raw.replace(/\s+/g, "_");
  const mapped = ALIASES[raw] ?? ALIASES[snake] ?? snake;
  return mapped.replace(/-/g, "").replace(/_([a-z0-9])/g, (_, c) => c.toUpperCase());
}

function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && text[i + 1] === "\n") i++;
      row.push(field);
      field = "";
      if (row.some((cell) => cell.trim() !== "")) rows.push(row);
      row = [];
    } else {
      field += ch;
    }
  }
  if (field !== "" || row.length > 0) {
    row.push(field);
    if (row.some((cell) => cell.trim() !== "")) rows.push(row);
  }
  return rows;
}

const SAMPLE_CSV = `id,title,description,link,sale_price,price,brand,condition,gtin,image_link,mpn,product_type,quantity,shipping,tax,availablity,google_product,shipping_weight,custom_label_0
SG350-10,"Cisco 10-port Switch, basic",Keep descriptions with commas inside quotes.,https://example.com/p/1,,189.99,Cisco,new,00166298974216,https://example.com/img/1.jpg,SG350-10-K9,"Electronics > Networking",14,"0 USD","US:0.07",in stock,"Electronics > Computers & Accessories",3.5,Enterprise
005YPM,"Refurb Dell 1TB Enterprise Drive",,https://example.com/p/2,180,200,Dell,refurbished,00888357000523,https://example.com/img/2.jpg,005YPM,"Hardware > Storage",8,,US:0,in stock,"Electronics > Components",1,Enterprise`;

function downloadSample() {
  const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "products-import.csv";
  anchor.click();
  URL.revokeObjectURL(url);
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

type CsvInfo = {
  fileName: string;
  fileSize: number;
  importRows: Record<string, unknown>[];
  skipped: number;
  missingColumns: string[];
  header: string[];
  preview: string[][];
};

type ImportResult = {
  created: number;
  updated: number;
  errors: Array<{ sku: string; error: string }>;
};

export default function ImportPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [csvInfo, setCsvInfo] = useState<CsvInfo | null>(null);
  const [error, setError] = useState<string>("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [importProducts, { isLoading }] = useImportProductsMutation();

  function acceptFile(file: File | undefined | null) {
    if (!file) return;
    setError("");
    setResult(null);

    const isCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel";
    if (!isCsv) {
      setError(`${file.name} doesn't look like a CSV file. Please pick a .csv file.`);
      return;
    }

    void file.text().then((text) => {
      const parsed = parseCsv(text);
      if (parsed.length < 2) {
        setError("CSV file looks empty — expected a header row plus data rows.");
        return;
      }

      const headerRow = parsed[0];
      const columns = headerRow.map(normalizeHeader);
      const indexOf = (field: string) => {
        const i = columns.indexOf(field);
        return i >= 0 ? i : undefined;
      };

      const idIdx = indexOf("id");
      const titleIdx = indexOf("title");
      if (idIdx == null || titleIdx == null) {
        setError("Missing required columns: id, title.");
        return;
      }

      const importRows: Record<string, unknown>[] = [];
      let skipped = 0;

      for (let r = 1; r < parsed.length; r++) {
        const cells = parsed[r];
        const get = (field: string) => {
          const i = indexOf(field);
          if (i == null || i >= cells.length) return undefined;
          return cells[i].trim();
        };

        const id = get("id");
        const title = get("title");
        if (!id || !title) {
          skipped++;
          continue;
        }

        importRows.push({
          id,
          title,
          description: get("description"),
          link: get("link"),
          salePrice: get("salePrice"),
          price: get("price"),
          brand: get("brand"),
          condition: get("condition"),
          gtin: get("gtin"),
          imageLink: get("imageLink"),
          mpn: get("mpn"),
          productType: get("productType"),
          quantity: get("quantity"),
          shipping: get("shipping"),
          tax: get("tax"),
          availability: get("availability"),
          googleProductCategory: get("googleProductCategory"),
          shippingWeight: get("shippingWeight"),
          customLabel0: get("customLabel0"),
        });
      }

      setCsvInfo({
        fileName: file.name,
        fileSize: file.size,
        importRows,
        skipped,
        missingColumns: OPTIONAL_FIELDS.filter((field) => !columns.includes(field)),
        header: headerRow,
        preview: parsed.slice(1, Math.min(parsed.length, 6)),
      });
    });
  }

  function resetSelection() {
    setCsvInfo(null);
    setError("");
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    acceptFile(event.target.files?.[0]);
  }

  function onDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(true);
  }

  function onDragLeave() {
    setDragOver(false);
  }

  function onDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragOver(false);
    acceptFile(event.dataTransfer.files?.[0]);
  }

  async function runImport() {
    if (!csvInfo) return;
    setError("");
    setResult(null);
    try {
      const data = await importProducts(csvInfo.importRows).unwrap();
      setResult(data);
    } catch {
      setError("Import failed. Check CSV format and API connection.");
    }
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy">Bulk upload products</h1>
          <p className="mt-1 max-w-2xl text-sm leading-6 text-muted">
            Upload a Google Shopping feed CSV. New products are created and matching{" "}
            <code className="rounded bg-brand-soft px-1 py-0.5 font-mono text-[12px] text-brand">
              id
            </code>{" "}
            SKUs are updated. Missing brands &amp; categories are auto-created from{" "}
            <code className="rounded bg-brand-soft px-1 py-0.5 font-mono text-[12px] text-brand">
              brand
            </code>{" "}
            and{" "}
            <code className="rounded bg-brand-soft px-1 py-0.5 font-mono text-[12px] text-brand">
              product_type
            </code>
            .
          </p>
        </div>
        <button
          type="button"
          onClick={downloadSample}
          className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm transition hover:border-brand hover:text-brand"
        >
          <Download size={16} />
          Download sample CSV
        </button>
      </div>

      <section
        className={`mt-6 rounded-2xl bg-white ring-1 ring-line transition ${dragOver ? "shadow-lg" : ""}`}
      >
        {!csvInfo ? (
          <div
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`grid min-h-72 cursor-pointer place-items-center rounded-2xl border-2 border-dashed p-8 text-center transition ${
              dragOver
                ? "border-brand bg-brand-soft"
                : "border-line bg-page/60 hover:border-brand/50 hover:bg-brand-soft/50"
            }`}
          >
            <div className="max-w-md">
              <div
                className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl transition ${
                  dragOver ? "bg-brand text-white" : "bg-brand-soft text-brand"
                }`}
              >
                <UploadCloud size={30} />
              </div>
              <p className="mt-4 text-base font-semibold text-navy">
                {dragOver ? "Drop your CSV here" : "Drag & drop your CSV here"}
              </p>
              <p className="mt-1 text-sm text-muted">
                or{" "}
                <span className="font-semibold text-brand underline-offset-2 hover:underline">
                  click to browse
                </span>{" "}
                — .csv, Google Shopping feed format
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={onFileChange}
            />
          </div>
        ) : (
          <div className="p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
                  <FileSpreadsheet size={24} />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-navy">{csvInfo.fileName}</p>
                  <p className="text-xs text-muted">
                    {formatBytes(csvInfo.fileSize)} · {csvInfo.importRows.length} valid rows
                    {csvInfo.skipped ? ` · ${csvInfo.skipped} skipped` : ""}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetSelection}
                  disabled={isLoading}
                  className="inline-flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-muted transition hover:text-navy disabled:opacity-50"
                >
                  <RefreshCw size={15} />
                  Choose another
                </button>
                <button
                  type="button"
                  onClick={runImport}
                  disabled={isLoading || csvInfo.importRows.length === 0}
                  className="inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark disabled:opacity-50"
                >
                  {isLoading ? <Loader2 size={16} className="animate-spin" /> : <UploadCloud size={16} />}
                  {isLoading ? "Importing…" : "Start import"}
                </button>
              </div>
            </div>

            <div className="mt-4 space-y-1.5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <ListChecks size={13} />
                Detected columns
              </p>
              <div className="flex flex-wrap gap-1.5">
                {csvInfo.header.map((col, i) => {
                  const field = normalizeHeader(col);
                  const isRequired = REQUIRED_FIELDS.includes(field);
                  const isKnown = field === "id" || field === "title" || OPTIONAL_FIELDS.includes(field);
                  return (
                    <span
                      key={`${col}-${i}`}
                      className={`rounded-md px-2 py-1 font-mono text-[11px] ring-1 ${
                        isRequired
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : isKnown
                            ? "bg-brand-soft text-brand ring-brand/20"
                            : "bg-page text-muted ring-line"
                      }`}
                    >
                      {isRequired ? "★ " : ""}
                      {col}
                    </span>
                  );
                })}
              </div>
            </div>

            {csvInfo.missingColumns.length > 0 && (
              <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700 ring-1 ring-amber-200">
                Not found (ignored): {csvInfo.missingColumns.join(", ")}
              </p>
            )}
          </div>
        )}
      </section>

      {csvInfo && csvInfo.preview.length > 0 && (
        <section className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-line">
          <p className="text-sm font-semibold text-navy">Preview</p>
          <p className="mt-0.5 text-xs text-muted">
            First {csvInfo.preview.length} row{csvInfo.preview.length > 1 ? "s" : ""} of your file —
            id, title, price, brand
          </p>
          <div className="mt-3 overflow-hidden rounded-xl ring-1 ring-line">
            <table className="w-full text-left text-sm">
              <thead className="bg-page text-xs uppercase tracking-wide text-muted">
                <tr>
                  <th className="px-3 py-2 font-semibold">ID</th>
                  <th className="px-3 py-2 font-semibold">Title</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                  <th className="px-3 py-2 font-semibold">Brand</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line bg-white">
                {csvInfo.preview.map((cells, r) => {
                  const header = csvInfo.header;
                  const get = (name: string) => {
                    const raw = header.map(normalizeHeader).indexOf(name);
                    return raw >= 0 && raw < cells.length ? cells[raw] || "—" : "—";
                  };
                  return (
                    <tr key={r}>
                      <td className="px-3 py-2 font-mono text-xs text-navy">{get("id")}</td>
                      <td className="max-w-[16rem] truncate px-3 py-2">{get("title")}</td>
                      <td className="px-3 py-2">{get("price")}</td>
                      <td className="px-3 py-2">{get("brand")}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {error ? (
        <div className="mt-4 flex items-start gap-3 rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-200">
          <XCircle size={18} className="mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Import error</p>
            <p className="mt-0.5">{error}</p>
          </div>
          <button
            type="button"
            onClick={() => setError("")}
            className="text-red-500 hover:text-red-700"
            aria-label="Dismiss"
          >
            <X size={16} />
          </button>
        </div>
      ) : null}

      {result ? (
        <section className="mt-4 rounded-2xl bg-white p-6 ring-1 ring-line">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
              <CheckCircle2 size={18} />
              Import finished
            </p>
            <button
              type="button"
              onClick={resetSelection}
              className="text-xs font-semibold text-brand hover:underline"
            >
              Import another file
            </button>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <div className="rounded-xl bg-emerald-50 p-3 ring-1 ring-emerald-200">
              <p className="text-2xl font-bold text-emerald-700">{result.created}</p>
              <p className="text-xs font-medium text-emerald-700/80">Created</p>
            </div>
            <div className="rounded-xl bg-brand-soft p-3 ring-1 ring-brand/20">
              <p className="text-2xl font-bold text-brand">{result.updated}</p>
              <p className="text-xs font-medium text-brand/80">Updated</p>
            </div>
            <div className="rounded-xl bg-amber-50 p-3 ring-1 ring-amber-200">
              <p className="text-2xl font-bold text-amber-700">{result.errors.length}</p>
              <p className="text-xs font-medium text-amber-700/80">Errors</p>
            </div>
            <div className="rounded-xl bg-page p-3 ring-1 ring-line">
              <p className="text-2xl font-bold text-muted">{csvInfo?.skipped ?? 0}</p>
              <p className="text-xs font-medium text-muted">Rows skipped</p>
            </div>
          </div>

          {result.errors.length > 0 ? (
            <div className="mt-4">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <AlertCircle size={13} />
                Row errors
              </p>
              <ul className="mt-2 max-h-64 overflow-auto divide-y divide-line rounded-xl bg-page p-2 text-xs ring-1 ring-line">
                {result.errors.map((err) => (
                  <li key={err.sku + err.error} className="flex items-start gap-2 px-2 py-1.5">
                    <XCircle size={14} className="mt-0.5 shrink-0 text-red-500" />
                    <span className="font-mono text-navy">{err.sku}</span>
                    <span className="text-muted">— {err.error}</span>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <p className="flex items-center gap-2 text-sm font-semibold text-navy">
            <ListChecks size={16} className="text-brand" />
            Expected columns
          </p>
          <p className="mt-1 text-xs text-muted">
            <span className="font-semibold text-emerald-700">★ required</span> · rest are optional
          </p>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {EXPECTED_COLUMNS.map(([csvName, field]) => (
              <span
                key={csvName}
                className={`rounded-md px-2 py-1 font-mono text-[11px] ring-1 ${
                  REQUIRED_FIELDS.includes(field)
                    ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                    : "bg-page text-muted ring-line"
                }`}
              >
                {REQUIRED_FIELDS.includes(field) ? "★ " : ""}
                {csvName}
              </span>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 ring-1 ring-line">
          <p className="text-sm font-semibold text-navy">How it works</p>
          <ol className="mt-3 space-y-3">
            {[
              ["Start from the sample", "Get the sample CSV, fill it in Google Sheets or Excel."],
              ["Keep id & title unique", "New ids create products; existing ids update them."],
              ["Drop in the file", "Drag & drop your CSV, then review the detected columns."],
              ["Import & review", "See how many products were created, updated or failed."],
            ].map(([title, body], i) => (
              <li key={title} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                  {i + 1}
                </span>
                <p className="text-sm">
                  <span className="font-semibold text-navy">{title}</span>
                  <span className="text-muted"> — {body}</span>
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </div>
  );
}