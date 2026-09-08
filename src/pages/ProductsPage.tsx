import { useState } from "react";
import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/format";
import {
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/store/adminApi";
import { TableSkeleton } from "@/components/Skeleton";
import Pagination from "@/components/Pagination";
import { useToast, getErrorMessage } from "@/components/Toast";

export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [submittedQ, setSubmittedQ] = useState("");
  const { data, isLoading } = useGetProductsQuery({
    page,
    limit: 20,
    q: submittedQ || undefined,
  });
  const { data: categoryRes } = useGetCategoriesQuery();
  const categories = categoryRes?.items ?? [];
  const [deleteProduct] = useDeleteProductMutation();
  const { toast } = useToast();
  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    try {
      await deleteProduct(id).unwrap();
      toast("Product deleted", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Could not delete product"), "error");
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    setSubmittedQ(q);
  }

  if (isLoading) return <TableSkeleton cols={6} rows={6} className="mt-6" />;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-navy">Products</h1>
          <p className="text-sm text-muted">Create, edit, and unpublish catalog SKUs.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/products/new" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
            Add product
          </Link>
          <Link to="/products/import" className="rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold">
            Bulk upload
          </Link>
        </div>
      </div>
      <form onSubmit={handleSearch} className="mt-4 flex gap-2">
        <input
          type="text"
          placeholder="Search products…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
        />
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Search
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-muted">
            <tr>
              <th className="px-4 py-3">SKU</th>
              <th className="px-4 py-3">Title</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Price</th>
              <th className="px-4 py-3">Stock</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted">
                  No products yet. Use Import or create one.
                </td>
              </tr>
            ) : (
              items.map((product) => (
                <tr key={product.id} className="border-t border-line">
                  <td className="px-4 py-3 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3">{product.title}</td>
                  <td className="px-4 py-3">
                    {categories.find((c) => c.id === product.categoryId)?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">{formatMoney(product.price)}</td>
                  <td className="px-4 py-3">{product.stock}</td>
                  <td className="px-4 py-3">
                    {product.published || product.status === "published" ? "Published" : "Draft"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link to={`/products/${product.id}`} className="text-brand">
                      Edit
                    </Link>
                    <button type="button" className="ml-3 text-sale" onClick={() => remove(product.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} total={data?.total ?? 0} onChange={setPage} label="products" />
      </div>
    </div>
  );
}
