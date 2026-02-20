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
        className="bg-white border border-slate-100 rounded-[32px] p-10 lg:p-12 shadow-sm space-y-10"
      >
        {/* Header with Actions */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 border-b border-slate-50 pb-8">
            <div className="space-y-2">
                <h1 className="text-[28px] font-black text-[#1E293B] tracking-tight">{isEdit ? "Edit Item" : "Add New Item"}</h1>
                <p className="text-slate-400 font-bold text-sm">{isEdit ? "Update the details for this inventory item." : "Add a new item to your inventory. Fill out the details below."}</p>
            </div>
            <div className="flex items-center gap-4">
                <Button 
                    variant="outline" 
                    className="h-14 px-10 rounded-2xl border-slate-200 bg-white font-black text-slate-500 hover:bg-slate-50 transition-all"
                    onClick={() => router.back()}
                >
                    Cancel
                </Button>
                <LockedActionOverlay disabled={isLocked} label="Operations Locked">
                    <Button 
                        className={cn(
                            "h-14 px-10 rounded-2xl font-black gap-3 shadow-lg transition-all border-none",
                            isFormValid ? "bg-[#3B59DA] hover:bg-[#2D46B2] text-white shadow-indigo-100" : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        )}
                        disabled={!isFormValid}
                        onClick={handleSave}
                    >
                        <Save className="h-5 w-5" /> Save
                    </Button>
                </LockedActionOverlay>
            </div>
        </div>

        {/* Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
            <FormGroup label="Item Name" isRequired>
                <Input 
                    placeholder="Enter item name" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] px-6 font-bold text-[#1E293B] focus-visible:ring-indigo-100"
                />
            </FormGroup>
            
            <FormGroup label="Item Category" isRequired>
                <Select 
                    value={formData.category}
                    onValueChange={(v) => setFormData({...formData, category: v})}
                >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] px-6 font-bold text-slate-500 shadow-none">
                        <SelectValue placeholder="Select item category" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                        <SelectItem value="Produce" className="font-bold">Fresh Produce</SelectItem>
                        <SelectItem value="Dairy" className="font-bold">Dairy & Poultry</SelectItem>
                        <SelectItem value="Pantry" className="font-bold">Pantry Staples</SelectItem>
                    </SelectContent>
                </Select>
            </FormGroup>

            <FormGroup label="Current Stock Amount" isRequired>
                <Input 
                    placeholder="Enter amount" 
                    type="number"
                    value={formData.currentStock}
                    onChange={(e) => setFormData({...formData, currentStock: e.target.value})}
                    className="h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] px-6 font-bold text-[#1E293B] focus-visible:ring-indigo-100"
                />
            </FormGroup>

            <FormGroup label="Measurement Unit" isRequired>
                <Select 
                    value={formData.unit}
                    onValueChange={(v) => setFormData({...formData, unit: v})}
                >
                    <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] px-6 font-bold text-slate-500 shadow-none">
                        <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-slate-100">
                        <SelectItem value="kg" className="font-bold">Kilograms (kg)</SelectItem>
                        <SelectItem value="units" className="font-bold">Units</SelectItem>
                        <SelectItem value="liters" className="font-bold">Liters (L)</SelectItem>
                    </SelectContent>
                </Select>
            </FormGroup>

            <FormGroup label="Storage Location">
                <Input 
                    placeholder="Enter storage location" 
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="h-14 rounded-2xl border-slate-100 bg-[#F8FAFC] px-6 font-bold text-[#1E293B] focus-visible:ring-indigo-100"
                />
            </FormGroup>

            <FormGroup label="Expiry Date (If Applicable)">
                <div className="grid grid-cols-3 gap-3">
                    <Select defaultValue="July" onValueChange={(v) => setFormData({...formData, expiryMonth: v})}>
                        <SelectTrigger className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC] px-4 font-bold text-slate-500 shadow-none">
                            <SelectValue placeholder="Month" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-slate-100">
                            <SelectItem value="July">July</SelectItem>
                            <SelectItem value="August">August</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input 
                        placeholder="Day" 
                        value={formData.expiryDay}
                        onChange={(e) => setFormData({...formData, expiryDay: e.target.value})}
                        className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC] px-4 font-bold text-[#1E293B] text-center"
                    />
                    <Input 
                        placeholder="Year" 
                        value={formData.expiryYear}
                        onChange={(e) => setFormData({...formData, expiryYear: e.target.value})}
                        className="h-14 rounded-xl border-slate-100 bg-[#F8FAFC] px-4 font-bold text-[#1E293B] text-center"
                    />
                </div>
            </FormGroup>
        </div>

        {/* Upload Section */}
        <div className="space-y-6 pt-6">
            <div className="space-y-1">
                <p className="text-xs text-slate-400 font-bold">Upload high-quality images of your product. The first image will be used as the main product image.</p>
                <p className="text-sm font-black text-slate-800">Upload Item Image</p>
            </div>
            
            <div 
                className="border border-slate-100 rounded-[32px] p-16 flex flex-col items-center justify-center bg-[#FBFDFF] hover:bg-slate-50/50 transition-all cursor-pointer group relative overflow-hidden"
                onClick={handleUploadClick}
            >
                <div className="absolute top-0 right-0 p-12 opacity-[0.03] text-[#3B59DA] pointer-events-none group-hover:opacity-[0.06] transition-all">
                    <ImageIcon className="h-[240px] w-[240px]" />
                </div>

                {uploadedFiles.length === 0 ? (
                    <div className="flex flex-col items-center space-y-8 relative z-10 w-full text-center">
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                                Help your customers know what to expect when they visit your business profile.
                            </p>
                            <div className="h-20 w-20 bg-white border border-slate-100 rounded-[24px] flex items-center justify-center text-slate-300 mx-auto group-hover:scale-110 group-hover:rotate-3 transition-all shadow-sm">
                                <ImageIcon className="h-10 w-10 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">PNG or JPG are accepted.</p>
                                <p className="text-[10px] text-slate-300 font-bold italic font-inria">Recommended dimension: 200px by 200px</p>
                            </div>
                        </div>
                        <Button 
                            variant="outline"
                            className="h-14 px-10 rounded-2xl bg-white text-[#3B59DA] border-[#E0E7FF] hover:bg-slate-50 font-black gap-3 transition-all shadow-sm"
                            onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                        >
                            <Upload className="h-5 w-5" /> Upload Image
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col items-center space-y-10 relative z-10 w-full text-center">
                        <div className="space-y-4">
                            <p className="text-sm font-bold text-slate-400 max-w-[320px] mx-auto leading-relaxed">
                                Help your customers know what to expect when they visit your business profile.
                            </p>
                            <p className="text-sm font-black text-slate-800">{uploadedFiles.length} Upload Complete</p>
                        </div>
                        
                        <div className="flex flex-wrap items-center justify-center gap-6" onClick={(e) => e.stopPropagation()}>
                            {uploadedFiles.map((file, i) => (
                                <div key={i} className="space-y-3 group/item">
                                    <div className="h-24 w-24 rounded-[20px] overflow-hidden bg-[#F8FAFC] flex items-center justify-center relative shadow-lg shadow-indigo-100 group-hover:scale-105 transition-all">
                                        <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setUploadedFiles(uploadedFiles.filter((_, idx) => idx !== i)); }}
                                            className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-lg bg-white border border-slate-100 text-slate-400 hover:text-red-500 shadow-md flex items-center justify-center transition-all opacity-0 group-hover/item:opacity-100"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400 truncate w-24 px-1">{file.name}</p>
                                </div>
                            ))}
                        </div>

                        <Button 
                            variant="outline"
                            className="h-14 px-10 rounded-2xl bg-[#EEF2FF] text-[#3B59DA] border-none hover:bg-indigo-100 font-black gap-3 transition-all"
                            onClick={(e) => { e.stopPropagation(); handleUploadClick(); }}
                        >
                            <Upload className="h-5 w-5" /> Add More
                        </Button>
                    </div>
                )}
            </div>
        </div>
      </motion.div>
    </div>
  );
}

function FormGroup({ label, children, isRequired }: { label: string, children: React.ReactNode, isRequired?: boolean }) {
    return (
        <div className="space-y-3">
            <label className="text-sm font-bold text-slate-500 ml-1 flex items-center gap-1">
                {label}
                {isRequired && <span className="text-red-500 font-black text-xs">*</span>}
            </label>
            {children}
        </div>
    );
}
