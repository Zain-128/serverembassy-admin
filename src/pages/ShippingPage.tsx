import { type FormEvent, useEffect, useState } from "react";
import { Skeleton } from "@/components/Skeleton";
import { formatMoney } from "@/lib/format";
import { useToast, getErrorMessage } from "@/components/Toast";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/adminApi";

export default function ShippingPage() {
  const { toast } = useToast();
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();
  const [value, setValue] = useState(199);
  const [saved, setSaved] = useState(199);

  useEffect(() => {
    if (settings?.freeShippingThreshold != null) {
      setValue(settings.freeShippingThreshold);
      setSaved(settings.freeShippingThreshold);
    }
  }, [settings]);

  async function save(event: FormEvent) {
    event.preventDefault();
    try {
      await updateSettings({ freeShippingThreshold: value }).unwrap();
      setSaved(value);
      toast("Shipping rule saved", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Could not save shipping rule."), "error");
    }
  }

  if (isLoading)
    return (
      <div className="max-w-xl">
        <h1 className="text-2xl font-bold text-navy">Shipping</h1>
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-line">
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-3 h-10 w-full" />
          <Skeleton className="mt-4 h-9 w-28" />
        </div>
      </div>
    );

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-navy">Shipping</h1>
      <p className="text-sm text-muted">
        This threshold drives the storefront free-shipping progress bar.
      </p>
      <form onSubmit={save} className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-line">
        <label className="text-sm font-medium">
          Free shipping over
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={value}
            onChange={(e) => setValue(Number(e.target.value))}
          />
        </label>
        <p className="mt-2 text-sm text-muted">Current saved value: {formatMoney(saved)}</p>
        <button type="submit" className="mt-4 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Save rule
        </button>
      </form>
    </div>
  );
}
