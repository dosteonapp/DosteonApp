"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  Clock,
  Image as ImageIcon,
  Upload,
  Check,
  Store,
  Plus,
  Pencil,
  Trash2,
  X,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { FigtreeText } from "@/components/ui/dosteon-ui";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";
import { toast } from "@/hooks/use-toast";
import { useUser } from "@/context/UserContext";
import { useBrand, Brand } from "@/context/BrandContext";
import axiosInstance from "@/lib/axios";

// ---------------------------------------------------------------------------
// Brand color palette
// ---------------------------------------------------------------------------

const BRAND_PALETTE = [
  { bg: "from-indigo-500 to-indigo-600" },
  { bg: "from-orange-500 to-orange-600" },
  { bg: "from-violet-500 to-violet-600" },
  { bg: "from-sky-500 to-sky-600" },
  { bg: "from-emerald-500 to-emerald-600" },
  { bg: "from-rose-500 to-rose-600" },
  { bg: "from-amber-500 to-amber-600" },
  { bg: "from-pink-500 to-pink-600" },
];

function brandBg(idx: number) {
  return BRAND_PALETTE[idx % BRAND_PALETTE.length].bg;
}

// ---------------------------------------------------------------------------
// BrandRow
// ---------------------------------------------------------------------------

interface BrandRowProps {
  brand: Brand;
  idx: number;
  isLastActive: boolean;
  isOwner: boolean;
  editingId: string | null;
  editName: string;
  savingId: string | null;
  onStartEdit: (brand: Brand) => void;
  onCancelEdit: () => void;
  onEditNameChange: (v: string) => void;
  onRename: (brandId: string) => void;
  onToggle: (brand: Brand) => void;
  onDeleteRequest: (brandId: string) => void;
}

function BrandRow({
  brand,
  idx,
  isLastActive,
  isOwner,
  editingId,
  editName,
  savingId,
  onStartEdit,
  onCancelEdit,
  onEditNameChange,
  onRename,
  onToggle,
  onDeleteRequest,
}: BrandRowProps) {
  const isEditing = editingId === brand.id;
  const isSaving = savingId === brand.id;

  return (
    <div className="flex items-center gap-4 px-4 py-4 group hover:bg-slate-50/50 transition-colors">
      <div className="shrink-0">
        {brand.logo_url ? (
          <img
            src={brand.logo_url}
            alt={brand.name}
            className="h-9 w-9 rounded-xl object-cover"
          />
        ) : (
          <div
            className={cn(
              "h-9 w-9 rounded-xl flex items-center justify-center text-white text-sm font-black bg-gradient-to-br",
              brandBg(idx)
            )}
          >
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-2">
            <Input
              value={editName}
              onChange={(e) => onEditNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") onRename(brand.id);
                if (e.key === "Escape") onCancelEdit();
              }}
              className="h-8 rounded-lg text-sm font-bold max-w-[180px]"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => onRename(brand.id)}
              disabled={isSaving || !editName.trim()}
              className="h-8 px-2 rounded-lg bg-[#3B59DA] hover:bg-[#2d4bc8] text-white"
            >
              {isSaving ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEdit}
              className="h-8 w-8 rounded-lg text-slate-400"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-bold text-slate-800 truncate">
              {brand.name}
            </span>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0",
                brand.is_active
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-slate-50 border-slate-200 text-slate-400"
              )}
            >
              {brand.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
        )}
        <p className="text-[11px] text-slate-400 font-medium mt-0.5">
          Added{" "}
          {new Date(brand.created_at).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(brand)}
            disabled={!!savingId}
            className="h-8 w-8 rounded-lg text-slate-400 hover:text-slate-700"
            title="Rename brand"
          >
            <Pencil className="h-3 w-3" />
          </Button>
        )}

        {isOwner && (
          <Switch
            checked={brand.is_active}
            disabled={isLastActive || !!savingId}
            onCheckedChange={() => onToggle(brand)}
            className="data-[state=checked]:bg-emerald-500"
            title={
              isLastActive
                ? "Cannot deactivate the last active brand"
                : brand.is_active
                ? "Deactivate brand"
                : "Activate brand"
            }
          />
        )}

        {isOwner && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isLastActive || !!savingId}
            onClick={() => onDeleteRequest(brand.id)}
            className="h-8 w-8 rounded-lg text-slate-300 hover:text-rose-500 disabled:opacity-30 disabled:pointer-events-none"
            title={
              isLastActive
                ? "Cannot delete the last active brand"
                : "Delete brand"
            }
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function RestaurantProfilePage() {
  const { user } = useUser();
  const isOwner = user?.role === "OWNER";
  const { brands: ctxBrands, refreshBrands, isLoading: brandsLoading } = useBrand();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    logo_url: "",
    opening_time: "09:00 AM",
    closing_time: "11:00 PM",
    closing_start: "08:00 PM",
    closing_end: "10:00 PM",
  });
  const [activeDays, setActiveDays] = useState<string[]>(["Mon", "Tue", "Wed", "Thur", "Fri"]);

  // Brand state
  const [brands, setBrandsLocal] = useState<Brand[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null);
  const [createLogoPreview, setCreateLogoPreview] = useState<string | null>(null);
  const prevPreviewRef = useRef<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const days = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await restaurantOpsService.getSettings();
        setFormData({
          name: settings.name || "",
          email: settings.email || user?.email || "",
          phone: settings.phone || "",
          location: settings.location || "",
          logo_url: settings.logo_url || "",
          opening_time: settings.opening_time || "09:00 AM",
          closing_time: settings.closing_time || "11:00 PM",
          closing_start: settings.closing_start || "08:00 PM",
          closing_end: settings.closing_end || "10:00 PM",
        });
        if (settings.active_days) setActiveDays(settings.active_days);
      } catch (err) {
        console.error("Failed to load settings:", err);
        setLoadError("We couldn't load your restaurant settings. You can retry or adjust them manually below.");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    setBrandsLocal(ctxBrands);
  }, [ctxBrands]);

  const activeCount = brands.filter((b) => b.is_active).length;

  function isLastActiveBrand(brand: Brand) {
    return brand.is_active && activeCount <= 1;
  }

  // ---------------------------------------------------------------------------
  // Profile handlers
  // ---------------------------------------------------------------------------

  const handleSave = async () => {
    setSaving(true);
    try {
      await restaurantOpsService.updateSettings({ ...formData, active_days: activeDays });
      setIsSaved(true);
      toast({
        title: "Settings saved",
        description: "Your restaurant profile settings have been updated.",
      });
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to save settings",
        description: err?.message || "Unknown error",
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleDay = (day: string) => {
    if (activeDays.includes(day)) {
      setActiveDays(activeDays.filter((d) => d !== day));
    } else {
      setActiveDays([...activeDays, day]);
    }
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  // ---------------------------------------------------------------------------
  // Brand handlers
  // ---------------------------------------------------------------------------

  function handleStartEdit(brand: Brand) {
    setEditingId(brand.id);
    setEditName(brand.name);
  }

  function handleCancelEdit() {
    setEditingId(null);
    setEditName("");
  }

  async function handleRename(brandId: string) {
    if (!editName.trim()) return;
    setSavingId(brandId);
    try {
      await axiosInstance.patch(`/brands/${brandId}`, { name: editName.trim() });
      setBrandsLocal((prev) =>
        prev.map((b) => (b.id === brandId ? { ...b, name: editName.trim() } : b))
      );
      setEditingId(null);
      toast({ title: "Brand renamed", description: `"${editName.trim()}"` });
      await refreshBrands();
    } finally {
      setSavingId(null);
    }
  }

  async function handleToggle(brand: Brand) {
    if (isLastActiveBrand(brand)) {
      toast({ title: "Cannot deactivate the last active brand", variant: "destructive" });
      return;
    }
    setSavingId(brand.id);
    try {
      await axiosInstance.patch(`/brands/${brand.id}`, { is_active: !brand.is_active });
      setBrandsLocal((prev) =>
        prev.map((b) => (b.id === brand.id ? { ...b, is_active: !b.is_active } : b))
      );
      toast({
        title: brand.is_active ? "Brand deactivated" : "Brand activated",
        description: brand.name,
      });
      await refreshBrands();
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Failed to update brand",
        description: err?.response?.data?.detail ?? "Please try again.",
      });
    } finally {
      setSavingId(null);
    }
  }

  function handleDeleteRequest(brandId: string) {
    setDeleteTargetId(brandId);
  }

  async function handleDelete() {
    if (!deleteTargetId) return;
    const target = brands.find((b) => b.id === deleteTargetId);
    if (target && isLastActiveBrand(target)) {
      toast({ title: "Cannot delete the last active brand", variant: "destructive" });
      setDeleteTargetId(null);
      return;
    }
    setDeleting(true);
    try {
      await axiosInstance.delete(`/brands/${deleteTargetId}`);
      toast({ title: "Brand deleted", description: target?.name });
      setDeleteTargetId(null);
      await refreshBrands();
    } finally {
      setDeleting(false);
    }
  }

  function handleCreateLogoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (prevPreviewRef.current) URL.revokeObjectURL(prevPreviewRef.current);
    const url = URL.createObjectURL(file);
    prevPreviewRef.current = url;
    setCreateLogoFile(file);
    setCreateLogoPreview(url);
  }

  function handleCloseCreateDialog(open: boolean) {
    if (!open) {
      if (prevPreviewRef.current) {
        URL.revokeObjectURL(prevPreviewRef.current);
        prevPreviewRef.current = null;
      }
      setCreateName("");
      setCreateLogoFile(null);
      setCreateLogoPreview(null);
    }
    setCreateOpen(open);
  }

  const handleCreate = useCallback(async () => {
    if (!createName.trim()) {
      toast({ title: "Brand name is required", variant: "destructive" });
      return;
    }
    setCreating(true);
    try {
      let logoUrl: string | null = null;
      if (createLogoFile) {
        const { uploadImage } = await import("@/lib/supabase/storage");
        logoUrl = await uploadImage(createLogoFile, "profiles", "brand-logos");
      }
      await axiosInstance.post("/brands", {
        name: createName.trim(),
        ...(logoUrl ? { logo_url: logoUrl } : {}),
      });
      toast({ title: "Brand created", description: `"${createName.trim()}" is now active.` });
      handleCloseCreateDialog(false);
      await refreshBrands();
    } finally {
      setCreating(false);
    }
  }, [createName, createLogoFile, refreshBrands]);

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  if (loading) return <div className="p-10 text-center text-slate-400 font-figtree">Loading settings...</div>;

  const deleteTarget = brands.find((b) => b.id === deleteTargetId);

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
      {loadError && (
        <div className="mb-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          {loadError}
        </div>
      )}
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
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 relative group">
                {formData.logo_url ? (
                  <img src={formData.logo_url} className="h-full w-full object-cover" alt="Logo" />
                ) : (
                  <ImageIcon className="h-8 w-8 md:h-10 md:w-10 text-slate-300" />
                )}
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <Button
                  variant="outline"
                  className="h-10 md:h-11 px-6 rounded-xl border-slate-200 text-slate-700 font-bold text-xs md:text-sm bg-white hover:bg-slate-50 gap-2"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Update Logo
                </Button>
                <input
                  id="logo-upload"
                  type="file"
                  className="hidden"
                  accept=".jpg,.jpeg,.png,.webp,.gif,.svg"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      const { uploadImage } = await import("@/lib/supabase/storage");
                      const url = await uploadImage(file, "profiles", "logos");
                      if (url) {
                        updateField("logo_url", url);
                        await restaurantOpsService.updateSettings({ logo_url: url });
                        toast({
                          title: "Logo uploaded",
                          description: "Your restaurant logo has been updated.",
                        });
                      }
                    } catch (err) {
                      toast({
                        variant: "destructive",
                        title: "Logo upload failed",
                        description: "We couldn't upload your logo. Please try again.",
                      });
                    }
                  }}
                />
                <p className="text-[10px] md:text-xs text-slate-400 font-medium">SVG, PNG, or JPG. Max 2MB.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="restaurant-name" className="text-sm font-bold text-slate-500">Restaurant Name</Label>
                <Input
                  id="restaurant-name"
                  value={formData.name}
                  onChange={(e) => updateField("name", e.target.value)}
                  placeholder="Restaurant Name"
                  className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="business-email" className="text-sm font-bold text-slate-500">Business Email Address</Label>
                  <Input
                    id="business-email"
                    value={formData.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="food@restaurant.com"
                    className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="business-phone" className="text-sm font-bold text-slate-500">Business Phone Number</Label>
                  <Input
                    id="business-phone"
                    value={formData.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    placeholder="+250 123 456 789"
                    className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-sm font-bold text-slate-500">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="Enter address"
                  className="h-14 rounded-xl border-slate-200 focus:ring-indigo-500 font-medium"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

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
            </div>

            <div className="space-y-6">
              <h3 className="text-[15px] font-bold text-slate-800">Operational Windows</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Brands section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <FigtreeText className="text-[12px] font-black text-slate-400 uppercase tracking-widest leading-none">Brands</FigtreeText>
                    {isOwner && (
                      <Button
                        size="sm"
                        onClick={() => setCreateOpen(true)}
                        className="h-8 px-3 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-lg gap-1.5 text-xs shadow-sm"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add Brand
                      </Button>
                    )}
                  </div>
                  <div className="border border-slate-100 rounded-xl overflow-hidden divide-y divide-slate-50">
                    {brandsLoading ? (
                      <div className="px-4 py-6 text-center text-[13px] text-slate-400">Loading…</div>
                    ) : brands.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Store className="h-6 w-6 text-slate-200 mx-auto mb-2" />
                        <p className="text-[13px] font-medium text-slate-400">No brands yet.</p>
                      </div>
                    ) : (
                      brands.map((brand, idx) => (
                        <BrandRow
                          key={brand.id}
                          brand={brand}
                          idx={idx}
                          isLastActive={isLastActiveBrand(brand)}
                          isOwner={isOwner}
                          editingId={editingId}
                          editName={editName}
                          savingId={savingId}
                          onStartEdit={handleStartEdit}
                          onCancelEdit={handleCancelEdit}
                          onEditNameChange={setEditName}
                          onRename={handleRename}
                          onToggle={handleToggle}
                          onDeleteRequest={handleDeleteRequest}
                        />
                      ))
                    )}
                  </div>
                </div>

                {/* Closing Reconciliation Window */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <FigtreeText className="text-[12px] font-black text-[#3B59DA] uppercase tracking-widest leading-none">Closing Reconciliation Range</FigtreeText>
                    <Badge variant="outline" className="text-[9px] font-black bg-indigo-50 border-indigo-100 text-[#3B59DA] uppercase py-0 px-2 rounded-md">Admins Only</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-tight">Range Start</Label>
                      <Select
                        value={formData.closing_start || "08:00 PM"}
                        onValueChange={(v) => updateField("closing_start", v)}
                      >
                        <SelectTrigger className="h-14 rounded-xl border-[#3B59DA]/20 bg-indigo-50/10 font-bold text-[#3B59DA]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="06:00 PM">06:00 PM</SelectItem>
                          <SelectItem value="07:00 PM">07:00 PM</SelectItem>
                          <SelectItem value="08:00 PM">08:00 PM</SelectItem>
                          <SelectItem value="09:00 PM">09:00 PM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-xs font-bold text-slate-400 uppercase tracking-tight">Range End</Label>
                      <Select
                        value={formData.closing_end || "10:00 PM"}
                        onValueChange={(v) => updateField("closing_end", v)}
                      >
                        <SelectTrigger className="h-14 rounded-xl border-[#3B59DA]/20 bg-indigo-50/10 font-bold text-[#3B59DA]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100 shadow-xl">
                          <SelectItem value="09:00 PM">09:00 PM</SelectItem>
                          <SelectItem value="10:00 PM">10:00 PM</SelectItem>
                          <SelectItem value="11:00 PM">11:00 PM</SelectItem>
                          <SelectItem value="12:00 AM">12:00 AM</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end pt-4 pb-20">
        <Button
          onClick={handleSave}
          disabled={saving}
          className="h-14 px-14 bg-[#3B59DA] hover:bg-[#2F47AF] text-white font-black rounded-xl shadow-lg shadow-indigo-100 transition-all active:scale-95 text-base"
        >
          {saving ? "Saving..." : "Save Changes"}
        </Button>
      </div>

      {/* Create Brand Dialog */}
      <Dialog open={createOpen} onOpenChange={handleCloseCreateDialog}>
        <DialogContent
          className="p-0 overflow-hidden border-none rounded-[32px] sm:max-w-[520px]"
          aria-describedby={undefined}
        >
          <div className="p-8 space-y-1 border-b border-slate-100">
            <DialogTitle className="text-2xl font-bold text-slate-800">New Brand</DialogTitle>
            <DialogDescription className="text-[15px] text-slate-400 font-medium">
              Create a new brand under your organisation.
            </DialogDescription>
          </div>

          <div className="p-8 space-y-6">
            <div className="flex items-center gap-5">
              <div
                className="h-16 w-16 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer hover:border-indigo-200 transition-colors"
                onClick={() => document.getElementById("brand-logo-upload")?.click()}
              >
                {createLogoPreview ? (
                  <img src={createLogoPreview} className="h-full w-full object-cover" alt="preview" />
                ) : (
                  <ImageIcon className="h-6 w-6 text-slate-300" />
                )}
              </div>
              <div className="space-y-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById("brand-logo-upload")?.click()}
                  className="rounded-xl border-slate-200 font-bold text-xs gap-1.5"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Upload Logo
                </Button>
                <p className="text-[10px] text-slate-400">PNG, JPG or WEBP. Max 2MB. Optional.</p>
              </div>
              <input
                id="brand-logo-upload"
                type="file"
                className="hidden"
                accept=".jpg,.jpeg,.png,.webp"
                onChange={handleCreateLogoChange}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-bold text-slate-500">Brand Name</Label>
              <Input
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                placeholder="e.g. Sunset Grill"
                className="h-12 rounded-xl border-slate-200 font-medium"
              />
            </div>
          </div>

          <div className="p-8 bg-slate-50/50 flex justify-end gap-3 border-t border-slate-100">
            <Button
              variant="ghost"
              onClick={() => handleCloseCreateDialog(false)}
              className="h-12 px-6 rounded-xl font-bold text-slate-500"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={creating || !createName.trim()}
              className="h-12 px-10 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl shadow-sm min-w-[130px]"
            >
              {creating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating…
                </>
              ) : (
                "Create Brand"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTargetId}
        onOpenChange={(o) => !o && setDeleteTargetId(null)}
      >
        <AlertDialogContent className="rounded-2xl border-slate-100 shadow-xl max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-slate-800">
              Delete Brand?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-slate-500 font-medium leading-relaxed">
              {deleteTarget
                ? `"${deleteTarget.name}" will be permanently removed. This cannot be undone.`
                : "This brand will be permanently removed."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-2">
            <AlertDialogCancel className="h-12 px-8 rounded-xl border-slate-200 font-bold text-slate-500">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="h-12 px-10 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-xl shadow-sm"
            >
              {deleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting…
                </>
              ) : (
                "Delete Brand"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
