"use client";

import { useEffect, useState } from "react";
import { 
  CheckCircle2,
  AlertCircle,
  TriangleAlert,
  History,
  Info,
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";

interface Notification {
  id: string;
  type: "success" | "alert" | "warning" | "info" | "history";
  title: string;
  description: string;
  time: string;
  unread: boolean;
  by?: string;
}

export default function NotificationsPage() {
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filter, setFilter] = useState("All");
  const filters = ["All", "Unread", "Alerts"];

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await restaurantOpsService.getNotifications({ offset: 0, limit: 50 });
        setNotifications(data);
      } catch (err) {
        console.error("Failed to fetch notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, []);

  if (loading) return <div className="p-10 text-center text-slate-400 font-figtree">Loading notifications...</div>;

  const filteredNotifications = notifications.filter(n => {
    if (filter === "Unread") return n.unread;
    if (filter === "Alerts") return n.type === 'alert' || n.type === 'warning';
    return true;
  });

  return (
    <div className="max-w-4xl mx-auto w-full pb-20 font-figtree animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Header Area */}
      <div className="flex items-center justify-between mb-8 relative z-10">
        <div className="space-y-2">
          <h2 className="text-[34px] font-bold text-[#1E293B] tracking-tight font-figtree">Notifications</h2>
          <p className="text-[14px] font-medium text-slate-400">Stay updated with your kitchen and inventory alerts</p>
        </div>
        <div className="flex bg-[#F8FAFC] p-1 rounded-xl border border-slate-100">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-5 py-1.5 rounded-lg font-bold text-[11px] transition-all uppercase tracking-wider",
                filter === f 
                  ? "bg-white text-[#3B59DA] shadow-sm" 
                  : "text-slate-400 hover:text-slate-500"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.map((notification) => (
          <NotificationItem key={notification.id} notification={notification} />
        ))}
        {filteredNotifications.length === 0 && (
          <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No notifications found</p>
          </div>
        )}
      </div>
      
      {/* No More Notifications */}
      {filteredNotifications.length > 0 && (
        <div className="mt-12 text-center py-10 border-t border-slate-50">
          <p className="text-slate-300 text-xs font-bold uppercase tracking-widest">No more notifications</p>
        </div>
      )}
    </div>
  );
}

function NotificationItem({ notification }: { notification: Notification }) {
  const config = {
    success: { icon: CheckCircle2, color: "text-emerald-500", bg: "bg-emerald-50" },
    alert: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-50" },
    warning: { icon: TriangleAlert, color: "text-amber-500", bg: "bg-amber-50" },
    history: { icon: History, color: "text-[#3B59DA]", bg: "bg-indigo-50" },
    info: { icon: Info, color: "text-sky-500", bg: "bg-sky-50" }
  };

  const { icon: Icon, color, bg } = config[notification.type] || config.info;

  return (
    <Card className={cn(
      "border-slate-100 shadow-sm transition-all rounded-[20px] bg-white group hover:border-indigo-100 hover:shadow-md cursor-pointer",
      notification.unread && "border-l-[6px] border-l-[#3B59DA]"
    )}>
      <CardContent className="p-5 flex items-start gap-5">
        <div className={cn("h-11 w-11 rounded-xl flex items-center justify-center shrink-0 border border-slate-100/50", bg)}>
          <Icon className={cn("h-5 w-5", color)} />
        </div>

        <div className="flex-1 min-w-0 space-y-1 pt-0.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
                <h4 className="font-bold text-[#1E293B] text-[15px] tracking-tight">{notification.title}</h4>
                {notification.unread && (
                    <Badge className="h-4 px-1.5 bg-[#3B59DA] text-white font-bold text-[8px] uppercase border-none rounded-full">New</Badge>
                )}
            </div>
            <span className="text-[10px] font-bold text-slate-300 uppercase shrink-0">{notification.time}</span>
          </div>

          <p className="text-[13px] font-medium text-slate-500 leading-relaxed truncate group-hover:block group-hover:whitespace-normal transition-all">
            {notification.description}
          </p>
          
          {notification.by && (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">
                Activity by <span className="text-[#3B59DA]">{notification.by}</span>
            </p>
          )}
        </div>
        
        <div className="pt-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-[#3B59DA]">
                <ChevronRight className="h-4 w-4" />
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
