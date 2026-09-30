import { Skeleton } from "@/components/ui/misc";
export default function Loading() {
  return <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8" aria-busy="true" aria-label="Loading">
    <Skeleton className="h-9 w-64" /><Skeleton className="mt-3 h-5 w-96 max-w-full" />
    <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="aspect-[4/3] w-full rounded-2xl" />)}</div>
  </div>;
}
