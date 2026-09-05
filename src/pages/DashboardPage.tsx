import { Link } from "react-router-dom";
import { formatMoney, titleCaseStatus } from "@/lib/format";
import { useGetDashboardQuery, useGetOrdersQuery } from "@/store/adminApi";

export default function DashboardPage() {
  const { data: stats, isLoading } = useGetDashboardQuery();
  const { data: orderList } = useGetOrdersQuery({ page: 1 });
  const orders = orderList?.items.slice(0, 5) ?? [];

  if (isLoading || !stats) return <p className="text-muted">Loading dashboard…</p>;

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Dashboard</h1>
      <p className="mt-1 text-sm text-muted">Catalog, orders, and RFQs from the API.</p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          [String(stats.productCount), "Products"],
          [String(stats.orderCount), "Orders"],
          [String(stats.processingOrders), "Processing"],
          [String(stats.newQuotes), "New RFQs"],
        ].map(([value, label]) => (
          <div key={label} className="rounded-2xl bg-white p-5 ring-1 ring-line">
            <p className="text-2xl font-bold text-navy">{value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 rounded-2xl bg-brand-soft p-5">
        <p className="text-sm text-muted">Paid revenue</p>
        <p className="text-2xl font-bold text-navy">{formatMoney(stats.revenue)}</p>
      </div>
      <div className="mt-8 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <div className="flex items-center justify-between border-b border-line px-5 py-3">
          <h2 className="font-semibold">Recent orders</h2>
          <Link to="/orders" className="text-sm font-medium text-brand">
            View all
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="px-5 py-3">Order</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-line">
                <td className="px-5 py-3 font-medium">
                  <Link to={`/orders/${order.id}`} className="hover:text-brand">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-5 py-3">{order.email}</td>
                <td className="px-5 py-3">{titleCaseStatus(order.status)}</td>
                <td className="px-5 py-3">{formatMoney(order.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
