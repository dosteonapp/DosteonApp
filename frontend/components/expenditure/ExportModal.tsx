"use client";

import { useState } from "react";
import { X, FileText, FileSpreadsheet, FileBarChart2, Mail, CheckCircle2, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ExpenseHistoryItem } from "@/lib/services/expenseService";

type ExportFormat = "csv" | "xlsx" | "pdf";

interface Props {
  open: boolean;
  onClose: () => void;
  items: ExpenseHistoryItem[];
  totalEntries: number;
  dateFrom?: string;
  dateTo?: string;
}

const FORMAT_OPTIONS: {
  id: ExportFormat;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  available: boolean;
}[] = [
  { id: "csv",  label: "CSV",           desc: "Comma-separated values, works in any spreadsheet", icon: FileText,       available: true  },
  { id: "xlsx", label: "Excel (.xlsx)", desc: "Coming soon",                                       icon: FileSpreadsheet, available: false },
  { id: "pdf",  label: "PDF Report",    desc: "Coming soon",                                       icon: FileBarChart2,  available: false },
];

// ---------------------------------------------------------------------------
// CSV generation
// ---------------------------------------------------------------------------

function downloadCSV(items: ExpenseHistoryItem[]) {
  const headers = ["Date", "Item Name", "Type", "Supplier / Source", "Quantity", "Unit", "Amount (RWF)"];

  const rows = items.map((item) => [
    item.business_date ? new Date(item.business_date).toLocaleDateString() : "",
    item.item_name,
    item.expense_type === "INGREDIENT" ? "Ingredient" : "Operational",
    item.source ?? "",
    item.quantity != null ? String(item.quantity) : "",
    item.unit ?? "",
    String(item.amount),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `expenses-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------

export function ExportModal({ open, onClose, items, totalEntries, dateFrom, dateTo }: Props) {
  const [format, setFormat] = useState<ExportFormat>("csv");
  const [emailCopy, setEmailCopy] = useState(false);
  const [step, setStep] = useState<"select" | "success">("select");

  if (!open) return null;

  const handleDownload = () => {
    if (format === "csv") {
      downloadCSV(items);
    }
    setStep("success");
  };

  const handleDone = () => {
    setStep("select");
    setFormat("csv");
    setEmailCopy(false);
    onClose();
  };

  const dateLabel =
    dateFrom && dateTo ? `${dateFrom} – ${dateTo}` : dateFrom ? `From ${dateFrom}` : "Selected period";

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[20px] shadow-[0_32px_80px_rgba(0,0,0,0.15)] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-[16px] font-black text-[#1E293B] font-figtree">
            {step === "select" ? "Export Expense Report" : "Export Complete"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "select" ? (
          <div className="px-6 py-5 space-y-5">
            {/* Summary card */}
            <div className="bg-slate-50 rounded-[12px] p-4 space-y-2">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 font-figtree">Export Summary</p>
              <div className="grid grid-cols-2 gap-y-1.5">
                <SummaryRow label="Date Range" value={dateLabel} />
                <SummaryRow label="Total Entries" value={totalEntries.toLocaleString()} />
              </div>
            </div>

            {/* Format selector */}
            <div className="space-y-2">
              <p className="text-[12px] font-black uppercase tracking-wider text-slate-400 font-figtree">Format</p>
              <div className="space-y-2">
                {FORMAT_OPTIONS.map((opt) => {
                  const Icon = opt.icon;
                  const isActive = format === opt.id;
                  const disabled = !opt.available;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      disabled={disabled}
                      onClick={() => !disabled && setFormat(opt.id)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3.5 rounded-[10px] border-2 transition-all text-left",
                        disabled
                          ? "border-slate-100 opacity-50 cursor-not-allowed"
                          : isActive
                          ? "border-[#3B59DA] bg-indigo-50/40"
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-[8px] flex items-center justify-center shrink-0 transition-colors",
                        isActive && !disabled ? "bg-[#3B59DA]" : "bg-slate-100"
                      )}>
                        <Icon className={cn("h-4 w-4", isActive && !disabled ? "text-white" : "text-slate-400")} />
                      </div>
                      <div>
                        <p className={cn(
                          "text-[13px] font-black font-figtree",
                          isActive && !disabled ? "text-[#3B59DA]" : "text-slate-700"
                        )}>
                          {opt.label}
                          {disabled && <span className="ml-2 text-[11px] font-bold text-slate-400">Coming soon</span>}
                        </p>
                        {!disabled && <p className="text-[11px] text-slate-400 font-bold font-figtree">{opt.desc}</p>}
                      </div>
                      {!disabled && (
                        <div className={cn(
                          "ml-auto w-4 h-4 rounded-full border-2 shrink-0 transition-all",
                          isActive ? "border-[#3B59DA] bg-[#3B59DA]" : "border-slate-200"
                        )} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Email toggle */}
            <button
              type="button"
              onClick={() => setEmailCopy(!emailCopy)}
              className="flex items-center gap-3 w-full p-3 rounded-[10px] hover:bg-slate-50 transition-all"
            >
              <div className={cn(
                "w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0",
                emailCopy ? "bg-[#3B59DA] border-[#3B59DA]" : "border-slate-200"
              )}>
                {emailCopy && <Mail className="h-3 w-3 text-white" />}
              </div>
              <span className="text-[13px] font-bold text-slate-600 font-figtree">Email a copy to myself</span>
            </button>

            {/* Actions */}
            <div className="flex gap-3 pt-1">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 h-11 rounded-[10px] border-slate-200 text-slate-600 font-bold font-figtree"
              >
                Cancel
              </Button>
              <Button
                onClick={handleDownload}
                className="flex-1 h-11 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black font-figtree gap-2"
              >
                <Download className="h-4 w-4" />
                Download Report
              </Button>
            </div>
          </div>
        ) : (
          /* Success screen */
          <div className="px-6 py-10 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            </div>
            <div className="space-y-2">
              <h3 className="text-[20px] font-black text-[#1E293B] font-figtree">Export Complete</h3>
              <p className="text-[14px] text-slate-500 font-bold font-figtree max-w-[300px]">
                Your CSV file has been downloaded.
                {emailCopy ? " A copy has also been queued to your email." : ""}
              </p>
            </div>
            <Button
              onClick={handleDone}
              className="mt-2 h-12 px-10 bg-[#3B59DA] hover:bg-[#2D46B2] text-white rounded-[10px] font-black font-figtree"
            >
              Done
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400 font-bold font-figtree">{label}</p>
      <p className="text-[13px] font-black text-slate-700 font-figtree">{value}</p>
    </div>
  );
}
