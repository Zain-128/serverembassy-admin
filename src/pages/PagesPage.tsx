import { type FormEvent, useState } from "react";
import Pagination from "@/components/Pagination";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast, getErrorMessage } from "@/components/Toast";
import {
  useCreatePageMutation,
  useDeletePageMutation,
  useGetPagesQuery,
  useUpdatePageMutation,
} from "@/store/adminApi";

export default function PagesPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const { data: pages, isLoading } = useGetPagesQuery({ page });
  const pageItems = pages?.items ?? [];
  const totalPages = pages?.totalPages ?? 1;
  const total = pages?.total ?? 0;
  const [updatePage] = useUpdatePageMutation();
  const [createPage] = useCreatePageMutation();
  const [deletePage] = useDeletePageMutation();

  const [slug, setSlug] = useState("");
  const [title, setTitle] = useState("");

  async function onCreate(e: FormEvent) {
    e.preventDefault();
    try {
      await createPage({ slug, title, body: "", published: true }).unwrap();
      setSlug("");
      setTitle("");
      toast("Page created", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Could not create page. The slug may already exist."), "error");
    }
  }

  async function remove(slugName: string) {
    if (!confirm(`Delete page /${slugName}?`)) return;
    try {
      await deletePage(slugName).unwrap();
      toast("Page deleted", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Could not delete page."), "error");
    }
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
      </form>

      {isLoading ? (
        <CardSkeleton count={4} />
      ) : (
        <>
          <div className="mt-6 space-y-4">
            {pageItems.map((cmsPage) => (
              <article key={cmsPage.slug} className="rounded-2xl bg-white p-5 ring-1 ring-line">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">{cmsPage.title}</h2>
                    <p className="text-xs text-muted">/{cmsPage.slug}</p>
                  </div>
                  <button type="button" className="text-sm text-sale" onClick={() => remove(cmsPage.slug)}>
                    Delete
                  </button>
                </div>
                <textarea
                  className="mt-3 min-h-28 w-full rounded-lg border border-line px-3 py-2 text-sm"
                  defaultValue={cmsPage.body}
                  onBlur={async (e) => {
                    try {
                      await updatePage({ slug: cmsPage.slug, body: { body: e.target.value } }).unwrap();
                      toast("Page saved", "success");
                    } catch (err) {
                      toast(getErrorMessage(err, "Could not save page."), "error");
                    }
                  }}
                />
              </article>
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} label="pages" />
        </>
      )}
    </div>
  );
}