"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { 
  X, 
  Upload, 
  ChevronRight, 
  ChevronLeft,
  ShieldCheck,
  Save, 
  Image as ImageIcon,
  Calendar as CalendarIcon,
  Search,
  Bell,
  Trash2,
  Plus
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
import { useRouter, useSearchParams } from "next/navigation";
import { useRestaurantDayLifecycle } from "@/components/day/RestaurantDayLifecycleProvider";
import { LockedActionOverlay } from "@/components/day/LockedActionOverlay";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

export default function AddNewItemPage() {
  const { isLocked } = useRestaurantDayLifecycle();
  const searchParams = useSearchParams();
  const isEdit = searchParams.get("edit");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "",
    currentStock: "",
    unit: "",
    location: "",
    expiryMonth: "July",
    expiryDay: "01",
    expiryYear: "2000"
  });

  useEffect(() => {
    if (isEdit) {
        setFormData({
            name: "Tomatoes",
            category: "Produce",
            currentStock: "12",
            unit: "kg",
            location: "Storage A",
            expiryMonth: "July",
            expiryDay: "01",
            expiryYear: "2026"
        });
        setUploadedFiles([
            { name: "myimage.jpg", url: "/mock-img-1.png" },
            { name: "myimage.jpg", url: "/mock-img-2.png" }
        ]);
    }
  }, [isEdit]);

  const [uploadedFiles, setUploadedFiles] = useState<{name: string, url: string}[]>([]);
  const { toast } = useToast();
  const router = useRouter();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files).map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
    
    // Reset selection so the same file can be selected again if removed
    e.target.value = '';
  };

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      uploadedFiles.forEach(file => {
        if (file.url.startsWith('blob:')) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [uploadedFiles]);

  const isFormValid = formData.name && formData.category && formData.currentStock && formData.unit;

  const handleSave = () => {
    if (isLocked) return;
    
    toast({
        title: isEdit ? "Item Updated Successfully" : "Item Saved Successfully",
        description: `${formData.name} has been ${isEdit ? "updated in" : "added to"} the registry.`
    });
    router.push(isEdit ? `/dashboard/inventory/${isEdit}` : "/dashboard/inventory/items");
  };

  return (
    <div className="flex flex-col gap-8 bg-white min-h-screen pb-40">
      
      {/* Hidden file input */}
      <input 
        type="file" 
        ref={fileInputRef} 
        className="hidden" 
        accept="image/*" 
        multiple 
        onChange={handleFileChange}
      />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-slate-100 rounded-[28px] p-8 lg:p-10 space-y-8 shadow-sm font-figtree"
      >
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-slate-50">
            <div className="space-y-1">
                <h1 className="text-[24px] font-bold text-[#1E293B] tracking-tight">{isEdit ? "Edit Item" : "Add New Item"}</h1>
                <p className="text-slate-400 font-medium text-xs md:text-sm">{isEdit ? "Update the details for this inventory item." : "Add a new item to your inventory. Fill out the details below."}</p>
            </div>
            <div className="flex items-center gap-3">
                <Button 
                    variant="outline" 
                    className="h-12 px-10 rounded-xl border-slate-200 bg-white font-bold text-slate-500 hover:bg-slate-50 transition-all text-sm"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <LockedActionOverlay disabled={isLocked} label="Operations Locked">
                    <Button 
                        className={cn(
                            "h-12 px-10 rounded-xl font-bold gap-3 shadow-sm transition-all border-none text-sm",
                            isFormValid ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                        disabled={!isFormValid}
                        onClick={handleSave}
                    >
                        <Save className="h-4 w-4" /> Save
                    </Button>
                </LockedActionOverlay>
            </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <FormGroup label="Item Name">
                <Input 
                    placeholder="Enter item name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-5 font-bold text-[#1E293B] focus-visible:ring-indigo-100 placeholder:text-slate-400 placeholder:font-medium"
                />
            </FormGroup>
            
            <FormGroup label="Item Category">
                <Select 
                    value={formData.category}
                    onValueChange={(v) => setFormData({...formData, category: v})}
                >
                    <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-5 font-bold text-slate-400 shadow-none">
                        <SelectValue placeholder="Select item category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="Produce" className="font-bold">Fresh Produce</SelectItem>
                        <SelectItem value="Dairy" className="font-bold">Dairy & Poultry</SelectItem>
                        <SelectItem value="Pantry" className="font-bold">Pantry Staples</SelectItem>
                    </SelectContent>
                </Select>
            </FormGroup>

            <FormGroup label="Current Stock Amount">
                <Input 
                    placeholder="Enter amount" 
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                    className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-5 font-bold text-[#1E293B] focus-visible:ring-indigo-100 placeholder:text-slate-400 placeholder:font-medium"
                />
            </FormGroup>

            <FormGroup label="Measurement Unit">
                <Select 
                    value={formData.unit}
                    onValueChange={(v) => setFormData({...formData, unit: v})}
                >
                    <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-5 font-bold text-slate-400 shadow-none">
                        <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="kg" className="font-bold">Kilograms (kg)</SelectItem>
                        <SelectItem value="units" className="font-bold">Units</SelectItem>
                    </SelectContent>
                </Select>
            </FormGroup>

            <FormGroup label="Storage Location">
                <Input 
                    placeholder="Enter storage location" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-5 font-bold text-[#1E293B] focus-visible:ring-indigo-100 placeholder:text-slate-400 placeholder:font-medium"
                />
            </FormGroup>

            <FormGroup label="Expiry Date (If Applicable)">
                <div className="grid grid-cols-3 gap-3">
                    <Select defaultValue="July" onValueChange={(v) => setFormData({...formData, expiryMonth: v})}>
                        <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-4 font-bold text-slate-400 shadow-none">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-200">
                            <SelectItem value="July">July</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input 
                        placeholder="Day" 
                        value={formData.expiryDay}
                        onChange={(e) => setFormData({...formData, expiryDay: e.target.value})}
                        className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-4 font-bold text-[#1E293B] text-center placeholder:text-slate-400 placeholder:font-medium"
                    />
                    <Input 
                        placeholder="Year" 
                        value={formData.expiryYear}
                        onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                        className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC]/50 px-4 font-bold text-[#1E293B] text-center placeholder:text-slate-400 placeholder:font-medium"
                    />
                </div>
            </FormGroup>
        </div>

        {/* Upload Section */}
        <div className="space-y-4 pt-4 border-t border-slate-50">
            <div className="space-y-1">
                <p className="text-[11px] text-slate-400 font-medium">Upload high-quality images of your product. The first image will be used as the main product image.</p>
                <p className="text-xs font-bold text-slate-800">Upload Item Image</p>
            </div>
            
            <div 
                className="border border-slate-100 rounded-[20px] p-10 flex flex-col items-center justify-center bg-white hover:bg-slate-50/50 transition-all cursor-pointer group relative overflow-hidden"
                onClick={handleUploadClick}
            >
                {uploadedFiles.length === 0 ? (
                    <div className="flex flex-col items-center space-y-6 text-center animate-in fade-in duration-500">
                        <p className="text-sm font-medium text-slate-400 max-w-sm">
                            Help your customers know what to expect when they visit your business profile.
                        </p>
                        <div className="h-16 w-16 bg-white border border-slate-100 rounded-xl flex items-center justify-center text-slate-300 shadow-sm">
                            <ImageIcon className="h-7 w-7" />
                        </div>
                        <div className="space-y-1">
                            <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">PNG or JPG are accepted.</p>
                            <p className="text-[10px] text-slate-200 font-medium italic">Recommended dimension: 200px by 200px</p>
                        </div>
                        <Button 
                            variant="outline"
                            className="h-11 px-8 rounded-xl bg-indigo-50/50 text-[#3B59DA] border-indigo-100 hover:bg-indigo-50 font-bold gap-2 transition-all shadow-sm text-xs"
                            onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                        >
                            <Upload className="h-4 w-4" /> Upload Image
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-8 w-full text-center animate-in zoom-in-95 duration-500">
                        <div className="space-y-2">
                             <p className="text-sm font-medium text-slate-400 max-w-[320px] mx-auto">
                                Help your customers know what to expect when they visit your business profile.
                            </p>
                            <p className="text-sm font-bold text-slate-800 tracking-tight">{uploadedFiles.length} Upload Complete</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6" onClick={(e) => e.stopPropagation()}>
                            {uploadedFiles.map((file, i) => (
                                <div key={i} className="space-y-2 group/item">
                                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-[#3B59DA] flex items-center justify-center relative shadow-sm">
                                        {/* In the design mock, it's a blue card with an icon/logo */}
                                        <div className="text-white">
                                            <ShieldCheck className="h-10 w-10 opacity-40" />
                                        </div>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i)); }}
                                            className="absolute top-1 right-1 h-5 w-5 rounded-md bg-white/90 text-slate-400 hover:text-red-500 shadow-sm flex items-center justify-center transition-all"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-400 truncate w-20">{file.name}</p>
                                </div>
                            ))}
                        </div>
 
                        <Button 
                            variant="outline"
                            className="h-12 px-10 rounded-xl bg-indigo-50/50 text-[#3B59DA] border-none hover:bg-indigo-100 font-bold gap-2 transition-all text-xs"
                            onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                        >
                            <RotateCcw className="h-4 w-4" /> Replace Image
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}

function FormGroup({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[12px] font-bold text-slate-500 ml-1">
                {label}
            </label>
            {children}
        </div>
    );
}
