"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  ImageIcon,
  Save,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent,
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { 
    AppContainer, 
    InriaHeading, 
    FigtreeText, 
    PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";
import { restaurantOpsService } from "@/lib/services/restaurantOpsService";

function AddNewItemContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = !!editId;
  const { toast } = useToast();
  
  // Form State
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    unit: "",
    location: "",
    expiryMonth: "july",
    expiryDay: "01",
    expiryYear: "2025"
  });
  
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode);

  useEffect(() => {
    if (isEditMode) {
      const fetchItem = async () => {
        try {
          const item = await restaurantOpsService.getInventoryItemById(editId!);
          if (item) {
             setFormData({
                name: item.name,
                category: item.category.toLowerCase(),
                currentStock: item.currentStock.toString(),
                unit: item.unit,
                location: item.location || "",
                expiryMonth: "july",
                expiryDay: "01",
                expiryYear: "2025"
             });
             if (item.imageUrl) setImages([item.imageUrl]);
          }
        } catch (err) {
          toast({ variant: "destructive", title: "Load Failed", description: "Could not fetch item details." });
        } finally {
          setIsLoading(false);
        }
      };
      fetchItem();
    }
  }, [editId, isEditMode]);

  const categories = ["Vegetables", "Meat", "Dairy", "Grains", "Spices", "Beverages", "Supplies", "Other"];
  const units = ["kg", "g", "l", "ml", "units", "pcs", "boxes", "packs", "bags"];
  const months = [
    "January", "February", "March", "April", "May", "June", 
    "July", "August", "September", "October", "November", "December"
  ];

  const handleImageUpload = () => {
    setUploading(true);
    setTimeout(() => {
      setImages(prev => [...prev, "https://api.a0.dev/assets/img/generic_product.png"]);
      setUploading(false);
      toast({ title: "Image Uploaded", description: "Product image successfully uploaded." });
    }, 1500);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.unit) {
      toast({ variant: "destructive", title: "Missing Fields", description: "Please fill in all required fields." });
      return;
    }

    setIsSaving(true);
    try {
      if (isEditMode) {
        await restaurantOpsService.updateItem(editId!, { ...formData, images });
        toast({ title: "Item Updated", description: "Changes have been saved." });
      } else {
        await restaurantOpsService.addItem({ ...formData, images });
        toast({ title: "Item Added", description: `${formData.name} has been added.` });
      }
      router.push("/dashboard/inventory");
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save item." });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <div className="flex h-[400px] items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
    );
  }

  return (
    <AppContainer className="pb-24">
      <div className="w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <PrimarySurfaceCard className="p-12 md:p-14">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
              <div className="space-y-2">
                <h1 className="text-[32px] font-bold text-[#1E293B] tracking-tight leading-none font-figtree">
                    {isEditMode ? "Edit Item" : "Add New Item"}
                </h1>
                <FigtreeText className="text-slate-400 font-medium text-[16px]">
                    {isEditMode ? `Updating ${formData.name} details.` : "Add a new item to your inventory. Fill out the details below."}
                </FigtreeText>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="outline" className="h-14 px-10 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all font-figtree shadow-sm active:scale-95" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button 
                  disabled={isSaving}
                  onClick={handleSave}
                  className="h-14 px-12 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold transition-all border-none text-base shadow-lg flex items-center gap-3 font-figtree active:scale-95"
                >
                  <Save className="h-5 w-5" /> {isSaving ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <div className="space-y-2.5 relative">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Item Name</label>
                        <Input 
                          value={formData.name}
                          onChange={(e) => {
                             const val = e.target.value;
                             setFormData({...formData, name: val});
                             if (val.length > 1) {
                                restaurantOpsService.searchCanonicalCatalog(val).then(setSuggestions);
                             } else {
                                setSuggestions([]);
                             }
                          }}
                          placeholder="Enter item name" 
                          className="h-16 border-slate-200 rounded-[8px] px-6 text-base font-figtree shadow-sm" 
                        />
                        {/* Search Suggestions Dropdown */}
                        <AnimatePresence>
                            {suggestions.length > 0 && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -10 }} 
                                    animate={{ opacity: 1, y: 0 }} 
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute z-[100] left-0 right-0 top-[calc(100%+8px)] bg-white border border-slate-100 rounded-xl shadow-2xl p-2 max-h-[300px] overflow-y-auto"
                                >
                                    <div className="p-3 mb-1">
                                        <FigtreeText className="text-[11px] font-black text-[#3B59DA] uppercase tracking-widest pl-1">Suggested from Catalog</FigtreeText>
                                    </div>
                                    {suggestions.map((s) => (
                                        <button
                                            key={s.id}
                                            onClick={() => {
                                                setFormData({
                                                    ...formData,
                                                    name: s.name,
                                                    category: s.category.toLowerCase(),
                                                    unit: s.base_unit || "kg"
                                                });
                                                setSuggestions([]);
                                            }}
                                            className="w-full flex items-center justify-between p-4 rounded-lg hover:bg-slate-50 transition-colors text-left group"
                                        >
                                            <div className="space-y-0.5">
                                                <FigtreeText className="font-bold text-slate-800 text-[15px] group-hover:text-[#3B59DA] transition-colors">{s.name}</FigtreeText>
                                                <FigtreeText className="text-xs text-slate-400 font-medium">{s.category} • {s.sku}</FigtreeText>
                                            </div>
                                            <Badge variant="outline" className="bg-indigo-50 border-indigo-100 text-[#3B59DA] font-bold text-[10px] uppercase">Link Item</Badge>
                                        </button>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Item Category</label>
                        <Select onValueChange={(v) => setFormData({...formData, category: v})}>
                            <SelectTrigger className="h-16 border-slate-200 rounded-[8px] px-6 text-base font-figtree shadow-sm">
                                <SelectValue placeholder="Select item category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map(c => <SelectItem key={c} value={c.toLowerCase()}>{c}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Current Stock Amount</label>
                        <Input 
                          type="number"
                          value={formData.currentStock}
                          onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                          placeholder="Enter amount" 
                          className="h-16 border-slate-200 rounded-[8px] px-6 text-base font-figtree shadow-sm" 
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Measurement Unit</label>
                        <Select onValueChange={(v) => setFormData({...formData, unit: v})}>
                            <SelectTrigger className="h-16 border-slate-200 rounded-[8px] px-6 text-base font-figtree shadow-sm">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                                {units.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Storage Location</label>
                        <Input 
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          placeholder="Enter storage location" 
                          className="h-16 border-slate-200 rounded-[8px] px-6 text-base font-figtree shadow-sm" 
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Expiry Date (If Applicable)</label>
                        <div className="grid grid-cols-3 gap-4">
                            <Select 
                              value={formData.expiryMonth}
                              onValueChange={(v) => setFormData({...formData, expiryMonth: v})}
                            >
                                <SelectTrigger className="h-16 border-slate-200 rounded-[8px] px-4 text-sm font-figtree shadow-sm">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    {months.map(m => <SelectItem key={m} value={m.toLowerCase()}>{m}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Input 
                              value={formData.expiryDay}
                              onChange={(e) => setFormData({...formData, expiryDay: e.target.value})}
                              className="h-16 border-slate-200 rounded-[8px] text-center shadow-sm" 
                            />
                            <Input 
                              value={formData.expiryYear}
                              onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                              className="h-16 border-slate-200 rounded-[8px] text-center shadow-sm" 
                            />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <FigtreeText className="text-slate-400 text-[13px] font-medium leading-relaxed">
                      Upload high-quality images of your product. The first image will be used as the main product image.
                    </FigtreeText>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-3">
                    <label className="text-[13px] font-bold text-[#1E293B] font-figtree ml-0.5">Upload Item Image</label>
                    <div className="bg-white border border-slate-200 rounded-[10px] p-12 flex flex-col items-center justify-center text-center space-y-8 min-h-[400px]">
                        {images.length === 0 ? (
                            <>
                                <div className="space-y-3 max-w-lg">
                                    <FigtreeText className="text-slate-400 font-medium text-[15px]">Help your customers know what to expect when they visit your business profile.</FigtreeText>
                                    <div className="h-20 w-20 rounded-[8px] border border-slate-200 border-dashed bg-white mx-auto flex items-center justify-center">
                                        <ImageIcon className="h-10 w-10 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <FigtreeText className="text-slate-300 font-bold text-[13px]">PNG or JPG are accepted.</FigtreeText>
                                        <FigtreeText className="text-slate-300 font-bold text-[13px]">Recommended dimension: 200px by 200px</FigtreeText>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleImageUpload}
                                    disabled={uploading}
                                    className="h-14 px-8 rounded-[8px] bg-slate-50 text-[#3B59DA] font-bold border-[#3B59DA]/20 border shadow-sm flex items-center gap-3"
                                >
                                    <Upload className="h-5 w-5" /> {uploading ? "Uploading..." : "Upload Image"}
                                </Button>
                            </>
                        ) : (
                            <div className="w-full space-y-12">
                                <div className="space-y-2">
                                    <FigtreeText className="text-[18px] font-black text-[#1E293B] uppercase tracking-[0.2em]">{images.length} Upload Complete</FigtreeText>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-8">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative group transition-all hover:-translate-y-2">
                                            <div className="h-40 w-40 rounded-[8px] overflow-hidden border-4 border-white shadow-2xl">
                                                <img src={img} className="h-full w-full object-cover" />
                                            </div>
                                            <button 
                                                onClick={() => removeImage(i)}
                                                className="absolute -top-4 -right-4 h-10 w-10 rounded-full bg-white shadow-lg flex items-center justify-center text-[#64748B] hover:text-[#EF4444]"
                                            >
                                                <X className="h-5 w-5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <Button onClick={handleImageUpload} disabled={uploading} className="mx-auto h-14 px-8 rounded-[8px] bg-slate-50 text-[#3B59DA] font-bold border-[#3B59DA]/20 border shadow-sm">
                                    <Upload className="h-5 w-5 mr-3" /> {uploading ? "Uploading..." : "Add More Images"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
          </PrimarySurfaceCard>
        </motion.div>
      </div>
    </AppContainer>
  );
}

export default function AddNewItemPage() {
    return (
        <Suspense fallback={<div className="p-20 text-center flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="font-figtree text-slate-500 font-bold">Initializing form...</p>
        </div>}>
            <AddNewItemContent />
        </Suspense>
    );
}
