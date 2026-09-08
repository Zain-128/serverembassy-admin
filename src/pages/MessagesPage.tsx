import { useState } from "react";
import Pagination from "@/components/Pagination";
import { CardSkeleton } from "@/components/Skeleton";
import { useToast, getErrorMessage } from "@/components/Toast";
import {
  useDeleteMessageMutation,
  useGetMessagesQuery,
  useUpdateMessageReadMutation,
} from "@/store/adminApi";

export default function MessagesPage() {
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const { data: messages, isLoading } = useGetMessagesQuery({ page });
  const messageItems = messages?.items ?? [];
  const totalPages = messages?.totalPages ?? 1;
  const total = messages?.total ?? 0;
  const [updateRead] = useUpdateMessageReadMutation();
  const [deleteMessage] = useDeleteMessageMutation();

  async function remove(id: string) {
    if (!confirm("Delete this message?")) return;
    try {
      await deleteMessage(id).unwrap();
      toast("Message deleted", "success");
    } catch (err) {
      toast(getErrorMessage(err, "Could not delete message."), "error");
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-navy">Messages</h1>
      <p className="mt-1 text-sm text-muted">Contact form submissions from the storefront.</p>
      <div className="mt-6 space-y-3">
        {isLoading ? (
          <CardSkeleton count={3} />
        ) : messageItems.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-sm text-muted ring-1 ring-line">
            No messages yet.
          </p>
        ) : (
          messageItems.map((message) => (
            <article
              key={message.id}
              className={`rounded-2xl bg-white p-5 ring-1 ${message.read ? "ring-line" : "ring-brand"}`}
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    {message.name} <span className="font-normal text-muted">· {message.email}</span>
                  </p>
                  {message.subject ? (
                    <p className="text-sm font-medium text-navy">{message.subject}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  {message.createdAt ? (
                    <span className="text-xs text-muted">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className="text-brand"
                    onClick={async () => {
                      try {
                        await updateRead({ id: message.id, read: !message.read }).unwrap();
                        toast(message.read ? "Marked unread" : "Marked read", "success");
                      } catch (err) {
                        toast(getErrorMessage(err, "Could not update message."), "error");
                      }
                    }}
                  >
                    {message.read ? "Mark unread" : "Mark read"}
                  </button>
                  <button type="button" className="text-sale" onClick={() => remove(message.id)}>
                    Delete
                  </button>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap rounded-lg bg-page p-3 text-sm">{message.message}</p>
            </article>
          ))
        )}
      </div>
      <Pagination page={page} totalPages={totalPages} total={total} onChange={setPage} label="messages" />
    </div>
  );
}