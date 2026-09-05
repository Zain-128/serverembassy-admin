import { useGetQuotesQuery, useUpdateQuoteStatusMutation } from "@/store/adminApi";

const statuses = ["new", "contacted", "quoted", "won", "lost"];

export default function QuotesPage() {
  const { data: quotes = [] } = useGetQuotesQuery();
  const [updateStatus] = useUpdateQuoteStatusMutation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Quotes / RFQ</h1>
      <p className="text-sm text-muted">Inbound bulk-quote and Get Started form submissions.</p>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Company</th>
              <th className="px-4 py-3">Part #</th>
              <th className="px-4 py-3">Qty</th>
              <th className="px-4 py-3">Target</th>
              <th className="px-4 py-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {quotes.map((quote) => (
              <tr key={quote.id} className="border-t border-line">
                <td className="px-4 py-3">
                  <p className="font-medium">{quote.name}</p>
                  <p className="text-xs text-muted">{quote.email}</p>
                </td>
                <td className="px-4 py-3">{quote.company || "—"}</td>
                <td className="px-4 py-3 font-mono text-xs">{quote.partNumber || "—"}</td>
                <td className="px-4 py-3">{quote.quantity ?? "—"}</td>
                <td className="px-4 py-3">
                  {quote.targetPrice != null ? `$${quote.targetPrice}` : "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    className="rounded-lg border border-line px-2 py-1"
                    value={quote.status}
                    onChange={async (e) => {
                      await updateStatus({ id: quote.id, status: e.target.value });
                    }}
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {quotes.length === 0 ? (
          <p className="p-6 text-sm text-muted">No quote requests yet.</p>
        ) : null}
      </div>
    </div>
  );
}
