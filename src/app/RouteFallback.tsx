import { Loader2 } from 'lucide-react';

/** Shown inside the active layout while a route chunk loads. */
export function RouteFallback() {
  return (
    <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate" role="status" aria-live="polite">
      <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      Loading page…
    </div>
  );
}
