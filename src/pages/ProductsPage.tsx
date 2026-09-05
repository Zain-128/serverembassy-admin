import { Link } from "react-router-dom";
import { formatMoney } from "@/lib/format";
import {
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/store/adminApi";

export default function ProductsPage() {
  const { data: productRes, isLoading } = useGetProductsQuery({ limit: 100 });
  const { data: categories = [] } = useGetCategoriesQuery();
  const [deleteProduct] = useDeleteProductMutation();
  const products = productRes?.items ?? [];

  async function remove(id: string) {
    if (!confirm("Delete this product?")) return;
    await deleteProduct(id);
  }

  if (isLoading) return <p className="text-muted">Loading products…</p>;

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
            {products.map((product) => (
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
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
