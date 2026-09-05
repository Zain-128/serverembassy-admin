import { type FormEvent, useEffect, useState } from "react";
import { useGetSettingsQuery, useUpdateSettingsMutation } from "@/store/adminApi";

export default function SettingsPage() {
  const { data: settings } = useGetSettingsQuery();
  const [updateSettings] = useUpdateSettingsMutation();

  const [storeName, setStoreName] = useState("");
  const [tagline, setTagline] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [hours, setHours] = useState("");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(199);
  const [freeShippingLabel, setFreeShippingLabel] = useState("");
  const [taxRate, setTaxRate] = useState(0.07);
  const [currency, setCurrency] = useState("USD");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setStoreName(settings.storeName ?? "Server Embassy");
    setTagline(settings.tagline ?? "");
    setPhone(settings.phone ?? "");
    setEmail(settings.supportEmail ?? "");
    setAddress(settings.address ?? "");
    setHours(settings.hours ?? "");
    setFreeShippingThreshold(settings.freeShippingThreshold ?? 199);
    setFreeShippingLabel(settings.freeShippingLabel ?? "");
    setTaxRate(settings.taxRate ?? 0.07);
    setCurrency(settings.currency ?? "USD");
  }, [settings]);

  async function save(event: FormEvent) {
    event.preventDefault();
    await updateSettings({
      storeName,
      tagline,
      phone,
      supportEmail: email,
      address,
      hours,
      freeShippingThreshold: Number(freeShippingThreshold),
      freeShippingLabel,
      taxRate: Number(taxRate),
      currency,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="max-w-xl">
      <h1 className="text-2xl font-bold text-navy">Settings</h1>
      <form onSubmit={save} className="mt-6 space-y-3 rounded-2xl bg-white p-6 ring-1 ring-line">
        <label className="block text-sm">
          Store name
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Tagline
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Phone
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Support email
          <input
            type="email"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Address
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
        </label>
        <label className="block text-sm">
          Business hours
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
          />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm">
            Currency
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
            />
          </label>
          <label className="block text-sm">
            Tax rate
            <input
              type="number"
              step="0.001"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={taxRate}
              onChange={(e) => setTaxRate(Number(e.target.value))}
            />
          </label>
          <label className="block text-sm">
            Free ship ≥
            <input
              type="number"
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
            />
          </label>
        </div>
        <label className="block text-sm">
          Free shipping label
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={freeShippingLabel}
            onChange={(e) => setFreeShippingLabel(e.target.value)}
          />
        </label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Save settings
        </button>
        {saved ? <p className="text-sm text-brand">Saved.</p> : null}
      </form>
    </div>
  );
}