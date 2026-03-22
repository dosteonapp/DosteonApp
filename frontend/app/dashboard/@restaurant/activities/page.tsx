"use client";

import { useState, useEffect } from "react";
import { 
  Plus, 
  Search, 
  History,
  Package,
  Filter,
  ArrowUpDown,
  Calendar,
  Download,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { 
  AppContainer, 
  InriaHeading, 
  FigtreeText,
  PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function GlobalActivitiesPage() {
  const [activities, setActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const data = await restaurantOpsService.getRecentActivities({ offset: 0, limit: 50 });
        setActivities(data);
      } catch (err) {
        console.error("Failed to fetch activities:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchActivities();
  }, []);

  const filteredActivities = activities.filter(act => 
    act.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    act.performer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <ActivitiesSkeleton />;
  }

  return (
    <AppContainer className="pb-40">
      <div className="space-y-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold uppercase tracking-widest mb-2">
               <History className="h-3 w-3" />
               <span>Audit Trail</span>
            </div>
            <InriaHeading className="text-[32px] md:text-[38px] font-bold tracking-tight text-[#1E293B]">Stock Activity Logs</InriaHeading>
            <FigtreeText className="text-slate-400 font-semibold text-[15px]">Full history of inventory movements and kitchen logs</FigtreeText>
          </div>
          
          <div className="flex items-center gap-3">
              <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 font-bold gap-3 shadow-sm bg-white hover:bg-slate-50 text-slate-600 transition-all font-figtree">
                  <Download className="h-4 w-4" /> Export CSV
              </Button>
          </div>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            <div className="lg:col-span-8 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-300" />
                <Input 
                    placeholder="Search logs by item, action or person..." 
                    className="h-14 pl-12 rounded-[12px] border-slate-100 bg-white shadow-sm font-semibold text-slate-700 focus-visible:ring-indigo-500/10 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="lg:col-span-2">
                <Button variant="outline" className="h-14 w-full rounded-[12px] border-slate-100 bg-white shadow-sm font-bold gap-3 text-slate-500 hover:bg-slate-50">
                    <Filter className="h-4 w-4" /> Filters
                </Button>
            </div>
            <div className="lg:col-span-2">
                <Button variant="outline" className="h-14 w-full rounded-[12px] border-slate-100 bg-white shadow-sm font-bold gap-3 text-slate-500 hover:bg-slate-50">
                    <Calendar className="h-4 w-4" /> Date Range
                </Button>
            </div>
        </div>

        {/* Main Log Table */}
        <PrimarySurfaceCard className="overflow-hidden border-none shadow-[0_20px_60px_rgba(59,89,218,0.03)] ring-1 ring-slate-100">
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader className="bg-slate-50/50">
                        <TableRow className="border-b border-slate-50 hover:bg-transparent h-16">
                            <TableHead className="pl-10 font-bold text-slate-400 text-[12px] uppercase tracking-wider font-figtree">Action</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[12px] uppercase tracking-wider font-figtree">Activity Details</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[12px] uppercase tracking-wider font-figtree">Net Change</TableHead>
                            <TableHead className="font-bold text-slate-400 text-[12px] uppercase tracking-wider font-figtree">Authorized By</TableHead>
                            <TableHead className="pr-10 font-bold text-slate-400 text-[12px] uppercase tracking-wider font-figtree">Occurrence</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredActivities.length > 0 ? (
                            filteredActivities.map((act) => (
                                <TableRow key={act.id} className="border-b border-slate-50 hover:bg-slate-50/30 transition-all h-24">
                                    <TableCell className="pl-10">
                                        <Badge className={cn(
                                            "text-[10px] font-black px-3 py-1.5 rounded-[8px] border-none flex items-center gap-2 w-fit uppercase font-figtree tracking-widest",
                                            act.action === 'Updated' ? "bg-indigo-50 text-indigo-600" :
                                            act.action === 'Received' ? "bg-emerald-50 text-emerald-600" :
                                            act.action === 'Removed' ? "bg-rose-50 text-rose-600" :
                                            "bg-slate-50 text-slate-400"
                                        )}>
                                            {act.action === 'Received' && <Plus className="h-2.5 w-2.5" />}
                                            {act.action === 'Removed' && <XCircle className="h-2.5 w-2.5" />}
                                            {act.action === 'Updated' && <Clock className="h-2.5 w-2.5" />}
                                            {act.action}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="space-y-1 max-w-[400px]">
                                            <p className="font-bold text-slate-800 text-[16px] font-figtree leading-tight truncate">{act.activity}</p>
                                            <p className="text-[13px] font-medium text-slate-400 font-figtree">{act.description}</p>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <span className={cn(
                                            "font-bold font-figtree text-[15px] tabular-nums",
                                            act.change.startsWith('+') ? "text-emerald-500" : "text-rose-500"
                                        )}>
                                            {act.change}
                                        </span>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500 italic">
                                                {act.performer.charAt(0)}
                                            </div>
                                            <span className="text-[14px] font-bold text-slate-600 font-figtree">{act.performer}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="pr-10">
                                        <div className="flex flex-col">
                                            <span className="text-[14px] font-bold text-slate-700 font-figtree">{act.timestamp.split(';')[0]}</span>
                                            <span className="text-[11px] font-bold text-slate-300 uppercase font-figtree">{act.timestamp.split(';')[1]}</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-64 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-3 opacity-30 grayscale">
                                        <History className="h-12 w-12" />
                                        <FigtreeText className="text-[18px] font-bold italic">No matching activities found in the archive</FigtreeText>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </PrimarySurfaceCard>
      </div>
    </AppContainer>
  );
}

function ActivitiesSkeleton() {
    return (
        <AppContainer>
            <div className="space-y-10 py-10">
                <div className="space-y-4">
                    <Skeleton className="h-12 w-64 rounded-xl" />
                    <Skeleton className="h-6 w-96 rounded-lg" />
                </div>
                <div className="h-[600px] w-full rounded-[24px] bg-slate-50 animate-pulse" />
            </div>
        </AppContainer>
    );
}
