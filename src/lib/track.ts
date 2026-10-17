// Single analytics entry point. Pushes to window.dataLayer only if something else created it. No vendor SDK, no GA.
export type TrackProps = Record<string, string | number | boolean | null>;
export function track(event: string, props: TrackProps = {}) {
  if (typeof window === "undefined") return;
  const dl = (window as unknown as { dataLayer?: unknown[] }).dataLayer;
  if (!Array.isArray(dl)) return; // no-op if absent; never create it
  dl.push({ event, ...props });
}
