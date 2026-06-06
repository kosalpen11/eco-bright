export default function LoadingProductDetail() {
  return (
    <div className="min-h-screen bg-app-bg">
      <div className="sticky top-0 z-30 border-b border-app-border bg-app-bg-soft">
        <div className="mx-auto flex w-full max-w-7xl items-center gap-3 px-3 py-3 sm:px-4">
          <div className="size-10 rounded-full border border-app-border bg-app-surface-2" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-2/3 rounded bg-app-surface-3" />
            <div className="h-3 w-1/3 rounded bg-app-surface-3" />
          </div>
          <div className="size-10 rounded-full border border-app-border bg-app-surface-2" />
        </div>
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-5 px-3 py-4 sm:px-4 lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)] lg:py-6">
        <div className="space-y-3">
          <div className="h-[28rem] rounded-[1.8rem] border border-app-border bg-white" />
          <div className="flex gap-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="size-18 rounded-2xl border border-app-border bg-app-surface" />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[1.8rem] border border-app-border bg-white p-6">
            <div className="h-6 w-28 rounded bg-app-surface-3" />
            <div className="mt-4 h-8 w-5/6 rounded bg-app-surface-3" />
            <div className="mt-3 h-4 w-full rounded bg-app-surface-3" />
            <div className="mt-2 h-4 w-2/3 rounded bg-app-surface-3" />
            <div className="mt-6 h-10 w-32 rounded bg-app-surface-3" />
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-18 rounded-2xl bg-app-surface" />
              ))}
            </div>
          </div>
          <div className="rounded-[1.8rem] border border-app-border bg-white p-6">
            <div className="h-5 w-32 rounded bg-app-surface-3" />
            <div className="mt-4 h-28 rounded-2xl bg-app-surface" />
          </div>
        </div>
      </div>
    </div>
  );
}
