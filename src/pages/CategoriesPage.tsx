import { type FormEvent, useState } from "react";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/adminApi";

export default function CategoriesPage() {
  const { data: categories = [] } = useGetCategoriesQuery();
  const [createCategory] = useCreateCategoryMutation();
  const [updateCategory] = useUpdateCategoryMutation();
  const [deleteCategory] = useDeleteCategoryMutation();
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [homepage, setHomepage] = useState(true);

  async function addCategory(event: FormEvent) {
    event.preventDefault();
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    await createCategory({
      slug,
      name,
      parentId: parentId || null,
      bannerTitle: name,
      bannerSubtitle: "Shop this category",
      showOnHomepage: homepage,
      sortOrder: categories.length + 1,
    });
    setName("");
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Categories</h1>
      <p className="text-sm text-muted">
        Nested tree drives the storefront mega menu. Homepage banners use “show on homepage”.
      </p>
      <form onSubmit={addCategory} className="mt-6 flex flex-wrap gap-3 rounded-2xl bg-white p-5 ring-1 ring-line">
        <input
          required
          placeholder="Category name"
          className="rounded-lg border border-line px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <select
          className="rounded-lg border border-line px-3 py-2"
          value={parentId}
          onChange={(e) => setParentId(e.target.value)}
        >
          <option value="">Top level</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={homepage} onChange={(e) => setHomepage(e.target.checked)} />
          Show on homepage
        </label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Create
        </button>
      </form>
      <div className="mt-6 overflow-hidden rounded-2xl bg-white ring-1 ring-line">
        <table className="w-full text-sm">
          <thead className="bg-page text-left text-muted">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Parent</th>
              <th className="px-4 py-3">Homepage</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {categories.map((cat) => (
              <tr key={cat.id} className="border-t border-line">
                <td className="px-4 py-3 font-medium">{cat.name}</td>
                <td className="px-4 py-3 font-mono text-xs">{cat.slug}</td>
                <td className="px-4 py-3">
                  {categories.find((c) => c.id === cat.parentId)?.name ?? "—"}
                </td>
                <td className="px-4 py-3">
                  <input
                    type="checkbox"
                    checked={cat.showOnHomepage ?? false}
                    onChange={async (e) => {
                      await updateCategory({
                        id: cat.id,
                        body: { showOnHomepage: e.target.checked },
                      });
                    }}
                  />
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    type="button"
                    className="text-sale"
                    onClick={async () => {
                      if (!confirm("Delete this category?")) return;
                      await deleteCategory(cat.id);
                    }}
                  >
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
