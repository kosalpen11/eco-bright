export default function LoadingProducts() {
  return (
    <div className="min-h-screen bg-app-bg text-app-text">
      <div className="sticky top-0 z-30 border-b border-app-border bg-app-bg-soft">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
          <div className="h-11 w-36 rounded-full border border-app-border bg-app-surface-2" />
          <div className="h-12 flex-1 rounded-full border border-app-border bg-app-surface-2" />
          <div className="size-11 rounded-full border border-app-border bg-app-surface-2" />
        </div>
        <div className="mx-auto w-full max-w-7xl px-3 pb-3 sm:px-4">
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 11 }).map((_, idx) => (
              <div
                key={idx}
                className="h-10 w-28 shrink-0 rounded-full border border-app-border bg-app-surface-2"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-4 sm:py-6">
        <div className="h-48 rounded-[1.8rem] border border-app-border bg-app-surface" />

        <div className="mt-4 rounded-[1.6rem] border border-app-border bg-app-surface p-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-48 rounded bg-app-surface-3" />
            <div className="h-11 w-56 rounded-full border border-app-border bg-app-surface-2" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-[1.35rem] border border-app-border bg-white"
            >
              <div className="aspect-[0.96] bg-app-surface" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-14 rounded bg-app-surface-3" />
                <div className="h-4 w-full rounded bg-app-surface-3" />
                <div className="h-4 w-3/4 rounded bg-app-surface-3" />
                <div className="h-3 w-2/3 rounded bg-app-surface-3" />
                <div className="h-6 w-24 rounded bg-app-surface-3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
