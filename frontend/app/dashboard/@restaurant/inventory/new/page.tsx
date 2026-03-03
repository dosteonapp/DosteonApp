"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Upload, 
  X, 
  ImageIcon,
  Save
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { 
    AppContainer, 
    InriaHeading, 
    FigtreeText, 
    PrimarySurfaceCard 
} from "@/components/ui/dosteon-ui";

export default function AddNewItemPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = () => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      setImages(prev => [...prev, "https://api.a0.dev/assets/img/generic_product.png"]);
      setUploading(false);
      toast({
        title: "Image Uploaded",
        description: "Your product image has been successfully uploaded.",
      });
    }, 1500);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <AppContainer className="pb-24">
      <div className="w-full">
        {/* Navigation / Breadcrumb */}
        <div className="flex items-center gap-4 mb-8">
            <Button 
                variant="outline" 
                size="sm" 
                className="h-12 w-12 p-0 rounded-xl border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-all active:scale-95"
                onClick={() => router.back()}
            >
                <ArrowLeft className="h-5 w-5 text-slate-400" />
            </Button>
            <div className="space-y-0.5">
                <FigtreeText className="text-[13px] font-bold text-slate-400 uppercase tracking-widest leading-none">Inventory / Add New Item</FigtreeText>
                <InriaHeading className="text-[28px] font-bold text-[#1E293B] tracking-tight leading-none">Product Registry</InriaHeading>
            </div>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PrimarySurfaceCard className="p-12 md:p-14">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-16 border-b border-slate-50 pb-12">
              <div className="space-y-3">
                <InriaHeading className="text-[38px] md:text-[46px] font-bold text-[#1E293B] tracking-tight leading-none mb-1">Add New Item</InriaHeading>
                <FigtreeText className="text-slate-400 font-medium text-lg leading-relaxed max-w-xl">Add a new item to your inventory. Fill out the details below.</FigtreeText>
              </div>
              <div className="flex items-center gap-6">
                 <Button 
                  variant="outline" 
                  className="h-16 px-12 rounded-2xl border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-lg font-figtree shadow-md active:scale-95"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  className="h-16 px-16 rounded-2xl bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-black transition-all border-none text-[19px] shadow-2xl flex items-center gap-4 font-figtree shadow-indigo-900/10 active:scale-95"
                >
                  <Save className="h-6 w-6" /> Save Product
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <div className="space-y-14">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest ml-1 leading-none">Item Name</FigtreeText>
                        <Input placeholder="Enter item name" className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] focus:ring-slate-100 text-[#1E293B] font-bold font-figtree px-8 text-[18px] shadow-sm transition-all" />
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest ml-1 leading-none">Item Category</FigtreeText>
                        <Select>
                            <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] font-bold text-[#1E293B] text-[18px] px-8 shadow-sm">
                                <SelectValue placeholder="Select item category" />
                            </SelectTrigger>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest ml-1 leading-none">Current Stock Amount</FigtreeText>
                        <Input placeholder="Enter amount" className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] focus:ring-slate-100 text-[#1E293B] font-bold font-figtree px-8 text-[18px] shadow-sm transition-all text-center tabular-nums" />
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest ml-1 leading-none">Measurement Unit</FigtreeText>
                        <Select>
                            <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] font-bold text-[#1E293B] text-[18px] px-8 shadow-sm">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                        </Select>
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest ml-1 leading-none">Storage Location</FigtreeText>
                        <Input placeholder="Enter storage location" className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] focus:ring-slate-100 text-[#1E293B] font-bold font-figtree px-8 text-[18px] shadow-sm transition-all" />
                    </div>
                    <div className="space-y-4">
                        <FigtreeText className="text-[14px] font-bold text-[#64748B] uppercase tracking-widest ml-1 leading-none">Expiry Date (If Applicable)</FigtreeText>
                        <div className="grid grid-cols-3 gap-6">
                            <Select defaultValue="july">
                                <SelectTrigger className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] font-bold text-[#1E293B] text-[18px] px-6 shadow-sm">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                            </Select>
                            <Input defaultValue="01" className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] text-[#1E293B] font-bold text-[18px] px-6 text-center shadow-sm tabular-nums" />
                            <Input defaultValue="2000" className="h-[72px] border-slate-200 rounded-2xl bg-[#F8FAFC] text-[#1E293B] font-bold text-[18px] px-6 text-center shadow-sm tabular-nums" />
                        </div>
                    </div>
                </div>

                {/* Image Upload Area */}
                <div className="space-y-10 pt-10 border-t border-slate-50">
                    <div className="space-y-3">
                       <InriaHeading className="text-[28px] font-bold text-[#1E293B] leading-none">Upload Item Image</InriaHeading>
                       <FigtreeText className="text-slate-400 text-base font-medium leading-relaxed italic max-w-3xl">Upload high-quality images of your product. The first image will be used as the main product image.</FigtreeText>
                    </div>
                    
                    <div className="bg-[#F8FAFC] border-2 border-slate-100 border-dashed rounded-[32px] p-12 flex flex-col items-center justify-center text-center space-y-10 group relative transition-all hover:bg-white hover:border-indigo-100 min-h-[460px] shadow-inner">
                        {images.length === 0 ? (
                            <>
                                <div className="h-32 w-32 rounded-[28px] border-2 border-slate-100 border-dashed bg-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-500">
                                    <ImageIcon className="h-16 w-16 text-slate-200" />
                                </div>
                                <div className="space-y-3 max-w-lg">
                                    <FigtreeText className="text-slate-400 font-bold text-[17px] leading-relaxed">Help your customers know what to expect when they visit your business profile.</FigtreeText>
                                    <FigtreeText className="text-slate-300 font-bold text-[14px]">PNG or JPG are accepted. Recommended dimension: 200px by 200px</FigtreeText>
                                </div>
                                <Button 
                                    onClick={handleImageUpload}
                                    disabled={uploading}
                                    className="h-16 px-12 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#3B59DA] font-black transition-all border-none text-[18px] shadow-lg flex items-center gap-4 active:scale-95"
                                >
                                    <Upload className="h-6 w-6" /> {uploading ? "Uploading..." : "Upload Image"}
                                </Button>
                            </>
                        ) : (
                            <div className="w-full space-y-12">
                                <div className="space-y-2">
                                    <FigtreeText className="text-[18px] font-black text-[#1E293B] uppercase tracking-[0.2em] leading-none">{images.length} Upload Complete</FigtreeText>
                                </div>
                                <div className="flex flex-wrap items-center justify-center gap-8">
                                    {images.map((img, i) => (
                                        <div key={i} className="relative group/img transition-all hover:-translate-y-2">
                                            <div className="h-40 w-40 rounded-[28px] overflow-hidden border-4 border-white shadow-2xl">
                                                <img src={img} className="h-full w-full object-cover" />
                                            </div>
                                            <button 
                                                onClick={() => removeImage(i)}
                                                className="absolute -top-4 -right-4 h-[48px] w-[48px] rounded-full bg-white shadow-2xl flex items-center justify-center text-[#64748B] hover:text-[#EF4444] transition-all border border-slate-100 active:scale-90"
                                            >
                                                <X className="h-7 w-7" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                                <Button 
                                    onClick={handleImageUpload}
                                    disabled={uploading}
                                    className="h-16 px-12 rounded-2xl bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#3B59DA] font-black transition-all border-none text-[18px] shadow-lg flex items-center gap-4 active:scale-95 mx-auto"
                                >
                                    <Upload className="h-6 w-6" /> {uploading ? "Uploading..." : "Replace Product Image"}
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
