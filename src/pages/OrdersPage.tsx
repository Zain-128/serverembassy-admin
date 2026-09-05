import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney, titleCaseStatus } from "@/lib/format";
import { useGetOrdersQuery } from "@/store/adminApi";

const STATUSES = [
  ["", "All statuses"],
  ["pending", "Pending"],
  ["processing", "Processing"],
  ["shipped", "Shipped"],
  ["delivered", "Delivered"],
  ["cancelled", "Cancelled"],
  ["refunded", "Refunded"],
] as const;

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const { data } = useGetOrdersQuery({ page, status: status || undefined });

  const orders = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Orders</h1>
          <p className="text-sm text-muted">
            {data ? `${data.total} orders · page ${data.page} of ${totalPages}` : "Loading…"}
          </p>
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
        >
          {STATUSES.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-muted">
                  No orders match this filter.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="border-t border-line">
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/orders/${order.id}`} className="hover:text-brand">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{order.email}</td>
                  <td className="px-4 py-3">
                    {order.placedAt
                      ? new Date(order.placedAt).toLocaleDateString()
                      : order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "—"}
                  </td>
                  <td className="px-4 py-3">{titleCaseStatus(order.status)}</td>
                  <td className="px-4 py-3">{formatMoney(order.total)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 ? (
        <div className="mt-4 flex items-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((p) => p - 1)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-sm text-muted">
            Page {page}/{totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm disabled:opacity-40"
          >
            Next
          </button>
        </div>
      ) : null}
    </div>
  );
}