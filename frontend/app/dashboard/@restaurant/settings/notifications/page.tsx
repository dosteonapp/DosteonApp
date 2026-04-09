"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { toast } from "@/hooks/use-toast";

interface NotifPrefs {
  in_app: boolean;
  push: boolean;
  email_summaries: boolean;
  quiet_hours_enabled: boolean;
  quiet_from: string;
  quiet_until: string;
  service_alerts: boolean;
  critical_stock: boolean;
  missed_stock_counts: boolean;
  summary_freq: string;
}

const DEFAULTS: NotifPrefs = {
  in_app: true,
  push: true,
  email_summaries: true,
  quiet_hours_enabled: false,
  quiet_from: "10:30 PM",
  quiet_until: "07:00 AM",
  service_alerts: true,
  critical_stock: true,
  missed_stock_counts: true,
  summary_freq: "once",
};

export default function NotificationSettingsPage() {
  const [isSaved, setIsSaved] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [prefs, setPrefs] = React.useState<NotifPrefs>(DEFAULTS);
  const [savedPrefs, setSavedPrefs] = React.useState<NotifPrefs>(DEFAULTS);

  React.useEffect(() => {
    (async () => {
      try {
        const settings = await restaurantOpsService.getSettings();
        const notif = (settings as any).notification_settings;
        if (notif && typeof notif === "object") {
          const merged = { ...DEFAULTS, ...notif };
          setPrefs(merged);
          setSavedPrefs(merged);
        }
      } catch (e) {
        // silently use defaults
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const set = <K extends keyof NotifPrefs>(key: K, value: NotifPrefs[K]) =>
    setPrefs((p) => ({ ...p, [key]: value }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const raw = await restaurantOpsService.getSettings();
      const { id: _id, ...current } = raw as any;
      await restaurantOpsService.updateSettings({
        ...current,
        notification_settings: prefs,
      });
      setSavedPrefs(prefs);
      setIsSaved(true);
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to save",
        description: err?.message || "Could not save notification settings.",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDiscard = () => setPrefs(savedPrefs);

  if (loading) return <div className="p-10 text-center text-slate-400 font-figtree">Loading settings...</div>;

  if (isSaved) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-8 animate-in zoom-in duration-500 max-w-2xl mx-auto px-4">
        <div className="relative h-24 w-24 flex items-center justify-center">
          <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse opacity-50" />
          <div className="absolute inset-2 bg-emerald-200/50 rounded-full animate-ping" />
          <div className="relative h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 border-4 border-white">
            <Check className="h-10 w-10 text-white stroke-[4px]" />
          </div>
        </div>
        <div className="space-y-4">
          <h2 className="text-4xl font-black text-slate-800 tracking-tight">Settings Saved!</h2>
          <p className="text-[19px] text-slate-500 font-medium leading-relaxed max-w-lg mx-auto">
            Your notification preferences have been successfully updated and applied to your account.
          </p>
        </div>
        <Button
          onClick={() => setIsSaved(false)}
          className="h-14 px-16 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all mt-4 w-full md:w-auto"
        >
          Return to Settings
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl pb-10">
      {/* Delivery Channels */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Delivery channels</h2>
            <p className="text-sm text-slate-400 font-medium">Choose where notifications are sent for this restaurant.</p>
          </div>
          <div className="border-t border-slate-50 px-8 py-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">In-app alerts</p>
                <p className="text-sm text-slate-400 font-medium">Show banners and alerts inside Dosteon during service.</p>
              </div>
              <Switch
                checked={prefs.in_app}
                onCheckedChange={(v) => set("in_app", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Push notifications</p>
                <p className="text-sm text-slate-400 font-medium">Alert key staff on their phones for critical updates.</p>
              </div>
              <Switch
                checked={prefs.push}
                onCheckedChange={(v) => set("push", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Email summaries</p>
                <p className="text-sm text-slate-400 font-medium">Send non-urgent updates outside service hours.</p>
              </div>
              <Switch
                checked={prefs.email_summaries}
                onCheckedChange={(v) => set("email_summaries", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Quiet Hours</h2>
            <p className="text-sm text-slate-400 font-medium">Limit non-critical notifications during off-hours.</p>
          </div>
          <div className="border-t border-slate-50 px-8 py-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Enable quiet hours</p>
                <p className="text-sm text-slate-400 font-medium">Critical alerts still come through if service is at risk.</p>
              </div>
              <Switch
                checked={prefs.quiet_hours_enabled}
                onCheckedChange={(v) => set("quiet_hours_enabled", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
            <div className={cn("grid grid-cols-1 md:grid-cols-2 gap-6 transition-opacity", !prefs.quiet_hours_enabled && "opacity-40 pointer-events-none")}>
              <div className="space-y-3">
                <Label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">From</Label>
                <Select value={prefs.quiet_from} onValueChange={(v) => set("quiet_from", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00 PM">09:00 PM</SelectItem>
                    <SelectItem value="09:30 PM">09:30 PM</SelectItem>
                    <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                    <SelectItem value="10:30 PM">10:30 PM</SelectItem>
                    <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                    <SelectItem value="11:30 PM">11:30 PM</SelectItem>
                    <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Until</Label>
                <Select value={prefs.quiet_until} onValueChange={(v) => set("quiet_until", v)}>
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="05:00 AM">05:00 AM</SelectItem>
                    <SelectItem value="06:00 AM">06:00 AM</SelectItem>
                    <SelectItem value="07:00 AM">07:00 AM</SelectItem>
                    <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                    <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <div className="px-8 pb-8">
            <p className="text-sm text-slate-400 font-medium italic">Non-critical email and push alerts are held until quiet hours end.</p>
          </div>
        </CardContent>
      </Card>

      {/* Service & Inventory Alerts */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Service & inventory alerts</h2>
            <p className="text-sm text-slate-400 font-medium">Fine-tune alerts that affect live service and stock control.</p>
          </div>
          <div className="border-t border-slate-50 px-8 py-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Service alerts</p>
                <p className="text-sm text-slate-400 font-medium">Critical alerts still come through if service is at risk.</p>
              </div>
              <Switch
                checked={prefs.service_alerts}
                onCheckedChange={(v) => set("service_alerts", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Critical stock levels</p>
                <p className="text-sm text-slate-400 font-medium">Low stock for today's menu items and safety thresholds.</p>
              </div>
              <Switch
                checked={prefs.critical_stock}
                onCheckedChange={(v) => set("critical_stock", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Missed stock counts</p>
                <p className="text-sm text-slate-400 font-medium">Remind teams when Opening & Prep or Closing counts are incomplete.</p>
              </div>
              <Switch
                checked={prefs.missed_stock_counts}
                onCheckedChange={(v) => set("missed_stock_counts", v)}
                className="data-[state=checked]:bg-[#3B59DA]"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summaries */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Daily Summaries</h2>
            <p className="text-sm text-slate-400 font-medium">Choose if you receive a digest of the day's activity.</p>
          </div>
          <div className="border-t border-slate-50 px-8 py-8 space-y-8">
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Summary Frequency</h3>
              <p className="text-xs text-slate-400 font-medium">Includes key service health, usage, and inventory highlights.</p>
            </div>
            <RadioGroup
              value={prefs.summary_freq}
              onValueChange={(v) => set("summary_freq", v)}
              className="space-y-4"
            >
              {[
                { value: "once", label: "Once per day (after closing)" },
                { value: "twice", label: "Twice per day (after lunch & closing)" },
                { value: "none", label: "No summary emails" },
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center gap-4 group cursor-pointer transition-all">
                  <RadioGroupItem value={value} id={value} className="border-slate-200 text-[#3B59DA] focus:ring-offset-2" />
                  <Label
                    htmlFor={value}
                    className={cn(
                      "text-sm transition-colors cursor-pointer",
                      prefs.summary_freq === value ? "font-bold text-slate-700" : "font-medium text-slate-400 group-hover:text-slate-500"
                    )}
                  >
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div className="px-8 pb-8">
            <p className="text-xs text-slate-400 font-medium">Summaries are sent to manager-level users only.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 pb-20">
        <Button
          variant="outline"
          onClick={handleDiscard}
          className="h-14 px-12 rounded-xl border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all"
        >
          Discard
        </Button>
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
