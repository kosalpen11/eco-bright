export default function Loading() {
  return (
    <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-20 animate-pulse rounded-[2rem] border border-app-border bg-app-surface-2" />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_460px] xl:grid-cols-[minmax(0,1fr)_500px]">
        <div className="space-y-6">
          <div className="h-72 animate-pulse rounded-[2rem] border border-app-border bg-app-surface-2" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-14 animate-pulse rounded-3xl border border-app-border bg-app-surface-2" />
            <div className="h-14 animate-pulse rounded-3xl border border-app-border bg-app-surface-2" />
          </div>
          <div className="flex flex-wrap gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-11 w-28 animate-pulse rounded-full border border-app-border bg-app-surface-2"
              />
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[25rem] animate-pulse rounded-[2rem] border border-app-border bg-app-card"
              />
            ))}
          </div>
        </div>
        <div className="hidden h-[40rem] animate-pulse rounded-[2rem] border border-app-border bg-app-surface-2 lg:block" />
      </div>
    </div>
  );
}
