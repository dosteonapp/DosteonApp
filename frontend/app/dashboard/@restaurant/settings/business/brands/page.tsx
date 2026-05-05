"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Store,
  Plus,
  Pencil,
  Trash2,
  Check,
  X,
  Loader2,
  ImageIcon,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useBrand, Brand } from "@/context/BrandContext";
import { BrandSwitcherCard } from "@/components/BrandSwitcherCard";
import { useUser } from "@/context/UserContext";
import axiosInstance from "@/lib/axios";
import { toast } from "@/hooks/use-toast";

// ---------------------------------------------------------------------------
// Brand color palette (mirrors BrandSwitcherCard)
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
    <div className="flex items-center gap-4 px-6 md:px-8 py-5 group hover:bg-slate-50/50 transition-colors">
      {/* Avatar */}
      <div className="shrink-0">
        {brand.logo_url ? (
          <img
            src={brand.logo_url}
            alt={brand.name}
            className="h-10 w-10 rounded-xl object-cover"
          />
        ) : (
          <div
            className={cn(
              "h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-black bg-gradient-to-br",
              brandBg(idx)
            )}
          >
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Name / inline edit */}
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
              className="h-9 rounded-lg text-sm font-bold max-w-[220px]"
              autoFocus
            />
            <Button
              size="sm"
              onClick={() => onRename(brand.id)}
              disabled={isSaving || !editName.trim()}
              className="h-9 px-3 rounded-lg bg-[#3B59DA] hover:bg-[#2d4bc8] text-white"
            >
              {isSaving ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={onCancelEdit}
              className="h-9 w-9 rounded-lg text-slate-400"
            >
              <X className="h-3.5 w-3.5" />
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

      {/* Actions — fade in on row hover */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Rename */}
        {!isEditing && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onStartEdit(brand)}
            disabled={!!savingId}
            className="h-9 w-9 rounded-lg text-slate-400 hover:text-slate-700"
            title="Rename brand"
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        )}

        {/* Toggle active — owner only, disabled for last active brand */}
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

        {/* Delete — owner only, disabled for last active brand */}
        {isOwner && (
          <Button
            size="sm"
            variant="ghost"
            disabled={isLastActive || !!savingId}
            onClick={() => onDeleteRequest(brand.id)}
            className="h-9 w-9 rounded-lg text-slate-300 hover:text-rose-500 disabled:opacity-30 disabled:pointer-events-none"
            title={
              isLastActive
                ? "Cannot delete the last active brand"
                : "Delete brand"
            }
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Skeleton
// ---------------------------------------------------------------------------

function BrandListSkeleton() {
  return (
    <>
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 px-6 md:px-8 py-5 border-t border-slate-50">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 bg-slate-100 rounded-lg animate-pulse" />
            <div className="h-3 w-20 bg-slate-100 rounded-lg animate-pulse" />
          </div>
        </div>
      ))}
    </>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function BrandsSettingsPage() {
  const { brands: ctxBrands, activeBrand, refreshBrands, isLoading } = useBrand();
  const { user } = useUser();
  const isOwner = user?.role === "OWNER";

  // Local copy for optimistic updates
  const [brands, setBrandsLocal] = useState<Brand[]>([]);

  // Inline rename state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLogoFile, setCreateLogoFile] = useState<File | null>(null);
  const [createLogoPreview, setCreateLogoPreview] = useState<string | null>(null);
  const prevPreviewRef = useRef<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Delete confirmation
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Sync from context
  useEffect(() => {
    setBrandsLocal(ctxBrands);
  }, [ctxBrands]);

  const activeCount = brands.filter((b) => b.is_active).length;

  function isLastActive(brand: Brand) {
    return brand.is_active && activeCount <= 1;
  }

  // ---------------------------------------------------------------------------
  // Handlers
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
    if (isLastActive(brand)) {
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
    if (target && isLastActive(target)) {
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
    // Revoke old preview URL to avoid memory leak
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

  const deleteTarget = brands.find((b) => b.id === deleteTargetId);

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <BrandSwitcherCard />

      <Card className="border-slate-100 shadow-sm rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-0">
          {/* Header */}
          <div className="p-6 md:p-8 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                <Store className="h-5 w-5 text-indigo-500" />
              </div>
              <div>
                <h2 className="text-base md:text-lg font-bold text-slate-800">Brands</h2>
                <p className="text-xs text-slate-400 font-medium">
                  {isLoading ? "Loading…" : `${brands.length} brand${brands.length !== 1 ? "s" : ""} in your organisation`}
                </p>
              </div>
            </div>
            {isOwner && (
              <Button
                onClick={() => setCreateOpen(true)}
                className="h-10 px-5 bg-[#3B59DA] hover:bg-[#2d4bc8] text-white font-bold rounded-xl gap-2 shadow-sm shrink-0"
              >
                <Plus className="h-4 w-4" />
                Add Brand
              </Button>
            )}
          </div>

          {/* Brand list */}
          <div className="border-t border-slate-50 divide-y divide-slate-50">
            {isLoading ? (
              <BrandListSkeleton />
            ) : brands.length === 0 ? (
              <div className="px-8 py-12 text-center">
                <Store className="h-8 w-8 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-medium text-slate-400">No brands yet.</p>
                {isOwner && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 rounded-xl border-slate-200 font-bold text-xs"
                    onClick={() => setCreateOpen(true)}
                  >
                    Create your first brand
                  </Button>
                )}
              </div>
            ) : (
              brands.map((brand, idx) => (
                <BrandRow
                  key={brand.id}
                  brand={brand}
                  idx={idx}
                  isLastActive={isLastActive(brand)}
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
        </CardContent>
      </Card>

      {/* ------------------------------------------------------------------ */}
      {/* Create Brand Dialog */}
      {/* ------------------------------------------------------------------ */}
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
            {/* Logo upload */}
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

            {/* Name input */}
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

      {/* ------------------------------------------------------------------ */}
      {/* Delete Confirmation */}
      {/* ------------------------------------------------------------------ */}
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
