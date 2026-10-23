import { createServerFn } from "@tanstack/react-start";

// Returns only the latest view count per book (public numbers, no personal data).
export const getLatestSnapshots = createServerFn({ method: "GET" }).handler(async () => {
  const { isVercelCopy } = await import("./vercel-copy.server");
  if (isVercelCopy()) {
    const { fetchLiveViews } = await import("./bribooks.server");
    const live = await fetchLiveViews();
    return Object.entries(live).map(([book_id, total_views]) => ({
      book_id, total_views, fetched_at: new Date().toISOString(),
    }));
  }
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin
    .from("book_view_snapshots")
    .select("book_id,total_views,fetched_at")
    .order("fetched_at", { ascending: false })
    .limit(20);
  if (error) {
    console.error("snapshot read failed", error.message);
    return [] as { book_id: string; total_views: number; fetched_at: string }[];
  }
  return data ?? [];
});
