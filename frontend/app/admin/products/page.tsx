"use client";
import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShieldCheck,
  Package,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  RefreshCw,
  Building2,
  Tag,
  Hash,
  Calendar,
  Pencil,
  Globe,
  EyeOff as EyeOffIcon,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Save,
  BookOpen,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PendingProduct {
  id: string;
  name: string;
  category: string;
  sku: string | null;
  canonical_product_id: string;
  organization_id: string;
  organization_name: string | null;
  created_at: string;
}

interface CanonicalProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory: string | null;
  product_type: string;
  base_unit: string;
  is_public: boolean;
  is_critical_item: boolean;
  synonyms: string[];
  created_at: string;
  updated_at: string;
}

type Tab = "pending" | "catalog";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

// ─── Catalog row with inline edit ────────────────────────────────────────────

function CatalogRow({
  product,
  adminKey,
}: {
  product: CanonicalProduct;
  adminKey: string;
}) {
  const queryClient = useQueryClient();
  const [expanded, setExpanded] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Partial<CanonicalProduct>>({});

  const startEdit = () => {
    setDraft({
      name: product.name,
      category: product.category,
      subcategory: product.subcategory ?? "",
      base_unit: product.base_unit,
      product_type: product.product_type,
      is_public: product.is_public,
      is_critical_item: product.is_critical_item,
      synonyms: product.synonyms,
    });
    setEditing(true);
    setExpanded(true);
  };

  const cancelEdit = () => {
    setEditing(false);
    setDraft({});
  };

  const { mutate: saveEdit, isPending: saving } = useMutation({
    mutationFn: async () => {
      const payload = {
        ...draft,
        // synonyms: convert comma-separated string back to array when needed
        synonyms:
          typeof draft.synonyms === "string"
            ? (draft.synonyms as string)
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : draft.synonyms,
      };
      const { data } = await axiosInstance.patch(
        `/admin/catalog/${product.id}`,
        payload,
        { headers: { "X-Admin-Key": adminKey } }
      );
      return data;
    },
    onSuccess: () => {
      setEditing(false);
      setDraft({});
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    },
  });

  const { mutate: togglePublic, isPending: togglingPublic } = useMutation({
    mutationFn: async () => {
      const { data } = await axiosInstance.patch(
        `/admin/catalog/${product.id}`,
        { is_public: !product.is_public },
        { headers: { "X-Admin-Key": adminKey } }
      );
      return data;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] }),
  });

  const synonymsDisplay = product.synonyms?.join(", ") || "—";

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Main row */}
      <div className="flex items-center gap-3 px-5 py-4">
        {/* Public indicator */}
        <div
          className={`h-2 w-2 rounded-full flex-shrink-0 ${
            product.is_public ? "bg-emerald-500" : "bg-slate-600"
          }`}
          title={product.is_public ? "Public" : "Private"}
        />

        {/* Name + meta */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-white text-sm truncate">
              {product.name}
            </span>
            {product.is_critical_item && (
              <span className="text-xs bg-orange-500/15 text-orange-400 px-1.5 py-0.5 rounded-full font-medium">
                critical
              </span>
            )}
            {!product.is_public && (
              <span className="text-xs bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full font-medium">
                private
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
            <span className="text-xs text-slate-400">
              {product.category}
              {product.subcategory ? ` · ${product.subcategory}` : ""}
            </span>
            <span className="text-xs text-slate-500">{product.base_unit}</span>
            <span className="text-xs text-slate-600 font-mono">{product.sku}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => togglePublic()}
            disabled={togglingPublic}
            title={product.is_public ? "Make private" : "Make public"}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {togglingPublic ? (
              <Loader2 size={13} className="animate-spin" />
            ) : product.is_public ? (
              <Globe size={13} />
            ) : (
              <EyeOffIcon size={13} />
            )}
          </button>
          <button
            onClick={editing ? cancelEdit : startEdit}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {editing ? <X size={13} /> : <Pencil size={13} />}
          </button>
          <button
            onClick={() => setExpanded((v) => !v)}
            className="h-8 w-8 flex items-center justify-center rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors"
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>

      {/* Expanded details / edit form */}
      {expanded && (
        <div className="border-t border-slate-800 px-5 py-4 bg-slate-950/40">
          {editing ? (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field
                  label="Name"
                  value={draft.name ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, name: v }))}
                />
                <Field
                  label="Category"
                  value={draft.category ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, category: v }))}
                />
                <Field
                  label="Subcategory"
                  value={draft.subcategory ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, subcategory: v }))}
                />
                <Field
                  label="Base Unit"
                  value={draft.base_unit ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, base_unit: v }))}
                />
                <Field
                  label="Product Type"
                  value={draft.product_type ?? ""}
                  onChange={(v) => setDraft((d) => ({ ...d, product_type: v }))}
                />
                <Field
                  label="Synonyms (comma-separated)"
                  value={
                    Array.isArray(draft.synonyms)
                      ? draft.synonyms.join(", ")
                      : (draft.synonyms as string) ?? ""
                  }
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, synonyms: v as any }))
                  }
                />
              </div>
              <div className="flex items-center gap-4 pt-1">
                <Toggle
                  label="Public"
                  checked={draft.is_public ?? false}
                  onChange={(v) => setDraft((d) => ({ ...d, is_public: v }))}
                />
                <Toggle
                  label="Critical Item"
                  checked={draft.is_critical_item ?? false}
                  onChange={(v) =>
                    setDraft((d) => ({ ...d, is_critical_item: v }))
                  }
                />
              </div>
              <div className="flex gap-2 pt-1">
                <Button
                  size="sm"
                  className="h-9 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold gap-1.5"
                  onClick={() => saveEdit()}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 size={13} className="animate-spin" />
                  ) : (
                    <Save size={13} />
                  )}
                  Save Changes
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-9 px-4 rounded-xl text-slate-400 hover:text-white"
                  onClick={cancelEdit}
                  disabled={saving}
                >
                  Cancel
                </Button>
              </div>
              <p className="text-xs text-slate-500 pt-1">
                Changes will be visible to all restaurant users immediately after saving.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-2 text-xs">
              <Detail label="SKU" value={product.sku} mono />
              <Detail label="Product Type" value={product.product_type} />
              <Detail label="Base Unit" value={product.base_unit} />
              <Detail label="Synonyms" value={synonymsDisplay} />
              <Detail label="Updated" value={formatDate(product.updated_at)} />
              <Detail label="Created" value={formatDate(product.created_at)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Small field helpers ──────────────────────────────────────────────────────

function Field({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold text-slate-400">{label}</label>
      <Input
        className="h-9 bg-slate-800 border-slate-700 text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 placeholder-slate-600"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <div
        onClick={() => onChange(!checked)}
        className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
          checked ? "bg-blue-600" : "bg-slate-700"
        }`}
      >
        <div
          className={`h-4 w-4 rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </div>
      <span className="text-xs text-slate-300 font-medium">{label}</span>
    </label>
  );
}

function Detail({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <p className="text-slate-500 mb-0.5">{label}</p>
      <p
        className={`text-slate-300 truncate ${mono ? "font-mono text-[11px]" : ""}`}
      >
        {value || "—"}
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [apiKey, setApiKey] = useState("");
  const [submittedKey, setSubmittedKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [tab, setTab] = useState<Tab>("pending");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [actionLoading, setActionLoading] = useState<
    Record<string, "approve" | "reject" | null>
  >({});

  const isAuthenticated = !!submittedKey;

  // ── Pending products ───────────────────────────────────────────────────────
  const {
    data: pending = [],
    isLoading: pendingLoading,
    isError: pendingError,
    error: pendingErr,
    refetch: refetchPending,
  } = useQuery<PendingProduct[]>({
    queryKey: ["admin", "pending-products", submittedKey],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/products/pending", {
        headers: { "X-Admin-Key": submittedKey },
      });
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 30_000,
    retry: false,
  });

  // ── Canonical catalog ──────────────────────────────────────────────────────
  const {
    data: catalog = [],
    isLoading: catalogLoading,
    isError: catalogError,
    refetch: refetchCatalog,
  } = useQuery<CanonicalProduct[]>({
    queryKey: ["admin", "catalog", submittedKey],
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/catalog", {
        headers: { "X-Admin-Key": submittedKey },
      });
      return data;
    },
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  });

  const filteredCatalog = catalog.filter((p) => {
    const q = catalogSearch.toLowerCase();
    return (
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q)
    );
  });

  // ── Approve / Reject ───────────────────────────────────────────────────────
  const approveMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await axiosInstance.post(
        `/admin/products/${productId}/approve`,
        {},
        { headers: { "X-Admin-Key": submittedKey } }
      );
      return data;
    },
    onMutate: (id) => setActionLoading((p) => ({ ...p, [id]: "approve" })),
    onSettled: (_, __, id) => {
      setActionLoading((p) => ({ ...p, [id]: null }));
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "catalog"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { data } = await axiosInstance.post(
        `/admin/products/${productId}/reject`,
        {},
        { headers: { "X-Admin-Key": submittedKey } }
      );
      return data;
    },
    onMutate: (id) => setActionLoading((p) => ({ ...p, [id]: "reject" })),
    onSettled: (_, __, id) => {
      setActionLoading((p) => ({ ...p, [id]: null }));
      queryClient.invalidateQueries({ queryKey: ["admin", "pending-products"] });
    },
  });

  // ── Key gate ───────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="flex flex-col items-center gap-4 mb-8">
            <div className="h-16 w-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-blue-500/20">
              <ShieldCheck size={32} className="text-blue-400" />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-black text-white tracking-tight">
                Dosteon Admin
              </h1>
              <p className="text-slate-400 text-sm mt-1">
                Product catalog review panel
              </p>
            </div>
          </div>
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Admin API Key
              </label>
              <div className="relative">
                <Input
                  type={showKey ? "text" : "password"}
                  placeholder="Enter your admin key"
                  className="h-12 bg-slate-800 border-slate-700 text-white placeholder-slate-500 rounded-xl pr-10 focus:ring-blue-500 focus:border-blue-500"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" &&
                    apiKey.trim() &&
                    setSubmittedKey(apiKey.trim())
                  }
                  autoFocus
                />
                <button
                  type="button"
                  onClick={() => setShowKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                >
                  {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl"
              onClick={() => apiKey.trim() && setSubmittedKey(apiKey.trim())}
              disabled={!apiKey.trim()}
            >
              Access Panel
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const is403 =
    (pendingError && (pendingErr as any)?.response?.status === 403) ||
    (catalogError && (catalog as any)?.response?.status === 403);

  const refetchAll = () => {
    refetchPending();
    refetchCatalog();
  };

  // ── Main panel ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 bg-blue-500/10 rounded-xl flex items-center justify-center border border-blue-500/20">
            <ShieldCheck size={18} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-sm font-black text-white tracking-tight leading-none">
              Dosteon Admin
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">Product catalog management</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={refetchAll}
            className="h-9 w-9 flex items-center justify-center rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Refresh"
          >
            <RefreshCw size={15} />
          </button>
          <button
            onClick={() => { setSubmittedKey(""); setApiKey(""); }}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-slate-800"
          >
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* 403 error */}
        {is403 && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-6 py-5 text-center mb-6">
            <p className="text-red-400 font-semibold text-sm">
              Invalid admin key. Please sign out and try again.
            </p>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-900 rounded-2xl p-1 mb-8 w-fit">
          <TabBtn
            active={tab === "pending"}
            onClick={() => setTab("pending")}
            icon={<AlertTriangle size={14} />}
            label="Pending Review"
            badge={pending.length > 0 ? pending.length : undefined}
          />
          <TabBtn
            active={tab === "catalog"}
            onClick={() => setTab("catalog")}
            icon={<BookOpen size={14} />}
            label="Global Catalog"
            badge={catalog.length > 0 ? catalog.length : undefined}
            badgeColor="blue"
          />
        </div>

        {/* ── Pending tab ───────────────────────────────────────────────── */}
        {tab === "pending" && (
          <>
            {pendingLoading && (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm">Loading pending products…</p>
              </div>
            )}

            {!pendingLoading && !pendingError && pending.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                  <Package size={28} className="text-slate-500" />
                </div>
                <div className="text-center">
                  <p className="text-slate-300 font-semibold">All clear</p>
                  <p className="text-slate-500 text-sm mt-1">
                    No products pending review.
                  </p>
                </div>
              </div>
            )}

            {!pendingLoading && !pendingError && pending.length > 0 && (
              <div className="space-y-3">
                {pending.map((product) => {
                  const loadingAction = actionLoading[product.id];
                  return (
                    <div
                      key={product.id}
                      className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center gap-4"
                    >
                      <div className="h-11 w-11 bg-slate-800 rounded-xl flex items-center justify-center flex-shrink-0 border border-slate-700">
                        <Package size={20} className="text-slate-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-base leading-tight truncate">
                          {product.name}
                        </p>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1.5">
                          <span className="flex items-center gap-1 text-xs text-slate-400">
                            <Tag size={11} />
                            {product.category}
                          </span>
                          {product.sku && (
                            <span className="flex items-center gap-1 text-xs text-slate-500">
                              <Hash size={11} />
                              {product.sku}
                            </span>
                          )}
                          <span className="flex items-center gap-1 text-xs text-slate-500">
                            <Building2 size={11} />
                            {product.organization_name ??
                              product.organization_id.slice(0, 8)}
                          </span>
                          <span className="flex items-center gap-1 text-xs text-slate-600">
                            <Calendar size={11} />
                            {formatDate(product.created_at)}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button
                          size="sm"
                          className="h-9 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold gap-1.5 text-sm"
                          onClick={() => approveMutation.mutate(product.id)}
                          disabled={!!loadingAction}
                        >
                          {loadingAction === "approve" ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Check size={13} strokeWidth={3} />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9 px-4 rounded-xl border-slate-700 text-slate-300 hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 font-semibold gap-1.5 text-sm bg-transparent"
                          onClick={() => rejectMutation.mutate(product.id)}
                          disabled={!!loadingAction}
                        >
                          {loadingAction === "reject" ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <X size={13} strokeWidth={3} />
                          )}
                          Reject
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* ── Catalog tab ───────────────────────────────────────────────── */}
        {tab === "catalog" && (
          <>
            {/* Search + stats */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative flex-1 max-w-sm">
                <input
                  className="w-full h-10 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search name, category, SKU…"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-3 text-xs text-slate-500 ml-auto">
                <span>
                  <span className="text-emerald-400 font-semibold">
                    {catalog.filter((p) => p.is_public).length}
                  </span>{" "}
                  public
                </span>
                <span>
                  <span className="text-slate-400 font-semibold">
                    {catalog.filter((p) => !p.is_public).length}
                  </span>{" "}
                  private
                </span>
                <span>
                  <span className="text-orange-400 font-semibold">
                    {catalog.filter((p) => p.is_critical_item).length}
                  </span>{" "}
                  critical
                </span>
              </div>
            </div>

            {catalogLoading && (
              <div className="flex flex-col items-center gap-3 py-20 text-slate-500">
                <Loader2 size={28} className="animate-spin" />
                <p className="text-sm">Loading catalog…</p>
              </div>
            )}

            {!catalogLoading && filteredCatalog.length === 0 && (
              <div className="flex flex-col items-center gap-4 py-20">
                <div className="h-16 w-16 bg-slate-800 rounded-2xl flex items-center justify-center">
                  <BookOpen size={28} className="text-slate-500" />
                </div>
                <p className="text-slate-500 text-sm">No products found.</p>
              </div>
            )}

            {!catalogLoading && filteredCatalog.length > 0 && (
              <div className="space-y-2">
                {filteredCatalog.map((product) => (
                  <CatalogRow
                    key={product.id}
                    product={product}
                    adminKey={submittedKey}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

// ─── Tab button ───────────────────────────────────────────────────────────────

function TabBtn({
  active,
  onClick,
  icon,
  label,
  badge,
  badgeColor = "orange",
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  badge?: number;
  badgeColor?: "orange" | "blue";
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
        active
          ? "bg-slate-800 text-white"
          : "text-slate-500 hover:text-slate-300"
      }`}
    >
      {icon}
      {label}
      {badge !== undefined && (
        <span
          className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${
            badgeColor === "orange"
              ? "bg-orange-500/15 text-orange-400"
              : "bg-blue-500/15 text-blue-400"
          }`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
