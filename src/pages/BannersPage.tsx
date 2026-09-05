import { type FormEvent, useState } from "react";
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
  useGetCategoriesQuery,
  useUpdateBannerMutation,
} from "@/store/adminApi";

export default function BannersPage() {
  const { data: banners = [] } = useGetBannersQuery();
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createBanner] = useCreateBannerMutation();
  const [updateBanner] = useUpdateBannerMutation();
  const [deleteBanner] = useDeleteBannerMutation();
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [href, setHref] = useState("/shop/network-switches");

  async function add(event: FormEvent) {
    event.preventDefault();
    await createBanner({
      title,
      subtitle,
      ctaLabel: "Shop Now",
      href,
      size: "half",
      sortOrder: banners.length + 1,
      active: true,
    });
    setTitle("");
    setSubtitle("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Homepage banners</h1>
      <p className="text-sm text-muted">Promo slides and category cards shown on the storefront.</p>
      <form onSubmit={add} className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-line md:grid-cols-2">
        <input
          required
          placeholder="Title"
          className="rounded-lg border border-line px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <input
          placeholder="Subtitle"
          className="rounded-lg border border-line px-3 py-2"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
        />
        <select
          className="rounded-lg border border-line px-3 py-2"
          value={href}
          onChange={(e) => setHref(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c.id} value={`/shop/${c.slug}`}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add banner
        </button>
      </form>
      <div className="mt-6 space-y-3">
        {banners.map((banner) => (
          <div key={banner.id} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-line">
            <div>
              <p className="font-semibold">{banner.title}</p>
              <p className="text-sm text-muted">
                {banner.subtitle} · {banner.href} · {banner.size}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm">
                <input
                  type="checkbox"
                  className="mr-1"
                  checked={banner.active ?? false}
                  onChange={async (e) => {
                    await updateBanner({ id: banner.id, body: { active: e.target.checked } });
                  }}
                />
                Active
              </label>
              <button
                type="button"
                className="text-sm text-sale"
                onClick={async () => {
                  await deleteBanner(banner.id);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
