import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CommunicationsLoading() {
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
            <Skeleton className="h-10 w-[150px]" />
          </div>
        </div>

        <Skeleton className="h-10 w-[300px] mb-4" />

        <div className="grid gap-4 md:grid-cols-7">
          <Card className="md:col-span-2">
            <CardHeader>
              <Skeleton className="h-10 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array(5)
                  .fill(null)
                  .map((_, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-[150px]" />
                        <Skeleton className="h-4 w-full mt-1" />
                        <Skeleton className="h-4 w-[100px] mt-1" />
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>

          <Card className="md:col-span-5">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-[150px]" />
                  <Skeleton className="h-4 w-[200px] mt-1" />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col h-[calc(100vh-350px)] justify-between">
                <div className="flex-1 p-4 space-y-4">
                  {Array(5)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className={`flex ${
                          i % 2 === 0 ? "justify-start" : "justify-end"
                        }`}
                      >
                        <Skeleton
                          className={`h-20 ${
                            i % 2 === 0 ? "w-[70%]" : "w-[60%]"
                          } rounded-lg`}
                        />
                      </div>
                    ))}
                </div>
                <div className="p-4 border-t">
                  <Skeleton className="h-[100px] w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
