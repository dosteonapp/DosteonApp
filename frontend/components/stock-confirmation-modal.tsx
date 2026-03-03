"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Check, Edit2, X, AlertTriangle, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

export type StockItem = {
  id: string
  name: string
  category: string
  type: string
  unit: string
  minLevel: number
  openingStock: number
  closingStock: number
  previousClosingStock?: number
}

export type StockEdit = {
  id: string
  timestamp: Date
  itemId: string
  itemName: string
  field: string
  oldValue: number
  newValue: number
  reason?: string
}

type StockConfirmationModalProps = {
  isOpen: boolean
  onClose: () => void
  stockItems: StockItem[]
  onConfirm: (items: StockItem[], edits: StockEdit[]) => void
  stockType: "opening" | "closing"
  previousItems?: StockItem[]
}

export function StockConfirmationModal({
  isOpen,
  onClose,
  stockItems,
  onConfirm,
  stockType,
  previousItems = [],
}: StockConfirmationModalProps) {
  const [editingItem, setEditingItem] = useState<string | null>(null)
  const [editValue, setEditValue] = useState<number>(0)
  const [editReason, setEditReason] = useState<string>("")
  const [edits, setEdits] = useState<StockEdit[]>([])
  const [currentItems, setCurrentItems] = useState<StockItem[]>(stockItems)

  const changedItems = currentItems.filter((item) => {
    const previousItem = previousItems.find((prev) => prev.id === item.id)
    if (!previousItem) return true

    return stockType === "opening"
      ? item.openingStock !== previousItem.openingStock
      : item.closingStock !== previousItem.closingStock
  })

  const handleEdit = (itemId: string) => {
    const item = currentItems.find((i) => i.id === itemId)
    if (!item) return

    setEditingItem(itemId)
    setEditValue(stockType === "opening" ? item.openingStock : item.closingStock)
    setEditReason("")
  }

  const handleSaveEdit = () => {
    if (!editingItem) return

    const itemIndex = currentItems.findIndex((i) => i.id === editingItem)
    if (itemIndex === -1) return

    const item = currentItems[itemIndex]
    const oldValue = stockType === "opening" ? item.openingStock : item.closingStock

    if (oldValue !== editValue) {
      const newEdit: StockEdit = {
        id: `edit-${Date.now()}`,
        timestamp: new Date(),
        itemId: editingItem,
        itemName: item.name,
        field: stockType,
        oldValue,
        newValue: editValue,
        reason: editReason,
      }

      setEdits([...edits, newEdit])

      const updatedItems = [...currentItems]
      if (stockType === "opening") {
        updatedItems[itemIndex] = { ...item, openingStock: editValue }
      } else {
        updatedItems[itemIndex] = { ...item, closingStock: editValue }
      }

      setCurrentItems(updatedItems)
    }

    setEditingItem(null)
  }

  const handleCancelEdit = () => {
    setEditingItem(null)
  }

  const handleConfirm = () => {
    onConfirm(currentItems, edits)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-5xl p-0 rounded-[32px] overflow-hidden border-none shadow-[0_32px_64px_-12px_rgba(0,0,0,0.16)] bg-white font-figtree animate-in zoom-in-95 duration-500">
        <div className="p-10 md:p-12 border-b border-slate-50 flex items-center justify-between">
          <div className="space-y-2">
            <DialogTitle className="text-[32px] font-bold text-[#1E293B] tracking-tight font-inria leading-none">Confirm Stock Level Changes</DialogTitle>
            <DialogDescription className="text-slate-400 font-medium text-[16px] font-figtree">
              Please review the following changes before saving. You can edit any values that need correction.
            </DialogDescription>
          </div>
          <Button variant="ghost" className="h-12 w-12 p-0 rounded-full hover:bg-slate-50 transition-all" onClick={onClose}>
              <X className="h-7 w-7 text-slate-300" />
          </Button>
        </div>

        <div className="p-10 md:p-12 space-y-10 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Summary Banner */}
          <div className="bg-[#F8F9FF] border border-blue-100/50 rounded-[24px] p-8 flex items-center gap-8 shadow-sm">
             <div className="h-16 w-16 rounded-2xl bg-white border border-blue-100 flex items-center justify-center shadow-md shrink-0">
                <ShieldCheck className="h-8 w-8 text-[#3B59DA]" />
             </div>
             <div className="space-y-1.5">
                <h3 className="text-[20px] font-bold text-[#1E293B] font-inria">{changedItems.length} Changes Detected</h3>
                <p className="text-slate-500 text-[15px] font-medium font-figtree leading-relaxed">System has flagged {changedItems.length} items with inventory fluctuations since last update.</p>
             </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
                <h3 className="text-[14px] font-black text-slate-400 uppercase tracking-widest font-figtree">Detailed Log</h3>
                <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold rounded-lg px-3 py-1">Reviewing</Badge>
            </div>
            
            <div className="rounded-[28px] border border-slate-100 overflow-hidden shadow-sm bg-white">
              <Table>
                <TableHeader className="bg-slate-50/50 border-b border-slate-100">
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="py-6 px-8 text-[12px] font-black text-slate-400 uppercase tracking-widest font-figtree">Product</TableHead>
                    <TableHead className="text-[12px] font-black text-slate-400 uppercase tracking-widest font-figtree">Previous</TableHead>
                    <TableHead className="text-[12px] font-black text-slate-400 uppercase tracking-widest font-figtree">New Value</TableHead>
                    <TableHead className="text-[12px] font-black text-slate-400 uppercase tracking-widest font-figtree">Trend</TableHead>
                    <TableHead className="text-[12px] font-black text-slate-400 uppercase tracking-widest font-figtree text-right pr-8">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {changedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="py-20 text-center text-slate-300 font-bold text-[18px]">No changes detected</TableCell>
                    </TableRow>
                  ) : (
                    changedItems.map((item) => {
                        const previousItem = previousItems.find((prev) => prev.id === item.id)
                        const previousValue = previousItem
                        ? stockType === "opening"
                            ? previousItem.openingStock
                            : previousItem.closingStock
                        : 0
                        const currentValue = stockType === "opening" ? item.openingStock : item.closingStock
                        const difference = currentValue - previousValue

                        return (
                        <TableRow key={item.id} className="hover:bg-[#F8FAFF]/50 border-b border-slate-50/50 transition-colors group">
                            <TableCell className="py-6 px-8">
                                <div className="space-y-1">
                                    <p className="font-bold text-[#1E293B] text-[17px] font-figtree group-hover:text-[#3B59DA] transition-colors">{item.name}</p>
                                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                                </div>
                            </TableCell>
                            <TableCell className="font-bold text-slate-400 text-[17px] tabular-nums">{previousValue} <span className="text-[11px] uppercase ml-1 opacity-50">{item.unit}</span></TableCell>
                            <TableCell className="font-bold text-[#1E293B] text-[17px] tabular-nums">
                                {editingItem === item.id ? (
                                    <Input
                                    type="number"
                                    value={editValue}
                                    onChange={(e) => setEditValue(Number(e.target.value))}
                                    className="w-24 h-11 border-blue-200 bg-white rounded-xl font-bold text-[#3B59DA] shadow-sm animate-in zoom-in-95 duration-200"
                                    autoFocus
                                    />
                                ) : (
                                    <span className="flex items-center gap-2 group-hover:scale-105 transition-transform origin-left">
                                        {currentValue} <span className="text-[11px] text-slate-300 uppercase ml-1">{item.unit}</span>
                                    </span>
                                )}
                            </TableCell>
                            <TableCell>
                                <div className={cn(
                                    "flex items-center gap-2 px-3 py-1 rounded-full w-fit font-bold text-[13px] shadow-sm",
                                    difference > 0 ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : 
                                    difference < 0 ? "bg-rose-50 text-rose-600 border border-rose-100" : 
                                    "bg-slate-50 text-slate-400 border border-slate-100"
                                )}>
                                    {difference > 0 ? <TrendingUp className="h-4 w-4" /> : difference < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                                    {difference > 0 ? `+${difference}` : difference}
                                </div>
                            </TableCell>
                            <TableCell className="text-right pr-8">
                            {editingItem === item.id ? (
                                <div className="flex items-center justify-end space-x-3">
                                <Button size="icon" variant="outline" className="h-10 w-10 rounded-full border-blue-100 bg-blue-50 text-[#3B59DA] hover:bg-blue-100" onClick={handleSaveEdit}>
                                    <Check className="h-5 w-5" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-10 w-10 rounded-full text-slate-300" onClick={handleCancelEdit}>
                                    <X className="h-5 w-5" />
                                </Button>
                                </div>
                            ) : (
                                <Button size="icon" variant="ghost" className="h-12 w-12 rounded-full text-slate-300 hover:text-[#3B59DA] hover:bg-[#F8FAFF] transition-all opacity-0 group-hover:opacity-100" onClick={() => handleEdit(item.id)}>
                                    <Edit2 className="h-5 w-5" />
                                </Button>
                            )}
                            </TableCell>
                        </TableRow>
                        )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          <AnimatePresence>
            {editingItem && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="p-8 border border-blue-100 border-dashed rounded-[24px] bg-[#F8F9FF] shadow-inner space-y-4"
                >
                <h4 className="font-bold text-[#1E293B] text-[16px] font-figtree flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-amber-500" /> Edit Reason (Required)
                </h4>
                <Input
                    placeholder="Provide a brief reason for this inventory adjustment..."
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                    className="h-14 bg-white border-slate-100 rounded-xl px-6 text-[#1E293B] font-medium shadow-sm"
                />
                </motion.div>
            )}
          </AnimatePresence>
        </div>

        <DialogFooter className="p-10 md:p-12 border-t border-slate-50 flex items-center justify-between sm:justify-between bg-slate-50/20">
            <Button variant="outline" onClick={onClose} className="h-16 px-12 rounded-2xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50 text-lg shadow-md transition-all active:scale-95">
                Cancel
            </Button>
            <div className="flex items-center gap-8">
                <div className="flex items-center gap-4 text-slate-400">
                    <AlertCircle className="h-6 w-6 text-amber-400" />
                    <span className="text-[14px] font-bold font-figtree">This action cannot be undone</span>
                </div>
                <Button 
                onClick={handleConfirm}
                className="h-16 px-16 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black text-[19px] shadow-2xl shadow-indigo-900/10 border-none transition-all active:scale-95"
                >
                Confirm & Save
                </Button>
            </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
