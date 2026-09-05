import { type FormEvent, useState } from "react";
import Pagination from "@/components/Pagination";
import { TableSkeleton } from "@/components/Skeleton";
import {
  useCreateCouponMutation,
  useDeleteCouponMutation,
  useGetCouponsQuery,
  useUpdateCouponMutation,
} from "@/store/adminApi";
import type { ApiCoupon } from "@/lib/api";

type CouponForm = {
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotal: number;
  maxDiscount: string;
  expiresAt: string;
  usageLimit: string;
  active: boolean;
};

const emptyForm: CouponForm = {
  code: "",
  type: "percent",
  value: 0,
  minSubtotal: 0,
  maxDiscount: "",
  expiresAt: "",
  usageLimit: "",
  active: true,
};

export default function CouponsPage() {
  const [page, setPage] = useState(1);
  const { data: coupons, isLoading } = useGetCouponsQuery({ page });
  const couponItems = coupons?.items ?? [];
  const totalPages = coupons?.totalPages ?? 1;
  const total = coupons?.total ?? 0;
  const [createCoupon] = useCreateCouponMutation();
  const [updateCoupon] = useUpdateCouponMutation();
  const [deleteCoupon] = useDeleteCouponMutation();

  const [form, setForm] = useState<CouponForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  function toPayload(f: CouponForm) {
    const payload: Record<string, unknown> = {
      code: f.code,
      type: f.type,
      value: f.value,
      minSubtotal: f.minSubtotal,
      active: f.active,
    };
    if (f.maxDiscount) payload.maxDiscount = Number(f.maxDiscount);
    if (f.expiresAt) payload.expiresAt = new Date(f.expiresAt).toISOString();
    if (f.usageLimit) payload.usageLimit = Number(f.usageLimit);
    return payload;
  }

  function populate(c: ApiCoupon) {
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      minSubtotal: c.minSubtotal ?? 0,
      maxDiscount: c.maxDiscount != null ? String(c.maxDiscount) : "",
      expiresAt: c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      usageLimit: c.usageLimit != null ? String(c.usageLimit) : "",
      active: c.active ?? true,
    });
    setEditingId(c.id);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      if (editingId) await updateCoupon({ id: editingId, body: toPayload(form) }).unwrap();
      else await createCoupon(toPayload(form)).unwrap();
      setForm(emptyForm);
      setEditingId(null);
    } catch {
      setError("Could not save coupon. Check the fields and API connection.");
    }
  }

  async function remove(id: string, code: string) {
    if (!confirm(`Delete coupon ${code}?`)) return;
    await deleteCoupon(id);
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-navy">Coupons</h1>
      <p className="mt-1 text-sm text-muted">
        Promo codes are validated at checkout and applied as order discounts.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <form onSubmit={onSubmit} className="h-fit space-y-3 rounded-2xl bg-white p-5 ring-1 ring-line">
          <h2 className="font-semibold">{editingId ? "Edit coupon" : "New coupon"}</h2>
          {error ? <p className="text-sm text-sale">{error}</p> : null}
          <label className="block text-sm">
            Code
            <input
              required
              value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
              placeholder="SAVE10"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Type
            <select
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as CouponForm["type"] })}
            >
              <option value="percent">Percentage (%)</option>
              <option value="fixed">Fixed amount ($)</option>
            </select>
          </label>
          <label className="block text-sm">
            Value
            <input
              required
              type="number"
              min={0}
              step={form.type === "percent" ? 1 : 0.01}
              value={form.value}
              onChange={(e) => setForm({ ...form, value: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Min subtotal
            <input
              type="number"
              min={0}
              value={form.minSubtotal}
              onChange={(e) => setForm({ ...form, minSubtotal: Number(e.target.value) })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Max discount (optional)
            <input
              type="number"
              min={0}
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Expires (optional)
            <input
              type="date"
              value={form.expiresAt}
              onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Usage limit (optional)
            <input
              type="number"
              min={1}
              value={form.usageLimit}
              onChange={(e) => setForm({ ...form, usageLimit: e.target.value })}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            />
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => setForm({ ...form, active: e.target.checked })}
            />
            Active
          </label>
          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
            >
              {editingId ? "Save changes" : "Create coupon"}
            </button>
            {editingId ? (
              <button
                type="button"
                onClick={() => {
                  setForm(emptyForm);
                  setEditingId(null);
                  setError("");
                }}
                className="rounded-lg border border-line px-4 py-2 text-sm"
              >
                Cancel
              </button>
            ) : null}
          </div>
        </form>

        <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
          {isLoading ? (
          <TableSkeleton rows={4} cols={5} />
        ) : couponItems.length === 0 ? (
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <p className="p-5 text-sm text-muted">No coupons yet. Create one to get started.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl bg-white ring-1 ring-line">
            <table className="w-full text-sm">
              <thead className="bg-page text-left text-muted">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Value</th>
                  <th className="px-4 py-3">Used</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {couponItems.map((coupon) => (
                  <tr key={coupon.id} className="border-t border-line">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-navy">
                      {coupon.code}
                    </td>
                    <td className="px-4 py-3">{coupon.type === "percent" ? "%" : "$"}</td>
                    <td className="px-4 py-3">
                      {coupon.type === "percent" ? `${coupon.value}%` : `$${coupon.value}`}
                    </td>
                    <td className="px-4 py-3">
                      {coupon.usedCount ?? 0}
                      {coupon.usageLimit != null ? ` / ${coupon.usageLimit}` : ""}
                    </td>
                    <td className="px-4 py-3">{coupon.active ? "Active" : "Disabled"}</td>
                    <td className="px-4 py-3 text-right">
                      <button type="button" className="text-brand" onClick={() => populate(coupon)}>
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ml-3 text-sale"
                        onClick={() => remove(coupon.id, coupon.code)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} label="coupons" />
          </div>
        )}
        </div>
      </div>
    </div>
  );
}