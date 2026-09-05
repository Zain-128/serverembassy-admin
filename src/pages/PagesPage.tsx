import { type FormEvent, useState } from "react";
import {
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
  useUpdatePageMutation,
} from "@/store/adminApi";

export default function PagesPage() {
  const { data: pages = [] } = useGetPagesQuery();
  const [updatePage] = useUpdatePageMutation();
  const [createPage] = useCreatePageMutation();
  const [deletePage] = useDeletePageMutation();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    setError("");
    try {
      await createPage({ slug, title, body: "", published: true }).unwrap();
      setSlug("");
      setTitle("");
    } catch {
      setError("Could not create page. The slug may already exist.");
    }
  }

  async function remove(slugName: string) {
    if (!confirm(`Delete page /${slugName}?`)) return;
    await deletePage(slugName);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">CMS pages</h1>

      <form onSubmit={onCreate} className="mt-6 flex flex-wrap items-end gap-3 rounded-2xl bg-white p-5 ring-1 ring-line">
        <label className="text-sm">
          Slug
          <input
            required
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
            placeholder="about-us"
            className="mt-1 rounded-lg border border-line px-3 py-2"
          />
        </label>
        <label className="text-sm">
          Title
          <input
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="About Us"
            className="mt-1 rounded-lg border border-line px-3 py-2"
          />
        </label>
        <button type="submit" className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white">
          Create page
        </button>
        {error ? <p className="text-sm text-sale">{error}</p> : null}
      </form>

      <div className="mt-6 space-y-4">
        {pages.map((page) => (
          <article key={page.slug} className="rounded-2xl bg-white p-5 ring-1 ring-line">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold">{page.title}</h2>
                <p className="text-xs text-muted">/{page.slug}</p>
              </div>
              <button type="button" className="text-sm text-sale" onClick={() => remove(page.slug)}>
                Delete
              </button>
            </div>
            <textarea
              className="mt-3 min-h-28 w-full rounded-lg border border-line px-3 py-2 text-sm"
              defaultValue={page.body}
              onBlur={async (e) => {
                await updatePage({ slug: page.slug, body: { body: e.target.value } });
              }}
            />
          </article>
        ))}
      </div>
    </div>
  );
}