"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Building2, 
  Clock, 
  Settings2, 
  Image as ImageIcon, 
  Upload,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function RestaurantProfilePage() {
  const [isSaved, setIsSaved] = React.useState(false);
  const [activeDays, setActiveDays] = React.useState<string[]>(["Mon", "Tue", "Wed", "Thur", "Fri"]);
  
  const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  const toggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter(d => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

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
            Your restaurant profile and operational settings have been successfully updated and applied to your account.
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
    <div className="space-y-6 max-w-4xl pb-10 animate-in fade-in duration-500 mx-auto sm:mx-0">
      {/* Basic Details Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 md:p-8 space-y-1">
            <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-slate-400" />
                <h2 className="text-base md:text-lg font-bold text-slate-800">Basic Details</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium ml-8">These details appear on your internal dashboards and reports.</p>
          </div>
          <div className="border-t border-slate-50 p-6 md:p-8 space-y-8">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
                <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center border-dashed shrink-0">
                    <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
                </div>
                <div className="space-y-3 text-center sm:text-left">
                    <Button variant="outline" className="h-10 md:h-11 px-6 rounded-xl border-slate-200 text-slate-700 font-bold text-xs md:text-sm bg-white hover:bg-slate-50 gap-2">
                        <Upload className="h-4 w-4" />
                        Upload Logo
                    </Button>
                    <p className="text-[10px] md:text-xs text-slate-400 font-medium">SVG, PNG, or JPG. Max 2MB.</p>
                </div>
            </div>

            <div className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="restaurant-name" className="text-sm font-bold text-slate-500">Restaurant Name</Label>
                    <Input id="restaurant-name" placeholder="Restaurant Name" className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="business-email" className="text-sm font-bold text-slate-500">Business Email Address</Label>
                        <Input id="business-email" placeholder="food@restaurant.com" className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="business-phone" className="text-sm font-bold text-slate-500">Business Phone Number</Label>
                        <Input id="business-phone" placeholder="+250 123 456 789" className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-bold text-slate-500">Location</Label>
                    <Input id="location" placeholder="Enter address" className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium" />
                </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operating Hours Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-6 md:p-8 space-y-1">
            <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-slate-400" />
                <h2 className="text-base md:text-lg font-bold text-slate-800">Operating Hours</h2>
            </div>
            <p className="text-xs md:text-sm text-slate-400 font-medium ml-8">Define your standard service window and days of operation.</p>
          </div>
          <div className="border-t border-slate-50 p-6 md:p-8 space-y-10">
            <div className="space-y-6">
              <h3 className="text-sm md:text-[15px] font-bold text-slate-800">Operating Days</h3>
              <div className="grid grid-cols-4 sm:flex sm:flex-wrap gap-2 md:gap-3">
                {days.map((day) => (
                  <Button
                    key={day}
                    variant="outline"
                    className={cn(
                      "h-12 md:h-14 w-full sm:w-20 rounded-xl font-bold text-xs md:text-sm transition-all border-slate-200",
                      activeDays.includes(day)
                        ? "bg-[#3B59DA] text-white border-[#3B59DA] shadow-md shadow-indigo-100 scale-105"
                        : "bg-white text-slate-500 hover:bg-slate-50"
                    )}
                    onClick={() => toggleDay(day)}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <p className="text-[10px] md:text-xs text-slate-400 font-medium">Select the days your restaurant is open for business.</p>
            </div>

            <div className="space-y-6">
              <h3 className="text-[15px] font-bold text-slate-800">Operating Times</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-400">Opening Time</Label>
                  <Select defaultValue="09:00 AM">
                    <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="08:00 AM">08:00 AM</SelectItem>
                      <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                      <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Set your business opening time for each business work day.</p>
                </div>
                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-400">Closing Time</Label>
                  <Select defaultValue="11:00 PM">
                    <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                      <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                      <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-400 font-medium leading-relaxed">Set your business closing time for each business day.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Rules Card */}
      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          <div className="p-8 space-y-1">
            <div className="flex items-center gap-3">
                <Settings2 className="h-5 w-5 text-slate-400" />
                <h2 className="text-lg font-bold text-slate-800">Workflow Rules</h2>
            </div>
            <p className="text-sm text-slate-400 font-medium ml-8">Control when operational workflows unlock for your team.</p>
          </div>
          <div className="border-t border-slate-50 p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="space-y-3">
                <Label className="text-[15px] font-bold text-slate-800">Closing Stock Entry Unlocks At</Label>
                <Select defaultValue="10:00 PM">
                  <SelectTrigger className="h-14 rounded-xl border-slate-200 bg-white font-bold text-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="09:00 PM">09:00 PM</SelectItem>
                    <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                    <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pt-8">
                <p className="text-sm text-slate-400 font-medium bg-slate-50/50 p-6 rounded-2xl border border-dashed border-slate-200 leading-relaxed">
                  Staff cannot access the end-of-day closing workflow before this time.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-20">
        <Button 
          onClick={() => setIsSaved(true)} 
          className="h-14 px-14 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-base"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
