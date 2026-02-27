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

export default function NotificationSettingsPage() {
  const [isSaved, setIsSaved] = React.useState(false);
  const [summaryFreq, setSummaryFreq] = React.useState("once");

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
      {/* Delivery Channels Card */}
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
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Push notifications</p>
                <p className="text-sm text-slate-400 font-medium">Alert key staff on their phones for critical updates.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Email summaries</p>
                <p className="text-sm text-slate-400 font-medium">Send non-urgent updates outside service hours.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quiet Hours Card */}
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
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">From</Label>
                <Select defaultValue="10:30 PM">
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                    <SelectItem value="10:30 PM">10:30 PM</SelectItem>
                    <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-3">
                <Label className="text-[13px] font-bold text-slate-400 uppercase tracking-widest">Until</Label>
                <Select defaultValue="07:00 AM">
                  <SelectTrigger className="h-12 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00 AM">06:00 AM</SelectItem>
                    <SelectItem value="07:00 AM">07:00 AM</SelectItem>
                    <SelectItem value="08:00 AM">08:00 AM</SelectItem>
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

      {/* Service & Inventory Alerts Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 space-y-1">
            <h2 className="text-lg font-bold text-slate-800">Service & inventory alerts</h2>
            <p className="text-sm text-slate-400 font-medium">Fine-tune alerts that affect live service and stock control.</p>
          </div>
          <div className="border-t border-slate-50 px-8 py-6 space-y-8">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Enable quiet hours</p>
                <p className="text-sm text-slate-400 font-medium">Critical alerts still come through if service is at risk.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Critical stock levels</p>
                <p className="text-sm text-slate-400 font-medium">Low stock for todays menu items and safety thresholds.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-bold text-slate-800 text-[15px]">Missed stock counts</p>
                <p className="text-sm text-slate-400 font-medium">Remind teams when Opening & Prep or Closing counts are incomplete.</p>
              </div>
              <Switch defaultChecked className="data-[state=checked]:bg-[#3B59DA]" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Summaries Card */}
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

            <RadioGroup value={summaryFreq} onValueChange={setSummaryFreq} className="space-y-4">
              <div className="flex items-center gap-4 group cursor-pointer transition-all">
                <RadioGroupItem value="once" id="once" className="border-slate-200 text-[#3B59DA] focus:ring-offset-2" />
                <Label htmlFor="once" className={cn("text-sm transition-colors cursor-pointer", summaryFreq === 'once' ? 'font-bold text-slate-700' : 'font-medium text-slate-400 group-hover:text-slate-500')}>Once per day (after closing)</Label>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer transition-all">
                <RadioGroupItem value="twice" id="twice" className="border-slate-200 text-[#3B59DA] focus:ring-offset-2" />
                <Label htmlFor="twice" className={cn("text-sm transition-colors cursor-pointer", summaryFreq === 'twice' ? 'font-bold text-slate-700' : 'font-medium text-slate-400 group-hover:text-slate-500')}>Twice per day (after lunch & closing)</Label>
              </div>
              <div className="flex items-center gap-4 group cursor-pointer transition-all">
                <RadioGroupItem value="none" id="none" className="border-slate-200 text-[#3B59DA] focus:ring-offset-2" />
                <Label htmlFor="none" className={cn("text-sm transition-colors cursor-pointer", summaryFreq === 'none' ? 'font-bold text-slate-700' : 'font-medium text-slate-400 group-hover:text-slate-500')}>No summary emails</Label>
              </div>
            </RadioGroup>
          </div>
          <div className="px-8 pb-8">
            <p className="text-xs text-slate-400 font-medium">Summaries are sent to manager-level users only.</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-4 pb-20">
        <Button variant="outline" className="h-14 px-12 rounded-xl border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50 transition-all">
          Discard
        </Button>
        <Button 
          onClick={() => setIsSaved(true)}
          className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
