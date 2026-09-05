import { type ChangeEvent, useState } from "react";
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

const ALIASES: Record<string, string> = {
  availablity: "availability",
  available: "availability",
  "google_product": "googleProductCategory",
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

export default function ImportPage() {
  const [message, setMessage] = useState<string>("");
  const [importErrors, setImportErrors] = useState<Array<{ sku: string; error: string }>>([]);
  const [importProducts, { isLoading: loading }] = useImportProductsMutation();

  async function onFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setMessage("");
    setImportErrors([]);

    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.length < 2) {
      setMessage("CSV file looks empty — expected a header row plus data rows.");
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
      setMessage("Missing required columns: id, title.");
      return;
    }

    const missing = [...new Set(EXPECTED_COLUMNS.map(([, field]) => field))].filter(
      (field) => !columns.includes(field),
    );

    const importRows: Record<string, unknown>[] = [];
    const skipped: Array<{ id: string; error: string }> = [];

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
        skipped.push({ id: id || `row ${r + 1}`, error: "id or title empty" });
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

    if (importRows.length === 0) {
      setMessage(`No valid rows found (${skipped.length} skipped).`);
      return;
    }

    try {
      const result = await importProducts(importRows).unwrap();
      const note = missing.length ? ` Columns not found and ignored: ${missing.join(", ")}.` : "";
      setMessage(
        `Imported: ${result.created} created, ${result.updated} updated, ${result.errors.length} errors${
          skipped.length ? `; ${skipped.length} rows skipped client-side` : ""
        }.${note}`,
      );
      setImportErrors(result.errors);
    } catch {
      setMessage("Import failed. Check CSV format and API connection.");
    }
  }

  return (
    <div className="max-w-2xl">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Bulk upload</h1>
          <p className="mt-1 text-sm text-muted">
            Google Shopping feed format — new products are created, matching <code>id</code> SKUs are
            updated. Missing brands &amp; categories are auto-created from <code>brand</code> and{" "}
            <code>product_type</code>.
          </p>
        </div>
        <button
          type="button"
          onClick={downloadSample}
          className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold"
        >
          Download sample CSV
        </button>
      </div>

      <div className="mt-5 rounded-2xl bg-white p-5 ring-1 ring-line">
        <p className="text-sm font-semibold text-navy">Expected columns</p>
        <p className="mt-2 rounded-lg bg-page p-3 font-mono text-xs leading-6 text-slate-700">
          {EXPECTED_COLUMNS.map(([csvName]) => csvName).join(", ")}
        </p>
      </div>

      <label className="mt-5 block rounded-2xl border border-dashed border-line bg-white p-8 text-center">
        <input type="file" accept=".csv,text/csv" onChange={onFile} disabled={loading} />
      </label>

      {message ? <p className="mt-4 text-sm font-medium text-brand">{message}</p> : null}
      {importErrors.length ? (
        <ul className="mt-3 max-h-64 overflow-auto rounded-xl bg-white p-3 text-xs ring-1 ring-line">
          {importErrors.map((err) => (
            <li key={err.sku + err.error} className="py-1">
              <span className="font-mono text-navy">{err.sku}</span>: {err.error}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}