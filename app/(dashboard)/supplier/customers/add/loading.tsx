import { Skeleton } from "@/components/ui/skeleton"

export default function AddCustomerLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="flex h-14 lg:h-[60px] items-center gap-4 border-b bg-background px-6">
        <Skeleton className="h-4 w-24" />
      </header>
      <main className="flex-1 p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-80" />
          </div>

          <Skeleton className="h-[600px] w-full rounded-lg" />
        </div>
      </main>
    </div>
  )
}
