"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Camera, 
  Upload, 
  Key, 
  ChevronDown,
  Lock,
  Eye,
  EyeOff,
  X,
  Check
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@/context/UserContext";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function PersonalDetailsPage() {
  const { user } = useUser();
  const [isSaved, setIsSaved] = React.useState(false);

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordStep, setPasswordStep] = React.useState<"form" | "success">("form");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);

  const resetModal = () => {
    setPasswordStep("form");
    setShowPasswordModal(false);
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
            Your profile information and account security preferences have been successfully updated and applied to your account.
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
    <div className="space-y-8 max-w-7xl animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Profile Information Card */}
        <Card className="lg:col-span-7 border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="p-8 space-y-1">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Profile Information</h2>
              <p className="text-sm text-slate-400 font-medium">These details will be displayed to other users on the platform.</p>
            </div>
            
            <div className="border-t border-slate-50 p-8 space-y-10">
              {/* Photo Upload Section */}
              <div className="flex items-center gap-8">
                <div className="relative group">
                  <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm">
                    <AvatarImage src="/placeholder.svg" />
                    <AvatarFallback className="bg-slate-100 text-[#3B59DA] font-black text-xl">H</AvatarFallback>
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-7 w-7 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#3B59DA] transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Button variant="outline" className="h-11 px-6 rounded-xl border-slate-200 text-slate-700 font-bold text-sm bg-white hover:bg-slate-50 gap-2">
                    <Upload className="h-4 w-4" />
                    Change Profile Photo
                  </Button>
                  <p className="text-xs text-slate-400 font-medium">SVG, PNG, or JPG. Max 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-sm font-bold text-slate-500">First Name</Label>
                    <Input id="first-name" defaultValue={user?.first_name || ""} className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-sm font-bold text-slate-500">Last Name</Label>
                    <Input id="last-name" defaultValue={user?.last_name || ""} className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-500">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ""} disabled className="h-14 rounded-xl bg-slate-50 border-slate-200 text-slate-500 font-medium cursor-not-allowed" />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold text-slate-500">Phone Number</Label>
                  <div className="flex gap-3">
                    <div className="relative group">
                      <div className="h-14 px-4 rounded-xl border border-slate-200 bg-white flex items-center gap-3 cursor-pointer hover:border-slate-300 transition-all min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex flex-col gap-0.5 w-6 h-4">
                            <div className="bg-emerald-600 flex-1 w-full rounded-[1px]"></div>
                            <div className="bg-white flex-1 w-full rounded-[1px]"></div>
                            <div className="bg-emerald-600 flex-1 w-full rounded-[1px]"></div>
                          </div>
                          <span className="font-bold text-slate-800 text-sm font-mono">+234</span>
                        </div>
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                    <Input id="phone" defaultValue="8023456789" className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800 flex-1" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="lg:col-span-5 border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
          <CardContent className="p-0">
            <div className="p-8 space-y-1">
              <h2 className="text-lg font-bold text-slate-800 tracking-tight">Security</h2>
              <p className="text-sm text-slate-400 font-medium">Manage your password and authentication methods.</p>
            </div>
            
            <div className="border-t border-slate-50 p-6 space-y-6 bg-slate-50/10">
              {/* Password Section */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-6">
                <div className="flex justify-between items-start gap-4">
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-slate-800">Password</h3>
                    <p className="text-xs text-slate-400 font-medium">Last changed 3 months ago</p>
                  </div>
                  
                  <Dialog open={showPasswordModal} onOpenChange={(open) => {
                    if (!open) resetModal();
                    setShowPasswordModal(open);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="h-10 px-6 rounded-xl border-slate-200 text-slate-700 font-bold text-xs bg-white hover:bg-slate-50 gap-2 shadow-sm transition-all active:scale-95">
                        <Key className="h-3.5 w-3.5" />
                        Change Password
                      </Button>
                    </DialogTrigger>
                    <DialogContent className={cn(
                      "sm:max-w-[650px] p-0 overflow-hidden border-none rounded-[32px] gap-0 outline-none",
                      passwordStep === "success" ? "sm:max-w-[500px]" : ""
                    )}>
                      {passwordStep === "form" ? (
                        <>
                          <div className="p-8 space-y-2 relative">
                            <h2 className="text-2xl font-bold text-slate-800">Change Password</h2>
                            <p className="text-[15px] text-slate-400 font-medium">Update your password to keep your account secure.</p>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={resetModal}
                              className="absolute right-6 top-6 h-10 w-10 text-slate-300 hover:text-slate-900 rounded-full"
                            >
                              <X className="h-6 w-6" />
                            </Button>
                          </div>
                          
                          <div className="p-8 border-t border-slate-100 space-y-8">
                            <div className="space-y-3">
                              <Label className="text-[14px] font-bold text-slate-500">Enter Current Password</Label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <Input 
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="••••••••••"
                                  className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 focus:ring-indigo-500 font-medium"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-900"
                                >
                                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                              </div>
                              <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                                Password must be at least <span className="font-bold text-slate-600">8 Characters</span> and must contain at least a <br />
                                <span className="font-bold text-slate-600">Capital Letter</span>, a <span className="font-bold text-slate-600">Number</span> and a <span className="font-bold text-slate-600">Special Character</span>.
                              </p>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-[14px] font-bold text-slate-500">New Password</Label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <Input 
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Placeholder"
                                  className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 focus:ring-indigo-500 font-medium"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setShowNewPassword(!showNewPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-900"
                                >
                                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                              </div>
                              <p className="text-[13px] text-slate-400 font-medium leading-relaxed">
                                Password must be at least <span className="font-bold text-slate-600">8 Characters</span> and must contain at least a <span className="font-bold text-slate-600">Capital Letter</span>, a <span className="font-bold text-slate-600">Number</span> and a <span className="font-bold text-slate-600">Special Character</span>.
                              </p>
                            </div>

                            <div className="space-y-3">
                              <Label className="text-[14px] font-bold text-slate-500">Confirm New Password</Label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <Input 
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Placeholder"
                                  className="h-14 pl-12 pr-12 rounded-2xl border-slate-200 focus:ring-indigo-500 font-medium"
                                />
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                  className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 text-slate-400 hover:text-slate-900"
                                >
                                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                                </Button>
                              </div>
                            </div>
                          </div>

                          <div className="p-8 bg-slate-50/80 flex items-center justify-center gap-4">
                            <Button 
                              variant="outline" 
                              onClick={resetModal}
                              className="h-14 px-12 rounded-2xl border-slate-200 text-slate-700 font-bold bg-white hover:bg-slate-50 transition-all w-1/2"
                            >
                              Cancel
                            </Button>
                            <Button 
                              onClick={() => setPasswordStep("success")}
                              className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all w-1/2"
                            >
                              Update Password
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="p-16 flex flex-col items-center text-center space-y-6 animate-in zoom-in duration-300">
                          <div className="relative h-20 w-20 flex items-center justify-center">
                            <div className="absolute inset-0 bg-emerald-100 rounded-full animate-pulse opacity-50" />
                            <div className="absolute inset-2 bg-emerald-200/50 rounded-full animate-ping" />
                            <div className="relative h-14 w-14 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg shadow-emerald-100 border-4 border-white">
                              <Check className="h-8 w-8 text-white stroke-[4px]" />
                            </div>
                          </div>
                          
                          <div className="space-y-4">
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight">Password Updated!</h2>
                            <p className="text-[17px] text-slate-500 font-medium leading-relaxed px-4">
                              Your password has been successfully updated. <br />
                              Please use your new password next time you log in.
                            </p>
                          </div>

                          <Button 
                            onClick={resetModal}
                            className="h-14 px-16 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all mt-4 w-full"
                          >
                            Return to Settings
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              {/* 2FA Section */}
              <div className="p-6 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-6">
                <div className="flex justify-between items-center gap-4">
                  <div className="space-y-1">
                    <h3 className="text-[15px] font-bold text-slate-800">Two-Factor Authentication</h3>
                    <p className="text-xs text-slate-400 font-medium">Add an extra layer of security to your account.</p>
                  </div>
                  <Button variant="outline" className="h-10 px-8 rounded-xl border-slate-200 text-slate-700 font-bold text-xs bg-white hover:bg-slate-50 shadow-sm transition-all active:scale-95">
                    Enable 2FA
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={() => setIsSaved(true)}
          className="h-14 px-20 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-base"
        >
          Save Changes
        </Button>
      </div>
    </div>
  );
}
