import { type FormEvent, useEffect, useState } from "react";
import { formatMoney } from "@/lib/format";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/adminApi";

export default function ShippingPage() {
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
    await updateSettings({ freeShippingThreshold: value });
    setSaved(value);
  }

  if (isLoading) return <p className="text-muted">Loading…</p>;

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
