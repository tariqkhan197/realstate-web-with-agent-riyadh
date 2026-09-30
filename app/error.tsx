"use client";
import { Button } from "@/components/ui/button";
export default function Error({ reset }: { error: Error; reset: () => void }) {
  return <div className="mx-auto max-w-lg px-5 py-24 text-center">
    <h1 className="text-display">Something went wrong</h1>
    <p className="mt-3 text-ink-3">Please try again. If it keeps happening, reload the page.</p>
    <Button className="mt-8" onClick={reset}>Try again</Button>
  </div>;
}
