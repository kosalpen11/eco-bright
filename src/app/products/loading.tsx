export default function LoadingProducts() {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="sticky top-0 z-30 border-b border-gray-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-4 py-3">
          <div className="min-w-[180px]">
            <div className="h-5 w-28 rounded bg-gray-100" />
            <div className="mt-2 h-3 w-32 rounded bg-gray-100" />
          </div>
          <div className="flex-1">
            <div className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50" />
          </div>
          <div className="min-w-[92px] text-right">
            <div className="h-7 w-14 rounded bg-gray-100" />
            <div className="mt-2 h-3 w-16 rounded bg-gray-100" />
          </div>
        </div>
      </div>

      <div className="border-b border-gray-100 bg-white">
        <div className="mx-auto w-full max-w-6xl px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {Array.from({ length: 11 }).map((_, idx) => (
              <div
                key={idx}
                className="h-9 w-28 shrink-0 rounded-full border border-gray-200 bg-gray-50"
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="h-4 w-48 rounded bg-gray-100" />
          <div className="h-9 w-56 rounded bg-gray-100" />
        </div>

        <div className="mt-5 grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
          {Array.from({ length: 24 }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-xl border border-gray-100 bg-white"
            >
              <div className="h-[120px] bg-gray-100" />
              <div className="space-y-3 p-4">
                <div className="h-4 w-20 rounded bg-gray-100" />
                <div className="h-4 w-40 rounded bg-gray-100" />
                <div className="h-3 w-28 rounded bg-gray-100" />
                <div className="h-6 w-24 rounded bg-gray-100" />
                <div className="h-4 w-32 rounded bg-gray-100" />
                <div className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

