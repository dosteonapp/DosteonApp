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
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import axiosInstance from "@/lib/axios";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";

function relativeTime(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? "s" : ""} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
}

export default function PersonalDetailsPage() {
  const { user, updateUser } = useUser();
  const [isSaved, setIsSaved] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [fName, setFName] = React.useState(user?.first_name || "");
  const [lName, setLName] = React.useState(user?.last_name || "");

  const [countryCode, setCountryCode] = React.useState("+250");
  const [phoneLocal, setPhoneLocal] = React.useState("");
  const [orgSettings, setOrgSettings] = React.useState<any | null>(null);

  const [showPasswordModal, setShowPasswordModal] = React.useState(false);
  const [passwordStep, setPasswordStep] = React.useState<"form" | "success">("form");
  const [showCurrentPassword, setShowCurrentPassword] = React.useState(false);
  const [showNewPassword, setShowNewPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [changingPassword, setChangingPassword] = React.useState(false);
  const [passwordError, setPasswordError] = React.useState<string | null>(null);

  const flagPalette: Array<{ prefix: string; colors: [string, string, string] }> = [
    { prefix: "+250", colors: ["#00A1DE", "#FAD201", "#20603D"] }, // Rwanda
    { prefix: "+254", colors: ["#000000", "#BB0000", "#006600"] }, // Kenya (approx.)
    { prefix: "+255", colors: ["#1EB53A", "#FCD116", "#000000"] }, // Tanzania
    { prefix: "+256", colors: ["#000000", "#FCDC04", "#D90012"] }, // Uganda
    { prefix: "+257", colors: ["#20603D", "#FFFFFF", "#D21034"] }, // Burundi
    { prefix: "+234", colors: ["#008751", "#FFFFFF", "#008751"] }, // Nigeria
  ];

  const handleCountryCodeChange = (raw: string) => {
    let value = raw.replace(/\s+/g, "");

    if (!value.startsWith("+")) {
      value = "+" + value;
    }

    const digits = value.slice(1).replace(/\D/g, "");
    setCountryCode("+" + digits);
  };

  const handlePhoneChange = (raw: string) => {
    const digitsOnly = raw.replace(/\D/g, "");
    setPhoneLocal(digitsOnly);
  };

  React.useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const settings = await restaurantOpsService.getSettings();
        if (!isMounted || !settings) return;

        const { id, ...rest } = settings as any;
        setOrgSettings(rest);

        const fullPhone = (rest as any).phone as string | undefined;
        if (fullPhone && typeof fullPhone === "string") {
          const normalized = fullPhone.replace(/\s+/g, "");
          const match = flagPalette.find((entry) => normalized.startsWith(entry.prefix));
          if (match) {
            setCountryCode(match.prefix);
            setPhoneLocal(normalized.slice(match.prefix.length));
          } else if (normalized.startsWith("+")) {
            // Fallback: treat first 4 chars as country code
            const cc = normalized.slice(0, 4);
            setCountryCode(cc);
            setPhoneLocal(normalized.slice(cc.length));
          } else {
            setPhoneLocal(normalized);
          }
        }
      } catch (e) {
        console.error("Failed to load organization settings for profile page:", e);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, []);

  const resetModal = () => {
    setPasswordStep("form");
    setShowPasswordModal(false);
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError(null);
  };

  const validateNewPassword = (pwd: string): string | null => {
    if (pwd.length < 8) return "Password must be at least 8 characters long";
    if (!/[A-Z]/.test(pwd)) return "Must contain at least one capital letter";
    if (!/[0-9]/.test(pwd)) return "Must contain at least one number";
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(pwd)) return "Must contain at least one special character";
    return null;
  };

  const handleChangePassword = async () => {
    setPasswordError(null);
    if (!currentPassword) { setPasswordError("Please enter your current password"); return; }
    const validationErr = validateNewPassword(newPassword);
    if (validationErr) { setPasswordError(validationErr); return; }
    if (newPassword !== confirmPassword) { setPasswordError("New passwords do not match"); return; }

    setChangingPassword(true);
    try {
      await axiosInstance.post("auth/change-password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      setPasswordStep("success");
    } catch (err: any) {
      const detail = err?.response?.data?.detail || "Failed to change password. Please try again.";
      setPasswordError(detail);
    } finally {
      setChangingPassword(false);
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
              <div className="flex items-center gap-8">
                <div className="relative group cursor-pointer" onClick={() => document.getElementById('avatar-upload')?.click()}>
                  <Avatar className="h-24 w-24 border-4 border-slate-50 shadow-sm overflow-hidden">
                    {user?.avatar_url ? (
                        <AvatarImage src={user.avatar_url} className="object-cover" />
                    ) : (
                        <AvatarFallback className="bg-slate-100 text-[#3B59DA] font-black text-xl">
                            {user?.first_name?.charAt(0) || "U"}
                        </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="absolute bottom-0 right-0 h-7 w-7 bg-white border border-slate-100 rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#3B59DA] transition-colors">
                    <Camera className="h-4 w-4" />
                  </div>
                </div>
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="h-11 px-6 rounded-xl border-slate-200 text-slate-700 font-bold text-sm bg-white hover:bg-slate-50 gap-2"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="h-4 w-4" />
                    Change Profile Photo
                  </Button>
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        try {
                            const { uploadImage } = await import("@/lib/supabase/storage");
                            const url = await uploadImage(file, 'profiles', 'avatars');
                            if (url) {
                                await updateUser({ avatar_url: url });
                                toast({
                                  title: "Avatar updated",
                                  description: "Your profile photo has been updated.",
                                });
                            }
                        } catch (err) {
                            toast({
                              variant: "destructive",
                              title: "Upload failed",
                              description: "We couldn't upload your avatar. Please try again.",
                            });
                        }
                    }}
                  />
                  <p className="text-xs text-slate-400 font-medium">SVG, PNG, or JPG. Max 2MB.</p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name" className="text-sm font-bold text-slate-500">First Name</Label>
                    <Input 
                      id="first-name" 
                      value={fName} 
                      onChange={(e) => setFName(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name" className="text-sm font-bold text-slate-500">Last Name</Label>
                    <Input 
                      id="last-name" 
                      value={lName} 
                      onChange={(e) => setLName(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800" 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-bold text-slate-500">Email Address</Label>
                  <Input id="email" defaultValue={user?.email || ""} disabled className="h-14 rounded-xl bg-slate-50 border-slate-200 text-slate-500 font-medium cursor-not-allowed" />
                </div>


                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-sm font-bold text-slate-500">Phone Number</Label>
                  <div className="flex gap-3">
                    <div className="flex items-center gap-2 border border-slate-200 rounded-xl px-4 bg-slate-50/60 min-w-[150px]">
                      <span className="h-5 w-7 rounded-sm relative overflow-hidden flex flex-col">
                        {(() => {
                          const normalized = countryCode.replace(/\s+/g, "");
                          const match = flagPalette.find((entry) => normalized.startsWith(entry.prefix));
                          const colors = match?.colors || ["#059669", "#FFFFFF", "#059669"];
                          return (
                            <>
                              <span className="flex-1 w-full" style={{ backgroundColor: colors[0] }} />
                              <span className="flex-1 w-full" style={{ backgroundColor: colors[1] }} />
                              <span className="flex-1 w-full" style={{ backgroundColor: colors[2] }} />
                            </>
                          );
                        })()}
                      </span>
                      <input
                        className="w-16 bg-transparent border-none outline-none text-sm font-bold text-slate-700"
                        value={countryCode}
                        onChange={(e) => handleCountryCodeChange(e.target.value)}
                        placeholder="+250"
                      />
                      <ChevronDown className="h-4 w-4 text-slate-400" />
                    </div>
                    <Input
                      id="phone"
                      value={phoneLocal}
                      onChange={(e) => handlePhoneChange(e.target.value)}
                      className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium text-slate-800 flex-1"
                    />
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
                    {user?.password_changed_at && (
                      <p className="text-xs text-slate-400 font-medium">Last changed {relativeTime(user.password_changed_at)}</p>
                    )}
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
                            <DialogTitle className="text-2xl font-bold text-slate-800">
                              Change Password
                            </DialogTitle>
                            <DialogDescription className="text-[15px] text-slate-400 font-medium">
                              Update your password to keep your account secure.
                            </DialogDescription>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={resetModal}
                              className="absolute right-6 top-6 h-10 w-10 text-slate-300 hover:text-slate-900 rounded-full"
                            >
                              <X className="h-6 w-6" />
                            </Button>
                          </div>
                          
                          <div className="p-8 border-t border-slate-100 space-y-6">
                            <div className="space-y-3">
                              <Label className="text-[14px] font-bold text-slate-500">Enter Current Password</Label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <Input
                                  type={showCurrentPassword ? "text" : "password"}
                                  placeholder="••••••••••"
                                  value={currentPassword}
                                  onChange={(e) => { setCurrentPassword(e.target.value); setPasswordError(null); }}
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
                            </div>

                            <div className="space-y-3">
                              <Label className="text-[14px] font-bold text-slate-500">New Password</Label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <Input
                                  type={showNewPassword ? "text" : "password"}
                                  placeholder="Min 8 chars, uppercase, number, special"
                                  value={newPassword}
                                  onChange={(e) => { setNewPassword(e.target.value); setPasswordError(null); }}
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
                            </div>

                            <div className="space-y-3">
                              <Label className="text-[14px] font-bold text-slate-500">Confirm New Password</Label>
                              <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
                                <Input
                                  type={showConfirmPassword ? "text" : "password"}
                                  placeholder="Re-enter new password"
                                  value={confirmPassword}
                                  onChange={(e) => { setConfirmPassword(e.target.value); setPasswordError(null); }}
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

                            {passwordError && (
                              <p className="text-[13px] font-semibold text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                                {passwordError}
                              </p>
                            )}
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
                              onClick={handleChangePassword}
                              disabled={changingPassword}
                              className="h-14 px-12 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-bold rounded-2xl shadow-lg shadow-indigo-100 transition-all w-1/2 active:scale-95"
                            >
                              {changingPassword ? "Updating..." : "Update Password"}
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
          onClick={async () => {
            setSaving(true);
            try {
              await updateUser({ first_name: fName, last_name: lName });

              // Fetch settings fresh if they failed to load on mount
              let currentSettings = orgSettings;
              if (!currentSettings) {
                try {
                  const fetched = await restaurantOpsService.getSettings();
                  const { id, ...rest } = fetched as any;
                  currentSettings = rest;
                  setOrgSettings(rest);
                } catch {
                  currentSettings = {};
                }
              }

              const fullPhone = `${countryCode}${phoneLocal}`.trim();
              const nextSettings = { ...currentSettings, phone: fullPhone };
              await restaurantOpsService.updateSettings(nextSettings);
              setOrgSettings(nextSettings);

              setIsSaved(true);
            } catch (err: any) {
              toast({
                variant: "destructive",
                title: "Failed to save settings",
                description: err?.response?.data?.detail || err?.message || "Something went wrong. Please try again.",
              });
            } finally {
              setSaving(false);
            }
          }}
          disabled={saving}
          className="h-14 px-20 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-base"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
