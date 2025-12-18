import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface ESGIndicatorProps {
  value: string | number
  rating: number
  label: string
  description: string
}

export function ESGIndicator({ value, rating, label, description }: ESGIndicatorProps) {
  const getEsgRatingColor = (rating: number) => {
    if (rating >= 4) return "secondary"
    if (rating >= 3) return "primary"
    if (rating >= 2) return "warning"
    return "destructive"
  }

  const colorName = getEsgRatingColor(rating)

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            <Badge variant="outline" className={`bg-${colorName}-50 text-${colorName} border-${colorName}`}>
              {value}
            </Badge>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{description}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
