import { useState } from "react";
import Pagination from "@/components/Pagination";
import { TableSkeleton } from "@/components/Skeleton";
import { titleCaseTaxExempt } from "@/lib/format";
import { useGetCustomersQuery, useUpdateCustomerTaxExemptMutation } from "@/store/adminApi";

const taxOptions = ["none", "pending", "approved", "rejected"];

export default function CustomersPage() {
  const [page, setPage] = useState(1);
  const { data: customers, isLoading } = useGetCustomersQuery({ page });
  const customerItems = customers?.items ?? [];
  const totalPages = customers?.totalPages ?? 1;
  const total = customers?.total ?? 0;
  const [updateTaxExempt] = useUpdateCustomerTaxExemptMutation();

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Customers</h1>
      {isLoading ? (
        <TableSkeleton cols={4} rows={5} />
      ) : (
        <>
          <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-muted">
                <tr>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Company</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Tax exempt</th>
                </tr>
              </thead>
              <tbody>
                {customerItems.map((customer) => (
                  <tr key={customer.id} className="border-t border-line">
                    <td className="px-4 py-3 font-medium">{customer.fullName || "—"}</td>
                    <td className="px-4 py-3">{customer.company || "—"}</td>
                    <td className="px-4 py-3">{customer.email}</td>
                    <td className="px-4 py-3">{customer.orderCount ?? 0}</td>
                    <td className="px-4 py-3">
                      <select
                        className="rounded-lg border border-line px-2 py-1"
                        value={customer.taxExempt}
                        onChange={async (e) => {
                          await updateTaxExempt({ id: customer.id, taxExempt: e.target.value });
                        }}
                      >
                        {taxOptions.map((opt) => (
                          <option key={opt} value={opt}>
                            {titleCaseTaxExempt(opt)}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {customerItems.length === 0 ? (
              <p className="p-6 text-sm text-muted">No customers yet — they appear after checkout.</p>
            ) : null}
            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} label="customers" />
          </div>
        </>
      )}
    </div>
  );
}
