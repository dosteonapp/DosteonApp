import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Calendar } from "@/components/ui/calendar";
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
// import { CalendarIcon } from "lucide-react";
// import { format } from "date-fns";

type InventoryItemLite = {
  name?: string;
};

type UsageLog = {
  date: string;
  openingStock: number;
  usedStock: number;
  closingStock: number;
};

interface LogUsageModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: InventoryItemLite;
  onSave: (log: UsageLog) => void;
  latestDate: string;
  currentLevel: number;
}

export function LogUsageModal({
  open,
  onOpenChange,
  item,
  onSave,
  latestDate,
  currentLevel,
}: LogUsageModalProps) {
  const [date, setDate] = useState<string>("");
  const [openingStock, setOpeningStock] = useState(0);
  const [usedStock, setUsedStock] = useState(0);
  const [closingStock, setClosingStock] = useState(0);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // When date changes, reset fields (simulate logic)
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value);
    setOpeningStock(0);
    setUsedStock(0);
    setClosingStock(0);
    // In real app, fetch log for this date if exists
  };

  // Calculate closing stock
  const handleUsedStockChange = (val: number) => {
    setUsedStock(val);
    setClosingStock(openingStock - val);
  };

  // If logging for latest day, closing stock is currentLevel
  const isLatestDay = date && date === latestDate;
  const closingDisplay = isLatestDay ? currentLevel : closingStock;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log Usage for {item?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="log-date">Date</label>
            <Input
              id="log-date"
              type="date"
              value={date}
              onChange={handleDateChange}
              placeholder="Select a date"
              className="bg-background"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Opening Stock</label>
            <Input
              type="number"
              value={openingStock}
              onChange={(e) => setOpeningStock(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              min={0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Used Stock</label>
            <Input
              type="number"
              value={usedStock}
              onChange={(e) => handleUsedStockChange(Number(e.target.value))}
              onFocus={(e) => e.target.select()}
              min={0}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label>Closing Stock</label>
            <Input type="number" value={closingDisplay} readOnly />
            {isLatestDay && (
              <span className="text-xs text-muted-foreground">
                This is the current stock level
              </span>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={() =>
              onSave({
                date,
                openingStock,
                usedStock,
                closingStock: closingDisplay,
              })
            }
            disabled={!date}
          >
            Save Log
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
