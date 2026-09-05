import { type FormEvent, useState } from "react";
import Pagination from "@/components/Pagination";
import { CardSkeleton } from "@/components/Skeleton";
import {
  useCreateBannerMutation,
  useDeleteBannerMutation,
  useGetBannersQuery,
  useGetCategoriesQuery,
  useUpdateBannerMutation,
} from "@/store/adminApi";

export default function BannersPage() {
  const [page, setPage] = useState(1);
  const { data: banners, isLoading } = useGetBannersQuery({ page });
  const bannerItems = banners?.items ?? [];
  const totalPages = banners?.totalPages ?? 1;
  const total = banners?.total ?? 0;
  const { data: categories } = useGetCategoriesQuery();
  const categoryItems = categories?.items ?? [];
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
      sortOrder: bannerItems.length + 1,
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
          {categoryItems.map((c) => (
            <option key={c.id} value={`/shop/${c.slug}`}>
              {c.name}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add banner
        </button>
      </form>
      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          <div className="mt-6 space-y-3">
            {bannerItems.map((banner) => (
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
          <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} label="banners" />
        </>
      )}
    </div>
  );
}
