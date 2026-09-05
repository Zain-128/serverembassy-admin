import { type FormEvent, useState } from "react";
import Pagination from "@/components/Pagination";
import { CardSkeleton } from "@/components/Skeleton";
import {
  useCreateBrandMutation,
  useDeleteBrandMutation,
  useGetBrandsQuery,
  useUpdateBrandMutation,
} from "@/store/adminApi";

export default function BrandsPage() {
  const [page, setPage] = useState(1);
  const { data: brands, isLoading } = useGetBrandsQuery({ page });
  const brandItems = brands?.items ?? [];
  const totalPages = brands?.totalPages ?? 1;
  const total = brands?.total ?? 0;
  const [createBrand] = useCreateBrandMutation();
  const [updateBrand] = useUpdateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();
  const [name, setName] = useState("");

  async function add(event: FormEvent) {
    event.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await createBrand({ slug, name, featured: true });
    setName("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Brands</h1>
      <form onSubmit={add} className="mt-6 flex gap-3">
        <input
          required
          className="rounded-lg border border-line px-3 py-2"
          placeholder="Brand name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Add brand
        </button>
      </form>
      {isLoading ? (
        <CardSkeleton count={6} />
      ) : (
        <>
          <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {brandItems.map((brand) => (
              <li key={brand.id} className="flex items-center justify-between rounded-2xl bg-white p-4 ring-1 ring-line">
                <div>
                  <p className="font-semibold">{brand.name}</p>
                  <label className="text-xs text-muted">
                    <input
                      type="checkbox"
                      className="mr-1"
                      checked={brand.featured ?? false}
                      onChange={async (e) => {
                        await updateBrand({ id: brand.id, body: { featured: e.target.checked } });
                      }}
                    />
                    Featured on homepage
                  </label>
                </div>
                <button
                  type="button"
                  className="text-sm text-sale"
                  onClick={async () => {
                    if (!confirm("Delete this brand?")) return;
                    await deleteBrand(brand.id);
                  }}
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
          <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} label="brands" />
        </>
      )}
    </div>
  );
}
