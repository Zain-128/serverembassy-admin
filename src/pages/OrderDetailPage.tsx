import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { formatMoney } from "@/lib/format";
import { Skeleton } from "@/components/Skeleton";
import { useToast, getErrorMessage } from "@/components/Toast";
import {
  useAddShipmentMutation,
  useGetOrderQuery,
  useUpdateOrderStatusMutation,
} from "@/store/adminApi";

const statuses = ["pending", "processing", "shipped", "delivered", "cancelled", "refunded"];

export default function OrderDetailPage() {
  const { id } = useParams();
  const { toast } = useToast();
  const { data: order, isLoading } = useGetOrderQuery(id!, { skip: !id });
  const [updateStatus] = useUpdateOrderStatusMutation();
  const [addShipment] = useAddShipmentMutation();
  const [carrier, setCarrier] = useState("UPS");
  const [tracking, setTracking] = useState("");

  useEffect(() => {
    const lastShipment = order?.shipments?.[order.shipments.length - 1];
    if (lastShipment) {
      setCarrier(lastShipment.carrier);
      setTracking(lastShipment.trackingNumber);
    }
  }, [order]);

  if (isLoading)
    return (
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <div className="p-6 space-y-4">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  if (!order) return <p className="text-muted">Order not found.</p>;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy">{order.orderNumber}</h1>
      <p className="text-sm text-muted">{order.email}</p>
      <div className="mt-6 rounded-2xl bg-white p-5 ring-1 ring-line">
        <label className="text-sm font-medium">
          Status
          <select
            className="mt-1 block rounded-lg border border-line px-3 py-2"
            value={order.status}
            onChange={async (e) => {
              try {
                await updateStatus({ id: order.id, status: e.target.value }).unwrap();
                toast("Order status updated", "success");
              } catch (err) {
                toast(getErrorMessage(err, "Could not update order status."), "error");
              }
            }}
          >
            {statuses.map((s) => (
              <option key={s} value={s}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>
        </label>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm font-medium">
            Carrier
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={carrier}
              onChange={(e) => setCarrier(e.target.value)}
            />
          </label>
          <label className="text-sm font-medium">
            Tracking number
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={tracking}
              onChange={(e) => setTracking(e.target.value)}
            />
          </label>
        </div>
        <button
          type="button"
          className="mt-3 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white"
          onClick={async () => {
            if (!tracking.trim()) return;
            try {
              await addShipment({
                id: order.id,
                carrier,
                trackingNumber: tracking.trim(),
              }).unwrap();
              toast("Shipment added", "success");
            } catch (err) {
              toast(getErrorMessage(err, "Could not add shipment."), "error");
            }
          }}
        >
          Save shipment
        </button>
        <table className="mt-6 w-full text-sm">
          <thead className="text-left text-muted">
            <tr>
              <th className="py-2">SKU</th>
              <th className="py-2">Qty</th>
              <th className="py-2">Price</th>
            </tr>
          </thead>
          <tbody>
            {(order.items ?? []).length === 0 ? (
              <tr>
                <td colSpan={3} className="py-4 text-sm text-muted">
                  No line items.
                </td>
              </tr>
            ) : (
              (order.items ?? []).map((item) => (
                <tr key={item.sku} className="border-t border-line">
                  <td className="py-2">{item.sku}</td>
                  <td className="py-2">{item.qty}</td>
                  <td className="py-2">{formatMoney(item.unitPrice)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <p className="mt-4 font-bold">Total {formatMoney(order.total)}</p>
      </div>
    </div>
  );
}
