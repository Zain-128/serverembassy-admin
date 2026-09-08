import { type FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Skeleton } from "@/components/Skeleton";
import { productFromApi, productToApi } from "@/lib/api";
import {
  useCreateProductMutation,
  useGetBrandsQuery,
  useGetCategoriesQuery,
  useGetProductQuery,
  useUpdateProductMutation,
} from "@/store/adminApi";
import { useToast, getErrorMessage } from "@/components/Toast";

type ProductForm = ReturnType<typeof productFromApi>;

const emptyForm: ProductForm = {
  id: "",
  sku: "",
  slug: "",
  title: "",
  brandId: "",
  categoryId: "",
  price: 0,
  compareAtPrice: null,
  stock: 0,
  weightLbs: 1,
  condition: "New",
  warranty: "30 Days",
  rating: 0,
  reviewCount: 0,
  description: "",
  features: [],
  specs: [],
  featured: false,
  deal: false,
  dealEndsAt: null,
  published: true,
  link: "",
  gtin: "",
  mpn: "",
  googleProductCategory: "",
  customLabel0: "",
  shipping: "",
  tax: "",
  imageLink: "",
};

export default function ProductFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const { data: brands } = useGetBrandsQuery();
  const { data: categories } = useGetCategoriesQuery();
  const { data: product, isLoading: loadingProduct } = useGetProductQuery(id!, {
    skip: isNew || !id,
  });
  const brandItems = brands?.items ?? [];
  const categoryItems = categories?.items ?? [];
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation();
  const { toast } = useToast();
  const saving = creating || updating;

  const [form, setForm] = useState<ProductForm>(emptyForm);

  useEffect(() => {
    if (isNew && brandItems[0] && categoryItems[0] && !form.brandId) {
      setForm((prev) => ({
        ...prev,
        brandId: prev.brandId || brandItems[0].id,
        categoryId: prev.categoryId || categoryItems[0].id,
      }));
    }
  }, [isNew, brandItems, categoryItems, form.brandId]);

  useEffect(() => {
    if (product) setForm(productFromApi(product));
  }, [product]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    const payload = productToApi(form);
    try {
      if (isNew) await createProduct(payload).unwrap();
      else await updateProduct({ id: id!, body: payload }).unwrap();
      toast(isNew ? "Product created" : "Product updated", "success");
      navigate("/products");
    } catch (err) {
      toast(getErrorMessage(err, "Could not save product"), "error");
    }
  }

  if (!isNew && loadingProduct)
    return (
      <div className="max-w-3xl">
        <Skeleton className="h-8 w-48" />
        <div className="mt-6 rounded-2xl bg-white p-6 ring-1 ring-line">
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-24 w-full sm:col-span-2" />
          </div>
        </div>
      </div>
    );

  return (
    <form onSubmit={onSubmit} className="max-w-3xl">
      <h1 className="text-2xl font-bold text-navy">{isNew ? "Add product" : "Edit product"}</h1>
      <div className="mt-6 grid gap-4 rounded-2xl bg-white p-6 ring-1 ring-line sm:grid-cols-2">
        {(
          [
            ["sku", "SKU"],
            ["title", "Title"],
            ["slug", "Slug"],
            ["warranty", "Warranty"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              required={key !== "slug"}
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="text-sm">
          Brand
          <select
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.brandId}
            onChange={(e) => setForm({ ...form, brandId: e.target.value })}
          >
            {brandItems.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Category
          <select
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
          >
            {categoryItems.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm">
          Price
          <input
            type="number"
            step="0.01"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Stock
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Weight (lbs)
          <input
            type="number"
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.weightLbs}
            onChange={(e) => setForm({ ...form, weightLbs: Number(e.target.value) })}
          />
        </label>
        <label className="text-sm">
          Condition
          <select
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.condition}
            onChange={(e) => setForm({ ...form, condition: e.target.value })}
          >
            <option>New</option>
            <option>Certified Refurbished</option>
          </select>
        </label>
        <label className="sm:col-span-2 text-sm">
          Description
          <textarea
            className="mt-1 min-h-28 w-full rounded-lg border border-line px-3 py-2"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        {(
          [
            ["gtin", "GTIN / EAN / UPC"],
            ["mpn", "MPN"],
            ["imageLink", "Image URL"],
            ["link", "Product URL (link)"],
          ] as const
        ).map(([key, label]) => (
          <label key={key} className="text-sm">
            {label}
            <input
              className="mt-1 w-full rounded-lg border border-line px-3 py-2"
              value={form[key]}
              onChange={(e) => setForm({ ...form, [key]: e.target.value })}
            />
          </label>
        ))}
        <label className="text-sm">
          Google product category
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.googleProductCategory}
            onChange={(e) => setForm({ ...form, googleProductCategory: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Custom label 0
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.customLabel0}
            onChange={(e) => setForm({ ...form, customLabel0: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Shipping
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.shipping}
            onChange={(e) => setForm({ ...form, shipping: e.target.value })}
          />
        </label>
        <label className="text-sm">
          Tax
          <input
            className="mt-1 w-full rounded-lg border border-line px-3 py-2"
            value={form.tax}
            onChange={(e) => setForm({ ...form, tax: e.target.value })}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm({ ...form, featured: e.target.checked })}
          />
          Featured on homepage
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.deal}
            onChange={(e) => setForm({ ...form, deal: e.target.checked })}
          />
          Deal of the day
        </label>
      </div>
      <button
        type="submit"
        disabled={saving}
        className="mt-4 rounded-lg bg-brand px-5 py-2.5 font-semibold text-white disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save product"}
      </button>
    </form>
  );
}
