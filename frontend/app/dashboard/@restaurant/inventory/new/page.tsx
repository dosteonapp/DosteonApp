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
  SelectContent,
  SelectItem,
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

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <PrimarySurfaceCard className="p-12 md:p-14">
            {/* Header Actions */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-10 mb-12">
              <div className="space-y-2">
                <h1 className="text-[32px] font-bold text-[#1E293B] tracking-tight leading-none font-figtree">Add New Item</h1>
                <FigtreeText className="text-slate-400 font-medium text-[16px]">Add a new item to your inventory. Fill out the details below.</FigtreeText>
              </div>
              <div className="flex items-center gap-4">
                 <Button 
                  variant="outline" 
                  className="h-14 px-10 rounded-[8px] border-slate-200 font-bold text-slate-500 hover:bg-slate-50 transition-all text-base font-figtree shadow-sm active:scale-95 min-w-[140px]"
                  onClick={() => router.back()}
                >
                  Cancel
                </Button>
                <Button 
                  className="h-14 px-12 rounded-[8px] bg-[#3B59DA] hover:bg-[#2D46B2] text-white font-bold transition-all border-none text-base shadow-lg flex items-center gap-3 font-figtree active:scale-95 min-w-[160px]"
                >
                  <Save className="h-5 w-5" /> Save
                </Button>
              </div>
            </div>

            {/* Form Content */}
            <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Item Name</label>
                        <Input placeholder="Enter item name" className="h-16 border-slate-200 rounded-[8px] bg-white focus:ring-slate-100 text-[#1E293B] font-medium font-figtree px-6 text-base shadow-sm transition-all placeholder:text-slate-300" />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Item Category</label>
                        <Select>
                            <SelectTrigger className="h-16 border-slate-200 rounded-[8px] bg-white font-medium text-[#1E293B] text-base px-6 shadow-sm">
                                <SelectValue placeholder="Select item category" />
                            </SelectTrigger>
                        </Select>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Current Stock Amount</label>
                        <Input placeholder="Enter amount" className="h-16 border-slate-200 rounded-[8px] bg-white focus:ring-slate-100 text-[#1E293B] font-medium font-figtree px-6 text-base shadow-sm transition-all placeholder:text-slate-300" />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Measurement Unit</label>
                        <Select>
                            <SelectTrigger className="h-16 border-slate-200 rounded-[8px] bg-white font-medium text-[#1E293B] text-base px-6 shadow-sm">
                                <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                        </Select>
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Storage Location</label>
                        <Input placeholder="Enter storage location" className="h-16 border-slate-200 rounded-[8px] bg-white focus:ring-slate-100 text-[#1E293B] font-medium font-figtree px-6 text-base shadow-sm transition-all placeholder:text-slate-300" />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-[13px] font-bold text-slate-500 font-figtree ml-0.5">Expiry Date (If Applicable)</label>
                        <div className="grid grid-cols-3 gap-4">
                            <Select defaultValue="july">
                                <SelectTrigger className="h-16 border-slate-200 rounded-[8px] bg-white font-medium text-[#1E293B] text-base px-5 shadow-sm">
                                    <SelectValue placeholder="Month" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="july">July</SelectItem>
                                </SelectContent>
                            </Select>
                            <Input defaultValue="01" className="h-16 border-slate-200 rounded-[8px] bg-white text-[#1E293B] font-medium text-base px-5 text-center shadow-sm tabular-nums" />
                            <Input defaultValue="2000" className="h-16 border-slate-200 rounded-[8px] bg-white text-[#1E293B] font-medium text-base px-5 text-center shadow-sm tabular-nums" />
                        </div>
                    </div>
                </div>

                <div className="pt-2">
                    <FigtreeText className="text-slate-400 text-[13px] font-medium leading-relaxed">Upload high-quality images of your product. The first image will be used as the main product image.</FigtreeText>
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
                                    className="h-14 px-8 rounded-[8px] bg-white/10 hover:bg-white/20 text-[#3B59DA] font-bold transition-all border-[#3B59DA]/20 border text-sm shadow-sm flex items-center gap-3 active:scale-95"
                                >
                                    <Upload className="h-5 w-5" /> {uploading ? "Uploading..." : "Upload Image"}
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
                                            <div className="h-40 w-40 rounded-[8px] overflow-hidden border-4 border-white shadow-2xl">
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
                                    className="h-14 px-8 rounded-[8px] bg-white/10 hover:bg-white/20 text-[#3B59DA] font-bold transition-all border-[#3B59DA]/20 border text-sm shadow-sm flex items-center gap-3 active:scale-95 mx-auto"
                                >
                                    <Upload className="h-5 w-5" /> {uploading ? "Uploading..." : "Replace Product Image"}
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
