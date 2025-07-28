import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"

export default function ForecastingLoading() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1 space-y-4 p-4 md:p-8">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-8 w-[250px]" />
            <Skeleton className="h-4 w-[350px] mt-2" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-[180px]" />
            <Skeleton className="h-10 w-[100px]" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array(4)
            .fill(null)
            .map((_, i) => (
              <Card key={i}>
                <CardHeader className="pb-2">
                  <Skeleton className="h-4 w-[140px]" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[100px]" />
                  <Skeleton className="h-4 w-[120px] mt-2" />
                </CardContent>
              </Card>
            ))}
        </div>

        <div>
          <Skeleton className="h-10 w-[300px] mb-4" />

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-[200px]" />
              <Skeleton className="h-4 w-[300px]" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[300px] w-full" />
            </CardContent>
            <CardFooter>
              <Skeleton className="h-4 w-full" />
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  )
}
