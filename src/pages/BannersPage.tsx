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
import { useToast, getErrorMessage } from "@/components/Toast";

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
  const [ctaLabel, setCtaLabel] = useState("Shop Now");
  const [size, setSize] = useState<"hero" | "half" | "third">("hero");
  const [href, setHref] = useState("/shop");
  const { toast } = useToast();

  async function add(event: FormEvent) {
    event.preventDefault();
    try {
      await createBanner({
        title,
        subtitle,
        ctaLabel,
        href,
        size,
        sortOrder: bannerItems.length + 1,
        active: true,
      }).unwrap();
      toast("Banner created successfully!", "success");
      setTitle("");
      setSubtitle("");
    } catch (err) {
      toast(getErrorMessage(err, "Could not create banner"), "error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Homepage Banners</h1>
      <p className="text-sm text-muted">Manage promo slides and hero banners shown on the storefront homepage.</p>
      <form onSubmit={add} className="mt-6 grid gap-3 rounded-2xl bg-white p-5 ring-1 ring-line md:grid-cols-2">
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Banner Title</label>
          <input
            required
            placeholder="e.g. Enterprise Rack & Blade Servers"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Subtitle / Eyebrow</label>
          <input
            placeholder="e.g. Next-day dispatch on popular HPE configurations"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Banner Type / Location</label>
          <select
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={size}
            onChange={(e) => setSize(e.target.value as "hero" | "half" | "third")}
          >
            <option value="hero">Hero Slide (Top Carousel)</option>
            <option value="half">Promo Card (Half Width)</option>
            <option value="third">Feature Tile (Third Width)</option>
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">CTA Button Label</label>
          <input
            placeholder="e.g. Shop Now"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={ctaLabel}
            onChange={(e) => setCtaLabel(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-semibold text-navy">Target Link (href)</label>
          <input
            placeholder="e.g. /shop or /shop/servers"
            className="w-full rounded-lg border border-line px-3 py-2 text-sm"
            value={href}
            onChange={(e) => setHref(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <button type="submit" className="btn btn-primary w-full">
            + Add Banner
          </button>
        </div>
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
                        try {
                          await updateBanner({ id: banner.id, body: { active: e.target.checked } }).unwrap();
                          toast("Status updated", "success");
                        } catch (err) {
                          toast(getErrorMessage(err, "Could not update banner"), "error");
                        }
                      }}
                    />
                    Active
                  </label>
                  <button
                    type="button"
                    className="text-sm text-sale"
                    onClick={async () => {
                      try {
                        await deleteBanner(banner.id).unwrap();
                        toast("Banner deleted", "success");
                      } catch (err) {
                        toast(getErrorMessage(err, "Could not delete banner"), "error");
                      }
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
